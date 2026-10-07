-- ChatGPT/Sites owns visitor authentication. These records are accessible only
-- through the verified server bridge, never through browser Supabase credentials.
create schema joff_private;
revoke all on schema joff_private from public, anon, authenticated;
grant usage on schema joff_private to service_role;

create table joff_private.preparations (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null check (length(owner_id) between 1 and 256),
  assessment_year integer not null check (assessment_year in (2026, 2027)),
  schema_version integer not null default 2 check (schema_version = 2),
  rules_version text not null check (length(rules_version) between 1 and 100),
  answers jsonb not null check (jsonb_typeof(answers) = 'object' and octet_length(answers::text) <= 32768),
  checklist jsonb not null check (jsonb_typeof(checklist) = 'object' and octet_length(checklist::text) <= 8192),
  revision integer not null check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint preparations_owner_year unique (owner_id, assessment_year),
  constraint preparations_timestamp_order check (updated_at >= created_at)
);
alter table joff_private.preparations enable row level security;
revoke all on joff_private.preparations from public, anon, authenticated;
grant select, insert, update, delete on joff_private.preparations to service_role;
comment on table joff_private.preparations is 'Private Joff Tax preparation records. service_role bridge only; owner is verified Sites subject, not a Supabase Auth UUID.';

-- Short-lived, non-identifying IDs prevent replay of a signed mutation.
create table joff_private.used_requests (
  id text primary key check (length(id) between 16 and 80),
  expires_at timestamptz not null
);
create index used_requests_expiry on joff_private.used_requests(expires_at);
alter table joff_private.used_requests enable row level security;
revoke all on joff_private.used_requests from public, anon, authenticated;
grant select, insert, delete on joff_private.used_requests to service_role;

create function joff_private.preparation_json(p joff_private.preparations)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'id', p.id::text, 'year', p.assessment_year, 'schemaVersion', p.schema_version,
    'rulesVersion', p.rules_version, 'answers', p.answers, 'checklist', p.checklist,
    'revision', p.revision,
    'createdAt', to_char(p.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'updatedAt', to_char(p.updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  );
$$;
revoke all on function joff_private.preparation_json(joff_private.preparations) from public, anon, authenticated;
grant execute on function joff_private.preparation_json(joff_private.preparations) to service_role;

create function public.joff_backend(p_owner text, p_action text, p_payload jsonb, p_request_id text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_row joff_private.preparations;
  v_input jsonb;
  v_record jsonb;
  v_rows jsonb;
  v_count integer;
  v_year integer;
  v_revision integer;
  v_imported integer := 0;
begin
  if p_owner is null or length(p_owner) not between 1 and 256
     or p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception using errcode = '22023', message = 'Invalid backend request';
  end if;

  if p_action in ('save','delete','import') then
    if p_request_id is null or p_request_id !~ '^[-A-Za-z0-9]{16,80}$' then
      raise exception using errcode = '22023', message = 'Invalid request identity';
    end if;
    delete from joff_private.used_requests where expires_at <= clock_timestamp();
    insert into joff_private.used_requests(id,expires_at)
      values(p_request_id,clock_timestamp()+interval '90 seconds') on conflict do nothing;
    if not found then return jsonb_build_object('error','replayed'); end if;
  end if;

  if p_action = 'load' then
    if not p_payload ? 'year' or (p_payload - 'year') <> '{}'::jsonb
       or (p_payload->'year') not in ('2026'::jsonb, '2027'::jsonb) then
      raise exception using errcode = '22023', message = 'Invalid year';
    end if;
    select * into v_row from joff_private.preparations
      where owner_id = p_owner and assessment_year = (p_payload->>'year')::integer;
    return jsonb_build_object('preparation', case when found then joff_private.preparation_json(v_row) else null end);
  elsif p_action = 'list' then
    if p_payload <> '{}'::jsonb then raise exception using errcode = '22023', message = 'Invalid list request'; end if;
    select coalesce(jsonb_agg(joff_private.preparation_json(p) order by p.assessment_year), '[]'::jsonb)
      into v_rows from joff_private.preparations p where p.owner_id = p_owner;
    return jsonb_build_object('preparations', v_rows);
  elsif p_action = 'delete' then
    if p_payload <> '{}'::jsonb then raise exception using errcode = '22023', message = 'Invalid delete request'; end if;
    delete from joff_private.preparations where owner_id = p_owner;
    get diagnostics v_count = row_count;
    return jsonb_build_object('deleted', v_count);
  elsif p_action = 'save' then
    v_input := p_payload->'input';
    if (p_payload - 'input') <> '{}'::jsonb or v_input is null or jsonb_typeof(v_input) <> 'object'
       or not (v_input ?& array['id','year','revision','rulesVersion','answers','checklist'])
       or (v_input - array['id','year','revision','rulesVersion','answers','checklist']) <> '{}'::jsonb
       or jsonb_typeof(v_input->'id') <> 'string'
       or (v_input->'year') not in ('2026'::jsonb, '2027'::jsonb)
       or jsonb_typeof(v_input->'revision') <> 'number'
       or (v_input->>'revision') !~ '^[0-9]+$'
       or jsonb_typeof(v_input->'rulesVersion') <> 'string'
       or jsonb_typeof(v_input->'answers') <> 'object'
       or jsonb_typeof(v_input->'checklist') <> 'object' then
      raise exception using errcode = '22023', message = 'Invalid preparation';
    end if;
    v_year := (v_input->>'year')::integer;
    v_revision := (v_input->>'revision')::integer;
    if (v_revision = 0 and v_input->>'id' <> '') or (v_revision > 0 and v_input->>'id' = '') then
      return jsonb_build_object('error','conflict');
    end if;
    if v_revision = 0 then
      insert into joff_private.preparations(owner_id,assessment_year,rules_version,answers,checklist,revision)
      values(p_owner,v_year,v_input->>'rulesVersion',v_input->'answers',v_input->'checklist',1)
      on conflict(owner_id,assessment_year) do nothing returning * into v_row;
    else
      update joff_private.preparations set answers = v_input->'answers', checklist = v_input->'checklist',
        rules_version = v_input->>'rulesVersion', revision = revision + 1, updated_at = clock_timestamp()
      where owner_id = p_owner and assessment_year = v_year and id = (v_input->>'id')::uuid
        and revision = v_revision returning * into v_row;
    end if;
    if not found then return jsonb_build_object('error','conflict'); end if;
    return jsonb_build_object('preparation',joff_private.preparation_json(v_row));
  elsif p_action = 'import' then
    if (p_payload - 'preparations') <> '{}'::jsonb or p_payload->'preparations' is null
       or jsonb_typeof(p_payload->'preparations') <> 'array'
       or jsonb_array_length(p_payload->'preparations') not between 1 and 2 then
      raise exception using errcode = '22023', message = 'Invalid import request';
    end if;
    for v_record in select value from jsonb_array_elements(p_payload->'preparations') loop
      if jsonb_typeof(v_record) <> 'object'
         or not(v_record ?& array['id','year','schemaVersion','rulesVersion','answers','checklist','revision','createdAt','updatedAt'])
         or (v_record - array['id','year','schemaVersion','rulesVersion','answers','checklist','revision','createdAt','updatedAt']) <> '{}'::jsonb
         or v_record->'schemaVersion' <> '2'::jsonb
         or jsonb_typeof(v_record->'id') <> 'string'
         or jsonb_typeof(v_record->'rulesVersion') <> 'string'
         or jsonb_typeof(v_record->'createdAt') <> 'string'
         or jsonb_typeof(v_record->'updatedAt') <> 'string' then
        raise exception using errcode = '22023', message = 'Invalid imported preparation';
      end if;
      insert into joff_private.preparations(id,owner_id,assessment_year,schema_version,rules_version,answers,checklist,revision,created_at,updated_at)
      values((v_record->>'id')::uuid,p_owner,(v_record->>'year')::integer,(v_record->>'schemaVersion')::integer,
        v_record->>'rulesVersion',v_record->'answers',v_record->'checklist',(v_record->>'revision')::integer,
        (v_record->>'createdAt')::timestamptz,(v_record->>'updatedAt')::timestamptz)
      on conflict(owner_id,assessment_year) do nothing;
      select * into v_row from joff_private.preparations
        where owner_id = p_owner and assessment_year = (v_record->>'year')::integer;
      if not found or joff_private.preparation_json(v_row) <> v_record then
        -- An exception rolls back this owner's entire import; never overwrite a newer record.
        raise exception using errcode = 'P0001', message = 'JOFF_IMPORT_CONFLICT';
      end if;
      v_imported := v_imported + 1;
    end loop;
    return jsonb_build_object('imported',v_imported);
  end if;
  raise exception using errcode = '22023', message = 'Invalid backend action';
end;
$$;
revoke all on function public.joff_backend(text,text,jsonb,text) from public, anon, authenticated;
grant execute on function public.joff_backend(text,text,jsonb,text) to service_role;
comment on function public.joff_backend(text,text,jsonb,text) is 'Service-only owner-scoped Joff backend. Called only after Edge verifies the Sites signature, subject and exact request body. Never grant to anon or authenticated.';

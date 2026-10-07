# Supabase backend operations

Project: `pfdshqbblrqjxupysghu` (eu-west-1). The app retains Sites ChatGPT authentication and uses the stable server-supplied user ID as the owner. Browser requests keep the existing guarded API routes. A server-only ES256 signature binds each backend request to the owner, operation, exact body hash, method, path, nonce and a maximum 60-second lifetime.

The Edge Function validates signatures and payloads before using its injected Supabase secret. The `joff_private` tables have RLS enabled with no browser policies or grants. `public.joff_backend` is security-invoker, executable only by `service_role`, uses explicit owner predicates, and atomically enforces record ID/revision checks. Mutation nonces are retained for 90 seconds to reject replay, including deletion after a record has been recreated. The Edge Function intentionally disables the gateway JWT check because it verifies its own ES256 request contract.

## Runtime settings

Set these in Sites runtime environment configuration, never in client variables or source:

- `JOFF_BACKEND_MODE=supabase` for normal production operation.
- `SUPABASE_BACKEND_URL=https://pfdshqbblrqjxupysghu.supabase.co/functions/v1/joff-preparations`.
- `JOFF_BACKEND_SIGNING_JWK`: secret private P-256 JWK matching the public key in the Edge Function.
- `JOFF_MIGRATION_TOKEN`: temporary secret of at least 32 characters, used only during migration and removed immediately after verification.

Supabase supplies the function's database credentials. No Supabase administrative key is stored in Sites or delivered to a browser. Completely unconfigured local development uses D1. A partially configured backend or unavailable Supabase fails closed; it must never silently restore an old D1 copy. Runtime environment changes require a deployment to take effect.

## Controlled cutover

1. Deploy the SQL migration with the Supabase migration tool and deploy `joff-preparations` with its matching public signing key. Verify anonymous/authenticated roles cannot access the private tables or RPC.
2. Test the real function with temporary fictional owners, including concurrent saves, ownership isolation, import, replay and deletion. Delete only those fixtures afterward.
3. Publish the app with `JOFF_BACKEND_MODE=migrating`, the URL, signing secret and temporary migration secret. Saving/loading through ordinary APIs is paused during this state.
4. From the authorized operator, POST JSON `{"action":"migrate"}` to `/api/backend-migration`, with the exact same-origin `Origin` and the migration token as Bearer authorization. Owner-private Sites additionally requires authorized platform access. A signed read-only probe for a fresh random fictional subject first verifies the deployed connection, including when the source is empty. Failure leaves D1 untouched. The endpoint then freezes old D1 writes with persistent triggers before reading any rows; it validates all source rows and imports each owner without changing record IDs, revisions, rules, content or timestamps.
5. Repeat with `{"action":"verify"}`. Retain the aggregate receipt (counts and hashes only). Independently query the total number of Supabase preparation rows; it must equal the receipt's source count, including when the source is empty. A per-owner verification alone cannot detect unrelated destination owners.
6. Resolve old-copy retention before releasing a nonempty migration: a frozen D1 copy must not retain financial records indefinitely after the user deletes them in Supabase. Use a separately verified disposal process or deletion propagation with an explicit bounded retention policy. An empty source requires no data disposal.
7. Set mode to `supabase`, remove the migration secret and redeploy the same saved app version. Check the deployed environment revision and confirm the migration endpoint is disabled. Confirm the actual hosted visitor sign-in/save/refresh/export/delete flow separately from service-access or fictional-identity tests.

Migration is retryable with a fresh signed request when exact existing records match. A destination disagreement fails closed. Source rows are never overwritten or deleted by this migration. Its operator endpoint has no caller-selected owner and returns only aggregate counts and hashes. It is capped at 1,000 source records and two supported years per owner; larger migrations need a reviewed batch workflow.

## Recovery and key rotation

Do not set the mode back to D1 after cutover: the old copy is frozen and may be stale. Do not remove the freeze triggers casually. A rollback requires pausing writes, reconciling all current Supabase records and deletions back into a verified destination, then deliberately changing the binding and removing the appropriate freeze. Prefer fixing the Supabase bridge while keeping data in the authoritative database.

For key rotation, prepare a matching public/private key pair, deploy the new verifier and update the Sites secret as one controlled maintenance operation; the current verifier accepts one public key, so mismatched rollout temporarily blocks storage. Never log private keys, account IDs or preparation payloads in operational diagnostics.

## Verification evidence

The backend was tested with actual Supabase HTTP requests for create/load, both supported years, account isolation, simultaneous updates, stale IDs, deletion replay, import preservation and cleanup. The independent reviewer ran 26 transactional database assertions, verified role grants and performed true parallel create/update races. Independent Edge authentication checks passed after repairing the expiry recheck and gateway routing path. These checks use fictional owners and do not claim verification of genuine hosted visitor identity.

RLS-without-policy notices on these private service-only tables are intentional deny-all behavior for browser roles. Do not add permissive policies to silence the advisor. The expiration index exists for nonce cleanup and can be reported unused before the workload has accumulated.

type Options = {
  publicKey: JsonWebKey;
  env: (name: string) => string | undefined;
  fetcher?: typeof fetch;
  now?: () => number;
};
const encoder = new TextEncoder();
const actions = new Set(['load','list','save','delete','import']);
const endpointPath = '/functions/v1/joff-preparations';
const exactKeys = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value,key));
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
function bytes(text: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) throw new Error('Invalid encoding');
  return Uint8Array.from(atob(text.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
}
function base64url(data: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(data))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function reply(status: number, value: unknown): Response {
  return Response.json(value,{status,headers:{'Cache-Control':'private, no-store, max-age=0','Vary':'Authorization','X-Content-Type-Options':'nosniff'}});
}
async function boundedBody(req: Request): Promise<string> {
  const reader=req.body?.getReader(); if(!reader) throw new Error('Missing body');
  const chunks:Uint8Array[]=[];let count=0;
  for(;;){const {done,value}=await reader.read();if(done)break;count+=value.length;if(count>60000){await reader.cancel();throw new Error('Body too large');}chunks.push(value);}
  const joined=new Uint8Array(count);let offset=0;for(const chunk of chunks){joined.set(chunk,offset);offset+=chunk.length;}
  return new TextDecoder('utf-8',{fatal:true}).decode(joined);
}
function validPayload(action: string, payload: Record<string,unknown>): boolean {
  if(action==='load')return exactKeys(payload,['year'])&&(payload.year===2026||payload.year===2027);
  if(action==='list'||action==='delete')return exactKeys(payload,[]);
  if(action==='save')return exactKeys(payload,['input'])&&object(payload.input)&&exactKeys(payload.input,['id','year','revision','rulesVersion','answers','checklist']);
  return action==='import'&&exactKeys(payload,['preparations'])&&Array.isArray(payload.preparations)&&payload.preparations.length>=1&&payload.preparations.length<=2&&payload.preparations.every(p=>object(p)&&exactKeys(p,['id','year','schemaVersion','rulesVersion','answers','checklist','revision','createdAt','updatedAt']));
}
export function createHandler(options: Options): (req: Request) => Promise<Response> {
  const keyPromise=crypto.subtle.importKey('jwk',options.publicKey,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  const fetcher=options.fetcher||fetch;
  return async req => {
    if(req.method!=='POST')return reply(405,{error:'Method not allowed'});
    // The Supabase gateway removes /functions/v1 before dispatching to Deno.
    // Both exact representations bind to this one function; subpaths are denied.
    if(![endpointPath,'/joff-preparations'].includes(new URL(req.url).pathname))return reply(404,{error:'Not found'});
    const token=req.headers.get('authorization')?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1];
    if(!token||token.length>8192)return reply(401,{error:'Authentication required'});
    let claims:Record<string,unknown>;
    try{
      const parts=token.split('.');if(parts.length!==3)throw new Error();
      const header=JSON.parse(new TextDecoder().decode(bytes(parts[0])));
      claims=JSON.parse(new TextDecoder().decode(bytes(parts[1])));
      if(!object(header)||!exactKeys(header,['alg','typ','kid'])||header.alg!=='ES256'||header.typ!=='JWT'||header.kid!=='joff-sites-v1')throw new Error();
      if(!object(claims)||!exactKeys(claims,['iss','aud','sub','iat','exp','jti','op','method','path','body_sha256']))throw new Error();
      const now=Math.floor((options.now?options.now():Date.now())/1000);
      if(claims.iss!=='joff-tax-sites'||claims.aud!=='joff-tax-backend'||typeof claims.sub!=='string'||claims.sub.length<1||claims.sub.length>256||/[\x00-\x1f\x7f]/.test(claims.sub))throw new Error();
      if(typeof claims.iat!=='number'||!Number.isInteger(claims.iat)||typeof claims.exp!=='number'||!Number.isInteger(claims.exp)||claims.iat>now+10||claims.iat<now-70||claims.exp<=now||claims.exp<=claims.iat||claims.exp>claims.iat+60)throw new Error();
      if(typeof claims.jti!=='string'||!/^[-A-Za-z0-9]{16,80}$/.test(claims.jti)||typeof claims.op!=='string'||!actions.has(claims.op)||claims.method!=='POST'||claims.path!==endpointPath||typeof claims.body_sha256!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(claims.body_sha256))throw new Error();
      const signature=bytes(parts[2]);if(signature.length!==64||!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},await keyPromise,signature as Uint8Array<ArrayBuffer>,encoder.encode(parts[0]+'.'+parts[1])))throw new Error();
    }catch{return reply(401,{error:'Authentication required'});}
    if(req.headers.get('content-type')?.split(';')[0].trim()!=='application/json')return reply(400,{error:'Invalid request'});
    let body:string;
    try{body=await boundedBody(req);}catch{return reply(400,{error:'Invalid request body'});}
    if(base64url(await crypto.subtle.digest('SHA-256',encoder.encode(body)))!==claims.body_sha256)return reply(401,{error:'Authentication required'});
    let input:Record<string,unknown>;
    try{input=JSON.parse(body);if(!object(input)||!exactKeys(input,['action','payload'])||input.action!==claims.op||typeof input.action!=='string'||!object(input.payload)||!validPayload(input.action,input.payload))throw new Error();}
    catch{return reply(400,{error:'Invalid request'});}
    try{
      const url=options.env('SUPABASE_URL');
      if(!url||new URL(url).origin!=='https://pfdshqbblrqjxupysghu.supabase.co')throw new Error('Configuration unavailable');
      const modern=options.env('SUPABASE_SECRET_KEYS');
      const key=modern ? JSON.parse(modern).default : options.env('SUPABASE_SERVICE_ROLE_KEY');
      if(typeof key!=='string'||!key)throw new Error('Configuration unavailable');
      // A slow request body must not extend the signed token's lifetime beyond
      // its nonce retention window. Check again at the privileged dispatch.
      if((claims.exp as number)<=Math.floor((options.now?options.now():Date.now())/1000))return reply(401,{error:'Authentication required'});
      const response=await fetcher(url+'/rest/v1/rpc/joff_backend',{
        method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),
        headers:{'Content-Type':'application/json',apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{})},
        body:JSON.stringify({p_owner:claims.sub,p_action:input.action,p_payload:input.payload,p_request_id:claims.jti}),
      });
      const result=await response.json() as Record<string,unknown>;
      if(!response.ok){
        if(result?.message==='JOFF_IMPORT_CONFLICT')return reply(409,{error:'Conflicting stored preparation'});
        if(result?.code==='22023'||result?.code==='22P02'||result?.code==='23514'||result?.code==='23502')return reply(400,{error:'Invalid preparation'});
        return reply(503,{error:'Storage unavailable'});
      }
      if(result?.error==='conflict')return reply(409,{error:'Conflicting stored preparation'});
      if(result?.error==='replayed')return reply(409,{error:'Request already used'});
      return reply(200,result);
    }catch{return reply(503,{error:'Storage unavailable'});}
  };
}

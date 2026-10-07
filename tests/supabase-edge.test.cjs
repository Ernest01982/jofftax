const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const ts = require('typescript');
const source = readFileSync(join(__dirname,'../supabase/functions/joff-preparations/handler.ts'),'utf8');
const code = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const modulePromise = import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const keysPromise = crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
const endpoint='https://pfdshqbblrqjxupysghu.supabase.co/functions/v1/joff-preparations';
const now=Date.parse('2026-10-07T19:00:00Z');
const b64=value=>Buffer.from(value).toString('base64url');
async function request({action='load',payload={year:2026},claims={},header={},bodyText,signatureKey,tokenTransform,headers={}}={}) {
  const body=bodyText??JSON.stringify({action,payload});
  const parts=[b64(JSON.stringify({alg:'ES256',typ:'JWT',kid:'joff-sites-v1',...header})),b64(JSON.stringify({iss:'joff-tax-sites',aud:'joff-tax-backend',sub:'edge-test-owner',iat:now/1000,exp:now/1000+60,jti:crypto.randomUUID(),op:action,method:'POST',path:'/functions/v1/joff-preparations',body_sha256:b64(await crypto.subtle.digest('SHA-256',Buffer.from(body))),...claims}))];
  parts.push(b64(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},signatureKey||(await keysPromise).privateKey,Buffer.from(parts.join('.')))));
  const token=tokenTransform?tokenTransform(parts.join('.')):parts.join('.');
  return new Request(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,...headers},body});
}
async function fixture({env={},upstream,throws=false}={}) {
  const calls=[];const {createHandler}=await modulePromise;
  const handler=createHandler({publicKey:await crypto.subtle.exportKey('jwk',(await keysPromise).publicKey),now:()=>now,
    env:name=>({SUPABASE_URL:'https://pfdshqbblrqjxupysghu.supabase.co',SUPABASE_SECRET_KEYS:JSON.stringify({default:'sb_secret_test_only'}),...env})[name],
    fetcher:async(url,options)=>{calls.push({url,options});if(throws)throw Error('private upstream error must not leak');return upstream?upstream():Response.json({preparation:null});}});
  return {handler,calls};
}
test('Edge verifies the actual signature/body and supplies only the verified owner to its service-only RPC',async()=>{
  const {handler,calls}=await fixture();const response=await handler(await request());
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{preparation:null});assert.equal(calls.length,1);
  const sent=JSON.parse(calls[0].options.body);assert.equal(sent.p_owner,'edge-test-owner');assert.equal(sent.p_action,'load');assert.deepEqual(sent.p_payload,{year:2026});assert.match(sent.p_request_id,/^[a-f0-9-]{36}$/);
  assert.equal(calls[0].options.headers.apikey,'sb_secret_test_only');assert.equal(calls[0].options.headers.Authorization,undefined);assert.equal(calls[0].options.redirect,'error');
  assert.match(response.headers.get('cache-control'),/private.*no-store/);assert.equal(response.headers.get('access-control-allow-origin'),null);
  const gateway=await request();assert.equal((await handler(new Request('https://edge-runtime.local/joff-preparations',{method:'POST',headers:gateway.headers,body:await gateway.text()}))).status,200);
});
test('Edge rejects forged, expired, future, broad, algorithm-confused and misdirected signed tokens before database access',async()=>{
  const {handler,calls}=await fixture();
  const variants=[
    {header:{alg:'none'}},{header:{kid:'other'}},{header:{jku:'https://attacker.invalid'}},
    {claims:{iss:'other'}},{claims:{aud:'other'}},{claims:{sub:''}},{claims:{sub:'x\nowner'}},
    {claims:{iat:now/1000-61,exp:now/1000-1}},{claims:{iat:now/1000+11,exp:now/1000+60}},
    {claims:{exp:now/1000+61}},{claims:{iat:'bad'}},{claims:{exp:null}},
    {claims:{method:'GET'}},{claims:{path:'/other'}},{claims:{jti:''}},
    {claims:{role:'service_role'}},{claims:{body_sha256:'a'.repeat(43)}},
    {signatureKey:(await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify'])).privateKey},
  ];
  for(const variant of variants)assert.equal((await handler(await request(variant))).status,401,JSON.stringify(variant));
  assert.equal((await handler(new Request(endpoint,{method:'POST',body:'{}'}))).status,401);
  assert.equal(calls.length,0);
});
test('Edge rejects request substitution and owner injection despite a valid signing key',async()=>{
  const {handler,calls}=await fixture();
  const valid=await request();const altered=new Request(endpoint,{method:'POST',headers:valid.headers,body:JSON.stringify({action:'load',payload:{year:2027}})});
  assert.equal((await handler(altered)).status,401);
  assert.equal((await handler(await request({claims:{op:'delete'}}))).status,400);
  for(const payload of [{year:2026,owner:'victim'},{year:2026,owner_id:'victim'},{year:2028}])assert.equal((await handler(await request({payload}))).status,400);
  assert.equal((await handler(await request({action:'delete',payload:{ownerId:'victim'}}))).status,400);
  assert.equal((await handler(await request({bodyText:JSON.stringify({action:'load',payload:{year:2026},owner:'victim'})}))).status,400);
  assert.equal((await handler(await request({bodyText:'x'.repeat(60001)}))).status,400);
  assert.equal((await handler(await request({headers:{'Content-Type':'text/plain'}}))).status,400);
  assert.equal(calls.length,0);
});
test('Edge checks method/path, preserves conflicts/replay denial and hides upstream failures and credentials',async()=>{
  const {handler,calls}=await fixture();assert.equal((await handler(new Request(endpoint))).status,405);
  assert.equal((await handler(new Request(endpoint+'/other',{method:'POST'}))).status,404);assert.equal(calls.length,0);
  for(const error of ['conflict','replayed']){const f=await fixture({upstream:()=>Response.json({error})});assert.equal((await f.handler(await request())).status,409);}
  const importConflict=await fixture({upstream:()=>Response.json({message:'JOFF_IMPORT_CONFLICT'},{status:400})});assert.equal((await importConflict.handler(await request())).status,409);
  for(const options of [{throws:true},{upstream:()=>Response.json({message:'private database values',code:'42501'},{status:403})},{env:{SUPABASE_SECRET_KEYS:undefined,SUPABASE_SERVICE_ROLE_KEY:undefined}}]){
    const f=await fixture(options);const response=await f.handler(await request());assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:'Storage unavailable'});
  }
  const legacy=await fixture({env:{SUPABASE_SECRET_KEYS:undefined,SUPABASE_SERVICE_ROLE_KEY:'eyJ.test_only.fixture'}});assert.equal((await legacy.handler(await request())).status,200);assert.equal(legacy.calls[0].options.headers.Authorization,'Bearer eyJ.test_only.fixture');
});

test('Edge rechecks token expiry after body consumption before privileged database access',async()=>{
  const {createHandler}=await modulePromise;
  let clock=now,privilegedCalls=0;
  const handler=createHandler({
    publicKey:await crypto.subtle.exportKey('jwk',(await keysPromise).publicKey),
    now:()=>clock,
    env:name=>({SUPABASE_URL:'https://pfdshqbblrqjxupysghu.supabase.co',SUPABASE_SECRET_KEYS:'{"default":"sb_secret_test_only"}'})[name],
    fetcher:async()=>{privilegedCalls++;return Response.json({preparation:null});},
  });
  const req=await request(),body=req.body;
  // The token is valid on arrival; its correctly signed body finishes later.
  Object.defineProperty(req,'body',{get(){clock=now+61000;return body;}});
  const response=await handler(req);
  assert.equal(response.status,401);
  assert.deepEqual(await response.json(),{error:'Authentication required'});
  assert.equal(privilegedCalls,0);
});

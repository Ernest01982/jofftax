const {test}=require('node:test');
const assert=require('node:assert/strict');
const {join}=require('node:path');
const {readFileSync,readdirSync}=require('node:fs');
const Module=require('node:module');
const build=process.env.JOFF_TEST_BUILD_DIRECTORY;
const backend=require(join(build,'backend.js'));
const repo=require(join(build,'repository.js'));
const {migration}=require(join(build,'backend-migration.js'));
const {SQLiteD1}=require('./sqlite-d1.cjs');
const {emptyPreparation}=require(join(build,'model.js'));
const env={};const originalLoad=Module._load;
Module._load=function(name,parent,main){if(name==='cloudflare:workers')return {env};if(name==='../app/chatgpt-auth')return {getChatGPTUser:async()=>({userId:'fictional-alice'})};return originalLoad.call(this,name,parent,main);};
const route=require(join(build,'routes','backend-migration.js'));
const preparation=require(join(build,'routes','preparation.js'));
Module._load=originalLoad;
async function config(){const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);return {db:{kind:'supabase',url:'https://fictional.example/functions/v1/joff-preparations',jwk:JSON.stringify(await crypto.subtle.exportKey('jwk',pair.privateKey))},publicKey:pair.publicKey};}
function input(year=2026){const p=emptyPreparation(year);return {id:p.id,year:p.year,revision:p.revision,rulesVersion:p.rulesVersion,answers:p.answers,checklist:p.checklist};}
function saved(raw=input()){return {...raw,id:raw.id||'fictional-record',revision:raw.revision+1,schemaVersion:2,createdAt:'2026-10-07T00:00:00.000Z',updatedAt:'2026-10-07T00:00:00.000Z'};}
function stub(t,fn){const previous=global.fetch;global.fetch=fn;t.after(()=>{global.fetch=previous;});}
function request(body={action:'verify'},token='x'.repeat(32),origin='https://app.example'){return new Request('https://app.example/api/backend-migration',{method:'POST',headers:{authorization:`Bearer ${token}`,origin,'content-type':'application/json'},body:JSON.stringify(body)});}
function setupD1(t){const db=new SQLiteD1();t.after(()=>db.close());for(const file of readdirSync(join(__dirname,'..','drizzle')).filter(x=>x.endsWith('.sql')).sort())db.exec(readFileSync(join(__dirname,'..','drizzle',file),'utf8'));return db;}

test('ES256 bridge cryptographically binds owner, operation and exact transmitted body',async t=>{
 const {db,publicKey}=await config();
 stub(t,async(url,options)=>{assert.equal(url,db.url);assert.equal(options.redirect,'manual');const parts=options.headers.Authorization.slice(7).split('.');const claims=JSON.parse(Buffer.from(parts[1],'base64url'));assert.deepEqual(JSON.parse(Buffer.from(parts[0],'base64url')),{alg:'ES256',typ:'JWT',kid:'joff-sites-v1'});assert.equal(claims.sub,'fictional-alice');assert.equal(claims.iss,'joff-tax-sites');assert.equal(claims.aud,'joff-tax-backend');assert.equal(claims.exp-claims.iat,60);assert.equal(claims.op,'load');assert.equal(claims.path,'/functions/v1/joff-preparations');assert.equal(claims.method,'POST');assert.equal(claims.body_sha256,await backend.sha256(options.body));assert.notEqual(claims.body_sha256,await backend.sha256(options.body+' '));assert.equal(await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},publicKey,Buffer.from(parts[2],'base64url'),Buffer.from(parts.slice(0,2).join('.'))),true);assert.deepEqual(JSON.parse(options.body),{action:'load',payload:{year:2026}});return Response.json({preparation:null});});
 assert.equal(await repo.loadPreparation(db,'fictional-alice',2026),null);
});
test('backend selection fails closed for migration, typo and partial configuration; Supabase failure never touches D1',async t=>{
 const {db}=await config();let touched=0;const d1={prepare(){touched++;throw Error('D1 touched');}};
 assert.equal(backend.resolveDatabase({DB:d1}),d1);assert.throws(()=>backend.resolveDatabase({DB:d1,SUPABASE_BACKEND_URL:db.url,JOFF_BACKEND_SIGNING_JWK:db.jwk}),/mode is required/);assert.equal(backend.resolveDatabase({DB:d1,JOFF_BACKEND_MODE:'d1',SUPABASE_BACKEND_URL:db.url,JOFF_BACKEND_SIGNING_JWK:db.jwk}),d1);
 for(const value of [{DB:d1,JOFF_BACKEND_MODE:'migrating'},{DB:d1,JOFF_BACKEND_MODE:'typo'},{DB:d1,SUPABASE_BACKEND_URL:db.url},{DB:d1,JOFF_BACKEND_SIGNING_JWK:db.jwk}])assert.throws(()=>backend.resolveDatabase(value));
 const selected=backend.resolveDatabase({DB:d1,JOFF_BACKEND_MODE:'supabase',SUPABASE_BACKEND_URL:db.url,JOFF_BACKEND_SIGNING_JWK:db.jwk});stub(t,async()=>{throw Error('offline');});await assert.rejects(repo.loadPreparation(selected,'alice',2026));assert.equal(touched,0);
});
test('adapter rejects malformed, oversized and mismatched responses; 409 retains repository conflict semantics',async t=>{
 const {db}=await config();let response;stub(t,async()=>response.clone());
 for(const bad of [{preparation:saved(input(2027))},{preparation:{...saved(),schemaVersion:1}},{preparation:saved(),extra:true}]){response=Response.json(bad);await assert.rejects(repo.loadPreparation(db,'alice',2026));}
 response=new Response('{');await assert.rejects(repo.loadPreparation(db,'alice',2026));response=new Response('x'.repeat(60001));await assert.rejects(repo.loadPreparation(db,'alice',2026));
 response=Response.json({preparation:{...saved({...input(),id:'expected',revision:1}),id:'wrong'}});await assert.rejects(repo.savePreparation(db,'alice',{...input(),id:'expected',revision:1}));
 response=Response.json({preparation:{...saved(),revision:5}});await assert.rejects(repo.savePreparation(db,'alice',input()));
 response=new Response('{}',{status:409});await assert.rejects(repo.savePreparation(db,'alice',input()),repo.ConflictError);
});
test('adapter timeout aborts its request and rejects instead of using D1',async t=>{
 const {db}=await config();const previous=global.setTimeout;global.setTimeout=(fn)=>previous(fn,1);t.after(()=>global.setTimeout=previous);
 stub(t,async(_,options)=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted')),{once:true})));await assert.rejects(repo.loadPreparation(db,'alice',2026),/aborted/);
});
test('Worker-compatible manual redirects reject every redirect without forwarding the signed request',async t=>{
 const {db}=await config();let status=302,calls=0;
 stub(t,async(_,options)=>{calls++;assert.equal(options.redirect,'manual');return new Response(null,{status,headers:{location:'https://other.example/secret'}});});
 for(status of [301,302,303,307,308]){const before=calls;await assert.rejects(backend.backendRequest(db,'alice','list',{}),error=>error instanceof backend.BackendError&&error.status===503);assert.equal(calls,before+1);}
});
test('migration validates and imports both years per owner, preserves metadata and verifies canonical hashes',async t=>{
 const d1=setupD1(t),{db}=await config();await repo.savePreparation(d1,'alice',input());await repo.savePreparation(d1,'alice',input(2027));await repo.savePreparation(d1,'bob',input());const destination=new Map();let writes=0;
 stub(t,async(_,options)=>{const claims=JSON.parse(Buffer.from(options.headers.Authorization.split('.')[1],'base64url')),body=JSON.parse(options.body);if(body.action==='import'){writes++;destination.set(claims.sub,body.payload.preparations);return Response.json({imported:body.payload.preparations.length});}return Response.json({preparations:destination.get(claims.sub)||[]});});
 const migrationConfig={DB:d1,JOFF_BACKEND_MODE:'migrating',SUPABASE_BACKEND_URL:db.url,JOFF_BACKEND_SIGNING_JWK:db.jwk};const result=await migration(migrationConfig,'migrate');assert.equal(result.owners,2);assert.equal(result.sourceRecords,3);assert.equal(result.verifiedRecords,3);assert.equal(result.sourceHash,result.destinationHash);assert.equal(writes,2);assert.equal(result.frozen,true);await assert.rejects(repo.savePreparation(d1,'charlie',input()),/migration freeze/);const existing=(await repo.listPreparations(d1,'alice'))[0];await assert.rejects(repo.savePreparation(d1,'alice',{...input(),id:existing.id,revision:existing.revision}),/migration freeze/);await assert.rejects(repo.deletePreparations(d1,'alice'),/migration freeze/);assert.equal(JSON.stringify(result).includes('alice'),false);assert.equal((await repo.listPreparations(d1,'alice')).length,2);assert.deepEqual(await migration(migrationConfig,'verify'),result);
 destination.get('alice')[0].revision++;await assert.rejects(migration(migrationConfig,'verify'),error=>error.stage==='destination-verification');
});
test('migration guards deny wrong mode/token/origin/body and normal APIs fail closed while migrating',async t=>{
 const d1=setupD1(t),{db}=await config();Object.assign(env,{DB:d1,JOFF_BACKEND_MODE:'d1',JOFF_MIGRATION_TOKEN:'x'.repeat(32),SUPABASE_BACKEND_URL:db.url,JOFF_BACKEND_SIGNING_JWK:db.jwk});assert.equal((await route.POST(request())).status,503);env.JOFF_BACKEND_MODE='migrating';assert.equal((await route.POST(request({},'wrong'))).status,401);const absent=request();absent.headers.delete('authorization');assert.equal((await route.POST(absent)).status,401);assert.equal((await route.POST(request({},'x'.repeat(32),'https://wrong.example'))).status,403);assert.equal((await route.POST(request({action:'migrate',owner:'alice'}))).status,400);delete env.JOFF_MIGRATION_TOKEN;assert.equal((await route.POST(request())).status,503);env.JOFF_MIGRATION_TOKEN='x'.repeat(32);assert.equal((await preparation.GET(new Request('https://app.example/api/preparation?year=2026'))).status,503);let probeCalls=0;stub(t,async()=>{probeCalls++;return Response.json({preparations:[]});});const emptyReceipt=await route.POST(request());assert.equal(emptyReceipt.status,200);assert.equal((await emptyReceipt.json()).backendVerified,true);assert.equal(probeCalls,1);env.JOFF_BACKEND_MODE='supabase';global.fetch=async()=>new Response('{}',{status:401});assert.equal((await preparation.GET(new Request('https://app.example/api/preparation?year=2026'))).status,503);global.fetch=async()=>Response.json({preparation:saved(input(2027))});assert.equal((await preparation.GET(new Request('https://app.example/api/preparation?year=2026'))).status,503);
});
test('signed adapter fixture keeps owners separate and concurrent/stale saves conflict through actual repository SQL',async t=>{
 const d1=setupD1(t),{db,publicKey}=await config();
 stub(t,async(_,options)=>{
  const token=options.headers.Authorization.slice(7).split('.'),claims=JSON.parse(Buffer.from(token[1],'base64url')),body=JSON.parse(options.body);
  assert.equal(await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},publicKey,Buffer.from(token[2],'base64url'),Buffer.from(token.slice(0,2).join('.'))),true);
  assert.equal(claims.body_sha256,await backend.sha256(options.body));
  try{if(body.action==='save')return Response.json({preparation:await repo.savePreparation(d1,claims.sub,body.payload.input)});if(body.action==='load')return Response.json({preparation:await repo.loadPreparation(d1,claims.sub,body.payload.year)});if(body.action==='list')return Response.json({preparations:await repo.listPreparations(d1,claims.sub)});return Response.json({deleted:await repo.deletePreparations(d1,claims.sub)});}catch(error){return new Response('{}',{status:error instanceof repo.ConflictError?409:503});}
 });
 const attempts=await Promise.allSettled([repo.savePreparation(db,'alice',input()),repo.savePreparation(db,'alice',input())]);assert.equal(attempts.filter(item=>item.status==='fulfilled').length,1);assert.equal(attempts.find(item=>item.status==='rejected').reason instanceof repo.ConflictError,true);
 const first=await repo.loadPreparation(db,'alice',2026);assert.equal(await repo.loadPreparation(db,'bob',2026),null);await assert.rejects(repo.savePreparation(db,'bob',{...input(),id:first.id,revision:first.revision}),repo.ConflictError);
 const next=await repo.savePreparation(db,'alice',{...input(),id:first.id,revision:first.revision});assert.equal(next.revision,2);await assert.rejects(repo.savePreparation(db,'alice',{...input(),id:first.id,revision:first.revision}),repo.ConflictError);assert.deepEqual(await repo.listPreparations(db,'bob'),[]);assert.equal(await repo.deletePreparations(db,'bob'),0);assert.equal((await repo.loadPreparation(db,'alice',2026)).revision,2);
});
test('migration validates entire source before import and rejects over-limit snapshots',async t=>{
 const {db}=await config();let calls=0;stub(t,async()=>{calls++;return Response.json({preparations:[]});});
 const stored={owner_id:'alice',id:'record',assessment_year:2026,schema_version:2,rules_version:input().rulesVersion,answers_json:JSON.stringify(input().answers),checklist_json:'{}',revision:1,created_at:'2026-10-07T00:00:00.000Z',updated_at:'2026-10-07T00:00:00.000Z'};
 let rows=[stored,{...stored,owner_id:'bob',answers_json:'{}'}];
 const source={prepare(){return {run:async()=>({success:true}),all:async()=>({success:true,results:rows})};}};
 const settings={DB:source,JOFF_BACKEND_MODE:'migrating',SUPABASE_BACKEND_URL:db.url,JOFF_BACKEND_SIGNING_JWK:db.jwk};await assert.rejects(migration(settings,'migrate'));assert.equal(calls,1);rows=Array(1001).fill(stored);await assert.rejects(migration(settings,'migrate'),/unavailable/);assert.equal(calls,2);
});
test('empty-source backend preflight failure prevents every D1 freeze and snapshot operation',async t=>{
 const {db}=await config();let touched=0;const source={prepare(){touched++;throw Error('D1 must remain untouched');}};
 const settings={DB:source,JOFF_BACKEND_MODE:'migrating',SUPABASE_BACKEND_URL:db.url,JOFF_BACKEND_SIGNING_JWK:db.jwk};
 stub(t,async()=>new Response('{}',{status:503}));await assert.rejects(migration(settings,'migrate'));assert.equal(touched,0);
 global.fetch=async()=>Response.json({preparations:[saved()]});await assert.rejects(migration(settings,'verify'),error=>error.stage==='backend-probe');assert.equal(touched,0);
});
test('operator-only migration diagnostics return safe stages without underlying secrets or private fields',async t=>{
 const {db}=await config();Object.assign(env,{JOFF_BACKEND_MODE:'migrating',JOFF_MIGRATION_TOKEN:'x'.repeat(32),SUPABASE_BACKEND_URL:db.url,JOFF_BACKEND_SIGNING_JWK:db.jwk});delete env.DB;
 let response=await route.POST(request()),body=await response.json();assert.equal(response.status,503);assert.deepEqual(body,{error:'Migration could not be completed.',stage:'source-binding'});
 response=await route.POST(request({},'wrong'));assert.equal('stage' in await response.json(),false);
 env.DB={prepare(){throw Error('SECRET owner financial payload');}};env.SUPABASE_BACKEND_URL='bad';response=await route.POST(request());assert.equal((await response.json()).stage,'backend-config');env.SUPABASE_BACKEND_URL=db.url;
 stub(t,async()=>{throw Error('SECRET owner financial payload');});response=await route.POST(request());body=await response.json();assert.equal(body.stage,'backend-probe');assert.equal(JSON.stringify(body).includes('SECRET'),false);global.fetch=async()=>{throw new TypeError('SECRET key material');};response=await route.POST(request());body=await response.json();assert.equal(body.kind,'TypeError');assert.equal(JSON.stringify(body).includes('SECRET'),false);global.fetch=async()=>new Response('{}',{status:401});response=await route.POST(request());assert.equal((await response.json()).backendStatus,401);
 global.fetch=async()=>Response.json({preparations:[]});response=await route.POST(request());assert.equal((await response.json()).stage,'source-freeze');
 env.DB={prepare(){return {run:async()=>({success:true}),all:async()=>{throw Error('private SQL');}};}};response=await route.POST(request());assert.equal((await response.json()).stage,'source-read');
 env.DB={prepare(){return {run:async()=>({success:true}),all:async()=>({success:true,results:[{owner_id:'PRIVATE',schema_version:9}]})};}};response=await route.POST(request());body=await response.json();assert.equal(body.stage,'source-validation');assert.equal(JSON.stringify(body).includes('PRIVATE'),false);
});

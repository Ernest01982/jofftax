import { z } from 'zod';
import { BackendError,backendConfig,backendRequest,canonical,importResponse,listResponse,preparationSchema,sha256,type BackendEnvironment } from './backend';
import { columns,decode } from './repository';
import type { Preparation } from './model';

export type MigrationStage='source-binding'|'backend-config'|'backend-probe'|'source-freeze'|'source-read'|'source-validation'|'destination-import'|'destination-verification';
export class MigrationError extends Error {
 readonly kind?:string;readonly backendStatus?:number;
 constructor(public stage:MigrationStage,cause:unknown){super('Migration unavailable');if(cause instanceof Error&&['TypeError','SyntaxError','DataError','OperationError','InvalidAccessError','NotSupportedError','AbortError','TimeoutError'].includes(cause.name))this.kind=cause.name;if(cause instanceof BackendError)this.backendStatus=cause.status;}
}
export const migrationInput=z.object({action:z.enum(['verify','migrate'])}).strict();
export async function migration(env:BackendEnvironment,action:'verify'|'migrate'){
 let stage:MigrationStage='source-binding';
 try{
 if(env.JOFF_BACKEND_MODE!=='migrating'||!env.DB)throw new Error('Migration unavailable');
 stage='backend-config';
 const backend=backendConfig(env);
 stage='backend-probe';
 // Exercise deployed URL, signer and authorization even when D1 is empty.
 const probe=listResponse.parse(await backendRequest(backend,`joff-migration-probe-${crypto.randomUUID()}`,'list',{}));
 if(probe.preparations.length!==0)throw new Error('Migration backend preflight failed');
 // Persist a storage-level freeze so requests from an older deployment cannot
 // write after the snapshot. Never remove these triggers automatically.
 stage='source-freeze';
 for(const operation of ['INSERT','UPDATE','DELETE']){
  const result=await env.DB.prepare(`CREATE TRIGGER IF NOT EXISTS joff_supabase_freeze_${operation.toLowerCase()} BEFORE ${operation} ON preparations BEGIN SELECT RAISE(ABORT, 'Supabase migration freeze'); END`).run();
  if(!result.success)throw new Error('Migration freeze failed');
 }
 stage='source-read';
 const rows=await env.DB.prepare(`SELECT owner_id, ${columns} FROM preparations ORDER BY owner_id, assessment_year LIMIT 1001`).all<Parameters<typeof decode>[0]&{owner_id:string}>();
 if(!rows.success||rows.results.length>1000)throw new Error('Migration unavailable');
 stage='source-validation';
 const owners=new Map<string,Preparation[]>();
 // Validate every source row before writing anything. No owner is supplied by callers.
 for(const row of rows.results){if(!row.owner_id)throw new Error('Invalid stored owner');const p=preparationSchema.parse(decode(row));const group=owners.get(row.owner_id)||[];if(group.length>=2||group.some(item=>item.year===p.year))throw new Error('Invalid source records');group.push(p);owners.set(row.owner_id,group);}
 const source:unknown[]=[],destination:unknown[]=[];let verified=0;
 for(const [owner,preparations] of owners){
  if(action==='migrate'){stage='destination-import';importResponse.parse(await backendRequest(backend,owner,'import',{preparations}));}
  stage='destination-verification';
  const remote=listResponse.parse(await backendRequest(backend,owner,'list',{})).preparations.sort((a,b)=>a.year-b.year);
  const expected=preparations.sort((a,b)=>a.year-b.year);
  if(await sha256(canonical(expected))!==await sha256(canonical(remote)))throw new Error('Migration verification failed');
  source.push({owner,preparations:expected});destination.push({owner,preparations:remote});verified+=remote.length;
 }
 stage='destination-verification';
 const sourceHash=await sha256(canonical(source)),destinationHash=await sha256(canonical(destination));
 if(sourceHash!==destinationHash)throw new Error('Migration verification failed');
 return {backendVerified:true,frozen:true,owners:owners.size,sourceRecords:rows.results.length,verifiedRecords:verified,sourceHash,destinationHash};
 }catch(cause){throw new MigrationError(stage,cause);}
}

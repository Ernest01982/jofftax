import { env } from 'cloudflare:workers';
import { boundedJson,mutationAllowed,privateResponse,failure } from '../../../lib/api';
import { MigrationError,migration,migrationInput } from '../../../lib/backend-migration';
import { sha256,type BackendEnvironment } from '../../../lib/backend';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 const config=env as BackendEnvironment;
 // No end-user identity grants migration authority. Remove the operator token after cutover.
 if(config.JOFF_BACKEND_MODE!=='migrating'||!config.JOFF_MIGRATION_TOKEN||config.JOFF_MIGRATION_TOKEN.length<32)return privateResponse({error:'Migration unavailable.'},503);
 const supplied=req.headers.get('authorization')||'';
 if(await sha256(supplied)!==await sha256(`Bearer ${config.JOFF_MIGRATION_TOKEN}`))return privateResponse({error:'Authorization required.'},401);
 if(!mutationAllowed(req))return privateResponse({error:'A same-origin JSON request is required.'},403);
 try{const input=migrationInput.safeParse(await boundedJson(req));if(!input.success)return privateResponse({error:'Choose a supported migration action.'},400);return privateResponse(await migration(config,input.data.action));}catch(e){if(e instanceof MigrationError)return privateResponse({error:'Migration could not be completed.',stage:e.stage,...(e.kind?{kind:e.kind}:{}),...(e.backendStatus?{backendStatus:e.backendStatus}:{})},503);return failure(e);}
}

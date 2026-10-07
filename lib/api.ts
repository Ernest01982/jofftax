import { resolveDatabase, BackendError, type BackendEnvironment } from './backend';
import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
import { ConflictError } from './repository';
export function privateResponse(data:unknown,status=200) {return Response.json(data,{status,headers:{'Cache-Control':'private, no-store, max-age=0','Vary':'Cookie, oai-authenticated-user-id','X-Content-Type-Options':'nosniff'}});}
export async function identity() {const u=await getChatGPTUser();return u?.userId||null;}
export function database() {return resolveDatabase(env as BackendEnvironment);}
export function mutationAllowed(req:Request) {return req.headers.get('origin')===new URL(req.url).origin && req.headers.get('content-type')?.split(';')[0].trim()==='application/json';}
export function selectedYear(req:Request) {const y=new URL(req.url).searchParams.get('year');return y==='2026'?2026:y==='2027'?2027:null;}
export class BodyError extends Error {constructor(message:string,public status:number){super(message);}}
export async function boundedJson(req:Request) {const reader=req.body?.getReader();if(!reader)throw new BodyError('A JSON body is required.',400);const chunks:Uint8Array[]=[];let total=0;while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>20000){await reader.cancel();throw new BodyError('The request body is too large.',413);}chunks.push(value);}const bytes=new Uint8Array(total);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;}try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new BodyError('The JSON body is invalid.',400);}}

export function failure(error:unknown) {if(error instanceof BodyError)return privateResponse({error:error.message},error.status);if(error instanceof BackendError&&error.status===400)return privateResponse({error:'Check the answer format. No changes were saved.'},400);if(error instanceof ConflictError)return privateResponse({error:'A newer saved revision or different rules version exists. Reload the saved record before saving again.'},409);return privateResponse({error:'The request could not be completed. Your typed answers remain in this tab. Please retry.'},503);}

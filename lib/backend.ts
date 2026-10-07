import { z } from 'zod';
import { saveSchema } from './model';

export const preparationSchema=saveSchema.extend({id:z.string().min(1).max(64).regex(/^[a-zA-Z0-9-]+$/),revision:z.number().int().min(1).max(1000000),schemaVersion:z.literal(2),createdAt:z.string().datetime(),updatedAt:z.string().datetime()}).strict();
export type Backend={kind:'supabase';url:string;jwk:string};
export type BackendEnvironment={DB?:Pick<D1Database,'prepare'>;JOFF_BACKEND_MODE?:string;SUPABASE_BACKEND_URL?:string;JOFF_BACKEND_SIGNING_JWK?:string;JOFF_MIGRATION_TOKEN?:string};
export class BackendError extends Error {constructor(public status:number){super('Backend request failed');}}
export function backendConfig(env:BackendEnvironment):Backend {
 const url=new URL(env.SUPABASE_BACKEND_URL||'');
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/functions/v1/joff-preparations'||!env.JOFF_BACKEND_SIGNING_JWK)throw new Error('Backend configuration unavailable');
 return {kind:'supabase',url:url.href,jwk:env.JOFF_BACKEND_SIGNING_JWK};
}
export function resolveDatabase(env:BackendEnvironment){
 const mode=env.JOFF_BACKEND_MODE||'d1';
 const configured=Boolean(env.SUPABASE_BACKEND_URL||env.JOFF_BACKEND_SIGNING_JWK);
 if(configured&&!env.JOFF_BACKEND_MODE)throw new Error('Backend mode is required');
 if(configured)backendConfig(env);
 if(mode==='supabase')return backendConfig(env);
 if(mode!=='d1'||!env.DB)throw new Error('Storage unavailable');
 return env.DB;
}
export function base64url(bytes:Uint8Array){let text='';for(const b of bytes)text+=String.fromCharCode(b);return btoa(text).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');}
const encoder=new TextEncoder();
export async function sha256(value:string){return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))));}
export function canonical(value:unknown):string {if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;if(value!==null&&typeof value==='object')return `{${Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([key,item])=>`${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;return JSON.stringify(value);}
export async function backendRequest(backend:Backend,owner:string,action:'load'|'list'|'save'|'delete'|'import',payload:unknown):Promise<unknown>{
 if(!owner)throw new Error('Identity required');
 const body=JSON.stringify({action,payload}),now=Math.floor(Date.now()/1000);
 const header=base64url(encoder.encode(JSON.stringify({alg:'ES256',typ:'JWT',kid:'joff-sites-v1'})));
 const claims=base64url(encoder.encode(JSON.stringify({iss:'joff-tax-sites',aud:'joff-tax-backend',sub:owner,iat:now,exp:now+60,jti:crypto.randomUUID(),op:action,method:'POST',path:'/functions/v1/joff-preparations',body_sha256:await sha256(body)})));
 const jwk=JSON.parse(backend.jwk) as JsonWebKey;
 if(jwk.kty!=='EC'||jwk.crv!=='P-256'||!jwk.d)throw new Error('Signing configuration unavailable');
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const signature=base64url(new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,encoder.encode(`${header}.${claims}`))));
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(backend.url,{method:'POST',headers:{Authorization:`Bearer ${header}.${claims}.${signature}`,'Content-Type':'application/json'},body,signal:controller.signal,redirect:'manual'});
  if(!response.ok)throw new BackendError([400,401,409].includes(response.status)?response.status:503);
  // Read bounded bytes before parsing: upstream response bodies contain private records.
  const reader=response.body?.getReader();if(!reader)throw new BackendError(503);
  const chunks:Uint8Array[]=[];let size=0;while(true){const item=await reader.read();if(item.done)break;size+=item.value.byteLength;if(size>60000){void reader.cancel().catch(()=>{});throw new BackendError(503);}chunks.push(item.value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return JSON.parse(new TextDecoder().decode(bytes));
 }finally{clearTimeout(timer);}
}
export const loadResponse=z.object({preparation:preparationSchema.nullable()}).strict();
export const listResponse=z.object({preparations:z.array(preparationSchema).max(2)}).strict().refine(v=>new Set(v.preparations.map(p=>p.year)).size===v.preparations.length);
export const saveResponse=z.object({preparation:preparationSchema}).strict();
export const deleteResponse=z.object({deleted:z.number().int().min(0).max(2)}).strict();
export const importResponse=z.object({imported:z.number().int().min(0).max(2)}).strict();

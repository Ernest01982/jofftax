import {identity,database,privateResponse,mutationAllowed,boundedJson,failure} from '../../../lib/api';
import {deletePreparations,listPreparations} from '../../../lib/repository';
import {preparationPack} from '../../../lib/export';
export const dynamic='force-dynamic';
export async function GET(){const owner=await identity();if(!owner)return privateResponse({error:'Sign in is required.'},401);try{return privateResponse({preparations:(await listPreparations(database(),owner)).map(p=>({record:p,pack:preparationPack(p)}))});}catch(e){return failure(e);}}
export async function DELETE(req:Request){const owner=await identity();if(!owner)return privateResponse({error:'Sign in is required.'},401);if(!mutationAllowed(req))return privateResponse({error:'A same-origin JSON request is required.'},403);try{const data=await boundedJson(req);if(!data||Object.keys(data).length!==1||data.confirmation!=='DELETE MY PREPARATIONS')return privateResponse({error:'Explicit deletion confirmation is required.'},400);return privateResponse({deleted:await deletePreparations(database(),owner)});}catch(e){return failure(e);}}

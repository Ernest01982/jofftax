import { identity,database,selectedYear,privateResponse,mutationAllowed,boundedJson,failure } from '../../../lib/api';
import { loadPreparation,savePreparation } from '../../../lib/repository';
import { saveSchema } from '../../../lib/model';
export const dynamic='force-dynamic';
export async function GET(req:Request){const owner=await identity();if(!owner)return privateResponse({error:'Sign in is required.'},401);const year=selectedYear(req);if(!year)return privateResponse({error:'Choose a supported assessment year.'},400);try{return privateResponse({preparation:await loadPreparation(database(),owner,year)});}catch(e){return failure(e);}}
export async function PUT(req:Request){const owner=await identity();if(!owner)return privateResponse({error:'Sign in is required.'},401);if(!mutationAllowed(req))return privateResponse({error:'A same-origin JSON request is required.'},403);try{const parsed=saveSchema.safeParse(await boundedJson(req));if(!parsed.success)return privateResponse({error:'Check the answer format and supported year. No changes were saved.'},400);return privateResponse({preparation:await savePreparation(database(),owner,parsed.data)});}catch(e){return failure(e);}}

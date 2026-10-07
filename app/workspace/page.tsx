import { requireChatGPTUser, chatGPTSignOutPath } from '../chatgpt-auth';
import Workspace from '../workspace-client';
export const dynamic='force-dynamic';
export const revalidate=0;
export default async function WorkspacePage(){const user=await requireChatGPTUser('/workspace');return <Workspace displayName={user.fullName?.split(' ')[0]||'there'} signOutPath={chatGPTSignOutPath('/')} sample={false}/>;}

import { RULES, type AssessmentYear } from './rules';
import { answersSchema, checklistSchema, saveSchema, type Preparation, type SaveInput } from './model';
export type Database = Pick<D1Database,'prepare'>;
type Row={id:string;assessment_year:AssessmentYear;schema_version:number;rules_version:string;answers_json:string;checklist_json:string;revision:number;created_at:string;updated_at:string};
export class ConflictError extends Error {}
function decode(row:Row):Preparation {if(row.schema_version!==2) throw new Error('Unsupported stored schema');return {id:row.id,year:row.assessment_year,schemaVersion:row.schema_version,rulesVersion:row.rules_version,answers:answersSchema.parse(JSON.parse(row.answers_json)),checklist:checklistSchema.parse(JSON.parse(row.checklist_json)),revision:row.revision,createdAt:row.created_at,updatedAt:row.updated_at};}
const columns='id, assessment_year, schema_version, rules_version, answers_json, checklist_json, revision, created_at, updated_at';
export async function loadPreparation(db:Database,owner:string,year:AssessmentYear) {if(!owner) throw new Error('Identity required');const row=await db.prepare(`SELECT ${columns} FROM preparations WHERE owner_id = ? AND assessment_year = ?`).bind(owner,year).first<Row>();return row?decode(row):null;}
export async function savePreparation(db:Database,owner:string,raw:SaveInput) {
  if(!owner) throw new Error('Identity required');const input=saveSchema.parse(raw);
  if(input.rulesVersion!==RULES[input.year].version) throw new ConflictError('Rules version needs review');
  if((input.revision===0&&input.id!=='')||(input.revision>0&&!input.id))throw new ConflictError('Record identity and revision do not match');
  const now=new Date().toISOString();let row:Row|null;
  if(input.revision===0) row=await db.prepare(`INSERT INTO preparations (id, owner_id, assessment_year, schema_version, rules_version, answers_json, checklist_json, revision, created_at, updated_at) VALUES (?, ?, ?, 2, ?, ?, ?, 1, ?, ?) ON CONFLICT(owner_id, assessment_year) DO NOTHING RETURNING ${columns}`).bind(crypto.randomUUID(),owner,input.year,input.rulesVersion,JSON.stringify(input.answers),JSON.stringify(input.checklist),now,now).first<Row>();
  else row=await db.prepare(`UPDATE preparations SET answers_json = ?, checklist_json = ?, rules_version = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND owner_id = ? AND assessment_year = ? AND revision = ? RETURNING ${columns}`).bind(JSON.stringify(input.answers),JSON.stringify(input.checklist),input.rulesVersion,now,input.id,owner,input.year,input.revision).first<Row>();
  if(!row) throw new ConflictError('Another saved revision exists');return decode(row);
}
export async function listPreparations(db:Database,owner:string) {if(!owner) throw new Error('Identity required');const rows=await db.prepare(`SELECT ${columns} FROM preparations WHERE owner_id = ? ORDER BY assessment_year`).bind(owner).all<Row>();return rows.results.map(decode);}
export async function deletePreparations(db:Database,owner:string) {if(!owner) throw new Error('Identity required');const result=await db.prepare('DELETE FROM preparations WHERE owner_id = ?').bind(owner).run();if(!result.success) throw new Error('Delete failed');return result.meta.changes;}

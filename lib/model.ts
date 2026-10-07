import { z } from 'zod';
import { RULES, type AssessmentYear } from './rules';
export const SCREENING = [
  {key:'nonResident',label:'Non-resident status or foreign income',help:'The estimate supports South African residents with ordinary local employment income only.'},
  {key:'otherIncome',label:'Other income, interest, investments or a second employer',help:'Include interest even if you think an exemption applies. This release does not model other income.'},
  {key:'retirement',label:'Retirement contributions from you or your employer, or carryovers',help:'A bounded current-year pension, provident or retirement annuity case can be estimated after additional confirmations. Carryovers and uncertainty require separate review.'},
  {key:'lumpSums',label:'Lump sums, two-pot withdrawals, severance or tax directives',help:'These use different tax treatment and cannot be included in this salary estimate.'},
  {key:'travel',label:'Travel allowance, company car or other special employer benefits',help:'Benefits besides explicitly reconciled employer retirement and medical contributions require separate review. Travel calculations may depend on records and business use.'},
  {key:'homeOffice',label:'Home-office, commission or other expense deductions',help:'This release does not decide whether an expense deduction qualifies.'},
  {key:'donations',label:'Donation deductions',help:'Keep donation certificates for separate review.'},
  {key:'capitalGains',label:'Capital gains, asset sales or crypto transactions',help:'A gain or loss needs its own calculation and evidence.'},
  {key:'business',label:'Rental, freelance or business income, or assessed losses',help:'These may require profit calculations and a provisional-tax status check.'},
  {key:'medical',label:'Medical scheme contributions, out-of-pocket or impairment expenses, or a possible qualifying disability',help:'Premiums alone can create an additional medical credit. A bounded registered-scheme case can be estimated after additional confirmations. Do not enter any diagnosis.'},
  {key:'community',label:'Community-property complications',help:'Shared income and deductions can affect the assessment.'},
  {key:'special',label:'Other adjustments, prior SARS balances or special circumstances',help:'Any situation not covered by the ordinary salary assumptions needs review.'},
] as const;
export type ScopeKey = typeof SCREENING[number]['key'];
const answer = z.enum(['','yes','no','unsure']);
const amount = z.string().max(12).refine(v => v === '' || /^\d+(\.\d{1,2})?$/.test(v) && Number(v) <= 100000000, 'Enter a non-negative rand amount, up to R100,000,000, with at most two decimals.');
const scopeShape = Object.fromEntries(SCREENING.map(q=>[q.key,answer])) as Record<ScopeKey,typeof answer>;
export const MONTHS = ['March','April','May','June','July','August','September','October','November','December','January','February'] as const;
const monthCount=z.string().refine(v=>v===''||/^(0|[1-9]\d?)$/.test(v)&&Number(v)<=20,'Enter 0 to 20 eligible covered people.');
const extensionSchema=z.object({fullYear:answer,incomeReconciled:answer,retirement:z.object({contributions:amount,reconciled:answer,carryovers:answer,withdrawalsTransfers:answer,eligibleFunds:answer}).strict(),medical:z.object({fees:amount,registered:answer,payerSole:answer,feesReconciled:answer,noExpenses:answer,disability:answer,entitlementKnown:answer,monthlyCounts:z.array(monthCount).length(12)}).strict()}).strict();
export const answersSchema = z.object({ ageBand:z.enum(['','under65','65to74','75plus']), employmentKnown:answer, salary:amount, paye:amount, autoAssessment:z.enum(['','yes','no','unsure']), filingStatus:z.enum(['unknown','nonprovisional','provisional']), scope:z.object(scopeShape).strict(),extension:extensionSchema }).strict();
export type Answers = z.infer<typeof answersSchema>;
export const EVIDENCE = [
  {id:'employment',title:'Employment tax certificate (IRP5 / IT3(a))',detail:'Use the certificate for this assessment year. Check taxable employment income against your employer’s records.'},
  {id:'paye',title:'PAYE and annual income reconciliation',detail:'Confirm annual PAYE and any taxable bonus. Take-home pay and gross salary are different from taxable employment income.'},
  {id:'assessment',title:'SARS assessment or filing-status check',detail:'Review any auto-assessment and the underlying facts in your own SARS account.'},
  {id:'otherIncome',title:'Other income and investment certificates',detail:'Collect interest, dividend, foreign-income and additional employer records.'},
  {id:'retirement',title:'Retirement contribution certificates',detail:'Collect employee and employer contributions, carryover records and any prior assessment.'},
  {id:'lumpSums',title:'Lump-sum certificates and directives',detail:'Collect withdrawal, two-pot or severance records and directives.'},
  {id:'travel',title:'Travel and employer benefit records',detail:'Collect allowance details, vehicle records and a logbook if relevant.'},
  {id:'homeOffice',title:'Expense and work arrangement evidence',detail:'Collect expense records and employment arrangements for separate review.'},
  {id:'donations',title:'Donation certificates',detail:'Keep any section 18A certificate for separate review.'},
  {id:'capitalGains',title:'Asset and crypto transaction records',detail:'Collect acquisition, sale, proceeds and cost records.'},
  {id:'business',title:'Business, rental or freelance records',detail:'Collect income and expense records and check provisional-tax requirements with SARS.'},
  {id:'medical',title:'Medical scheme and expense certificates',detail:'Keep eligible contribution, membership and expense records outside this app. Do not provide medical conditions.'},
  {id:'community',title:'Shared income and property records',detail:'Collect relevant income ownership records for a practitioner’s review.'},
  {id:'special',title:'Other supporting records',detail:'Collect adjustment notices and relevant evidence for separate review.'},
  {id:'nonResident',title:'Residency and foreign income evidence',detail:'Collect residency and foreign-income records for a qualified review.'},
] as const;
const evidenceIds = EVIDENCE.map(e=>e.id);
export const checklistSchema = z.record(z.enum(['missing','ready','notApplicable'])).refine(v=>Object.keys(v).every(k=>evidenceIds.includes(k as typeof evidenceIds[number])), 'Unknown checklist item.');
export const saveSchema = z.object({id:z.string().max(64).regex(/^[a-zA-Z0-9-]*$/),year:z.union([z.literal(2026),z.literal(2027)]),revision:z.number().int().min(0).max(1000000),rulesVersion:z.string().max(80),answers:answersSchema,checklist:checklistSchema}).strict();
export type SaveInput = z.infer<typeof saveSchema>;
export type Preparation = SaveInput & {id:string;schemaVersion:number;createdAt:string;updatedAt:string};
export function emptyAnswers(): Answers { return {ageBand:'',employmentKnown:'',salary:'',paye:'',autoAssessment:'',filingStatus:'unknown',scope:Object.fromEntries(SCREENING.map(q=>[q.key,''])) as Answers['scope'],extension:{fullYear:'',incomeReconciled:'',retirement:{contributions:'',reconciled:'',carryovers:'',withdrawalsTransfers:'',eligibleFunds:''},medical:{fees:'',registered:'',payerSole:'',feesReconciled:'',noExpenses:'',disability:'',entitlementKnown:'',monthlyCounts:Array(12).fill('')}}}; }
export function emptyPreparation(year:AssessmentYear):Preparation {return {id:'',year,revision:0,rulesVersion:RULES[year].version,schemaVersion:2,answers:emptyAnswers(),checklist:{},createdAt:'',updatedAt:''};}
export function evidenceFor(a:Answers) {return EVIDENCE.filter(e=>['employment','paye','assessment'].includes(e.id) || a.scope[e.id as ScopeKey] === 'yes' || a.scope[e.id as ScopeKey] === 'unsure' || (e.id==='retirement'&&(Number(a.extension.retirement.contributions)>0||['yes','unsure'].includes(a.extension.retirement.carryovers)||['yes','unsure'].includes(a.extension.retirement.withdrawalsTransfers))) || (e.id==='medical'&&(Number(a.extension.medical.fees)>0||['no','unsure'].includes(a.extension.medical.noExpenses)||['yes','unsure'].includes(a.extension.medical.disability)||['no','unsure'].includes(a.extension.medical.payerSole)||['no','unsure'].includes(a.extension.medical.entitlementKnown))));}
export function samplePreparation(year:AssessmentYear):Preparation {const p=emptyPreparation(year);p.answers={...p.answers,ageBand:'under65',employmentKnown:'yes',salary:'360000',paye:'60000',autoAssessment:'no',scope:Object.fromEntries(SCREENING.map(q=>[q.key,'no'])) as Answers['scope']};p.answers.extension.fullYear='yes';p.answers.extension.incomeReconciled='yes';p.checklist={employment:'ready',paye:'ready',assessment:'missing'};return p;}

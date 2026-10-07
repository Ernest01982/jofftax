import { answersSchema, SCREENING, type Answers, type Preparation } from './model';
import { RULES, type AssessmentYear, type AgeBand } from './rules';
const round = (n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export function salaryTax(year:AssessmentYear,income:number,age:Exclude<AgeBand,''>,paye:number,contributions=0,fees=0,monthlyCounts:number[]=Array(12).fill(0)) {
  for(const n of [income,paye,contributions,fees]) if(!Number.isFinite(n)||n<0||n>100000000) throw new Error('Invalid amount');
  if(monthlyCounts.length!==12||monthlyCounts.some(n=>!Number.isInteger(n)||n<0||n>20))throw new Error('Invalid monthly counts');
  const r=RULES[year],cap=year===2026?350000:430000;
  const retirementDeduction=Math.min(contributions,.275*income,income,cap);
  const taxableIncome=Math.max(0,income-retirementDeduction);
  let bracket:readonly number[]=r.brackets[0];for(const b of r.brackets) if(taxableIncome>b[0]) bracket=b;
  const bracketTax=bracket[1]+(taxableIncome-bracket[0])*bracket[2];
  const rebate=r.rebates[0]+(age==='65to74'||age==='75plus'?r.rebates[1]:0)+(age==='75plus'?r.rebates[2]:0);
  const medicalCredit=monthlyCounts.reduce((sum,n)=>sum+Math.min(n,2)*(year===2026?364:376)+Math.max(0,n-2)*(year===2026?246:254),0);
  const additionalMedicalCredit=age==='under65'?.25*Math.max(0,Math.max(0,fees-4*medicalCredit)-.075*taxableIncome):.333*Math.max(0,fees-3*medicalCredit);
  const liability=round(Math.max(0,bracketTax-rebate-medicalCredit-additionalMedicalCredit));
  return {income,contributions,retirementDeduction,retirementNotDeducted:contributions-retirementDeduction,taxableIncome,fees,monthlyCounts,medicalCredit,additionalMedicalCredit,bracketTax,rebate,liability,paye,balance:round(liability-paye),effectiveRate:taxableIncome===0?0:liability/taxableIncome*100,marginalRate:bracket[2]*100};
}
export function scopeBlockers(a:Answers) {
  const blockers:string[]=[];
  if(!answersSchema.safeParse(a).success) return ['The saved answers need validation before an estimate can be shown.'];
  if(!a.ageBand) blockers.push('Choose your adult age band at the assessment year end.');
  if(a.employmentKnown!=='yes') blockers.push('Confirm the annual employment amount and PAYE are known.');
  if(a.extension.fullYear!=='yes')blockers.push('Confirm a full, ordinary assessment year with unchanged residency and one employer.');
  if(a.extension.incomeReconciled!=='yes')blockers.push('Reconcile pre-retirement employment income, including taxable employer retirement and medical benefits once.');
  if(a.salary==='') blockers.push('Enter annual taxable employment income before section 11F, including zero if appropriate.');
  if(a.paye==='') blockers.push('Enter annual PAYE, including zero if appropriate.');
  for(const q of SCREENING) if(a.scope[q.key]!=='no' && !(a.scope[q.key]==='yes' && (q.key==='medical'||q.key==='retirement'))) blockers.push(`${q.label}: ${a.scope[q.key]==='yes'?'separate review required':'answer or clarify this question'}.`);
  const ret=a.extension.retirement,med=a.extension.medical;
  if(a.scope.retirement==='yes'){
    if(ret.contributions===''||Number(ret.contributions)<=0)blockers.push('Enter a positive current-year eligible retirement contribution total.');
    if(ret.reconciled!=='yes')blockers.push('Confirm current-year retirement contributions are counted once and have not already been deducted from employment income.');
    if(ret.carryovers!=='no')blockers.push('Retirement carryovers or uncertainty require separate review.');
    if(ret.withdrawalsTransfers!=='no')blockers.push('Retirement transfers, withdrawals or uncertainty require separate review.');
    if(ret.eligibleFunds!=='yes')blockers.push('Confirm eligible South African pension, provident or retirement annuity funds.');
  } else if(a.scope.retirement==='no'){if(ret.contributions!==''&&Number(ret.contributions)>0)blockers.push('Retirement contribution amount conflicts with the no-contributions answer.');if(['yes','unsure'].includes(ret.carryovers)||['yes','unsure'].includes(ret.withdrawalsTransfers))blockers.push('Saved carryovers, transfers or withdrawals conflict with the no-retirement answer and need separate review.');}
  if(a.scope.medical==='yes'){
    if(med.fees===''||Number(med.fees)<=0)blockers.push('Enter a positive eligible annual medical scheme fee total.');
    if(med.registered!=='yes')blockers.push('Confirm a registered South African medical scheme.');
    if(med.payerSole!=='yes')blockers.push('Shared medical payments or uncertainty require separate review.');
    if(med.feesReconciled!=='yes')blockers.push('Reconcile medical fees and taxable employer benefits counted once.');
    if(med.noExpenses!=='yes')blockers.push('Additional out-of-pocket or impairment expenses, or uncertainty, require separate review.');
    if(med.disability!=='no')blockers.push('Possible disability or impairment, or uncertainty, requires separate review. No diagnostic details are collected.');
    if(med.entitlementKnown!=='yes')blockers.push('Confirm eligible paid-month counts and fees, with no refund or credit-entitlement uncertainty.');
    if(med.monthlyCounts.some(n=>n===''))blockers.push('Enter an eligible covered-person count for every month, including zero for months without eligible paid contributions.');
    else if(med.monthlyCounts.every(n=>Number(n)===0))blockers.push('Positive medical fees need at least one eligible covered-person month.');
  } else if(a.scope.medical==='no'){if((med.fees!==''&&Number(med.fees)>0)||med.monthlyCounts.some(n=>n!==''&&Number(n)>0))blockers.push('Medical amounts or counts conflict with the no-medical-circumstances answer.');if(['no','unsure'].includes(med.noExpenses)||['yes','unsure'].includes(med.disability)||['no','unsure'].includes(med.payerSole)||['no','unsure'].includes(med.entitlementKnown))blockers.push('Saved medical expense, disability, shared-payer or entitlement details conflict with the no-medical-circumstances answer and need separate review.');}
  return blockers;
}
export function evaluate(p:Pick<Preparation,'year'|'rulesVersion'|'answers'>) {
  const blockers=scopeBlockers(p.answers);
  if(p.rulesVersion!==RULES[p.year].version) blockers.unshift('The saved rules version needs review. No updated calculation has been substituted.');
  return {blockers,result:blockers.length?null:salaryTax(p.year,Number(p.answers.salary),p.answers.ageBand as Exclude<AgeBand,''>,Number(p.answers.paye),p.answers.scope.retirement==='yes'?Number(p.answers.extension.retirement.contributions):0,p.answers.scope.medical==='yes'?Number(p.answers.extension.medical.fees):0,p.answers.scope.medical==='yes'?p.answers.extension.medical.monthlyCounts.map(Number):Array(12).fill(0))};
}

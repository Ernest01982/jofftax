import type { AssessmentYear } from './rules';
import type { CalculatorDefinition, CalculatorField, CalculatorItem, CalculatorOutcome } from './calculators';

type Inputs = Record<string, string>;
type ScheduleRow = { end: string; months: number; amount: number };
const choices = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' }];
const money = (id: string, label: string, help?: string): CalculatorField => ({ id, label, help, type: 'number', format: 'currency', min: 0, max: 100000000, step: .01 });
const count = (id: string, label: string, min: number, max: number, step = 1): CalculatorField => ({ id, label, type: 'number', format: 'number', min, max, step });
const question = (id: string, label: string, help?: string): CalculatorField => ({ id, label, help, type: 'choice', options: choices });
const date = (id: string, label: string, help?: string): CalculatorField => ({ id, label, help, type: 'date' });
const select = (id: string, label: string, values: [string, string][]): CalculatorField => ({ id, label, type: 'select', options: values.map(([value, name]) => ({ value, label: name })) });
const yearEnd = date('yearEnd', 'First relevant financial-year end', 'The last day of a month, for a confirmed ordinary 12-month financial year containing first use or completion. This is not automatically the individual March–February assessment.');
const ordinaryYear = question('ordinaryYear', 'Is this a full 12-month financial year, with no shortened or changed year?');
const unclaimed = question('unclaimed', 'Is this the first claim, with no previous allowance or other deduction on this cost?');
const assetScope = question('assetScope', 'Are ownership, cost and trade use known, without grants, disposal, connected-person, lessor or other-allowance complications?', 'A yes answer is your assertion, not validation of a claim. Unsupported facts or uncertainty need a practitioner.');
const assetDates = [date('acquired', 'Acquisition date'), date('firstUse', 'First qualifying trade-use date'), yearEnd, ordinaryYear];
const fullMonthAssetDates = assetDates.map(field => field.id === 'firstUse' ? { ...field, help: 'The first day of a month, on or after 24 March 2020, under this tool’s stated full-month convention. Partial-month and prior-claim cases need separate review.' } : field);
const assetExample = { acquired: '2025-03-01', firstUse: '2025-03-01', yearEnd: '2026-02-28', ordinaryYear: 'yes', unclaimed: 'yes', assetScope: 'yes' };
const leaseQuestions = [question('incomeUse', 'Is this eligible income-producing property with known continuous qualifying use?'), question('lessorIncome', 'Is inclusion of this premium or improvement in the lessor’s taxable income established?'), question('termKnown', 'Is the full entitlement including probable renewals documented, with no unresolved rights?'), question('noEarlyEnd', 'No early termination, cancellation, cession, prior claims, recoupment or other deduction?'), ordinaryYear];
const leaseExample = { incomeUse: 'yes', lessorIncome: 'yes', termKnown: 'yes', noEarlyEnd: 'yes', ordinaryYear: 'yes' };
function definition(id: string, title: string, fields: CalculatorField[], example: Inputs, scopeSummary: string, kind: 'deduction' | 'schedule' = 'schedule'): CalculatorDefinition {
  return { id, title, category: 'Deductions and benefits', description: scopeSummary, scopeSummary, fields, example, mode: 'estimate', yearSensitive: false, yearPolicy: 'financialYear', resultKind: kind, comparisonKey: id, contractAvailability: 'live' };
}

export const SPECIALIST_DEFINITIONS: CalculatorDefinition[] = [
  definition('home-office-expense-calculator', 'Home office expenses', [money('costs', 'Known eligible premises costs', 'Employee rent, electricity and similar established premises costs only. Exclude mortgage interest, capital improvements and equipment.'), count('officeArea', 'Exclusive office area (square metres)', .01, 100000, .01), count('homeArea', 'Total residence area (square metres)', .01, 100000, .01), count('months', 'Qualifying full months in this financial year', 1, 12), select('costPeriod', 'These costs cover', [['annual', 'The entire 12-month year'], ['qualifying', 'Only the qualifying period already']]), yearEnd, ordinaryYear, question('exclusive', 'Equipped room used regularly and exclusively for trade?'), question('duties', 'As a salary-dominant employee, did you perform more than 50% of duties in this home office?'), question('costsKnown', 'Are these eligible premises costs for this use period, with no excluded costs?')], { costs: '12000', officeArea: '20', homeArea: '200', months: '12', costPeriod: 'annual', yearEnd: '2026-02-28', ordinaryYear: 'yes', exclusive: 'yes', duties: 'yes', costsKnown: 'yes' }, 'Employee premises-cost allocation with explicit exclusive-use, duties and period gates. Equipment is separate.', 'deduction'),
  definition('wear-and-tear', 'Wear and tear', [money('cost', 'Eligible new owned asset cost'), select('asset', 'Established SARS asset category', [['computer', 'Personal computer: 3 years'], ['tablet', 'Tablet: 2 years'], ['furniture', 'Furniture and fittings: 6 years'], ['electronicOffice', 'Electronic office equipment: 3 years'], ['mechanicalOffice', 'Mechanical office equipment: 5 years'], ['photocopier', 'Photocopying equipment: 5 years'], ['phone', 'Cellular telephone: 2 years'], ['unsupported', 'Other or uncertain category']]), count('tradePercent', 'Confirmed trade-use percentage', 0, 100, .01), select('method', 'Explicit allowance choice', [['straight', 'Straight-line allowance'], ['small', 'Standalone small-item immediate election']]), ...fullMonthAssetDates, question('newOwned', 'New owned asset, not used or a personal asset brought into trade?'), question('standalone', 'Standalone item, not part of a set and not an asset for letting?'), unclaimed, assetScope], { cost: '12000', asset: 'computer', tradePercent: '100', method: 'straight', ...assetExample, newOwned: 'yes', standalone: 'yes' }, 'Selected new-asset straight-line lives with full-month/trade-use proration; a separate strictly-below-R7,000 standalone election.'),
  definition('s12c-wear-and-tear', 'Section 12C manufacturing allowance', [money('cost', 'Actual qualifying machinery or plant cost'), money('cashPrice', 'Established arm’s-length cash price'), select('condition', 'Qualifying machinery condition', [['new', 'New and unused'], ['used', 'Qualifying used machinery']]), ...assetDates, question('directManufacturing', 'Owned machinery or plant used directly in qualifying manufacturing?'), unclaimed, assetScope, question('restrictedUse', 'No R&D, hotel, lessor, private-use or other special asset regime?')], { cost: '100000', cashPrice: '100000', condition: 'new', ...assetExample, directManufacturing: 'yes', restrictedUse: 'yes' }, 'Confirmed direct-manufacturing machinery: 40/20/20/20 new, or five 20% instalments for qualifying used assets.'),
  definition('sbc-wear-and-tear', 'SBC asset allowance', [money('cost', 'Actual eligible tangible asset cost'), money('cashPrice', 'Established arm’s-length cash price'), select('assetMode', 'Confirmed asset and allowance choice', [['manufacturing', 'Direct-manufacturing plant: 100%'], ['accelerated', 'Other eligible tangible asset: explicit 50/30/20 election']]), ...assetDates, question('sbcAcquisition', 'SBC eligibility established in the acquisition year?'), question('sbcFirstUse', 'SBC eligibility established in the first-use year?'), question('classification', 'Qualifying asset classification and this allowance election established?'), unclaimed, assetScope, question('allTrade', 'Wholly qualifying trade use, with no private use, movement costs or funding complications?')], { cost: '100000', cashPrice: '100000', assetMode: 'manufacturing', ...assetExample, sbcAcquisition: 'yes', sbcFirstUse: 'yes', classification: 'yes', allTrade: 'yes' }, 'Confirmed SBC in both relevant years: direct-manufacturing 100% or an explicitly elected 50/30/20 schedule.'),
  definition('s11f-lease-premium-allowance', 'Section 11(f) lease premium', [money('premium', 'Genuine eligible property premium actually paid'), date('commenced', 'Qualifying income-use commencement', 'First day of a month only in this full-month model. Payment and right of use must be established.'), count('entitlementMonths', 'Documented entitlement including probable renewals (months)', 1, 1200), yearEnd, question('premiumKnown', 'Premium fully paid, not rent, a deposit, know-how or historical exempt transaction?'), ...leaseQuestions], { premium: '20000', commenced: '2025-07-01', entitlementMonths: '24', yearEnd: '2025-12-31', premiumKnown: 'yes', ...leaseExample }, 'Paid income-producing property premium over documented entitlement, capped at 25 years; full-month first/last allocations.'),
  definition('s11g-leasehold-improvements', 'Section 11(g) leasehold improvements', [money('actual', 'Actual qualifying improvement expenditure'), money('limit', 'Established stipulated amount or documented fair reasonable value'), select('limitBasis', 'Basis for the established limit', [['stipulated', 'Amount stipulated in the enforceable lease'], ['fairValue', 'Documented fair reasonable amount where no sum is stipulated']]), date('completed', 'Improvement completion date', 'Last day of a month only in this full-month model. The allowance starts the following month; completion on year end gives zero in that year.'), count('remainingMonths', 'Documented remaining entitlement after completion, including renewals (months)', 1, 1200), yearEnd, question('obligation', 'Enforceable lease obligation to complete this improvement, not voluntary work?'), question('valueKnown', 'This limit and qualifying expenditure are established, without grants or valuation uncertainty?'), ...leaseQuestions], { actual: '550000', limit: '600000', limitBasis: 'stipulated', completed: '2026-02-28', remainingMonths: '228', yearEnd: '2026-02-28', obligation: 'yes', valueKnown: 'yes', ...leaseExample }, 'Enforceable improvements, capped at the established contractual/fair value, spread from completion over remaining entitlement up to 25 years.'),
];

const sources = {
  office: { title: 'SARS home-office expenses', url: 'https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/home-office-expenses/' },
  wear: { title: 'SARS Interpretation Note 47: wear and tear', url: 'https://www.sars.gov.za/lapd-intr-in-2012-47-wear-and-tear-depreciation-allowance/' },
  manufacturing: { title: 'SARS Tax Guide for Small Businesses', url: 'https://www.sars.gov.za/wp-content/uploads/Ops/Guides/Legal-Pub-Guide-Gen09-Tax-Guide-for-Small-Businesses.pdf' },
  sbc: { title: 'SARS Interpretation Note 9: small-business corporations', url: 'https://www.sars.gov.za/lapd-intr-in-2012-09-small-business-corporations/' },
  premium: { title: 'SARS Interpretation Note 109: lease premiums', url: 'https://www.sars.gov.za/wp-content/uploads/Legal/Notes/Legal-IntR-IN-109-Lease-premiums.pdf' },
  improvements: { title: 'SARS Interpretation Note 110: leasehold improvements', url: 'https://www.sars.gov.za/wp-content/uploads/Legal/Notes/Legal-IntR-IN-110-Leasehold-improvements.pdf' },
};
const currency = (label: string, value: number): CalculatorItem => ({ label, value, format: 'currency' });
const numeric = (label: string, value: number): CalculatorItem => ({ label, value, format: 'number' });
const monthIndex = (value: string) => Number(value.slice(0, 4)) * 12 + Number(value.slice(5, 7)) - 1;
function monthEnd(index: number) { return new Date(Date.UTC(Math.floor(index / 12), index % 12 + 1, 0)).toISOString().slice(0, 10); }
function monthStart(index: number) { return `${Math.floor(index / 12)}-${String(index % 12 + 1).padStart(2, '0')}-01`; }
function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= '2000-01-01' && value <= '2100-12-31' && Number.isFinite(Date.parse(value)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value; }
function validate(def: CalculatorDefinition, raw: Inputs): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { inputs: 'Enter a known input object.' };
  for (const key of Object.keys(raw)) if (!def.fields.some(field => field.id === key)) errors[key] = 'Unexpected field.';
  for (const field of def.fields) {
    const value = raw[field.id];
    if (typeof value !== 'string' || value === '') { if (field.required !== false) errors[field.id] = 'Answer this field, including explicit zero when appropriate.'; continue; }
    if (field.type === 'number') {
      if (!/^\d+(?:\.\d{1,2})?$/.test(value) || !Number.isFinite(Number(value)) || Number(value) < (field.min ?? 0) || Number(value) > (field.max ?? 100000000) || (field.step === 1 && !Number.isInteger(Number(value)))) errors[field.id] = 'Enter a finite amount within the stated bounds.';
    } else if (field.type === 'date') { if (!validDate(value)) errors[field.id] = 'Enter a real supported date.'; }
    else if (field.options && !field.options.some(option => option.value === value)) errors[field.id] = 'Choose one of the stated options.';
  }
  return errors;
}

function monthSchedule(base: number, deductionMonths: number, startMonth: number, firstYearEnd: number): ScheduleRow[] {
  const rows: ScheduleRow[] = [];
  let remainingMonths = deductionMonths;
  let balance = base;
  let end = firstYearEnd;
  let first = true;
  while (remainingMonths > 0) {
    const months = Math.min(remainingMonths, first ? Math.max(0, end - startMonth + 1) : 12);
    const amount = months === remainingMonths ? balance : Math.min(balance, base * months / deductionMonths);
    rows.push({ end: monthEnd(end), months, amount });
    balance = Math.max(0, balance - amount);
    remainingMonths -= months;
    first = false;
    end += 12;
  }
  return rows;
}
function scheduleItems(rows: ScheduleRow[]) { return rows.map(row => currency(`Financial year ending ${row.end}: ${row.months} qualifying months`, row.amount)); }

export function evaluateSpecialist(def: CalculatorDefinition, year: AssessmentYear, a: Inputs): CalculatorOutcome | null {
  const own = SPECIALIST_DEFINITIONS.find(entry => entry.id === def.id);
  if (!own) return null;
  const out: CalculatorOutcome = { status: 'supported', resultKind: own.resultKind, comparisonKey: own.comparisonKey, items: [], blockers: [], assumptions: ['A bounded component or schedule, not a validated return deduction. Eligibility confirmations are user assertions.', 'Future schedule rows assume uninterrupted qualifying trade use, unchanged facts and no disposal, grant, termination or competing allowance.', 'Calculation precision is retained; display rounding may affect row totals. The final arithmetic balance prevents deductions exceeding the qualifying base.'], provenance: { version: `za-${own.id}-2026-10-07-v1`, checked: '2026-10-07', sources: [] }, steps: [] };
  const errors = validate(own, a);
  if (year !== 2026 && year !== 2027) errors.year = 'Select a supported assessment context.';
  if (Object.keys(errors).length) return { ...out, status: 'invalid', items: [], fieldErrors: errors, blockers: ['Correct the missing or invalid inputs before calculating.'] };
  const n = (key: string) => Number(a[key]);
  const need = (key: string) => { if (a[key] !== 'yes') out.blockers.push(`${own.fields.find(field => field.id === key)?.label ?? key} Confirm or obtain separate review.`); };
  for (const field of own.fields) if (field.type === 'choice' && a[field.id] === 'unsure') out.blockers.push(`${field.label} Uncertainty requires separate review.`);
  const invalid = (message: string): CalculatorOutcome => ({ ...out, status: 'invalid', items: [], blockers: [message] });
  const end = monthIndex(a.yearEnd);
  if (a.yearEnd !== monthEnd(end)) return invalid('The financial-year end must be the last day of a month in this restricted model.');
  need('ordinaryYear');
  out.provenance.period = `Financial year ${monthStart(end - 11)} to ${a.yearEnd}, with later schedule years separately labelled.`;
  const inFirstYear = (value: string) => value >= monthStart(end - 11) && value <= a.yearEnd;

  if (own.id === 'home-office-expense-calculator') {
    for (const key of ['exclusive', 'duties', 'costsKnown']) need(key);
    out.provenance.sources = [sources.office];
    if (n('officeArea') > n('homeArea')) return invalid('The exclusive office area cannot exceed the total residence area.');
    const qualifyingCosts = n('costs') * (a.costPeriod === 'annual' ? n('months') / 12 : 1);
    out.items = [numeric('Office-area share (%)', n('officeArea') / n('homeArea') * 100), currency('Eligible costs for the qualifying period', qualifyingCosts), currency('Illustrative premises-cost deduction', qualifyingCosts * n('officeArea') / n('homeArea'))];
    out.assumptions.push(a.costPeriod === 'annual' ? 'Whole-year premises costs are prorated once by the entered qualifying full months.' : 'Costs already relate only to the qualifying period and are not prorated again.', 'Employee mortgage interest, capital improvements and equipment are excluded. Equipment needs a separate allowance.', 'Keep employer permission, duties records, floor plan, photos, invoices and payment evidence. A home-office claim may affect the primary-residence CGT exclusion on a future sale.');
  } else if (['wear-and-tear', 's12c-wear-and-tear', 'sbc-wear-and-tear'].includes(own.id)) {
    for (const key of ['unclaimed', 'assetScope']) need(key);
    if (a.acquired > a.firstUse) return invalid('Acquisition cannot be after first qualifying use.');
    if (!inFirstYear(a.firstUse)) return invalid('The first relevant financial year must contain first use; previous-claim cases are outside this tool.');
    if (own.id === 'wear-and-tear') {
      need('newOwned');
      out.provenance.sources = [sources.wear];
      if (a.firstUse < '2020-03-24') out.blockers.push('These selected asset lives apply only to first use on or after 24 March 2020.');
      if (!a.firstUse.endsWith('-01')) out.blockers.push('This schedule requires first use on the first day of a month; partial-month use needs another convention and review.');
      const lives: Record<string, number> = { computer: 3, tablet: 2, furniture: 6, electronicOffice: 3, mechanicalOffice: 5, photocopier: 5, phone: 2 };
      if (!lives[a.asset]) out.blockers.push('Establish a supported SARS asset category. An unspecified printer is not automatically photocopying equipment.');
      const base = n('cost') * n('tradePercent') / 100;
      out.items = [currency('Eligible cost apportioned to trade use', base)];
      if (a.method === 'small') {
        need('standalone');
        if (n('cost') >= 7000) out.blockers.push('The standalone immediate election requires actual item cost strictly below R7,000, before trade apportionment.');
        out.items.push(currency(`One-time immediate allowance in financial year ending ${a.yearEnd}`, base));
        out.assumptions.push('The standalone small-item election is one-time, not an annual deduction repeated in later years.');
      } else if (lives[a.asset]) {
        const rows = monthSchedule(base, lives[a.asset] * 12, monthIndex(a.firstUse), end);
        out.items.push(numeric('Selected straight-line useful life (years)', lives[a.asset]), currency('Full-year trade-apportioned instalment', base / lives[a.asset]), ...scheduleItems(rows));
        out.assumptions.push('Full-month convention, beginning on the confirmed first day of a month, with the same trade-use share throughout the schedule. Parts of a set may use the ordinary selected-life schedule but not the small-item election.');
      }
    } else {
      const base = Math.min(n('cost'), n('cashPrice'));
      let percentages: number[];
      if (own.id === 's12c-wear-and-tear') {
        for (const key of ['directManufacturing', 'restrictedUse']) need(key);
        out.provenance.sources = [sources.manufacturing];
        if (a.acquired < '2002-03-01') out.blockers.push('This manufacturing acquisition schedule requires acquisition on or after 1 March 2002.');
        percentages = a.condition === 'new' ? [.4, .2, .2, .2] : [.2, .2, .2, .2, .2];
        out.assumptions.push('Full first-use-year allowance, not section 11(e) month/day proration. Part-year treatment retains the reviewed draft-guidance qualification; obtain current practitioner confirmation before return use. A delivery vehicle is not direct-manufacturing plant merely because its owner manufactures.');
      } else {
        for (const key of ['sbcAcquisition', 'sbcFirstUse', 'classification', 'allTrade']) need(key);
        out.provenance.sources = [sources.sbc];
        percentages = a.assetMode === 'manufacturing' ? [1] : [.5, .3, .2];
        out.assumptions.push('SBC status is required in acquisition and first-use years. The selected statutory/accelerated election is not automatically preferable to section 11(e), and allowances cannot be stacked. No part-year proration under this bounded election.');
      }
      let balance = base;
      out.items = [currency('Eligible cost capped at arm’s-length cash price', base), ...percentages.map((rate, index) => { const amount = index === percentages.length - 1 ? balance : Math.min(balance, base * rate); balance = Math.max(0, balance - amount); return currency(`Financial year ending ${monthEnd(end + index * 12)}: ${rate * 100}% allowance`, amount); })];
    }
  } else {
    for (const key of ['incomeUse', 'lessorIncome', 'termKnown', 'noEarlyEnd']) need(key);
    const premium = own.id === 's11f-lease-premium-allowance';
    let start: number;
    let base: number;
    let entitlement: number;
    if (premium) {
      need('premiumKnown');
      out.provenance.sources = [sources.premium];
      if (!a.commenced.endsWith('-01')) out.blockers.push('The premium model requires qualifying use to commence on the first day of a month; partial-month periods are not rounded up.');
      if (!inFirstYear(a.commenced)) return invalid('The first relevant financial year must contain qualifying commencement, with no prior claims.');
      start = monthIndex(a.commenced); base = n('premium'); entitlement = n('entitlementMonths');
      out.assumptions.push('Genuine premium actually paid and included in lessor income; rent, deposits, know-how and historic exemptions are outside scope. No immediate remaining-balance deduction arises on an early section 11(f) termination.');
    } else {
      for (const key of ['obligation', 'valueKnown']) need(key);
      out.provenance.sources = [sources.improvements];
      if (a.completed !== monthEnd(monthIndex(a.completed))) out.blockers.push('The improvement model requires month-end completion; partial-month dates are not converted into whole months.');
      if (!inFirstYear(a.completed)) return invalid('The first relevant financial year must contain completion, not the lease-signature year.');
      start = monthIndex(a.completed) + 1; base = Math.min(n('actual'), n('limit')); entitlement = n('remainingMonths');
      out.assumptions.push('Allowance begins after confirmed month-end completion, with a genuine enforceable improvement obligation and lessor-income inclusion. Voluntary improvements and tax-exempt lessor cases are excluded.', `The expenditure limit is a ${a.limitBasis === 'stipulated' ? 'stipulated contractual amount' : 'separately established fair reasonable value where no sum is stipulated'}.`, 'Qualifying early section 11(g) termination has different rules from section 11(f); neither termination nor cession is computed here.');
    }
    const deductionMonths = Math.min(entitlement, 300);
    const rows = monthSchedule(base, deductionMonths, start, end);
    out.items = [currency('Eligible allowance base', base), numeric('Documented entitlement (months)', entitlement), numeric('Allowance spreading period, capped at 25 years (months)', deductionMonths), currency('Full-year allowance run rate', base * 12 / deductionMonths), ...scheduleItems(rows), currency('Total scheduled allowance, limited to eligible base', rows.reduce((sum, row) => sum + row.amount, 0))];
  }
  out.primaryResultLabel = own.id === 'home-office-expense-calculator'
    ? 'Illustrative premises-cost deduction'
    : own.id === 'wear-and-tear' && a.method === 'small'
      ? `One-time immediate allowance in financial year ending ${a.yearEnd}`
      : out.items.find(item => item.label.startsWith('Financial year ending'))?.label;
  if (out.blockers.length) return { ...out, status: 'blocked', items: [] };
  if (out.items.some(item => typeof item.value === 'number' && !Number.isFinite(item.value))) return invalid('The input combination did not produce finite results.');
  out.steps = ['Confirm the qualifying regime and the entered financial-year period.', 'Establish the eligible cost or contractual base, then apply only this tool’s selected allowance.', 'Allocate the first/last qualifying period under the stated convention, retain records and obtain review before a return claim.'];
  return out;
}

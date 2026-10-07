import { salaryTax } from './calculation';
import { RULES, type AssessmentYear, type AgeBand } from './rules';
import { FAMILY_DEFINITIONS, evaluateFamily } from './calculator-families';
import { PERSONAL_DEFINITIONS, evaluatePersonal } from './calculator-personal';
import { SPECIALIST_DEFINITIONS, evaluateSpecialist } from './calculator-specialists';
export type CalculatorResultKind = 'annualLiability' | 'incrementalTax' | 'componentTax' | 'deduction' | 'schedule' | 'projection' | 'guide';
export type CalculatorField = {
    id: string;
    label: string;
    type: 'number' | 'select' | 'choice' | 'date' | 'text' | 'textarea';
    format?: 'currency' | 'percent' | 'number';
    options?: {
        value: string;
        label: string;
    }[];
    help?: string;
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
    section?: string;
    visibleWhen?: {
        field: string;
        values: string[];
    };
};
export type CalculatorDefinition = {
    id: string;
    title: string;
    category: string;
    description: string;
    mode: 'estimate' | 'checker' | 'tracker';
    yearSensitive: boolean;
    yearPolicy?: 'ordinaryAssessment' | 'assessmentTable' | 'financialYear' | 'transaction' | 'independent';
    synonyms?: string[];
    primaryResultLabel?: string;
    scopeSummary: string;
    fields: CalculatorField[];
    example?: Record<string, string>;
    related?: string[];
    resultKind: CalculatorResultKind;
    comparisonKey: string;
    contractAvailability: 'live' | 'pending';
    pendingReason?: string;
};
export type CalculatorItem = {
    label: string;
    value: number | string;
    format?: 'currency' | 'percent' | 'number' | 'text';
};
export type CalculatorOutcome = {
    status: 'supported' | 'blocked' | 'invalid';
    resultKind: CalculatorResultKind;
    comparisonKey: string;
    items: CalculatorItem[];
    blockers: string[];
    assumptions: string[];
    provenance: {
        version: string;
        checked: string;
        period?: string;
        sources: {
            title: string;
            url: string;
        }[];
    };
    steps?: string[];
    explanation?: string[];
    fieldErrors?: Record<string, string>;
    primaryResultLabel?: string;
    calendarEvents?: {
        title: string;
        date: string;
        sourceUrl: string;
        category: string;
    }[];
};
type Inputs = Record<string, string>;
const checked = '7 October 2026';
const rates = { title: 'SARS individual rates', url: 'https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/' };
const uifSource = { title: 'SARS UIF contributions', url: 'https://www.sars.gov.za/types-of-tax/unemployment-insurance-fund/' };
const vatSource = { title: 'SARS VAT', url: 'https://www.sars.gov.za/types-of-tax/value-added-tax/' };
const tri = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' }];
const age: CalculatorField = { id: 'age', label: 'Age at the assessment year end', type: 'select', options: [{ value: 'under65', label: 'Adult under 65' }, { value: '65to74', label: '65–74' }, { value: '75plus', label: '75 or older' }] };
const amount = (id: string, label: string, help?: string): CalculatorField => ({ id, label, type: 'number', format: 'currency', min: 0, max: 100000000, step: .01, help });
const choice = (id: string, label: string, help?: string): CalculatorField => ({ id, label, type: 'choice', options: tri, help });
const select = (id: string, label: string, options: {
    value: string;
    label: string;
}[]): CalculatorField => ({ id, label, type: 'select', options });
const number = (id: string, label: string, min: number, max: number, step = 1): CalculatorField => ({ id, label, type: 'number', format: 'number', min, max, step });
const resident = choice('resident', 'Are you an adult South African resident for the full assessment year?');
const finalIncome = amount('income', 'Known annual ordinary taxable income', 'Annual taxable income after any already-established deductions. This is not gross salary or take-home pay. Do not include separately taxed lump sums.');
const simple = choice('simple', 'Is this a known ordinary-income scenario without medical credits, foreign tax, directives or other unmodelled adjustments?', 'Unknown taxable income, unresolved deductions, capital gains or special taxable amounts need separate review. No missing fact is assumed to be zero.');
const levelYear = choice('levelYear', 'Is this twelve equal months of ordinary salary for the full year?', 'Partial-year employment, bonuses, allowances, fringe benefits, directives or other deductions are excluded from this monthly scenario.');
const ordinaryOnly = choice('ordinaryOnly', 'Does the remuneration contain only ordinary taxable cash salary, without other payslip deductions or benefits?');
const eligible = choice('uifEligible', 'Is this employee relationship eligible for UIF contributions?', 'Use No only for a known statutory exclusion; Not sure blocks the net-pay scenario. Only employee UIF reduces take-home.');
const live = (id: string, title: string, category: string, description: string, resultKind: CalculatorResultKind, fields: CalculatorField[], example: Inputs, related: string[] = [], scopeSummary = description, yearSensitive = true): CalculatorDefinition => ({ id, title, category, description, resultKind, fields, example, related, scopeSummary, yearSensitive, yearPolicy: yearSensitive ? 'ordinaryAssessment' : 'independent', mode: 'estimate', comparisonKey: id, contractAvailability: 'live' });
const basicExample = { income: '360000', age: 'under65', resident: 'yes', simple: 'yes' };
const salaryExample = { monthly: '30000', age: 'under65', resident: 'yes', levelYear: 'yes', ordinaryOnly: 'yes', uifEligible: 'yes' };
const active: CalculatorDefinition[] = [
    live('tax-refund', 'Tax refund and balance', 'Salary and pay', 'Compare a bounded annual tax scenario with PAYE already paid.', 'annualLiability', [finalIncome, amount('paye', 'Annual PAYE already withheld'), age, resident, simple], { ...basicExample, paye: '60000' }, ['income-tax'], 'Known final ordinary taxable income with no medical/foreign credits, prior balances, penalties or other unmodelled adjustments. This is not a SARS account balance.'),
    live('income-tax', 'Salary tax', 'Salary and pay', 'Plan take-home for twelve equal ordinary monthly salaries.', 'annualLiability', [amount('monthly', 'Ordinary monthly taxable remuneration'), age, resident, levelYear, ordinaryOnly, eligible], salaryExample, ['bonus-tax', 'net-to-gross'], 'Level twelve-month salary planning estimate; annual normal tax divided by twelve is not a definitive payslip or partial-year withholding rule.'),
    live('bonus-tax', 'Bonus tax', 'Salary and pay', 'See the annual normal-tax change from an additional bonus.', 'incrementalTax', [finalIncome, amount('bonus', 'Additional taxable bonus not included in the base'), age, resident, simple], { ...basicExample, bonus: '30000' }, ['income-tax'], 'Incremental annual normal tax. This does not determine employer withholding or a directive.'),
    live('tax-bracket', 'Tax bracket', 'Salary and pay', 'Understand marginal rate, effective rate and age rebates.', 'annualLiability', [finalIncome, age, resident, simple], basicExample, ['income-tax']),
    live('hourly-to-salary', 'Hourly to salary', 'Salary and pay', 'Convert your own paid hours and weeks into annual and monthly equivalents.', 'projection', [amount('hourly', 'Hourly pay'), number('hours', 'Paid hours per week', 0, 168, .01), number('weeks', 'Paid weeks per year', 0, 53, .01)], { hourly: '150', hours: '40', weeks: '48' }, ['income-tax'], 'Arithmetic conversion with your explicit paid schedule. No tax, UIF or equal-month payslip assumption.', false),
    live('net-to-gross', 'Net to gross salary', 'Salary and pay', 'Solve ordinary take-home or compare a net raise with the current gross.', 'annualLiability', [select('mode', 'Salary target', [{ value: 'absolute', label: 'Target take-home' }, { value: 'raise', label: 'Desired take-home raise' }]), { ...amount('currentGross', 'Current gross salary in the selected period'), visibleWhen: { field: 'mode', values: ['raise'] } }, amount('target', 'Desired take-home, excluding unmodelled deductions'), select('unit', 'Target pay period', [{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual' }]), age, resident, levelYear, ordinaryOnly, eligible], { mode: 'absolute', target: '25000', unit: 'monthly', age: 'under65', resident: 'yes', levelYear: 'yes', ordinaryOnly: 'yes', uifEligible: 'yes' }, ['income-tax'], 'Inverts only annual normal tax and stated eligible employee UIF for twelve equal months. Gross packages and real payslips may differ.'),
    live('uif', 'UIF contributions', 'Salary and pay', 'Show capped employee and employer monthly UIF contributions.', 'componentTax', [amount('monthly', 'Monthly UIF-liable remuneration'), choice('eligible', 'Is the employee relationship eligible for UIF?')], { monthly: '10000', eligible: 'yes' }, ['income-tax'], 'Contributions only; this does not calculate unemployment, maternity or other benefit entitlements.', false),
    live('vat', 'VAT calculator', 'Business and property', 'Separate VAT from a confirmed standard-rated amount.', 'componentTax', [amount('amount', 'Transaction amount'), select('mode', 'Amount is', [{ value: 'exclusive', label: 'Excluding VAT' }, { value: 'inclusive', label: 'Including VAT' }]), choice('standard', 'Is this a confirmed 15% standard-rated transaction?')], { amount: '115', mode: 'inclusive', standard: 'yes' }, [], '15% standard-rate arithmetic only. No vendor, invoice or input-credit eligibility determination.', false),
];
const remaining: [
    string,
    string,
    string,
    CalculatorResultKind,
    'estimate' | 'checker' | 'tracker'
][] = [
    ['retirement-fund-lump-sum-tax', 'Retirement lump-sum tax', 'Retirement', 'componentTax', 'estimate'], ['two-pot-calculator', 'Two-pot withdrawal', 'Retirement', 'incrementalTax', 'estimate'],
    ['capital-gains-tax', 'Capital gains tax', 'Investments and assets', 'incrementalTax', 'estimate'], ['travel-allowance', 'Travel deduction', 'Deductions and benefits', 'deduction', 'estimate'],
    ['medical-aid-credits', 'Medical aid credits', 'Deductions and benefits', 'componentTax', 'estimate'], ['provisional-tax', 'Provisional tax', 'Business and property', 'componentTax', 'estimate'],
    ['home-office-expense-calculator', 'Home office expenses', 'Deductions and benefits', 'deduction', 'estimate'], ['wear-and-tear', 'Wear and tear', 'Deductions and benefits', 'schedule', 'estimate'],
    ['retirement-savings', 'Retirement savings', 'Retirement', 'incrementalTax', 'estimate'], ['local-interest', 'Taxable local interest', 'Investments and assets', 'incrementalTax', 'estimate'],
    ['taxable-foreign-dividends', 'Taxable foreign dividends', 'Investments and assets', 'componentTax', 'estimate'], ['rental-income-tax', 'Rental income tax', 'Business and property', 'incrementalTax', 'estimate'],
    ['retrenchment-tax', 'Retrenchment tax', 'Retirement', 'componentTax', 'estimate'], ['crypto-tax', 'Crypto tax', 'Investments and assets', 'incrementalTax', 'estimate'],
    ['donations-tax', 'Donations tax', 'Investments and assets', 'componentTax', 'estimate'], ['company-car-tax', 'Company car tax', 'Deductions and benefits', 'incrementalTax', 'estimate'],
    ['property-transfer-cost', 'Property transfer duty', 'Business and property', 'componentTax', 'estimate'], ['small-business-income-tax', 'Small-business income tax', 'Business and property', 'componentTax', 'estimate'],
    ['payroll-tax', 'Payroll tax', 'Salary and pay', 'componentTax', 'estimate'], ['am-i-a-provisional-taxpayer', 'Provisional taxpayer check', 'Business and property', 'guide', 'checker'],
    ['tfsa-calculator', 'TFSA calculator', 'Investments and assets', 'projection', 'estimate'], ['s12c-wear-and-tear', 'Section 12C wear and tear', 'Deductions and benefits', 'schedule', 'estimate'],
    ['sbc-wear-and-tear', 'SBC wear and tear', 'Deductions and benefits', 'schedule', 'estimate'], ['s11f-lease-premium-allowance', 'Section 11(f) lease premium', 'Deductions and benefits', 'schedule', 'estimate'],
    ['s11g-leasehold-improvements', 'Leasehold improvements', 'Deductions and benefits', 'schedule', 'estimate'], ['tax-deadlines', 'SARS tax deadlines', 'Deadlines and documents', 'guide', 'tracker'],
    ['tax-return-documents', 'Tax return documents', 'Deadlines and documents', 'guide', 'tracker'], ['where-is-my-sars-refund', 'Where is my SARS refund?', 'Deadlines and documents', 'guide', 'tracker'],
];
export const CALCULATORS: CalculatorDefinition[] = [...active.map(c => PERSONAL_DEFINITIONS.find(d => d.id === c.id) ?? c), ...remaining.map(([id, title, category, resultKind, mode]) => SPECIALIST_DEFINITIONS.find(c => c.id === id) ?? PERSONAL_DEFINITIONS.find(c => c.id === id) ?? FAMILY_DEFINITIONS.find(c => c.id === id) ?? ({ id, title, category, resultKind, mode, description: 'Source contract and independent fixture review in progress.', scopeSummary: 'A numeric result is unavailable until its specific source contract is approved.', fields: [], yearSensitive: true, comparisonKey: id, contractAvailability: 'pending' as const, pendingReason: 'This calculator family is awaiting its formula and eligibility review.' }))];
const cents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const moneyItem = (label: string, value: number): CalculatorItem => ({ label, value, format: 'currency' });
const numericItem = (label: string, value: number): CalculatorItem => ({ label, value, format: 'number' });
function primaryResult(out: CalculatorOutcome, id: string, a: Inputs): CalculatorOutcome {
    const labels: Record<string, string> = {
        'income-tax': 'Monthly take-home planning amount', 'tax-bracket': 'Estimated annual normal tax',
        'tax-refund': out.items.some(i => i.label === 'Possible overpayment') ? 'Possible overpayment' : 'Estimated amount still payable',
        'bonus-tax': 'Incremental annual normal tax',
        'hourly-to-salary': a.mode === 'annualNet' ? 'Annual net illustration' : a.mode === 'payrollPeriod' ? 'Prorated worked-period withholding illustration' : 'Annual gross pay equivalent',
        'net-to-gross': a.mode === 'raise' ? 'Gross raise needed in selected period' : `${a.unit === 'monthly' ? 'Monthly' : 'Annual'} gross planning amount`,
        'uif': a.mode === 'contributions' ? 'Monthly employee UIF' : 'Estimated benefit for these known days',
        'local-interest': 'Taxable local interest', 'taxable-foreign-dividends': 'Taxable foreign-dividend component',
        'rental-income-tax': out.resultKind === 'guide' ? 'Rental profit / loss component' : 'Incremental annual normal tax',
        'retirement-fund-lump-sum-tax': 'Current benefit table tax', 'retrenchment-tax': 'Package after these two tax components',
        'two-pot-calculator': 'Withdrawal after this tax component', 'property-transfer-cost': 'Transfer duty component',
        'small-business-income-tax': 'SBC normal tax', 'travel-allowance': 'Illustrative allowance deduction',
        'company-car-tax': 'Separate incremental annual normal tax', 'payroll-tax': 'Total monthly employee take-home',
        'medical-aid-credits': 'Credits applied against normal tax',
        'retirement-savings': a.mode === 'growth' ? 'Projected nominal investment balance' : 'Estimated contribution tax saving',
        'capital-gains-tax': 'Incremental annual normal tax', 'crypto-tax': 'Incremental annual normal tax',
        'donations-tax': 'Donor donations tax on this event',
        'tfsa-calculator': a.mode === 'growth' ? 'Projected nominal investment balance' : out.items.some(i => i.label === 'Lifetime contribution excess' && Number(i.value) > 0) ? 'Lifetime contribution excess' : out.items.some(i => i.label === 'Current annual contribution excess' && Number(i.value) > 0) ? 'Annual-only excess-tax illustration' : 'Annual contribution headroom',
        'provisional-tax': a.period === 'basic' ? 'Illustrative basic amount' : 'Provisional instalment planning amount',
        'am-i-a-provisional-taxpayer': 'Conditional screening outcome', 'where-is-my-sars-refund': 'Primary next action',
    };
    const nextEvent = out.calendarEvents?.find(e => e.date >= a.today);
    const preferred = out.primaryResultLabel ?? (id === 'tax-deadlines' ? nextEvent?.title : labels[id]);
    const existing = out.items.find(i => i.label === preferred)?.label;
    return { ...out, primaryResultLabel: existing ?? out.items[0]?.label };
}
function provenance(id: string, year: AssessmentYear, sources: {
    title: string;
    url: string;
}[]) { const d = CALCULATORS.find(c => c.id === id), r = RULES[year]; return { version: `za-${id}-${d?.yearSensitive ? year : 'checked-20261007'}-v1`, checked, period: d?.yearSensitive && r ? `${r.start} to ${r.end}` : 'Independent rule / arithmetic checked 7 October 2026', sources }; }
function normal(year: AssessmentYear, a: Inputs, income: number) { return salaryTax(year, income, a.age as Exclude<AgeBand, ''>, 0); }
function uif(monthly: number) { return .01 * Math.min(monthly, 17712); }
function salary(year: AssessmentYear, a: Inputs, annual: number) { const tax = normal(year, a, annual).liability; const employeeUIF = a.uifEligible === 'yes' ? uif(annual / 12) * 12 : 0; return { tax, employeeUIF, net: annual - tax - employeeUIF }; }
function fieldsValid(def: CalculatorDefinition, raw: unknown) {
    const errors: Record<string, string> = {}, missing: string[] = [];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        return { errors: { inputs: 'Use the defined calculator fields.' }, missing };
    const a = raw as Record<string, unknown>, allowed = new Set(def.fields.map(f => f.id));
    for (const key of Object.keys(a))
        if (!allowed.has(key))
            errors[key] = 'Unexpected field.';
    for (const f of def.fields) {
        const v = a[f.id], visible = !f.visibleWhen || f.visibleWhen.values.includes(String(a[f.visibleWhen.field]));
        if (v === undefined || v === '') {
            if (f.required !== false && visible)
                missing.push(`Complete: ${f.label}`);
            continue;
        }
        if (!visible)
            continue;
        if (typeof v !== 'string' || v.length > 10000) {
            errors[f.id] = 'Enter a bounded text value.';
            continue;
        }
        if (f.type === 'number') {
            const n = Number(v), pattern = (f.min ?? 0) < 0 ? /^-?\d+(\.\d+)?$/ : /^\d+(\.\d+)?$/;
            if (!pattern.test(v) || !Number.isFinite(n) || n < (f.min ?? 0) || n > (f.max ?? 100000000) || ((f.step === 1) && !Number.isInteger(n)) || (f.format === 'currency' && /\.\d{3,}$/.test(v)))
                errors[f.id] = `Enter a finite amount between ${f.min ?? 0} and ${f.max ?? 100000000}${f.format === 'currency' ? ', with at most two decimals' : ''}.`;
        }
        if ((f.type === 'choice' || f.type === 'select') && !f.options?.some(o => o.value === v))
            errors[f.id] = 'Choose a listed option.';
        if (f.type === 'date') {
            const d = new Date(`${v}T00:00:00Z`);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== v || v < '1900-01-01' || v > '2100-12-31')
                errors[f.id] = 'Enter a real date between 1900 and 2100.';
        }
    }
    return { errors, missing };
}
export function evaluateCalculator(id: string, year: AssessmentYear, inputs: Inputs): CalculatorOutcome {
    const def = CALCULATORS.find(c => c.id === id);
    const kind = def?.resultKind ?? 'guide', comparisonKey = def?.comparisonKey ?? id;
    const base: CalculatorOutcome = { status: 'blocked', resultKind: kind, comparisonKey, items: [], blockers: [], assumptions: [], provenance: provenance(id, year, []) };
    if (!def)
        return { ...base, status: 'invalid', blockers: ['Choose a known calculator.'] };
    if (year !== 2026 && year !== 2027)
        return { ...base, status: 'invalid', blockers: ['Choose assessment year 2026 or 2027.'] };
    if (def.contractAvailability !== 'live')
        return { ...base, blockers: [def.pendingReason!] };
    const { errors, missing } = fieldsValid(def, inputs);
    if (Object.keys(errors).length)
        return { ...base, status: 'invalid', blockers: ['Correct the field formats before calculating.'], fieldErrors: errors };
    if (missing.length)
        return { ...base, blockers: missing };
    const specialist = evaluateSpecialist(def, year, inputs);
    if (specialist)
        return primaryResult(specialist, id, inputs);
    const personal = evaluatePersonal(def, year, inputs);
    if (personal)
        return primaryResult(personal, id, inputs);
    const family = evaluateFamily(def, year, inputs);
    if (family)
        return primaryResult(family, id, inputs);
    const a = inputs, n = (key: string) => Number(a[key]);
    const need = (key: string, value = 'yes') => { if (a[key] !== value)
        base.blockers.push(`${def.fields.find(f => f.id === key)?.label}: ${a[key] === 'unsure' ? 'clarify this fact before an estimate' : 'this scenario is outside the supported boundary'}.`); };
    const taxFamily = ['tax-bracket', 'tax-refund', 'bonus-tax', 'income-tax', 'net-to-gross'].includes(id);
    if (taxFamily) {
        need('resident');
        if (id === 'income-tax' || id === 'net-to-gross') {
            need('levelYear');
            need('ordinaryOnly');
            if (a.uifEligible === 'unsure')
                base.blockers.push('Clarify UIF eligibility.');
        }
        else
            need('simple');
        base.provenance = provenance(id, year, [rates, ...(id === 'income-tax' || id === 'net-to-gross' ? [uifSource] : [])]);
        base.assumptions.push('Adult resident, year-end age, ordinary taxable income only. No unmodelled credits, benefits, deductions, directives or prior SARS balances.');
        if (year === 2027)
            base.assumptions.push('2027 full-year forecast using current SARS-published rates, subject to legislation and final assessment.');
    }
    if (id === 'uif') {
        need('eligible');
        base.provenance = provenance(id, year, [uifSource]);
        base.assumptions.push('Eligible employee relationship and known UIF-liable monthly remuneration; contribution rates only, not benefit entitlement.');
    }
    if (id === 'vat') {
        need('standard');
        base.provenance = provenance(id, year, [vatSource]);
        base.assumptions.push('Confirmed standard-rated transaction at 15%; registration and input-credit eligibility are separate.');
    }
    if (base.blockers.length)
        return base;
    let items: CalculatorItem[] = [], steps: string[] = [];
    if (id === 'tax-bracket' || id === 'tax-refund') {
        const r = normal(year, a, n('income'));
        items = [moneyItem('Annual ordinary taxable income', r.income), moneyItem('Tax before rebates', r.bracketTax), moneyItem('Age rebates', r.rebate), moneyItem('Estimated annual normal tax', r.liability), { label: 'Marginal rate', value: r.marginalRate, format: 'percent' }, { label: 'Effective rate', value: r.effectiveRate, format: 'percent' }];
        steps = ['Apply progressive bands to known annual taxable income; subtract additive age rebates; floor normal tax at zero.'];
        if (id === 'tax-refund') {
            const balance = cents(r.liability - n('paye'));
            items.push(moneyItem('Annual PAYE entered', n('paye')), moneyItem(balance >= 0 ? 'Estimated amount still payable' : 'Possible overpayment', Math.abs(balance)));
            base.assumptions.push('A possible overpayment is not a guaranteed refund; SARS determines assessments and account balances.');
        }
    }
    if (id === 'income-tax') {
        const annual = n('monthly') * 12;
        if (annual > 100000000)
            return { ...base, status: 'invalid', blockers: ['Annual remuneration exceeds the R100,000,000 scenario limit.'] };
        const s = salary(year, a, annual);
        items = [moneyItem('Annual taxable remuneration', annual), moneyItem('Estimated annual normal tax', s.tax), moneyItem('Monthly normal-tax planning amount', s.tax / 12), moneyItem('Monthly employee UIF', s.employeeUIF / 12), moneyItem('Monthly employer UIF', s.employeeUIF / 12), moneyItem('Monthly take-home planning amount', s.net / 12)];
        base.assumptions.push('Twelve equal ordinary salary months. Annual tax divided by twelve is a planning illustration, not definitive payroll withholding. Employer UIF is not deducted from the employee.');
    }
    if (id === 'bonus-tax') {
        if (n('income') + n('bonus') > 100000000)
            return { ...base, status: 'invalid', blockers: ['Combined annual income exceeds the scenario limit.'] };
        const before = normal(year, a, n('income')).liability, after = normal(year, a, n('income') + n('bonus')).liability;
        items = [moneyItem('Annual normal tax before bonus', before), moneyItem('Annual normal tax with bonus', after), moneyItem('Incremental annual normal tax', cents(after - before)), moneyItem('Bonus after this tax component', cents(n('bonus') - (after - before)))];
        base.assumptions.push('This annual tax difference is not a promise of payslip withholding or a directive calculation.');
    }
    if (id === 'hourly-to-salary') {
        const annual = n('hourly') * n('hours') * n('weeks');
        if (annual > 100000000)
            return { ...base, status: 'invalid', blockers: ['Converted annual amount exceeds the scenario limit.'] };
        items = [moneyItem('Annual gross pay equivalent', annual), moneyItem('Monthly gross pay equivalent', annual / 12), numericItem('Paid hours in the entered year', n('hours') * n('weeks'))];
        base.assumptions.push('Your entered paid hours and weeks determine the arithmetic; no tax, leave, overtime or equal-month payment is inferred.');
        base.provenance = provenance(id, year, []);
    }
    if (id === 'net-to-gross') {
        const multiplier = a.unit === 'monthly' ? 12 : 1, currentAnnual = a.mode === 'raise' ? n('currentGross') * multiplier : 0;
        if (currentAnnual > 100000000)
            return { ...base, status: 'invalid', blockers: ['Current annual gross exceeds the scenario limit.'] };
        const currentNet = a.mode === 'raise' ? salary(year, a, currentAnnual).net : 0, annualTarget = n('target') * multiplier + currentNet, maximum = salary(year, a, 100000000).net;
        if (annualTarget > maximum)
            return { ...base, status: 'invalid', blockers: ['The desired net cannot be reached within the annual gross limit.'] };
        let lo = 0, hi = 100000000;
        for (let i = 0; i < 90; i++) {
            const mid = (lo + hi) / 2;
            if (salary(year, a, mid).net < annualTarget)
                lo = mid;
            else
                hi = mid;
        }
        const gross = a.unit === 'monthly' ? cents(hi / 12) : cents(hi), annualGross = gross * (a.unit === 'monthly' ? 12 : 1), s = salary(year, a, annualGross), divisor = a.unit === 'monthly' ? 12 : 1;
        items = [moneyItem(`${a.unit === 'monthly' ? 'Monthly' : 'Annual'} gross planning amount`, gross), moneyItem('Annual gross equivalent', annualGross), moneyItem('Annual normal tax', s.tax), moneyItem('Annual employee UIF', s.employeeUIF), moneyItem('Recovered take-home in selected period', s.net / divisor), moneyItem('Solver residual in selected period', s.net / divisor - annualTarget / divisor)];
        if (a.mode === 'raise') {
            items.push(moneyItem('Current gross in selected period', n('currentGross')), moneyItem('Current take-home in selected period', currentNet / divisor), moneyItem('Gross raise needed in selected period', gross - n('currentGross')), moneyItem('Recovered net raise in selected period', (s.net - currentNet) / divisor));
            base.comparisonKey = 'net-to-gross-raise';
        }
        else
            base.comparisonKey = 'net-to-gross-target';
        base.assumptions.push('Only normal tax and explicitly eligible employee UIF are deducted. Rounded solved gross recovers selected-period net within one cent; real payslips can differ.');
    }
    if (id === 'uif') {
        const c = uif(n('monthly'));
        items = [moneyItem('Monthly employee UIF', c), moneyItem('Monthly employer UIF', c), moneyItem('Combined monthly contributions', c * 2)];
        steps = ['Each contribution is 1% of monthly eligible remuneration, capped at R17,712 remuneration / R177.12 contribution.'];
    }
    if (id === 'vat') {
        const excluding = a.mode === 'exclusive' ? n('amount') : n('amount') / 1.15, vat = excluding * .15;
        items = [moneyItem('Amount excluding VAT', excluding), moneyItem('VAT at 15%', vat), moneyItem('Amount including VAT', excluding + vat)];
    }
    if (items.some(i => typeof i.value === 'number' && !Number.isFinite(i.value)))
        return { ...base, status: 'invalid', blockers: ['The input combination cannot produce a finite bounded result.'] };
    return primaryResult({ ...base, status: 'supported', items, steps, explanation: steps }, id, inputs);
}

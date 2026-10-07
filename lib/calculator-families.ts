import { salaryTax } from './calculation';
import { RULES, type AssessmentYear, type AgeBand } from './rules';
import type { CalculatorDefinition as Def, CalculatorField as Field, CalculatorItem as Item, CalculatorOutcome as Outcome, CalculatorResultKind as Kind } from './calculators';
type Inputs = Record<string, string>;
const tri = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' }];
const m = (id: string, label: string, help?: string): Field => ({ id, label, help, type: 'number', format: 'currency', min: 0, max: 100000000, step: .01 });
const n = (id: string, label: string, min: number, max: number, step = 1): Field => ({ id, label, type: 'number', format: 'number', min, max, step });
const q = (id: string, label: string, help?: string): Field => ({ id, label, help, type: 'choice', options: tri });
const s = (id: string, label: string, options: [
    string,
    string
][]): Field => ({ id, label, type: 'select', options: options.map(([value, label]) => ({ value, label })) });
const date = (id: string, label: string): Field => ({ id, label, type: 'date' });
const age = s('age', 'Age at assessment year end', [['under65', 'Adult under 65'], ['65to74', '65–74'], ['75plus', '75 or older']]);
const income = m('income', 'Complete annual ordinary taxable base, excluding this tool’s added amount', 'Known final ordinary taxable income, excluding the increment. This is not take-home pay or a partial-year amount annualised again.');
const simple = q('simple', 'Are the taxable base and classification known, without unmodelled credits, benefits, deductions, foreign tax or directives?');
const resident = q('resident', 'Adult South African resident for the full assessment year?');
const taxFields = [income, age, resident, simple];
const taxExample = { income: '360000', age: 'under65', resident: 'yes', simple: 'yes' };
const historyFields = [m('priorRetirement', 'Prior taxable retirement benefits since October 2007'), m('priorWithdrawals', 'Prior taxable withdrawals since March 2009'), m('priorSeverance', 'Prior taxable severance benefits since March 2011'), q('historyKnown', 'Is this your complete cumulative taxable-benefit history before any zero-rate band?', 'Enter taxable benefit amounts, not tax previously paid. Include all relevant cross-type benefits.'), q('taxableKnown', 'Is the current qualifying category and taxable benefit portion established?', 'Actual fund/employer directives determine withholding. Transfers, deductions or uncertain categories need review.')];
const historyExample = { priorRetirement: '0', priorWithdrawals: '0', priorSeverance: '0', historyKnown: 'yes', taxableKnown: 'yes' };
function def(id: string, title: string, category: string, kind: Kind, fields: Field[], example: Inputs, scope: string, yearPolicy: Def['yearPolicy'] = 'ordinaryAssessment'): Def { return { id, title, category, description: scope, scopeSummary: scope, mode: 'estimate', yearSensitive: yearPolicy === 'ordinaryAssessment', yearPolicy, fields, example, resultKind: kind, comparisonKey: id, contractAvailability: 'live' }; }
export const FAMILY_DEFINITIONS: Def[] = [
    def('local-interest', 'Taxable local interest', 'Investments and assets', 'incrementalTax', [m('interest', 'Aggregate annual South African-source interest'), q('localOnly', 'Does this exclude foreign interest and tax-free investment returns?'), ...taxFields], { interest: '30000', localOnly: 'yes', ...taxExample }, 'Age-based local-interest exemption and a separate ordinary-tax increment on a complete base.'),
    def('taxable-foreign-dividends', 'Taxable foreign dividends', 'Investments and assets', 'componentTax', [m('dividend', 'Gross foreign dividend before withholding'), resident, q('partialExemption', 'Is this an ordinary resident-natural-person dividend with under 10% participation and no full exemption, CFC/prior inclusion or special instrument?')], { dividend: '45000', resident: 'yes', partialExemption: 'yes' }, 'Taxable component only. Foreign withholding is not deducted and foreign-credit limits are not calculated.'),
    def('rental-income-tax', 'Rental income tax', 'Business and property', 'incrementalTax', [m('rent', 'Known annual taxable rent and lease receipts'), m('expenses', 'Independently established allowable revenue expenses'), q('costsKnown', 'Are these allowable revenue costs, with no private-use, refundable-deposit, capital repayment, improvement or recoupment uncertainty?'), ...taxFields], { rent: '120000', expenses: '30000', costsKnown: 'yes', ...taxExample }, 'Positive rental profit tax increment. Losses receive no automatic salary offset; ring-fencing needs review.'),
    def('retirement-fund-lump-sum-tax', 'Retirement lump-sum tax', 'Retirement', 'componentTax', [s('benefit', 'Current benefit category', [['retirement', 'Qualifying retirement benefit'], ['withdrawal', 'Qualifying withdrawal benefit']]), m('amount', 'Current taxable benefit before applying the table'), ...historyFields], { benefit: 'retirement', amount: '600000', ...historyExample }, 'Current-table tax on all cumulative benefits less current-table tax on prior benefits. Not a directive or fresh tax-free allowance.'),
    def('retrenchment-tax', 'Retrenchment tax', 'Retirement', 'componentTax', [m('severance', 'Established qualifying severance portion'), m('ordinary', 'Separate ordinary leave, notice, salary or bonus portion'), q('severanceEligible', 'Has the statutory severance basis been established from the employer documents?'), ...historyFields, ...taxFields], { severance: '600000', ordinary: '30000', severanceEligible: 'yes', ...historyExample, ...taxExample }, 'Separates qualifying severance-table tax from ordinary-income increment; does not exempt a whole retrenchment package.'),
    def('two-pot-calculator', 'Two-pot withdrawal', 'Retirement', 'incrementalTax', [m('withdrawal', 'Gross savings-component withdrawal'), q('savingsComponent', 'Is this specifically a known savings-component withdrawal, not a retirement or withdrawal-table lump sum?'), ...taxFields], { withdrawal: '30000', savingsComponent: 'yes', ...taxExample }, 'Annual normal-tax difference only. Amount after this component excludes fund fees, SARS debt and actual directive differences.'),
    def('property-transfer-cost', 'Property transfer duty', 'Business and property', 'componentTax', [date('acquired', 'Acquisition / contract date'), m('value', 'Established taxable property value'), q('standardTransaction', 'Is this a known non-VAT, non-exempt standard transaction with an established taxable value?')], { acquired: '2026-10-07', value: '2000000', standardTransaction: 'yes' }, 'Transfer duty component only under the published acquisition table from 1 April 2025. Legal, bond and municipal fees are separate.', 'transaction'),
    def('small-business-income-tax', 'Small-business income tax', 'Business and property', 'componentTax', [date('yearEnd', 'Company financial-year end'), m('profit', 'Known annual taxable profit'), q('normalYear', 'Is this an ordinary 12-month company financial year?', 'Short or extended assessment years require a separately reviewed threshold treatment.'), q('sbcEligible', 'Is qualifying section 12E SBC status established for this financial year?', 'This requires eligible entity/natural-person shareholders, gross income no more than R20m, shareholding, investment-income and personal-service tests; size alone is insufficient.')], { yearEnd: '2027-02-28', profit: '500000', normalYear: 'yes', sbcEligible: 'yes' }, 'SBC normal tax only, conditional on established eligibility. No automatic election of the lowest business tax regime.', 'financialYear'),
    def('travel-allowance', 'Travel deduction', 'Deductions and benefits', 'deduction', [m('vehicleCost', 'Original vehicle acquisition cost including VAT, excluding finance charges'), m('allowance', 'Fixed travel allowance for this matching period'), { ...n('days', 'Days in the period the vehicle was used for business', 1, 365), help: 'Calendar duration of the business-use period, not the number of days you drove for business. Total kilometres still cover all private and business distance in the assessment-year / actual vehicle-use period.' }, n('totalKm', 'All private and business kilometres during the full vehicle-use period', .01, 1000000, .01), n('businessKm', 'Logged business kilometres excluding commuting', 0, 1000000, .01), q('fuelBorne', 'Did you bear all fuel costs?'), q('maintenanceBorne', 'Did you bear all maintenance costs?'), q('records', 'One personally owned vehicle, matching allowance/distance period and valid logbook?'), s('method', 'Cost method', [['deemed', 'Gazetted deemed-cost scale'], ['actual', 'Independently established actual qualifying costs']]), { ...m('actualCosts', 'Independently established actual qualifying total costs for the same period'), required: false }], { vehicleCost: '300000', allowance: '100000', days: '365', totalKm: '20000', businessKm: '10000', fuelBorne: 'yes', maintenanceBorne: 'yes', records: 'yes', method: 'deemed', actualCosts: '' }, 'Fixed-allowance deduction illustration; cost-scale or verified actual-cost allocation, capped at allowance. Reimbursive payments are separate.'),
    def('company-car-tax', 'Company car tax', 'Deductions and benefits', 'incrementalTax', [m('value', 'Already correctly determined employer-owned vehicle value'), n('months', 'Full-month equivalents of use', 1, 12), q('plan', 'Was a qualifying maintenance plan included at acquisition?'), n('totalKm', 'Total recorded private and business kilometres', .01, 1000000, .01), n('businessKm', 'Verified business kilometres excluding commute', 0, 1000000, .01), q('carScope', 'Confirmed determined value, non-operating-lease car, logbook and no employee payments/cost adjustments, exemptions or multiple-car complication?'), ...taxFields], { value: '400000', months: '12', plan: 'no', totalKm: '20000', businessKm: '5000', carScope: 'yes', ...taxExample }, 'Assessment fringe benefit and separate annual-tax increment. Not the PAYE 80%/20% inclusion or guaranteed withholding.'),
    def('payroll-tax', 'Payroll tax', 'Salary and pay', 'componentTax', [{ id: 'employees', label: 'Employee planning rows', type: 'textarea', help: 'Add up to 20 anonymised monthly-pay, year-end age and UIF eligibility rows. Do not enter names, identity numbers or other personal data.' }, q('payrollScope', 'Are all rows adult residents with twelve equal ordinary salary months and no unmodelled benefits, directives or deductions?'), s('sdl', 'Employer SDL status', [['liable', 'Known liable'], ['exempt', 'Known exempt'], ['unsure', 'Not sure']]), m('leviable', 'Confirmed monthly SDL-leviable remuneration across this payroll'), m('expectedAnnual', 'Expected total SDL-leviable remuneration over the next 12 months'), q('sdlBaseKnown', 'Is the SDL-liable base established after required exclusions?'), q('otherSdlExemption', 'Does a separately established statutory SDL exemption apply?')], { employees: '[{"monthly":"30000","age":"under65","uifEligible":"yes"}]', payrollScope: 'yes', sdl: 'exempt', leviable: '30000', expectedAnnual: '360000', sdlBaseKnown: 'yes', otherSdlExemption: 'no' }, 'A set of equal-month employee planning components with separate employer UIF and confirmed SDL; not a production payroll engine.'),
    def('medical-aid-credits', 'Medical aid credits', 'Deductions and benefits', 'componentTax', [m('income', 'Known annual taxable income after any established section 11F deduction'), m('fees', 'Eligible annual medical scheme fees counted once'), { id: 'months', label: 'Eligible covered people for each month, March–February', type: 'text', help: 'Enter the eligible covered-person count for every month; zero for a month without eligible contributions. No dependant names or medical details.' }, age, resident, q('registered', 'Registered South African medical scheme?'), q('solePayer', 'Only you and your employer paid these fees, with no shared-credit arrangement?'), q('reconciled', 'Income and fees include employer taxable benefits once and all entitlement is established?'), q('noExpenses', 'No qualifying out-of-pocket or impairment expenses paid and borne by you?'), q('disability', 'Could a qualifying disability or impairment apply to you or any relevant dependant?'), q('knownMonths', 'All eligible paid/projected months are known, with no refund or entitlement uncertainty?')], { income: '540000', fees: '36000', months: '1,1,1,1,1,1,1,1,1,1,1,1', age: '65to74', resident: 'yes', registered: 'yes', solePayer: 'yes', reconciled: 'yes', noExpenses: 'yes', disability: 'no', knownMonths: 'yes' }, 'Approved E=0, no disability, no shared payer scheme-credit case only. Credits are non-refundable; unelapsed 2027 months are full-year projections.'),
    def('retirement-savings', 'Retirement contribution tax saving', 'Retirement', 'incrementalTax', [m('income', 'Annual taxable employment before section 11F deduction'), m('contributions', 'Eligible current-year contributions including employer amounts once'), age, resident, simple, q('reconciled', 'Employment includes employer benefits once, is before the deduction, and equals eligible remuneration and pre-section-11F taxable income?'), q('currentOnly', 'Contributions are current-year qualifying South African fund amounts, counted once?'), q('carryovers', 'Any prior excess/carryovers?'), q('withdrawals', 'Any withdrawals, transfers or lump sums?')], { income: '600000', contributions: '60000', age: 'under65', resident: 'yes', simple: 'yes', reconciled: 'yes', currentOnly: 'yes', carryovers: 'no', withdrawals: 'no' }, 'Approved reconciled single-salary section 11F tax saving, not one marginal rate times contributions. Future growth is a separate scenario.'),
];
const sources = { rates: { title: 'SARS individual rates', url: 'https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/' }, interest: { title: 'SARS interest and dividends', url: 'https://www.sars.gov.za/tax-rates/income-tax/interest-and-dividends/' }, rental: { title: 'SARS rental income', url: 'https://www.sars.gov.za/types-of-tax/personal-income-tax/tax-on-rental-income/' }, lump: { title: 'SARS retirement and withdrawal tables', url: 'https://www.sars.gov.za/tax-rates/income-tax/retirement-lump-sum-benefits/' }, twoPot: { title: 'SARS two-pot tax implications', url: 'https://www.sars.gov.za/media-release/tax-implications-of-withdrawing-from-two-pot-retirement-system/' }, transfer: { title: 'SARS transfer duty rates', url: 'https://www.sars.gov.za/tax-rates/transfer-duty/' }, sbc: { title: 'SARS SBC rates', url: 'https://www.sars.gov.za/tax-rates/income-tax/companies-trusts-and-small-business-corporations-sbc/' }, car: { title: 'SARS fringe benefits guide', url: 'https://www.sars.gov.za/guide-for-employers-in-respect-of-fringe-benefits/' }, uif: { title: 'SARS UIF contributions', url: 'https://www.sars.gov.za/types-of-tax/unemployment-insurance-fund/' }, sdl: { title: 'SARS Skills Development Levy', url: 'https://www.sars.gov.za/types-of-tax/skills-development-levy/' }, medical: { title: 'SARS additional medical credit', url: 'https://www.sars.gov.za/types-of-tax/personal-income-tax/additional-medical-expenses-tax-credit/' }, retirement: { title: 'SARS section 11F', url: 'https://www.sars.gov.za/latest-news/retirement-fund-contribution-deductions-section-11f2a/' } };
for (const d of FAMILY_DEFINITIONS) {
    if (d.id === 'travel-allowance')
        d.yearPolicy = 'assessmentTable';
    if (d.id === 'retirement-fund-lump-sum-tax' || d.id === 'taxable-foreign-dividends') {
        d.yearPolicy = 'independent';
        d.yearSensitive = false;
    }
}
const travelTables = { 2026: [[100000, 33940, 146.7, 47.4], [200000, 60688, 163.8, 59.3], [300000, 87497, 177.9, 65.4], [400000, 111273, 191.4, 71.4], [500000, 135048, 204.8, 83.9], [600000, 159934, 234.9, 98.5], [700000, 184867, 238.9, 110.5], [Infinity, 211121, 242.9, 122.5]], 2027: [[115000, 38344, 132.9, 49.1], [230000, 68487, 148.4, 61.4], [345000, 98689, 161.2, 67.8], [460000, 125393, 173.4, 74], [575000, 152097, 185.5, 86.9], [690000, 180078, 212.8, 102], [805000, 208106, 216.5, 114.5], [Infinity, 237679, 220.1, 126.9]] };
function table(value: number, type: 'retirement' | 'withdrawal') { if (type === 'withdrawal') {
    if (value <= 27500)
        return 0;
    if (value <= 726000)
        return (value - 27500) * .18;
    if (value <= 1089000)
        return 125730 + (value - 726000) * .27;
    return 223740 + (value - 1089000) * .36;
} if (value <= 550000)
    return 0; if (value <= 770000)
    return (value - 550000) * .18; if (value <= 1155000)
    return 39600 + (value - 770000) * .27; return 143550 + (value - 1155000) * .36; }
const money = (label: string, value: number): Item => ({ label, value, format: 'currency' });
const numeric = (label: string, value: number): Item => ({ label, value, format: 'number' });
const text = (label: string, value: string): Item => ({ label, value, format: 'text' });
const round = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;
function normal(y: AssessmentYear, a: Inputs, v: number) { return salaryTax(y, v, a.age as Exclude<AgeBand, ''>, 0).liability; }
export function evaluateFamily(def: Def, year: AssessmentYear, a: Inputs): Outcome | null {
    if (!FAMILY_DEFINITIONS.some(c => c.id === def.id))
        return null;
    const id = def.id, n = (k: string) => Number(a[k]);
    const out: Outcome = { status: 'supported', resultKind: def.resultKind, comparisonKey: def.comparisonKey, items: [], blockers: [], assumptions: ['Inputs and eligibility confirmations are user assertions, not verification of documents or entitlement.', 'Component estimates are not a SARS assessment, directive or filing confirmation.'], provenance: { version: `za-${id}-${year}-v1`, checked: '7 October 2026', period: def.yearPolicy === 'ordinaryAssessment' ? `${RULES[year].start} to ${RULES[year].end}` : undefined, sources: [] }, steps: [] };
    const need = (key: string, value = 'yes') => { if (a[key] !== value)
        out.blockers.push(`${def.fields.find(f => f.id === key)?.label}: clarify or obtain separate review.`); };
    const known = (key: string) => { if (a[key] === 'unsure')
        out.blockers.push(`Clarify ${def.fields.find(f => f.id === key)?.label}.`); };
    const invalid = (message: string): Outcome => ({ ...out, status: 'invalid', items: [], blockers: [message] });
    const use = (...names: (keyof typeof sources)[]) => { out.provenance.sources = names.map(k => sources[k]); };
    if (def.fields.some(f => f.id === 'resident'))
        need('resident');
    if (def.fields.some(f => f.id === 'simple'))
        need('simple');
    if (def.yearPolicy === 'ordinaryAssessment' && year === 2027)
        out.assumptions.push('2027 full-year forecast using current SARS-published rates, subject to legislation and final assessment where proposed ordinary-income rates or limits apply.');
    if (id === 'local-interest') {
        need('localOnly');
        use('interest', 'rates');
        const exemption = a.age === 'under65' ? 23800 : 34500, taxable = Math.max(0, n('interest') - exemption);
        if (n('income') + taxable > 100000000)
            return invalid('Combined annual taxable income exceeds the scenario limit.');
        out.items = [money('Exempt local interest', Math.min(n('interest'), exemption)), money('Taxable local interest', taxable), money('Incremental annual normal tax', round(normal(year, a, n('income') + taxable) - normal(year, a, n('income'))))];
    }
    if (id === 'taxable-foreign-dividends') {
        out.provenance.version = 'za-foreign-dividend-component-20261007-v1';
        out.provenance.period = 'Resident-natural-person partial exemption checked 7 October 2026';
        need('partialExemption');
        use('interest');
        out.items = [money('Exempt foreign-dividend component', n('dividend') * 25 / 45), money('Taxable foreign-dividend component', n('dividend') * 20 / 45)];
        out.assumptions.push('No foreign withholding, treaty relief or section 6quat credit is calculated. Taxable component is not final tax.');
    }
    if (id === 'rental-income-tax') {
        need('costsKnown');
        use('rental', 'rates');
        const profit = n('rent') - n('expenses');
        out.items = [money('Rental profit / loss component', profit)];
        if (profit < 0) {
            out.resultKind = 'guide';
            out.comparisonKey = 'rental-loss-review';
            out.items.push(text('Next step', 'Review loss ring-fencing; no salary offset or refund is calculated.'));
        }
        else {
            if (n('income') + profit > 100000000)
                return invalid('Combined annual taxable income exceeds the scenario limit.');
            out.items.push(money('Incremental annual normal tax', round(normal(year, a, n('income') + profit) - normal(year, a, n('income')))));
        }
    }
    if (id === 'retirement-fund-lump-sum-tax' || id === 'retrenchment-tax') {
        if (id === 'retirement-fund-lump-sum-tax') {
            out.provenance.version = 'za-lump-tables-20230301-v1';
            out.provenance.period = 'Current published lump-sum tables checked 7 October 2026';
        }
        need('historyKnown');
        need('taxableKnown');
        use('lump');
        const prior = n('priorRetirement') + n('priorWithdrawals') + n('priorSeverance'), current = n(id === 'retrenchment-tax' ? 'severance' : 'amount');
        if (prior + current > 100000000)
            return invalid('Cumulative taxable benefits exceed the scenario limit.');
        const type = id === 'retrenchment-tax' ? 'retirement' : a.benefit as 'retirement' | 'withdrawal';
        const tax = round(table(prior + current, type) - table(prior, type));
        out.items = [money('Prior cumulative taxable benefits', prior), money('Current taxable benefit', current), money(id === 'retrenchment-tax' ? 'Qualifying severance-table tax' : 'Current benefit table tax', tax), money('Benefit after this tax component', current - tax)];
        out.steps = ['Apply the current category table to prior plus current taxable benefits; subtract the same current table applied to prior benefits. Prior tax paid is not subtracted.'];
        if (id === 'retrenchment-tax') {
            need('severanceEligible');
            if (n('income') + n('ordinary') > 100000000)
                return invalid('Ordinary annual income exceeds the scenario limit.');
            const increment = round(normal(year, a, n('income') + n('ordinary')) - normal(year, a, n('income')));
            out.items.push(money('Ordinary leave / notice / salary / bonus portion', n('ordinary')), money('Separate ordinary-income tax increment', increment), money('Package after these two tax components', current + n('ordinary') - tax - increment));
            use('lump', 'rates');
        }
        out.assumptions.push('Complete prior retirement since October 2007, withdrawal since March 2009 and severance since March 2011 history, before table zero bands. Actual directives govern withholding.');
    }
    if (id === 'two-pot-calculator') {
        need('savingsComponent');
        use('twoPot', 'rates');
        if (n('income') + n('withdrawal') > 100000000)
            return invalid('Combined annual income exceeds the scenario limit.');
        const tax = round(normal(year, a, n('income') + n('withdrawal')) - normal(year, a, n('income')));
        out.items = [money('Incremental annual normal tax', tax), money('Withdrawal after this tax component', n('withdrawal') - tax)];
        out.assumptions.push('Excludes fund fees, outstanding SARS debt and directive differences. This is not a guaranteed payout or withdrawal entitlement.');
    }
    if (id === 'property-transfer-cost') {
        need('standardTransaction');
        use('transfer');
        out.provenance.period = `Acquisition ${a.acquired}; published table effective 1 April 2025`;
        out.provenance.version = 'za-transfer-duty-20250401-v1';
        if (a.acquired < '2025-04-01')
            out.blockers.push('Acquisition before 1 April 2025 needs a different table.');
        if (a.acquired > '2026-10-07')
            out.blockers.push('Future acquisitions after the 7 October 2026 source-review date need the table rechecked; this tool does not promise future rates.');
        const v = n('value'), d = v <= 1210000 ? 0 : v <= 1663800 ? (v - 1210000) * .03 : v <= 2329300 ? 13614 + (v - 1663800) * .06 : v <= 2994800 ? 53544 + (v - 2329300) * .08 : v <= 13310000 ? 106784 + (v - 2994800) * .11 : 1241456 + (v - 13310000) * .13;
        out.items = [money('Transfer duty component', d)];
        out.assumptions.push('Established taxable value; standard non-VAT/non-exempt acquisition. This is not total property purchase cost or a legal/bond fee quote.');
    }
    if (id === 'small-business-income-tax') {
        need('sbcEligible');
        need('normalYear');
        use('sbc');
        out.provenance.period = `Company financial year ending ${a.yearEnd}`;
        out.provenance.version = `za-sbc-financial-${a.yearEnd >= '2026-04-01' ? '20260401-20270331' : '20250401-20260331'}-v1`;
        let newer = false;
        if (a.yearEnd >= '2026-04-01' && a.yearEnd <= '2027-03-31')
            newer = true;
        else if (!(a.yearEnd >= '2025-04-01' && a.yearEnd <= '2026-03-31'))
            out.blockers.push('This financial-year end is outside the reviewed SBC tables.');
        const v = n('profit'), threshold = newer ? 99000 : 95750, tax = v <= threshold ? 0 : v <= 365000 ? (v - threshold) * .07 : v <= 550000 ? (newer ? 18620 : 18848) + (v - 365000) * .21 : (newer ? 57470 : 57698) + (v - 550000) * .27;
        out.items = [money('SBC normal tax', tax), money('Taxable profit after normal tax', v - tax)];
        out.assumptions.push('SBC eligibility is explicitly asserted, not inferred from company size. The published older table bases are R18,848 and R57,698.');
        if (newer)
            out.assumptions.push('Current SARS-published 2027 SBC table; check final legislation before return use.');
    }
    if (id === 'travel-allowance') {
        need('records');
        known('fuelBorne');
        known('maintenanceBorne');
        out.provenance.sources = [{ title: 'SARS gazetted vehicle cost-scale notice', url: year === 2026 ? 'https://www.sars.gov.za/wp-content/uploads/Legal/SecLegis/Legal-LSec-IT-GN-2025-03-Notice-5936-GG-52199-Budget-2025-Rates-per-Kilometre-28-February-2025.pdf' : 'https://www.sars.gov.za/wp-content/uploads/IncomeTaxNotices/Legal-LSec-IT-GN-2026-03-Budget-2026-Rate-per-kilometre-iro-motor-vehicles-27-February-2026.pdf' }];
        if (n('businessKm') > n('totalKm'))
            return invalid('Business distance cannot exceed all private and business distance.');
        const row = travelTables[year].find(r => n('vehicleCost') <= r[0])!, fixed = row[1] * n('days') / 365, costPerKm = fixed / n('totalKm') + (a.fuelBorne === 'yes' ? row[2] / 100 : 0) + (a.maintenanceBorne === 'yes' ? row[3] / 100 : 0);
        let cost = n('businessKm') * costPerKm;
        if (a.method === 'actual') {
            if (a.actualCosts === undefined || a.actualCosts === '')
                out.blockers.push('Enter independently established qualifying actual total costs; unknown is not zero.');
            else
                cost = n('actualCosts') * n('businessKm') / n('totalKm');
        }
        out.items = [money('Prorated fixed component', fixed), money('Deemed cost per kilometre', costPerKm), money('Business cost allocation before allowance cap', cost), money('Illustrative allowance deduction', Math.min(n('allowance'), cost))];
        out.assumptions.push('Total kilometres include private and business travel over the whole matching vehicle-use period. Business excludes commuting. Fixed cost prorated days/365; fuel/maintenance only when borne in full. No claim that one method is legally optimal.', '2027 high-band maintenance uses gazetted 126.9c, not the conflicting guide 126.1c.');
    }
    if (id === 'company-car-tax') {
        need('carScope');
        known('plan');
        use('car', 'rates');
        if (n('businessKm') > n('totalKm'))
            return invalid('Business kilometres cannot exceed total recorded kilometres.');
        const monthly = n('value') * (a.plan === 'yes' ? .0325 : .035), gross = monthly * n('months'), benefit = gross * (1 - n('businessKm') / n('totalKm'));
        if (n('income') + benefit > 100000000)
            return invalid('Combined annual taxable income exceeds the scenario limit.');
        out.items = [money('Monthly gross car benefit', monthly), money('Annual gross car benefit', gross), money('Assessment benefit after verified business-use ratio', benefit), money('Separate incremental annual normal tax', round(normal(year, a, n('income') + benefit) - normal(year, a, n('income'))))];
        out.assumptions.push('Already correctly determined value, full-month equivalents, no employee payments or costs to adjust. Assessment benefit is separate from actual PAYE inclusion and withholding.');
    }
    if (id === 'payroll-tax') {
        need('payrollScope');
        need('sdlBaseKnown');
        known('otherSdlExemption');
        use('rates', 'uif', 'sdl');
        if (a.sdl === 'unsure')
            out.blockers.push('Establish SDL liability or exemption.');
        if (a.sdl === 'liable' && a.otherSdlExemption === 'yes')
            out.blockers.push('SDL liable status conflicts with the separately confirmed statutory exemption.');
        if (a.sdl === 'liable' && n('expectedAnnual') <= 500000)
            out.blockers.push('Expected SDL-leviable payroll not exceeding R500,000 is exempt.');
        if (a.sdl === 'exempt' && n('expectedAnnual') > 500000 && a.otherSdlExemption !== 'yes')
            out.blockers.push('Above R500,000, establish the separate statutory SDL exemption.');
        let rows: unknown;
        try {
            rows = JSON.parse(a.employees);
        }
        catch {
            return invalid('Complete the employee planning rows.');
        }
        if (!Array.isArray(rows) || rows.length < 1 || rows.length > 20)
            return invalid('Add 1 to 20 anonymised employee planning rows.');
        let totalPaye = 0, totalUif = 0, totalNet = 0, totalSalary = 0;
        for (const [i, row] of rows.entries()) {
            if (!row || typeof row !== 'object' || Array.isArray(row) || Object.keys(row).sort().join(',') !== 'age,monthly,uifEligible')
                return invalid('Each employee row has only monthly, age and uifEligible; no identity data.');
            const r = row as Inputs;
            if (typeof r.monthly !== 'string' || !/^\d+(\.\d{1,2})?$/.test(r.monthly) || Number(r.monthly) * 12 > 100000000 || !['under65', '65to74', '75plus'].includes(r.age) || !['yes', 'no', 'unsure'].includes(r.uifEligible))
                return invalid('Check every employee amount, age and UIF option.');
            if (r.uifEligible === 'unsure')
                out.blockers.push(`Clarify employee row ${i + 1} UIF eligibility.`);
            const gross = Number(r.monthly), paye = normal(year, r, gross * 12) / 12, employeeUIF = r.uifEligible === 'yes' ? .01 * Math.min(gross, 17712) : 0, net = gross - paye - employeeUIF;
            out.items.push(money(`Row ${i + 1} monthly normal-tax planning amount`, paye), money(`Row ${i + 1} monthly employee UIF`, employeeUIF), money(`Row ${i + 1} monthly take-home planning amount`, net));
            totalSalary += gross;
            totalPaye += paye;
            totalUif += employeeUIF;
            totalNet += net;
        }
        const sdl = a.sdl === 'liable' ? .01 * n('leviable') : 0;
        out.items.push(money('Total monthly salary', totalSalary), money('Total employee monthly normal-tax planning amounts', totalPaye), money('Total monthly employee UIF', totalUif), money('Total monthly employee take-home', totalNet), money('Employer monthly UIF', totalUif), money('Employer monthly SDL', sdl), money('Employer cost with these components', totalSalary + totalUif + sdl));
        out.assumptions.push('Annual normal tax divided by twelve for equal salary scenarios, not production PAYE. SDL is employer-only; the confirmed leviable amount may differ from salary totals.');
    }
    if (id === 'medical-aid-credits') {
        for (const k of ['registered', 'solePayer', 'reconciled', 'noExpenses', 'knownMonths'])
            need(k);
        need('disability', 'no');
        use('medical', 'rates');
        if (!/^\d+(,\d+){11}$/.test(a.months))
            return invalid('Complete all twelve monthly covered-person counts.');
        const counts = a.months.split(',').map(Number);
        if (counts.some(x => x > 20))
            return invalid('Monthly covered-person counts must be 0 to 20.');
        if ((n('fees') === 0 && counts.some(x => x > 0)) || (n('fees') > 0 && counts.every(x => x === 0)))
            out.blockers.push('Fee and eligible-month counts conflict; reconcile rather than assuming credits.');
        const r = salaryTax(year, n('income'), a.age as Exclude<AgeBand, ''>, 0, 0, n('fees'), counts), before = normal(year, a, n('income'));
        out.items = [money('Annual medical scheme credit (MTC)', r.medicalCredit), money('Additional medical credit (AMTC)', r.additionalMedicalCredit), money('Credits applied against normal tax', Math.min(before, r.medicalCredit + r.additionalMedicalCredit)), money('Normal tax after these credits', r.liability)];
        out.assumptions.push('E=0 affirmatively confirmed, no disability/impairment or shared payer; 33.3% is used for age65+. Unused credits create no cash or carried-forward credit.');
    }
    if (id === 'retirement-savings') {
        need('reconciled');
        need('currentOnly');
        need('carryovers', 'no');
        need('withdrawals', 'no');
        use('retirement', 'rates');
        const r = salaryTax(year, n('income'), a.age as Exclude<AgeBand, ''>, 0, n('contributions')), before = normal(year, a, n('income'));
        out.items = [money('Pre-section-11F employment income', n('income')), money('Eligible current-year contributions', n('contributions')), money('Allowed deduction', r.retirementDeduction), money('Contribution not deducted in this estimate', r.retirementNotDeducted), money('Taxable income after deduction', r.taxableIncome), money('Annual normal tax before contribution', before), money('Annual normal tax after contribution', r.liability), money('Estimated contribution tax saving', round(before - r.liability))];
        out.assumptions.push('Pre-deduction income equals remuneration and taxable income in this bounded case. Excess is not deducted here; no future carry-forward entitlement is determined.');
    }
    if (out.blockers.length)
        return { ...out, status: 'blocked', items: [] };
    if (out.items.some(i => typeof i.value === 'number' && !Number.isFinite(i.value)))
        return invalid('The input combination cannot produce a finite result.');
    return out;
}

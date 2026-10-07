import { salaryTax } from './calculation';
import { RULES, type AssessmentYear, type AgeBand } from './rules';
import type { CalculatorDefinition as Def, CalculatorField as Field, CalculatorItem as Item, CalculatorOutcome as Outcome, CalculatorResultKind as Kind } from './calculators';
import { FAMILY_DEFINITIONS } from './calculator-families';
type Inputs = Record<string, string>;
const tri = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' }];
const m = (id: string, label: string, help?: string): Field => ({ id, label, help, type: 'number', format: 'currency', min: 0, max: 100000000, step: .01 });
const n = (id: string, label: string, min: number, max: number, step = 1): Field => ({ id, label, type: 'number', format: 'number', min, max, step });
const q = (id: string, label: string, help?: string): Field => ({ id, label, help, type: 'choice', options: tri });
const s = (id: string, label: string, options: [
    string,
    string
][]): Field => ({ id, label, type: 'select', options: options.map(([value, label]) => ({ value, label })) });
const when = (f: Field, field: string, ...values: string[]): Field => ({ ...f, visibleWhen: { field, values } });
const age = s('age', 'Age at the assessment year end', [['under65', 'Adult under 65'], ['65to74', '65–74'], ['75plus', '75 or older']]);
const income = m('income', 'Complete annual ordinary taxable base excluding this added amount');
const simple = q('simple', 'Is the ordinary taxable base complete, with no unmodelled changing deductions, credits, foreign tax or directives?');
const resident = q('resident', 'Adult South African resident for the full assessment year?');
const taxFields = [income, age, resident, simple], taxExample = { income: '360000', age: 'under65', resident: 'yes', simple: 'yes' };
function def(id: string, title: string, category: string, kind: Kind, fields: Field[], example: Inputs, scope: string, yearSensitive = true): Def { return { id, title, category, description: scope, scopeSummary: scope, mode: 'estimate', yearSensitive, yearPolicy: yearSensitive ? 'ordinaryAssessment' : 'independent', fields, example, resultKind: kind, comparisonKey: id, contractAvailability: 'live' }; }
const growthFields = [m('opening', 'Starting investment balance'), m('payment', 'Contribution per selected payment period'), s('frequency', 'Contribution frequency', [['monthly', 'Monthly'], ['annual', 'Annual']]), s('timing', 'Contribution timing', [['end', 'End of each period'], ['begin', 'Beginning of each period']]), n('years', 'Whole investment years', 0, 50), { ...n('growth', 'Assumed effective annual growth (%)', -50, 50, .01), format: 'percent' as const }, { ...n('inflation', 'Assumed annual inflation (%)', 0, 25, .01), format: 'percent' as const }];
const growthExample = { opening: '10000', payment: '1000', frequency: 'monthly', timing: 'end', years: '1', growth: '0', inflation: '0' };
const cgtFields = [m('gains', 'Aggregate recognised current-year capital gains'), m('losses', 'Aggregate recognised current-year capital losses'), m('priorLoss', 'Prior assessed capital loss'), q('capitalKnown', 'Confirmed capital classification, complete annual aggregates and assessed loss history?'), q('ordinaryAsset', 'No home/death/business relief, rollover, connected-person, joint-ownership or special disposal uncertainty?')];
const cgtExample = { gains: '200000', losses: '0', priorLoss: '0', capitalKnown: 'yes', ordinaryAsset: 'yes', ...taxExample };
const medical = structuredClone(FAMILY_DEFINITIONS.find(d => d.id === 'medical-aid-credits')!);
medical.fields = medical.fields.filter(f => f.id !== 'noExpenses').map(f => f.id === 'registered' ? s('registered', 'Medical scheme situation', [['yes', 'Confirmed registered South African scheme'], ['noScheme', 'Affirmatively no medical scheme / fees'], ['no', 'Not a qualifying registered scheme'], ['unsure', 'Not sure']]) : f);
medical.fields.push(q('incomeKnown', 'Is T known final ordinary taxable income, excluding special lump sums and with all established deductions already reflected?'));
medical.fields.splice(2, 0, m('expenses', 'Known qualifying paid and unreimbursed out-of-pocket expenses'), q('expensesKnown', 'Are these qualifying expenses actually paid and borne by you, without reimbursement or eligibility uncertainty?'));
medical.example = { ...medical.example!, expenses: '0', expensesKnown: 'yes', incomeKnown: 'yes' };
delete medical.example.noExpenses;
medical.scopeSummary = medical.description = 'Standalone known qualifying medical expenses and scheme credits, with no disability/impairment or shared payer. Saved preparation retains its separate E=0 scope.';
const retirement = structuredClone(FAMILY_DEFINITIONS.find(d => d.id === 'retirement-savings')!);
retirement.title = 'Retirement savings';
retirement.fields = [s('mode', 'Retirement scenario', [['taxSaving', 'Current contribution tax saving'], ['growth', 'Investment growth projection']]), ...retirement.fields.map(f => when(f, 'mode', 'taxSaving')), ...growthFields.map(f => when(f, 'mode', 'growth'))];
retirement.example = { mode: 'taxSaving', ...retirement.example! };
retirement.description = retirement.scopeSummary = 'Keep the reviewed section 11F tax-saving calculation separate from a contribution/growth projection with your explicit financial assumptions.';
const hourly = def('hourly-to-salary', 'Hourly to salary', 'Salary and pay', 'projection', [
    s('mode', 'Pay illustration', [['gross', 'Hourly gross conversion'], ['annualNet', 'Actual annual ordinary-income net illustration'], ['payrollPeriod', 'Full-pay-period annualised withholding illustration']]),
    ...[m('hourly', 'Hourly pay'), n('hours', 'Paid hours per week', 0, 168, .01), n('weeks', 'Paid weeks per year', 0, 53, .01)].map(f => when(f, 'mode', 'gross', 'annualNet')),
    ...[age, resident, simple].map(f => when(f, 'mode', 'annualNet', 'payrollPeriod')),
    when(q('levelYear', 'Are these twelve equal ordinary salary months?'), 'mode', 'annualNet'),
    when(q('uifEligible', 'Is the employee relationship known eligible for UIF?'), 'mode', 'annualNet'),
    when(m('periodPay', 'Actual ordinary remuneration across the worked complete pay periods'), 'mode', 'payrollPeriod'),
    when(n('fullPeriods', 'Pay periods in the full year', 1, 366), 'mode', 'payrollPeriod'),
    when(n('workedPeriods', 'Completed pay periods represented by this remuneration', 1, 366), 'mode', 'payrollPeriod'),
    when(q('periodScope', 'Complete ordinary pay periods, one employer, known annual-income facts and no directives / irregular remuneration?'), 'mode', 'payrollPeriod'),
], { mode: 'gross', hourly: '150', hours: '40', weeks: '48' }, 'Explicit paid schedule, optional actual annual net, or separately labelled full-pay-period annualised withholding. These are different models.', true);
export const PERSONAL_DEFINITIONS: Def[] = [
    hourly,
    def('capital-gains-tax', 'Capital gains tax', 'Investments and assets', 'incrementalTax', [...cgtFields, ...taxFields], cgtExample, 'Aggregate ordinary resident-individual capital gains/losses, annual exclusion then prior assessed loss then 40% inclusion. Tax increment requires a complete ordinary base.'),
    def('crypto-tax', 'Crypto tax', 'Investments and assets', 'incrementalTax', [s('classification', 'Established classification', [['capital', 'Confirmed capital investment'], ['revenue', 'Confirmed taxable trading profit'], ['unsure', 'Not sure']]), q('classificationKnown', 'Classification and full transaction history established, with no staking, mining, DeFi, cross-border or other unsupported event?'), ...cgtFields.map(f => when(f, 'classification', 'capital')), when(m('tradingProfit', 'Independently established positive taxable trading profit'), 'classification', 'revenue'), ...taxFields], { classification: 'capital', classificationKnown: 'yes', ...cgtExample }, 'Explicit capital versus revenue scenario. No automatic classification or revenue-loss salary refund.'),
    def('donations-tax', 'Donations tax', 'Investments and assets', 'componentTax', [m('gift', 'Established taxable value of current non-exempt gift'), m('priorYearGifts', 'Prior non-exempt gifts in this assessment year before annual exemption'), m('priorTaxableGifts', 'Cumulative taxable gifts since 1 March 2018 before this event'), resident, q('standardGift', 'Natural-person donor, complete gift history and no spouse/PBO/maintenance/other full exemption or valuation uncertainty?')], { gift: '200000', priorYearGifts: '0', priorTaxableGifts: '0', resident: 'yes', standardGift: 'yes' }, 'Donor donations tax using annual exemption and cumulative 20%/25% bands. This is not a section 18A income-tax deduction.'),
    def('tfsa-calculator', 'TFSA calculator', 'Investments and assets', 'projection', [s('mode', 'TFSA scenario', [['headroom', 'Contribution headroom and excess'], ['growth', 'Illustrative investment growth']]), when(m('annual', 'Across-provider contributions in selected assessment year'), 'mode', 'headroom'), when(m('lifetime', 'Lifetime contributions before this year'), 'mode', 'headroom'), when(q('historyKnown', 'Qualifying account and complete contribution/transfer history?', 'Account balances and withdrawals are not contribution history; qualifying transfers are not new contributions.'), 'mode', 'headroom'), ...growthFields.map(f => when(f, 'mode', 'growth'))], { mode: 'headroom', annual: '50000', lifetime: '450000', historyKnown: 'yes' }, 'Contribution limits and annual-only excess-tax illustration; lifetime breaches require historic penalty review. Growth is a separate nominal projection.'),
    def('provisional-tax', 'Provisional tax', 'Business and property', 'componentTax', [s('period', 'Provisional planning mode', [['first', 'First instalment'], ['second', 'Second instalment'], ['basic', 'Previous-assessment basic amount illustration']]), ...taxFields.map(f => when(f, 'period', 'first', 'second')), when(m('credits', 'Applicable nonoverlapping PAYE / credits'), 'period', 'first', 'second'), when(q('creditsKnown', 'Are credits established for the selected period with no double-counting?', 'First: first-period PAYE/credits. Second: annual PAYE/credits; exclude the separately entered first provisional payment.'), 'period', 'first', 'second'), when(m('firstPaid', 'Actual first provisional payment already paid'), 'period', 'second'), when(m('assessed', 'Established adjusted basic amount before any age uplift'), 'period', 'basic'), when(n('elapsedYears', 'Confirmed number of applicable uplift years', 0, 50), 'period', 'basic'), when(q('oldAssessment', 'Is the qualifying assessment more than 18 months old?'), 'period', 'basic'), when(q('assessmentKnown', 'Assessment available 14 days before submission, statutory exclusions and exact elapsed years established?'), 'period', 'basic')], { period: 'first', credits: '20000', creditsKnown: 'yes', ...taxExample }, 'IRP6 planning component, not a penalty-safe minimum, return, or status determination. Basic-amount facts are a separate optional illustration.'),
    { ...def('am-i-a-provisional-taxpayer', 'Provisional taxpayer check', 'Business and property', 'guide', [q('natural', 'Natural person without special statutory exclusion uncertainty?'), q('commissionerNotice', 'Has SARS / the Commissioner expressly notified you to pay provisional tax?'), q('business', 'Do you carry on a business?'), q('employerRegistered', 'Is any remuneration from an employer registered for employees’ tax?'), q('otherIncome', 'Any income besides remuneration from a registered employer?'), q('onlySpecified', 'Are all additional income categories limited to the listed specified sources, with no uncertain unlisted income?'), m('taxableTotal', 'Complete annual taxable income'), m('specified', 'Taxable interest/dividend/foreign-dividend/rental/unregistered-employer-remuneration aggregate'), age], { natural: 'yes', commissionerNotice: 'no', business: 'no', employerRegistered: 'yes', otherIncome: 'no', onlySpecified: 'yes', taxableTotal: '360000', specified: '0', age: 'under65' }, 'Conditional natural-person screening using taxable aggregates, not gross receipts. Does not determine filing duties or a SARS status.'), mode: 'checker' },
    medical, retirement,
    def('uif', 'UIF calculator', 'Salary and pay', 'componentTax', [s('mode', 'UIF mode', [['contributions', 'Monthly contributions'], ['unemployment', 'Unemployment benefit illustration'], ['illness', 'Illness daily component / known days'], ['maternity', 'Maternity daily component / known days']]), m('monthly', 'Eligible monthly remuneration / average ordinary pay'), q('eligible', 'Is eligibility / coverage established for this selected UIF mode?'), when({ ...n('contributingDays', 'Completed contributing days in the four-year lookback', 0, 1461), required: false }, 'mode', 'unemployment'), when({ ...n('requestedDays', 'Requested eligible benefit days', 0, 365), required: false }, 'mode', 'unemployment', 'illness', 'maternity'), when(q('history', 'Complete history with no prior benefit claims or unknown credit balance?'), 'mode', 'unemployment', 'illness', 'maternity'), when(m('leavePay', 'Actual monthly employer pay during leave'), 'mode', 'illness', 'maternity'), when({ ...n('availableDays', 'Independently known available eligible credit / claim days', 0, 365), required: false }, 'mode', 'illness', 'maternity'), when(q('certified', 'Illness eligibility, certification and at least seven days established?'), 'mode', 'illness'), when(q('employment13', 'At least thirteen weeks employment and maternity eligibility established?'), 'mode', 'maternity')], { mode: 'contributions', monthly: '10000', eligible: 'yes' }, 'Contributions and bounded Department benefit formulas with explicit history/eligibility screens. Not a claim, credit ledger or entitlement decision.', false),
    { ...def('tax-deadlines', 'SARS tax deadlines', 'Deadlines and documents', 'guide', [s('category', 'Your deadline category', [['nonprovisional', 'Non-provisional individual'], ['provisional', 'Provisional individual'], ['trust', 'Trust'], ['employer', 'Employer']]), { id: 'today', label: 'Date used to mark upcoming / elapsed events', type: 'date' }], { category: 'nonprovisional', today: '2026-10-07' }, 'Published 2026 filing dates and distinct assessment-year payment periods. Calendar files are voluntary imports, not active reminders.'), mode: 'tracker', yearPolicy: 'assessmentTable' },
    { ...def('tax-return-documents', 'Tax return documents', 'Deadlines and documents', 'guide', ['salary', 'investments', 'medical', 'retirement', 'travel', 'donations', 'business', 'capital', 'homeOffice'].map(id => q(id, { salary: 'Employment / annuity', investments: 'Interest or investments', medical: 'Medical scheme or qualifying expenses', retirement: 'Retirement fund', travel: 'Business travel / employer vehicle', donations: 'Donation deduction', business: 'Rental / freelance / business', capital: 'Capital disposals', homeOffice: 'Home office' }[id]!)), { salary: 'yes', investments: 'no', medical: 'yes', retirement: 'no', travel: 'no', donations: 'no', business: 'no', capital: 'no', homeOffice: 'no' }, 'Situation-based document checklist. Keep documents outside Joff and submit only what SARS requests.'), mode: 'tracker', yearPolicy: 'assessmentTable' },
    { ...def('where-is-my-sars-refund', 'Where is my SARS refund?', 'Deadlines and documents', 'guide', [q('assessed', 'Has SARS completed an assessment / ITA34?'), { ...when(m('refund', 'Refund shown on the assessment, if known'), 'assessed', 'yes'), required: false }, when(q('bank', 'Banking verification or incorrect banking details?'), 'assessed', 'yes'), when(q('verification', 'Return verification / supporting documents requested?'), 'assessed', 'yes'), when(q('audit', 'Audit or multiple years under verification?'), 'assessed', 'yes'), when(q('debt', 'Outstanding returns or SARS debt?'), 'assessed', 'yes'), when(q('paymentDate', 'Does the official SARS status show a payment date?'), 'assessed', 'yes')], { assessed: 'no', refund: '0', bank: 'no', verification: 'no', audit: 'no', debt: 'no', paymentDate: 'no' }, 'Self-reported next-step guide. Check actual SARS status; no live tracking, access credentials or promised payment date.', false), mode: 'tracker' },
];
const source = (title: string, url: string) => ({ title, url });
const rates = source('SARS individual rates', 'https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/');
const money = (label: string, value: number): Item => ({ label, value, format: 'currency' }), num = (label: string, value: number): Item => ({ label, value, format: 'number' }), text = (label: string, value: string): Item => ({ label, value, format: 'text' });
const round = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;
function normal(y: AssessmentYear, a: Inputs, v: number) { return salaryTax(y, v, a.age as Exclude<AgeBand, ''>, 0).liability; }
function projection(a: Inputs) { const periods = a.frequency === 'monthly' ? 12 : 1, count = Number(a.years) * periods, r = Math.pow(1 + Number(a.growth) / 100, 1 / periods) - 1, power = Math.pow(1 + r, count), payment = Number(a.payment); const future = Number(a.opening) * power + (r === 0 ? payment * count : payment * (power - 1) / r) * (a.timing === 'begin' ? 1 + r : 1); return { future, principal: Number(a.opening) + payment * count, real: future / Math.pow(1 + Number(a.inflation) / 100, Number(a.years)) }; }
export function evaluatePersonal(def: Def, year: AssessmentYear, a: Inputs): Outcome | null {
    if (!PERSONAL_DEFINITIONS.some(d => d.id === def.id))
        return null;
    const id = def.id, n = (k: string) => Number(a[k]), visibleFields = def.fields.filter(f => !f.visibleWhen || f.visibleWhen.values.includes(a[f.visibleWhen.field]));
    const out: Outcome = { status: 'supported', resultKind: def.resultKind, comparisonKey: def.comparisonKey, items: [], blockers: [], assumptions: ['User-entered facts are not verified documents or a legal entitlement determination.'], provenance: { version: `za-${id}-${def.yearSensitive ? year : 'checked-20261007'}-v1`, checked: '7 October 2026', period: def.yearSensitive ? `${RULES[year].start} to ${RULES[year].end}` : 'Rule / financial scenario checked 7 October 2026', sources: [] } };
    const need = (key: string, value = 'yes') => { if (a[key] !== value)
        out.blockers.push(`${def.fields.find(f => f.id === key)?.label}: clarify or obtain separate review.`); };
    const invalid = (message: string): Outcome => ({ ...out, status: 'invalid', items: [], blockers: [message] });
    if (visibleFields.some(f => f.id === 'resident'))
        need('resident');
    if (visibleFields.some(f => f.id === 'simple'))
        need('simple');
    if (['capital-gains-tax', 'crypto-tax', 'provisional-tax', 'donations-tax', 'medical-aid-credits'].includes(id) && year === 2027)
        out.assumptions.push('2027 current SARS-published rates / uplifted limits are subject to legislation and final assessment where proposed.');
    if (id === 'hourly-to-salary') {
        out.comparisonKey = `hourly-${a.mode}`;
        if (a.mode === 'payrollPeriod') {
            need('periodScope');
            if (n('workedPeriods') > n('fullPeriods'))
                return invalid('Worked pay periods cannot exceed full-year pay periods.');
            const equivalent = n('periodPay') * n('fullPeriods') / n('workedPeriods');
            if (equivalent > 100000000)
                return invalid('Annualised remuneration exceeds the scenario limit.');
            const annualTax = normal(year, a, equivalent), withholding = annualTax * n('workedPeriods') / n('fullPeriods'), actual = normal(year, a, n('periodPay'));
            out.resultKind = 'componentTax';
            out.items = [money('Annual-equivalent ordinary remuneration', equivalent), money('Annual-equivalent normal tax', annualTax), money('Prorated worked-period withholding illustration', withholding), money('Actual annual assessment if only the entered period remuneration exists', actual)];
            out.assumptions.push('Full ordinary pay periods only. Employer-table rounding may differ. Annualised withholding is not final annual liability; actual income is not annualised again for the assessment.');
        }
        else {
            const annual = n('hourly') * n('hours') * n('weeks');
            if (annual > 100000000)
                return invalid('Converted annual amount exceeds the scenario limit.');
            out.items = [money('Annual gross pay equivalent', annual), money('Monthly gross pay equivalent', annual / 12), num('Paid hours in the entered year', n('hours') * n('weeks'))];
            if (a.mode === 'annualNet') {
                if (a.uifEligible === 'unsure')
                    out.blockers.push('Clarify UIF eligibility.');
                if (a.levelYear === 'unsure')
                    out.blockers.push('Clarify equal-month remuneration.');
                if (a.uifEligible === 'yes' && a.levelYear !== 'yes')
                    out.blockers.push('UIF on the monthly equivalent requires a confirmed equal twelve-month scenario; use the actual-period UIF records separately.');
                const tax = normal(year, a, annual), contribution = a.uifEligible === 'yes' ? .01 * Math.min(annual / 12, 17712) * 12 : 0;
                out.items.push(money('Estimated actual annual normal tax', tax), money('Annual employee UIF in the stated model', contribution), money('Annual net illustration', annual - tax - contribution), money('Monthly net equivalent, not an actual payslip', (annual - tax - contribution) / 12));
            }
            out.assumptions.push('Paid hours and weeks are your explicit schedule. Annual/12 is a monthly equivalent, not proof of monthly payment, leave or overtime.');
        }
        out.provenance.sources = a.mode === 'gross' ? [] : [rates, source('SARS employer annualisation guide', 'https://www.sars.gov.za/guide-for-employers-in-respect-of-employees-tax-2027/')];
        if (a.mode === 'gross')
            out.provenance.period = 'Arithmetic hourly schedule; not a tax assessment period';
        else if (year === 2027)
            out.assumptions.push('2027 normal-tax rates are a full-year SARS-published forecast, subject to legislation and final assessment.');
    }
    if (id === 'capital-gains-tax' || id === 'crypto-tax') {
        if (id === 'crypto-tax') {
            need('classificationKnown');
            if (a.classification === 'unsure')
                out.blockers.push('Capital versus revenue classification is unknown; collect complete transaction/cost records and obtain classification review.');
        }
        out.provenance.sources = [rates, source('SARS capital gains annual exclusion', 'https://www.sars.gov.za/types-of-tax/capital-gains-tax/proceeds/calculation-of-taxable-capital-gains-and-assessed-capital-losses/annual-exclusion/'), source('SARS crypto assets', 'https://www.sars.gov.za/individuals/crypto-assets-tax/')];
        let added = 0;
        if (id === 'capital-gains-tax' || a.classification === 'capital') {
            need('capitalKnown');
            need('ordinaryAsset');
            const exclusion = year === 2026 ? 40000 : 50000, current = n('gains') - n('losses'), after = current >= 0 ? Math.max(0, current - exclusion) : -Math.max(0, -current - exclusion), net = Math.max(0, after - n('priorLoss')), carried = after < 0 ? n('priorLoss') - after : Math.max(0, n('priorLoss') - after);
            added = net * .4;
            out.items = [money('Current recognised net capital gain / loss', current), money('Annual exclusion applied to current magnitude', Math.min(Math.abs(current), exclusion)), money('Capital amount after current exclusion', after), money('Remaining assessed capital loss', carried), money('Taxable capital-gain inclusion', added)];
            out.assumptions.push('Annual exclusion applies before prior assessed loss; it does not consume old loss against a fully excluded current gain. Ordinary assets only, no special relief or valuation/classification uncertainty.');
        }
        else if (a.classification === 'revenue') {
            added = n('tradingProfit');
            out.items = [money('Established taxable trading-profit increment', added)];
            out.assumptions.push('No revenue-loss salary offset or automatic classification.');
        }
        if (n('income') + added > 100000000)
            return invalid('Combined ordinary income and inclusion exceed the scenario limit.');
        out.items.push(money('Incremental annual normal tax', round(normal(year, a, n('income') + added) - normal(year, a, n('income')))));
    }
    if (id === 'donations-tax') {
        need('standardGift');
        out.provenance.sources = [source('SARS donations tax', 'https://www.sars.gov.za/types-of-tax/donations-tax/')];
        const cap = year === 2026 ? 100000 : 150000;
        if (n('priorTaxableGifts') < Math.max(0, n('priorYearGifts') - cap))
            out.blockers.push('Cumulative taxable gifts cannot be below the taxable prior same-year gifts; reconcile complete gift history.');
        const remaining = Math.max(0, cap - n('priorYearGifts')), taxable = Math.max(0, n('gift') - remaining), cumulative = n('priorTaxableGifts');
        if (cumulative + taxable > 100000000)
            return invalid('Cumulative taxable gifts exceed the scenario limit.');
        const graduated = (v: number) => Math.min(v, 30000000) * .2 + Math.max(0, v - 30000000) * .25;
        out.items = [money('Annual exemption remaining before this gift', remaining), money('Taxable portion of current gift', taxable), money('Donor donations tax on this event', graduated(cumulative + taxable) - graduated(cumulative))];
        out.assumptions.push('Resident natural-person donor with complete prior gift facts; no full exemption. This is separate from section 18A donation deductibility.');
    }
    if ((id === 'retirement-savings' || id === 'tfsa-calculator') && a.mode === 'growth') {
        const p = projection(a);
        if (!Number.isFinite(p.future) || Math.abs(p.future) > 1000000000000)
            return invalid('Projection exceeds the finite R1 trillion scenario limit.');
        out.resultKind = 'projection';
        out.comparisonKey = `${id}-growth-${a.frequency}-${a.timing}`;
        out.provenance.period = `${a.years}-year nominal financial projection`;
        out.provenance.version = 'effective-rate-periodic-contribution-projection-v1';
        out.items = [money('Projected nominal investment balance', p.future), money('Starting balance plus contributions', p.principal), money('Assumed investment growth', p.future - p.principal), money('Projected balance in starting-year purchasing power', p.real)];
        out.assumptions.push(`Effective annual growth converted consistently to ${a.frequency} periods; contributions at period ${a.timing}. Inflation uses entered annual rate.`, 'Returns are assumptions, not promises. Fees and tax are excluded; future contribution/tax rules are not projected.');
        return out;
    }
    if (id === 'tfsa-calculator') {
        need('historyKnown');
        out.provenance.sources = [source('SARS tax-free investments', 'https://www.sars.gov.za/types-of-tax/personal-income-tax/tax-free-investments/')];
        const cap = year === 2026 ? 36000 : 46000, annualExcess = Math.max(0, n('annual') - cap), lifetimeExcess = Math.max(0, n('lifetime') + n('annual') - 500000);
        out.comparisonKey = 'tfsa-headroom';
        out.items = [money('Annual contribution headroom', Math.max(0, cap - n('annual'))), money('Lifetime contribution headroom', Math.max(0, 500000 - n('lifetime') - n('annual'))), money('Current annual contribution excess', annualExcess), money('Lifetime contribution excess', lifetimeExcess)];
        if (lifetimeExcess > 0 || n('lifetime') > 500000) {
            out.items.push(text('Tax estimate unavailable', 'Lifetime breach requires complete historic cap/penalty review; no combined excess tax is calculated.'));
        }
        else
            out.items.push(money('Annual-only excess-tax illustration', annualExcess * .4));
        out.assumptions.push('Contributions across all providers, not account balances. Withdrawals do not restore allowances; unused annual allowance is lost; qualifying transfers are not new contributions.');
        if (year === 2027)
            out.assumptions.push('SARS-published R46,000 annual limit, subject to final legislation where proposed.');
    }
    if (id === 'provisional-tax') {
        out.provenance.sources = [rates, source('SARS provisional tax guide', 'https://www.sars.gov.za/guide-to-provisional-tax/')];
        out.comparisonKey = `provisional-${a.period}`;
        if (a.period === 'basic') {
            need('assessmentKnown');
            if (a.oldAssessment === 'unsure')
                out.blockers.push('Clarify assessment age.');
            if (a.oldAssessment === 'yes' && n('elapsedYears') === 0)
                out.blockers.push('An assessment older than 18 months needs a positive confirmed applicable uplift-year count.');
            if (a.oldAssessment === 'no' && n('elapsedYears') !== 0)
                out.blockers.push('Uplift-year count conflicts with an assessment not older than 18 months.');
            const basic = n('assessed') * (a.oldAssessment === 'yes' ? 1 + .08 * n('elapsedYears') : 1);
            out.items = [money('Illustrative basic amount', basic)];
            out.assumptions.push('Adjusted assessed taxable income after statutory exclusions; exact applicable elapsed years confirmed. Uplift is linear 8% per year, not compound.');
        }
        else {
            need('creditsKnown');
            const liability = normal(year, a, n('income')), remaining = a.period === 'first' ? Math.max(0, liability / 2 - n('credits')) : Math.max(0, liability - n('credits') - n('firstPaid'));
            out.items = [money('Estimated annual normal liability', liability), money('Applicable nonoverlapping PAYE / credits', n('credits')), money('Provisional instalment planning amount', remaining)];
            if (a.period === 'second')
                out.items.push(money('Actual first provisional payment', n('firstPaid')));
            out.assumptions.push('First credits mean first-period credits; second credits mean annual credits excluding separately entered first provisional payment. A negative difference does not create a refund.');
        }
        out.assumptions.push('Not a completed IRP6, penalty-safe minimum, SARS status or filing obligation determination.');
    }
    if (id === 'am-i-a-provisional-taxpayer') {
        need('natural');
        need('commissionerNotice', 'no');
        need('onlySpecified');
        if (a.otherIncome === 'no' && n('specified') > 0)
            out.blockers.push('Positive specified income conflicts with the no-other-income answer.');
        if (a.employerRegistered === 'no' && a.otherIncome === 'no' && n('taxableTotal') > 0)
            out.blockers.push('Positive taxable income needs its registered or additional income sources identified.');
        for (const key of ['business', 'employerRegistered', 'otherIncome'])
            if (a[key] === 'unsure')
                out.blockers.push(`Clarify ${def.fields.find(f => f.id === key)?.label}.`);
        if (n('specified') > n('taxableTotal'))
            return invalid('Specified taxable aggregate cannot exceed complete taxable income.');
        out.provenance.sources = [source('SARS provisional tax', 'https://www.sars.gov.za/types-of-tax/provisional-tax/')];
        const threshold = year === 2026 ? (a.age === 'under65' ? 95750 : a.age === '65to74' ? 148217 : 165689) : (a.age === 'under65' ? 99000 : a.age === '65to74' ? 153250 : 171300);
        let guidance = 'Provisional-tax review indicated; confirm all statutory exclusions and income categories with SARS or a practitioner.';
        if (a.business === 'no' && (n('taxableTotal') <= threshold || n('specified') <= 30000))
            guidance = 'The stated no-business exclusion may apply. Confirm the complete taxable aggregate and all exclusions; this does not decide whether an ITR12 must be filed.';
        if (a.business === 'no' && a.employerRegistered === 'yes' && a.otherIncome === 'no')
            guidance = 'Ordinary remuneration from a registered employer alone does not ordinarily make you provisional. This does not establish an annual-return filing obligation.';
        out.items = [text('Conditional screening outcome', guidance), money('Specified taxable aggregate used', n('specified')), money('Age-based taxable-income threshold', threshold)];
        out.assumptions.push('Conditional natural-person guide. The R30,000 aggregate uses taxable components, not gross receipts. Company/special exclusions are not determined.');
    }
    if (id === 'medical-aid-credits') {
        for (const k of ['solePayer', 'reconciled', 'expensesKnown', 'knownMonths', 'incomeKnown'])
            need(k);
        need('disability', 'no');
        if (a.registered !== 'noScheme')
            need('registered');
        out.provenance.sources = [rates, source('SARS additional medical credit', 'https://www.sars.gov.za/types-of-tax/personal-income-tax/additional-medical-expenses-tax-credit/'), source('SARS medical scheme credits', 'https://www.sars.gov.za/types-of-tax/personal-income-tax/medical-credits/')];
        if (!/^\d+(,\d+){11}$/.test(a.months))
            return invalid('Complete all twelve monthly covered-person counts.');
        const counts = a.months.split(',').map(Number);
        if (counts.some(v => v > 20))
            return invalid('Each monthly count must be an integer from 0 to 20.');
        if ((n('fees') === 0 && counts.some(v => v > 0)) || (n('fees') > 0 && counts.every(v => v === 0)))
            out.blockers.push('Scheme fees and eligible month counts conflict.');
        if (a.registered === 'noScheme' && (n('fees') !== 0 || counts.some(v => v !== 0)))
            out.blockers.push('Affirmative no-scheme selection requires zero scheme fees and zero covered-person months; positive or uncertain scheme facts need reconciliation.');
        const r = salaryTax(year, n('income'), a.age as Exclude<AgeBand, ''>, 0, 0, n('fees'), counts), M = r.medicalCredit, F = n('fees'), E = n('expenses'), T = n('income'), A = a.age === 'under65' ? .25 * Math.max(0, Math.max(0, F - 4 * M) + E - .075 * T) : .333 * (Math.max(0, F - 3 * M) + E), before = normal(year, a, T);
        out.items = [money('Annual medical scheme credit (MTC)', M), money('Additional medical credit (AMTC)', A), money('Credits applied against normal tax', Math.min(before, M + A)), money('Normal tax after these credits', round(Math.max(0, before - M - A)))];
        out.assumptions.push('Known qualifying paid unreimbursed E; no disability/impairment uncertainty or shared payer. Normal liability floors at zero, unused credits are not cash. Saved preparation remains E=0-only.');
    }
    if (id === 'retirement-savings') {
        // Delegate only the approved tax-saving inputs, never projection inputs.
        // Evaluation uses the shared deterministic tax formula, with the same gates.
        for (const key of ['resident', 'simple', 'reconciled', 'currentOnly'])
            need(key);
        need('carryovers', 'no');
        need('withdrawals', 'no');
        const r = salaryTax(year, n('income'), a.age as Exclude<AgeBand, ''>, 0, n('contributions')), before = normal(year, a, n('income'));
        out.comparisonKey = 'retirement-contribution-tax';
        out.provenance.sources = [rates, source('SARS section 11F', 'https://www.sars.gov.za/latest-news/retirement-fund-contribution-deductions-section-11f2a/')];
        out.items = [money('Pre-section-11F employment income', n('income')), money('Eligible current-year contributions', n('contributions')), money('Allowed deduction', r.retirementDeduction), money('Contribution not deducted in this estimate', r.retirementNotDeducted), money('Taxable income after deduction', r.taxableIncome), money('Annual normal tax before contribution', before), money('Annual normal tax after contribution', r.liability), money('Estimated contribution tax saving', round(before - r.liability))];
        out.assumptions.push('Single ordinary salary, reconciled pre-deduction bases and contributions counted once. No prior excess/withdrawals/transfers or double deduction. Excess not deducted here; no future carry-forward entitlement.');
        if (year === 2027)
            out.assumptions.push('2027 SARS-published ordinary rates and R430,000 cap are subject to legislation and final assessment.');
    }
    if (id === 'uif') {
        need('eligible');
        out.comparisonKey = `uif-${a.mode}`;
        out.provenance.sources = [source('Department UIF calculation guide', 'https://www.labour.gov.za/DocumentCenter/Publications/Unemployment%20Insurance%20Fund/EASY%20AID%20Guide%20Spreadsheet%20Application.pdf'), source('Department UIF rights guide', 'https://www.labour.gov.za/DocumentCenter/Publications/Unemployment%20Insurance%20Fund/KNOW%20YOUR%20UIF%20RIGHTS%202022.pdf'), source('Current official benefit routing', 'https://ufiling.labour.gov.za/uif/')];
        const daily = Math.min(n('monthly'), 17712) * 12 / 365;
        if (a.mode !== 'contributions' && a.history === 'yes') {
            for (const k of ['requestedDays', a.mode === 'unemployment' ? 'contributingDays' : 'availableDays'])
                if (a[k] === undefined || a[k] === '')
                    out.blockers.push(`Establish ${def.fields.find(f => f.id === k)?.label}; unknown is not zero.`);
        }
        if (a.mode === 'contributions') {
            const c = Math.min(n('monthly'), 17712) * .01;
            out.items = [money('Monthly employee UIF', c), money('Monthly employer UIF', c), money('Combined monthly contributions', c * 2)];
        }
        else if (a.mode === 'unemployment') {
            need('history');
            const irr = Math.max(38, Math.min(60, 29.2 + 7173.92 / (232.92 + daily))), credits = Math.min(365, Math.floor(n('contributingDays') / 4)), days = Math.min(n('requestedDays'), credits), first = Math.min(days, 238), tail = Math.max(0, days - 238), total = first * daily * irr / 100 + tail * daily * .2;
            out.items = [money('First-tier daily benefit illustration', daily * irr / 100), money('Late-tier daily benefit illustration', daily * .2), num('Estimated available credit days', credits), num('Illustrated payable days', days), money('Estimated benefit for these known days', total)];
            out.assumptions.push('One credit per four completed contributing days, capped at 365; first 238 payable days at the IRR then 20%. Complete four-year history/no prior claims asserted; Department decides actual eligibility and credits.');
        }
        else {
            need('history');
            need(a.mode === 'illness' ? 'certified' : 'employment13');
            if (n('leavePay') > n('monthly'))
                return invalid('Leave pay cannot exceed normal monthly remuneration in this supported top-up model.');
            if (a.mode === 'illness' && a.requestedDays !== undefined && a.requestedDays !== '' && n('requestedDays') < 7)
                out.blockers.push('Illness requires the seven-day minimum and certification review.');
            const shortfall = Math.max(0, (n('monthly') - n('leavePay')) * 12 / 365), irr = Math.max(38, Math.min(60, 29.2 + 7173.92 / (232.92 + daily))), dayAmount = Math.min((a.mode === 'illness' ? irr / 100 : .66) * daily, shortfall), lateAmount = Math.min(.2 * daily, shortfall), days = Math.min(n('requestedDays'), n('availableDays'), a.mode === 'maternity' ? 121 : 365), total = a.mode === 'illness' ? Math.min(days, 238) * dayAmount + Math.max(0, days - 238) * lateAmount : days * dayAmount;
            out.items = [money('Illustrative daily wage-shortfall top-up', dayAmount), ...(a.mode === 'illness' ? [money('Late-tier daily illness component', lateAmount)] : []), num('Known eligible days used', days), money('Estimated benefit for these known days', total)];
            out.assumptions.push(a.mode === 'illness' ? 'Binding Act illness rate: first 238 days at the IRR, remaining at 20%, both capped by uncapped wage shortfall. At least 7 days, certification, known credit balance and no prior relevant claims asserted.' : 'Maternity: 66% of capped daily pay limited by uncapped wage shortfall; maximum 121 days and 13-week employment screening. No 20% late-tier rate applies to maternity.');
            out.provenance.sources.push(source('UIF Amendment Act, statutory illness/maternity distinction', 'https://www.gov.za/sites/default/files/gcis_document/201701/a10of2016unemploymentinsuranceamendact.pdf'));
        }
        if (a.mode === 'illness') {
            const act = source('Binding UIF Amendment Act: illness IRR  / 20% versus maternity 66%', 'https://www.gov.za/sites/default/files/gcis_document/201701/a10of2016unemploymentinsuranceamendact.pdf');
            out.provenance.sources = [act, ...out.provenance.sources.filter(x => !x.url.includes('KNOW%20YOUR') && !x.url.includes('a10of2016'))];
        }
        out.assumptions.push('This is not a UIF claim, entitlement decision, actual credit ledger or payment guarantee. Check current official claim route.');
    }
    if (id === 'tax-deadlines') {
        const filing = 'https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/', provisional = 'https://www.sars.gov.za/faq/faq-when-must-provisional-tax-be-paid/';
        out.provenance.sources = [source('SARS filing season', filing), source('SARS provisional payment rule', provisional)];
        out.provenance.period = `2026 filing season; selected assessment year ${year}`;
        const events: {
            title: string;
            date: string;
            sourceUrl: string;
            category: string;
        }[] = [];
        if (year === 2026) {
            if (a.category === 'nonprovisional' || a.category === 'provisional') {
                events.push({ title: '2026 individual ITR12 opens (if required)', date: '2026-07-13', sourceUrl: filing, category: a.category });
                out.items.push(text('2026 auto-assessment notices', '1–12 July 2026; review the assessment, and no return may be needed if it is correct.'));
            }
            if (a.category === 'nonprovisional')
                events.push({ title: '2026 non-provisional ITR12 filing closes (if required)', date: '2026-10-23', sourceUrl: filing, category: a.category });
            if (a.category === 'provisional')
                events.push({ title: '2026 provisional individual ITR12 filing closes (if required)', date: '2027-01-22', sourceUrl: filing, category: a.category }, { title: '2026 optional provisional top-up payment', date: '2026-09-30', sourceUrl: provisional, category: a.category });
            if (a.category === 'trust')
                events.push({ title: '2026 trust ITR12T opens', date: '2026-09-19', sourceUrl: filing, category: a.category }, { title: '2026 trust ITR12T filing closes', date: '2027-01-22', sourceUrl: filing, category: a.category });
        }
        if (a.category === 'employer')
            events.push({ title: 'Employer interim EMP501 opens (March–August 2026)', date: '2026-09-21', sourceUrl: 'https://www.sars.gov.za/types-of-tax/pay-as-you-earn/', category: a.category }, { title: 'Employer interim EMP501 closes', date: '2026-10-31', sourceUrl: 'https://www.sars.gov.za/types-of-tax/pay-as-you-earn/', category: a.category });
        if (a.category === 'provisional') {
            events.push({ title: '2027 first IRP6 return/payment, February year-end', date: '2026-08-31', sourceUrl: provisional, category: a.category });
            out.items.push(text('2027 second IRP6 period / payment rule', 'Period end 28 February 2027; derived preceding-business-day payment date 26 February 2027. Operational notice must be checked; this derived date is not exported as a confirmed reminder.'));
        }
        if (year === 2027 && a.category === 'provisional')
            events.push({ title: '2026 provisional individual ITR12 filing closes (if required)', date: '2027-01-22', sourceUrl: filing, category: a.category });
        if (year === 2027 && a.category !== 'employer')
            out.items.push(text('2027 ITR12 / ITR12T filing season', 'No filing-season deadline was published in the reviewed sources. Do not carry forward 2026 dates.'));
        out.items.push(...events.map(e => text(e.title, `${e.date} · ${e.date < a.today ? 'Elapsed' : 'Upcoming / current'} · ${e.category}`)));
        out.calendarEvents = events;
        out.assumptions.push('Calendar dates are date-only for voluntary import, not scheduled reminders. Correct auto-assessments require review and may need no return; filing applicability remains separate. Company/non-February provisional periods are excluded.');
    }
    if (id === 'tax-return-documents') {
        out.provenance.sources = [source('SARS ITR12 supporting material', 'https://www.sars.gov.za/individuals/how-do-i-send-sars-my-return/how-to-submit-an-income-tax-return-itr12-in-respect-of-individuals/'), source('SARS record retention', 'https://www.sars.gov.za/client-segments/record-keeping/')];
        const records = new Map<string, string>([['SARS assessment / correspondence', 'Check prefilled data and the actual SARS notice; keep records outside Joff.']]);
        const entries: Record<string, [
            string,
            string
        ][]> = { salary: [['Employment / fund IRP5 or IT3(a)', 'Each employer/fund for this assessment year.']], investments: [['Interest / dividend IT3(b) and foreign certificates', 'Keep annual taxable/exempt components and transaction records.']], medical: [['Medical scheme tax certificate', 'Covered-person months and contributions.'], ['Qualifying unreimbursed expense evidence', 'Invoices, receipts and proof of payment; ITR-DD confirmation if relevant, outside Joff.']], retirement: [['Retirement contribution certificates', 'Current employee/employer contributions counted once.'], ['Lump-sum and directive records', 'Complete relevant benefit history.']], travel: [['Travel logbook and vehicle / allowance records', 'Business excludes commute; actual-cost evidence if relevant.']], donations: [['Section 18A donation receipt', 'Approved organisation receipt for any claimed income-tax deduction.']], business: [['Rental / trade income and expense records', 'Invoices, statements and qualifying cost evidence.']], capital: [['Capital disposal and cost records', 'Full recognised gain/loss history and assessed loss.']], homeOffice: [['Home-office evidence', 'Employer letter, floor plan, exclusively equipped room, duties/workdays, invoices and apportionment.']] };
        for (const key of Object.keys(entries)) {
            if (a[key] === 'yes' || a[key] === 'unsure')
                for (const [title, detail] of entries[key])
                    records.set(title, detail);
            if (a[key] === 'unsure')
                out.assumptions.push(`Clarify ${def.fields.find(f => f.id === key)?.label}; suggested evidence is precautionary.`);
        }
        out.items = Array.from(records, ([label, value]) => text(label, value));
        out.assumptions.push('Usually keep supporting evidence rather than attach every document to an ITR12. Submit only SARS-requested items via official routes; generally retain at least five years from submission and longer for open audit/objection. No upload or identity details collected.');
    }
    if (id === 'where-is-my-sars-refund') {
        out.provenance.sources = [source('SARS actual refund-status instructions', 'https://www.sars.gov.za/latest-news/how-to-check-your-tax-refund-status/'), source('SARS when the 72-hour target starts', 'https://www.sars.gov.za/faq/if-im-getting-a-refund-when-does-the-72-hours-start/'), source('SARS SOQS', 'https://www.sars.gov.za/guide-to-the-sars-online-query-system-soqs/')];
        let action = 'Check actual Refund Status / ITA34 through SARS MobiApp, eFiling or SOQS.';
        if (a.assessed !== 'yes')
            action += ' No 72-hour countdown starts merely because you submitted a return; assessment must be completed.';
        else if (a.refund === undefined || a.refund === '')
            action = 'Check the assessed amount in the actual ITA34 / statement; an unknown amount is not a zero refund and no timeframe is inferred.';
        else if (n('refund') < 100)
            action = 'Check the ITA34 and Income Tax Statement of Account. Credits below R100 generally roll forward; do not treat this as a late payout.';
        else if (['bank', 'verification', 'audit', 'debt'].some(k => a[k] === 'yes' || a[k] === 'unsure'))
            action = 'Read the SARS case/correspondence and resolve banking, requested evidence, audit, debt or outstanding-return issues through the official channel. Any verification/audit service clock depends on complete requested material; no payout date is inferred.';
        else if (n('refund') === 100)
            action = 'At exactly R100, check the official refund status / statement and payment date; do not rely on an unqualified timeframe.';
        else if (a.paymentDate === 'yes')
            action = 'Check the payment date in the actual SARS statement/status and your bank. Joff has not retrieved or verified that status.';
        else
            action = 'SARS has a conditional 72-hour service target after completed assessment, not a guarantee. Check official status / statement and use SOQS or the Contact Centre if unclear.';
        out.items = [text('Primary next action', action), text('Where to check', 'SARS MobiApp Refund Status, eFiling statement, official SOQS; enter identity details only in SARS’s own channel.')];
        out.assumptions.push('Entirely self-reported guidance, not live tracking. No credentials, diagnosis, ID or bank details collected; no refund promise or payout countdown.');
    }
    if (out.blockers.length) {
        const dailyOnly = id === 'uif' && a.mode !== 'contributions' && a.eligible === 'yes' && a.history !== 'yes' && out.blockers.length === 1;
        return { ...out, status: 'blocked', items: dailyOnly ? out.items.filter(i => i.label.includes('daily')) : [] };
    }
    if (out.items.some(i => typeof i.value === 'number' && !Number.isFinite(i.value)))
        return invalid('The input combination cannot produce a finite result.');
    return out;
}

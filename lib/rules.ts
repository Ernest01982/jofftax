export type AssessmentYear = 2026 | 2027;
export type AgeBand = '' | 'under65' | '65to74' | '75plus';
export const SOURCES = [
  { title: 'Individual income tax rates and rebates', url: 'https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/', purpose: 'Annual brackets and age rebates' },
  { title: 'Enacted 2026 rates: Act 3 of 2026', url: 'https://www.sars.gov.za/wp-content/uploads/Legal/AmendActs/Legal-LPrim-AA-2026-01-Rates-and-Monetary-Amounts-and-Amendment-of-Revenue-Laws-Act-3-of-2026-GG-54446-1-April-2026.pdf', purpose: 'Schedule I applies from 1 March 2025' },
  { title: 'Tax years', url: 'https://www.sars.gov.za/tax-rates/', purpose: 'Assessment periods' },
  { title: '2026 filing season', url: 'https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/', purpose: 'Filing categories and published dates' },
  { title: 'How auto-assessment works', url: 'https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/how-does-auto-assessment-work/', purpose: 'Check facts and correct missing information' },
  { title: 'Medical tax credits', url: 'https://www.sars.gov.za/types-of-tax/personal-income-tax/medical-credits/', purpose: 'Medical credits require a separate supported calculation' },
  { title: 'Additional medical expenses tax credit', url: 'https://www.sars.gov.za/types-of-tax/personal-income-tax/additional-medical-expenses-tax-credit/', purpose: 'Separate premium-based AMTC formulas and limits' },
  { title: 'Retirement contribution deduction limits', url: 'https://www.sars.gov.za/latest-news/retirement-fund-contribution-deductions-section-11f2a/', purpose: 'Section 11F deduction limits and eligibility' },
  { title: 'Deemed medical contributions', url: 'https://www.sars.gov.za/faq/faq-what-is-deemed-medical-contributions/', purpose: 'Employer contributions included once as taxable benefits' },
  { title: 'Provisional tax', url: 'https://www.sars.gov.za/types-of-tax/provisional-tax/', purpose: 'Check status; side income alone does not decide it' },
  { title: '2027 employer guide', url: 'https://www.sars.gov.za/guide-for-employers-in-respect-of-employees-tax-2027/', purpose: 'Current 2027 published rates; proposal qualification' },
];
export const RULES = {
  2026: { year: 2026, start: '1 March 2025', end: '28 February 2026', version: 'za-salary-2026-v2', checked: '7 October 2026', status: 'Completed assessment year', forecast: false, brackets: [[0,0,.18],[237100,42678,.26],[370500,77362,.31],[512800,121475,.36],[673000,179147,.39],[857900,251258,.41],[1817000,644489,.45]], rebates: [17235,9444,3145] },
  2027: { year: 2027, start: '1 March 2026', end: '28 February 2027', version: 'za-salary-2027-v2', checked: '7 October 2026', status: 'In-progress forecast', forecast: true, brackets: [[0,0,.18],[245100,44118,.26],[383100,79998,.31],[530200,125599,.36],[695800,185215,.39],[887000,259783,.41],[1878600,666339,.45]], rebates: [17820,9765,3249] },
} as const;
export function period(year: AssessmentYear) { const r = RULES[year]; return `${r.start} to ${r.end}`; }
export function money(amount: number) { return new Intl.NumberFormat('en-ZA', {style:'currency',currency:'ZAR',maximumFractionDigits:2}).format(amount); }

const { join } = require('node:path');
const { emptyPreparation } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'model.js'));

// Independent values transcribed from the recorded SARS research and approved
// amendment. Expected values never read the implementation's RULES object.
const REFERENCES = {
  2026: {
    thresholds: [237100, 370500, 512800, 673000, 857900, 1817000],
    baseTax: [42678, 77362, 121475, 179147, 251258, 644489],
    rates: [.18, .26, .31, .36, .39, .41, .45],
    rebates: { under65: 17235, '65to74': 26679, '75plus': 29824 },
  },
  2027: {
    thresholds: [245100, 383100, 530200, 695800, 887000, 1878600],
    baseTax: [44118, 79998, 125599, 185215, 259783, 666339],
    rates: [.18, .26, .31, .36, .39, .41, .45],
    rebates: { under65: 17820, '65to74': 27585, '75plus': 30834 },
  },
};
const EXTENSION_FIXTURES = [
  { year: 2026, age: 'under65', x: 600000, c: 60000, f: 36000, d: 60000, t: 540000, m: 4368, a: 0, liability: 109664 },
  { year: 2026, age: '65to74', x: 600000, c: 60000, f: 36000, d: 60000, t: 540000, m: 4368, a: 7624.368, liability: 92595.63 },
  { year: 2026, age: 'under65', x: 200000, c: 0, f: 60000, d: 0, t: 200000, m: 4368, a: 6882, liability: 7515 },
  { year: 2027, age: 'under65', x: 600000, c: 60000, f: 36000, d: 60000, t: 540000, m: 4512, a: 0, liability: 106795 },
  { year: 2027, age: '65to74', x: 600000, c: 60000, f: 36000, d: 60000, t: 540000, m: 4512, a: 7480.512, liability: 89549.49 },
  { year: 2026, age: 'under65', x: 2000000, c: 500000, f: 0, d: 350000, t: 1650000, m: 0, a: 0, liability: 558784 },
  { year: 2027, age: 'under65', x: 2000000, c: 500000, f: 0, d: 430000, t: 1570000, m: 0, a: 0, liability: 521993 },
];

function supportedPreparation({ year = 2026, age = 'under65', x = 600000, c = 0, f = 0, paye = 0, months = Array(12).fill(f > 0 ? 1 : 0) } = {}) {
  const p = emptyPreparation(year);
  Object.assign(p.answers, { ageBand: age, employmentKnown: 'yes', salary: String(x), paye: String(paye), autoAssessment: 'no' });
  for (const key of Object.keys(p.answers.scope)) p.answers.scope[key] = 'no';
  p.answers.scope.retirement = c > 0 ? 'yes' : 'no';
  p.answers.scope.medical = f > 0 ? 'yes' : 'no';
  Object.assign(p.answers.extension, { fullYear: 'yes', incomeReconciled: 'yes' });
  Object.assign(p.answers.extension.retirement, { contributions: String(c), reconciled: 'yes', carryovers: 'no', withdrawalsTransfers: 'no', eligibleFunds: 'yes' });
  Object.assign(p.answers.extension.medical, { fees: String(f), registered: 'yes', payerSole: 'yes', feesReconciled: 'yes', noExpenses: 'yes', disability: 'no', entitlementKnown: 'yes', monthlyCounts: months.map(String) });
  return p;
}
module.exports = { REFERENCES, EXTENSION_FIXTURES, supportedPreparation };

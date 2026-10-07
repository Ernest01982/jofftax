const { test } = require('node:test');
const assert = require('node:assert/strict');
const { join } = require('node:path');
const { SPECIALIST_DEFINITIONS, evaluateSpecialist } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'calculator-specialists.js'));
const definition = id => SPECIALIST_DEFINITIONS.find(tool => tool.id === id);
const example = id => structuredClone(definition(id).example);
const evaluate = (id, changes = {}, year = 2026) => evaluateSpecialist(definition(id), year, { ...example(id), ...changes });
const close = (actual, expected, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from independent expected ${expected}`);
function value(out, label) { assert.equal(out.status, 'supported', JSON.stringify(out)); const item = out.items.find(item => item.label === label); assert.ok(item, `Missing ${label}`); return item.value; }
function rows(out) { assert.equal(out.status, 'supported', JSON.stringify(out)); return out.items.filter(item => /^Financial year ending/.test(item.label)); }
const rowSum = out => rows(out).reduce((sum, row) => sum + row.value, 0);

test('all six approved specialist tools have real outputs and financial-year provenance', () => {
  assert.equal(SPECIALIST_DEFINITIONS.length, 6);
  assert.equal(new Set(SPECIALIST_DEFINITIONS.map(tool => tool.id)).size, 6);
  for (const tool of SPECIALIST_DEFINITIONS) {
    const out = evaluate(tool.id);
    assert.equal(out.status, 'supported', JSON.stringify(out));
    assert.ok(out.items.length > 0 && out.provenance.sources.length > 0);
    assert.equal(tool.yearPolicy, 'financialYear');
    assert.equal(tool.yearSensitive, false);
    assert.match(out.provenance.period, /Financial year/);
    assert.match(out.provenance.version, /2026-10-07-v1$/);
    assert.deepEqual(evaluate(tool.id, {}, 2027).items, out.items, 'Selected individual year must not relabel an entered financial-year schedule.');
  }
});

test('all six specialist fixtures and blockers execute through the public catalog/evaluator', () => {
  const { CALCULATORS, evaluateCalculator } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'calculators.js'));
  for (const own of SPECIALIST_DEFINITIONS) {
    const registered = CALCULATORS.find(tool => tool.id === own.id);
    assert.ok(registered, `Missing registry entry ${own.id}`);
    assert.equal(registered.contractAvailability, 'live');
    const publicResult = evaluateCalculator(own.id, 2026, own.example);
    const directResult = evaluate(own.id);
    assert.equal(publicResult.status, 'supported', JSON.stringify(publicResult));
    assert.deepEqual(publicResult.items, directResult.items);
    assert.equal(publicResult.provenance.period, directResult.provenance.period);
    const forged = evaluateCalculator(own.id, 2026, { ...own.example, bogusOutput: '999' });
    assert.equal(forged.status, 'invalid'); assert.deepEqual(forged.items, []);
    const unknown = evaluateCalculator(own.id, 2026, { ...own.example, ordinaryYear: 'unsure' });
    assert.equal(unknown.status, 'blocked'); assert.deepEqual(unknown.items, []);
  }
});

test('employee home office allocates eligible costs once and blocks invalid eligibility/area', () => {
  const id = 'home-office-expense-calculator';
  assert.equal(value(evaluate(id), 'Illustrative premises-cost deduction'), 1200);
  assert.equal(value(evaluate(id, { months: '6' }), 'Illustrative premises-cost deduction'), 600);
  assert.equal(value(evaluate(id, { months: '6', costPeriod: 'qualifying' }), 'Illustrative premises-cost deduction'), 1200);
  assert.equal(evaluate(id, { homeArea: '0' }).status, 'invalid');
  assert.equal(evaluate(id, { officeArea: '201' }).status, 'invalid');
  for (const key of ['exclusive', 'duties', 'costsKnown', 'ordinaryYear']) {
    const out = evaluate(id, { [key]: 'no' }); assert.equal(out.status, 'blocked'); assert.deepEqual(out.items, []);
  }
});

test('11e uses verified new-asset lives, actual full-month/trade share and a capped final balance', () => {
  const id = 'wear-and-tear';
  close(value(evaluate(id), 'Full-year trade-apportioned instalment'), 4000);
  assert.deepEqual(rows(evaluate(id)).map(row => row.value), [4000, 4000, 4000]);
  assert.deepEqual(rows(evaluate(id, { tradePercent: '50' })).map(row => row.value), [2000, 2000, 2000]);
  const partial = evaluate(id, { acquired: '2025-09-01', firstUse: '2025-09-01' });
  assert.deepEqual(rows(partial).map(row => row.value), [2000, 4000, 4000, 2000]);
  close(rowSum(partial), 12000);
  const lives = [['tablet', 6000], ['furniture', 2000], ['electronicOffice', 4000], ['mechanicalOffice', 2400], ['photocopier', 2400], ['phone', 6000]];
  for (const [asset, annual] of lives) { const out = evaluate(id, { asset }); close(value(out, 'Full-year trade-apportioned instalment'), annual); close(rowSum(out), 12000); }
  for (const tradePercent of ['0', '33.33', '100']) { const out = evaluate(id, { cost: '7000', tradePercent }); close(rowSum(out), 7000 * Number(tradePercent) / 100); }
  assert.equal(evaluate(id, { firstUse: '2025-09-15' }).status, 'blocked');
  assert.equal(evaluate(id, { asset: 'unsupported' }).status, 'blocked');
  assert.equal(evaluate(id, { firstUse: '2020-03-01', acquired: '2020-03-01', yearEnd: '2021-02-28' }).status, 'blocked');
  assert.equal(evaluate(id, { acquired: '2025-04-01' }).status, 'invalid');
});

test('11e standalone election is strictly below7000 and never repeated or set-applied', () => {
  const id = 'wear-and-tear';
  const immediate = evaluate(id, { cost: '6999', method: 'small' });
  assert.equal(value(immediate, 'One-time immediate allowance in financial year ending 2026-02-28'), 6999);
  assert.equal(rows(immediate).length, 0);
  assert.equal(value(evaluate(id, { cost: '6999', method: 'small', tradePercent: '50' }), 'One-time immediate allowance in financial year ending 2026-02-28'), 3499.5);
  for (const cost of ['7000', '7000.01']) assert.equal(evaluate(id, { cost, method: 'small' }).status, 'blocked');
  assert.equal(evaluate(id, { cost: '6999', method: 'small', standalone: 'no' }).status, 'blocked');
  close(rows(evaluate(id, { cost: '7000' }))[0].value, 7000 / 3);
  assert.equal(evaluate(id, { standalone: 'no' }).status, 'supported', 'A known part-of-set answer excludes immediate election, not all ordinary selected-life schedules.');
});

test('12C new/used manufacturing schedules cap eligible cost and do not borrow11e proration', () => {
  const id = 's12c-wear-and-tear';
  assert.deepEqual(rows(evaluate(id)).map(row => row.value), [40000, 20000, 20000, 20000]);
  assert.deepEqual(rows(evaluate(id, { condition: 'used' })).map(row => row.value), [20000, 20000, 20000, 20000, 20000]);
  assert.deepEqual(rows(evaluate(id, { firstUse: '2026-02-15' })).map(row => row.value), [40000, 20000, 20000, 20000]);
  const limited = evaluate(id, { cashPrice: '80000' }); close(rowSum(limited), 80000); close(rows(limited)[0].value, 32000);
  for (const key of ['directManufacturing', 'restrictedUse', 'assetScope', 'unclaimed']) assert.equal(evaluate(id, { [key]: 'no' }).status, 'blocked');
  assert.match(evaluate(id).assumptions.join(' '), /draft-guidance/);
});

test('12E requires SBC at both dates and an explicit direct/accelerated choice without stacking', () => {
  const id = 'sbc-wear-and-tear';
  assert.deepEqual(rows(evaluate(id)).map(row => row.value), [100000]);
  assert.deepEqual(rows(evaluate(id, { assetMode: 'accelerated' })).map(row => row.value), [50000, 30000, 20000]);
  const limited = evaluate(id, { assetMode: 'accelerated', cashPrice: '90000', firstUse: '2026-02-15' });
  assert.deepEqual(rows(limited).map(row => row.value), [45000, 27000, 18000]);
  for (const key of ['sbcAcquisition', 'sbcFirstUse', 'classification', 'allTrade', 'assetScope', 'unclaimed']) assert.equal(evaluate(id, { [key]: 'no' }).status, 'blocked');
});

test('11f paid premium uses entitlement including renewals, first/last month portions and25year cap', () => {
  const id = 's11f-lease-premium-allowance';
  const twoYears = evaluate(id);
  assert.deepEqual(rows(twoYears).map(row => row.value), [5000, 10000, 5000]);
  assert.equal(value(twoYears, 'Full-year allowance run rate'), 10000); close(rowSum(twoYears), 20000);
  const thirty = evaluate(id, { premium: '100000', entitlementMonths: '360', commenced: '2025-01-01' });
  assert.equal(value(thirty, 'Full-year allowance run rate'), 4000); assert.equal(rows(thirty).length, 25); close(rowSum(thirty), 100000);
  assert.equal(evaluate(id, { commenced: '2025-07-15' }).status, 'blocked');
  assert.equal(evaluate(id, { noEarlyEnd: 'no' }).status, 'blocked');
  assert.equal(evaluate(id, { lessorIncome: 'no' }).status, 'blocked');
  assert.equal(evaluate(id, { entitlementMonths: '0' }).status, 'invalid');
  assert.equal(evaluate(id, { entitlementMonths: '24.5' }).status, 'invalid');
  assert.equal(evaluate(id, { commenced: '2024-07-01' }).status, 'invalid');
});

test('11g starts from completion, caps cost/term, gives zero atyearend and reconciles arithmetic remainder', () => {
  const id = 's11g-leasehold-improvements';
  const original = evaluate(id);
  assert.equal(rows(original)[0].value, 0); close(rows(original)[1].value, 550000 / 19); close(rowSum(original), 550000);
  assert.equal(value(original, 'Eligible allowance base'), 550000);
  const sixMonths = evaluate(id, { actual: '650000', completed: '2025-08-31', remainingMonths: '222' });
  assert.equal(value(sixMonths, 'Eligible allowance base'), 600000); close(rows(sixMonths)[0].value, 600000 / 18.5 / 2); close(rowSum(sixMonths), 600000);
  const cap = evaluate(id, { actual: '100000', limit: '100000', remainingMonths: '360', completed: '2025-02-28', yearEnd: '2025-12-31' });
  assert.equal(value(cap, 'Full-year allowance run rate'), 4000); close(rowSum(cap), 100000);
  assert.equal(evaluate(id, { completed: '2025-08-15' }).status, 'blocked');
  assert.equal(evaluate(id, { obligation: 'no' }).status, 'blocked');
  assert.equal(evaluate(id, { lessorIncome: 'no' }).status, 'blocked');
  assert.equal(evaluate(id, { remainingMonths: '0' }).status, 'invalid');
  assert.equal(evaluate(id, { completed: '2026-03-31' }).status, 'invalid');
});

test('specialist strict schema, unknown and eligibility failures never retain numeric results', () => {
  for (const tool of SPECIALIST_DEFINITIONS) {
    const bad = evaluate(tool.id, { forgedClaim: '1000' }); assert.equal(bad.status, 'invalid'); assert.deepEqual(bad.items, []);
    for (const field of tool.fields) {
      const missing = evaluate(tool.id, { [field.id]: '' }); assert.equal(missing.status, 'invalid'); assert.deepEqual(missing.items, []);
      if (field.type === 'choice') { const unsure = evaluate(tool.id, { [field.id]: 'unsure' }); assert.equal(unsure.status, 'blocked'); assert.deepEqual(unsure.items, []); }
      if (field.type === 'number') for (const badValue of ['-1', 'NaN', 'Infinity', '1e4', ' 1', '100000000001']) { const out = evaluate(tool.id, { [field.id]: badValue }); assert.equal(out.status, 'invalid'); assert.deepEqual(out.items, []); }
      if (field.type === 'date') for (const badDate of ['2026-02-30', '2026-2-01', '1999-12-31', 'nonsense']) { const out = evaluate(tool.id, { [field.id]: badDate }); assert.equal(out.status, 'invalid'); assert.deepEqual(out.items, []); }
    }
    const midEnd = evaluate(tool.id, { yearEnd: '2026-02-15' }); assert.equal(midEnd.status, 'invalid'); assert.deepEqual(midEnd.items, []);
  }
});

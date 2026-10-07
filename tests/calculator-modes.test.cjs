const { test } = require('node:test');
const assert = require('node:assert/strict');
const { join } = require('node:path');
const { CALCULATORS, evaluateCalculator, calculatorContext, calculatorFields } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'calculators.js'));
const { calculatorPack } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'calculator-presentation.js'));
const { salaryTax } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'calculation.js'));
const definition = id => CALCULATORS.find(d => d.id === id);
const item = (out, label) => out.items.find(i => i.label === label)?.value;
const growth = { mode: 'growth', opening: '10000', payment: '1000', frequency: 'monthly', timing: 'end', years: '10', growth: '6', inflation: '3' };

test('growth modes have independent term provenance, result meaning and exported periods', () => {
  for (const id of ['retirement-savings', 'tfsa-calculator']) {
    const d = definition(id), a = { ...d.example, ...growth };
    const context = calculatorContext(d, a);
    assert.equal(context.yearSensitive, false); assert.equal(context.ordinaryPeriod, false); assert.equal(context.resultKind, 'projection');
    const first = evaluateCalculator(id, 2026, a), second = evaluateCalculator(id, 2027, a);
    assert.equal(first.status, 'supported'); assert.equal(second.status, 'supported');
    assert.deepEqual(first.items, second.items); assert.deepEqual(first.provenance, second.provenance);
    const pack = calculatorPack(d, 2027, a, second, false);
    assert.equal(pack.assessmentYear, null); assert.equal(pack.ruleYear, null); assert.equal(pack.period, '10-year nominal financial projection');
    assert.equal(pack.inputs.income, undefined); assert.equal(pack.inputs.annual, undefined);
  }
  const d = definition('tfsa-calculator'), a = { ...d.example, annual: '10000', lifetime: '10000' };
  assert.equal(calculatorContext(d, a).yearSensitive, true);
  assert.equal(evaluateCalculator(d.id, 2027, a).resultKind, 'componentTax');
  assert.equal(calculatorPack(d, 2027, a, evaluateCalculator(d.id, 2027, a), false).ruleYear, 2027);
  assert.equal(item(evaluateCalculator(d.id, 2026, a), 'Annual contribution headroom'), 26000);
  assert.equal(item(evaluateCalculator(d.id, 2027, a), 'Annual contribution headroom'), 36000);
});

test('hourly gross is independent while annual-net and payroll-period modes retain tax years', () => {
  const d = definition('hourly-to-salary'), a = { ...d.example };
  const gross = evaluateCalculator(d.id, 2027, a), pack = calculatorPack(d, 2027, a, gross, false);
  assert.equal(calculatorContext(d, a).yearSensitive, false); assert.equal(pack.assessmentYear, null);
  assert.doesNotMatch(gross.provenance.version, /2027/); assert.match(pack.period, /Arithmetic hourly schedule/);
  const net = { ...a, mode: 'annualNet', age: 'under65', resident: 'yes', simple: 'yes', levelYear: 'yes', uifEligible: 'yes' };
  assert.equal(calculatorContext(d, net).ordinaryPeriod, true);
  assert.equal(evaluateCalculator(d.id, 2026, net).resultKind, 'annualLiability');
  assert.notEqual(item(evaluateCalculator(d.id, 2026, net), 'Annual net illustration'), item(evaluateCalculator(d.id, 2027, net), 'Annual net illustration'));
  const withholding = { mode: 'payrollPeriod', periodPay: '90000', fullPeriods: '12', workedPeriods: '3', age: 'under65', resident: 'yes', simple: 'yes', periodScope: 'yes' };
  assert.equal(evaluateCalculator(d.id, 2026, withholding).status, 'supported');
  assert.equal(evaluateCalculator(d.id, 2026, withholding).resultKind, 'componentTax');
  assert.equal(calculatorPack(d, 2026, withholding, evaluateCalculator(d.id, 2026, withholding), false).assessmentYear, 2026);
});

test('net raise solves an increase, with matching input labels and one-cent inverse accuracy', () => {
  const d = definition('net-to-gross');
  for (const year of [2026, 2027]) for (const unit of ['monthly', 'annual']) for (const target of ['0', '1000']) {
    const currentGross = unit === 'monthly' ? '30000' : '360000';
    const a = { ...d.example, mode: 'raise', unit, currentGross, target };
    const out = evaluateCalculator(d.id, year, a);
    assert.equal(out.status, 'supported');
    assert.ok(Math.abs(item(out, 'Recovered net raise in selected period') - Number(target)) <= .01);
    const multiplier = unit === 'monthly' ? 12 : 1;
    const annualGross = item(out, 'Annual gross equivalent');
    const expectedNet = (annualGross - salaryTax(year, annualGross, 'under65', 0).liability - Math.min(annualGross / 12, 17712) * .01 * 12) / multiplier;
    assert.ok(Math.abs(item(out, 'Recovered take-home in selected period') - expectedNet) < .000001);
    const pack = calculatorPack(d, year, a, out, false);
    assert.match(pack.inputLabels.target, /increase/);
    assert.match(calculatorFields(d, a).find(f => f.id === 'target').help, /additional net pay/);
    assert.doesNotMatch(calculatorFields(d, { ...a, mode: 'absolute' }).find(f => f.id === 'target').label, /increase/);
  }
});

test('blank active required inputs produce navigable invalid errors and unknown facts remain blocked', () => {
  for (const d of CALCULATORS.filter(d => d.contractAvailability === 'live')) {
    const out = evaluateCalculator(d.id, 2026, {});
    assert.equal(out.status, 'invalid', d.id); assert.deepEqual(out.items, []);
    assert.ok(Object.keys(out.fieldErrors || {}).length, d.id);
  }
  const d = definition('retirement-savings');
  const missing = evaluateCalculator(d.id, 2026, { ...growth, payment: '' });
  assert.equal(missing.status, 'invalid'); assert.ok(missing.fieldErrors.payment);
  assert.equal(missing.fieldErrors.income, undefined);
  const unknown = evaluateCalculator('income-tax', 2026, { ...definition('income-tax').example, resident: 'unsure' });
  assert.equal(unknown.status, 'blocked'); assert.deepEqual(unknown.items, []);
});

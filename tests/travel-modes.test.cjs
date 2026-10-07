const { test } = require('node:test');
const assert = require('node:assert/strict');
const { join } = require('node:path');
const { CALCULATORS, evaluateCalculator } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'calculators.js'));
const { activeCalculatorInputs, clearInactiveInputs, calculatorPack } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'calculator-presentation.js'));
const definition = CALCULATORS.find(c => c.id === 'travel-allowance');
const actual = { method: 'actual', allowance: '100000', totalKm: '20000', businessKm: '10000', actualCosts: '60000', records: 'yes' };
const value = (out, label) => out.items.find(item => item.label === label)?.value;

test('actual travel costs work without deemed-cost facts and allocate only established costs', () => {
  for (const year of [2026, 2027]) {
    const out = evaluateCalculator(definition.id, year, actual);
    assert.equal(out.status, 'supported');
    assert.equal(value(out, 'Established qualifying actual costs'), 60000);
    assert.equal(value(out, 'Business-use share'), 50);
    assert.equal(value(out, 'Business cost allocation before allowance cap'), 30000);
    assert.equal(value(out, 'Illustrative allowance deduction'), 30000);
    assert.equal(out.items.some(item => /deemed|fixed component/i.test(item.label)), false);
    assert.equal(out.assumptions.some(text => /126\.9|days\/365|borne in full/.test(text)), false);
    assert.ok(out.provenance.sources.some(source => source.url.endsWith('/travel-e-log-book/')));
    assert.equal(value(evaluateCalculator(definition.id, year, { ...actual, allowance: '20000' }), 'Illustrative allowance deduction'), 20000);
    assert.equal(value(evaluateCalculator(definition.id, year, { ...actual, actualCosts: '0' }), 'Illustrative allowance deduction'), 0);
  }
});

test('travel method switches clear and omit irrelevant fields in exported scenarios', () => {
  const dirty = { ...actual, vehicleCost: 'not a number', days: 'bad', fuelBorne: 'unsure', maintenanceBorne: 'unsure' };
  const out = evaluateCalculator(definition.id, 2026, dirty);
  assert.equal(out.status, 'supported');
  const clean = clearInactiveInputs(definition, dirty);
  const pack = calculatorPack(definition, 2026, clean, out, false);
  for (const id of ['vehicleCost', 'days', 'fuelBorne', 'maintenanceBorne']) {
    assert.equal(clean[id], '');
    assert.equal(Object.hasOwn(pack.inputs, id), false);
    assert.equal(Object.hasOwn(pack.inputLabels, id), false);
  }
  const deemed = { ...definition.example, actualCosts: 'bad' };
  assert.equal(Object.hasOwn(activeCalculatorInputs(definition, deemed), 'actualCosts'), false);
  assert.equal(evaluateCalculator(definition.id, 2026, deemed).status, 'supported');
  assert.equal(value(evaluateCalculator(definition.id, 2026, deemed), 'Illustrative allowance deduction'), 68078.5);
});

test('travel missing costs and impossible distances need correction while uncertain records remain blocked', () => {
  const missing = evaluateCalculator(definition.id, 2026, { ...actual, actualCosts: '' });
  assert.equal(missing.status, 'invalid');
  assert.ok(missing.fieldErrors.actualCosts);
  assert.deepEqual(missing.items, []);
  assert.equal(evaluateCalculator(definition.id, 2026, { ...actual, totalKm: '0' }).status, 'invalid');
  assert.equal(evaluateCalculator(definition.id, 2026, { ...actual, businessKm: '20001' }).status, 'invalid');
  assert.equal(evaluateCalculator(definition.id, 2026, { ...actual, records: 'unsure' }).status, 'blocked');
  assert.equal(evaluateCalculator(definition.id, 2026, { ...definition.example, fuelBorne: 'unsure' }).status, 'blocked');
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { join } = require('node:path');
const { CALCULATORS, evaluateCalculator } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'calculators.js'));
const { calculatorPack } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'calculator-presentation.js'));
const definition = CALCULATORS.find(c => c.id === 'wear-and-tear');

test('ordinary wear-and-tear schedule does not require standalone small-item eligibility', () => {
  for (const standalone of [undefined, '', 'no', 'unsure', 'inactive bad value']) {
    const inputs = { ...definition.example, asset: 'furniture', standalone };
    if (standalone === undefined) delete inputs.standalone;
    const out = evaluateCalculator(definition.id, 2026, inputs);
    assert.equal(out.status, 'supported');
    assert.equal(out.items.find(item => item.label === 'Full-year trade-apportioned instalment').value, 2000);
    assert.equal(Object.hasOwn(calculatorPack(definition, 2026, inputs, out, false).inputs, 'standalone'), false);
  }
});

test('small-item immediate election retains its standalone and cost eligibility gates', () => {
  const inputs = { ...definition.example, method: 'small', cost: '6999' };
  assert.equal(evaluateCalculator(definition.id, 2026, inputs).status, 'supported');
  for (const standalone of ['no', 'unsure']) assert.equal(evaluateCalculator(definition.id, 2026, { ...inputs, standalone }).status, 'blocked');
  const missing = evaluateCalculator(definition.id, 2026, { ...inputs, standalone: '' });
  assert.equal(missing.status, 'invalid');
  assert.ok(missing.fieldErrors.standalone);
  assert.equal(evaluateCalculator(definition.id, 2026, { ...inputs, cost: '7000' }).status, 'blocked');
});

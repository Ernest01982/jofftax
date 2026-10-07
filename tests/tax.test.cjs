const { test } = require('node:test');
const assert = require('node:assert/strict');
const { join } = require('node:path');
const { REFERENCES, EXTENSION_FIXTURES, supportedPreparation } = require('./fixtures.cjs');
const { salaryTax, evaluate } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'calculation.js'));
const { answersSchema, saveSchema, emptyPreparation } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'model.js'));
const { preparationPack, packText } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'export.js'));
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} differs from independent expected ${expected}`);

for (const [yearText, reference] of Object.entries(REFERENCES)) {
  const year = Number(yearText);
  for (const [i, boundary] of reference.thresholds.entries()) {
    test(`${year}: progressive tax immediately below, at, and above R${boundary}`, () => {
      for (const delta of [-.01, 0, .01, 1]) {
        const r = salaryTax(year, boundary + delta, 'under65', 0);
        close(r.bracketTax, reference.baseTax[i] + delta * reference.rates[delta > 0 ? i + 1 : i]);
        assert.equal(r.liability, Math.round((r.bracketTax - reference.rebates.under65) * 100) / 100);
        if (delta !== 0) close(r.marginalRate, reference.rates[delta > 0 ? i + 1 : i] * 100);
      }
    });
  }
  test(`${year}: all age rebates are additive and zero floor is non-refundable`, () => {
    for (const [age, rebate] of Object.entries(reference.rebates)) {
      assert.equal(salaryTax(year, 600000, age, 0).rebate, rebate);
      const zero = salaryTax(year, 0, age, 1000);
      assert.equal(zero.liability, 0);
      assert.equal(zero.effectiveRate, 0);
      assert.equal(zero.balance, -1000);
      assert.ok(Number.isFinite(zero.effectiveRate));
    }
  });
}

for (const fixture of EXTENSION_FIXTURES) {
  test(`approved independent fixture: ${fixture.year}/${fixture.age} X=${fixture.x} C=${fixture.c} F=${fixture.f}`, () => {
    const p = supportedPreparation(fixture);
    const { blockers, result } = evaluate(p);
    assert.deepEqual(blockers, []);
    assert.ok(result);
    for (const [field, expected] of Object.entries({ retirementDeduction: fixture.d, taxableIncome: fixture.t, medicalCredit: fixture.m, additionalMedicalCredit: fixture.a, liability: fixture.liability })) close(result[field], expected);
    assert.equal(preparationPack(p).estimate.liability, fixture.liability);
  });
}

test('supporting independent fixtures: 2026 ordinary deduction, 2027 premium-only AMTC, age75 zero floor', () => {
  assert.equal(evaluate(supportedPreparation({ x: 300000, c: 30000, f: 24000 })).result.liability, 29629);
  assert.equal(evaluate(supportedPreparation({ year: 2027, age: '65to74', x: 400000, f: 24000 })).result.liability, 49655.49);
  assert.equal(evaluate(supportedPreparation({ year: 2027, age: '75plus', x: 80000 })).result.liability, 0);
  assert.equal(evaluate(supportedPreparation({ age: '75plus', x: 600000, c: 60000, f: 36000 })).result.liability, 89450.63);
  assert.equal(evaluate(supportedPreparation({ year: 2027, age: '75plus', x: 600000, c: 60000, f: 36000 })).result.liability, 86300.49);
});

test('retirement zero, actual, 27.5% and annual-cap boundaries never double deduct', () => {
  for (const [x, c, d] of [[0, 50000, 0], [200000, 0, 0], [200000, 54999.99, 54999.99], [200000, 55000, 55000], [200000, 55000.01, 55000]]) {
    const r = salaryTax(2026, x, 'under65', 0, c);
    close(r.retirementDeduction, d);
    close(r.taxableIncome, x - d);
    close(r.retirementNotDeducted, c - d);
  }
  for (const [year, cap] of [[2026, 350000], [2027, 430000]]) {
    for (const delta of [-.01, 0, .01]) {
      const r = salaryTax(year, 2000000, 'under65', 0, cap + delta);
      close(r.retirementDeduction, delta < 0 ? cap + delta : cap);
      close(r.taxableIncome, delta < 0 ? 2000000 - cap - delta : 2000000 - cap);
    }
  }
});

test('medical month counts sum actual eligible months, including changing membership', () => {
  for (const [year, credits, changing] of [[2026, [0, 4368, 8736, 11688], 4860], [2027, [0, 4512, 9024, 12072], 5020]]) {
    for (let n = 0; n <= 3; n++) assert.equal(salaryTax(year, 600000, 'under65', 0, 0, n ? 36000 : 0, Array(12).fill(n)).medicalCredit, credits[n]);
    const months = [0, 0, 1, 1, 2, 2, 3, 3, 0, 0, 1, 1];
    const result = evaluate(supportedPreparation({ year, f: 36000, months })).result;
    assert.equal(result.medicalCredit, changing);
    assert.deepEqual(result.monthlyCounts, months);
  }
});

test('AMTC fee/income thresholds preserve precision and use taxable income after retirement', () => {
  const months = Array(12).fill(1);
  for (const fees of [0, 17471.99, 17472, 17472.01, 32471.99, 32472]) {
    assert.equal(salaryTax(2026, 200000, 'under65', 0, 0, fees, months).additionalMedicalCredit, 0);
  }
  close(salaryTax(2026, 200000, 'under65', 0, 0, 32472.01, months).additionalMedicalCredit, .0025);
  close(salaryTax(2026, 200000, 'under65', 0, 50000, 32472, months).additionalMedicalCredit, 937.5);
  for (const age of ['65to74', '75plus']) {
    for (const fees of [0, 13103.99, 13104]) assert.equal(salaryTax(2026, 200000, age, 0, 0, fees, months).additionalMedicalCredit, 0);
    close(salaryTax(2026, 200000, age, 0, 0, 13104.01, months).additionalMedicalCredit, .00333);
    close(salaryTax(2026, 200000, age, 0, 0, 36000, months).additionalMedicalCredit, 7624.368);
  }
  const zero = evaluate(supportedPreparation({ x: 80000, f: 100000, paye: 1000 })).result;
  assert.equal(zero.liability, 0);
  assert.equal(zero.balance, -1000, 'unused credits cannot increase a possible overpayment above entered PAYE');
});

test('every unanswered/unknown/base exclusion suppresses overall numbers in review and export', () => {
  const assertBlocked = p => {
    assert.equal(evaluate(p).result, null);
    const pack = preparationPack(p);
    assert.equal(pack.estimate, null);
    assert.ok(pack.blockers.length);
    const text = packText(p);
    assert.match(text, /Overall estimate unavailable/);
    assert.doesNotMatch(text, /Estimated annual tax:/);
  };
  assertBlocked(emptyPreparation(2026));
  for (const key of Object.keys(supportedPreparation().answers.scope)) {
    for (const value of ['', 'unsure', 'yes']) {
      const p = supportedPreparation();
      p.answers.scope[key] = value;
      assertBlocked(p);
    }
  }
  for (const [object, key] of [['answers', 'ageBand'], ['answers', 'employmentKnown'], ['answers', 'salary'], ['answers', 'paye'], ['extension', 'fullYear'], ['extension', 'incomeReconciled']]) {
    const p = supportedPreparation();
    (object === 'extension' ? p.answers.extension : p.answers)[key] = '';
    assertBlocked(p);
  }
  const old = supportedPreparation(); old.rulesVersion = 'previous-unsupported-version'; assertBlocked(old);
});

test('all applicable extension confirmations and exclusions gate the personalised result', () => {
  for (const [group, field, accepted] of [
    ['retirement', 'reconciled', 'yes'], ['retirement', 'carryovers', 'no'], ['retirement', 'withdrawalsTransfers', 'no'], ['retirement', 'eligibleFunds', 'yes'],
    ['medical', 'registered', 'yes'], ['medical', 'payerSole', 'yes'], ['medical', 'feesReconciled', 'yes'], ['medical', 'noExpenses', 'yes'], ['medical', 'disability', 'no'], ['medical', 'entitlementKnown', 'yes'],
  ]) {
    for (const value of ['', 'unsure', accepted === 'yes' ? 'no' : 'yes']) {
      const p = supportedPreparation({ c: 60000, f: 36000 });
      p.answers.extension[group][field] = value;
      assert.equal(evaluate(p).result, null, `${group}.${field}=${value}`);
      assert.equal(preparationPack(p).estimate, null);
    }
  }
  for (const mutate of [
    p => p.answers.extension.medical.monthlyCounts[5] = '',
    p => p.answers.extension.medical.monthlyCounts = Array(12).fill('0'),
    p => p.answers.extension.medical.fees = '0',
    p => p.answers.extension.retirement.contributions = '0',
  ]) { const p = supportedPreparation({ c: 60000, f: 36000 }); mutate(p); assert.equal(evaluate(p).result, null); }
});

test('a parent no-answer cannot silently discard recorded unsupported detail', () => {
  for (const [group, field, value] of [
    ['retirement', 'carryovers', 'yes'], ['retirement', 'withdrawalsTransfers', 'yes'],
    ['medical', 'noExpenses', 'no'], ['medical', 'disability', 'yes'], ['medical', 'payerSole', 'no'], ['medical', 'entitlementKnown', 'no'],
  ]) {
    const p = supportedPreparation(); p.answers.extension[group][field] = value;
    assert.equal(evaluate(p).result, null, `${group}.${field}=${value} conflicts with scope=no`);
    assert.equal(preparationPack(p).estimate, null);
  }
  for (const mutate of [p => p.answers.extension.retirement.contributions = '1', p => p.answers.extension.medical.fees = '1', p => p.answers.extension.medical.monthlyCounts[0] = '1']) {
    const p = supportedPreparation(); mutate(p); assert.equal(evaluate(p).result, null);
  }
});

test('strict schemas reject malformed amounts, months, enums, nested fields, and forged results', () => {
  for (const amount of [-1, null, Infinity, NaN, '-1', 'NaN', 'Infinity', '1e6', ' 1', '1 ', '1.001', '100000000.01', '1,000']) {
    for (const field of ['salary', 'paye']) { const p = supportedPreparation(); p.answers[field] = amount; assert.equal(answersSchema.safeParse(p.answers).success, false); }
    for (const group of ['retirement', 'medical']) { const p = supportedPreparation(); p.answers.extension[group][group === 'retirement' ? 'contributions' : 'fees'] = amount; assert.equal(answersSchema.safeParse(p.answers).success, false); }
  }
  for (const months of [[], Array(11).fill('1'), Array(13).fill('1'), Array(12).fill(1), Array(12).fill('21'), Array(12).fill('-1'), Array(12).fill('1.5'), Array(12).fill('01')]) {
    const p = supportedPreparation({ f: 36000 }); p.answers.extension.medical.monthlyCounts = months;
    assert.equal(answersSchema.safeParse(p.answers).success, false);
    assert.equal(evaluate(p).result, null);
  }
  for (const mutate of [p => p.answers.scope.otherIncome = 'false', p => p.answers.ownerId = 'victim', p => p.answers.extension.medical.expenses = '20000', p => p.answers.extension.retirement.employerAlreadyDeducted = false]) {
    const p = supportedPreparation(); mutate(p); assert.equal(answersSchema.safeParse(p.answers).success, false);
    assert.equal(evaluate(p).result, null);
  }
  const p = supportedPreparation(); const input = { id: '', year: p.year, revision: 0, rulesVersion: p.rulesVersion, answers: p.answers, checklist: {} };
  assert.equal(saveSchema.safeParse(input).success, true);
  for (const extra of [{ ownerId: 'victim' }, { result: { liability: 0 } }, { year: 2028 }, { revision: 1.5 }, { checklist: { unknown: 'ready' } }, { checklist: { employment: 'uploaded' } }]) assert.equal(saveSchema.safeParse({ ...input, ...extra }).success, false);
});

test('exports retain year/provenance, user assumptions and all extension inputs/breakdown', () => {
  const p = supportedPreparation({ year: 2027, c: 60000, f: 36000, months: [0, 0, 1, 1, 2, 2, 3, 3, 0, 0, 1, 1] });
  const pack = preparationPack(p, '2026-10-07T00:00:00.000Z');
  assert.equal(pack.assessmentYear, 2027);
  assert.equal(pack.createdAt, '2026-10-07T00:00:00.000Z');
  assert.match(pack.period, /1 March 2026.*28 February 2027/);
  assert.equal(pack.schemaVersion, 2);
  assert.equal(pack.rulesVersion, p.rulesVersion);
  assert.match(pack.assumptions.join(' '), /subject to legislation/);
  assert.doesNotMatch(pack.assumptions.join(' '), /No retirement or medical claims/);
  assert.deepEqual(pack.answers.extension.medical.monthlyCounts, p.answers.extension.medical.monthlyCounts);
  const text = packText(p);
  assert.ok(text.includes('\n'), 'text export must contain actual newlines');
  assert.match(text, /60000/);
  assert.match(text, /Medical scheme|Medical fees|medical scheme|medical fees/);
  assert.match(text, /Additional medical|additional medical|AMTC/);
});

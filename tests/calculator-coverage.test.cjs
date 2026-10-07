const { test } = require('node:test');
const assert = require('node:assert/strict');
const { join } = require('node:path');
const cases = require('./calculator-mode-cases.json');
const { evaluateCalculator } = require(join(process.env.JOFF_TEST_BUILD_DIRECTORY, 'calculators.js'));

// Expected amounts come from independently recorded fixtures and explicit
// arithmetic, not from running the evaluator to generate expected output.
// Salary inversion is rounded to cents; UIF retains raw daily precision.
for (const fixture of cases) {
  test(`mode coverage: ${fixture.name}`, () => {
    const out = evaluateCalculator(fixture.id, fixture.year, fixture.inputs);
    assert.equal(out.status, fixture.expectedStatus, JSON.stringify(out));
    const items = new Map(out.items.map(item => [item.label, item.value]));
    for (const [label, expected] of Object.entries(fixture.expectedItems || {})) {
      assert.ok(items.has(label), `Missing result: ${label}`);
      const actual = items.get(label);
      if (typeof expected === 'number') {
        assert.equal(typeof actual, 'number', label);
        const tolerance = fixture.id === 'net-to-gross' ? 0.010001 : 0.00001;
        assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} differs from independent expected ${expected}`);
      } else assert.equal(actual, expected, label);
    }
    for (const label of fixture.expectedLabels || []) assert.ok(items.has(label), `Missing guidance: ${label}`);
    for (const label of fixture.expectedAbsentItems || []) assert.ok(!items.has(label), `Unrelated component leaked: ${label}`);
    for (const [label, text] of Object.entries(fixture.expectedText || {})) {
      assert.ok(items.has(label), `Missing guidance: ${label}`);
      assert.ok(String(items.get(label)).includes(text), `${label} must communicate: ${text}`);
    }
    const dates = new Set((out.calendarEvents || []).map(event => event.date));
    for (const date of fixture.expectedCalendarDates || []) assert.ok(dates.has(date), `Missing sourced calendar date: ${date}`);
    for (const date of fixture.expectedCalendarAbsent || []) assert.ok(!dates.has(date), `Unconfirmed date exported: ${date}`);
  });
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { seed, fuelSummary, validateFuel, csvCell } from './model.js';

test('fuel consumption uses the later fill and weights intervals by distance', () => {
  const records = [
    { mileage: 1000, liters: 60, price: 6, full: true },
    { mileage: 1500, liters: 30, price: 6, full: true },
    { mileage: 2500, liters: 80, price: 6, full: true }
  ];
  assert.equal(fuelSummary(records).consumption, 110 / 1500 * 100);
  assert.equal(fuelSummary(records).cost, 1020);
  assert.equal(fuelSummary(records).distance, 1500);
  assert.equal(records[0].mileage, 1000);
});
test('no consumption is invented for missing, partial or zero-distance intervals', () => {
  assert.equal(fuelSummary([]).consumption, null);
  assert.equal(fuelSummary([seed.fuel[0]]).consumption, null);
  assert.equal(fuelSummary([{ ...seed.fuel[0], full: false }, seed.fuel[1]]).consumption, null);
  assert.equal(fuelSummary([seed.fuel[0], { ...seed.fuel[0] }]).consumption, null);
});
test('fuel entry rejects invalid quantities and decreasing odometer readings', () => {
  const entry = { ...seed.fuel[0], mileage: 69000 };
  assert.equal(validateFuel(entry, 68450), null);
  assert.ok(validateFuel({ ...entry, mileage: 68000 }, 68450));
  assert.ok(validateFuel({ ...entry, liters: -1 }, 68450));
  assert.ok(validateFuel({ ...entry, price: NaN }, 68450));
  assert.ok(validateFuel({ ...entry, mileage: 69000.5 }, 68450));
  assert.ok(validateFuel({ ...entry, date: 'bad' }, 68450));
});
test('CSV cells quote separators, escape quotes and neutralize formulas', () => {
  assert.equal(csvCell('a;b'), '"a;b"');
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell('=SUM(A1)'), '"\'=SUM(A1)"');
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { meters, heightRecord } from '../scripts/audit-building-heights.mjs';

test('OSM height units normalize without guessing ambiguous values', () => {
  assert.equal(meters('12.5'), 12.5);
  assert.equal(meters('12.5 m'), 12.5);
  assert.equal(meters('10 ft'), 3.048);
  assert.ok(Math.abs(meters('7\'4"') - 2.2352) < 1e-9);
  assert.equal(meters('10;12'), null);
  assert.equal(meters('3-5'), null);
});
test('recorded heights take priority; level-based estimates remain distinct', () => {
  const explicit = heightRecord({ type: 'way', id: 1, tags: { height: '40', 'building:levels': '10' } });
  assert.equal(explicit.explicit_height_m, 40);
  assert.equal(explicit.estimated_height_m, null);
  const estimate = heightRecord({ type: 'way', id: 2, tags: { 'building:levels': '3', 'roof:height': '2' } });
  assert.equal(estimate.estimated_height_m, 11);
  assert.equal(estimate.height_source, 'estimated-from-levels');
  assert.equal(heightRecord({ type: 'way', id: 3 }).height_source, 'unknown');
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assembleRings, contains, extractFootprints, renderHeight, suppressParentOutlines } from '../scripts/build-building-layer.mjs';

const square = (x, y, size) => [[x, y], [x + size, y], [x + size, y + size], [x, y + size], [x, y]];
const shape = (id, kind, outer, holes = []) => ({ osm_id: id, kind, polygons: [{ outer, holes }] });
test('split and reversed relation members form closed rings; incomplete rings fail', () => {
  assert.deepEqual(assembleRings([[[0, 0], [1, 0], [1, 1]], [[0, 0], [0, 1], [1, 1]]]), [square(0, 0, 1)]);
  assert.equal(assembleRings([[[0, 0], [1, 0]]]), null);
});
test('courtyards remain holes and are not considered parent building interior', () => {
  const parent = shape('parent', 'outline', square(0, 0, 10), [square(2, 2, 2)]);
  assert.equal(contains(parent, [1, 1]), true);
  assert.equal(contains(parent, [3, 3]), false);
});
test('parent outline is suppressed when parts exist, unrelated buildings remain', () => {
  const parent = shape('parent', 'outline', square(0, 0, 0.0008));
  const part = shape('part', 'part', square(0.0001, 0.0001, 0.0002));
  const other = shape('other', 'outline', square(0.002, 0.002, 0.0005));
  assert.deepEqual(suppressParentOutlines([parent, part, other]).shapes.map((s) => s.osm_id), ['part', 'other']);
});
test('explicit, estimated and default heights remain distinct', () => {
  assert.deepEqual(renderHeight({ explicit_height_m: 30, estimated_height_m: null }), { meters: 30, source: 'recorded' });
  assert.deepEqual(renderHeight({ explicit_height_m: null, estimated_height_m: 12 }), { meters: 12, source: 'floors' });
  assert.deepEqual(renderHeight({ explicit_height_m: null, estimated_height_m: null }), { meters: 6, source: 'default' });
});
test('multipolygon members are not duplicated as independent footprints', () => {
  const ring = square(0, 0, 1).map(([lon, lat]) => ({ lon, lat }));
  const result = extractFootprints({ elements: [
    { type: 'relation', id: 1, tags: { type: 'multipolygon', building: 'yes' }, members: [{ type: 'way', ref: 2, role: 'outer', geometry: ring }] },
    { type: 'way', id: 2, tags: { building: 'yes' }, geometry: ring },
  ] });
  assert.equal(result.shapes.length, 1);
  assert.equal(result.shapes[0].osm_id, 'relation/1');
});

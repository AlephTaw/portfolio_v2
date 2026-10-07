import assert from 'node:assert/strict';
import { test } from 'node:test';
import { constrainCamera, zoomCamera, INITIAL_CAMERA, MAP_WIDTH, MAP_HEIGHT } from '../app/components/world/map-camera.ts';

test('zoom preserves the map location under the gesture anchor', () => {
  const before = { x: 80, y: -30, scale: 1 };
  const anchor = { x: 150, y: 100 };
  const after = zoomCamera(before, 2, anchor);
  assert.equal((anchor.x - before.x) / before.scale, (anchor.x - after.x) / after.scale);
  assert.equal((anchor.y - before.y) / before.scale, (anchor.y - after.y) / after.scale);
});
test('zoom out can fit the whole rectangular map inside the circle', () => {
  const fit = zoomCamera(INITIAL_CAMERA, 0.5);
  assert.ok(Math.hypot(MAP_WIDTH, MAP_HEIGHT) * fit.scale < 890);
});
test('scale is bounded and every corner can be panned to the center', () => {
  assert.equal(zoomCamera(INITIAL_CAMERA, 100).scale, 6);
  assert.equal(zoomCamera(INITIAL_CAMERA, 0).scale, 0.5);
  const corner = constrainCamera({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, scale: 1 });
  assert.equal(corner.x, MAP_WIDTH / 2);
  assert.equal(corner.y, MAP_HEIGHT / 2);
});

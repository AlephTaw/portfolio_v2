import assert from 'node:assert/strict';
import { test } from 'node:test';
import { circleCoverCamera, MAP_HEIGHT, MAP_WIDTH } from '../app/components/world/map-camera.ts';

test('fixed map shows maximum area while containing the entire circle', () => {
  const radius = 445;
  const camera = circleCoverCamera(radius);
  assert.equal(camera.x, 0);
  assert.equal(camera.y, 0);
  assert.ok(MAP_WIDTH * camera.scale >= radius * 2);
  assert.ok(MAP_HEIGHT * camera.scale >= radius * 2);
  assert.equal(Math.min(MAP_WIDTH, MAP_HEIGHT) * camera.scale, radius * 2);
  // Any smaller scale exposes a gap at one pair of circle extremities.
  assert.ok(Math.min(MAP_WIDTH, MAP_HEIGHT) * (camera.scale - 0.001) < radius * 2);
});

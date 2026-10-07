import assert from "node:assert/strict";
import test from "node:test";
import { VISOR_RESIZE_TRAVEL_PX, visorResizeDelta } from "../app/components/actions/navigation/visor-resize-gesture.ts";

test("one 64px glide covers the full existing resize range at every screen height", () => {
  assert.equal(VISOR_RESIZE_TRAVEL_PX, 64);
  for (const height of [568, 667, 844, 900, 1366, 2160]) {
    const change = visorResizeDelta(64, height) / height * 100;
    assert.ok(Math.abs(change - 85) < 1e-9);
    assert.ok(Math.abs(Math.min(85, Math.max(0, change)) - 85) < 1e-9);
    assert.ok(Math.abs(Math.min(85, Math.max(0, 85 - change))) < 1e-9);
  }
});
test("resize sensitivity is linear, reversible, and independent of event packet size", () => {
  const height = 844;
  assert.equal(visorResizeDelta(-16, height), -visorResizeDelta(16, height));
  assert.equal(visorResizeDelta(8, height) * 8, visorResizeDelta(64, height));
  assert.equal(visorResizeDelta(0, height), 0);
});
test("invalid pointer or viewport geometry is ignored", () => {
  for (const [delta, height] of [[NaN, 844], [Infinity, 844], [10, 0], [10, -1], [10, NaN]]) assert.equal(visorResizeDelta(delta, height), 0);
});

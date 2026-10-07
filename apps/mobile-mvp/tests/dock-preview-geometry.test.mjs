import assert from "node:assert/strict";
import test from "node:test";
import { dockPreviewGeometry } from "../app/components/actions/history/dock-preview-geometry.ts";
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8);

test("landing matches the archived thumbnail's origin and dimensions on every layout", () => {
  for (const width of [294, 374, 629.8]) {
    for (const sourceHeight of [200, 648, 1500]) {
      const result = dockPreviewGeometry(1, width, sourceHeight, -150, 577.5);
      near(result.x, 0);
      near(-150 + result.y, 577.5);
      near(width * result.scale, 32);
      near(result.height * result.scale, 69.5);
    }
  }
});
test("preview begins without moving or resizing the live screen", () => {
  assert.deepEqual(dockPreviewGeometry(0, 374, 648, 0, 577.5), { x: 0, y: 0, scale: 1, height: 648 });
});
test("midpoint leaves the history beside the shrinking screen readable", () => {
  const result = dockPreviewGeometry(0.5, 374, 648, 0, 577.5);
  assert.ok(result.x > 100);
  assert.ok(result.scale > 32 / 374 && result.scale < 1);
  near(result.y, 577.5 / 2);
});

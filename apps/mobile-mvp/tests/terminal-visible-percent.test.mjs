import assert from "node:assert/strict";
import test from "node:test";
import { terminalVisiblePercent } from "../app/components/actions/navigation/terminal-visible-percent.ts";

test("visor indicator starts at 30% of usable viewport above navigation", () => {
  for (const [viewport, nav] of [[844, 60], [900, 88], [600, 80]]) {
    assert.ok(Math.abs(terminalVisiblePercent((viewport - nav) * 0.3 + nav, nav, viewport) - 30) < 0.001);
  }
});
test("indicator follows resizing and reaches 100% at full height", () => {
  assert.equal(terminalVisiblePercent(550, 100, 1000), 50);
  assert.equal(terminalVisiblePercent(325, 100, 1000), 25);
  assert.equal(terminalVisiblePercent(1000, 100, 1000), 100);
});
test("indicator clamps bounds and rejects invalid geometry", () => {
  assert.equal(terminalVisiblePercent(50, 100, 1000), 0);
  assert.equal(terminalVisiblePercent(1100, 100, 1000), 100);
  assert.equal(terminalVisiblePercent(100, 100, 100), 0);
  assert.equal(terminalVisiblePercent(NaN, 100, 1000), 0);
});

import assert from "node:assert/strict";
import test from "node:test";
import { advanceDockIntent, emptyDockIntent, isDockDirection } from "../app/components/actions/history/scroll-dock-gesture.ts";

test("vertical scrolling never arms docking, including fast flicks", () => {
  let intent = emptyDockIntent();
  for (const y of [25, 600, 2000, -900, 1300]) {
    intent = advanceDockIntent(intent, 0, y, 100, true);
    assert.equal(intent.armed, false);
  }
});
test("horizontal jitter, right motion, and vertical-dominant diagonals do not dock", () => {
  for (const [x, y] of [[-1, 100], [100, 100], [-20, 80], [-100, -100]]) {
    assert.equal(isDockDirection(x, y), false);
  }
});
test("left swipes arm only when allowed, independent of scroll position", () => {
  assert.equal(advanceDockIntent(emptyDockIntent(), -40, 0, 100, false).armed, false);
  assert.equal(advanceDockIntent(emptyDockIntent(), -40, 0, 100, true).armed, true);
});
test("finger and inverted wheel X both map left to docking", () => {
  assert.equal(isDockDirection(-40, 0), true);
  assert.equal(isDockDirection(-40, 10), true);
  assert.equal(isDockDirection(-40, -10), true);
});
test("small horizontal packets accumulate deliberate travel", () => {
  let intent = emptyDockIntent();
  for (let i = 0; i < 4; i++) intent = advanceDockIntent(intent, -6, 0, 100 + i * 20, true);
  assert.equal(intent.armed, false);
  assert.equal(advanceDockIntent(intent, -6, 0, 180, true).armed, true);
});
test("separate gestures do not combine accidental left motion", () => {
  const first = advanceDockIntent(emptyDockIntent(), -20, 0, 100, true);
  assert.equal(advanceDockIntent(first, -20, 0, 500, true).armed, false);
});
test("vertical or reversed motion disarms an already armed gesture", () => {
  const armed = advanceDockIntent(emptyDockIntent(), -40, 0, 100, true);
  for (const [x, y] of [[0, 600], [40, 80], [-40, -80]]) {
    assert.equal(advanceDockIntent(armed, x, y, 120, true).armed, false);
  }
});

test("fractional trackpad packets accumulate without being rejected", () => {
  let intent = emptyDockIntent();
  for (let i = 0; i < 60; i++) intent = advanceDockIntent(intent, -0.5, 0.1, 10 + i * 8, true);
  assert.equal(intent.armed, true);
  assert.equal(intent.left, 30);
});

test("brief trackpad pauses remain within the same intent burst", () => {
  const first = advanceDockIntent(emptyDockIntent(), -20, 0, 100, true);
  assert.equal(advanceDockIntent(first, -10, 0, 350, true).armed, true);
});

test("tiny orthogonal noise does not discard accumulated left intent", () => {
  const first = advanceDockIntent(emptyDockIntent(), -20, 0, 100, true);
  const noise = advanceDockIntent(first, 0, 0.5, 110, true);
  assert.equal(noise.left, 20);
  assert.equal(advanceDockIntent(noise, -10, 0, 120, true).armed, true);
});

import assert from "node:assert/strict";
import test from "node:test";
import { getTerminalSwipeAction, getTimelineSwipeDirection, isTimelineRevealSwipe } from "../app/components/actions/layouts/swipe-gesture.ts";

test("right swipes reveal timeline after a deliberate horizontal movement", () => {
  assert.equal(isTimelineRevealSwipe(48, 0), true);
  assert.equal(isTimelineRevealSwipe(120, 30), true);
  assert.equal(isTimelineRevealSwipe(120, -30), true);
});

test("left swipes explicitly hide the timeline, while taps and vertical scrolling do neither", () => {
  assert.equal(getTimelineSwipeDirection(-48, 0), "hide");
  assert.equal(getTimelineSwipeDirection(-120, 30), "hide");
  assert.equal(getTimelineSwipeDirection(100, -10), "reveal");
  for (const [dx, dy] of [[12, 2], [0, 100], [-60, 90], [48, -25]]) assert.equal(getTimelineSwipeDirection(dx, dy), null);
});

test("left swipes, taps, and vertical scrolling do not reveal timeline", () => {
  for (const [dx, dy] of [[-100, 0], [12, 2], [0, 100], [60, 90], [48, -25]]) assert.equal(isTimelineRevealSwipe(dx, dy), false);
});

test("gesture ownership separates reveal, hide, and dock", () => {
  assert.equal(getTerminalSwipeAction(80, 0, false), "reveal");
  assert.equal(getTerminalSwipeAction(80, 0, true), "reveal");
  assert.equal(getTerminalSwipeAction(-80, 0, true), "hide");
  assert.equal(getTerminalSwipeAction(-80, 0, false), "dock");
  for (const visible of [true, false]) {
    assert.equal(getTerminalSwipeAction(0, 400, visible), null);
    assert.equal(getTerminalSwipeAction(-30, 80, visible), null);
  }
});

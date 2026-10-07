import assert from "node:assert/strict";
import test from "node:test";
import { gameplayRevealTiming as timing, gameplayRevealDuration as duration, getGameplayReveal as reveal } from "../app/components/landing/circular-gameplay-geometry.ts";

test("last city frame leaves an empty pause before the rectangular mask emerges", () => {
  assert.equal(reveal(timing.delay - 1, 390, 844, 300).maskWidth, 0);
  const held = reveal(timing.delay + timing.emerge + 1000, 390, 844, 300);
  assert.equal(held.maskWidth, 300 / 2);
  assert.ok(Math.abs(held.maskWidth / held.maskHeight - 390 / 844) < 1e-8);
  assert.equal(held.videoOpacity, 0);
});

test("pulse increases slightly, then contracts farther before continuous final growth", () => {
  const start = timing.delay + timing.emerge + timing.hold;
  const peak = reveal(start + timing.pulse * 0.4, 390, 844, 300);
  const trough = reveal(start + timing.pulse, 390, 844, 300);
  assert.ok(Math.abs(peak.maskWidth - 165) < 1e-8);
  assert.ok(Math.abs(trough.maskWidth - 105) < 1e-8);
  assert.ok(peak.videoOpacity > 0);
  assert.ok(peak.videoWidth >= peak.maskWidth);
  assert.ok(peak.videoHeight >= peak.maskHeight);
  const beforeGrowth = reveal(start + timing.pulse - 0.001, 390, 844, 300);
  assert.ok(Math.abs(beforeGrowth.maskWidth - trough.maskWidth) < 1e-6);
  assert.equal(beforeGrowth.videoWidth, trough.videoWidth);
  assert.equal(beforeGrowth.videoHeight, trough.videoHeight);
  for (let i = 1; i <= 20; i++) {
    const before = reveal(start + timing.pulse * (i - 1) / 20, 390, 844, 300);
    const after = reveal(start + timing.pulse * i / 20, 390, 844, 300);
    assert.ok(i <= 8 ? after.maskWidth >= before.maskWidth : after.maskWidth <= before.maskWidth);
  }
});

test("mobile/tablet video fills the viewport; wider screens retain their aspect-preserving fit", () => {
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900], [1920, 1080]]) {
    const final = reveal(duration, width, height, 300);
    assert.ok(final.maskWidth > width);
    assert.ok(final.maskHeight > height);
    assert.ok(Math.abs(final.maskWidth / final.maskHeight - width / height) < 1e-8);
    assert.ok(final.videoWidth <= width);
    assert.ok(final.videoHeight <= height);
    if (width <= 1024) {
      assert.equal(final.videoWidth, width);
      assert.equal(final.videoHeight, height);
    } else {
      assert.ok(Math.abs(final.videoWidth / final.videoHeight - 16 / 9) < 1e-8);
    }
    assert.ok(Math.abs(final.videoWidth - width) < 1e-8 || Math.abs(final.videoHeight - height) < 1e-8);
    assert.equal(final.videoOpacity, 1);
    assert.equal(final.preview, false);
  }
});

test("rectangle continues growing after the video reaches its limiting dimension", () => {
  const expansionStart = duration - timing.expand;
  const early = reveal(expansionStart + timing.expand * 0.7, 390, 844, 300);
  const late = reveal(expansionStart + timing.expand * 0.9, 390, 844, 300);
  assert.equal(early.videoWidth, 390);
  assert.equal(late.videoWidth, early.videoWidth);
  assert.equal(late.videoHeight, early.videoHeight);
  assert.ok(late.maskWidth > early.maskWidth);
});

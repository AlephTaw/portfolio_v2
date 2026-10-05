import test from "node:test";
import assert from "node:assert/strict";
import { defaultGlassTint, glassTintOpacity, relativeLuminance } from "../app/components/actions/design-system/glass-tint.ts";

test("shared glass defaults to stronger blur independently of tint", () => {
  assert.equal(defaultGlassTint.blur, 48);
  assert.equal(glassTintOpacity(1, { ...defaultGlassTint, enabled: false }, "dark"), 0);
});

test("dark glass is clear below threshold and increases tint with background luminance", () => {
  assert.equal(glassTintOpacity(0, defaultGlassTint, "dark"), 0);
  assert.equal(glassTintOpacity(defaultGlassTint.threshold, defaultGlassTint, "dark"), 0);
  assert.ok(glassTintOpacity(0.8, defaultGlassTint, "dark") > glassTintOpacity(0.3, defaultGlassTint, "dark"));
  assert.equal(glassTintOpacity(1, defaultGlassTint, "dark"), defaultGlassTint.strength);
});
test("light mode reverses luminance response; disabling tint restores clear glass", () => {
  assert.equal(glassTintOpacity(1, defaultGlassTint, "light"), 0);
  assert.equal(glassTintOpacity(0, defaultGlassTint, "light"), defaultGlassTint.strength);
  assert.equal(glassTintOpacity(1, { ...defaultGlassTint, enabled: false }, "dark"), 0);
});
test("luminance is linear-light weighted and tint values are bounded", () => {
  assert.equal(relativeLuminance(0, 0, 0), 0);
  assert.equal(relativeLuminance(255, 255, 255), 1);
  assert.ok(relativeLuminance(0, 255, 0) > relativeLuminance(255, 0, 0));
  assert.ok(glassTintOpacity(2, { enabled: true, threshold: 1, strength: 2 }, "dark") <= 0.95);
});

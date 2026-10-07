import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../app/components/world/world-map-view.tsx', import.meta.url), 'utf8');
test('all breakpoints share the same centered, unrotated cover scene', () => {
  assert.match(source, /viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice"/);
  assert.doesNotMatch(source, /rotate\(|matchMedia|useSyncExternalStore/);
});
test('cover framing keeps circle center centered and never exposes empty edges', () => {
  for (const [width, height] of [[390, 844], [768, 1024], [1920, 1080], [2560, 1080]]) {
    const scale = Math.max(width / 1672, height / 941);
    const x = (width - 1672 * scale) / 2;
    const y = (height - 941 * scale) / 2;
    assert.ok(Math.abs(x + 836 * scale - width / 2) < 1e-9);
    assert.ok(Math.abs(y + 470.5 * scale - height / 2) < 1e-9);
    assert.ok(x <= 1e-9 && y <= 1e-9);
    assert.ok(x + 1672 * scale >= width - 1e-9);
    assert.ok(y + 941 * scale >= height - 1e-9);
  }
});

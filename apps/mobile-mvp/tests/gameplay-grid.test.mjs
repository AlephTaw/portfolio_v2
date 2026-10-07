import assert from "node:assert/strict";
import test from "node:test";
import { createGameplayGrid, gridBreakpoint, gameplayGridCount, gameplayGridDelay, gameplayGridDuration, gameplayRevealDuration } from "../app/components/landing/gameplay-grid.ts";

test("growth visits every tile once and always touches a previously revealed tile", () => {
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900], [3840, 2160]]) {
    const grid = createGameplayGrid(width, height, gridBreakpoint(width));
    assert.equal(grid.tileSize, height / 8);
    assert.equal(grid.order.length, grid.columns * grid.rows);
    assert.equal(new Set(grid.order).size, grid.order.length);
    const visited = new Set();
    for (const index of grid.order) {
      const x = index % grid.columns, y = Math.floor(index / grid.columns);
      const neighbors = [x > 0 && index - 1, x + 1 < grid.columns && index + 1,
        y > 0 && index - grid.columns, y + 1 < grid.rows && index + grid.columns].filter((item) => item !== false);
      if (visited.size) assert.ok(neighbors.some((neighbor) => visited.has(neighbor)));
      visited.add(index);
    }
    assert.ok(grid.columns * grid.tileSize >= width);
  }
});

test("breakpoint choreography is deterministic and differs for each screen class", () => {
  assert.equal(gridBreakpoint(767), "mobile");
  assert.equal(gridBreakpoint(768), "tablet");
  assert.equal(gridBreakpoint(1024), "tablet");
  assert.equal(gridBreakpoint(1025), "desktop");
  const mobile = createGameplayGrid(900, 900, "mobile").order;
  const tablet = createGameplayGrid(900, 900, "tablet").order;
  const desktop = createGameplayGrid(900, 900, "desktop").order;
  assert.deepEqual(mobile, createGameplayGrid(900, 900, "mobile").order);
  assert.notDeepEqual(mobile, tablet);
  assert.notDeepEqual(tablet, desktop);
});

test("single seed begins after the pause and all tiles reveal at the original endpoint", () => {
  assert.equal(gameplayGridCount(gameplayGridDelay - 1, 32), 0);
  assert.equal(gameplayGridCount(gameplayGridDelay, 32), 1);
  assert.equal(gameplayGridDuration, 8100);
  assert.equal(gameplayRevealDuration, 11100);
  assert.equal(gameplayGridCount(gameplayRevealDuration, 32), 32);
  assert.equal(gameplayGridCount(gameplayRevealDuration + 100, 32), 32);
  let previous = 0;
  for (let elapsed = 0; elapsed <= gameplayRevealDuration; elapsed += 10) {
    const count = gameplayGridCount(elapsed, 32);
    assert.ok(count >= previous);
    previous = count;
  }
});

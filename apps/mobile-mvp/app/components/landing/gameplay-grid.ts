// Keep the previous final entrance's pause and total duration (1×).
export const gameplayGridDelay = 3000;
export const gameplayGridDuration = 8100;
export const gameplayRevealDuration = gameplayGridDelay + gameplayGridDuration;
export type GridBreakpoint = "mobile" | "tablet" | "desktop";
export const gridBreakpoint = (width: number): GridBreakpoint => width < 768 ? "mobile" : width <= 1024 ? "tablet" : "desktop";

export function createGameplayGrid(width: number, height: number, breakpoint: GridBreakpoint, seed = 62417) {
  // Same full-coverage tile sizing as EarthTileReveal: eight viewport rows.
  const tileSize = height / 8;
  const columns = Math.max(1, Math.ceil(width / tileSize));
  const rows = 8;
  const count = columns * rows;
  const revealed = new Uint8Array(count);
  const queued = new Uint8Array(count);
  const horizontal: number[] = [], vertical: number[] = [];
  const order: number[] = [];
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const add = (index: number, pool: number[]) => {
    if (!revealed[index] && !queued[index]) { queued[index] = 1; pool.push(index); }
  };
  const reveal = (index: number) => {
    revealed[index] = 1;
    order.push(index);
    const x = index % columns, y = Math.floor(index / columns);
    if (x > 0) add(index - 1, horizontal);
    if (x + 1 < columns) add(index + 1, horizontal);
    if (y > 0) add(index - columns, vertical);
    if (y + 1 < rows) add(index + columns, vertical);
  };
  reveal(Math.min(columns - 1, Math.floor(width / 2 / tileSize)) + Math.floor(rows / 2) * columns);
  const verticalProbability = breakpoint === "mobile" ? 0.8 : breakpoint === "desktop" ? 0.2 : 0.5;
  while (horizontal.length || vertical.length) {
    const pool = !horizontal.length ? vertical : !vertical.length ? horizontal
      : random() < verticalProbability ? vertical : horizontal;
    const position = Math.floor(random() * pool.length);
    const index = pool[position];
    pool[position] = pool[pool.length - 1];
    pool.pop();
    reveal(index);
  }
  return { tileSize, columns, rows, order };
}

export function gameplayGridProgress(elapsed: number) {
  return Math.max(0, Math.min(1, (elapsed - gameplayGridDelay) / gameplayGridDuration));
}

export function gameplayGridCount(elapsed: number, count: number) {
  if (elapsed < gameplayGridDelay) return 0;
  return Math.min(count, 1 + Math.floor(gameplayGridProgress(elapsed) * (count - 1)));
}

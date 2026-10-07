export type DockIntent = { left: number; last: number; armed: boolean };
export const emptyDockIntent = (): DockIntent => ({ left: 0, last: 0, armed: false });
export const WHEEL_GESTURE_IDLE_MS = 320;

// Finger/content coordinates: negative X is left. Wheel callers invert X.
export function isDockDirection(x: number, y: number): boolean {
  return x < 0 && Math.abs(y) <= -x / 2;
}

export function advanceDockIntent(intent: DockIntent, x: number, y: number, now: number, allowed: boolean): DockIntent {
  if (allowed && x === 0 && Math.abs(y) <= 1 && now - intent.last <= WHEEL_GESTURE_IDLE_MS) return intent;
  if (!allowed || !isDockDirection(x, y)) return emptyDockIntent();
  const base = !intent.armed && now - intent.last > WHEEL_GESTURE_IDLE_MS ? emptyDockIntent() : intent;
  const left = base.left - x;
  return { left, last: now, armed: base.armed || left >= 28 };
}

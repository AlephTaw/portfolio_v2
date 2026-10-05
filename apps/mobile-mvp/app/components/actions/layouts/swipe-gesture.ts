export function isTimelineRevealSwipe(dx: number, dy: number): boolean {
  return getTimelineSwipeDirection(dx, dy) === "reveal";
}

export function getTimelineSwipeDirection(dx: number, dy: number): "reveal" | "hide" | null {
  if (Math.abs(dx) < 48 || Math.abs(dy) > Math.abs(dx) / 2) return null;
  return dx > 0 ? "reveal" : "hide";
}

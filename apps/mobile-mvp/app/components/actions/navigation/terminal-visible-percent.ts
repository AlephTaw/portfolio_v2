export function terminalVisiblePercent(containerHeight: number, navigationHeight: number, viewportHeight: number): number {
  const available = viewportHeight - navigationHeight;
  if (available <= 0 || !Number.isFinite(containerHeight + navigationHeight + viewportHeight)) return 0;
  return Math.min(100, Math.max(0, (containerHeight - navigationHeight) / available * 100));
}

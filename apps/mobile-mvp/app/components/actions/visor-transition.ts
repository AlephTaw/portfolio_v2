// Wait for the actual sliding surface, not a duplicate animation-duration timer.
// No animations (initial render or reduced motion) settle immediately. Cleanup
// prevents a reversed/interrupted closing sequence from revealing stale history.
export function observeVisorClosure(surface: Pick<HTMLElement, "getAnimations">, onClosed: () => void): () => void {
  let cancelled = false;
  const animations = surface.getAnimations();
  void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
    if (!cancelled) onClosed();
  });
  return () => { cancelled = true; };
}

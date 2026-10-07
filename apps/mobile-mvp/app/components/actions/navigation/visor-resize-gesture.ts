// Keep the complete existing 15%–100% height range within one thumb glide.
// Convert the visor's short gesture into viewport pixels for the shared resizer;
// timeline-dot drags and keyboard resizing retain their existing mapping.
export const VISOR_RESIZE_TRAVEL_PX = 64;

export function visorResizeDelta(pointerDelta: number, viewportHeight: number): number {
  if (!Number.isFinite(pointerDelta) || !Number.isFinite(viewportHeight) || viewportHeight <= 0) return 0;
  return pointerDelta * viewportHeight * 0.85 / VISOR_RESIZE_TRAVEL_PX;
}

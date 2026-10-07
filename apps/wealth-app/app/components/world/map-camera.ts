export type Point = { x: number; y: number };
export type MapCamera = Point & { scale: number };
export const INITIAL_CAMERA: MapCamera = { x: 0, y: 0, scale: 1 };
export const MIN_SCALE = 0.5;
export const MAX_SCALE = 6;
export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 899.7409716367217;

// Smallest centered scale whose map rectangle fully contains the circle.
export function circleCoverCamera(radius: number): MapCamera {
  return { x: 0, y: 0, scale: radius * 2 / Math.min(MAP_WIDTH, MAP_HEIGHT) };
}

export function constrainCamera(camera: MapCamera): MapCamera {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, camera.scale));
  // Keep the map center reachable, but permit every edge/corner to reach the mask center.
  return { scale, x: Math.min(MAP_WIDTH * scale / 2, Math.max(-MAP_WIDTH * scale / 2, camera.x)), y: Math.min(MAP_HEIGHT * scale / 2, Math.max(-MAP_HEIGHT * scale / 2, camera.y)) };
}

export function zoomCamera(camera: MapCamera, scale: number, anchor: Point = { x: 0, y: 0 }): MapCamera {
  const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
  const ratio = nextScale / camera.scale;
  return constrainCamera({ scale: nextScale, x: anchor.x - (anchor.x - camera.x) * ratio, y: anchor.y - (anchor.y - camera.y) * ratio });
}

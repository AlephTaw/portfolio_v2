/** Match ViewThumbnail's final 32 × 69.5px silhouette and shared slot origin. */
export function dockPreviewGeometry(progress: number, width: number, height: number, sourceTop: number, destinationTop: number) {
  const fraction = Math.max(0, Math.min(1, progress));
  const eased = fraction * fraction * (3 - 2 * fraction);
  const scale = 1 + (32 / width - 1) * eased;
  return {
    x: Math.max(0, width - 25 - width * scale) * Math.sin(Math.PI * eased),
    y: (destinationTop - sourceTop) * eased,
    scale,
    height: height + (width * 69.5 / 32 - height) * eased,
  };
}

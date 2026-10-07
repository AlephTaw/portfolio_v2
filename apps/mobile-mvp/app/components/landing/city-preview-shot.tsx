"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";

// The inward continuation of the entrance road through the centered city crop.
const entranceRoad = [[0.448, 0.653], [0.472, 0.648], [0.493, 0.644], [0.516, 0.638]] as const;
// Source-image anchors stay fixed across responsive crops.
const locations = [[0.36, 0.69], [0.42, 0.559], [0.56, 0.579]] as const;
const names = ["Entrance road tracking", "West city district", "Riverside overview"];

export function CityPreviewShot({ width, height, imageSize, shot, paused, phase, clock }: {
  width: number; height: number; imageSize: { width: number; height: number };
  shot: number; paused: boolean; phase: string;
  clock: RefObject<{ stage: string; elapsed: number }>;
}) {
  const path = useRef<SVGPathElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  // Matches the same centered cover crop as both preceding backgrounds.
  const scale = Math.max(width / imageSize.width, height / imageSize.height);
  const imageWidth = imageSize.width * scale, imageHeight = imageSize.height * scale;
  const imageLeft = (width - imageWidth) / 2, imageTop = (height - imageHeight) / 2;
  // A 390px mobile frame with twice the original 16:9 height; never grow it
  // on larger screens. Scale both dimensions together when space is limited.
  const finalAspect = 8 / 9;
  const finalWidth = Math.min(390, width, height * finalAspect);
  const frameWidth = shot === 2 ? finalWidth : Math.min(300, imageWidth * 0.26, width - 24);
  const frameHeight = frameWidth / (shot === 2 ? finalAspect : 1.2);
  const left = shot === 2 ? (width - frameWidth) / 2 : Math.max(12, Math.min(imageLeft + imageWidth * (shot === 0 ? 0.66 : 0.04), width - frameWidth - 12));
  const top = shot === 2 ? 0 : Math.max(96, imageTop + imageHeight * 0.18);
  const geometry = useRef({ imageWidth, imageHeight, imageLeft, imageTop, left, top, frameWidth, frameHeight });
  const lastProgress = useRef(0);

  const draw = useCallback((progress: number) => {
    const g = geometry.current;
    let point: readonly number[] = locations[shot];
    if (shot === 0) {
      // Interpolate by travelled distance so short bends don't slow the vehicle.
      const lengths = entranceRoad.slice(1).map((p, i) => Math.hypot((p[0] - entranceRoad[i][0]) * imageSize.width, (p[1] - entranceRoad[i][1]) * imageSize.height));
      // Start at 75% of the original route and travel another 75% of its length.
      // Past its last waypoint, continue along the final road segment's tangent.
      const parameter = 0.75 + Math.min(1, Math.max(0, progress)) * 0.75;
      let distance = parameter * lengths.reduce((sum, length) => sum + length, 0);
      for (let i = 0; i < lengths.length; i++) {
        if (distance <= lengths[i] || i === lengths.length - 1) {
          const ratio = distance / lengths[i];
          point = [entranceRoad[i][0] + (entranceRoad[i + 1][0] - entranceRoad[i][0]) * ratio, entranceRoad[i][1] + (entranceRoad[i + 1][1] - entranceRoad[i][1]) * ratio];
          break;
        }
        distance -= lengths[i];
      }
    }
    const x = g.imageLeft + point[0] * g.imageWidth, y = g.imageTop + point[1] * g.imageHeight;
    const startX = g.left + g.frameWidth / 2;
    // Keep the same attachment face at every breakpoint, perpendicular to it.
    const startY = g.top + g.frameHeight;
    // Leave vertical clearance before the diagonal leg, avoiding a square elbow.
    const bendY = startY + (shot === 2 ? Math.min(24, Math.max(0, (y - startY) * 0.35)) : 24);
    path.current?.setAttribute("d", `M${startX},${startY} L${startX},${bendY} L${x},${y}`);
    dot.current?.setAttribute("cx", String(x));
    dot.current?.setAttribute("cy", String(y));
  }, [shot, imageSize.width, imageSize.height]);

  // Layout changes redraw the same source position; they never restart tracking.
  useLayoutEffect(() => {
    geometry.current = { imageWidth, imageHeight, imageLeft, imageTop, left, top, frameWidth, frameHeight };
    draw(lastProgress.current);
  });
  useEffect(() => {
    lastProgress.current = 0;
    draw(0);
  }, [draw]);
  useEffect(() => {
    if (shot !== 0 || paused || phase !== "frames" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const track = () => {
      lastProgress.current = Math.min(1, clock.current.elapsed / 5500);
      draw(lastProgress.current);
      frame = requestAnimationFrame(track);
    };
    frame = requestAnimationFrame(track);
    return () => cancelAnimationFrame(frame);
  }, [shot, paused, phase, clock, draw]);

  return <>
    <svg width={width} height={height} className="absolute inset-0 text-white/85">
      <path ref={path} data-city-leader fill="none" stroke="currentColor" strokeWidth="1" />
      <circle ref={dot} data-city-tracking-point r="2.5" fill="currentColor" />
    </svg>
    <div key={shot} data-earth-preview={names[shot]} className="earth-preview-panel absolute rounded-2xl bg-black" style={{ left, top, width: frameWidth, height: frameHeight }} />
  </>;
}

"use client";

import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { FinalFrameVideo } from "./final-frame-video";
import { createGameplayGrid, gameplayGridCount, gameplayGridProgress, gameplayRevealDuration, gridBreakpoint } from "./gameplay-grid";

export function GameplayGridTransition({ width, height, imageSrc, clock, complete, paused, speed, onVideoEnd }: {
  imageSrc: string;
  width: number; height: number; clock: RefObject<{ stage: string; elapsed: number }>;
  complete: boolean; paused: boolean; speed: number; onVideoEnd?: () => void;
}) {
  // Lock choreography at launch; resizing rebuilds the grid at the same time.
  const [breakpoint] = useState(() => gridBreakpoint(width));
  const grid = useMemo(() => createGameplayGrid(width, height, breakpoint), [width, height, breakpoint]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<HTMLDivElement>(null);
  const fittedHeight = width <= 1024 ? height : Math.min(height, width / (16 / 9));
  const fittedWidth = width <= 1024 ? width : fittedHeight * (16 / 9);

  useLayoutEffect(() => {
    const overlay = canvas.current;
    const context = overlay?.getContext("2d");
    if (!overlay || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    overlay.width = Math.ceil(width * ratio);
    overlay.height = Math.ceil(height * ratio);
    // Cover the video with the outgoing scene, not a black screen. Clearing
    // each tile then replaces that part of the city directly with live video.
    const source = new Image();
    source.src = imageSrc;
    if (fallback.current) fallback.current.style.display = complete ? "none" : "block";
    const paintSource = () => {
      const scale = Math.max(overlay.width / source.naturalWidth, overlay.height / source.naturalHeight);
      const imageWidth = source.naturalWidth * scale, imageHeight = source.naturalHeight * scale;
      context.drawImage(source, (overlay.width - imageWidth) / 2, (overlay.height - imageHeight) / 2, imageWidth, imageHeight);
    };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastCount = 0, frame = 0;
    const draw = () => {
      const elapsed = complete ? gameplayRevealDuration : clock.current.elapsed;
      if (reducedMotion) {
        overlay.style.opacity = String(1 - gameplayGridProgress(elapsed));
      } else {
        const count = gameplayGridCount(elapsed, grid.order.length);
        // Rewind restores the cover; normal playback only clears new tiles.
        if (count < lastCount) {
          paintSource();
          lastCount = 0;
        }
        for (let i = lastCount; i < count; i++) {
          const index = grid.order[i];
          const x = index % grid.columns, y = Math.floor(index / grid.columns);
          const left = Math.round(x * grid.tileSize * ratio), top = Math.round(y * grid.tileSize * ratio);
          const right = Math.round((x + 1) * grid.tileSize * ratio), bottom = Math.round((y + 1) * grid.tileSize * ratio);
          context.clearRect(left, top, right - left, bottom - top);
        }
        lastCount = count;
      }
      if (!complete) frame = requestAnimationFrame(draw);
    };
    const start = () => {
      paintSource();
      if (fallback.current) fallback.current.style.display = "none";
      draw();
    };
    if (complete) {
      draw();
    } else if (source.complete && source.naturalWidth) {
      start();
    } else {
      source.onload = start;
    }
    return () => { source.onload = null; cancelAnimationFrame(frame); };
  }, [width, height, imageSrc, grid, clock, complete]);

  return <div data-gameplay-grid={breakpoint} className="absolute inset-0 bg-black">
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: fittedWidth, height: fittedHeight }}>
      <FinalFrameVideo paused={paused} speed={speed} preview={!complete} onComplete={onVideoEnd} />
    </div>
    <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full" />
    <div ref={fallback} aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${imageSrc}')`, display: complete ? "none" : "block" }} />
  </div>;
}

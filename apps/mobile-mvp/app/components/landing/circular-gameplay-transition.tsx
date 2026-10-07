"use client";

import { useEffect, useRef, type RefObject } from "react";
import { FinalFrameVideo } from "./final-frame-video";
import { gameplayRevealDuration, getGameplayReveal } from "./circular-gameplay-geometry";

export function CircularGameplayTransition({ width, height, previousWidth, clock, complete, paused, speed, onVideoEnd }: {
  width: number; height: number; previousWidth: number;
  clock: RefObject<{ stage: string; elapsed: number }>;
  complete: boolean; paused: boolean; speed: number; onVideoEnd?: () => void;
}) {
  const mask = useRef<HTMLDivElement>(null);
  const videoBox = useRef<HTMLDivElement>(null);
  const initialGeometry = getGameplayReveal(complete ? gameplayRevealDuration : 0, width, height, previousWidth);

  useEffect(() => {
    let frame = 0;
    const draw = () => {
      const elapsed = complete ? gameplayRevealDuration : clock.current.elapsed;
      const geometry = getGameplayReveal(elapsed, width, height, previousWidth);
      if (mask.current) mask.current.style.clipPath = complete ? "none" : `inset(${(height - geometry.maskHeight) / 2}px ${(width - geometry.maskWidth) / 2}px)`;
      if (videoBox.current) {
        videoBox.current.style.width = `${geometry.videoWidth}px`;
        videoBox.current.style.height = `${geometry.videoHeight}px`;
        videoBox.current.style.opacity = String(geometry.videoOpacity);
      }
      if (!complete) frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [clock, complete, width, height, previousWidth]);

  // Preview playback loops; only the fullscreen presentation ends the tour.
  return <div ref={mask} data-gameplay-mask className="absolute inset-0 bg-black" style={{ clipPath: complete ? "none" : "inset(50% 50%)" }}>
    <div ref={videoBox} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: initialGeometry.videoWidth, height: initialGeometry.videoHeight, opacity: initialGeometry.videoOpacity }}>
      <FinalFrameVideo paused={paused} speed={speed} preview={!complete} onComplete={onVideoEnd} />
    </div>
  </div>;
}

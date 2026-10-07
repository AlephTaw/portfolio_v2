"use client";

import { useEffect, useRef } from "react";

// Keep the media mounted and preloaded; the tour still owns scene selection.
export function PlanetFlightTransition({ active, paused, speed, onReady, onComplete, onUnavailable }: {
  active: boolean; paused: boolean; speed: number;
  onReady: () => void; onComplete: () => void; onUnavailable: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
  }, [active]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    video.playbackRate = speed;
    const synchronize = () => {
      if (!active || paused || document.hidden) {
        video.pause();
      } else {
        void video.play().catch(() => {
          if (!cancelled) onUnavailable();
        });
      }
    };
    synchronize();
    document.addEventListener("visibilitychange", synchronize);
    return () => {
      cancelled = true;
      video.pause();
      document.removeEventListener("visibilitychange", synchronize);
    };
  }, [active, paused, speed, onUnavailable]);

  return <video
    ref={videoRef} aria-hidden="true" data-planet-flight data-active={active}
    className="absolute inset-0 h-full w-full object-cover object-center"
    style={{ opacity: active ? 1 : 0 }}
    src="/landing-planet-to-city-flight-v1-local-repair-v6.mp4"
    poster="/landing-desert-planet-v3.png"
    muted playsInline preload="auto"
    onCanPlay={onReady} onError={onUnavailable}
    onEnded={() => { if (active) onComplete(); }}
  />;
}

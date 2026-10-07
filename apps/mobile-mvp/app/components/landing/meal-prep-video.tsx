"use client";

import { useEffect, useRef, useState } from "react";

// Normalized to the source: center the subject rather than the desk.
const focalPoint = { x: 0.4, y: 0.43 };

export function MealPrepVideo({ paused, speed }: { paused: boolean; speed: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [objectPosition, setObjectPosition] = useState("25% 50%");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const measure = () => {
      const { videoWidth, videoHeight, clientWidth, clientHeight } = video;
      if (!videoWidth || !videoHeight || !clientWidth || !clientHeight) return;
      const scale = Math.max(clientWidth / videoWidth, clientHeight / videoHeight);
      const width = videoWidth * scale, height = videoHeight * scale;
      const x = Math.max(clientWidth - width, Math.min(0, clientWidth / 2 - focalPoint.x * width));
      const y = Math.max(clientHeight - height, Math.min(0, clientHeight / 2 - focalPoint.y * height));
      setObjectPosition(`${x}px ${y}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(video);
    video.addEventListener("loadedmetadata", measure);
    measure();
    return () => { observer.disconnect(); video.removeEventListener("loadedmetadata", measure); };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const syncPlayback = () => {
      video.playbackRate = speed;
      if (paused) video.pause();
      else void video.play().catch(() => {});
    };
    video.addEventListener("loadedmetadata", syncPlayback);
    syncPlayback();
    return () => video.removeEventListener("loadedmetadata", syncPlayback);
  }, [paused, speed]);

  return <video ref={videoRef} aria-hidden="true" data-meal-prep-video
    className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition }}
    src="/meal-prep-nutrition-clip.mp4" muted playsInline loop preload="auto" />;
}

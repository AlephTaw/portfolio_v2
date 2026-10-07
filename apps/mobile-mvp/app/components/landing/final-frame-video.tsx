"use client";

import { useEffect, useRef, useState } from "react";

// Source-image coordinates: the subject's face stays near this fixed position.
const focalPoint = { x: 0.27, y: 0.5 };

export function FinalFrameVideo({ paused, speed, preview = false, onComplete }: { paused: boolean; speed: number; preview?: boolean; onComplete?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wasPreview = useRef(preview);
  const [ended, setEnded] = useState(false);
  const [objectPosition, setObjectPosition] = useState("50% 50%");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let frame = 0;
    const measure = () => {
      const { videoWidth, videoHeight, clientWidth, clientHeight } = video;
      if (!videoWidth || !videoHeight || !clientWidth || !clientHeight) return;
      const scale = Math.max(clientWidth / videoWidth, clientHeight / videoHeight);
      const width = videoWidth * scale;
      const height = videoHeight * scale;
      // Center the focal point, clamping the crop so no empty edges are exposed.
      const x = Math.max(clientWidth - width, Math.min(0, clientWidth / 2 - focalPoint.x * width));
      const y = Math.max(clientHeight - height, Math.min(0, clientHeight / 2 - focalPoint.y * height));
      setObjectPosition(`${x}px ${y}px`);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(video);
    video.addEventListener("loadedmetadata", schedule);
    measure();
    return () => {
      observer.disconnect();
      video.removeEventListener("loadedmetadata", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (wasPreview.current && !preview) video.currentTime = 0;
    wasPreview.current = preview;
    video.playbackRate = speed;
    // The tour stops at the countdown, but its faded background keeps playing.
    if (paused && !ended) {
      video.pause();
    } else {
      void video.play().catch(() => {});
    }
  }, [paused, speed, ended, preview]);

  return <video
    ref={videoRef}
    aria-hidden="true"
    data-final-frame-video
    className="absolute inset-0 h-full w-full object-cover"
    style={{ objectPosition, opacity: ended ? 0.2 : 1, transition: "opacity 1000ms ease-in-out" }}
    src="/sulek-car-short-clip.mp4"
    muted
    playsInline
    autoPlay
    loop={preview || ended}
    preload="auto"
    onEnded={(event) => {
      if (preview || ended) return;
      event.currentTarget.currentTime = 0;
      setEnded(true);
      onComplete?.();
    }}
  />;
}

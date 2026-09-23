"use client";

import { useEffect, useRef, useState } from "react";

const initialOffsetStyle = {
  left: "-55%",
  width: "min(323px, 120%, calc(100vw - 1rem))",
  "--leaderboard-start-x": "0px",
  "--leaderboard-start-y": "0px",
} as React.CSSProperties;

export function LeaderboardOverlay() {
  const [visible, setVisible] = useState(false);
  const [startOffset, setStartOffset] = useState(initialOffsetStyle);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reveal = () => {
      const overlay = overlayRef.current;
      const stage = overlay?.closest<HTMLElement>("[data-video-stage]");

      if (overlay && stage) {
        const stageRect = stage.getBoundingClientRect();
        const overlayRect = overlay.getBoundingClientRect();
        const viewportMargin = 8;
        const preferredFinalLeft = stageRect.left - stageRect.width * 0.55;
        const centeredFinalLeft =
          (window.innerWidth - overlayRect.width) / 2;
        const finalLeft = Math.max(
          viewportMargin,
          Math.min(
            window.innerWidth - overlayRect.width - viewportMargin,
            preferredFinalLeft < viewportMargin
              ? centeredFinalLeft
              : preferredFinalLeft,
          ),
        );
        const startLeft = Math.max(
          viewportMargin,
          stageRect.left - 400 - overlayRect.width,
        );
        const startTop = stageRect.height * 0.75;
        const finalTop = stageRect.top + stageRect.height * 0.75;

        setStartOffset({
          "--leaderboard-start-x": `${startLeft - finalLeft}px`,
          "--leaderboard-start-y": `${stageRect.top + startTop - finalTop}px`,
          left: `${finalLeft - stageRect.left}px`,
          width: "min(323px, 120%, calc(100vw - 1rem))",
        } as React.CSSProperties);
      }

      setVisible(true);
    };
    window.addEventListener("mmvp:homepage-reel-reveal", reveal);

    return () => window.removeEventListener("mmvp:homepage-reel-reveal", reveal);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none absolute top-[75%] z-20 w-[min(323px,120%)] bg-black/25 ${visible ? "leaderboard-enter" : "invisible"}`}
      ref={overlayRef}
      style={startOffset}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 323 415"
      >
        <rect
          x="31"
          y="24"
          width="281"
          height="50"
          rx="3"
          fill="#02010F"
          fillOpacity="1"
          stroke="transparent"
          strokeWidth="1"
        />
        <rect
          x="37"
          y="28"
          width="269.149"
          height="42.0528"
          rx="3"
          fill="#02010F"
          fillOpacity="1"
        />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="block h-auto w-full opacity-75 invert"
        src="/leaderboard.svg"
      />
      {/* The source SVG's avatar is covered with the supplied profile photo. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="absolute hidden object-cover"
        src="/leaderboard-profile.png"
        style={{
          left: `${(16.8633 / 323) * 100}%`,
          top: `${(32.8594 / 415) * 100}%`,
          width: `${(32.8255 / 323) * 100}%`,
          height: `${(32.8255 / 415) * 100}%`,
          borderRadius: "50%",
        }}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden h-full w-full"
        viewBox="0 0 323 415"
      >
        <circle
          cx="33.3203"
          cy="49.3203"
          r="20.3203"
          fill="none"
          stroke="#02010F"
          strokeWidth="4"
        />
        <circle
          cx="33.3203"
          cy="49.3203"
          r="21.3203"
          fill="none"
          stroke="#F1F1F3"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

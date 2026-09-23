"use client";

import { useEffect, useState } from "react";

const TOTAL_SECONDS = 10_000_000;
const START_AT_MS = Date.parse("2026-09-03T17:00:00-04:00");
const END_AT_MS = START_AT_MS + TOTAL_SECONDS * 1_000;
const secondsFormatter = new Intl.NumberFormat("en-US");

function getRemainingMilliseconds() {
  const now = Date.now();

  if (now <= START_AT_MS) {
    return TOTAL_SECONDS * 1_000;
  }

  return Math.max(0, END_AT_MS - now);
}

function formatRemaining(millisecondsRemaining: number) {
  const wholeSeconds = Math.floor(millisecondsRemaining / 1_000);
  const milliseconds = millisecondsRemaining % 1_000;

  return `${secondsFormatter.format(wholeSeconds)}.${milliseconds
    .toString()
    .padStart(3, "0")}`;
}

export function Countdown() {
  const [remainingMilliseconds, setRemainingMilliseconds] = useState(
    TOTAL_SECONDS * 1_000,
  );

  useEffect(() => {
    let animationFrame = 0;

    const update = () => {
      setRemainingMilliseconds(getRemainingMilliseconds());
      animationFrame = window.requestAnimationFrame(update);
    };

    animationFrame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <p
      aria-label={`${(remainingMilliseconds / 1_000).toFixed(3)} seconds remaining`}
      className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-white/55 tabular-nums"
      role="timer"
    >
      {formatRemaining(remainingMilliseconds)} seconds
    </p>
  );
}

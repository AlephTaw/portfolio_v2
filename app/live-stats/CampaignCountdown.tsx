"use client";

import { useEffect, useState } from "react";

const CAMPAIGN_TARGET = "2026-12-05T00:00:00-05:00";
const CAMPAIGN_TARGET_TIME = new Date(CAMPAIGN_TARGET).getTime();

function getTimeRemaining(now: number) {
  const remaining = Math.max(CAMPAIGN_TARGET_TIME - now, 0);
  const totalSeconds = Math.floor(remaining / 1_000);

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(value: number, length = 2) {
  return String(value).padStart(length, "0");
}

export function CampaignCountdown() {
  const [now, setNow] = useState(() => Date.now());
  const remaining = getTimeRemaining(now);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end justify-between gap-2 sm:gap-4">
      <p className="whitespace-nowrap text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-[#6d6d6d] sm:text-[0.62rem] sm:tracking-[0.2em]">
        Campaign: The Crucible | Arc: SIRL Genesis
      </p>
      <time
        className="whitespace-nowrap font-mono text-[0.5rem] tabular-nums text-[#4b4b4b] sm:text-[0.65rem]"
        dateTime={CAMPAIGN_TARGET}
        suppressHydrationWarning
      >
        {pad(remaining.days, 3)} D : {pad(remaining.hours)} H : {pad(remaining.minutes)} M :{" "}
        {pad(remaining.seconds)} S
      </time>
    </div>
  );
}

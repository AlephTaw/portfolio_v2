"use client";

import { useEffect, useState } from "react";
import { getArcDay, getArcTimeRemaining, formatActivityElapsed } from "./arc-time";
import { useActiveActivity } from "./quest-terminal/use-active-activity";

export function ArcStatusLine() {
  const [now, setNow] = useState(() => Date.now());
  const { activeActivity } = useActiveActivity();
  const arcDay = getArcDay(getArcTimeRemaining(now).days);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div aria-label="Arc status" className="relative z-10 shrink-0 bg-black text-white/60">
      <div className="mx-auto flex w-[calc(100%-2*var(--composer-gutter))] max-w-[calc(var(--composer-max-width)-2*var(--composer-gutter))] items-center gap-3 py-2 font-sans text-xs">
        <span className="shrink-0 bg-white px-1.5 py-0.5 font-medium text-black">Crucible</span>
        <span className="whitespace-nowrap font-mono tabular-nums" suppressHydrationWarning>DAY {arcDay.current} / {arcDay.total}</span>
        <time className="whitespace-nowrap font-mono tabular-nums" suppressHydrationWarning>
          {activeActivity ? formatActivityElapsed(now - activeActivity.startedAt) : "00:00:00"}
        </time>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  weekday: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function CommitmentHistoryMarker() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center text-center text-black">
      <span
        aria-hidden="true"
        className="h-0 w-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-black"
      />
      <time
        className="mt-1 whitespace-nowrap text-[0.5rem] font-medium uppercase leading-3 tracking-[0.08em]"
        suppressHydrationWarning
      >
        {dateFormatter.format(now)} · {timeFormatter.format(now)}
      </time>
    </div>
  );
}

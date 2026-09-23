"use client";

import { requestActivityVisibilityToggle } from "@/src/apps/telemetry/navigationEvents";
import { useTelemetry } from "@/src/apps/telemetry/useTelemetry";

export function TerminalTimelineRail() {
  const { isOpen } = useTelemetry();

  return (
    <div
      className="pointer-events-none absolute inset-y-4 left-2 z-[10003] sm:left-4"
    >
      <div
        aria-hidden="true"
        className="h-full w-0.5"
        style={{
          backgroundImage: "radial-gradient(circle, #7f7f7f 1px, transparent 1.25px)",
          backgroundRepeat: "repeat-y",
          backgroundSize: "2px 9px",
        }}
      />
      <button
        aria-label={isOpen ? "Hide activity" : "Show activity"}
        aria-pressed={isOpen}
        className="pointer-events-auto absolute bottom-0 left-1/2 grid size-7 -translate-x-1/2 place-items-center text-[0.58rem] font-semibold leading-none text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        onClick={requestActivityVisibilityToggle}
        title={isOpen ? "Hide activity" : "Show activity"}
        type="button"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-black [clip-path:polygon(25%_6.7%,75%_6.7%,100%_50%,75%_93.3%,25%_93.3%,0_50%)]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-[2px] bg-background [clip-path:polygon(25%_6.7%,75%_6.7%,100%_50%,75%_93.3%,25%_93.3%,0_50%)]"
        />
        <span className="relative">A</span>
        {!isOpen ? (
          <span
            aria-hidden="true"
            className="absolute h-px w-5 -rotate-45 bg-black"
          />
        ) : null}
      </button>
    </div>
  );
}

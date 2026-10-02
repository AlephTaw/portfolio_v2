"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SystemEditorButton } from "./system-editor-button";
import { ActionsChatToggle } from "./map-view-switcher";
import { useStateView } from "../state/components/state-view-context";
import { useActionsView } from "./actions-view-context";
import { getArcDay, getArcTimeRemaining, formatActivityElapsed } from "./arc-time";
import { useActiveActivity } from "./quest-terminal/use-active-activity";

export function ArcStatusLine() {
  const pathname = usePathname();
  const { view, chatVisible } = useActionsView();
  const { notesVisible, setNotesVisible, editorOpen, displayedAppView, navigationHome } = useStateView();
  const showEditor = view === "code-preview" || chatVisible;
  const showSystemsHeading = (pathname === "/actions" && view === "systems") || (displayedAppView === "os" && !navigationHome && !editorOpen && (pathname === "/state" || (pathname === "/actions" && view === "stats")));
  const [now, setNow] = useState(() => Date.now());
  const { activeActivity } = useActiveActivity();
  const arcDay = getArcDay(getArcTimeRemaining(now).days);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div aria-label="Arc status" className="relative z-10 w-full shrink-0 bg-black text-white/60">
      <div className="mx-auto flex min-h-14 w-[calc(100%-2*var(--composer-gutter))] max-w-[calc(var(--composer-max-width)-2*var(--composer-gutter))] items-center gap-2 py-2 font-sans text-[10px] sm:gap-3 sm:text-xs">
        <span className="shrink-0 bg-white px-1.5 py-0.5 font-medium text-black">Crucible</span>
        <span className="whitespace-nowrap font-mono tabular-nums" suppressHydrationWarning>DAY {arcDay.current} / {arcDay.total}</span>
        <time className="whitespace-nowrap font-mono tabular-nums" suppressHydrationWarning>
          {activeActivity ? formatActivityElapsed(now - activeActivity.startedAt) : "00:00:00"}
        </time>
        {(pathname === "/state" || pathname === "/actions") && (
          <div aria-label="Top dock view controls" className="absolute top-1/2 flex -translate-y-1/2 items-center gap-2" style={{ right: "calc(var(--rail-edge-inset) + 5px)" }}>
            {showSystemsHeading && <h1 className="whitespace-nowrap text-base font-medium text-white">Systems</h1>}
            {(pathname === "/state" ? notesVisible || editorOpen : showEditor) && <SystemEditorButton />}
            <ActionsChatToggle visible={pathname === "/state" ? notesVisible : undefined} onToggle={pathname === "/state" ? () => setNotesVisible(previous => !previous) : undefined} />
          </div>
        )}
      </div>
    </div>
  );
}

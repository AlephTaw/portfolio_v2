"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { FiArrowLeft, FiPause, FiPlay } from "react-icons/fi";
import { useActivityWorkspace } from "./activity-workspace-context";
import { useChatConversation } from "./chat-conversations";
import { MapViewSwitcher, WorldGridViewButton } from "./map-view-switcher";
import { useActionsView } from "./actions-view-context";

// Toggle bottom (3.75rem) + its height (2.5rem) + two icon heights (5rem).
const railBackButtonBottom = "calc(var(--composer-height) + 11.25rem)";

function ActivityProgressStack({ completed, total }: { completed: number; total: number }) {
  const segmentCount = 8;
  const filledSegments = total > 0 ? Math.ceil((completed / total) * segmentCount) : 0;
  const unlocked = total > 0 && completed === total;

  return (
    <div
      aria-label="Current activity progress"
      aria-valuemax={total}
      aria-valuemin={0}
      aria-valuenow={completed}
      aria-valuetext={`${completed} of ${total} tasks completed; achievement ${unlocked ? "unlocked" : "locked"}`}
      className="pointer-events-none flex w-10 flex-col items-center gap-4 pb-2"
      role="progressbar"
    >
      <svg aria-hidden="true" className={`size-6 transition-colors ${unlocked ? "text-white" : "text-white/40"}`} fill="none" viewBox="0 0 24 24">
        <path d="M12 1.5 21 6.75v10.5L12 22.5 3 17.25V6.75L12 1.5Z" stroke="currentColor" strokeWidth="2" />
      </svg>
      <div aria-hidden="true" className="flex flex-col-reverse gap-1">
        {Array.from({ length: segmentCount }, (_, index) => (
          <span className={`h-2 w-1.5 rounded-[1px] transition-colors ${index < filledSegments ? "bg-white" : "bg-white/25"}`} key={index} />
        ))}
      </div>
    </div>
  );
}

function RailViewButtons({ activityOpen }: { activityOpen: boolean }) {
  const { activityProgress, detailTaskId, requestTaskGrid } = useActivityWorkspace();
  const [playingTaskId, setPlayingTaskId] = useState<string | null>(null);
  const detailOpen = activityOpen && detailTaskId !== null;
  const playing = detailOpen && playingTaskId === detailTaskId;
  const buttonClass = "pointer-events-auto grid size-10 cursor-pointer place-items-center border bg-transparent transition-colors hover:border-white/55 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <>
      {detailOpen && activityProgress && <ActivityProgressStack completed={activityProgress.completed} total={activityProgress.total} />}
      <div aria-hidden="true" className="size-10 shrink-0" />
      <div aria-hidden="true" className="size-10 shrink-0" />
      <div aria-hidden="true" className="size-10 shrink-0" />
      <div aria-hidden="true" className="size-10 shrink-0" />
      <div aria-hidden="true" className="size-10 shrink-0" />
      <div aria-hidden="true" className="size-10 shrink-0" />
      {detailOpen && (
        <>
          <button aria-label="Back to activity tasks" className={`${buttonClass} fixed rounded-[4px] border-transparent text-white/70`} style={{ bottom: railBackButtonBottom, right: "calc(var(--rail-edge-inset) + 5px)" }} onClick={() => { setPlayingTaskId(null); requestTaskGrid(); }} type="button"><FiArrowLeft aria-hidden="true" className="size-5" /></button>
          <button aria-label={playing ? "Pause activity" : "Play activity"} aria-pressed={playing} className={`${buttonClass} fixed left-1/2 -translate-x-1/2 rounded-full border-white/45 text-white/70`} style={{ bottom: "calc(var(--composer-height) + 0.5rem)" }} onClick={() => setPlayingTaskId(playing ? null : detailTaskId)} type="button">{playing ? <FiPause aria-hidden="true" className="size-5" /> : <FiPlay aria-hidden="true" className="size-5" />}</button>
        </>
      )}
    </>
  );
}

export function MinimapRail() {
  const pathname = usePathname();
  const statsPage = pathname === "/state";
  const showRail = !statsPage && pathname !== "/interactions";
  const { threadOpen, setThreadOpen } = useChatConversation();
  const { activityOpen } = useActivityWorkspace();
  const { view } = useActionsView();
  const showGridToggle = !activityOpen && ["world-tree", "world-grid", "world-heatmap"].includes(view);

  return (
    <>
    {showRail && <aside aria-label="Application navigation" className="pointer-events-none fixed inset-0 z-[160]">
      <div className="flex h-dvh w-full justify-end" style={{ paddingRight: "var(--rail-edge-inset)" }}>
        <nav aria-label="Page navigation" className="relative z-[160] flex h-dvh w-10 flex-col items-center">
          <div className="pointer-events-auto absolute right-[5px]" style={{ bottom: "calc(var(--composer-height) + 3.75rem)" }}><MapViewSwitcher /></div>
          {showGridToggle && (
            <div className="pointer-events-auto absolute right-[5px]" style={{ bottom: railBackButtonBottom }}>
              <WorldGridViewButton />
            </div>
          )}
          <div className="mt-auto flex flex-col items-center gap-2" style={{ paddingBottom: "calc(var(--composer-height) + 5.5rem)" }}>
            <RailViewButtons activityOpen={activityOpen} />
          </div>
        </nav>
      </div>
    </aside>}
    {pathname === "/interactions" && threadOpen && <aside aria-label="Chat navigation" className="pointer-events-none fixed inset-0 z-[160] md:hidden">
      <button aria-label="Back to conversations" className="pointer-events-auto fixed grid size-10 cursor-pointer place-items-center rounded-[4px] text-white/70 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white" onClick={() => setThreadOpen(false)} style={{ bottom: railBackButtonBottom, right: "calc(var(--rail-edge-inset) + 5px)" }} type="button"><FiArrowLeft aria-hidden="true" className="size-5" /></button>
    </aside>}
    </>
  );
}

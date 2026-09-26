"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FiArrowLeft, FiMessageCircle, FiPause, FiPlay } from "react-icons/fi";
import { useActivityWorkspace } from "./activity-workspace-context";
import { MapViewSwitcher, WorldGridViewButton } from "./map-view-switcher";
import { useQuestCommands } from "./quest-terminal/use-quest-commands";
import { useTerminalView } from "./terminal-view-context";

function ChatViewButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {

  return (
    <button
      aria-label={open ? "Hide chat" : "Show chat"}
      aria-pressed={open}
      className={`pointer-events-auto grid size-10 cursor-pointer place-items-center rounded-[4px] border bg-black transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${open ? "border-white text-white" : "border-transparent text-white/55 hover:border-white/55 hover:text-white"}`}
      onClick={onToggle}
      type="button"
    >
      <FiMessageCircle aria-hidden="true" className="size-5" />
    </button>
  );
}

function ChatPopover() {
  const { commands } = useQuestCommands();
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const messages = commands.filter((command) => command.type === "chat-message").slice(-8);
  const feed = [
    { sender: "Raphael", item: "Hey, I'm here. What are we working on today?", executedAt: "" },
    ...messages.map((message) => ({ ...message, sender: "You" })),
  ];

  return (
    <section aria-label="Chat feed" className="pointer-events-auto fixed z-[130] flex h-64 w-[min(21rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border border-white/25 bg-[#111] shadow-2xl" style={position ? { left: position.left, top: position.top } : { bottom: "calc(var(--composer-height) + 1rem)", right: "var(--rail-edge-inset)" }}>
      <header
        className="flex cursor-grab touch-none select-none items-center justify-between border-b border-white/15 px-3 py-2 active:cursor-grabbing"
        onPointerDown={(event) => {
          const rect = event.currentTarget.parentElement?.getBoundingClientRect();
          if (!rect) return;
          dragRef.current = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragRef.current) return;
          const width = event.currentTarget.parentElement?.offsetWidth ?? 336;
          const height = event.currentTarget.parentElement?.offsetHeight ?? 256;
          setPosition({
            left: Math.max(8, Math.min(window.innerWidth - width - 8, event.clientX - dragRef.current.offsetX)),
            top: Math.max(8, Math.min(window.innerHeight - height - 8, event.clientY - dragRef.current.offsetY)),
          });
        }}
        onPointerUp={(event) => {
          dragRef.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      >
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/70">Chat</span>
        <span className="flex items-center gap-1.5 text-[0.5rem] uppercase tracking-[0.12em] text-white/35"><span className="size-1.5 rounded-full bg-white/70" />Live</span>
      </header>
      <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3 text-xs leading-5">
        {feed.map((message, index) => (
          <li className="break-words" key={`${message.executedAt ?? "message"}-${index}`}>
            <span className="mr-2 font-semibold text-white/65">{message.sender}</span>
            <span className="text-white/75">{message.item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

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
          <button aria-label="Back to activity tasks" className={`${buttonClass} fixed rounded-[4px] border-transparent text-white/70`} style={{ bottom: "calc(var(--composer-height) + 0.5rem)", right: "calc(var(--rail-edge-inset) + 5px)" }} onClick={() => { setPlayingTaskId(null); requestTaskGrid(); }} type="button"><FiArrowLeft aria-hidden="true" className="size-5" /></button>
          <button aria-label={playing ? "Pause activity" : "Play activity"} aria-pressed={playing} className={`${buttonClass} fixed left-1/2 -translate-x-1/2 rounded-full border-white/45 text-white/70`} style={{ bottom: "calc(var(--composer-height) + 0.5rem)" }} onClick={() => setPlayingTaskId(playing ? null : detailTaskId)} type="button">{playing ? <FiPause aria-hidden="true" className="size-5" /> : <FiPlay aria-hidden="true" className="size-5" />}</button>
        </>
      )}
    </>
  );
}

export function MinimapRail() {
  const pathname = usePathname();
  const statsPage = pathname === "/stats";
  const showRail = !statsPage && pathname !== "/chat";
  const { activityOpen } = useActivityWorkspace();
  const { view } = useTerminalView();
  const showGridToggle = !activityOpen && ["world-tree", "world-grid", "world-heatmap"].includes(view);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
    {showRail && chatOpen && <ChatPopover />}
    {showRail && <aside aria-label="Application navigation" className="pointer-events-none fixed inset-0 z-[160]">
      <div className="flex h-dvh w-full justify-end" style={{ paddingRight: "var(--rail-edge-inset)" }}>
        <nav aria-label="Page navigation" className="relative z-[160] flex h-dvh w-10 flex-col items-center">
          <div className="pointer-events-auto absolute right-[5px] flex flex-col gap-16" style={{ bottom: "calc(var(--composer-height) + 3.75rem)" }}><div className="flex flex-col gap-2">{showGridToggle ? <WorldGridViewButton /> : <div aria-hidden="true" className="size-10" />}<ChatViewButton onToggle={() => setChatOpen((open) => !open)} open={chatOpen} /></div><MapViewSwitcher /></div>
          <div className="mt-auto flex flex-col items-center gap-2" style={{ paddingBottom: "calc(var(--composer-height) + 5.5rem)" }}>
            <RailViewButtons activityOpen={activityOpen} />
          </div>
        </nav>
      </div>
    </aside>}
    </>
  );
}

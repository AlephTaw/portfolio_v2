"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMessageCircle } from "react-icons/fi";
import { MinimapIcon } from "./minimap-icon";
import { communicationsStateEvent, toggleCommunicationsEvent, toggleMinimapEvent, type CommunicationsStateDetail } from "./page-transition-events";
import { ExecuteCommandControl } from "./quest-terminal";
import { useSplitView } from "./split-view-context";

function ComposerChatButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const updateState = (event: Event) => setOpen((event as CustomEvent<CommunicationsStateDetail>).detail.open);
    window.addEventListener(communicationsStateEvent, updateState);
    return () => window.removeEventListener(communicationsStateEvent, updateState);
  }, []);

  return (
    <button
      aria-label={open ? "Close communications" : "Open communications"}
      aria-pressed={open}
      className={`grid size-10 cursor-pointer place-items-center rounded-[3px] border bg-black text-white transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${open ? "border-white" : "border-transparent hover:border-white/70"}`}
      onClick={() => window.dispatchEvent(new Event(toggleCommunicationsEvent))}
      type="button"
    >
      <FiMessageCircle aria-hidden="true" className="size-5" />
    </button>
  );
}

function ComposerMinimapButton() {
  return (
    <button
      aria-label="Toggle minimap"
      className="grid size-10 cursor-pointer place-items-center rounded-[3px] border border-transparent bg-black transition-colors hover:border-white/70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
      onClick={() => window.dispatchEvent(new Event(toggleMinimapEvent))}
      type="button"
    >
      <MinimapIcon className="size-6" />
    </button>
  );
}

function ComposerSplitButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { setLeftPane, setSplitMode, splitMode, splitViewOpen } = useSplitView();
  const nextSplitMode = splitMode === "none" ? "vertical" : splitMode === "vertical" ? "horizontal" : "none";
  const splitModeLabel = splitMode === "none" ? "No split" : splitMode === "vertical" ? "Vertical split" : "Horizontal split";
  const nextSplitModeLabel = nextSplitMode === "none" ? "no split" : `${nextSplitMode} split`;

  return (
    <button
      aria-label={`${splitModeLabel}. Switch to ${nextSplitModeLabel}`}
      className={`pointer-events-auto grid size-10 cursor-pointer place-items-center rounded-[3px] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${
        splitViewOpen
          ? "bg-white text-black"
          : "bg-black text-white hover:bg-white hover:text-black"
      }`}
      onClick={() => {
        if (nextSplitMode === "none") {
          setSplitMode("none");
          router.push("/terminal");
          return;
        }
        if (splitMode === "none") setLeftPane(pathname === "/world" ? "world" : "stats");
        setSplitMode(nextSplitMode);
      }}
      type="button"
    >
      {splitMode === "none" ? (
        <span aria-hidden="true" className="h-4 w-6 border-2 border-current" />
      ) : splitMode === "vertical" ? (
        <span aria-hidden="true" className="relative h-4 w-6 border-2 border-current">
          <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-current" />
        </span>
      ) : (
        <span aria-hidden="true" className="relative h-4 w-6 border-2 border-current">
          <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-current" />
        </span>
      )}
    </button>
  );
}

function ComposerDockActions() {
  return (
    <span className="flex items-center justify-center gap-2">
      <ComposerChatButton />
      <ComposerSplitButton />
      <ComposerMinimapButton />
    </span>
  );
}

export function PrivateComposer() {
  return (
    <div
      aria-label="Command composer"
      className="fixed inset-x-0 bottom-0 z-[115] bg-black pt-1"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="relative z-50 mx-auto flex min-h-10 w-full max-w-[72rem] items-end gap-3 px-[clamp(1.5rem,4.4vw,3.5rem)] text-xs text-white/55">
        <div className="min-w-0 flex-1">
          <ExecuteCommandControl commandLineActions={<ComposerDockActions />} variant="command-line" />
        </div>
      </div>
    </div>
  );
}

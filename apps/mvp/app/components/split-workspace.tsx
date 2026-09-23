"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import StatsDisplay from "../stats/stats-display";
import { PinScrollArea } from "./pin-scroll-area";
import { TerminalActivityWorkspace } from "./activity-workspace";
import { useSplitView } from "./split-view-context";
import { WorldDisplay } from "../world/world-display";

function TerminalPane() {
  return (
    <section className="h-full min-h-0 min-w-0 overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[72rem] flex-col px-[clamp(1.5rem,4.4vw,3.5rem)] pb-10">
        <TerminalActivityWorkspace />
      </div>
    </section>
  );
}

export function SplitWorkspace({ children }: { children: ReactNode }) {
  const { leftPane, setSplitRatio, splitMode, splitRatio, splitViewOpen } = useSplitView();
  const [activePane, setActivePane] = useState<"left" | "right">("right");
  const [dividerActive, setDividerActive] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const draggingDivider = useRef(false);
  const isHorizontalSplit = splitMode === "horizontal";

  useEffect(() => {
    if (!dividerActive) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (!draggingDivider.current) return;
      const bounds = workspaceRef.current?.getBoundingClientRect();
      if (!bounds) return;
      setSplitRatio(
        isHorizontalSplit
          ? ((event.clientY - bounds.top) / bounds.height) * 100
          : ((event.clientX - bounds.left) / bounds.width) * 100,
      );
    };
    const stopDragging = () => {
      draggingDivider.current = false;
      setDividerActive(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [dividerActive, isHorizontalSplit, setSplitRatio]);

  const startDraggingDivider = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    draggingDivider.current = true;
    setDividerActive(true);
  };

  if (!splitViewOpen) return children;

  return (
    <div
      className="relative grid h-dvh min-h-0 overflow-hidden bg-black"
      data-active-pane={activePane}
      ref={workspaceRef}
      style={isHorizontalSplit
        ? { gridTemplateRows: `${splitRatio}fr ${100 - splitRatio}fr` }
        : { gridTemplateColumns: `${splitRatio}fr ${100 - splitRatio}fr` }}
    >
      <section
        className={`h-full min-h-0 min-w-0 overflow-hidden ${isHorizontalSplit ? "border-b border-white/20" : "border-r border-white/20"}`}
        data-pane="left"
        onFocusCapture={() => setActivePane("left")}
        onPointerEnter={() => setActivePane("left")}
        onTouchStart={() => setActivePane("left")}
      >
        <PinScrollArea className="overscroll-contain touch-pan-y" tabIndex={0} wrapperClassName="h-full">
          {leftPane === "world" ? <WorldDisplay /> : <StatsDisplay />}
        </PinScrollArea>
      </section>
      <div
        className="h-full min-h-0 min-w-0 touch-pan-y"
        data-pane="right"
        onFocusCapture={() => setActivePane("right")}
        onPointerEnter={() => setActivePane("right")}
        onTouchStart={() => setActivePane("right")}
      >
        <TerminalPane />
      </div>
      <button
        aria-label="Resize split panes"
        className={`absolute z-20 touch-none bg-transparent ${
          isHorizontalSplit
            ? "inset-x-0 h-3 -translate-y-1/2 cursor-row-resize"
            : "inset-y-0 w-3 -translate-x-1/2 cursor-col-resize"
        } ${dividerActive ? "" : "hover:bg-white/10"}`}
        onClick={() => setDividerActive(true)}
        onPointerDown={startDraggingDivider}
        style={isHorizontalSplit ? { top: `${splitRatio}%` } : { left: `${splitRatio}%` }}
        type="button"
      >
        <span
          aria-hidden="true"
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-opacity ${
            isHorizontalSplit ? "h-1 w-16" : "h-16 w-1"
          } ${dividerActive ? "opacity-100" : "opacity-0"}`}
        />
      </button>
    </div>
  );
}

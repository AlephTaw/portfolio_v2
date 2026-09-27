"use client";

import { useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { StateScreen } from "../state/components/state-screen";
import { PinScrollArea } from "./pin-scroll-area";
import { SplitResizeHandle } from "./split-resize-handle";
import { ActionsWorkspace } from "./activity-workspace";
import { useSplitView } from "./split-view-context";
import { WorldDisplay } from "../world/world-display";

function ActionsPane() {
  return (
    <section className="h-full min-h-0 min-w-0 overflow-hidden bg-background text-foreground">
      <div className="flex h-full min-h-0 w-full flex-col pb-10">
        <ActionsWorkspace />
      </div>
    </section>
  );
}

export function SplitWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { leftPane, setSplitRatio, splitMode, splitRatio, splitViewOpen } = useSplitView();
  const [activePane, setActivePane] = useState<"left" | "right">("right");
  const workspaceRef = useRef<HTMLDivElement>(null);
  const isHorizontalSplit = splitMode === "horizontal";

  if (!splitViewOpen || pathname === "/interactions") return children;

  return (
    <div
      className="relative grid h-full min-h-0 overflow-hidden bg-black"
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
          {leftPane === "world" ? <WorldDisplay /> : <StateScreen />}
        </PinScrollArea>
      </section>
      <div
        className="h-full min-h-0 min-w-0 touch-pan-y"
        data-pane="right"
        onFocusCapture={() => setActivePane("right")}
        onPointerEnter={() => setActivePane("right")}
        onTouchStart={() => setActivePane("right")}
      >
        <ActionsPane />
      </div>
      <SplitResizeHandle containerRef={workspaceRef} direction={isHorizontalSplit ? "horizontal" : "vertical"} label="Resize split panes" onRatioChange={setSplitRatio} ratio={splitRatio} />
    </div>
  );
}

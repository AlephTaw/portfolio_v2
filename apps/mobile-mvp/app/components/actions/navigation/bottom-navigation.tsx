"use client";

import type { PanelView } from "../workspace-state";
import { CurrentActivityIcon } from "./current-activity-icon";

function DockIcon({ name }: { name: "systems" | "knapsack" | "chat" | "helmet" }) {
  return <span aria-hidden="true" className="block h-6 w-6 bg-current sm:h-[17px] sm:w-[17px]" style={{
    mask: `url('/icons/${name}.svg') center / contain no-repeat`,
    WebkitMask: `url('/icons/${name}.svg') center / contain no-repeat`,
  }} />;
}

export function BottomNavigation({ activeView, onViewChange, composing, onBeginCommand, onHideCommand }: {
  activeView: PanelView | null;
  onViewChange: (view: PanelView) => void;
  composing: boolean;
  onBeginCommand: () => void;
  onHideCommand: () => void;
}) {
  const itemStyle = "flex min-h-11 min-w-0 touch-manipulation select-none flex-col items-center justify-center gap-1 text-[9px] font-normal";

  return <nav aria-label="Main navigation" className="actions-icon-dock fixed inset-x-0 bottom-0 mx-auto grid w-full grid-cols-5 items-center px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 sm:relative sm:inset-auto sm:max-w-[320px] sm:rounded-xl sm:py-2">
      <button type="button" onClick={() => onViewChange("build")} aria-pressed={activeView === "build"} className={`${itemStyle} ${activeView === "build" ? "text-white" : "text-white/60 hover:text-white"}`}><DockIcon name="systems" /><span className="sr-only sm:not-sr-only">Build</span></button>
      <button type="button" onClick={() => onViewChange("inventory")} aria-pressed={activeView === "inventory"} className={`${itemStyle} ${activeView === "inventory" ? "text-white" : "text-white/60 hover:text-white"}`}><DockIcon name="knapsack" /><span className="sr-only sm:not-sr-only">Inventory</span></button>
      <button type="button" aria-label="Create action" aria-pressed={composing} onClick={composing ? onHideCommand : onBeginCommand} className="actions-create-button mx-auto grid h-11 w-11 touch-manipulation place-items-center rounded-full text-white transition-colors">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
      </button>
      <button type="button" onClick={() => onViewChange("chat")} aria-pressed={activeView === "chat"} className={`${itemStyle} ${activeView === "chat" ? "text-white" : "text-white/60 hover:text-white"}`}><DockIcon name="chat" /><span className="sr-only sm:not-sr-only">Chat</span></button>
      <button type="button" aria-label="Current activity" aria-pressed={activeView === "activity"} onClick={() => onViewChange("activity")} className={`${itemStyle} ${activeView === "activity" ? "text-white" : "text-white/60 hover:text-white"}`}>
        <CurrentActivityIcon />
        <span aria-hidden="true" className="sr-only sm:not-sr-only">Activity</span>
      </button>
    </nav>;
}

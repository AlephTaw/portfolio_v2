"use client";

import { usePathname } from "next/navigation";
import { GiKnapsack } from "react-icons/gi";
import { useActivityWorkspace } from "./activity-workspace-context";
import { useOpenTerminalView, useTerminalView } from "./terminal-view-context";

export function KnapsackButton() {
  const pathname = usePathname();
  const { activityOpen } = useActivityWorkspace();
  const { view } = useTerminalView();
  const openView = useOpenTerminalView();
  const selected = !activityOpen && view === "inventory";

  if (pathname === "/stats" || pathname === "/chat") return null;

  return (
    <div className="shrink-0">
    <button
      aria-label="Open knapsack"
      aria-pressed={selected}
      className={`grid size-10 shrink-0 cursor-pointer place-items-center rounded-[4px] bg-transparent transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${selected ? "text-white" : "text-white/55"}`}
      onClick={() => openView("inventory")}
      type="button"
    >
      <GiKnapsack aria-hidden="true" className="size-[1.875rem]" />
    </button>
    </div>
  );
}

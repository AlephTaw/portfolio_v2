"use client";

import { usePathname } from "next/navigation";
import { FiLayers, FiTerminal } from "react-icons/fi";
import { useActivityWorkspace } from "./activity-workspace-context";
import { useActionsView, useOpenActionsView } from "./actions-view-context";

export function ActionsDockShortcuts() {
  const pathname = usePathname();
  const { activityOpen } = useActivityWorkspace();
  const { view } = useActionsView();
  const openView = useOpenActionsView();

  if (pathname !== "/actions") return null;

  return <>
    <button type="button" aria-label="Systems" title="Systems" aria-pressed={!activityOpen && view === "systems"} onClick={() => openView("systems")} className={`grid size-10 shrink-0 cursor-pointer place-items-center rounded-[4px] bg-transparent transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${!activityOpen && view === "systems" ? "text-white" : "text-white/55"}`}>
      <FiLayers aria-hidden="true" className="size-[1.875rem]" />
    </button>
    <button
      type="button"
      aria-label="Open terminal"
      aria-pressed={!activityOpen && view === "minimap"}
      onClick={() => openView("minimap")}
      className={`grid size-10 shrink-0 cursor-pointer place-items-center rounded-[4px] bg-transparent transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${!activityOpen && view === "minimap" ? "text-white" : "text-white/55"}`}
    >
      <FiTerminal aria-hidden="true" className="size-[1.875rem]" />
    </button>
  </>;
}

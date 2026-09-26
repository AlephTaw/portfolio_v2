"use client";

import cognitiveNetworkMap from "../../../agent/public/cognitive-network-map.png";
import { FiTerminal } from "react-icons/fi";
import { useActivityWorkspace } from "./activity-workspace-context";
import { useOpenTerminalView, useTerminalView } from "./terminal-view-context";

export function MapViewSwitcher() {
  const { activityOpen } = useActivityWorkspace();
  const { view } = useTerminalView();
  const openView = useOpenTerminalView();
  const showMinimap = !activityOpen && view === "world-tree";

  return (
    <button
      aria-label={showMinimap ? "Minimap view" : "World Tree map view"}
      className="grid size-10 cursor-pointer place-items-center rounded-[4px] border border-transparent bg-black text-white/55 transition-colors hover:border-white/55 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
      onClick={() => openView(showMinimap ? "minimap" : "world-tree")}
      type="button"
    >
      {showMinimap ? <FiTerminal aria-hidden="true" className="size-[1.875rem]" /> : (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" aria-hidden="true" className="size-[1.875rem] rounded-full object-contain" src={cognitiveNetworkMap.src} />
      )}
    </button>
  );
}

export function WorldGridViewButton() {
  const { view } = useTerminalView();
  const openView = useOpenTerminalView();
  const gridOpen = view === "world-grid";
  return (
    <button
      aria-label={gridOpen ? "Show World Tree heat map" : "Show square grid"}
      className="grid size-10 cursor-pointer place-items-center rounded-[4px] border border-transparent bg-black text-white/55 transition-colors hover:border-white/55 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
      onClick={() => openView(gridOpen ? "world-heatmap" : "world-grid")}
      type="button"
    >
      <span aria-hidden="true" className="grid size-6 grid-cols-3 grid-rows-3 gap-0.5">
        {Array.from({ length: 9 }, (_, index) => <span className={gridOpen ? "bg-current" : "border border-current"} key={index} style={gridOpen ? { opacity: 0.3 + (index % 4) * 0.15 } : undefined} />)}
      </span>
    </button>
  );
}

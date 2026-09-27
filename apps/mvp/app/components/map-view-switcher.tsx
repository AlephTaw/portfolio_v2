"use client";

import cognitiveNetworkMap from "../../../agent/public/cognitive-network-map.png";
import { FiMessageSquare, FiTerminal } from "react-icons/fi";
import { AttentionCountBadge, worldTreeNotifications } from "./attention-notifications";
import { useActivityWorkspace } from "./activity-workspace-context";
import { useOpenActionsView, useActionsView } from "./actions-view-context";

export function MapViewSwitcher() {
  const { activityOpen } = useActivityWorkspace();
  const { view } = useActionsView();
  const openView = useOpenActionsView();
  const showActions = !activityOpen && ["world-tree", "world-grid", "world-heatmap"].includes(view);

  return (
    <button
      aria-label={showActions ? "Actions view" : "World Tree minimap view"}
      className="relative grid size-10 cursor-pointer place-items-center rounded-[4px] border border-transparent bg-black text-white/55 transition-colors hover:border-white/55 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
      onClick={() => openView(showActions ? "minimap" : "world-tree")}
      type="button"
    >
      {showActions ? <FiTerminal aria-hidden="true" className="size-[1.875rem]" /> : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" aria-hidden="true" className="size-[1.875rem] rounded-full object-contain" src={cognitiveNetworkMap.src} />
          <AttentionCountBadge count={worldTreeNotifications.length} />
        </>
      )}
    </button>
  );
}

export function ActionsChatToggle({ visible, onToggle }: { visible?: boolean; onToggle?: () => void } = {}) {
  const terminal = useActionsView();
  const chatVisible = visible ?? terminal.chatVisible;
  const toggleChat = onToggle ?? terminal.toggleChat;
  return <button aria-label={chatVisible ? "Hide chat" : "Show chat"} aria-pressed={chatVisible} onClick={toggleChat} type="button" className="relative grid size-10 cursor-pointer place-items-center rounded-[4px] border border-transparent bg-black text-white/55 transition-colors hover:border-white/55 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white">
    <FiMessageSquare aria-hidden="true" className="size-6" />
    {!chatVisible && <svg aria-hidden="true" className="absolute size-7" viewBox="0 0 28 28"><path d="M4 24 24 4" stroke="black" strokeWidth="5" /><path d="M4 24 24 4" stroke="currentColor" strokeWidth="1.5" /></svg>}
  </button>;
}

export function WorldGridViewButton() {
  const { view } = useActionsView();
  const openView = useOpenActionsView();
  const gridOpen = view === "world-grid";
  return (
    <button
      aria-label={gridOpen ? "Back to World Tree" : "Show vertical feed"}
      className="grid size-10 cursor-pointer place-items-center rounded-[4px] border border-transparent bg-black text-white/55 transition-colors hover:border-white/55 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
      onClick={() => openView(gridOpen ? "world-heatmap" : "world-grid")}
      type="button"
    >
      {gridOpen ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" aria-hidden="true" className="size-6" height={24} src="/icons/solid-network.svg" width={24} />
      ) : (
        <svg aria-hidden="true" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="2" width="12" height="20" rx="1.5" fill="currentColor" />
          <path d="M12 6v12m-3-9 3-3 3 3m-6 6 3 3 3-3" stroke="black" />
        </svg>
      )}
    </button>
  );
}

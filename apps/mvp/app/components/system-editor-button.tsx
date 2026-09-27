"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useStateView } from "../state/components/state-view-context";
import { useActivityWorkspace } from "./activity-workspace-context";
import { useActionsView, type ActionsView } from "./actions-view-context";

export function SystemEditorButton() {
  const statsPage = usePathname() === "/state";
  const { editorOpen, setEditorOpen } = useStateView();
  const { view, setView } = useActionsView();
  const { activityOpen, setActivityOpen } = useActivityWorkspace();
  const previous = useRef<{ view: ActionsView; activityOpen: boolean }>({ view: "minimap", activityOpen: false });
  const selected = statsPage ? editorOpen : view === "code-preview";

  return (
    <button
      type="button"
      className="shrink-0 cursor-pointer whitespace-nowrap rounded-md border border-white/25 px-2 py-1 text-white/70 transition-colors hover:border-white/55 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
      onClick={() => {
        if (statsPage) {
          setEditorOpen(!editorOpen);
          return;
        }
        if (selected) {
          setView(previous.current.view);
          setActivityOpen(previous.current.activityOpen);
        } else {
          previous.current = { view, activityOpen };
          setActivityOpen(false);
          setView("code-preview");
        }
      }}
    >
      {selected ? "Back to Activity" : "System Editor"}
    </button>
  );
}

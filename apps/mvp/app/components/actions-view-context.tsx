"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useActivityWorkspace } from "./activity-workspace-context";
import { useSplitView } from "./split-view-context";

export type ActionsView = "code" | "notes-hidden" | "notes" | "code-preview" | "communications" | "world-tree" | "world-grid" | "world-heatmap" | "minimap" | "inventory" | "stats" | "apps" | "running-tasks" | "systems";

export function isSpeedrunView(view: ActionsView) {
  return view === "notes-hidden" || view === "notes" || view === "code-preview";
}

export function actionsRailSelection(view: ActionsView): "communications" | "world-tree" | "minimap" | "inventory" | "stats" | "speedrun" {
  if (view === "communications" || view === "world-tree" || view === "world-grid" || view === "world-heatmap" || view === "minimap" || view === "inventory" || view === "stats") return view === "world-grid" || view === "world-heatmap" ? "world-tree" : view;
  return "speedrun";
}

type ActionsViewContextValue = {
  view: ActionsView;
  setView: (view: ActionsView) => void;
  chatVisible: boolean;
  toggleChat: () => void;
};

const ActionsViewContext = createContext<ActionsViewContextValue | null>(null);

export function ActionsViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ActionsView>("minimap");
  const { activityOpen } = useActivityWorkspace();
  const [chatVisibility, setChatVisibility] = useState<Record<string, boolean>>({});
  const chatKey = activityOpen ? "activity" : view;
  const chatVisible = chatVisibility[chatKey] ?? (!activityOpen && ["minimap", "code", "notes"].includes(view));
  const toggleChat = () => setChatVisibility(previous => ({ ...previous, [chatKey]: !chatVisible }));
  return <ActionsViewContext.Provider value={{ view, setView, chatVisible, toggleChat }}>{children}</ActionsViewContext.Provider>;
}

export function useActionsView() {
  const context = useContext(ActionsViewContext);
  if (!context) throw new Error("useActionsView must be used within ActionsViewProvider");
  return context;
}

export function useOpenActionsView() {
  const pathname = usePathname();
  const router = useRouter();
  const { splitViewOpen } = useSplitView();
  const { setActivityOpen } = useActivityWorkspace();
  const { setView, view } = useActionsView();

  return (nextView: ActionsView | "speedrun") => {
    if (nextView === "minimap") {
      setActivityOpen(false);
      setView("minimap");
    } else if (nextView === "speedrun") {
      setActivityOpen(false);
      if (!isSpeedrunView(view)) setView("notes-hidden");
    } else {
      setActivityOpen(false);
      setView(nextView);
    }
    if (pathname === "/interactions" || (!splitViewOpen && pathname !== "/actions")) router.push("/actions");
  };
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useActivityWorkspace } from "./activity-workspace-context";
import { useSplitView } from "./split-view-context";

export type TerminalView = "code" | "notes-hidden" | "notes" | "code-preview" | "communications" | "world-tree" | "world-grid" | "world-heatmap" | "minimap" | "inventory" | "stats" | "apps";

export function isSpeedrunView(view: TerminalView) {
  return view === "notes-hidden" || view === "notes" || view === "code-preview";
}

export function terminalRailSelection(view: TerminalView): "communications" | "world-tree" | "minimap" | "inventory" | "stats" | "speedrun" {
  if (view === "communications" || view === "world-tree" || view === "world-grid" || view === "world-heatmap" || view === "minimap" || view === "inventory" || view === "stats") return view === "world-grid" || view === "world-heatmap" ? "world-tree" : view;
  return "speedrun";
}

type TerminalViewContextValue = {
  view: TerminalView;
  setView: (view: TerminalView) => void;
};

const TerminalViewContext = createContext<TerminalViewContextValue | null>(null);

export function TerminalViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<TerminalView>("minimap");
  return <TerminalViewContext.Provider value={{ view, setView }}>{children}</TerminalViewContext.Provider>;
}

export function useTerminalView() {
  const context = useContext(TerminalViewContext);
  if (!context) throw new Error("useTerminalView must be used within TerminalViewProvider");
  return context;
}

export function useOpenTerminalView() {
  const pathname = usePathname();
  const router = useRouter();
  const { splitViewOpen } = useSplitView();
  const { setActivityOpen } = useActivityWorkspace();
  const { setView, view } = useTerminalView();

  return (nextView: TerminalView | "speedrun") => {
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
    if (pathname === "/chat" || (!splitViewOpen && pathname !== "/terminal")) router.push("/terminal");
  };
}

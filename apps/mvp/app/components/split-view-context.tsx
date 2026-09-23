"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";

type SplitPane = "stats" | "world";
export type SplitMode = "none" | "vertical" | "horizontal";

type SplitViewContextValue = {
  splitMode: SplitMode;
  splitViewOpen: boolean;
  leftPane: SplitPane;
  splitRatio: number;
  setLeftPane: (pane: SplitPane) => void;
  setSplitMode: (mode: SplitMode) => void;
  setSplitRatio: (ratio: number) => void;
};

const SplitViewContext = createContext<SplitViewContextValue | null>(null);
const splitViewStorageKey = "speedrun-irl:split-view";
const splitViewChangedEvent = "speedrun-irl:split-view-changed";

function subscribeToSplitView(onStoreChange: () => void) {
  window.addEventListener(splitViewChangedEvent, onStoreChange);
  return () => window.removeEventListener(splitViewChangedEvent, onStoreChange);
}

function getSplitViewSnapshot(): SplitMode {
  const storedMode = window.localStorage.getItem(splitViewStorageKey);
  if (storedMode === "vertical" || storedMode === "horizontal") return storedMode;
  if (storedMode === "true") return "vertical";
  return "none";
}

function getServerSplitViewSnapshot(): SplitMode {
  return "none";
}

export function SplitViewProvider({ children }: { children: ReactNode }) {
  const splitMode = useSyncExternalStore(
    subscribeToSplitView,
    getSplitViewSnapshot,
    getServerSplitViewSnapshot,
  );
  const splitViewOpen = splitMode !== "none";
  const [leftPane, setLeftPane] = useState<SplitPane>("stats");
  const [splitRatio, setSplitRatioState] = useState(50);

  const setSplitRatio = (ratio: number) => {
    setSplitRatioState(Math.min(75, Math.max(25, ratio)));
  };

  const setSplitMode = (mode: SplitMode) => {
    window.localStorage.setItem(splitViewStorageKey, mode);
    window.dispatchEvent(new Event(splitViewChangedEvent));
  };

  return (
    <SplitViewContext.Provider value={{ splitMode, splitViewOpen, leftPane, setLeftPane, setSplitMode, setSplitRatio, splitRatio }}>
      {children}
    </SplitViewContext.Provider>
  );
}

export function useSplitView() {
  const context = useContext(SplitViewContext);
  if (!context) throw new Error("useSplitView must be used within SplitViewProvider");
  return context;
}

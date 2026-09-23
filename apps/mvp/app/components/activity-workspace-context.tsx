"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  activityWorkspaceStateEvent,
  toggleActivityWorkspaceEvent,
} from "./quest-terminal";

type ActivityWorkspaceContextValue = {
  activityOpen: boolean;
  setActivityOpen: (open: boolean) => void;
};

const ActivityWorkspaceContext = createContext<ActivityWorkspaceContextValue | null>(null);

export function ActivityWorkspaceProvider({ children }: { children: ReactNode }) {
  const [activityOpen, setActivityOpen] = useState(false);

  useEffect(() => {
    const toggleWorkspace = () => setActivityOpen((open) => !open);
    window.addEventListener(toggleActivityWorkspaceEvent, toggleWorkspace);
    return () => window.removeEventListener(toggleActivityWorkspaceEvent, toggleWorkspace);
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<{ open: boolean }>(activityWorkspaceStateEvent, {
        detail: { open: activityOpen },
      }),
    );
  }, [activityOpen]);

  useEffect(() => {
    if (!activityOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivityOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activityOpen]);

  return (
    <ActivityWorkspaceContext.Provider value={{ activityOpen, setActivityOpen }}>
      {children}
    </ActivityWorkspaceContext.Provider>
  );
}

export function useActivityWorkspace() {
  const context = useContext(ActivityWorkspaceContext);
  if (!context) throw new Error("useActivityWorkspace must be used within ActivityWorkspaceProvider");
  return context;
}

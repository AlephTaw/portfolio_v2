"use client";

import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { ActivityCategory } from "./quest-terminal/use-active-activity";
import { activityWorkspaceStateEvent, toggleActivityWorkspaceEvent } from "./activity-workspace-events";

type NavigationRequest = { id: number; action: "current" | "categories" | "task-grid" | "tasks" } | { id: number; action: "category"; category: ActivityCategory };
type ActivityProgress = { category: ActivityCategory; completed: number; total: number };

type ActivityWorkspaceContextValue = {
  activityOpen: boolean;
  setActivityOpen: (open: boolean) => void;
  detailTaskId: string | null;
  setDetailTaskId: (taskId: string | null) => void;
  activityProgress: ActivityProgress | null;
  setActivityProgress: Dispatch<SetStateAction<ActivityProgress | null>>;
  navigationRequest: NavigationRequest | null;
  requestCurrentActivity: () => void;
  requestActivityCategories: () => void;
  requestActivityCategory: (category: ActivityCategory) => void;
  requestTaskGrid: () => void;
  requestActivityMap: () => void;
  activityMapOpen: boolean;
  setActivityMapOpen: (open: boolean) => void;
};

const ActivityWorkspaceContext = createContext<ActivityWorkspaceContextValue | null>(null);

export function ActivityWorkspaceProvider({ children }: { children: ReactNode }) {
  const [activityOpen, setActivityOpen] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [activityProgress, setActivityProgress] = useState<ActivityProgress | null>(null);
  const [activityMapOpen, setActivityMapOpen] = useState(false);
  const [navigationRequest, setNavigationRequest] = useState<ActivityWorkspaceContextValue["navigationRequest"]>(null);
  const requestCurrentActivity = () => setNavigationRequest((request) => ({ id: (request?.id ?? 0) + 1, action: "current" }));
  const requestActivityCategories = () => setNavigationRequest((request) => ({ id: (request?.id ?? 0) + 1, action: "categories" }));
  const requestActivityCategory = (category: ActivityCategory) => setNavigationRequest((request) => ({ id: (request?.id ?? 0) + 1, action: "category", category }));
  const requestTaskGrid = () => setNavigationRequest((request) => ({ id: (request?.id ?? 0) + 1, action: "task-grid" }));
  const requestActivityMap = () => setNavigationRequest((request) => ({ id: (request?.id ?? 0) + 1, action: "tasks" }));

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
    <ActivityWorkspaceContext.Provider value={{ activityOpen, setActivityOpen, detailTaskId, setDetailTaskId, activityProgress, setActivityProgress, navigationRequest, requestCurrentActivity, requestActivityCategories, requestActivityCategory, requestTaskGrid, requestActivityMap, activityMapOpen, setActivityMapOpen }}>
      {children}
    </ActivityWorkspaceContext.Provider>
  );
}

export function useActivityWorkspace() {
  const context = useContext(ActivityWorkspaceContext);
  if (!context) throw new Error("useActivityWorkspace must be used within ActivityWorkspaceProvider");
  return context;
}

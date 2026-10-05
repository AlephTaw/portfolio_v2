"use client";

import { useCallback, useEffect, useState } from "react";

export type ActiveActivity = {
  name: string;
  startedAt: number;
  category?: ActivityCategory;
  taskId?: string;
};

export const activityCategories = ["Health", "Wealth", "Connection", "Sentience", "Competence", "Purpose", "Experience", "Builds", "Quests"] as const;
export type ActivityCategory = (typeof activityCategories)[number];

const storageKey = "speedrun-irl:active-activity";
const updateEvent = "speedrun-irl:active-activity-updated";

export function readActiveActivity(): ActiveActivity | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return null;
    const activity = JSON.parse(stored) as Omit<ActiveActivity, "category"> & { category?: ActivityCategory | "Love" | "Interactions" | "Quest" };
    const category: ActivityCategory | undefined = activity.category === "Love" || activity.category === "Interactions" ? "Connection" : activity.category === "Quest" ? "Quests" : activity.category;
    const name = activity.name === "Love" || activity.name === "Interactions" ? "Connection" : activity.name;
    return { ...activity, category, name };
  } catch {
    return null;
  }
}

function persistActivity(activity: ActiveActivity | null) {
  if (activity) window.localStorage.setItem(storageKey, JSON.stringify(activity));
  else window.localStorage.removeItem(storageKey);
  window.dispatchEvent(new Event(updateEvent));
}

export function useActiveActivity() {
  const [activeActivity, setActiveActivity] = useState<ActiveActivity | null>(null);

  useEffect(() => {
    const sync = () => setActiveActivity(readActiveActivity());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(updateEvent, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(updateEvent, sync);
    };
  }, []);

  const startActivity = useCallback((name: string, category?: ActivityCategory) => {
    const activity = { name, category, startedAt: Date.now() };
    setActiveActivity(activity);
    persistActivity(activity);
  }, []);

  const startTaskActivity = useCallback((name: string, category: ActivityCategory, taskId: string) => {
    const current = readActiveActivity();
    const activity = { name, category, taskId, startedAt: current?.taskId === taskId ? current.startedAt : Date.now() };
    setActiveActivity(activity);
    persistActivity(activity);
  }, []);

  const updateActivityName = useCallback((name: string) => {
    const current = readActiveActivity();
    if (!current) return;
    const activity = { ...current, name };
    setActiveActivity(activity);
    persistActivity(activity);
  }, []);

  const stopActivity = useCallback(() => {
    setActiveActivity(null);
    persistActivity(null);
  }, []);

  return { activeActivity, startActivity, startTaskActivity, stopActivity, updateActivityName };
}

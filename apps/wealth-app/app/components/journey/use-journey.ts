"use client";
import { useSyncExternalStore } from "react";
import { isJourneyPlan, type JourneyPlan } from "../../lib/journey-plan";
const KEY = "wealth-journey-v1";
const server = { plan: { version: 1, start: "2026-10-05T09:00", showLoop: false, objectives: [] } as JourneyPlan, status: "Loading…" };
let snapshot = server;
let loaded = false;
const listeners = new Set<() => void>();
function emit() { listeners.forEach((listener) => listener()); }
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) {
    loaded = true;
    try {
      const saved = localStorage.getItem(KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : null;
      const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      const part = (type: string) => parts.find((p) => p.type === type)?.value;
      const start = part("year") + "-" + part("month") + "-" + part("day") + "T" + part("hour") + ":" + part("minute");
      snapshot = saved && isJourneyPlan(parsed) ? { plan: parsed, status: "Saved in this browser" }
        : { plan: { ...server.plan, start }, status: saved ? "Saved plan could not be read; showing an empty queue." : "Edits save in this browser" };
    } catch { snapshot = { ...server, status: "Storage unavailable; session only" }; }
    emit();
  }
  return () => { listeners.delete(listener); };
}
export function updateJourney(change: (plan: JourneyPlan) => JourneyPlan) {
  const plan = change(snapshot.plan);
  let status = "Saved in this browser";
  if (!isJourneyPlan(plan)) status = "Enter valid fields to save.";
  else { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch { status = "Storage unavailable; session only"; } }
  snapshot = { plan, status }; emit();
}
export function addJourneyObjective(title: string, minutes = 30) {
  if (!title.trim() || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440) return;
  updateJourney((plan) => ({ ...plan, objectives: [...plan.objectives, { id: crypto.randomUUID(), title: title.trim(), minutes, status: "queued" }] }));
}
export function useJourney() {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => server);
  return { ...state, update: updateJourney, add: addJourneyObjective };
}

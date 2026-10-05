"use client";
import { useSyncExternalStore } from "react";
import { defaultPlan, isPlan, validatePlan, type Plan } from "../../lib/planner";

const KEY = "wealth-plan-v1";
type Snapshot = { plan: Plan; status: string };
const server: Snapshot = { plan: defaultPlan(), status: "Loading saved plan…" };
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
      const value: unknown = saved ? JSON.parse(saved) : null;
      snapshot = saved && isPlan(value)
        ? { plan: value, status: "Saved in this browser" }
        : { plan: defaultPlan(), status: saved ? "Saved data could not be read; showing the starter plan." : "Edits save in this browser" };
    } catch { snapshot = { plan: defaultPlan(), status: "Browser storage unavailable; edits stay in this session." }; }
    emit();
  }
  return () => { listeners.delete(listener); };
}
function update(change: (plan: Plan) => Plan) {
  const plan = change(snapshot.plan);
  let status = "Saved in this browser";
  if (validatePlan(plan).length) status = "Fix the highlighted fields to save this edit.";
  else {
    try { localStorage.setItem(KEY, JSON.stringify(plan)); }
    catch { status = "Browser storage unavailable; edits stay in this session."; }
  }
  snapshot = { plan, status };
  emit();
}
export function usePlan() {
  const current = useSyncExternalStore(subscribe, () => snapshot, () => server);
  return { ...current, update };
}

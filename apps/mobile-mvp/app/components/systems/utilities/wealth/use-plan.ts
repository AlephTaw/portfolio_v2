"use client";
import { useSyncExternalStore } from "react";
import { defaultPlan, isPlan, validatePlan, type Plan } from "./planner";

const KEY = "mobile-mvp-wealth-plan-v1";
type WealthTab = "overview" | "entries" | "parameters";
type Snapshot = { plan: Plan; status: string; tab: WealthTab };
const server: Snapshot = { plan: defaultPlan(), status: "Loading saved plan…", tab: "overview" };
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
        ? { ...snapshot, plan: value, status: "Saved in this browser" }
        : { ...snapshot, plan: defaultPlan(), status: saved ? "Saved data could not be read; showing the starter plan." : "Edits save in this browser" };
    } catch { snapshot = { ...snapshot, plan: defaultPlan(), status: "Browser storage unavailable; edits stay in this session." }; }
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
  snapshot = { ...snapshot, plan, status };
  emit();
}
function setTab(tab: WealthTab) {
  if (snapshot.tab === tab) return;
  snapshot = { ...snapshot, tab };
  emit();
}
export function usePlan() {
  const current = useSyncExternalStore(subscribe, () => snapshot, () => server);
  return { ...current, update, setTab };
}

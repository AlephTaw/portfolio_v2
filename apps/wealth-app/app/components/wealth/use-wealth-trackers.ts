"use client";
import { useSyncExternalStore } from "react";
import { validDate } from "../../lib/planner";

export const wealthApps = [
  { id: "earning", title: "Daily Earning Quota" },
  { id: "solvency", title: "Debt Repayment" },
  { id: "monthly-expenses", title: "Cover Monthly Expenses" },
] as const;
export type Receipt = { id: string; date: string; amount: number; note: string };
type Trackers = { version: 1; visible: string[]; quotas: Record<string, number>; debt: number; earnings: Receipt[]; repayments: Receipt[] };
const initial: Trackers = { version: 1, visible: wealthApps.map((app) => app.id), quotas: {}, debt: 50000, earnings: [], repayments: [] };
const key = "wealth-trackers-v1";
let state = initial;
let status = "Loading trackers…";
let snapshot = { state, status };
const server = snapshot;
let loaded = false;
const listeners = new Set<() => void>();
const amountValid = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER / 100;
function receiptsValid(value: unknown): value is Receipt[] {
  return Array.isArray(value) && value.every((row) => row && typeof row.id === "string" && validDate(row.date) && amountValid(row.amount) && typeof row.note === "string");
}
function isTrackers(value: unknown): value is Trackers {
  if (!value || typeof value !== "object") return false;
  const data = value as Trackers;
  return data.version === 1 && Array.isArray(data.visible) && data.visible.every((id) => wealthApps.some((app) => app.id === id)) && amountValid(data.debt)
    && !!data.quotas && typeof data.quotas === "object" && !Array.isArray(data.quotas) && Object.entries(data.quotas).every(([date, amount]) => validDate(date) && amountValid(amount))
    && receiptsValid(data.earnings) && receiptsValid(data.repayments);
}
function publish() { snapshot = { state, status }; listeners.forEach((listener) => listener()); }
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) {
    loaded = true;
    try {
      const saved = localStorage.getItem(key);
      if (saved) { const parsed: unknown = JSON.parse(saved); if (!isTrackers(parsed)) throw new Error("Invalid saved trackers"); state = parsed; }
      status = "Trackers saved on this device";
    } catch { status = "Saved trackers unavailable · using defaults"; }
    publish();
  }
  return () => { listeners.delete(listener); };
}
function update(change: (previous: Trackers) => Trackers) {
  const next = change(state);
  if (!isTrackers(next)) return;
  state = next;
  try { localStorage.setItem(key, JSON.stringify(state)); status = "Trackers saved on this device"; }
  catch { status = "Storage unavailable · changes last this session only"; }
  publish();
}
export function useWealthTrackers() {
  return { ...useSyncExternalStore(subscribe, () => snapshot, () => server), update };
}
export function totalReceipts(rows: readonly Receipt[]) { return rows.reduce((total, row) => total + Math.round(row.amount * 100), 0) / 100; }

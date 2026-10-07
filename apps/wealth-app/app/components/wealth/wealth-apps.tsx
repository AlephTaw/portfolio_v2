"use client";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { analyzePlan, validDate, validatePlan } from "../../lib/planner";
import { CategoryAppView } from "../categories/category-app-view";
import { WealthPlanner } from "./wealth-planner";
import { usePlan } from "./use-plan";
import { totalReceipts, useWealthTrackers, wealthApps, type Receipt } from "./use-wealth-trackers";

const money = (amount: number) => amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
function today() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)?.value).join("-");
}
const subscribeDate = () => () => {};
function useToday(fallback: string) { return useSyncExternalStore(subscribeDate, today, () => "") || fallback; }

export function WealthApps({ completed, onToggle }: { completed: readonly string[]; onToggle: (id: string) => void }) {
  const { state, status, update } = useWealthTrackers();
  const panels = useRef<Partial<Record<string, HTMLElement | null>>>({});
  function toggle(id: string) { update((old) => ({ ...old, visible: old.visible.includes(id) ? old.visible.filter((item) => item !== id) : [...old.visible, id] })); }
  function reveal(id: string) {
    update((old) => ({ ...old, visible: old.visible.includes(id) ? old.visible : [...old.visible, id] }));
    requestAnimationFrame(() => { panels.current[id]?.scrollIntoView({ block: "start", behavior: "auto" }); panels.current[id]?.focus({ preventScroll: true }); });
  }
  return <div className="planner min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-3">
    <CategoryAppView category="Wealth" completed={completed} onToggle={onToggle} apps={{ visible: state.visible, reveal, toggle }} />
    <p className="text-[11px] leading-5 text-white/40">Toggle an achievement’s eye to show or hide its app. Double-click the thumbnail to reveal it. {status}.</p>
    {wealthApps.map((app) => <section key={app.id} id={`wealth-app-${app.id}`} hidden={!state.visible.includes(app.id)} aria-label={app.title} ref={(node) => { panels.current[app.id] = node; }} tabIndex={-1} className="scroll-mt-3 rounded-2xl border border-white/10 bg-black/30 p-4 focus-visible:outline focus-visible:outline-green-400">
      <h2 className="font-sans text-sm font-medium text-green-400">{app.title}</h2>
      <div className="mt-4">
        {app.id === "earning" ? <DailyEarnings /> : app.id === "solvency" ? <DebtRepayment /> : <WealthPlanner embedded />}
      </div>
    </section>)}
  </div>;
}

function DailyEarnings() {
  const { plan } = usePlan();
  const { state, update } = useWealthTrackers();
  const [selectedDate, setSelectedDate] = useState("");
  const currentDate = useToday(plan.start);
  const date = selectedDate || currentDate;
  const analysis = validatePlan(plan).length ? null : analyzePlan(plan);
  const scheduled = analysis?.days.find((day) => day.date === date)?.target ?? analysis?.average ?? 0;
  const quota = state.quotas[date] ?? (plan.dailyIncome > 0 ? plan.dailyIncome : scheduled);
  const rows = state.earnings.filter((row) => row.date === date);
  const earned = totalReceipts(rows);
  return <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <Field label="Earning date"><input type="date" required value={date} onChange={(event) => { if (validDate(event.target.value)) setSelectedDate(event.target.value); }} /></Field>
      <Field label="Daily quota ($)"><input type="number" min="0" step="0.01" value={quota} onChange={(event) => { if (event.target.value !== "") update((old) => ({ ...old, quotas: { ...old.quotas, [date]: Number(event.target.value) } })); }} /></Field>
    </div>
    <button type="button" className="planner-button text-[11px]" onClick={() => update((old) => { const quotas = { ...old.quotas }; delete quotas[date]; return { ...old, quotas }; })}>Use planned quota</button>
    <Progress value={earned} goal={quota} label="Daily earning progress" />
    <p className="text-xs text-white/60">{money(earned)} earned · {money(Math.max(0, quota - earned))} left today</p>
    <p className="text-[11px] leading-5 text-white/40">Quota defaults to planned daily earnings, or this date’s monthly funding target. Earnings are a separate log; update monthly cash or incidental income when allocating them to bills.</p>
    <ReceiptForm label="Earnings" date={date} onAdd={(row) => update((old) => ({ ...old, earnings: [...old.earnings, row] }))} />
    <ReceiptList rows={rows} label="Recorded earnings" onRemove={(id) => update((old) => ({ ...old, earnings: old.earnings.filter((row) => row.id !== id) }))} />
  </div>;
}

function DebtRepayment() {
  const { plan } = usePlan();
  const date = useToday(plan.start);
  const { state, update } = useWealthTrackers();
  const paid = totalReceipts(state.repayments);
  return <div className="space-y-4">
    <Field label="Starting debt ($)"><input type="number" min="0" step="0.01" value={state.debt} onChange={(event) => { if (event.target.value !== "") update((old) => ({ ...old, debt: Number(event.target.value) })); }} /></Field>
    <Progress value={paid} goal={state.debt} label="Debt repayment progress" />
    <p className="text-xs text-white/60">{money(paid)} repaid · {money(Math.max(0, state.debt - paid))} remaining</p>
    <p className="text-[11px] leading-5 text-white/40">Tracks principal repayments against your starting balance. This $50,000 goal is separate from monthly expenses; scheduled debt payments belong in the monthly bill planner.</p>
    <ReceiptForm label="Repayment" date={date} onAdd={(row) => update((old) => ({ ...old, repayments: [...old.repayments, row] }))} />
    <ReceiptList rows={state.repayments} label="Recorded repayments" onRemove={(id) => update((old) => ({ ...old, repayments: old.repayments.filter((row) => row.id !== id) }))} />
  </div>;
}

function ReceiptForm({ label, date, onAdd }: { label: string; date: string; onAdd: (row: Receipt) => void }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const repayment = label === "Repayment";
  return <form className="space-y-3" onSubmit={(event) => {
    event.preventDefault();
    const amountNumber = Math.round(Number(amount) * 100) / 100;
    const receiptDate = repayment ? paymentDate || date : date;
    if (!validDate(receiptDate) || !Number.isFinite(amountNumber) || amountNumber <= 0 || amountNumber > Number.MAX_SAFE_INTEGER / 100) return;
    onAdd({ id: crypto.randomUUID(), date: receiptDate, amount: amountNumber, note: note.trim() });
    setAmount(""); setNote("");
  }}>
    <div className="grid grid-cols-2 gap-3">
      <Field label={`${label} amount ($)`}><input required type="number" min="0.01" max={Number.MAX_SAFE_INTEGER / 100} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></Field>
      {repayment && <Field label="Repayment date"><input required type="date" value={paymentDate || date} onChange={(event) => setPaymentDate(event.target.value)} /></Field>}
      <Field label={`${label} note`}><input value={note} placeholder="Optional" onChange={(event) => setNote(event.target.value)} /></Field>
    </div>
    <button type="submit" className="planner-button">+ Record {label.toLowerCase()}</button>
  </form>;
}
function ReceiptList({ rows, label, onRemove }: { rows: Receipt[]; label: string; onRemove: (id: string) => void }) {
  return rows.length ? <ul aria-label={label} className="space-y-2">{rows.map((row) => <li key={row.id} className="flex items-center justify-between gap-3 border-t border-white/10 py-2 text-xs text-white/65"><span className="min-w-0 break-words">{row.date} · {money(row.amount)}{row.note ? ` · ${row.note}` : ""}</span><button type="button" className="planner-button shrink-0 text-[11px]" aria-label={`Remove ${money(row.amount)} on ${row.date}`} onClick={() => onRemove(row.id)}>Remove</button></li>)}</ul> : <p className="text-[11px] text-white/35">No records yet.</p>;
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="planner-field"><span>{label}</span>{children}</label>; }
function Progress({ value, goal, label }: { value: number; goal: number; label: string }) {
  const percent = goal > 0 ? Math.min(100, value / goal * 100) : 100;
  return <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} aria-valuetext={`${money(value)} of ${money(goal)}`} className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-green-400" style={{ width: `${percent}%` }} /></div>;
}

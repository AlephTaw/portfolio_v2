"use client";
import type { Entry, Plan } from "../../lib/planner";

export function Parameters({ plan, update }: { plan: Plan; update: (change: (p: Plan) => Plan) => void }) {
  function set<K extends keyof Plan>(key: K, value: Plan[K]) { update((old) => ({ ...old, [key]: value })); }
  return <section aria-label="Planning parameters" className="space-y-5">
    <p className="text-xs leading-5 text-white/50">Hourly rate is money available for bills after driving costs and deductions. Planned daily earnings are a comparison target, not additional income.</p>
    <div className="grid grid-cols-2 gap-4">
      <Field label="Start date"><input type="date" value={plan.start} onChange={(e) => set("start", e.target.value)} /></Field>
      <Field label="End date"><input type="date" value={plan.end} onChange={(e) => set("end", e.target.value)} /></Field>
      <Field label="Hourly earning rate ($)"><input type="number" min="0.01" step="0.01" value={plan.hourlyRate} onChange={(e) => set("hourlyRate", Number(e.target.value))} /></Field>
      <Field label="Planned daily earnings ($)"><input type="number" min="0" step="0.01" value={plan.dailyIncome} onChange={(e) => set("dailyIncome", Number(e.target.value))} /></Field>
      <Field label="Cash available at start ($)"><input type="number" min="0" step="0.01" value={plan.cash} onChange={(e) => set("cash", Number(e.target.value))} /></Field>
    </div>
    <p className="text-xs leading-5 text-white/40">Use 0 for planned daily earnings to leave that comparison off. Earn dated expenses by the preceding day; today’s and overdue bills are funded on the start date. Undated expenses are spread evenly across the period. Income counts on its availability date.</p>
  </section>;
}
export function EntryEditor({ plan, update }: { plan: Plan; update: (change: (p: Plan) => Plan) => void }) {
  function edit(id: string, values: Partial<Entry>) {
    update((old) => ({ ...old, entries: old.entries.map((row) => row.id === id ? { ...row, ...values } : row) }));
  }
  function add(kind: Entry["kind"]) {
    update((old) => ({ ...old, entries: [...old.entries, {
      id: crypto.randomUUID(), name: kind === "income" ? "Incidental income" : "New expense", kind,
      amount: 0, date: kind === "income" ? old.start : "", confirmed: false, paid: false, note: "",
    }] }));
  }
  return <section aria-label="Bill manifest" className="space-y-3">
    <div className="flex flex-wrap gap-2"><button className="planner-button" onClick={() => add("expense")}>+ Expense</button><button className="planner-button" onClick={() => add("income")}>+ Incidental income</button></div>
    <p className="text-xs leading-5 text-white/45">Expand any entry to edit. Leave an expense date blank when unknown. Add incidental expenses with + Expense.</p>
    {plan.entries.map((row) => <details key={row.id} className="entry-editor">
      <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-3 py-3">
        <span className="min-w-0"><span className="block text-sm text-white/85">{row.name || "Unnamed entry"}</span><span className="block text-[11px] text-white/45">{row.kind === "income" ? "Income · available " : "Expense · "}{row.date || "Unknown deadline"}{row.date && !row.confirmed ? " ?" : ""}{row.paid ? " · excluded" : ""}</span></span>
        <span className="shrink-0 text-sm tabular-nums">{row.kind === "income" ? "+" : ""}{money(row.amount)}</span>
      </summary>
      <div className="grid grid-cols-2 gap-3 pb-4">
        <div className="col-span-2"><Field label={row.name + " name"}><input value={row.name} onChange={(e) => edit(row.id, { name: e.target.value })} /></Field></div>
        <Field label={row.name + " amount ($)"}><input type="number" min="0" step="0.01" value={row.amount} onChange={(e) => edit(row.id, { amount: Number(e.target.value) })} /></Field>
        <Field label={row.name + (row.kind === "income" ? " available date" : " due date")}><input type="date" value={row.date} onChange={(e) => edit(row.id, { date: e.target.value })} /></Field>
        <Field label={row.name + " type"}><select value={row.kind} onChange={(e) => edit(row.id, { kind: e.target.value as Entry["kind"] })}><option value="expense">Expense</option><option value="income">Incidental income</option></select></Field>
        <label className="flex min-h-11 items-center gap-2 text-xs text-white/65"><input type="checkbox" checked={row.confirmed} onChange={(e) => edit(row.id, { confirmed: e.target.checked })} />Date confirmed</label>
        <label className="col-span-2 flex min-h-11 items-center gap-2 text-xs text-white/65"><input type="checkbox" checked={row.paid} onChange={(e) => edit(row.id, { paid: e.target.checked })} />{row.kind === "income" ? "Already accounted for in starting cash / exclude" : "Already paid / exclude"}</label>
        <div className="col-span-2"><Field label={row.name + " notes"}><input value={row.note} onChange={(e) => edit(row.id, { note: e.target.value })} placeholder="Notes, payment time, etc." /></Field></div>
        <button className="planner-button col-span-2 justify-self-start text-red-300" onClick={() => update((old) => ({ ...old, entries: old.entries.filter((entry) => entry.id !== row.id) }))}>Remove entry</button>
      </div>
    </details>)}
  </section>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="planner-field"><span>{label}</span>{children}</label>;
}
function money(amount: number) { return amount.toLocaleString("en-US", { style: "currency", currency: "USD" }); }

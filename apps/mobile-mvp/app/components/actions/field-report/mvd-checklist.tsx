"use client";

import { mvdBills, mvdChecklist, mvdItemId } from "./mvd-checklist-data";

export function MvdChecklist({ completed, onToggle }: { completed: readonly string[]; onToggle: (id: string) => void }) {
  const checked = new Set(completed);
  const categories = [...new Set(mvdChecklist.map((group) => group.category))];
  const total = mvdChecklist.reduce((sum, group) => sum + group.items.length, 0);
  const achieved = mvdChecklist.reduce((sum, group) => sum + group.items.filter((_, index) => checked.has(mvdItemId(group, index))).length, 0);
  return <section aria-label="Minimum Viable Day checklist" className="px-4">
    <div className="flex items-center justify-between gap-3 py-3">
      <h2 className="text-sm font-medium text-white/85">Minimum Viable Day</h2>
      <span className="rounded-full bg-black/25 px-2 py-1 text-[10px] tabular-nums text-white/65">{achieved}/{total}</span>
    </div>
    <p className="mb-3 text-[10px] text-white/45">⭐ focus area · 🔥 stage-failure risk</p>
    {categories.map((category) => <section key={category} className="mb-5" aria-label={`${category} checklist`}>
      <h3 className="mb-2 text-sm font-medium text-white/85">{category}</h3>
      {mvdChecklist.filter((group) => group.category === category).map((group) => <div key={group.id} className="mb-3">
        {group.title !== category && <h4 className="mb-1 text-xs text-white/60">{group.focus && <span aria-label="Focus and stage-failure risk">⭐ 🔥 </span>}{group.title}</h4>}
        <ul>
          {group.items.map((item, index) => {
            const id = mvdItemId(group, index);
            return <li key={id}>
              <label className="flex min-h-11 cursor-pointer items-start gap-2 rounded-lg px-1 py-2 hover:bg-white/5">
                <span className="relative mt-0.5 h-4 w-4 shrink-0">
                  <input type="checkbox" checked={checked.has(id)} onChange={() => onToggle(id)} className="peer block h-4 w-4 cursor-pointer appearance-none rounded bg-white/65" />
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute inset-0 h-4 w-4 text-black opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8 3 3 6-6" /></svg>
                </span>
                <span className={`text-xs leading-5 ${checked.has(id) ? "text-white/40 line-through" : "text-white/80"}`}>
                  {item.label}{item.points && <span className="ml-1.5 text-[10px] text-white/45">{item.points}</span>}
                </span>
              </label>
            </li>;
          })}
        </ul>
        {group.note && <p className="mt-1 pl-7 text-[10px] leading-4 text-white/45">{group.note}</p>}
      </div>)}
      {category === "Wealth" && <details className="rounded-xl bg-black/20 p-3 text-xs text-white/65">
        <summary className="cursor-pointer text-white/80">Bills &amp; solvency context</summary>
        <dl className="mt-3 space-y-2">{mvdBills.map((bill) => <div key={bill.name} className="flex justify-between gap-2"><dt>{bill.name}</dt><dd className="tabular-nums">${bill.amount.toLocaleString("en-US")}/month</dd></div>)}</dl>
        <p className="mt-3 text-[10px] leading-4 text-white/45">Due dates are not set. September 2026 credit card payment: $450. Monthly and long-term solvency estimates are not configured.</p>
      </details>}
    </section>)}
  </section>;
}

"use client";
import { useState } from "react";
import { datesBetween, type Analysis, type Day, type Plan } from "../../lib/planner";

export const money = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" });
function shortDate(value: string) { return new Date(value + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }); }
export function PlanOverview({ analysis: a, plan }: { analysis: Analysis; plan: Plan }) {
  const plannedBalance = plan.cash + a.incidentalIncome + plan.dailyIncome * a.days.length - a.expenseTotal;
  return <div className="space-y-6">
    <div aria-live="polite" aria-atomic="true" className="grid grid-cols-2 gap-x-4 gap-y-5">
      <Metric label="Unpaid expenses" value={money(a.expenseTotal)} />
      <Metric label="Driving earnings required" value={money(a.required)} />
      <Metric label="Average per day" value={money(a.average)} />
      <Metric label="Driving hours per day" value={(a.hours / a.days.length).toFixed(2) + " h"} />
    </div>
    <p className="text-xs leading-5 text-white/50">{a.days.length} earning days · {a.hours.toFixed(2)} total hours · {money(a.incidentalIncome)} incidental income · {money(plan.cash)} starting cash</p>
    {plan.dailyIncome > 0 && <p className="text-xs leading-5 text-white/60">At {money(plan.dailyIncome)}/day, the whole-period {plannedBalance < 0 ? "shortfall" : "surplus"} is {money(Math.abs(plannedBalance))}. Individual deadlines may still need earlier funding.</p>}
    {a.endingBalance > 0.01 && <p className="text-xs leading-5 text-white/50">Projected ending cash: {money(a.endingBalance)}. Late income may arrive after an earlier earning requirement.</p>}
    {a.warnings.length > 0 && <div className="space-y-2 border-l-2 border-amber-400/40 pl-3 text-xs leading-5 text-amber-100/75">{a.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}
    <FundingCalendar analysis={a} plan={plan} />
    <section aria-label="Funding windows" className="space-y-3">
      <h3 className="text-sm font-medium">Funding windows</h3>
      <p className="text-xs leading-5 text-white/45">Each window ends the day before its payment deadline. Required earnings include the daily reserve, less cash and income available in time. Tap a row for its breakdown.</p>
      <div className="space-y-2">
        {a.windows.map((window, index) => <details className="window-detail" key={window.start}>
          <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-3 py-3">
            <span className="min-w-0"><span className="block text-xs text-white/80">{shortDate(window.start)}{window.start !== window.end ? "–" + shortDate(window.end) : ""}</span><span className="block text-[11px] leading-5 text-white/45">{window.names.length ? window.names.join(" + ") : "Finish monthly reserves"}</span></span>
            <span className="shrink-0 text-right text-xs tabular-nums"><span className="block">{money(window.daily)}/day</span><span className={"block text-[11px] " + (window.hours > 24 ? "text-red-300" : "text-white/45")}>{window.hours.toFixed(2)} h/day</span></span>
          </summary>
          <dl className="mb-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-white/60">
            <dt>Payment deadline / target</dt><dd>{shortDate(window.deadline)}</dd>
            <dt>Deadline expenses</dt><dd>{money(window.bills)}</dd>
            <dt>Reserve allocation</dt><dd>{money(window.reserve)}</dd>
            <dt>Opening available cash</dt><dd>{money(window.openingCash)}</dd>
            <dt>Income arriving in window</dt><dd>{money(window.income)}</dd>
            <dt>Driving earnings required</dt><dd>{money(window.required)}</dd>
            <dt>Cumulative driving earnings</dt><dd>{money(a.windows.slice(0, index + 1).reduce((total, row) => total + row.required, 0))}</dd>
          </dl>
        </details>)}
      </div>
    </section>
    {a.excluded.length > 0 && <p className="text-xs leading-5 text-white/40">Excluded from this period: {a.excluded.map((entry) => entry.name + (entry.paid ? " (already accounted for)" : " (after end date)")).join(", ")}.</p>}
    <p className="text-[11px] leading-5 text-white/35">All expenses are treated as unpaid unless marked otherwise. Calendar days include weekends. Daily values are rounded for display; calculations use the full amounts.</p>
  </div>;
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="mb-1 text-[11px] text-white/45">{label}</p><p className="text-xl font-medium tabular-nums text-white/90">{value}</p></div>;
}
function FundingCalendar({ analysis: a, plan }: { analysis: Analysis; plan: Plan }) {
  const [selected, setSelected] = useState<string | null>(null);
  const month = plan.start.slice(0, 7);
  const first = month + "-01";
  const offset = new Date(first + "T12:00:00Z").getUTCDay();
  const last = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).toISOString().slice(0, 10);
  const all = datesBetween(first, last);
  const cells: (string | null)[] = [...Array.from({ length: offset }, () => null), ...all];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
  const dayMap = new Map(a.days.map((day) => [day.date, day]));
  const detail: Day | undefined = selected ? dayMap.get(selected) : undefined;
  const monthLabel = new Date(first + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  return <section aria-label="Monthly funding calendar" className="space-y-3">
    <div><h3 className="text-sm font-medium">{monthLabel}</h3><p className="mt-1 text-[11px] leading-5 text-white/45">Daily targets rounded to dollars · tap for exact values</p></div>
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/60"><span><i className="calendar-key bg-emerald-400" />Below {money(a.average)}</span><span><i className="calendar-key bg-red-400" />Above average</span><span>◆ Bill due · + Income · ? Unconfirmed</span></div>
    <div className="grid grid-cols-7 text-center text-[11px] text-white/40">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="space-y-3">
      {weeks.map((week, index) => <div key={index}>
        <div className="grid grid-cols-7">
          {week.map((date, column) => {
            const day = date ? dayMap.get(date) : undefined;
            const dues = date ? plan.entries.filter((entry) => !entry.paid && entry.date === date) : [];
            const due = dues.filter((row) => row.kind === "expense").reduce((sum, row) => sum + row.amount, 0);
            const income = dues.filter((row) => row.kind === "income").reduce((sum, row) => sum + row.amount, 0);
            return <button type="button" disabled={!day} aria-pressed={selected === date && !!day}
              key={date ?? "empty-" + column}
              aria-label={date ? shortDate(date) + (day ? ": earn " + money(day.target) + ", " + day.hours.toFixed(2) + " hours" : ": outside earning period") + (due ? "; " + money(due) + " bills due" : "") + (income ? "; " + money(income) + " income" : "") : "Empty calendar cell"}
              className={"funding-day " + (day ? (day.target > a.average + 0.001 ? "above" : day.target < a.average - 0.001 ? "below" : "equal") : "inactive")}
              onClick={() => setSelected(date)}>
              <span className="block text-[11px] opacity-60">{date ? Number(date.slice(-2)) : ""}</span>
              {day && <span className="mt-1 block text-[11px] tabular-nums">{"$" + Math.round(day.target)}</span>}
              {(due > 0 || income > 0) && <span className="mt-1 block text-[11px] opacity-65">{due > 0 ? "◆" : ""}{income > 0 ? " +" : ""}{dues.some((row) => !row.confirmed) ? " ?" : ""}</span>}
            </button>;
          })}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-y-1">
          {a.windows.filter((window) => window.bills > 0).map((window) => {
            const start = week.findIndex((date) => date && date >= window.start && date <= window.end);
            if (start < 0) return null;
            let end = start;
            while (end + 1 < week.length && week[end + 1] && week[end + 1]! <= window.end) end++;
            return <div key={window.start} className="funding-bar" style={{ gridColumn: (start + 1) + " / " + (end + 2), gridRow: 1 }} title={window.names.join(" + ") + ": " + money(window.bills)}>{window.names.map((name) => name.replace("Vehicle — ", "Car ")).join(" + ")}</div>;
          })}
          {(() => {
            const start = week.findIndex((date) => date && dayMap.has(date));
            if (start < 0) return null;
            let end = start;
            while (end + 1 < week.length && week[end + 1] && dayMap.has(week[end + 1]!)) end++;
            const reserve = a.days.reduce((total, day) => total + day.reserve, 0);
            return reserve > 0 ? <div className="funding-bar reserve-bar" style={{ gridColumn: (start + 1) + " / " + (end + 2), gridRow: 2 }} title="Groceries and all unknown-date expenses">Daily reserve · {money(reserve / a.days.length)}</div> : null;
          })()}
        </div>
      </div>)}
    </div>
    <div aria-live="polite" className="min-h-12 text-xs leading-5 text-white/60">
      {detail ? <><p>{shortDate(detail.date)}: earn <span className="text-white">{money(detail.target)}</span> · {detail.hours.toFixed(2)} driving hours · reserve {money(detail.reserve)}.</p><p>{detail.due.length ? "Due: " + detail.due.map((row) => row.name + " " + money(row.amount) + (row.confirmed ? "" : " ?") + (row.note ? " (" + row.note + ")" : "")).join("; ") + "." : "No dated bills due."}{detail.income > 0 ? " Income available: " + money(detail.income) + "." : ""}</p></> : "Bars show funding windows; the reserve includes every unknown-date expense. Payments are funded before the ◆ deadline."}
    </div>
  </section>;
}

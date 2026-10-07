"use client";
import { useState } from "react";
import { analyzePlan, validatePlan } from "../../lib/planner";
import { usePlan } from "./use-plan";
import { EntryEditor, Parameters } from "./plan-editor";
import { PlanOverview } from "./plan-overview";

export function WealthPlanner({ header, embedded = false }: { header?: React.ReactNode; embedded?: boolean }) {
  const { plan, status, update } = usePlan();
  const [tab, setTab] = useState<"overview" | "entries" | "parameters">("overview");
  const errors = validatePlan(plan);
  const analysis = errors.length ? null : analyzePlan(plan);
  return <section aria-label="Cover Monthly Expenses planner" className={embedded ? "planner pb-2" : "planner min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-3"}>
    {header}
    <div className="mb-5 mt-3 flex items-start justify-between gap-3"><p className="text-[11px] text-white/45">{status}</p><span className="text-xs text-white/40">{plan.start.slice(0, 7)}</span></div>
    <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Wealth sections">
      {([["overview", "Analysis"], ["entries", "Bills & extras"], ["parameters", "Income & dates"]] as const).map(([id, label]) => <button type="button" key={id} id={"tab-" + id} role="tab" aria-selected={tab === id} aria-controls={"panel-" + id} className="planner-button" onClick={() => setTab(id)}>{label}</button>)}
    </div>
    {errors.length > 0 && <div role="alert" className="mb-4 text-xs leading-5 text-red-300">{errors.map((error) => <p key={error}>{error}</p>)}</div>}
    <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" hidden={tab !== "overview"}>{analysis && <PlanOverview analysis={analysis} plan={plan} />}</div>
    <div role="tabpanel" id="panel-entries" aria-labelledby="tab-entries" hidden={tab !== "entries"}><EntryEditor plan={plan} update={update} /></div>
    <div role="tabpanel" id="panel-parameters" aria-labelledby="tab-parameters" hidden={tab !== "parameters"}><Parameters plan={plan} update={update} /></div>
  </section>;
}

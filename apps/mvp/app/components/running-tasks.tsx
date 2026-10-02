"use client";

import { useActiveActivity } from "./quest-terminal/use-active-activity";
import { useState } from "react";
import { TasksKanban } from "./tasks-kanban";
import { TaskPlan } from "./task-plan";

export function TaskRunnerPage() {
  const [view, setView] = useState<"running" | "plan">("running");
  return <section aria-label="Task runner">
    <h2 className="mb-4 text-base font-medium text-white/85">Tasks</h2>
    <div role="group" aria-label="Task runner views" className="mb-6 flex gap-2">
      {(["running", "plan"] as const).map((tab) => <button key={tab} type="button" aria-pressed={view === tab} onClick={() => setView(tab)} className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${view === tab ? "border-white/75 text-white" : "border-white/20 text-white/55 hover:border-white/50 hover:text-white"}`}>{tab === "running" ? "Tasks" : "Plan"}</button>)}
    </div>
    {view === "plan" ? <TaskPlan /> : <TasksKanban />}
  </section>;
}

export function RunningTasks() {
  const { activeActivity } = useActiveActivity();
  return <section aria-label="Running tasks">
    {activeActivity ? (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/85">
        {activeActivity.name}<span className="ml-2 text-xs text-white/40">· {activeActivity.category}</span>
      </div>
    ) : <p className="text-sm text-white/40">No running tasks</p>}
  </section>;
}

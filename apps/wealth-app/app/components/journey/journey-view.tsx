"use client";
import { useId, useState } from "react";
import { advanceObjective, gameplaySchedule, moveObjective, validStart, type Objective } from "../../lib/journey-plan";
import { useJourney } from "./use-journey";

export function JourneyView() {
  const { plan, status, update, add } = useJourney();
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(30);
  const id = useId();
  const current = plan.objectives.find((row) => row.status === "active");
  const ready = plan.objectives.filter((row) => row.status === "queued");
  const waiting = plan.objectives.filter((row) => row.status === "waiting");
  const schedule = gameplaySchedule(plan);
  const invalid = !title.trim() || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440;
  function edit(objectiveId: string, change: Partial<Objective>) {
    update((old) => ({ ...old, objectives: old.objectives.map((row) => row.id === objectiveId ? { ...row, ...change } : row) }));
  }
  function submit(event: React.FormEvent) { event.preventDefault(); if (invalid) return; add(title, minutes); setTitle(""); }

  return <section aria-label="Journey app" className="journey space-y-6">
    <header className="flex min-h-11 items-center justify-between gap-3">
      <h2 className="text-sm font-medium text-fuchsia-400">Journey</h2>
      <button type="button" aria-expanded={plan.showLoop} aria-controls={id + "-loop"} className="text-xs text-white/60 hover:text-white" onClick={() => update((old) => ({ ...old, showLoop: !old.showLoop }))}>{plan.showLoop ? "Hide event loop" : "Show event loop"}</button>
    </header>
    <div id={id + "-loop"} hidden={!plan.showLoop}>
      <figure aria-label="JavaScript-inspired event loop: active call stack, waiting host work, microtasks, and the ready task queue" className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <LoopBox label="Call stack" detail={current?.title ?? "Idle · ready for next objective"} accent />
          <LoopBox label="Web APIs / waiting" detail={waiting.length ? waiting.length + " waiting objectives" : "Timers · external work"} />
        </div>
        <div className="flex items-center justify-center gap-3 py-2 text-white/50">
          <svg aria-hidden="true" viewBox="0 0 48 48" className="h-12 w-12 text-fuchsia-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M38 17A16 16 0 0 0 10 12l-4 6m0-9v9h9M10 31a16 16 0 0 0 28 5l4-6m0 9v-9h-9" /></svg>
          <div><p className="text-xs text-white/80">Event loop</p><p className="text-[11px]">Next task when the stack is empty</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <LoopBox label="Microtask queue" detail="Promises · drained before the next task" />
          <LoopBox label="Task queue → stack" detail={ready.length ? ready.length + " ready · " + ready[0].title : "No queued objectives"} accent />
        </div>
        <figcaption className="text-[11px] leading-5 text-white/35">Planning analogy: one active objective, ordered ready work, and waiting work. Microtasks show the JavaScript model; this planner does not execute code.</figcaption>
      </figure>
    </div>

    <section aria-label="Objective queue" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-medium">Objective queue <span className="text-white/35">{ready.length} ready</span></h3>
        <button type="button" className="planner-button" disabled={!current && !ready.length} onClick={() => update((old) => ({ ...old, objectives: advanceObjective(old.objectives) }))}>{current ? "Complete & next" : "Start next"}</button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <label className="planner-field"><span>Objective</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What is your next objective?" /></label>
        <div className="flex items-end gap-3"><label className="planner-field min-w-0 flex-1"><span>Duration (minutes)</span><input type="number" min="1" max="1440" step="1" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} /></label><button type="submit" className="planner-button" disabled={invalid}>Add objective</button></div>
      </form>
      {!plan.objectives.length && <p className="text-xs leading-5 text-white/40">Add objectives here or submit one in the terminal prompt below. Terminal objectives start with a 30-minute duration.</p>}
      <ol className="space-y-3">
        {plan.objectives.map((row) => {
          const index = ready.findIndex((item) => item.id === row.id);
          return <li key={row.id} className="border-b border-white/10 pb-3">
            <div className="flex items-center justify-between gap-3"><label className="planner-field min-w-0 flex-1"><span>{row.status === "queued" ? "Priority " + (index + 1) : row.status === "active" ? "Playing now" : row.status === "waiting" ? "Waiting" : "Completed"}</span><input aria-label={row.title + " objective title"} value={row.title} onChange={(event) => edit(row.id, { title: event.target.value })} /></label></div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="planner-field"><span>Minutes</span><input aria-label={row.title + " duration"} type="number" min="1" max="1440" step="1" value={row.minutes} onChange={(event) => { const value = Number(event.target.value); if (Number.isInteger(value) && value >= 1 && value <= 1440) edit(row.id, { minutes: value }); }} /></label>
              <label className="planner-field"><span>Status</span><select aria-label={row.title + " status"} value={row.status} onChange={(event) => edit(row.id, { status: event.target.value as Objective["status"] })}>{row.status === "active" && <option value="active">Playing now</option>}<option value="queued">Queued</option><option value="waiting">Waiting</option><option value="done">Completed</option></select></label>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="planner-button" disabled={index <= 0} aria-label={"Move " + row.title + " earlier"} onClick={() => update((old) => ({ ...old, objectives: moveObjective(old.objectives, row.id, -1) }))}>↑ Earlier</button>
              <button type="button" className="planner-button" disabled={index < 0 || index === ready.length - 1} aria-label={"Move " + row.title + " later"} onClick={() => update((old) => ({ ...old, objectives: moveObjective(old.objectives, row.id, 1) }))}>↓ Later</button>
              <button type="button" className="planner-button text-red-300" aria-label={"Remove " + row.title} onClick={() => update((old) => ({ ...old, objectives: old.objectives.filter((item) => item.id !== row.id) }))}>Remove</button>
            </div>
          </li>;
        })}
      </ol>
    </section>

    <section aria-label="Gameplay plan" className="space-y-4">
      <h3 className="text-sm font-medium">Gameplay plan</h3>
      <label className="planner-field"><span>Plan starts (Eastern time)</span><input type="datetime-local" value={plan.start} onChange={(event) => update((old) => ({ ...old, start: event.target.value }))} /></label>
      {!validStart(plan.start) && <p role="alert" className="text-xs text-red-300">Choose a valid start date and time.</p>}
      <ol aria-live="polite" aria-label="Scheduled objectives" className="journey-timeline">
        {schedule.map((row, index) => <li key={row.id} className="relative pb-6 pl-6">
          <span aria-hidden="true" className={"journey-marker " + (row.status === "active" ? "bg-fuchsia-400" : "bg-fuchsia-400/30")} />
          <p className="text-[11px] tabular-nums text-white/45">{formatTime(row.begins)}–{formatTime(row.ends)} · {row.minutes} min</p>
          <p className="mt-1 break-words text-sm text-white/85">{row.title || "Unnamed objective"}</p>
          <p className="mt-1 text-[11px] text-white/35">{row.status === "active" ? "Playing now" : "Step " + (index + 1)}</p>
        </li>)}
      </ol>
      {!schedule.length && <p className="text-xs text-white/40">Ready objectives appear here in priority order.</p>}
      <p className="text-[11px] leading-5 text-white/35">Times are planned slots, not a running timer. Waiting and completed objectives are excluded. {status}.</p>
    </section>
  </section>;
}
function LoopBox({ label, detail, accent = false }: { label: string; detail: string; accent?: boolean }) {
  return <div className={"min-w-0 rounded-lg border p-3 " + (accent ? "border-fuchsia-400/30 bg-fuchsia-400/5" : "border-white/10 bg-white/5")}><p className="text-xs text-white/80">{label}</p><p className="mt-2 break-words text-[11px] leading-5 text-white/45">{detail}</p></div>;
}
function formatTime(time: number) {
  return new Date(time).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

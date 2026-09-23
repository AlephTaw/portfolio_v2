"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  FiCheck,
  FiEdit2,
  FiPause,
  FiPlay,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useTelemetry } from "./useTelemetry";
import {
  ACTIVITY_NAVIGATION_EVENT,
  ACTIVITY_TIMER_TOGGLE_EVENT,
  requestActivityFocus,
  type ActivityNavigationMode,
} from "./navigationEvents";
import { QuestCatalog } from "@/app/components/ComposerDock";
import {
  inventoryCategories,
  taskWorkspaces,
  type ActiveTimer,
  type ActivityDraft,
  type CompletedActivity,
  type TaskWorkspace,
  type TelemetryView,
  type TodoItem,
} from "./types";
import {
  filterByCategory,
  lifeCategories,
  lifePlanActivities,
  lifeQuests,
  questForActivity,
  type LifeCategory,
  type LifePlanActivity,
} from "@/src/life-rpg/data";
import {
  getAdjacentItem,
  useHorizontalSwipeNavigation,
} from "@/src/hooks/useHorizontalSwipeNavigation";

const telemetryWorkspaceTabs: readonly (TaskWorkspace | null)[] = [
  ...taskWorkspaces.filter(
    (workspace) => workspace !== "quests" && workspace !== "training",
  ),
  null,
];

const emptyDraft: ActivityDraft = {
  name: "",
  category: "",
  notes: "",
  durationMinutes: 30,
};

const inputClass =
  "min-w-0 rounded-lg border border-[#c9c1b4] bg-background px-3 py-2 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black";

type WorkspaceField = {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "number" | "date" | "select";
  options?: readonly string[];
};

const workspaceForms: Record<
  TaskWorkspace,
  { title: string; action: string; fields: WorkspaceField[] }
> = {
  plan: {
    title: "Plan entry",
    action: "Add plan",
    fields: [
      { key: "objective", label: "Objective", placeholder: "What needs to happen?" },
      { key: "nextAction", label: "Next action", placeholder: "Immediate next step" },
      { key: "targetDate", label: "Target date", placeholder: "", type: "date" },
    ],
  },
  inventory: {
    title: "Inventory entry",
    action: "Add item",
    fields: [
      { key: "item", label: "Item", placeholder: "Item or asset" },
      { key: "quantity", label: "Quantity", placeholder: "1", type: "number" },
      {
        key: "category",
        label: "Category",
        placeholder: "Select category",
        type: "select",
        options: inventoryCategories,
      },
      { key: "condition", label: "Condition", placeholder: "Condition or location" },
    ],
  },
  wealth: {
    title: "Wealth entry",
    action: "Add entry",
    fields: [
      { key: "entry", label: "Entry", placeholder: "Income, expense, or asset" },
      { key: "amount", label: "Amount", placeholder: "0.00", type: "number" },
      { key: "type", label: "Type", placeholder: "Income, expense, asset…" },
    ],
  },
  skills: {
    title: "Skill entry",
    action: "Add skill",
    fields: [
      { key: "skill", label: "Skill", placeholder: "Skill name" },
      { key: "level", label: "Current level", placeholder: "Level or proficiency" },
      { key: "evidence", label: "Evidence", placeholder: "Proof, notes, or next milestone" },
    ],
  },
  training: {
    title: "Training entry",
    action: "Add session",
    fields: [
      { key: "session", label: "Session", placeholder: "Training session" },
      { key: "duration", label: "Minutes", placeholder: "30", type: "number" },
      { key: "focus", label: "Focus", placeholder: "Drill, subject, or objective" },
    ],
  },
  connection: {
    title: "Connection entry",
    action: "Add connection",
    fields: [
      { key: "person", label: "Person or group", placeholder: "Name" },
      { key: "relationship", label: "Relationship", placeholder: "Context or relationship" },
      { key: "followUp", label: "Follow-up", placeholder: "", type: "date" },
    ],
  },
  health: {
    title: "Health entry",
    action: "Add metric",
    fields: [
      { key: "metric", label: "Metric or activity", placeholder: "Sleep, movement, recovery…" },
      { key: "value", label: "Value", placeholder: "Measurement or result" },
      { key: "notes", label: "Notes", placeholder: "Context or observation" },
    ],
  },
  quests: {
    title: "Quest entry",
    action: "Add quest",
    fields: [
      { key: "quest", label: "Quest", placeholder: "Quest name" },
      { key: "objective", label: "Objective", placeholder: "Completion condition" },
      { key: "reward", label: "Reward", placeholder: "Reward or outcome" },
    ],
  },
};

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatActivityDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

function activityToDraft(activity: CompletedActivity): ActivityDraft {
  return {
    name: activity.name,
    category: activity.category,
    notes: activity.notes,
    durationMinutes: Math.max(1, Math.round(activity.durationMs / 60_000)),
  };
}

function TelemetryViewToggle({
  view,
  onChange,
}: {
  view: TelemetryView | null;
  onChange: (view: TelemetryView | null) => void;
}) {
  return (
    <div
      aria-label="Activity view"
      className="inline-flex shrink-0 rounded-full border border-black p-0.5"
      role="tablist"
    >
      {([
        ["all", "ALL"],
        ["todo", "TO DO"],
        ["current", "DOING"],
        ["completed", "DONE"],
      ] as const).map(([nextView, label]) => (
        <button
          aria-selected={view === nextView}
          className={`rounded-full px-3 py-1 text-[0.45rem] font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-black sm:px-4 sm:text-[0.5rem] ${
            view === nextView ? "bg-black text-white" : "text-black hover:bg-black/10"
          }`}
          key={nextView}
          onClick={() => onChange(view === nextView ? null : nextView)}
          role="tab"
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function workspaceLifeCategory(workspace: TaskWorkspace | null): LifeCategory | "all" {
  if (!workspace || workspace === "quests") return "all";
  if (workspace === "plan") return "planning";
  if (workspace === "skills" || workspace === "training") return "competence";
  if (lifeCategories.includes(workspace as LifeCategory)) return workspace as LifeCategory;
  return "all";
}

function LifeActivityDetails({ activity }: { activity: LifePlanActivity }) {
  const quest = questForActivity(activity.id);
  return (
    <section className="mt-3 border border-black bg-background p-3" aria-label="Activity details">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.48rem] font-semibold uppercase tracking-[0.16em] text-[#766b5d]">Activity details</p>
          <h3 className="mt-1 text-sm font-medium">{activity.title}</h3>
        </div>
        <span className="text-[0.48rem] uppercase tracking-[0.12em] text-[#766b5d]">{activity.timestamp}</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#615754]">{activity.description}</p>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div><dt className="font-semibold uppercase tracking-[0.1em] text-[0.48rem] text-[#766b5d]">What to measure</dt><dd className="mt-1">{activity.measure}</dd></div>
        <div><dt className="font-semibold uppercase tracking-[0.1em] text-[0.48rem] text-[#766b5d]">Completion criterion</dt><dd className="mt-1">{activity.completionCriterion}</dd></div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {activity.kpis.map((kpi) => <span className="rounded-full border border-[#c9c1b4] px-2 py-0.5 text-[0.55rem]" key={kpi}>KPI: {kpi}</span>)}
      </div>
      {quest ? <p className="mt-3 text-[0.6rem] text-[#766b5d]">Quest: {quest.name}</p> : null}
    </section>
  );
}

function LifePlanPanel({ onSelectActivity }: { onSelectActivity: (activity: LifePlanActivity) => void }) {
  const timestampOrder = new Map([
    ["Day 0 / Today", 0],
    ["Day 3", 1],
    ["Day 7 / Week 1", 2],
    ["Day 14 / Week 2", 3],
    ["Day 21 / Week 3", 4],
    ["Day 30 / Month 1", 5],
  ]);
  return (
    <section className="mt-4" aria-label="Full life plan">
      <div className="flex items-center justify-between gap-3"><h2 className="text-[0.58rem] font-semibold uppercase tracking-[0.2em]">Full plan</h2><span className="text-[0.5rem] uppercase tracking-[0.12em] text-[#8a8177]">2026-08-31 → 2026-09-30</span></div>
      <div className="mt-3 grid gap-4">
        {[...lifeQuests].sort((left, right) => left.level - right.level).map((quest) => (
          <section className="border-t border-black pt-2" key={quest.id}>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-semibold">Level {quest.level} · {quest.name}</h3>
              <span className="text-[0.48rem] uppercase tracking-[0.1em] text-[#8a8177]">{quest.tags.join(" · ")}</span>
            </div>
            <div className="mt-2 grid gap-1">
              {[...lifePlanActivities]
                .filter((activity) => activity.questId === quest.id)
                .sort((left, right) => (timestampOrder.get(left.timestamp) ?? 0) - (timestampOrder.get(right.timestamp) ?? 0))
                .map((activity) => (
                  <button className="border-b border-[#d4ccc0] px-1 py-2 text-left hover:border-black" key={activity.id} onClick={() => onSelectActivity(activity)} type="button">
                    <span className="block text-xs">{activity.title}</span>
                    <span className="mt-1 block text-[0.5rem] uppercase tracking-[0.1em] text-[#8a8177]">{activity.timestamp} · {activity.tags.join(" · ")}</span>
                  </button>
                ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function CategoryContext({ category, onSelectActivity }: { category: LifeCategory; onSelectActivity: (activity: LifePlanActivity) => void }) {
  const quests = filterByCategory(lifeQuests, category);
  const activities = filterByCategory(lifePlanActivities, category);
  return <section className="mt-3 border-t border-[#d4ccc0] pt-3" aria-label={`${category} goals and activities`}><p className="text-[0.48rem] font-semibold uppercase tracking-[0.16em] text-[#766b5d]">{category} goals and supporting activities</p><div className="mt-2 flex flex-wrap gap-1.5">{quests.map((quest) => <span className="rounded-full border border-[#c9c1b4] px-2 py-0.5 text-[0.55rem]" key={quest.id}>{quest.name}</span>)}</div><div className="mt-2 grid gap-1">{activities.slice(0, 4).map((activity) => <button className="text-left text-xs hover:underline" key={activity.id} onClick={() => onSelectActivity(activity)} type="button">{activity.timestamp}: {activity.title}</button>)}</div></section>;
}

function KanbanBoard({
  activeTimer,
  activities,
  todos,
  onToggleTodo,
}: {
  activeTimer: ActiveTimer | null;
  activities: CompletedActivity[];
  todos: TodoItem[];
  onToggleTodo: (id: string) => void;
}) {
  const openTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <section aria-label="Kanban board" className="mt-4 grid min-h-0 grid-cols-3 gap-2 sm:gap-3">
      <div className="min-w-0 border-t border-[#8a8177] pt-2">
        <div className="flex items-center justify-between gap-1">
          <h2 className="text-[0.48rem] font-semibold uppercase tracking-[0.14em] text-[#6d6257]">
            To Do
          </h2>
          <span className="font-mono text-[0.45rem] text-[#8a8177]">{openTodos.length}</span>
        </div>
        <div className="mt-2 grid gap-2">
          {openTodos.length ? openTodos.map((todo) => (
            <button
              className="min-w-0 border border-[#d4ccc0] bg-background p-2 text-left transition-colors hover:border-black"
              key={todo.id}
              onClick={() => onToggleTodo(todo.id)}
              type="button"
            >
              <span className="block break-words text-[0.58rem] leading-4">{todo.title}</span>
              {todo.workspace ? (
                <span className="mt-1 block truncate text-[0.42rem] font-semibold uppercase tracking-[0.1em] text-[#8a8177]">
                  {todo.workspace}
                </span>
              ) : null}
            </button>
          )) : (
            <p className="py-4 text-center text-[0.5rem] text-[#8a8177]">No tasks</p>
          )}
        </div>
      </div>

      <div className="min-w-0 border-t border-black pt-2">
        <div className="flex items-center justify-between gap-1">
          <h2 className="text-[0.48rem] font-semibold uppercase tracking-[0.14em] text-[#6d6257]">
            Doing
          </h2>
          <span className="font-mono text-[0.45rem] text-[#8a8177]">{activeTimer ? 1 : 0}</span>
        </div>
        <div className="mt-2">
          {activeTimer ? (
            <article className="min-w-0 bg-black p-2 text-white">
              <p className="break-words text-[0.58rem] leading-4">{activeTimer.name}</p>
              <p className="mt-1 truncate text-[0.42rem] font-semibold uppercase tracking-[0.1em] text-white/65">
                {activeTimer.runningSince === null ? "Paused" : "In progress"}
              </p>
            </article>
          ) : (
            <p className="py-4 text-center text-[0.5rem] text-[#8a8177]">No activity</p>
          )}
        </div>
      </div>

      <div className="min-w-0 border-t border-[#8a8177] pt-2">
        <div className="flex items-center justify-between gap-1">
          <h2 className="text-[0.48rem] font-semibold uppercase tracking-[0.14em] text-[#6d6257]">
            Done
          </h2>
          <span className="font-mono text-[0.45rem] text-[#8a8177]">
            {completedTodos.length + activities.length}
          </span>
        </div>
        <div className="mt-2 grid gap-2">
          {completedTodos.map((todo) => (
            <button
              className="min-w-0 border border-[#d4ccc0] bg-background p-2 text-left text-[#766b5d] transition-colors hover:border-black"
              key={todo.id}
              onClick={() => onToggleTodo(todo.id)}
              type="button"
            >
              <span className="block break-words text-[0.58rem] leading-4 line-through">{todo.title}</span>
              <span className="mt-1 block text-[0.42rem] font-semibold uppercase tracking-[0.1em] text-[#8a8177]">
                Task
              </span>
            </button>
          ))}
          {activities.map((activity) => (
            <article className="min-w-0 border border-[#d4ccc0] bg-background p-2" key={activity.id}>
              <p className="break-words text-[0.58rem] leading-4">{activity.name}</p>
              <p className="mt-1 truncate text-[0.42rem] font-semibold uppercase tracking-[0.1em] text-[#8a8177]">
                Activity · {formatActivityDate(activity.endedAt)}
              </p>
            </article>
          ))}
          {!completedTodos.length && !activities.length ? (
            <p className="py-4 text-center text-[0.5rem] text-[#8a8177]">No entries</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type TimelineRange = "day" | "week" | "month" | "gantt";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function TimelinePanel({
  activities,
  todos,
}: {
  activities: CompletedActivity[];
  todos: TodoItem[];
}) {
  const [range, setRange] = useState<TimelineRange>("day");
  const today = startOfDay(new Date());
  const weekStart = addDays(today, -today.getDay());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthGridStart = addDays(monthStart, -monthStart.getDay());
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(monthGridStart, index));
  const dayActivities = activities.filter((activity) =>
    isSameDay(new Date(activity.startedAt), today),
  );
  const ganttTodos = todos.slice(0, 8);

  function activitiesForDay(date: Date) {
    return activities.filter((activity) =>
      isSameDay(new Date(activity.startedAt), date),
    );
  }

  return (
    <section aria-labelledby="timeline-heading" className="mt-5 min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#6d6257]"
            id="timeline-heading"
          >
            Timelines
          </h2>
          <p className="mt-1 text-[0.5rem] uppercase tracking-[0.14em] text-[#8a8177]">
            {new Intl.DateTimeFormat(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            }).format(today)}
          </p>
        </div>
        <div
          aria-label="Timeline range"
          className="inline-flex rounded-full border border-black p-0.5"
          role="tablist"
        >
          {(["day", "week", "month", "gantt"] as const).map((nextRange) => (
            <button
              aria-selected={range === nextRange}
              className={`rounded-full px-2.5 py-1 text-[0.45rem] font-semibold uppercase tracking-[0.1em] transition-colors sm:px-3 ${
                range === nextRange
                  ? "bg-black text-white"
                  : "text-black hover:bg-black/10"
              }`}
              key={nextRange}
              onClick={() => setRange(nextRange)}
              role="tab"
              type="button"
            >
              {nextRange}
            </button>
          ))}
        </div>
      </div>

      {range === "day" ? (
        <div className="mt-4 border-t border-[#d4ccc0]">
          {Array.from({ length: 24 }, (_, hour) => {
            const entries = dayActivities.filter(
              (activity) => new Date(activity.startedAt).getHours() === hour,
            );
            return (
              <div
                className="grid min-h-9 grid-cols-[3.5rem_1fr] border-b border-[#ded7cb]"
                key={hour}
              >
                <time className="pt-2 font-mono text-[0.5rem] text-[#8a8177]">
                  {new Intl.DateTimeFormat(undefined, {
                    hour: "numeric",
                  }).format(new Date(2020, 0, 1, hour))}
                </time>
                <div className="border-l border-[#ded7cb] px-2 py-1">
                  {entries.map((activity) => (
                    <p
                      className="rounded bg-black px-2 py-1 text-[0.55rem] text-white"
                      key={activity.id}
                    >
                      {activity.name}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {range === "week" ? (
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#d4ccc0] bg-[#d4ccc0] sm:grid-cols-4 lg:grid-cols-7">
          {weekDays.map((date) => {
            const entries = activitiesForDay(date);
            return (
              <article className="min-h-28 bg-background p-2" key={date.toISOString()}>
                <p className="text-[0.45rem] font-semibold uppercase tracking-[0.12em] text-[#766b5d]">
                  {new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date)}
                </p>
                <p className={`mt-1 font-mono text-sm ${isSameDay(date, today) ? "font-bold" : ""}`}>
                  {date.getDate()}
                </p>
                <div className="mt-2 grid gap-1">
                  {entries.map((activity) => (
                    <p className="truncate bg-black px-1.5 py-1 text-[0.48rem] text-white" key={activity.id}>
                      {activity.name}
                    </p>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {range === "month" ? (
        <div className="mt-4">
          <div className="grid grid-cols-7 text-center text-[0.42rem] font-semibold uppercase tracking-[0.1em] text-[#766b5d]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span className="pb-2" key={day}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-[#d4ccc0] bg-[#d4ccc0]">
            {monthDays.map((date) => {
              const entries = activitiesForDay(date);
              return (
                <article
                  className={`min-h-16 bg-background p-1.5 ${
                    date.getMonth() === today.getMonth() ? "" : "text-[#aaa197]"
                  }`}
                  key={date.toISOString()}
                >
                  <p className={`font-mono text-[0.55rem] ${isSameDay(date, today) ? "font-bold underline" : ""}`}>
                    {date.getDate()}
                  </p>
                  {entries.length ? (
                    <p className="mt-2 text-[0.45rem] font-semibold uppercase tracking-[0.08em]">
                      {entries.length} {entries.length === 1 ? "entry" : "entries"}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {range === "gantt" ? (
        <div className="mt-4">
          <div className="grid grid-cols-[7rem_repeat(7,minmax(0,1fr))] border-b border-[#c9c1b4] pb-2">
            <span className="text-[0.45rem] font-semibold uppercase tracking-[0.12em] text-[#766b5d]">Task</span>
            {weekDays.map((date) => (
              <span className="text-center font-mono text-[0.45rem] text-[#766b5d]" key={date.toISOString()}>
                {new Intl.DateTimeFormat(undefined, { weekday: "narrow" }).format(date)} {date.getDate()}
              </span>
            ))}
          </div>
          {ganttTodos.length ? (
            ganttTodos.map((todo, index) => {
              const startColumn = Math.min(7, (index % 5) + 1);
              const span = Math.min(8 - startColumn, todo.completed ? 1 : 2 + (index % 2));
              return (
                <div className="grid min-h-10 grid-cols-[7rem_repeat(7,minmax(0,1fr))] items-center border-b border-[#ded7cb]" key={todo.id}>
                  <p className="truncate pr-2 text-[0.55rem]" title={todo.title}>{todo.title}</p>
                  <div className="col-span-7 col-start-2 grid grid-cols-7">
                    <span
                      className={`h-2 rounded-full ${todo.completed ? "bg-[#8a8177]" : "bg-black"}`}
                      style={{ gridColumn: `${startColumn} / span ${span}` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-xl border border-dashed border-[#bdb4a8] px-4 py-8 text-center text-xs text-[#7f7468]">
              Tasks will appear on the Gantt chart as they are added.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}

export function TelemetryApp() {
  const {
    activeTimer,
    activeWorkspace,
    activities,
    addTodo,
    addTimerTag,
    adjustTimer,
    completeTimer,
    isOpen,
    pauseTimer,
    removeActivity,
    removeTimerTag,
    removeTodo,
    resumeTimer,
    setTimerName,
    setTimerQuest,
    setWorkspaceFilter,
    startTimer,
    setTelemetryView: setView,
    telemetryView: view,
    todos,
    toggleTodo,
    updateActivity,
  } = useTelemetry();
  const modalRef = useRef<HTMLElement>(null);
  const [now, setNow] = useState(() => Date.now());
  const [timerDraft, setTimerDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState(emptyDraft);
  const [questEditorOpen, setQuestEditorOpen] = useState(false);
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [questDraft, setQuestDraft] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [captureDraft, setCaptureDraft] = useState<Record<string, string>>({});
  const [selectedLifeActivity, setSelectedLifeActivity] = useState<LifePlanActivity | null>(null);
  const navigateWorkspace = useCallback(
    (direction: -1 | 1) => {
      const workspace = getAdjacentItem(
        telemetryWorkspaceTabs,
        activeWorkspace,
        direction,
      );
      if (workspace !== undefined && workspace !== activeWorkspace) {
        setWorkspaceFilter(workspace);
      }
    },
    [activeWorkspace, setWorkspaceFilter],
  );
  const modalSwipeHandlers = useHorizontalSwipeNavigation(navigateWorkspace);

  useEffect(() => {
    if (!activeTimer || activeTimer.runningSince === null) return;
    const initialTick = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initialTick);
      window.clearInterval(interval);
    };
  }, [activeTimer]);

  useEffect(() => {
    if (!isOpen) {
      document.documentElement.style.removeProperty("--activity-surface-bottom");
      return;
    }

    const modal = modalRef.current;
    if (!modal) return;
    let updateFrame = 0;
    const updateSurfaceOffset = () => {
      window.cancelAnimationFrame(updateFrame);
      updateFrame = window.requestAnimationFrame(() => {
        const bottom = Math.round((modal.getBoundingClientRect().bottom + 8) * 100) / 100;
        document.documentElement.style.setProperty(
          "--activity-surface-bottom",
          `${bottom}px`,
        );
      });
    };
    const observer = new ResizeObserver(updateSurfaceOffset);
    observer.observe(modal);
    window.addEventListener("resize", updateSurfaceOffset);
    updateSurfaceOffset();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSurfaceOffset);
      window.cancelAnimationFrame(updateFrame);
      document.documentElement.style.removeProperty("--activity-surface-bottom");
    };
  }, [isOpen]);

  useEffect(() => {
    const handleActivityNavigation = (event: Event) => {
      const mode = (event as CustomEvent<ActivityNavigationMode>).detail;
      setCaptureDraft({});
      setSelectedLifeActivity(null);

      if (mode === "quests") {
        const selected = activeWorkspace === "quests" && view === null;
        setWorkspaceFilter(selected ? null : "quests");
        setView(null);
        return;
      }

      if (activeWorkspace === "quests") setWorkspaceFilter(null);
      if (mode === "timeline") {
        setView(view === "timeline" ? null : "timeline");
        return;
      }

      const selected =
        view === "all" ||
        view === "todo" ||
        view === "current" ||
        view === "completed";
      setView(selected ? null : "all");
    };

    window.addEventListener(ACTIVITY_NAVIGATION_EVENT, handleActivityNavigation);
    return () =>
      window.removeEventListener(
        ACTIVITY_NAVIGATION_EVENT,
        handleActivityNavigation,
      );
  }, [activeWorkspace, setView, setWorkspaceFilter, view]);

  useEffect(() => {
    const toggleTimer = () => {
      if (activeTimer) {
        completeTimer();
        setView("completed");
        setQuestEditorOpen(false);
        setTagEditorOpen(false);
        return;
      }
      if (!timerDraft.name.trim()) return;
      startTimer(timerDraft);
      setTimerDraft(emptyDraft);
    };
    window.addEventListener(ACTIVITY_TIMER_TOGGLE_EVENT, toggleTimer);
    return () => window.removeEventListener(ACTIVITY_TIMER_TOGGLE_EVENT, toggleTimer);
  }, [activeTimer, completeTimer, setView, startTimer, timerDraft]);

  if (!isOpen) return null;

  const elapsedMs = activeTimer
    ? activeTimer.accumulatedMs +
      (activeTimer.runningSince === null ? 0 : now - activeTimer.runningSince)
    : 0;
  const visibleTodos = activeWorkspace
    ? todos.filter((todo) => todo.workspace === activeWorkspace)
    : todos;
  const visibleActivities = activeWorkspace
    ? activities.filter((activity) => activity.category === activeWorkspace)
    : activities;
  const activeWorkspaceForm = activeWorkspace ? workspaceForms[activeWorkspace] : null;
  const contentView = activeWorkspace === "plan"
    ? "plan"
    : activeWorkspace === "quests" && view === null
      ? "todo"
      : view;
  const lifeCategory = workspaceLifeCategory(activeWorkspace);
  const kanbanSelected =
    view === "all" || view === "todo" || view === "current" || view === "completed";
  const showCategoryFilters = view !== null || activeWorkspace !== null;
  const isCompactPreview = !showCategoryFilters;

  function handleStart() {
    if (!timerDraft.name.trim()) return;
    startTimer(timerDraft);
    setTimerDraft(emptyDraft);
  }

  function beginEditing(activity: CompletedActivity) {
    setEditingId(activity.id);
    setEditDraft(activityToDraft(activity));
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId || !editDraft.name.trim() || editDraft.durationMinutes < 1) {
      return;
    }
    updateActivity(editingId, editDraft);
    setEditingId(null);
  }

  function saveQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTimerQuest(questDraft);
    setQuestEditorOpen(false);
  }

  function saveTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tagDraft.trim()) return;
    addTimerTag(tagDraft);
    setTagDraft("");
    setTagEditorOpen(false);
  }

  function handleComplete() {
    completeTimer();
    setView("completed");
    setQuestEditorOpen(false);
    setTagEditorOpen(false);
  }

  function handleAddTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeWorkspaceForm) return;
    const primaryField = activeWorkspaceForm.fields[0];
    const title = captureDraft[primaryField.key]?.trim();
    if (!title) return;
    const details = Object.fromEntries(
      activeWorkspaceForm.fields
        .slice(1)
        .map((field) => [field.key, captureDraft[field.key]?.trim() ?? ""])
        .filter(([, value]) => value),
    );
    addTodo(title, details);
    setCaptureDraft({});
  }

  function selectTelemetryView(nextView: TelemetryView | null) {
    if (activeWorkspace === "quests") setWorkspaceFilter(null);
    setView(nextView);
    setSelectedLifeActivity(null);
  }

  function playQuest(questTitle: string) {
    if (activeTimer) return;
    startTimer({ category: "quests", name: questTitle, notes: "" });
    setTimerQuest(questTitle);
    setView("current");
  }

  return (
    <section
      aria-label="Activity"
      aria-modal="false"
      className={`activity-modal composer-rail-modal fixed z-[10005] flex -translate-x-1/2 touch-pan-y flex-col overflow-hidden border border-black/15 bg-background px-8 text-[#191714] sm:px-10 ${isCompactPreview ? "py-1" : "py-3"}`}
      onPointerDown={requestActivityFocus}
      ref={modalRef}
      role="dialog"
      {...modalSwipeHandlers}
    >
      <div
        className={`activity-modal-content pane-scroll flex min-h-0 flex-col overflow-y-auto overscroll-contain ${isCompactPreview ? "pb-0" : "pb-1"}`}
        data-lenis-prevent
      >
        {kanbanSelected ? (
          <div className="order-2 mb-3 flex justify-end">
            <TelemetryViewToggle onChange={selectTelemetryView} view={view} />
          </div>
        ) : null}

        {activeWorkspace === "quests" && view === null ? (
          <div className="order-2">
            <QuestCatalog
              onPlayQuest={playQuest}
              playDisabled={Boolean(activeTimer)}
              questItems={todos.filter((todo) => todo.workspace === "quests")}
            />
          </div>
        ) : null}

        <section
          aria-label={activeTimer ? "Running timer" : "Timer setup"}
          className="order-1"
        >
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
              <time
                className={`block text-left font-mono tabular-nums ${isCompactPreview ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"}`}
                dateTime={`PT${Math.floor(elapsedMs / 1000)}S`}
              >
                {formatDuration(elapsedMs)}
              </time>
              <input
                aria-label="Current activity name"
                className={`min-w-0 w-full border-0 bg-transparent p-0 text-right font-medium text-black outline-none placeholder:text-[#8a8177] focus:ring-0 ${isCompactPreview ? "text-sm" : "text-base"}`}
                onChange={(event) => {
                  if (activeTimer) setTimerName(event.target.value);
                  else setTimerDraft((draft) => ({ ...draft, name: event.target.value }));
                }}
                placeholder="What are you working on?"
                value={activeTimer?.name ?? timerDraft.name}
              />
            </div>
            {!isCompactPreview && activeTimer?.category ? (
              <p className="mt-1 text-xs text-[#766b5d]">{activeTimer.category}</p>
            ) : null}

            {!isCompactPreview && activeTimer ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-black px-3 py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-black hover:text-white"
                    onClick={() => {
                      setQuestDraft(activeTimer.quest);
                      setQuestEditorOpen((open) => !open);
                      setTagEditorOpen(false);
                    }}
                    type="button"
                  >
                    <FiPlus aria-hidden="true" /> {activeTimer.quest || "Add quest"}
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-black px-3 py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-black hover:text-white"
                    onClick={() => {
                      setTagEditorOpen((open) => !open);
                      setQuestEditorOpen(false);
                    }}
                    type="button"
                  >
                    <FiPlus aria-hidden="true" /> Add tags
                  </button>
                  {activeTimer.tags.map((tag) => (
                    <button
                      aria-label={`Remove tag ${tag}`}
                      className="rounded-full bg-black px-2.5 py-1 text-[0.55rem] text-white"
                      key={tag}
                      onClick={() => removeTimerTag(tag)}
                      title="Remove tag"
                      type="button"
                    >
                      {tag} ×
                    </button>
                  ))}
              </div>
            ) : null}

            {!isCompactPreview && questEditorOpen ? (
              <form className="mt-2 flex gap-2" onSubmit={saveQuest}>
                <input
                  aria-label="Quest"
                  className={inputClass}
                  onChange={(event) => setQuestDraft(event.target.value)}
                  placeholder="Quest name"
                  value={questDraft}
                />
                <button className="rounded-full bg-black px-3 text-xs text-white" type="submit">
                  Save
                </button>
              </form>
            ) : null}

            {!isCompactPreview && tagEditorOpen ? (
              <form className="mt-2 flex gap-2" onSubmit={saveTag}>
                <input
                  aria-label="Tag"
                  className={inputClass}
                  onChange={(event) => setTagDraft(event.target.value)}
                  placeholder="Tag"
                  value={tagDraft}
                />
                <button className="rounded-full bg-black px-3 text-xs text-white" type="submit">
                  Add
                </button>
              </form>
            ) : null}

            {contentView === "plan" ? (
              <LifePlanPanel onSelectActivity={setSelectedLifeActivity} />
            ) : lifeCategory !== "all" ? (
              <CategoryContext category={lifeCategory} onSelectActivity={setSelectedLifeActivity} />
            ) : null}
            {activeWorkspace === "quests" && view === null
              ? null
              : selectedLifeActivity
                ? <LifeActivityDetails activity={selectedLifeActivity} />
                : null}

        </section>

        <div className="order-3">
        {contentView === "all" ? (
          <KanbanBoard
            activeTimer={activeTimer}
            activities={visibleActivities}
            onToggleTodo={toggleTodo}
            todos={visibleTodos}
          />
        ) : contentView === "current" ? (
          activeTimer ? (
            <section aria-label="Clock adjustment" className="mt-3 flex min-h-0 flex-1 flex-col">
              <div className="mt-3 rounded-2xl bg-background p-3 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(11rem,0.8fr)] sm:items-center sm:gap-4 sm:p-4">
                <div className="mx-auto grid aspect-square w-full max-w-[clamp(8.5rem,20dvh,15rem)] place-items-center rounded-full border-[14px] border-[#ded7cb] bg-background shadow-[inset_0_0_0_1px_#c9c1b4]">
                  <div className="grid size-[68%] place-items-center rounded-full border border-[#c9c1b4] bg-background text-center">
                    <div>
                      <p className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-[#766b5d]">
                        Elapsed
                      </p>
                      <time className="mt-1 block font-mono text-xl tabular-nums sm:text-2xl">
                        {formatDuration(elapsedMs)}
                      </time>
                    </div>
                  </div>
                </div>
                <div className="mx-auto mt-3 grid w-full max-w-sm grid-cols-4 gap-2 sm:mt-0 sm:grid-cols-2">
                  {(
                    [
                      [-5 * 60_000, "−5m"],
                      [-60_000, "−1m"],
                      [60_000, "+1m"],
                      [5 * 60_000, "+5m"],
                    ] as const
                  ).map(([delta, label]) => (
                    <button
                      aria-label={`Adjust clock ${label}`}
                      className="rounded-full border border-[#c9c1b4] bg-background px-2 py-2 font-mono text-xs transition-colors hover:border-black hover:bg-black hover:text-white"
                      key={label}
                      onClick={() => adjustTimer(delta)}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {activeTimer.notes ? (
                <p className="mt-3 text-xs leading-5 text-[#615754]">{activeTimer.notes}</p>
              ) : null}
              <div className="mt-auto flex flex-wrap justify-end gap-2 pt-3">
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-black px-4 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-black hover:text-white"
                  onClick={activeTimer.runningSince === null ? resumeTimer : pauseTimer}
                  type="button"
                >
                  {activeTimer.runningSince === null ? <FiPlay aria-hidden="true" /> : <FiPause aria-hidden="true" />}
                  {activeTimer.runningSince === null ? "Resume" : "Pause"}
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-white"
                  onClick={handleComplete}
                  type="button"
                >
                  <FiCheck aria-hidden="true" /> Complete
                </button>
              </div>
            </section>
          ) : (
            <section aria-label="Clock adjustment" className="mt-3 flex min-h-0 flex-1 flex-col">
              <div className="mt-3 rounded-2xl bg-background p-3 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(11rem,0.8fr)] sm:items-center sm:gap-4 sm:p-4">
                <div className="mx-auto grid aspect-square w-full max-w-[clamp(8.5rem,20dvh,15rem)] place-items-center rounded-full border-[14px] border-[#ded7cb] bg-background shadow-[inset_0_0_0_1px_#c9c1b4]">
                  <div className="grid size-[68%] place-items-center rounded-full border border-[#c9c1b4] bg-background text-center">
                    <div>
                      <p className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-[#766b5d]">
                        Elapsed
                      </p>
                      <time className="mt-1 block font-mono text-xl tabular-nums sm:text-2xl">
                        00:00:00
                      </time>
                    </div>
                  </div>
                </div>
                <div className="mx-auto mt-3 grid w-full max-w-sm grid-cols-4 gap-2 sm:mt-0 sm:grid-cols-2">
                  {["−5m", "−1m", "+1m", "+5m"].map((label) => (
                    <button
                      aria-label={`Adjust clock ${label}`}
                      className="cursor-not-allowed rounded-full border border-[#c9c1b4] bg-background px-2 py-2 font-mono text-xs opacity-50"
                      disabled
                      key={label}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex justify-end pt-3">
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!timerDraft.name.trim()}
                  onClick={handleStart}
                  type="button"
                >
                  <FiPlay aria-hidden="true" /> Start timer
                </button>
              </div>
            </section>
          )
        ) : contentView === "timeline" ? (
          <TimelinePanel activities={visibleActivities} todos={visibleTodos} />
        ) : contentView === "todo" ? (
          <section aria-labelledby="todo-heading" className="mt-5">
            <div className="flex items-center justify-between gap-4">
              <h2
                className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#6d6257]"
                id="todo-heading"
              >
                To Do
              </h2>
              <span className="text-[0.5rem] uppercase tracking-[0.14em] text-[#8a8177]">
                {visibleTodos.filter((todo) => !todo.completed).length} open
              </span>
            </div>

            {activeWorkspaceForm ? (
              <form className="mt-3 rounded-xl border border-[#d4ccc0] p-3" onSubmit={handleAddTodo}>
                <p className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-[#6d6257]">
                  {activeWorkspaceForm.title}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]">
                  {activeWorkspaceForm.fields.map((field, index) => (
                    <label className="grid gap-1" key={field.key}>
                      <span className="text-[0.48rem] font-semibold uppercase tracking-[0.12em] text-[#766b5d]">
                        {field.label}
                      </span>
                      {field.type === "select" ? (
                        <select
                          aria-label={field.label}
                          className={inputClass}
                          onChange={(event) =>
                            setCaptureDraft((draft) => ({
                              ...draft,
                              [field.key]: event.target.value,
                            }))
                          }
                          required
                          value={captureDraft[field.key] ?? ""}
                        >
                          <option disabled value="">
                            {field.placeholder}
                          </option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          aria-label={field.label}
                          className={inputClass}
                          min={field.type === "number" ? "0" : undefined}
                          onChange={(event) =>
                            setCaptureDraft((draft) => ({
                              ...draft,
                              [field.key]: event.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          required={index === 0}
                          step={field.type === "number" ? "any" : undefined}
                          type={field.type ?? "text"}
                          value={captureDraft[field.key] ?? ""}
                        />
                      )}
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-40"
                    disabled={!captureDraft[activeWorkspaceForm.fields[0].key]?.trim()}
                    type="submit"
                  >
                    <FiPlus aria-hidden="true" /> {activeWorkspaceForm.action}
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-[#bdb4a8] px-4 py-8 text-center text-xs text-[#7f7468]">
                Select a task view from the bottom row to open its capture form.
              </p>
            )}

            {visibleTodos.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-[#bdb4a8] px-4 py-8 text-center text-xs text-[#7f7468]">
                Tasks added here will persist between sessions.
              </p>
            ) : (
              <div className="mt-3 grid gap-2">
                {visibleTodos.map((todo) => (
                  <article
                    className="flex items-center gap-3 rounded-xl border border-[#d4ccc0] bg-background p-3"
                    key={todo.id}
                  >
                    <button
                      aria-label={`${todo.completed ? "Mark incomplete" : "Mark complete"}: ${todo.title}`}
                      aria-pressed={todo.completed}
                      className={`grid size-6 shrink-0 place-items-center rounded-full border transition-colors ${
                        todo.completed ? "border-black bg-black text-white" : "border-[#8a8177]"
                      }`}
                      onClick={() => toggleTodo(todo.id)}
                      type="button"
                    >
                      {todo.completed ? <FiCheck aria-hidden="true" className="size-3.5" /> : null}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${todo.completed ? "text-[#85796d] line-through" : ""}`}>
                        {todo.title}
                      </p>
                      {Object.keys(todo.details).length ? (
                        <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[0.6rem] text-[#766b5d]">
                          {Object.entries(todo.details).map(([key, value]) => {
                            const label = todo.workspace
                              ? workspaceForms[todo.workspace].fields.find((field) => field.key === key)?.label
                              : key;
                            return (
                              <div className="flex gap-1" key={key}>
                                <dt className="font-semibold">{label}:</dt>
                                <dd>{value}</dd>
                              </div>
                            );
                          })}
                        </dl>
                      ) : null}
                    </div>
                    <button
                      aria-label={`Delete ${todo.title}`}
                      className="grid size-7 shrink-0 place-items-center rounded-full hover:bg-[#eee8de]"
                      onClick={() => removeTodo(todo.id)}
                      type="button"
                    >
                      <FiTrash2 aria-hidden="true" className="size-3.5" />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : contentView === "completed" ? (
        <section aria-labelledby="activity-history-heading" className="mt-5">
          <div className="flex items-center justify-between gap-4">
            <h2
              className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#6d6257]"
              id="activity-history-heading"
            >
              Recent activity
            </h2>
            <span className="text-[0.5rem] uppercase tracking-[0.14em] text-[#8a8177]">
              {visibleActivities.length} entries
            </span>
          </div>

          {visibleActivities.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-[#bdb4a8] px-4 py-8 text-center text-xs text-[#7f7468]">
              Completed activities will appear here.
            </p>
          ) : (
            <div className="mt-3 grid gap-2">
              {visibleActivities.map((activity) =>
                editingId === activity.id ? (
                  <form className="grid gap-2 rounded-xl border border-black bg-background p-3" key={activity.id} onSubmit={saveEdit}>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        aria-label="Edit activity name"
                        className={inputClass}
                        onChange={(event) => setEditDraft((draft) => ({ ...draft, name: event.target.value }))}
                        required
                        value={editDraft.name}
                      />
                      <input
                        aria-label="Edit activity category"
                        className={inputClass}
                        onChange={(event) => setEditDraft((draft) => ({ ...draft, category: event.target.value }))}
                        value={editDraft.category}
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[8rem_minmax(0,1fr)]">
                      <input
                        aria-label="Edit activity duration in minutes"
                        className={inputClass}
                        min="1"
                        onChange={(event) => setEditDraft((draft) => ({ ...draft, durationMinutes: Number(event.target.value) }))}
                        required
                        type="number"
                        value={editDraft.durationMinutes}
                      />
                      <input
                        aria-label="Edit activity notes"
                        className={inputClass}
                        onChange={(event) => setEditDraft((draft) => ({ ...draft, notes: event.target.value }))}
                        value={editDraft.notes}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button className="rounded-full px-3 py-1.5 text-xs" onClick={() => setEditingId(null)} type="button">
                        Cancel
                      </button>
                      <button className="rounded-full bg-black px-3 py-1.5 text-xs text-white" type="submit">
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <article className="flex items-start gap-3 rounded-xl border border-[#d4ccc0] bg-background p-3" key={activity.id}>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-medium">{activity.name}</p>
                        <time className="font-mono text-xs tabular-nums text-[#615754]">
                          {formatDuration(activity.durationMs)}
                        </time>
                      </div>
                      <p className="mt-1 text-[0.65rem] text-[#85796d]">
                        {[activity.category, formatActivityDate(activity.endedAt)].filter(Boolean).join(" · ")}
                      </p>
                      {activity.quest || activity.tags.length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {activity.quest ? (
                            <span className="rounded-full border border-[#c9c1b4] px-2 py-0.5 text-[0.55rem]">
                              Quest: {activity.quest}
                            </span>
                          ) : null}
                          {activity.tags.map((tag) => (
                            <span className="rounded-full bg-black px-2 py-0.5 text-[0.55rem] text-white" key={tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {activity.notes ? (
                        <p className="mt-2 text-xs leading-5 text-[#615754]">{activity.notes}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        aria-label={`Edit ${activity.name}`}
                        className="grid size-7 place-items-center rounded-full hover:bg-[#eee8de]"
                        onClick={() => beginEditing(activity)}
                        type="button"
                      >
                        <FiEdit2 aria-hidden="true" className="size-3.5" />
                      </button>
                      <button
                        aria-label={`Delete ${activity.name}`}
                        className="grid size-7 place-items-center rounded-full hover:bg-[#eee8de]"
                        onClick={() => removeActivity(activity.id)}
                        type="button"
                      >
                        <FiTrash2 aria-hidden="true" className="size-3.5" />
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>
        ) : null}
        </div>
      </div>

      {showCategoryFilters ? (
        <div
          aria-label="Activity category filters"
          className="mt-1 flex shrink-0 flex-wrap items-center justify-center gap-1"
          role="group"
        >
          {telemetryWorkspaceTabs.map((workspace) => (
            <button
              aria-pressed={activeWorkspace === workspace}
              className={`rounded-full border px-3 py-1 text-[0.48rem] font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                activeWorkspace === workspace
                  ? "border-black bg-black text-background"
                  : "border-transparent text-[#514a43] hover:bg-black/10"
              }`}
              key={workspace ?? "all"}
              onClick={() => setWorkspaceFilter(workspace)}
              type="button"
            >
              {workspace === null
                ? "All"
                : workspace === "plan"
                  ? "Game Design"
                  : workspace}
            </button>
          ))}
        </div>
      ) : null}

    </section>
  );
}

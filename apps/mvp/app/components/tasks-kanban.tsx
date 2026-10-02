"use client";

import { useEffect, useState } from "react";
import { activityTasksChangedEvent, readTasks, starterTasks, taskStorageKey, writeTasks, type ActivityTask } from "./activity-task-data";
import { useActiveActivity } from "./quest-terminal/use-active-activity";

const columns = [
  { id: "todo", label: "To do" },
  { id: "in-progress", label: "In progress" },
  { id: "done", label: "Done" },
] as const;
type TaskStatus = (typeof columns)[number]["id"];

export function TasksKanban({ onSelect }: { onSelect?: (task: ActivityTask) => void }) {
  const [tasks, setTasks] = useState(starterTasks);
  const [mobileColumn, setMobileColumn] = useState<TaskStatus>("todo");
  const [saveError, setSaveError] = useState(false);
  const { activeActivity } = useActiveActivity();
  useEffect(() => {
    const refresh = () => setTasks(readTasks());
    const frame = requestAnimationFrame(refresh);
    const onStorage = (event: StorageEvent) => { if (event.key === taskStorageKey || event.key === null) refresh(); };
    window.addEventListener(activityTasksChangedEvent, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(activityTasksChangedEvent, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const statusFor = (task: ActivityTask): TaskStatus => task.completed ? "done" : task.status ?? (activeActivity?.taskId === task.id ? "in-progress" : "todo");
  const moveTask = (id: string, status: TaskStatus) => {
    try {
      writeTasks(readTasks().map((task) => task.id === id ? { ...task, status, completed: status === "done" } : task));
      setSaveError(false);
    } catch { setSaveError(true); }
  };
  return <section aria-label="Tasks Kanban" className="min-w-0">
    <div role="group" aria-label="Kanban columns" className="mb-3 flex gap-1 md:hidden">
      {columns.map((column) => <button key={column.id} type="button" aria-pressed={mobileColumn === column.id} onClick={() => setMobileColumn(column.id)} className={`min-w-0 flex-1 cursor-pointer rounded-full px-2 py-2 text-xs ${mobileColumn === column.id ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`}>{column.label} <span className="text-white/45">{tasks.filter((task) => statusFor(task) === column.id).length}</span></button>)}
    </div>
    {saveError && <p role="alert" className="mb-3 text-xs text-red-300">Could not save the task status. Please try again.</p>}
    <div className="grid min-w-0 gap-3 md:grid-cols-3">
      {columns.map((column) => {
        const items = tasks.filter((task) => statusFor(task) === column.id);
        return <section key={column.id} aria-label={column.label} className={`min-w-0 rounded-xl bg-white/[0.03] p-3 ${mobileColumn === column.id ? "block" : "hidden md:block"}`}>
          <h3 className="mb-3 flex justify-between text-xs font-medium text-white/70">{column.label}<span className="text-white/40">{items.length}</span></h3>
          <ul className="space-y-2">
            {items.map((task) => <li key={task.id} className="min-w-0 rounded-lg border border-white/10 bg-black/30 p-3">
              {onSelect ? <button type="button" onClick={() => onSelect(task)} className="w-full cursor-pointer break-words text-left text-sm text-white/85 hover:text-white">{task.name}</button> : <p className="break-words text-sm text-white/85">{task.name}</p>}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-white/40">{task.category}</span>
                <select aria-label={`Status for ${task.name}`} value={column.id} onChange={(event) => moveTask(task.id, event.target.value as TaskStatus)} className="min-h-9 max-w-full cursor-pointer rounded-md border border-white/20 bg-black px-2 text-xs text-white/65">
                  {columns.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
              </div>
            </li>)}
          </ul>
          {!items.length && <p className="py-4 text-xs text-white/35">No tasks</p>}
        </section>;
      })}
    </div>
  </section>;
}

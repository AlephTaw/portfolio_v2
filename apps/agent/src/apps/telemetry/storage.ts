import {
  taskWorkspaces,
  type ActiveTimer,
  type CompletedActivity,
  type TaskWorkspace,
  type TelemetryState,
  type TodoItem,
} from "./types";

const STORAGE_KEY = "swilcox-agent.telemetry.v1";

export const emptyTelemetryState: TelemetryState = {
  activeTimer: null,
  activities: [],
  todos: [],
  openWorkspaces: [],
  activeWorkspace: null,
};

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isTaskWorkspace(value: unknown): value is TaskWorkspace {
  return typeof value === "string" && taskWorkspaces.includes(value as TaskWorkspace);
}

function readActiveTimer(value: unknown): ActiveTimer | null {
  if (!value || typeof value !== "object") return null;
  const timer = value as Record<string, unknown>;

  if (
    !isString(timer.id) ||
    !isString(timer.name) ||
    !isString(timer.category) ||
    !isString(timer.notes) ||
    !isNumber(timer.startedAt) ||
    !isNumber(timer.accumulatedMs) ||
    !(timer.runningSince === null || isNumber(timer.runningSince))
  ) {
    return null;
  }

  return {
    ...(timer as Omit<ActiveTimer, "quest" | "tags">),
    quest: isString(timer.quest) ? timer.quest : "",
    tags: Array.isArray(timer.tags) ? timer.tags.filter(isString) : [],
  };
}

function readActivity(value: unknown): CompletedActivity | null {
  if (!value || typeof value !== "object") return null;
  const activity = value as Record<string, unknown>;

  if (
    !isString(activity.id) ||
    !isString(activity.name) ||
    !isString(activity.category) ||
    !isString(activity.notes) ||
    !isNumber(activity.startedAt) ||
    !isNumber(activity.endedAt) ||
    !isNumber(activity.durationMs)
  ) {
    return null;
  }

  return {
    ...(activity as Omit<CompletedActivity, "quest" | "tags">),
    quest: isString(activity.quest) ? activity.quest : "",
    tags: Array.isArray(activity.tags) ? activity.tags.filter(isString) : [],
  };
}

function readTodo(value: unknown): TodoItem | null {
  if (!value || typeof value !== "object") return null;
  const todo = value as Record<string, unknown>;
  if (
    !isString(todo.id) ||
    !isString(todo.title) ||
    typeof todo.completed !== "boolean" ||
    !isNumber(todo.createdAt)
  ) {
    return null;
  }
  return {
    ...(todo as Omit<TodoItem, "workspace" | "details">),
    workspace: isTaskWorkspace(todo.workspace) ? todo.workspace : null,
    details:
      todo.details && typeof todo.details === "object"
        ? Object.fromEntries(
            Object.entries(todo.details as Record<string, unknown>).filter(
              (entry): entry is [string, string] => isString(entry[1]),
            ),
          )
        : {},
  };
}

export function loadTelemetryState(): TelemetryState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyTelemetryState;
    const stored = JSON.parse(raw) as Record<string, unknown>;
    const activities = Array.isArray(stored.activities)
      ? stored.activities
          .map(readActivity)
          .filter((activity): activity is CompletedActivity => activity !== null)
      : [];
    const todos = Array.isArray(stored.todos)
      ? stored.todos.map(readTodo).filter((todo): todo is TodoItem => todo !== null)
      : [];

    return {
      activeTimer: readActiveTimer(stored.activeTimer),
      activities,
      todos,
      openWorkspaces: Array.isArray(stored.openWorkspaces)
        ? stored.openWorkspaces.filter(isTaskWorkspace)
        : [],
      activeWorkspace: null,
    };
  } catch {
    return emptyTelemetryState;
  }
}

export function saveTelemetryState(state: TelemetryState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep telemetry usable in memory when browser storage is unavailable.
  }
}

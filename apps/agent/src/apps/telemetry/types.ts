export const taskWorkspaces = [
  "plan",
  "inventory",
  "wealth",
  "skills",
  "training",
  "connection",
  "health",
  "quests",
] as const;

export const inventoryCategories = [
  "kitchen",
  "food",
  "bedroom",
  "bathroom",
  "office",
  "transportation",
  "clothing",
  "systems",
] as const;

export type TaskWorkspace = (typeof taskWorkspaces)[number];
export type InventoryCategory = (typeof inventoryCategories)[number];
export type TelemetryView = "all" | "current" | "todo" | "completed" | "timeline";

export type ActiveTimer = {
  id: string;
  name: string;
  category: string;
  notes: string;
  quest: string;
  tags: string[];
  startedAt: number;
  accumulatedMs: number;
  runningSince: number | null;
};

export type CompletedActivity = {
  id: string;
  name: string;
  category: string;
  notes: string;
  quest: string;
  tags: string[];
  startedAt: number;
  endedAt: number;
  durationMs: number;
};

export type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  workspace: TaskWorkspace | null;
  details: Record<string, string>;
};

export type TelemetryState = {
  activeTimer: ActiveTimer | null;
  activities: CompletedActivity[];
  todos: TodoItem[];
  openWorkspaces: TaskWorkspace[];
  activeWorkspace: TaskWorkspace | null;
};

export type ActivityDraft = {
  name: string;
  category: string;
  notes: string;
  durationMinutes: number;
};

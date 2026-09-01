import { createContext } from "react";
import type { ActivityDraft, TaskWorkspace, TelemetryState, TelemetryView } from "./types";

export type TelemetryContextValue = TelemetryState & {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  telemetryView: TelemetryView | null;
  setTelemetryView: (view: TelemetryView | null) => void;
  setWorkspaceFilter: (workspace: TaskWorkspace | null) => void;
  startTimer: (draft: Omit<ActivityDraft, "durationMinutes">) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  adjustTimer: (deltaMs: number) => void;
  setTimerName: (name: string) => void;
  setTimerStartedAt: (startedAt: number) => void;
  setTimerEndedAt: (endedAt: number) => void;
  setTimerQuest: (quest: string) => void;
  addTimerTag: (tag: string) => void;
  removeTimerTag: (tag: string) => void;
  completeTimer: () => void;
  addTodo: (title: string, details?: Record<string, string>) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  updateActivity: (id: string, draft: ActivityDraft) => void;
  removeActivity: (id: string) => void;
};

export const TelemetryContext = createContext<TelemetryContextValue | null>(null);

"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { TelemetryContext, type TelemetryContextValue } from "./context";
import {
  emptyTelemetryState,
  loadTelemetryState,
  saveTelemetryState,
} from "./storage";
import type { CompletedActivity, TelemetryState, TelemetryView } from "./types";

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TelemetryState>(emptyTelemetryState);
  const [isOpen, setIsOpen] = useState(false);
  const [telemetryView, setTelemetryView] = useState<TelemetryView | null>("current");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setState(loadTelemetryState());
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) saveTelemetryState(state);
  }, [hydrated, state]);

  const value = useMemo<TelemetryContextValue>(
    () => ({
      ...state,
      isOpen,
      telemetryView,
      setTelemetryView,
      toggle: () => setIsOpen((open) => !open),
      close: () => setIsOpen(false),
      setWorkspaceFilter: (workspace) => {
        setState((current) => ({
          ...current,
          activeWorkspace: workspace,
        }));
      },
      startTimer: ({ name, category, notes }) => {
        const now = Date.now();
        setState((current) => {
          if (current.activeTimer) return current;
          return {
            ...current,
            activeTimer: {
              id: crypto.randomUUID(),
              name: name.trim(),
              category: current.activeWorkspace ?? category.trim(),
              notes: notes.trim(),
              quest: "",
              tags: [],
              startedAt: now,
              accumulatedMs: 0,
              runningSince: now,
            },
          };
        });
      },
      pauseTimer: () => {
        const now = Date.now();
        setState((current) => {
          const timer = current.activeTimer;
          if (!timer || timer.runningSince === null) return current;
          return {
            ...current,
            activeTimer: {
              ...timer,
              accumulatedMs: timer.accumulatedMs + now - timer.runningSince,
              runningSince: null,
            },
          };
        });
      },
      resumeTimer: () => {
        const now = Date.now();
        setState((current) => {
          const timer = current.activeTimer;
          if (!timer || timer.runningSince !== null) return current;
          return {
            ...current,
            activeTimer: { ...timer, runningSince: now },
          };
        });
      },
      adjustTimer: (deltaMs) => {
        const now = Date.now();
        setState((current) => {
          const timer = current.activeTimer;
          if (!timer) return current;
          const elapsedMs =
            timer.accumulatedMs +
            (timer.runningSince === null ? 0 : now - timer.runningSince);
          const adjustedMs = Math.max(0, elapsedMs + deltaMs);
          const appliedDelta = adjustedMs - elapsedMs;
          return {
            ...current,
            activeTimer: {
              ...timer,
              accumulatedMs: adjustedMs,
              runningSince: timer.runningSince === null ? null : now,
              startedAt: timer.startedAt - appliedDelta,
            },
          };
        });
      },
      setTimerName: (name) => {
        setState((current) => ({
          ...current,
          activeTimer: current.activeTimer
            ? { ...current.activeTimer, name }
            : null,
        }));
      },
      setTimerStartedAt: (startedAt) => {
        const now = Date.now();
        setState((current) => {
          const timer = current.activeTimer;
          if (!timer || !Number.isFinite(startedAt)) return current;
          const safeStartedAt = Math.min(startedAt, now);
          return {
            ...current,
            activeTimer: {
              ...timer,
              startedAt: safeStartedAt,
              accumulatedMs: Math.max(0, now - safeStartedAt),
              runningSince: timer.runningSince === null ? null : now,
            },
          };
        });
      },
      setTimerEndedAt: (endedAt) => {
        const now = Date.now();
        setState((current) => {
          const timer = current.activeTimer;
          if (!timer || !Number.isFinite(endedAt)) return current;
          const safeEndedAt = Math.max(timer.startedAt, Math.min(endedAt, now));
          return {
            ...current,
            activeTimer: {
              ...timer,
              accumulatedMs: safeEndedAt - timer.startedAt,
              runningSince: timer.runningSince === null ? null : now,
            },
          };
        });
      },
      setTimerQuest: (quest) => {
        setState((current) => ({
          ...current,
          activeTimer: current.activeTimer
            ? { ...current.activeTimer, quest: quest.trim() }
            : null,
        }));
      },
      addTimerTag: (tag) => {
        const cleanTag = tag.trim();
        if (!cleanTag) return;
        setState((current) => {
          const timer = current.activeTimer;
          if (!timer || timer.tags.includes(cleanTag)) return current;
          return {
            ...current,
            activeTimer: { ...timer, tags: [...timer.tags, cleanTag] },
          };
        });
      },
      removeTimerTag: (tag) => {
        setState((current) => ({
          ...current,
          activeTimer: current.activeTimer
            ? {
                ...current.activeTimer,
                tags: current.activeTimer.tags.filter((item) => item !== tag),
              }
            : null,
        }));
      },
      completeTimer: () => {
        const now = Date.now();
        setState((current) => {
          const timer = current.activeTimer;
          if (!timer) return current;
          const durationMs =
            timer.accumulatedMs +
            (timer.runningSince === null ? 0 : now - timer.runningSince);
          const completed: CompletedActivity = {
            id: timer.id,
            name: timer.name,
            category: timer.category,
            notes: timer.notes,
            quest: timer.quest,
            tags: timer.tags,
            startedAt: timer.startedAt,
            endedAt: now,
            durationMs,
          };
          return {
            ...current,
            activeTimer: null,
            activities: [completed, ...current.activities],
          };
        });
      },
      addTodo: (title, details = {}) => {
        const cleanTitle = title.trim();
        if (!cleanTitle) return;
        setState((current) => ({
          ...current,
          todos: [
            ...current.todos,
            {
              id: crypto.randomUUID(),
              title: cleanTitle,
              completed: false,
              createdAt: Date.now(),
              workspace: current.activeWorkspace,
              details,
            },
          ],
        }));
      },
      toggleTodo: (id) => {
        setState((current) => ({
          ...current,
          todos: current.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        }));
      },
      removeTodo: (id) => {
        setState((current) => ({
          ...current,
          todos: current.todos.filter((todo) => todo.id !== id),
        }));
      },
      updateActivity: (id, { name, category, notes, durationMinutes }) => {
        setState((current) => ({
          ...current,
          activities: current.activities.map((activity) => {
            if (activity.id !== id) return activity;
            const durationMs = Math.max(1, durationMinutes) * 60_000;
            return {
              ...activity,
              name: name.trim(),
              category: category.trim(),
              notes: notes.trim(),
              durationMs,
              startedAt: activity.endedAt - durationMs,
            };
          }),
        }));
      },
      removeActivity: (id) => {
        setState((current) => ({
          ...current,
          activities: current.activities.filter((activity) => activity.id !== id),
        }));
      },
    }),
    [isOpen, state, telemetryView],
  );

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

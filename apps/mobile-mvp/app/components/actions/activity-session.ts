import { createWorkspaceState, getPanelLaunchMode, workspaceReducer, type PanelView, type WorkspaceAction, type WorkspaceState } from "./workspace-state.ts";
import type { TerminalCategory } from "./terminal-categories.ts";

export type HistoryEntry =
  | { id: number; kind: "category"; category: TerminalCategory }
  | { id: number; kind: "view"; view: PanelView }
  | { id: number; kind: "command"; text: string; status: "execution-preview" }
  | { id: number; kind: "action"; label: string };
export type ActivitySession = { workspace: WorkspaceState; history: HistoryEntry[]; nextId: number; composing: boolean; visorOpen: boolean; activeCategory: TerminalCategory | null };
export type SessionAction = WorkspaceAction
  | { type: "select-category"; category: TerminalCategory }
  | { type: "toggle-hud" }
  | { type: "open-panel"; view: PanelView }
  | { type: "minimize-panel" }
  | { type: "hide-panel"; view: PanelView }
  | { type: "restore-view"; id: number }
  | { type: "toggle-composer" }
  | { type: "begin-command" }
  | { type: "return-terminal" }
  | { type: "close-composer" }
  | { type: "record-action"; label: string }
  | { type: "submit-command"; text: string }
  | { type: "resize-panel" };

export function createActivitySession(view: PanelView | null): ActivitySession {
  return { workspace: createWorkspaceState(view), history: [], nextId: 1, composing: false, visorOpen: false, activeCategory: null };
}

function archiveCategory(state: ActivitySession): ActivitySession {
  if (!state.activeCategory) return state;
  return { ...state, activeCategory: null, nextId: state.nextId + 1, history: [...state.history, { id: state.nextId, kind: "category", category: state.activeCategory }] };
}

function archivePanel(state: ActivitySession, workspace: WorkspaceState): ActivitySession {
  const current = state.workspace;
  if (current.kind !== "panel" || (workspace.kind === "panel" && current.view === workspace.view)) return { ...state, workspace };
  return { ...state, workspace, nextId: state.nextId + 1, history: [...state.history, { id: state.nextId, kind: "view", view: current.view }] };
}

function record(state: ActivitySession, label: string): ActivitySession {
  return { ...state, nextId: state.nextId + 1, history: [...state.history, { id: state.nextId, kind: "action", label }] };
}

function closeComposer(state: ActivitySession): ActivitySession {
  return state.composing ? record({ ...state, composing: false }, "Command composer closed") : state;
}

export function activitySessionReducer(state: ActivitySession, action: SessionAction): ActivitySession {
  // Category screens live inline in the feed, not in the navbar window layer.
  if (action.type === "open-panel" || action.type === "select-panel" || action.type === "expand-panel") state = archiveCategory(state);
  // The visor is a separate display layer, not a destination in pane navigation.
  // Window navigation is identical over either background; only the helmet
  // changes the visor. There is no second modal selection or sizing path.
  if (action.type === "toggle-hud") {
    return record({ ...state, visorOpen: !state.visorOpen }, state.visorOpen ? "Visor closed" : "Visor opened");
  }
  switch (action.type) {
    case "select-category": {
      if (state.activeCategory === action.category) return state;
      const next = archivePanel(archiveCategory(state), { kind: "command" });
      return { ...next, activeCategory: action.category, composing: true };
    }
    case "return-terminal": return archivePanel({ ...state, composing: false, visorOpen: false }, { kind: "command" });
    case "begin-command": {
      const next = archivePanel({ ...state, composing: true }, { kind: "command" });
      return state.composing && state.workspace.kind === "command" ? state : record(next, "Command input ready");
    }
    case "open-panel": return archivePanel(closeComposer(state), { kind: "panel", view: action.view, mode: getPanelLaunchMode(action.view, state.visorOpen) });
    case "minimize-panel": return archivePanel(state, { kind: "command" });
    case "hide-panel": return state.workspace.kind === "panel" && state.workspace.view === action.view ? archivePanel(state, { kind: "command" }) : state;
    case "resize-panel": return state.workspace.kind === "panel" ? { ...state, workspace: { ...state.workspace, mode: "split" } } : state;
    case "restore-view": {
      const entry = state.history.find((item) => item.id === action.id);
      if (!entry || (entry.kind !== "view" && entry.kind !== "category")) return state;
      const next = archivePanel(archiveCategory(entry.kind === "view" ? closeComposer(state) : state), { kind: "command" });
      if (entry.kind === "category") return { ...next, activeCategory: entry.category, composing: true, history: next.history.filter((item) => item.id !== entry.id) };
      return { ...next, workspace: { kind: "panel", view: entry.view, mode: getPanelLaunchMode(entry.view, state.visorOpen) }, history: next.history.filter((item) => item.id !== entry.id) };
    }
    case "record-action": return record(state, action.label);
    case "submit-command": {
      const text = action.text.trim();
      if (!text) return state;
      // No backend runner exists yet: never label preview submissions as
      // successful executions or execute untrusted text as a shell command.
      return { ...state, nextId: state.nextId + 1, history: [...state.history, { id: state.nextId, kind: "command", text, status: "execution-preview" }] };
    }
    case "toggle-composer": return record({ ...state, composing: !state.composing }, state.composing ? "Command composer closed" : "Command composer opened");
    case "close-composer": return closeComposer(state);
    default: {
      const source = action.type === "select-panel" || action.type === "expand-panel" ? closeComposer(state) : state;
      const mode = getPanelLaunchMode(action.view, state.visorOpen);
      const selection = action.type === "select-panel" ? { ...action, mode } : action;
      const next = archivePanel(source, workspaceReducer(source.workspace, selection));
      return next;
    }
  }
}

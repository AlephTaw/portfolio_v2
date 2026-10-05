export type PanelView = "build" | "inventory" | "chat" | "activity" | "admin" | "settings" | "component-settings" | "harness";
export type PanelMode = "split" | "full" | "third";
export type WorkspaceState =
  | { kind: "command" }
  | { kind: "panel"; view: PanelView; mode: PanelMode };
export type WorkspaceAction =
  | { type: "select-panel"; view: PanelView; mode?: PanelMode }
  | { type: "expand-panel"; view: PanelView };

export function getPanelLaunchMode(view: PanelView, visorOpen: boolean): PanelMode {
  if (view === "settings" || view === "component-settings" || view === "harness") return "full";
  return visorOpen ? "third" : view === "chat" ? "split" : "full";
}

export function createWorkspaceState(view: PanelView | null): WorkspaceState {
  return view ? { kind: "panel", view, mode: getPanelLaunchMode(view, false) } : { kind: "command" };
}

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  // Activation toggles by destination, regardless of the current window size.
  if (action.type === "select-panel" && state.kind === "panel" && state.view === action.view) return { kind: "command" };
  const mode = action.type === "select-panel" ? action.mode ?? getPanelLaunchMode(action.view, false) : "full";
  if (state.kind === "panel" && state.view === action.view && state.mode === mode) return state;
  return { kind: "panel", view: action.view, mode };
}

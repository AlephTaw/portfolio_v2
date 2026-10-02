"use client";

import { useCallback, useEffect, useState, type SetStateAction } from "react";
import type { Viewport } from "@xyflow/react";

export type ActionChoice = { id: string; label: string; parentId?: string };
export type ScenarioPanel = { title: string; description: string; highlightedActions?: ActionChoice[] };
export type CustomActionSequence = { id: string; name: string; actions: ActionChoice[] };
export type ScheduledAction = { id: string; actionId: string; label: string; date: string; hour: number };
export type ActionSpaceView = {
  included: string[];
  expanded: string[];
  hidden: string[];
  active: string | null;
  focusedNodeId: string | null;
  selectedScenarioLeafId: string | null;
  selectedCustomSequenceId: string | null;
  panelView: "action-space" | "schedule";
  scenarioPaneRatio: number;
  viewport: Viewport;
  unfocusedViewport: Viewport | null;
  open: boolean;
};
export type ActionSpaceState = {
  version: 1;
  seed: number;
  nodes: ActionChoice[];
  edges: { id: string; source: string; target: string }[];
  view: ActionSpaceView;
  savedViews: { id: string; name: string; view: ActionSpaceView; updatedAt: string }[];
  activeViewId: string | null;
  scenarioPanels: Record<string, ScenarioPanel>;
  customSequences: CustomActionSequence[];
  scheduledActions: ScheduledAction[];
};

const storageKey = "mvp.action-space.v1";
export const sequenceCount = 5;
const labels = ["Explore", "Build", "Ask", "Observe", "Test", "Pause", "Trade", "Learn", "Commit", "Adapt", "Document", "Refine"];

function hash(value: string) {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}

export function emptyActionSpaceView(open = true): ActionSpaceView {
  return { included: [], expanded: [], hidden: [], active: null, focusedNodeId: null, selectedScenarioLeafId: null, selectedCustomSequenceId: null, panelView: "action-space", scenarioPaneRatio: 80, viewport: { x: 0, y: 0, zoom: 1 }, unfocusedViewport: null, open };
}

function createGraph(): ActionSpaceState {
  const seed = Math.floor(Math.random() * 0x7fffffff);
  const nodes: ActionChoice[] = [];
  const edges: ActionSpaceState["edges"] = [];
  const add = (node: ActionChoice, depth: number) => {
    nodes.push(node);
    if (node.parentId) edges.push({ id: `branch-${node.id}`, source: node.parentId, target: node.id });
    if (depth === sequenceCount) return;
    const count = 1 + hash(`${seed}:${node.id}:count`) % 5;
    const offset = hash(`${seed}:${node.id}:labels`) % labels.length;
    for (let index = 0; index < count; index += 1) {
      add({ id: `${node.id}/${index}`, label: labels[(offset + index * 7) % labels.length], parentId: node.id }, depth + 1);
    }
  };
  add({ id: "A", label: "Choice A" }, 1);
  add({ id: "B", label: "Choice B" }, 1);
  return { version: 1, seed, nodes, edges, view: emptyActionSpaceView(false), savedViews: [], activeViewId: null, scenarioPanels: {}, customSequences: [], scheduledActions: [] };
}

function validViewport(value: unknown): value is Viewport {
  if (!value || typeof value !== "object") return false;
  const viewport = value as Viewport;
  return [viewport.x, viewport.y, viewport.zoom].every(Number.isFinite) && viewport.zoom >= 0.55 && viewport.zoom <= 2.5;
}

function validView(view: ActionSpaceView, ids: Set<string>, customIds: Set<string>) {
  return view && Array.isArray(view.included) && Array.isArray(view.expanded) && Array.isArray(view.hidden) && view.hidden.every((id) => ids.has(id))
    && view.included.every((id) => ids.has(id)) && view.expanded.every((id) => ids.has(id))
    && (view.active === null || ids.has(view.active)) && (view.focusedNodeId === null || ids.has(view.focusedNodeId))
    // A selected visible leaf may have unexplored children in the full graph.
    && (view.selectedScenarioLeafId === null || ids.has(view.selectedScenarioLeafId))
    && (view.selectedCustomSequenceId === null || (customIds.has(view.selectedCustomSequenceId) && view.selectedScenarioLeafId === null))
    && (view.panelView === "action-space" || view.panelView === "schedule")
    && Number.isFinite(view.scenarioPaneRatio) && view.scenarioPaneRatio >= 60 && view.scenarioPaneRatio <= 85
    && validViewport(view.viewport) && (view.unfocusedViewport === null || validViewport(view.unfocusedViewport)) && typeof view.open === "boolean";
}

function readSavedState(): ActionSpaceState | null {
  const serialized = window.localStorage.getItem(storageKey);
  if (!serialized) return null;
  const state = JSON.parse(serialized) as ActionSpaceState;
  const invalid = () => { throw new Error("Saved action space could not be restored"); };
  if (!state || state.version !== 1 || !Number.isInteger(state.seed) || !Array.isArray(state.nodes) || !Array.isArray(state.edges)) return invalid();
  if (!state.nodes.every((node) => node && typeof node.id === "string" && /^[AB](?:\/[0-4]){0,4}$/.test(node.id) && typeof node.label === "string"
    && node.parentId === (node.id.includes("/") ? node.id.slice(0, node.id.lastIndexOf("/")) : undefined))) return invalid();
  const ids = new Set(state.nodes.map((node) => node.id));
  state.scheduledActions ??= [];
  if (!Array.isArray(state.scheduledActions) || !state.scheduledActions.every((entry) => entry && typeof entry.id === "string"
    && typeof entry.actionId === "string" && typeof entry.label === "string" && typeof entry.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(entry.date)
    && Number.isInteger(entry.hour) && entry.hour >= 0 && entry.hour < 24)) return invalid();
  state.customSequences ??= [];
  if (!Array.isArray(state.customSequences) || !state.customSequences.every((sequence) => sequence && typeof sequence.id === "string"
    && typeof sequence.name === "string" && sequence.name.trim() && Array.isArray(sequence.actions) && sequence.actions.length > 0
    && sequence.actions.every((action) => action && typeof action.id === "string" && typeof action.label === "string" && action.label.trim()))) return invalid();
  const customIds = new Set(state.customSequences.map((sequence) => sequence.id));
  const panelIds = new Set([...ids, ...state.customSequences.flatMap((sequence) => sequence.actions.map((action) => action.id))]);
  if (customIds.size !== state.customSequences.length || panelIds.size !== ids.size + state.customSequences.reduce((count, sequence) => count + sequence.actions.length, 0)) return invalid();
  state.scenarioPanels ??= {};
  if (!state.scenarioPanels || typeof state.scenarioPanels !== "object" || Array.isArray(state.scenarioPanels)
    || !Object.entries(state.scenarioPanels).every(([id, panel]) => panelIds.has(id) && panel && typeof panel.title === "string" && typeof panel.description === "string"
      && (panel.highlightedActions === undefined || (Array.isArray(panel.highlightedActions) && panel.highlightedActions.every((action) => action && typeof action.id === "string" && typeof action.label === "string"))))) return invalid();
  if (!ids.has("A") || !ids.has("B") || ids.size !== state.nodes.length || !state.nodes.every((node) => !node.parentId || ids.has(node.parentId))) return invalid();
  if (!state.edges.every((edge) => edge && typeof edge.id === "string" && ids.has(edge.source) && ids.has(edge.target))) return invalid();
  const parentIds = new Set(state.nodes.flatMap((node) => node.parentId ? [node.parentId] : []));
  const rootIds = new Set(state.nodes.filter((node) => !node.parentId).map((node) => node.id));
  // Add scenario state to existing working/saved views without resetting their paths.
  const migrateView = (view: ActionSpaceView) => {
    if (!view) return;
    // Restore roots hidden by older versions in both working and saved views.
    if (Array.isArray(view.hidden)) view.hidden = view.hidden.filter((id) => !rootIds.has(id));
    if (view.selectedScenarioLeafId === undefined) {
      view.selectedScenarioLeafId = view.active && !parentIds.has(view.active) ? view.active
        : Array.isArray(view.included) ? view.included.filter((id) => !parentIds.has(id)).at(-1) ?? null : null;
    }
    view.scenarioPaneRatio ??= 80;
    view.selectedCustomSequenceId ??= null;
    view.panelView ??= "action-space";
  };
  migrateView(state.view);
  if (Array.isArray(state.savedViews)) state.savedViews.forEach((saved) => { if (saved) migrateView(saved.view); });
  if (!validView(state.view, ids, customIds) || !Array.isArray(state.savedViews)
    || !state.savedViews.every((saved) => saved && typeof saved.id === "string" && typeof saved.name === "string" && typeof saved.updatedAt === "string" && validView(saved.view, ids, customIds))
    || !(state.activeViewId === null || state.savedViews.some((saved) => saved.id === state.activeViewId))) return invalid();
  return state;
}

export function useActionSpaceState() {
  const [state, setState] = useState<ActionSpaceState | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [cameraRevision, setCameraRevision] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setState(readSavedState() ?? createGraph());
      } catch {
        // Keep unreadable stored data until the user explicitly confirms replacement.
        setLoadError(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Report storage availability to the user.
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [state]);

  const updateView = useCallback((update: SetStateAction<ActionSpaceView>) => {
    setState((current) => {
      if (!current) return current;
      const next = typeof update === "function" ? update(current.view) : update;
      const rootIds = new Set(current.nodes.filter((node) => !node.parentId).map((node) => node.id));
      return { ...current, view: { ...next, hidden: next.hidden.filter((id) => !rootIds.has(id)) } };
    });
  }, []);

  const clearView = useCallback(() => {
    setState((current) => current ? { ...current, view: emptyActionSpaceView(), activeViewId: null } : current);
    setCameraRevision((revision) => revision + 1);
  }, []);
  const scheduleAction = useCallback((action: ActionChoice, date: string, hour: number) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(hour) || hour < 0 || hour > 23) return;
    const id = `scheduled-${globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
    setState((current) => current ? { ...current, scheduledActions: [...current.scheduledActions, { id, actionId: action.id, label: action.label, date, hour }] } : current);
  }, []);
  const unscheduleAction = useCallback((id: string) => {
    setState((current) => current ? { ...current, scheduledActions: current.scheduledActions.filter((entry) => entry.id !== id) } : current);
  }, []);
  const updateScenarioPanel = useCallback((id: string, panel: ScenarioPanel) => {
    setState((current) => current && (current.nodes.some((node) => node.id === id) || current.customSequences.some((sequence) => sequence.actions.some((action) => action.id === id)))
      ? { ...current, scenarioPanels: { ...current.scenarioPanels, [id]: panel } } : current);
  }, []);
  const saveCustomSequence = useCallback((name: string, labels: string[], existingId?: string) => {
    const id = existingId ?? `custom-${globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
    setState((current) => {
      const cleanLabels = labels.map((label) => label.trim()).filter(Boolean);
      if (!current || !name.trim() || !cleanLabels.length) return current;
      const existing = current.customSequences.find((sequence) => sequence.id === id);
      const actions = cleanLabels.map((label, index) => ({ id: existing?.actions[index]?.id ?? `${id}/step-${index}`, label }));
      const sequence = { id, name: name.trim(), actions };
      const validPanelIds = new Set([...current.nodes.map((node) => node.id), ...current.customSequences.filter((entry) => entry.id !== id).flatMap((entry) => entry.actions.map((action) => action.id)), ...actions.map((action) => action.id)]);
      return { ...current, customSequences: [...current.customSequences.filter((entry) => entry.id !== id), sequence],
        scenarioPanels: Object.fromEntries(Object.entries(current.scenarioPanels).filter(([panelId]) => validPanelIds.has(panelId))),
        view: { ...current.view, selectedCustomSequenceId: id, selectedScenarioLeafId: null } };
    });
  }, []);
  const selectCustomSequence = useCallback((id: string) => {
    setState((current) => current?.customSequences.some((sequence) => sequence.id === id)
      ? { ...current, view: { ...current.view, selectedCustomSequenceId: id, selectedScenarioLeafId: null } } : current);
  }, []);
  const newGraph = useCallback(() => {
    setState({ ...createGraph(), view: emptyActionSpaceView() });
    setLoadError(false);
    setCameraRevision((revision) => revision + 1);
  }, []);

  const saveView = useCallback((name: string, asNew = false) => {
    const newId = globalThis.crypto?.randomUUID?.() ?? `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const updatedAt = new Date().toISOString();
    setState((current) => {
      if (!current || !name.trim()) return current;
      const id = !asNew && current.activeViewId ? current.activeViewId : newId;
      const saved = { id, name: name.trim(), view: current.view, updatedAt };
      return { ...current, activeViewId: id, savedViews: [...current.savedViews.filter((view) => view.id !== id), saved] };
    });
  }, []);

  const renameView = useCallback((id: string, name: string) => {
    const updatedAt = new Date().toISOString();
    setState((current) => current && name.trim() ? { ...current, savedViews: current.savedViews.map((saved) => saved.id === id ? { ...saved, name: name.trim(), updatedAt } : saved) } : current);
  }, []);

  const selectView = useCallback((id: string) => {
    setState((current) => {
      const saved = current?.savedViews.find((view) => view.id === id);
      return current && saved ? { ...current, activeViewId: id, view: { ...saved.view, open: true } } : current;
    });
    setCameraRevision((revision) => revision + 1);
  }, []);

  const deleteView = useCallback((id: string) => setState((current) => current ? {
    ...current, savedViews: current.savedViews.filter((saved) => saved.id !== id), activeViewId: current.activeViewId === id ? null : current.activeViewId,
  } : current), []);

  return { state, updateView, updateScenarioPanel, saveCustomSequence, selectCustomSequence, scheduleAction, unscheduleAction, clearView, newGraph, saveView, renameView, selectView, deleteView, saveError, loadError, cameraRevision };
}

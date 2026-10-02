"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Background,
  Handle,
  Position,
  ReactFlow,
  useUpdateNodeInternals,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useStateView } from "../../state/components/state-view-context";
import { sequenceCount, type ActionChoice } from "./action-space-state";
import { ActionSpaceConfirmation } from "./action-space-confirmation";
import { ActionSpaceViews } from "./action-space-views";
import { CurrentScenario } from "./current-scenario";
import { ScenarioSchedule, type CalendarDateDrop } from "./scenario-schedule";
import { CustomActionSequences } from "./custom-action-sequences";
import { isVisibleActionLeaf, removeActionBranch, visibleActionChildren } from "./action-space-visibility";
import { SplitResizeHandle } from "../split-resize-handle";

type StoryNode = Node<{
  label: string;
  hasParent: boolean;
  hasChildren: boolean;
  expanded: boolean;
  included: boolean;
  onToggle: () => void;
  onRemove: () => void;
  focused: boolean;
  onFocus: () => void;
}, "storyLabel">;
const rowSpacing = 108;
const nodeTypes = { storyLabel: StoryLabelNode };
const nodeControlClass = "nodrag nopan flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black text-base text-white/80 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white disabled:cursor-default disabled:opacity-30";

function calendarSlotAt(x: number, y: number) {
  return document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-calendar-slot]");
}

function StoryLabelNode({ id, width, data, selected }: NodeProps<StoryNode>) {
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    const frame = requestAnimationFrame(() => updateNodeInternals(id));
    return () => cancelAnimationFrame(frame);
  }, [data.hasChildren, data.hasParent, id, updateNodeInternals, width]);
  return (
    <div className={`group relative w-full text-center text-xs font-medium leading-tight sm:text-sm ${selected ? "text-white" : "text-white/70"}`}>
      {data.hasParent && <Handle className="!border-0 !bg-transparent !opacity-0" isConnectable={false} position={Position.Top} type="target" />}
      <span>{data.label}</span>
      {data.hasChildren && <Handle className="!border-0 !bg-transparent !opacity-0" isConnectable={false} position={Position.Bottom} type="source" />}
      <div aria-label={`Controls for ${data.label}`} role="group" className="absolute left-1/2 top-full z-10 flex -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <button
          aria-expanded={data.hasChildren ? data.expanded : undefined}
          aria-label={`${data.included ? "Expand" : "Include"} ${data.label}`}
          className={nodeControlClass}
          disabled={data.included && !data.hasChildren}
          onClick={(event) => {
            event.stopPropagation();
            data.onToggle();
          }}
          type="button"
        >
          <span aria-hidden="true">+</span>
        </button>
        {data.hasParent && <button aria-label={`Remove ${data.label} from view`} className={nodeControlClass} onClick={(event) => { event.stopPropagation(); data.onRemove(); }} type="button"><span aria-hidden="true">−</span></button>}
        <button
          aria-label={`${data.focused ? "Exit focus on" : "Focus on"} ${data.label}`}
          aria-pressed={data.focused}
          className={nodeControlClass}
          onClick={(event) => {
            event.stopPropagation();
            data.onFocus();
          }}
          type="button"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function StoryboardV2() {
  const { actionSpace } = useStateView();
  const { state, updateView, clearView, newGraph, saveError, loadError, scheduleAction } = actionSpace;
  const ready = state !== null;
  const canvasRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(320);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [scenarioExpanded, setScenarioExpanded] = useState(false);
  const [customSequencesOpen, setCustomSequencesOpen] = useState(false);
  const [pendingCalendarAction, setPendingCalendarAction] = useState<ActionChoice | null>(null);
  const [calendarDrag, setCalendarDrag] = useState<{ action: ActionChoice; x: number; y: number } | null>(null);
  const [hoveredCalendarSlot, setHoveredCalendarSlot] = useState<string | null>(null);
  const [calendarDateDrop, setCalendarDateDrop] = useState<CalendarDateDrop | null>(null);
  const [pendingReset, setPendingReset] = useState<"clear" | "new" | null>(null);
  const exploration = state?.view;
  const focusedNodeId = exploration?.focusedNodeId;
  const flowRef = useRef<ReactFlowInstance<StoryNode, Edge> | null>(null);
  const dragCalendarAction = useCallback((action: ActionChoice | null, x: number, y: number) => {
    setCalendarDrag(action ? { action, x, y } : null);
    setHoveredCalendarSlot(action ? calendarSlotAt(x, y)?.dataset.calendarSlot ?? null : null);
  }, []);
  const dropCalendarAction = useCallback((action: ActionChoice, x: number, y: number) => {
    const slot = calendarSlotAt(x, y);
    if (slot?.dataset.calendarDate && slot.dataset.calendarHour) {
      scheduleAction(action, slot.dataset.calendarDate, Number(slot.dataset.calendarHour));
      setPendingCalendarAction(null);
    } else if (slot?.dataset.calendarDate) {
      setCalendarDateDrop({ action, date: slot.dataset.calendarDate });
    }
  }, [scheduleAction]);

  const exitFocus = useCallback(() => {
    const viewport = exploration?.unfocusedViewport;
    updateView((current) => ({ ...current, focusedNodeId: null, unfocusedViewport: null, viewport: viewport ?? current.viewport }));
    if (viewport) void flowRef.current?.setViewport(viewport, { duration: 300 });
  }, [exploration?.unfocusedViewport, updateView]);

  const focusChoice = useCallback((choice: ActionChoice) => {
    if (focusedNodeId === choice.id) {
      exitFocus();
      return;
    }
    const flow = flowRef.current;
    const node = flow?.getNode(choice.id);
    if (!flow || !node) return;
    const previousViewport = flow.getViewport();
    const zoom = Math.max(1.35, previousViewport.zoom);
    const viewport = {
      x: (canvasRef.current?.clientWidth ?? 320) / 2 - (node.position.x + (node.measured?.width ?? Number(node.style?.width ?? 60)) / 2) * zoom,
      y: (canvasRef.current?.clientHeight ?? 300) / 2 - (node.position.y + (node.measured?.height ?? 18) / 2) * zoom,
      zoom,
    };
    updateView((current) => ({ ...current, focusedNodeId: choice.id, unfocusedViewport: current.unfocusedViewport ?? previousViewport, viewport }));
    void flow.setViewport(viewport, { duration: 300 });
  }, [exitFocus, focusedNodeId, updateView]);

  const toggleBranch = useCallback((id: string) => {
    updateView((current) => {
      // Select the endpoint as it appeared when clicked, before expanding it.
      const isLeaf = isVisibleActionLeaf(state?.nodes ?? [], current, id);
      const selectedScenarioLeafId = isLeaf ? id : current.selectedScenarioLeafId;
      const selectedCustomSequenceId = isLeaf ? null : current.selectedCustomSequenceId;
      if (!current.included.includes(id)) {
        return { ...current, included: [...current.included, id], hidden: current.hidden.filter((hidden) => hidden !== id), active: id, selectedScenarioLeafId, selectedCustomSequenceId };
      }
      return {
        ...current,
        expanded: [...new Set([...current.expanded, id])],
        hidden: current.hidden.filter((hidden) => !state?.nodes.some((node) => node.id === hidden && node.parentId === id)),
        active: id,
        selectedScenarioLeafId,
        selectedCustomSequenceId,
      };
    });
  }, [state?.nodes, updateView]);

  const removeNode = useCallback((id: string) => {
    if (!state?.nodes.find((node) => node.id === id)?.parentId) return;
    const inBranch = (nodeId: string) => nodeId === id || nodeId.startsWith(`${id}/`);
    const removedFocus = focusedNodeId && inBranch(focusedNodeId);
    const restoredViewport = removedFocus ? exploration?.unfocusedViewport : null;
    updateView((current) => removeActionBranch(state.nodes, current, id));
    if (restoredViewport) void flowRef.current?.setViewport(restoredViewport, { duration: 300 });
  }, [exploration?.unfocusedViewport, focusedNodeId, state?.nodes, updateView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let frame = 0;
    const observer = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCanvasWidth(entry.contentRect.width));
    });
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ready]);

  const restoreCamera = useEffectEvent(() => {
    if (exploration) void flowRef.current?.setViewport(exploration.viewport);
  });
  // Camera commands only run when a saved view is selected or explicitly reset.
  useEffect(() => {
    restoreCamera();
  }, [actionSpace.cameraRevision]);

  const choicesByParent = useMemo(() => {
    const children = new Map<string | undefined, ActionChoice[]>();
    for (const choice of state?.nodes ?? []) {
      children.set(choice.parentId, [...(children.get(choice.parentId) ?? []), choice]);
    }
    return children;
  }, [state?.nodes]);

  const customSequence = state?.customSequences.find((sequence) => sequence.id === exploration?.selectedCustomSequenceId);
  const scenarioActions = useMemo(() => {
    if (customSequence) return customSequence.actions;
    const byId = new Map((state?.nodes ?? []).map((choice) => [choice.id, choice]));
    const path: ActionChoice[] = [];
    let choice = exploration?.selectedScenarioLeafId ? byId.get(exploration.selectedScenarioLeafId) : undefined;
    while (choice) {
      path.unshift(choice);
      choice = choice.parentId ? byId.get(choice.parentId) : undefined;
    }
    return path;
  }, [customSequence, exploration?.selectedScenarioLeafId, state?.nodes]);
  const scenarioIds = useMemo(() => new Set(scenarioActions.map((choice) => choice.id)), [scenarioActions]);

  const visibleChoices = useMemo(() => {
    if (!exploration) return [];
    const positioned: { choice: ActionChoice; x: number; level: number }[] = [];
    let nextLeaf = 0;
    const place = (choice: ActionChoice, level: number): number => {
      const children = visibleActionChildren(choicesByParent.get(choice.id) ?? [], exploration, choice.id);
      const childPositions = children.map((child) => place(child, level + 1));
      const x = childPositions.length
        ? (childPositions[0] + childPositions[childPositions.length - 1]) / 2
        : nextLeaf++;
      positioned.push({ choice, x, level });
      return x;
    };
    (choicesByParent.get(undefined) ?? []).forEach((choice) => place(choice, 0));
    const spacing = Math.min(104, Math.max(88, (canvasWidth - 20) / 5));
    const width = nextLeaf * spacing;
    const offset = Math.max(10, (canvasWidth - width) / 2);
    return positioned.map((item) => ({ ...item, x: offset + item.x * spacing }));
  }, [canvasWidth, choicesByParent, exploration]);

  const nodes = useMemo<StoryNode[]>(() => visibleChoices.map(({ choice, x, level }) => ({
      id: choice.id,
      type: "storyLabel",
      position: { x, y: 24 + level * rowSpacing },
      width: Math.min(96, Math.max(60, (canvasWidth - 20) / 5 - 8)),
      height: 18,
      style: { width: Math.min(96, Math.max(60, (canvasWidth - 20) / 5 - 8)), height: 18 },
      data: {
        label: choice.label,
        hasParent: level > 0,
        hasChildren: choice.id.split("/").length < sequenceCount,
        included: exploration?.included.includes(choice.id) ?? false,
        expanded: exploration?.active === choice.id && exploration.expanded.includes(choice.id) && choice.id.split("/").length < sequenceCount,
        onToggle: () => toggleBranch(choice.id),
        onRemove: () => removeNode(choice.id),
        focused: focusedNodeId === choice.id,
        onFocus: () => focusChoice(choice),
      },
      selected: exploration?.included.includes(choice.id) ?? false,
    })), [canvasWidth, exploration, focusChoice, focusedNodeId, removeNode, toggleBranch, visibleChoices]);

  const edges = useMemo<Edge[]>(() => {
    const visibleIds = new Set(visibleChoices.map(({ choice }) => choice.id));
    return (state?.edges ?? []).filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)).map((edge) => ({
    ...edge,
    type: "straight",
    selectable: false,
    style: { stroke: scenarioIds.has(edge.source) && scenarioIds.has(edge.target) ? "#fff" : "rgba(255, 255, 255, 0.45)", strokeWidth: 1.25 },
  }));
  }, [scenarioIds, state?.edges, visibleChoices]);

  if (loadError) return <section className="text-sm text-white/65">
    <p role="status">The saved action space could not be loaded. It has not been replaced.</p>
    <button className="mt-3 cursor-pointer rounded-full border border-white/30 px-3 py-2 text-xs hover:border-white" onClick={() => setPendingReset("new")} type="button">New graph</button>
    {pendingReset && <ActionSpaceConfirmation title="Replace the saved action space?" description="This will replace the stored graph and its saved views with a new graph." confirmLabel="New graph" onCancel={() => setPendingReset(null)} onConfirm={() => { newGraph(); setPendingReset(null); }} />}
  </section>;
  if (!state || !exploration) return <p className="text-xs text-white/50">Loading action space…</p>;

  return (
    <section aria-label="Storyboard v.2" className="w-full" data-graph-node-count={state.nodes.length} data-visible-node-count={nodes.length}>
      <div className="relative grid h-[clamp(16rem,55dvh,36rem)] w-full overflow-hidden transition-[grid-template-columns] duration-300 ease-in-out motion-reduce:transition-none" ref={workspaceRef} style={{ gridTemplateColumns: `${scenarioExpanded ? 0 : exploration.scenarioPaneRatio}% minmax(0, 1fr)` }}>
      <div aria-hidden={scenarioExpanded} inert={scenarioExpanded} className="flex h-full min-w-0 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-2 py-3">
        <h3 className="whitespace-nowrap text-[0.6rem] font-medium uppercase tracking-wider text-white/60">{exploration.panelView === "schedule" ? "Schedule" : "Action space"}</h3>
        <div role="group" aria-label="Action space panel view" className="flex rounded-full bg-white/5 p-0.5 text-[0.65rem]">
          {(["schedule", "action-space"] as const).map((view) => <button key={view} type="button" aria-pressed={exploration.panelView === view} onClick={() => updateView((current) => ({ ...current, panelView: view }))} className={`cursor-pointer rounded-full px-2.5 py-1 transition-colors focus-visible:outline focus-visible:outline-white ${exploration.panelView === view ? "bg-white/15 text-white" : "text-white/50 hover:text-white"}`}>{view === "schedule" ? "Schedule" : "Action space"}</button>)}
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden [contain:strict]" ref={canvasRef}>
      <div className="absolute inset-0" style={{ opacity: exploration.panelView === "schedule" ? 0 : 1, pointerEvents: exploration.panelView === "schedule" ? "none" : "auto" }} inert={exploration.panelView === "schedule"} aria-hidden={exploration.panelView === "schedule"}>
      <ReactFlow
        aria-label="Branching storyboard canvas"
        className="storyboard-v2-flow bg-black"
        defaultViewport={exploration.viewport}
        edges={edges}
        edgesFocusable={false}
        maxZoom={2.5}
        minZoom={0.55}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
        nodeTypes={nodeTypes}
        onInit={(instance) => { flowRef.current = instance; }}
        onMoveEnd={(_, viewport) => updateView((current) => ({ ...current, viewport }))}
        onNodeClick={(_, node) => toggleBranch(node.id)}
        panOnDrag
        zoomOnPinch
        zoomOnScroll={false}
      >
        <Background color="color-mix(in srgb, var(--foreground) 15%, transparent)" gap={20} size={1} />
      </ReactFlow>
      </div>
      {exploration.panelView === "schedule" && <div className="absolute inset-0"><ScenarioSchedule entries={state.scheduledActions} pendingAction={pendingCalendarAction} hoveredSlot={hoveredCalendarSlot} onSchedule={(action, date, hour) => { actionSpace.scheduleAction(action, date, hour); setPendingCalendarAction(null); }} onRemove={actionSpace.unscheduleAction} dateDrop={calendarDateDrop} onDateDrop={setCalendarDateDrop} onCancelDateDrop={() => setCalendarDateDrop(null)} /></div>}
      </div>
      </div>
        <CurrentScenario actions={scenarioActions} onFocus={exploration.panelView === "schedule" ? setPendingCalendarAction : customSequence ? () => setCustomSequencesOpen(true) : focusChoice} expanded={scenarioExpanded} onToggleExpanded={() => setScenarioExpanded((current) => !current)} panels={state.scenarioPanels} onSavePanel={actionSpace.updateScenarioPanel} onCustomSequence={() => setCustomSequencesOpen(true)} sequenceName={customSequence?.name} scheduling={exploration.panelView === "schedule" && !scenarioExpanded} onActionDrag={dragCalendarAction} onActionDrop={dropCalendarAction} />
        {!scenarioExpanded && <SplitResizeHandle containerRef={workspaceRef} direction="vertical" label="Resize current scenario pane" minRatio={60} maxRatio={85} ratio={exploration.scenarioPaneRatio} onRatioChange={(scenarioPaneRatio) => updateView((current) => ({ ...current, scenarioPaneRatio }))} />}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-white/50">
        <span>Sequence {exploration.active ? exploration.active.split("/").length : 1} / {sequenceCount}</span>
        {focusedNodeId && <button className="cursor-pointer text-white/70 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white" onClick={exitFocus} type="button">Unfocus</button>}
        <button className="cursor-pointer text-white/70 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={() => setViewsOpen(true)} type="button">Views</button>
        <button className="cursor-pointer text-white/70 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={() => setPendingReset("clear")} type="button">Clear view</button>
        <button className="cursor-pointer text-white/70 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={() => setPendingReset("new")} type="button">New graph</button>
      </div>
      {saveError && <p className="mt-2 text-xs text-white/60" role="status">Local saving is unavailable. Keep this session open to retain your action space.</p>}
      {viewsOpen && <ActionSpaceViews onClose={() => setViewsOpen(false)} />}
      {customSequencesOpen && <CustomActionSequences sequences={state.customSequences} selectedId={exploration.selectedCustomSequenceId} onSave={actionSpace.saveCustomSequence} onSelect={actionSpace.selectCustomSequence} onClose={() => setCustomSequencesOpen(false)} />}
      {calendarDrag && createPortal(<div aria-hidden="true" className="pointer-events-none fixed z-[10000] max-w-48 rounded-lg border border-white/40 bg-black px-3 py-2 text-xs text-white shadow-xl" style={{ left: calendarDrag.x + 12, top: calendarDrag.y + 12 }}>{calendarDrag.action.label}</div>, document.body)}
      {pendingReset && <ActionSpaceConfirmation
        title={pendingReset === "clear" ? "Clear action space view?" : "Generate a new action space?"}
        description={pendingReset === "clear" ? "This resets the working view’s included nodes, hidden nodes, scenario selection, paths, and camera. The graph, named views, custom sequences, storyboard edits, and calendar entries will be kept." : "This replaces the graph, clears the working view, and removes its saved views, custom sequences, storyboard edits, and calendar entries. This cannot be undone."}
        confirmLabel={pendingReset === "clear" ? "Clear view" : "New graph"}
        onCancel={() => setPendingReset(null)}
        onConfirm={() => { if (pendingReset === "clear") clearView(); else newGraph(); setPendingReset(null); }}
      />}
    </section>
  );
}

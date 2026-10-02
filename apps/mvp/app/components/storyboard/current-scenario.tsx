"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ActionChoice, ScenarioPanel } from "./action-space-state";
import { PinScrollArea } from "../pin-scroll-area";
import { ScenarioPanelEditor } from "./scenario-panel-editor";
import { ScenarioMedia, useScenarioMedia, MediaUpload, MediaAttachments } from "./scenario-media";
import { ScenarioActionItem } from "./scenario-action-item";
import { SceneActionChips } from "./scene-action-chips";

export function CurrentScenario({ actions, onFocus, expanded, onToggleExpanded, panels, onSavePanel, onCustomSequence, sequenceName, scheduling, onActionDrag, onActionDrop }: {
  actions: ActionChoice[];
  onFocus: (action: ActionChoice) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
  panels: Record<string, ScenarioPanel>;
  onSavePanel: (id: string, panel: ScenarioPanel) => void;
  onCustomSequence: () => void;
  sequenceName?: string;
  scheduling: boolean;
  onActionDrag: (action: ActionChoice | null, x: number, y: number) => void;
  onActionDrop: (action: ActionChoice, x: number, y: number) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [storyView, setStoryView] = useState<"storyboard" | "outline">("storyboard");
  const [sceneDrag, setSceneDrag] = useState<{ action: ActionChoice; x: number; y: number } | null>(null);
  const [hoveredScene, setHoveredScene] = useState<string | null>(null);
  const [pendingSceneAction, setPendingSceneAction] = useState<ActionChoice | null>(null);
  const asideRef = useRef<HTMLElement>(null);
  const mediaLibrary = useScenarioMedia();
  const editingAction = actions.find((action) => action.id === editingId);
  const panelFor = (action: ActionChoice): ScenarioPanel => panels[action.id] ?? { title: action.label, description: "" };
  const sceneAt = (x: number, y: number) => {
    const scene = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-scenario-scene]");
    return scene && asideRef.current?.contains(scene) ? scene.dataset.scenarioScene : undefined;
  };
  const assignAction = (sceneId: string, action: ActionChoice) => {
    const scene = actions.find((choice) => choice.id === sceneId);
    if (!scene) return;
    const panel = panelFor(scene);
    const highlightedActions = panel.highlightedActions ?? [];
    if (!highlightedActions.some((choice) => choice.id === action.id)) onSavePanel(sceneId, { ...panel, highlightedActions: [...highlightedActions, { id: action.id, label: action.label }] });
    setPendingSceneAction(null);
  };
  const editOrAssign = (sceneId: string) => {
    if (pendingSceneAction) assignAction(sceneId, pendingSceneAction);
    else setEditingId(sceneId);
  };
  const chipsFor = (sceneId: string, panel: ScenarioPanel) => panel.highlightedActions?.length ? <SceneActionChips actions={panel.highlightedActions} onRemove={(id) => onSavePanel(sceneId, { ...panel, highlightedActions: panel.highlightedActions?.filter((choice) => choice.id !== id) })} /> : null;
  return (
    <aside ref={asideRef} aria-label="Current scenario" className="flex h-full min-h-0 min-w-0 flex-col border-l border-white/15 bg-black">
      <div className="flex shrink-0 items-start justify-between gap-1 px-2 py-3">
        <div>
        <h3 className="whitespace-nowrap text-[0.5rem] font-medium uppercase tracking-[0.02em] text-white/60 sm:text-[0.6rem]">Scenario</h3>
        {actions.length > 0 && <p className="mt-1 text-[0.55rem] text-white/40">{actions.length} actions</p>}
        </div>
        <button type="button" aria-label={expanded ? "Restore action space" : "Expand scenario"} aria-expanded={expanded} onClick={onToggleExpanded} className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/65 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-white">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={expanded ? "M5 12h14m-6-6 6 6-6 6" : "M19 12H5m6-6-6 6 6 6"} /></svg>
        </button>
      </div>
      <PinScrollArea aria-label="Scenario actions" className="overscroll-contain px-2 pb-3" wrapperClassName="min-h-0 flex-1">
        <button type="button" onClick={onCustomSequence} className="mb-3 w-full cursor-pointer rounded-lg border border-white/25 px-1.5 py-2 text-left text-[0.6rem] leading-snug text-white/70 hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-white">Custom action sequence</button>
        {sequenceName && <p className="mb-3 break-words text-xs text-white/60">{sequenceName}</p>}
        {actions.length === 0 ? <p role="status" className="text-[0.6rem] leading-relaxed text-white/45">No scenario selected.</p> : (
          <div role={expanded ? "region" : undefined} aria-label={expanded ? "Scenario sequence" : undefined} tabIndex={expanded ? 0 : undefined} className={expanded ? "pin-scrollbar mb-5 overflow-x-auto overscroll-x-contain pb-2 focus-visible:outline focus-visible:outline-white" : undefined}>
          <ol className={expanded ? "flex w-max min-w-full gap-2" : "space-y-2"} aria-live="polite">
            {actions.map((action, index) => (
              <li key={action.id} className={expanded ? "w-36 shrink-0 sm:w-44" : undefined}>
                <ScenarioActionItem action={action} index={index} dragEnabled={scheduling || expanded} onSelect={() => expanded ? setPendingSceneAction(action) : onFocus(action)} onDrag={expanded ? (draggedAction, x, y) => {
                  setSceneDrag(draggedAction ? { action: draggedAction, x, y } : null);
                  setHoveredScene(draggedAction ? sceneAt(x, y) ?? null : null);
                } : onActionDrag} onDrop={expanded ? (draggedAction, x, y) => {
                  const sceneId = sceneAt(x, y);
                  if (sceneId) assignAction(sceneId, draggedAction);
                } : onActionDrop} />
              </li>
            ))}
          </ol>
          </div>
        )}
        {expanded && actions.length > 0 && <section aria-label={storyView === "outline" ? "Scenario outline" : "Scenario storyboard"}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-white/65">{storyView === "outline" ? "Outline" : "Storyboard"}</h4>
            <div role="group" aria-label="Scenario story view" className="flex rounded-full bg-white/5 p-0.5 text-[0.65rem]">
              {(["storyboard", "outline"] as const).map((view) => <button key={view} type="button" aria-pressed={storyView === view} onClick={() => setStoryView(view)} className={`cursor-pointer rounded-full px-3 py-1 transition-colors focus-visible:outline focus-visible:outline-white ${storyView === view ? "bg-white/15 text-white" : "text-white/50 hover:text-white"}`}>{view === "outline" ? "Outline" : "Storyboard"}</button>)}
            </div>
          </div>
          <p role="status" className="mb-2 text-[0.65rem] text-white/40">{pendingSceneAction ? `Choose a scene for ${pendingSceneAction.label}.` : "Drag an action onto a scene, or select an action and then a scene."}{pendingSceneAction && <button type="button" onClick={() => setPendingSceneAction(null)} className="ml-2 cursor-pointer text-white/65">Cancel</button>}</p>
          <ol className={storyView === "outline" ? "list-decimal space-y-3 pl-5 marker:font-mono marker:text-[0.65rem] marker:text-white/45" : "grid grid-cols-2 gap-3 sm:grid-cols-3"} aria-live="polite">
            {actions.map((action, index) => {
              const panel = panelFor(action);
              const attachments = mediaLibrary.media.filter((item) => item.actionId === action.id);
              return <li key={action.id} data-scenario-scene={action.id} className={`min-w-0 ${hoveredScene === action.id ? "outline outline-1 outline-white/50" : ""}`}>
                {storyView === "outline" ? <>
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" aria-label={`Edit panel ${index + 1}: ${panel.title}`} onClick={() => editOrAssign(action.id)} className="min-w-0 flex-1 cursor-pointer py-0.5 text-left text-xs font-medium leading-5 text-white focus-visible:outline focus-visible:outline-white">{panel.title}</button>
                    <div className="shrink-0 whitespace-nowrap"><MediaUpload compact text="Attach media" label={`Attach media to ${panel.title}`} onUpload={(files) => mediaLibrary.add(files, action.id)} /></div>
                  </div>
                  <button type="button" aria-label={`Edit notes for ${panel.title}`} onClick={() => editOrAssign(action.id)} className="mt-1 w-full cursor-pointer whitespace-pre-wrap break-words text-left text-xs leading-5 text-white/60 hover:text-white/80 focus-visible:outline focus-visible:outline-white">{panel.description || "Add scene notes…"}</button>
                  {chipsFor(action.id, panel)}
                  {attachments.length > 0 && <div aria-label={`Media for ${panel.title}`} className="mt-1"><MediaAttachments compact media={attachments} onRemove={mediaLibrary.remove} /></div>}
                </> : <div className="flex aspect-[4/3] w-full flex-col rounded-lg border border-white/20 bg-white/5 p-3 hover:border-white/60">
                <button type="button" aria-label={`Edit panel ${index + 1}: ${panel.title}`} onClick={() => editOrAssign(action.id)} className="flex min-h-0 w-full flex-1 cursor-pointer flex-col items-start overflow-hidden text-left focus-visible:outline focus-visible:outline-white">
                  {storyView === "storyboard" && <span className="text-[0.6rem] text-white/40">{String(index + 1).padStart(2, "0")}</span>}
                  <span className="mt-2 break-words text-sm font-medium text-white">{panel.title}</span>
                  <span className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/60">{panel.description || "Add scene notes…"}</span>
                  {storyView === "storyboard" && attachments.length > 0 && <span className="mt-2 text-[0.6rem] text-white/45">{attachments.length} attached media</span>}
                </button>
                {chipsFor(action.id, panel)}
                </div>}
              </li>;
            })}
          </ol>
        </section>}
        <div hidden={!expanded}><ScenarioMedia library={mediaLibrary} actions={actions.map((action) => ({ id: action.id, label: panelFor(action).title }))} /></div>
      </PinScrollArea>
      {editingAction && <ScenarioPanelEditor key={editingAction.id} panel={panelFor(editingAction)} assets={mediaLibrary.media.filter((item) => item.actionId === editingAction.id)} onAttachFiles={(files) => mediaLibrary.add(files, editingAction.id)} onRemoveAsset={mediaLibrary.remove} onClose={() => setEditingId(null)} onSave={(panel) => onSavePanel(editingAction.id, panel)} />}
      {sceneDrag && createPortal(<div aria-hidden="true" className="pointer-events-none fixed z-[10000] max-w-48 rounded-full border border-white/30 bg-black px-3 py-1.5 text-xs text-white shadow-xl" style={{ left: sceneDrag.x + 12, top: sceneDrag.y + 12 }}>{sceneDrag.action.label}</div>, document.body)}
    </aside>
  );
}

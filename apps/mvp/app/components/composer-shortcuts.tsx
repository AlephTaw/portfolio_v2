"use client";

import { createContext, useContext, useEffect, useEffectEvent, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiTerminal } from "react-icons/fi";
import { suggestedActionCategories, type SuggestedActionDestination } from "./suggested-action-options";
import { speedrunViews } from "./speedrun-view-options";
import { SplitModeIcon, splitScreenActions } from "./split-screen-actions";
import type { ActionsView } from "./actions-view-context";
import type { SplitMode } from "./split-view-context";
import { useActivityWorkspace } from "./activity-workspace-context";
import { AttentionCountBadge, mapPlanNotifications } from "./attention-notifications";

type Shortcut = { id: string; label: string } & (
  { destination: SuggestedActionDestination } | { view: ActionsView } | { mode: SplitMode }
);
const shortcuts: Shortcut[] = [
  ...suggestedActionCategories.flatMap(({ id, label }) => id === "layout" || id === "views" || id === "terminal" ? [] : [{ id, label, destination: id }]),
  ...speedrunViews.map(({ view, actionLabel }) => ({ id: view, label: actionLabel, view })),
  ...splitScreenActions.map(({ mode, actionLabel }) => ({ id: `split-${mode}`, label: actionLabel, mode })),
  { id: "terminal", label: "Terminal", view: "minimap" },
];
const activityId = "current-activity";
const defaultOrder = ["activities", activityId, "systems", "terminal", "planning"];
const storageKey = "mvp:composer-shortcuts:v3";
type Drag = { id: string; x: number; y: number; index: number | null; remove: boolean };
type DockState = {
  order: string[]; drag: Drag | null;
  move: (id: string, index: number) => void; remove: (id: string) => void;
  pin: (id: string, index: number) => void;
  setDrag: (drag: Drag | null) => void;
  suppressClick: () => void; clickSuppressed: () => boolean;
};
const DockContext = createContext<DockState | null>(null);
function useDock() {
  const context = useContext(DockContext);
  if (!context) throw new Error("Composer shortcuts require ComposerShortcutsProvider");
  return context;
}

function ShortcutIcon({ id, className = "size-4" }: { id: string; className?: string }) {
  const category = suggestedActionCategories.find((item) => item.id === id);
  if (category) return <category.Icon aria-hidden="true" className={className} />;
  const view = speedrunViews.find((item) => item.view === id);
  if (view) return <view.icon aria-hidden="true" className={className} />;
  const shortcut = shortcuts.find((item) => item.id === id);
  if (shortcut && "mode" in shortcut) return <SplitModeIcon mode={shortcut.mode} />;
  return <FiTerminal aria-hidden="true" className={className} />;
}

export function ComposerShortcutsProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useState(defaultOrder);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [ready, setReady] = useState(false);
  const suppressClick = useRef(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const currentPreference = localStorage.getItem(storageKey);
        const previousPreference = localStorage.getItem("mvp:composer-shortcuts:v2");
        const saved: unknown = JSON.parse(currentPreference ?? previousPreference ?? localStorage.getItem("mvp:composer-shortcuts:v1") ?? "null");
        if (Array.isArray(saved)) {
          const restored = [...new Set(saved.filter((id): id is string => typeof id === "string" && (id === activityId || shortcuts.some((item) => item.id === id))))];
          // Move the formerly embedded category control into its own shortcut once.
          if (currentPreference === null && previousPreference === null && !restored.includes("activities")) restored.splice(Math.max(0, restored.indexOf(activityId)), 0, "activities");
          if (currentPreference === null && !restored.includes("planning")) restored.push("planning");
          setOrder(restored);
        }
      } catch { /* A missing or invalid preference uses the default dock. */ }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (ready) { try { localStorage.setItem(storageKey, JSON.stringify(order)); } catch { /* Keep the dock usable when storage is unavailable. */ } }
  }, [order, ready]);
  const move = (id: string, index: number) => setOrder((current) => {
    const next = current.filter((item) => item !== id);
    next.splice(Math.max(0, Math.min(index, next.length)), 0, id);
    return next;
  });
  const pin = (id: string, index: number) => setOrder((current) => {
    if (current.includes(id)) return current;
    const next = [...current];
    next.splice(Math.max(0, Math.min(index, next.length)), 0, id);
    return next;
  });
  return <DockContext.Provider value={{ order, drag, setDrag, move, pin, remove: (id) => setOrder((current) => current.filter((item) => item !== id)), suppressClick: () => { suppressClick.current = Date.now() + 400; }, clickSuppressed: () => Date.now() < suppressClick.current }}>
    {children}
    {drag && createPortal(<div className="pointer-events-none fixed z-[300] flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-xs text-white shadow-lg" style={{ left: drag.x + 12, top: drag.y - 24 }}><ShortcutIcon id={drag.id} /><span>{shortcuts.find((item) => item.id === drag.id)?.label}</span>{drag.remove && <span>· Remove</span>}</div>, document.body)}
  </DockContext.Provider>;
}

type ShortcutPointer = Pick<PointerEvent<HTMLElement>, "currentTarget" | "pointerId" | "clientX" | "clientY" | "isPrimary" | "button" | "stopPropagation">;
function useShortcutDrag(id: string, inDock: boolean) {
  const dock = useDock();
  const gesture = useRef<{ pointer: number; x: number; y: number; dragging: boolean; drop: Drag | null } | null>(null);
  const alreadyPinned = !inDock && dock.order.includes(id);
  const finish = (event: ShortcutPointer, cancelled = false) => {
    const start = gesture.current;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (start?.dragging) {
      dock.suppressClick();
      if (!cancelled && start.drop) {
        if (start.drop.index !== null) (inDock ? dock.move : dock.pin)(id, start.drop.index);
        else if (start.drop.remove) dock.remove(id);
      }
    }
    dock.setDrag(null);
  };
  return { dock, alreadyPinned, handlers: {
    onPointerDown: (event: ShortcutPointer) => {
      event.stopPropagation();
      if (!event.isPrimary || event.button !== 0 || alreadyPinned) return;
      gesture.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, dragging: false, drop: null };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event: ShortcutPointer) => {
      event.stopPropagation();
      const start = gesture.current;
      if (!start || start.pointer !== event.pointerId) return;
      if (!start.dragging && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 8) return;
      start.dragging = true;
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const row = target?.closest<HTMLElement>("[data-shortcut-dock]");
      let index: number | null = null;
      if (row) {
        const items = [...row.querySelectorAll<HTMLElement>("[data-dock-item]")].filter((item) => item.dataset.dockItem !== id);
        index = items.findIndex((item) => { const rect = item.getBoundingClientRect(); return event.clientX < rect.left + rect.width / 2; });
        if (index < 0) index = items.length;
      }
      const drop = { id, x: event.clientX, y: event.clientY, index, remove: inDock && !!target?.closest("[data-suggested-action-area]") && !row };
      start.drop = drop;
      dock.setDrag(drop);
    },
    onPointerUp: (event: ShortcutPointer) => { event.stopPropagation(); finish(event); },
    onPointerCancel: (event: ShortcutPointer) => finish(event, true),
  } };
}

// Only the icon handles dragging, so touching a row's label can still scroll the sheet.
export function DraggableShortcut({ id, inDock = false, onActivate, selected = false }: { id: string; inDock?: boolean; onActivate?: () => void; selected?: boolean }) {
  const { dock, alreadyPinned, handlers } = useShortcutDrag(id, inDock);
  const shortcut = shortcuts.find((item) => item.id === id)!;
  return <button type="button" aria-label={inDock ? shortcut.label : `${shortcut.label} shortcut`} aria-pressed={inDock ? selected : undefined}
    title={inDock ? `${shortcut.label} · Drag to reorder or back to suggestions to remove` : alreadyPinned ? `${shortcut.label} is already in the composer dock` : `Drag ${shortcut.label} into the composer dock`}
    className={`relative grid shrink-0 touch-none ${alreadyPinned ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"} place-items-center rounded-[4px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-white ${inDock ? "size-10" : "size-6"} ${selected ? "text-white" : "text-white/55 hover:text-white"}`}
    {...handlers}
    onClick={(event) => { event.stopPropagation(); if (!dock.clickSuppressed()) onActivate?.(); }}
    onKeyDown={(event) => {
      if (!inDock && event.altKey && event.key === "Enter") { event.preventDefault(); dock.pin(id, dock.order.length); }
      if (!inDock) return;
      if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); dock.remove(id); }
      if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) { event.preventDefault(); dock.move(id, dock.order.indexOf(id) + (event.key === "ArrowLeft" ? -1 : 1)); }
    }}>
    <ShortcutIcon id={id} className={`${inDock ? "size-[1.875rem]" : "size-4"} ${selected && id === "planning" ? "brightness-0 invert" : ""}`} />
    {inDock && id === "planning" && <AttentionCountBadge count={mapPlanNotifications.length} />}
  </button>;
}

function CurrentActivityShortcut({ children }: { children: ReactNode }) {
  const { dock, handlers } = useShortcutDrag(activityId, true);
  const elementRef = useRef<HTMLDivElement>(null);
  const handlePointer = useEffectEvent((event: globalThis.PointerEvent, handler: keyof typeof handlers) => {
    const element = elementRef.current;
    if (!element) return;
    handlers[handler]({ currentTarget: element, pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, isPrimary: event.isPrimary, button: event.button, stopPropagation: () => event.stopPropagation() });
  });
  const handleClick = useEffectEvent((event: MouseEvent) => { if (dock.clickSuppressed()) { event.preventDefault(); event.stopPropagation(); } });
  const handleKey = useEffectEvent((event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); dock.remove(activityId); }
      if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) { event.preventDefault(); dock.move(activityId, dock.order.indexOf(activityId) + (event.key === "ArrowLeft" ? -1 : 1)); }
  });
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    // The activity content is a portal: native capture follows DOM ancestry,
    // whereas React events follow its owner in the activity workspace.
    const down = (event: globalThis.PointerEvent) => handlePointer(event, "onPointerDown");
    const move = (event: globalThis.PointerEvent) => handlePointer(event, "onPointerMove");
    const up = (event: globalThis.PointerEvent) => handlePointer(event, "onPointerUp");
    const cancel = (event: globalThis.PointerEvent) => handlePointer(event, "onPointerCancel");
    const click = (event: MouseEvent) => handleClick(event);
    const key = (event: KeyboardEvent) => handleKey(event);
    element.addEventListener("pointerdown", down, true);
    element.addEventListener("pointermove", move, true);
    element.addEventListener("pointerup", up, true);
    element.addEventListener("pointercancel", cancel, true);
    element.addEventListener("click", click, true);
    element.addEventListener("keydown", key, true);
    return () => {
      element.removeEventListener("pointerdown", down, true);
      element.removeEventListener("pointermove", move, true);
      element.removeEventListener("pointerup", up, true);
      element.removeEventListener("pointercancel", cancel, true);
      element.removeEventListener("click", click, true);
      element.removeEventListener("keydown", key, true);
    };
  }, []);
  return <div ref={elementRef} className="touch-none cursor-grab active:cursor-grabbing" title="Current activity · Drag to reorder or back to suggestions to remove">{children}</div>;
}

export function ComposerShortcutDock({ activitySlot, onNavigate, onSelectView, onSelectSplit, view, splitMode }: {
  activitySlot: ReactNode; onNavigate: (destination: SuggestedActionDestination) => void;
  onSelectView: (view: ActionsView) => void; onSelectSplit: (mode: SplitMode) => void; view: ActionsView; splitMode: SplitMode;
}) {
  const { order, drag } = useDock();
  const { activityOpen, activityMapOpen } = useActivityWorkspace();
  const dropOrder = order.filter((id) => id !== drag?.id);
  const marker = <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-0.5 bg-white" />;
  return <div data-shortcut-dock data-page-swipe-ignore aria-label="Composer shortcuts" className="relative flex min-h-10 w-full min-w-0 items-center gap-0 overflow-x-auto">
    {order.map((id) => <div key={id} data-dock-item={id} className={`relative ${id === activityId ? "min-w-28 max-w-full flex-[0_1_auto]" : "shrink-0"} ${drag?.id === id ? "opacity-40" : ""}`}>
      {id !== drag?.id && drag?.index === dropOrder.indexOf(id) && marker}
      {id === activityId ? <CurrentActivityShortcut>{activitySlot}</CurrentActivityShortcut> : (() => {
        const shortcut = shortcuts.find((item) => item.id === id)!;
        return <DraggableShortcut id={id} inDock selected={id === "planning" ? activityOpen && activityMapOpen : "view" in shortcut ? view === shortcut.view : "mode" in shortcut ? splitMode === shortcut.mode : view === shortcut.destination} onActivate={() => { if ("destination" in shortcut) onNavigate(shortcut.destination); else if ("view" in shortcut) onSelectView(shortcut.view); else onSelectSplit(shortcut.mode); }} />;
      })()}
    </div>)}
    {drag?.index === dropOrder.length && <span className="relative h-10 w-0">{marker}</span>}
    <span className="sr-only">Drag shortcuts here. Drag back to Suggested actions to remove. Keyboard: Alt Enter pins a suggestion; Delete removes; Alt and arrow keys reorder.</span>
  </div>;
}

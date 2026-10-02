"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowLeft, FiChevronRight } from "react-icons/fi";
import { DraggableShortcut } from "../composer-shortcuts";
import { suggestedActionCategories as categories, type SuggestedActionDestination } from "../suggested-action-options";
import type { ActionsView } from "../actions-view-context";
import { speedrunViews } from "../speedrun-view-options";
import { splitScreenActions } from "../split-screen-actions";
import type { SplitMode } from "../split-view-context";

type Category = (typeof categories)[number]["id"];
export type { SuggestedActionDestination } from "../suggested-action-options";
const categoryGroups = [
  { label: null, categories: categories.filter(({ id }) => id !== "layout" && id !== "views").sort((a, b) => a.label.localeCompare(b.label)) },
  { label: "Viewport", categories: categories.filter(({ id }) => id === "layout" || id === "views") },
];

export function SuggestedActions({ view, splitMode, onSelectView, onSelectSplit, onNavigate }: {
  view: ActionsView;
  splitMode: SplitMode;
  onSelectView: (view: (typeof speedrunViews)[number]["view"]) => void;
  onSelectSplit: (mode: SplitMode) => void;
  onNavigate: (destination: SuggestedActionDestination) => void;
}) {
  const [category, setCategory] = useState<"layout" | "views" | null>(null);
  const openCategory = (id: Category) => {
    if (id === "layout" || id === "views") setCategory(id);
    else onNavigate(id);
  };
  const reducedMotion = useReducedMotion();
  const gesture = useRef<{ id: number; x: number; y: number; category: Category | null } | null>(null);
  const suppressClickUntil = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const lastCategory = useRef<Category | null>(null);
  const focusIncomingScreen = () => {
      if (category) {
        lastCategory.current = category;
        sectionRef.current?.querySelector<HTMLButtonElement>("[aria-label='Back to action categories']")?.focus({ preventScroll: true });
      } else if (lastCategory.current) {
        sectionRef.current?.querySelector<HTMLButtonElement>(`[data-action-category='${lastCategory.current}']`)?.focus({ preventScroll: true });
      }
  };
  const selectedCategory = categories.find((item) => item.id === category);
  const rowClass = "flex min-h-11 w-full cursor-pointer items-center gap-3 px-4 text-left text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-none";
  return <section ref={sectionRef} aria-labelledby="suggested-actions-heading" data-suggested-action-area data-page-swipe-ignore className="touch-pan-y overflow-hidden border-b border-white/15"
    onClickCapture={(event) => { if (Date.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}
    onPointerDown={(event) => {
      if (!event.isPrimary || event.button !== 0) return;
      const target = (event.target as Element).closest<HTMLElement>("[data-action-category]");
      gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, category: target?.dataset.actionCategory as Category ?? null };
    }}
    onPointerMove={(event) => {
      const start = gesture.current;
      if (!start || start.id !== event.pointerId) return;
      const x = Math.abs(event.clientX - start.x);
      const y = Math.abs(event.clientY - start.y);
      if (x > 10 && x > y * 1.25 && !event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerCancel={() => { gesture.current = null; }}
    onPointerUp={(event) => {
      const start = gesture.current;
      gesture.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      if (!start || start.id !== event.pointerId) return;
      const x = event.clientX - start.x;
      const y = event.clientY - start.y;
      if (Math.abs(x) < 48 || Math.abs(x) <= Math.abs(y) * 1.25) return;
      suppressClickUntil.current = Date.now() + 400;
      if (x < 0 && !category && start.category) openCategory(start.category);
      else if (x > 0 && category) setCategory(null);
    }}>
    <h2 className="px-4 pb-1 pr-52 pt-3 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/45" id="suggested-actions-heading">{category === "layout" || category === "views" ? "Viewport" : "Open view"}</h2>
    <AnimatePresence initial={false} mode="wait" custom={category ? -1 : 1}>
      <motion.div key={category ?? "categories"} custom={category ? -1 : 1} variants={{ enter: (direction: number) => ({ x: reducedMotion ? 0 : -direction * 40, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (direction: number) => ({ x: reducedMotion ? 0 : direction * 40, opacity: 0 }) }} initial="enter" animate="center" exit="exit" onAnimationComplete={(definition) => { if (definition === "center") focusIncomingScreen(); }} transition={{ duration: reducedMotion ? 0 : 0.18 }}>
        {selectedCategory ? <>
          <button type="button" aria-label="Back to action categories" onClick={() => setCategory(null)} className={rowClass}><FiArrowLeft aria-hidden="true" className="size-4" /><span>{selectedCategory.label}</span></button>
          <ul aria-label={`${selectedCategory.label} actions`} className="pb-2">
            {(category === "views" ? [...speedrunViews].sort((a, b) => a.actionLabel.localeCompare(b.actionLabel)).map((action) => <li key={action.view}>
              <div className="flex items-center pl-4 hover:bg-white/10"><DraggableShortcut id={action.view} onActivate={() => onSelectView(action.view)} /><button type="button" aria-current={view === action.view ? "true" : undefined} onClick={() => onSelectView(action.view)} className={rowClass}>{action.actionLabel}</button></div>
            </li>) : [...splitScreenActions].sort((a, b) => a.actionLabel.localeCompare(b.actionLabel)).map((action) => <li key={action.mode}>
              <div className="flex items-center pl-4 hover:bg-white/10"><DraggableShortcut id={`split-${action.mode}`} onActivate={() => onSelectSplit(action.mode)} /><button type="button" aria-current={splitMode === action.mode ? "true" : undefined} onClick={() => onSelectSplit(action.mode)} className={rowClass}>{action.actionLabel}</button></div>
            </li>))}
          </ul>
        </> : <div className="pb-2">{categoryGroups.map((group) => <div key={group.label ?? "actions"}>
          {group.label && <h3 id="viewport-actions-heading" className="px-4 pb-1 pt-3 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/45">{group.label}</h3>}
          <ul aria-label={group.label ? undefined : "Action categories"} aria-labelledby={group.label ? "viewport-actions-heading" : undefined}>{group.categories.map(({ id, label, Icon }) => <li key={id} data-action-category={id} className="flex items-center pl-4 hover:bg-white/10">
            {id !== "layout" && id !== "views" && <DraggableShortcut id={id} onActivate={() => openCategory(id)} />}
            <button type="button" aria-label={id === "layout" || id === "views" ? `Open ${label} actions` : `Open ${label} view`} onClick={() => openCategory(id)} className={rowClass}>{(id === "layout" || id === "views") && <Icon aria-hidden="true" className="size-4" />}<span className="flex-1">{label}</span>{(id === "layout" || id === "views") && <FiChevronRight aria-hidden="true" className="size-4" />}</button>
          </li>)}</ul>
        </div>)}</div>}
      </motion.div>
    </AnimatePresence>
  </section>;
}

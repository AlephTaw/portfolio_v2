"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PlanVisualizer } from "./plan-visualizer";
import { storyboardSteps } from "./storyboard-data";
import { StoryboardPanel } from "./storyboard-panel";
import { StateFigureNavigation } from "../../state/components/state-figure-navigation";
import type { StateAppView } from "../../state/components/state-view-toolbar";
import { useDiagramSpace } from "./use-diagram-space";
import { PinScrollArea } from "../pin-scroll-area";

const characterSpecs: Partial<Record<StateAppView, { title: string; location: string; summary: string }>> = {
  storyboard: { title: "Character", location: "Head / stat bar", summary: "Your character profile and current capabilities. The head represents the character; the bar summarizes its state. The Surrogate diagram describes its operating model, and Stats provides the attributes, status, and points readout." },
  os: { title: "Systems", location: "Arm", summary: "Reusable routines organized by life category. Systems define how you repeatedly act toward a goal, rather than a single task instance." },
  arc: { title: "Arc", location: "Book", summary: "The story of your progress within a campaign: worldline panels, the storyboard, and activity logs." },
  inventory: { title: "Inventory", location: "Backpack", summary: "The items and resources you carry, together with the store where additional resources are listed." },
  admin: { title: "Admin", location: "Ground / foundation", summary: "Account and profile administration, app version information, integrations, and logout." },
};

export function StoryboardContent() {
  const [activeStep, setActiveStep] = useState(storyboardSteps[0].id);
  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-0">
      <PlanVisualizer activeStep={activeStep} onSelectStep={setActiveStep} steps={storyboardSteps} />
      <StoryboardPanel activeStep={activeStep} onSelectFrame={setActiveStep} steps={storyboardSteps} />
    </div>
  );
}

export function StoryboardBuilder({ layoutRevision = false }: { layoutRevision?: boolean }) {
  const [selectedDiagram, setSelectedDiagram] = useState<"surrogate" | "character" | null>(null);
  const [specView, setSpecView] = useState<StateAppView | null>(null);
  const spec = specView ? characterSpecs[specView] : null;
  const inspectLabel = (view: StateAppView) => { setSelectedDiagram(null); setSpecView(view); };
  useEffect(() => {
    if (!specView) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setSpecView(null); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [specView]);
  const reducedMotion = useReducedMotion();
  const { ref: contentRef, width, height } = useDiagramSpace(layoutRevision);
  const ratio = 1426 / 926;
  const gap = 8;
  const focusFootprint = 1 + 0.25 * 0.65;
  const horizontal = width >= 600 || (width >= 480 && width > height * 1.2);
  const panelWidth = selectedDiagram ? Math.min(width / focusFootprint, height * ratio / focusFootprint, 768) : horizontal ? Math.min((width - gap) / 2, height * ratio, 384) : Math.min(width, Math.max(0, height - gap) * ratio / 2, 384);
  const panelHeight = panelWidth / ratio;
  const thumbnailWidth = Math.min(panelWidth * 0.25, 160);
  const thumbnailHeight = thumbnailWidth / ratio;
  const groupWidth = selectedDiagram ? panelWidth + thumbnailWidth * 0.65 : !horizontal ? panelWidth : panelWidth * 2 + gap;
  const groupHeight = selectedDiagram ? panelHeight + thumbnailHeight * 0.65 : horizontal ? panelHeight : panelHeight * 2 + gap;

  return (
    <div className="w-full" id="character-view-content">
      <div>
          <div ref={contentRef} aria-label="Character summary diagrams" className="flex w-full min-w-0 items-center justify-center" style={{ height: height || 300, visibility: width ? "visible" : "hidden" }} id="storyboard-os-view">
            <section aria-label="Surrogate and character diagrams" className="relative shrink-0" style={{ width: groupWidth, height: groupHeight }}>
              {(["surrogate", "character"] as const).map(diagram => {
                const minimized = selectedDiagram !== null && selectedDiagram !== diagram;
                return <motion.div
                  key={diagram}
                  layout
                  role={diagram === "surrogate" && spec ? undefined : "button"}
                  tabIndex={diagram === "surrogate" && spec ? undefined : 0}
                  aria-label={`${minimized ? "Select" : selectedDiagram === diagram ? "Restore both diagrams from" : "Select"} ${diagram} diagram`}
                  aria-pressed={selectedDiagram === diagram}
                  onClick={() => { if (spec) { if (diagram === "character") setSpecView(null); return; } setSelectedDiagram(current => current === diagram ? null : diagram); }}
                  onKeyDown={event => { if (event.target !== event.currentTarget || spec) return; if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedDiagram(current => current === diagram ? null : diagram); } }}
                  transition={{ layout: { duration: reducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] } }}
                  style={{ width: minimized ? thumbnailWidth : panelWidth, height: minimized ? thumbnailHeight : panelHeight, left: minimized ? groupWidth - thumbnailWidth : !selectedDiagram && horizontal && diagram === "character" ? panelWidth + gap : 0, top: minimized ? 0 : selectedDiagram ? thumbnailHeight * 0.65 : !horizontal && diagram === "surrogate" ? panelHeight + gap : 0 }}
                  className={`absolute cursor-pointer rounded-lg bg-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white ${selectedDiagram ? minimized ? "z-10" : "z-20" : ""}`}
                >
                {diagram === "surrogate" ? spec ? <PinScrollArea wrapperClassName="h-full rounded-lg border border-white/20" className="p-4 font-mono text-sm"><section aria-label="Character specification readout" className="flex min-h-full flex-col gap-4">
                  <header className="flex items-center justify-between gap-3"><span className="text-xs uppercase tracking-widest text-white/45">Character spec</span><button type="button" className="cursor-pointer rounded-full border border-white/30 px-3 py-1 text-xs text-white/75 hover:text-white" onClick={event => { event.stopPropagation(); setSpecView(null); }}>Back to Surrogate</button></header>
                  <div aria-live="polite"><p className="text-xs uppercase tracking-wider text-white/40">{spec.location}</p><h2 className="mt-2 text-lg text-white">{spec.title}</h2><p className="mt-3 text-sm leading-6 text-white/65">{spec.summary}</p></div>
                  <p className="mt-auto text-xs text-white/35">Select another label to inspect · Esc to exit</p>
                </section></PinScrollArea> : <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="MVSOS v0.1.0" className="absolute inset-0 block h-full w-full object-contain" src="/mvsos.svg" />
                </> : <>
                  <motion.div aria-hidden={minimized} inert={minimized} className="absolute inset-0" initial={false} animate={{ opacity: minimized ? 0 : 1 }} transition={{ duration: reducedMotion ? 0 : 0.25 }}>
                    <StateFigureNavigation activeView="storyboard" navigationHome inlineDiagram fullDiagram onInspectLabel={inspectLabel} onReturn={() => {}} onSelect={() => {}} />
                  </motion.div>
                  <motion.img alt="Character thumbnail without labels or leader lines" aria-hidden={!minimized} className="pointer-events-none absolute inset-0 h-full w-full object-contain invert" src="/character-thumbnail.png" initial={false} animate={{ opacity: minimized ? 1 : 0 }} transition={{ duration: reducedMotion ? 0 : 0.25 }} />
                </>
                }
                </motion.div>;
              })}
            </section>
          </div>
      </div>
    </div>
  );
}

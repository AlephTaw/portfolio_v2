"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { StateAppView } from "./state-view-toolbar";
import { adminCharacterDiagramDestinations } from "./admin-character-diagram-layout";

type FigureDestination = {
  view: StateAppView;
  label: string;
  position: string;
};

const destinations: FigureDestination[] = [
  { view: "storyboard", label: "Character", position: "left-[67%] top-[10%]" },
  { view: "os", label: "Systems", position: "left-[72%] top-[37%]" },
  { view: "arc", label: "Arc", position: "left-[21%] top-[61%]" },
  { view: "inventory", label: "Inventory", position: "left-[14%] top-[49%]" },
  { view: "admin", label: "Admin", position: "left-[69%] top-[77%]" },
];
const dockedDestinations = destinations.filter(({ view }) => view !== "stats");
const dockedLeaderBends: Partial<Record<StateAppView, number>> = {
  storyboard: 15,
  os: 12,
  inventory: -12,
  admin: -15,
};

type FigurePhase = "home" | "docking" | "docked" | "undocking";
type FigureFrame = { x: number; y: number; width: number; height: number };
type FigureFlight = { from: FigureFrame; to: FigureFrame };
const watchFaceMask = "radial-gradient(ellipse 2.45% 0.95% at 74.1% 37.05%, transparent 90%, black 100%)";
const dockedWidth = "4.5rem";
// Preserve the existing mobile inset while following the composer's centered
// column on wider screens. The character, menu, and animation anchor share it.
const railRight = "max(calc(var(--rail-edge-inset, 0px) + 0.5rem), env(safe-area-inset-right))";
const railBottom = "calc(var(--composer-height) + 0.75rem)";
const characterBottom = `calc(${railBottom} + 5.8125rem)`;
const dockedMenuHeight = dockedDestinations.length * 2.625 + (dockedDestinations.length - 1) * 0.375 + 1.5;

export function StateFigureNavigation({ activeView, navigationHome, onSelect, inlineDiagram = false, fullDiagram = false, onInspectLabel }: { activeView: StateAppView; navigationHome: boolean; onReturn: () => void; onSelect: (view: StateAppView) => void; inlineDiagram?: boolean; fullDiagram?: boolean; onInspectLabel?: (view: StateAppView) => void }) {
  const compactDiagram = inlineDiagram && !fullDiagram;
  const [phase, setPhase] = useState<FigurePhase>(navigationHome ? "home" : "docked");
  const [menuOpen, setMenuOpen] = useState(false);
  const [flight, setFlight] = useState<FigureFlight | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const dockAnchorRef = useRef<HTMLDivElement | null>(null);
  const pendingView = useRef<StateAppView | null>(null);
  const closeMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();
  const labelsVisible = inlineDiagram || phase === "home";
  const duration = reducedMotion ? 0 : 0.28;
  const travelDuration = reducedMotion ? 0 : 0.55;

  const homeFrame = (): FigureFrame | null => {
    const nav = navRef.current?.getBoundingClientRect();
    if (!nav) return null;
    const width = Math.min(204, window.innerWidth * 0.315);
    const height = width * 1.5;
    const navHeight = nav.height || Math.min(416, window.innerHeight * 0.58);
    return { x: nav.left + (nav.width - width) / 2, y: nav.top + (navHeight - height) / 2, width, height };
  };

  const dockFrame = (): FigureFrame | null => {
    const rect = dockAnchorRef.current?.getBoundingClientRect();
    return rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null;
  };

  const select = (view: StateAppView) => {
    if (inlineDiagram) return;
    if (phase !== "home") return;
    const from = homeFrame();
    const to = dockFrame();
    if (!from || !to) return;
    pendingView.current = view;
    setFlight({ from, to });
    setPhase("docking");
  };

  const openMenu = () => {
    if (phase !== "docked") return;
    if (closeMenuTimer.current) clearTimeout(closeMenuTimer.current);
    closeMenuTimer.current = null;
    setMenuOpen(true);
  };
  const scheduleMenuClose = () => {
    if (closeMenuTimer.current) clearTimeout(closeMenuTimer.current);
    closeMenuTimer.current = setTimeout(() => setMenuOpen(false), 150);
  };

  useEffect(() => () => {
    if (closeMenuTimer.current) clearTimeout(closeMenuTimer.current);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (phase !== "docked") return;
    const updateDockPosition = () => {
      const to = dockFrame();
      if (to) setFlight((current) => current ? { ...current, to } : current);
    };
    window.addEventListener("resize", updateDockPosition);
    return () => window.removeEventListener("resize", updateDockPosition);
  }, [phase]);

  useEffect(() => {
    if (phase !== "docking" && phase !== "undocking") return;
    const timeout = setTimeout(() => {
      if (phase === "docking") {
        setPhase("docked");
        const view = pendingView.current;
        pendingView.current = null;
        if (view) onSelect(view);
      } else {
        setPhase("home");
        setFlight(null);
      }
    }, travelDuration * 1000);
    return () => clearTimeout(timeout);
  }, [phase, travelDuration, onSelect]);

  return (
    <motion.nav
      aria-label="Character views"
      className={`relative mx-auto flex w-full items-center justify-center ${fullDiagram ? "overflow-hidden" : ""} ${compactDiagram ? "mb-10" : ""}`}
      ref={navRef}
      style={{ height: fullDiagram ? "auto" : inlineDiagram ? "6rem" : phase === "docked" ? 0 : "min(26rem, 58dvh)" }}
    >
      <div aria-hidden="true" className="pointer-events-none fixed opacity-0" ref={dockAnchorRef} style={{ bottom: characterBottom, height: dockedWidth, right: railRight, width: dockedWidth }} />
      <motion.div
        animate={{ opacity: labelsVisible ? 1 : 0 }}
        aria-hidden={!labelsVisible}
        className={fullDiagram ? "relative aspect-[1698/926] w-[119.05%] shrink-0" : `absolute left-1/2 top-1/2 aspect-[1698/926] max-w-3xl -translate-x-1/2 -translate-y-1/2 ${inlineDiagram ? "h-full w-auto" : "w-full"}`}
        inert={!labelsVisible}
        style={{ pointerEvents: labelsVisible && (!inlineDiagram || onInspectLabel) ? "auto" : "none" }}
        transition={{ duration }}
      >
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-contain invert"
        height={926}
        priority
        src="/stats-figure.png"
        width={1698}
      />
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-white/45" preserveAspectRatio="none" viewBox="0 0 100 100">
        <g fill="none" stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke">
          <path d="M67 15 H62 M62 15 L59 6 M62 15 H58 L54 20" />
          <path d="M71 42 H62 L58 40" />
          <path d={compactDiagram ? "M30 78 H43 L52 57" : "M30 66 H45 L52 57"} />
          {!compactDiagram && <path d="M29 53 H35 L43 43" />}
          <path d="M68 81 H59 L54 85" />
        </g>
        <g fill="currentColor">
          <circle cx="59" cy="6" r="0.45" />
          <circle cx="54" cy="20" r="0.45" />
          <circle cx="58" cy="40" r="0.45" />
          <circle cx="52" cy="57" r="0.45" />
          {!compactDiagram && <circle cx="43" cy="43" r="0.45" />}
          <circle cx="54" cy="85" r="0.45" />
        </g>
      </svg>
      {(compactDiagram ? adminCharacterDiagramDestinations : destinations).map(({ view, label, position }) => inlineDiagram && !onInspectLabel ? (
        <span
          className={`absolute z-10 min-h-7 rounded-full bg-black/90 px-2 py-1 ${view === "inventory" || view === "arc" ? "text-right" : "text-left"} font-sans text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-white/65 sm:text-[0.65rem] ${position}`}
          key={view}
        >
          {label}
        </span>
      ) : (
        <button
          className={`absolute z-10 min-h-7 cursor-pointer rounded-full bg-black/90 px-2 py-1 ${inlineDiagram && (view === "inventory" || view === "arc") ? "text-right" : "text-left"} font-sans text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-white/65 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-[0.65rem] ${position}`}
          key={view}
          onMouseEnter={() => onInspectLabel?.(view)}
          onFocus={() => onInspectLabel?.(view)}
          onClick={(event) => { event.stopPropagation(); if (onInspectLabel) onInspectLabel(view); else select(view); }}
          type="button"
        >
          {label}
        </button>
      ))}
      {compactDiagram && (
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-white/45" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M30 49 H38 L43 43" fill="none" stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
          <circle cx="43" cy="43" r="0.45" fill="currentColor" />
        </svg>
      )}
      </motion.div>
      <AnimatePresence>
        {phase === "docked" && menuOpen && (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            aria-label="Character views"
            className="fixed z-20 grid grid-rows-[repeat(5,2.625rem)] gap-1.5 rounded-xl bg-black p-3"
            exit={{ opacity: 0, x: 6 }}
            initial={{ opacity: 0, x: 6 }}
            key="docked-character-menu"
            onFocus={openMenu}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleMenuClose}
            style={{ bottom: railBottom, paddingRight: `calc(${dockedWidth} + 0.75rem)`, right: railRight }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
          >
            {dockedDestinations.map(({ label, view }) => (
              <button
                aria-current={activeView === view ? "page" : undefined}
                className={`flex min-h-[2.625rem] cursor-pointer items-center justify-end gap-3 whitespace-nowrap font-sans text-xs font-medium uppercase tracking-[0.12em] transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${activeView === view ? "text-white" : "text-white/55"}`}
                key={view}
                onClick={() => { setMenuOpen(false); onSelect(view); }}
                type="button"
              >
                <span>{label}</span>
                {dockedLeaderBends[view] !== undefined ? (
                  <svg aria-hidden="true" className="h-px w-12 shrink-0 overflow-visible opacity-50" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 48 1">
                    <path d={`M0 0 H24 L48 ${dockedLeaderBends[view]}`} />
                  </svg>
                ) : (
                  <span aria-hidden="true" className="h-px w-12 bg-current opacity-50" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {!fullDiagram && (flight || phase === "docked") && <motion.button
        animate={flight ? { ...flight.to, opacity: phase === "undocking" ? [1, 1, 0] : 1 } : undefined}
        aria-label="Open character menu"
        aria-expanded={menuOpen}
        className="fixed z-30 cursor-pointer rounded-xl bg-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
        disabled={phase !== "docked"}
        initial={flight ? { ...flight.from, opacity: 0 } : false}
        key={flight ? "traveling-figure" : "initial-docked-figure"}
        onClick={openMenu}
        onFocus={openMenu}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleMenuClose}
        style={flight
          ? { left: 0, pointerEvents: phase === "docked" ? "auto" : "none", top: 0 }
          : { bottom: characterBottom, height: dockedWidth, pointerEvents: "auto", right: railRight, width: dockedWidth }}
        transition={{ duration: phase === "docked" ? 0 : travelDuration, ease: [0.22, 1, 0.36, 1] }}
        type="button"
      >
        <Image alt="" aria-hidden="true" className="invert" fill sizes="(max-width: 640px) 42vw, 272px" src="/chat-reader-figure.png" style={{ maskImage: watchFaceMask, objectFit: "contain", WebkitMaskImage: watchFaceMask }} />
      </motion.button>}
    </motion.nav>
  );
}

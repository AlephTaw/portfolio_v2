"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { FiBarChart2, FiBox, FiCpu, FiFilm, FiLayers, FiSettings } from "react-icons/fi";
import { PiPersonSimple, PiSpeedometer } from "../../components/local-icons";
import { useRightRailVisibility } from "../../components/right-rail-visibility-context";

export type StatsAppView =
  | "storyboard"
  | "stats"
  | "os"
  | "hud"
  | "inventory"
  | "arc"
  | "admin"
  | "guild"
  | "connections";

export const statsAppLabelTypography = "text-[0.55rem] font-semibold uppercase tracking-[0.12em]";

export const statsApps = [
  { id: "arc" as const, label: "ARC", Icon: FiFilm },
  { id: "storyboard" as const, label: "Character", Icon: FiCpu },
  { id: "stats" as const, label: "Stats", Icon: FiBarChart2 },
  { id: "os" as const, label: "Systems", Icon: FiLayers },
  { id: "hud" as const, label: "Telemetry", Icon: PiSpeedometer },
  { id: "inventory" as const, label: "Inventory", Icon: FiBox },
  { id: "admin" as const, label: "Admin", Icon: FiSettings },
];

const verticalRailMediaQuery = "(max-width: 30rem)";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatch = () => setMatches(mediaQuery.matches);

    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);
    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
}

function useDocumentScrollLock(locked: boolean) {
  useEffect(() => {
    // Clear the inline values left by the previous document-level lock. The
    // current lock is event-based so pane and page scrolling recover cleanly
    // as soon as the rail closes.
    if (!locked) {
      if (document.body.style.overflow === "hidden") document.body.style.removeProperty("overflow");
      if (document.documentElement.style.overflow === "hidden") document.documentElement.style.removeProperty("overflow");
      return;
    }

    const preventScroll = (event: Event) => event.preventDefault();
    document.addEventListener("wheel", preventScroll, { capture: true, passive: false });
    document.addEventListener("touchmove", preventScroll, { capture: true, passive: false });

    return () => {
      document.removeEventListener("wheel", preventScroll, true);
      document.removeEventListener("touchmove", preventScroll, true);
    };
  }, [locked]);
}

type StatsViewToolbarProps = {
  activeView: StatsAppView;
  displayedView: StatsAppView;
  forceRail?: boolean;
  hideOnNarrowRail?: boolean;
  onPreview: (view: StatsAppView | null) => void;
  onSelect: (view: StatsAppView) => void;
};

export function StatsViewToolbar(props: StatsViewToolbarProps) {
  const isNarrowRail = useMediaQuery(verticalRailMediaQuery) || Boolean(props.forceRail);
  const { hidden } = useRightRailVisibility();
  return (
    <AnimatePresence initial={false}>
      {(!props.hideOnNarrowRail || !isNarrowRail) && (!isNarrowRail || !hidden || props.forceRail) && <StatsViewToolbarContent {...props} isNarrowRail={isNarrowRail} key="stats-toolbar" />}
    </AnimatePresence>
  );
}

function StatsViewToolbarContent({
  activeView,
  displayedView,
  onPreview,
  onSelect,
  isNarrowRail,
  forceRail = false,
}: StatsViewToolbarProps & { isNarrowRail: boolean }) {
  const isPresent = useIsPresent();
  const [isOpen, setIsOpen] = useState(false);
  const highlightedView = isNarrowRail ? displayedView : activeView;
  const toolbarRef = useRef<HTMLElement | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const highlightRef = useRef<HTMLSpanElement | null>(null);
  const previousHighlightedView = useRef<StatsAppView | null>(null);
  const ignoreNextClickView = useRef<StatsAppView | null>(null);
  const draggedView = useRef<StatsAppView | null>(null);
  const dragStartedOpen = useRef(false);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);
  const hoverOpenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectView = onSelect;
  const previewView = onPreview;

  const pointerMoved = (event: { clientX: number; clientY: number }) => {
    const origin = pointerOrigin.current;
    if (!origin) return true;
    if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) < 8) return false;
    pointerOrigin.current = null;
    return true;
  };

  const clearHoverOpenTimer = () => {
    if (hoverOpenTimer.current === null) return;
    clearTimeout(hoverOpenTimer.current);
    hoverOpenTimer.current = null;
  };

  const closeRail = () => {
    clearHoverOpenTimer();
    pointerOrigin.current = null;
    setIsOpen(false);
    previewView(null);
  };

  useDocumentScrollLock(isNarrowRail && isOpen && isPresent);

  useLayoutEffect(() => {
    const highlight = highlightRef.current;
    const highlightedIndex = statsApps.findIndex(({ id }) => id === highlightedView);
    const button = buttonRefs.current[highlightedIndex];
    const shouldAnimate = previousHighlightedView.current !== null
      && previousHighlightedView.current !== highlightedView;
    previousHighlightedView.current = highlightedView;

    if (!highlight || isNarrowRail || !button) {
      if (highlight) highlight.style.opacity = "0";
      return;
    }

    const icon = button.querySelector<HTMLElement>(".stats-icon-warp");
    if (!icon) return;

    const positionHighlight = (animate: boolean) => {
      highlight.dataset.animate = String(animate);
      highlight.style.width = `${icon.offsetWidth}px`;
      highlight.style.height = `${icon.offsetHeight}px`;
      highlight.style.transform = `translate3d(${button.offsetLeft + icon.offsetLeft}px, ${button.offsetTop + icon.offsetTop}px, 0)`;
      highlight.style.opacity = "1";
    };

    positionHighlight(shouldAnimate);
    let receivedInitialMeasurement = false;
    const resizeObserver = new ResizeObserver(() => {
      if (!receivedInitialMeasurement) {
        receivedInitialMeasurement = true;
        return;
      }
      positionHighlight(false);
    });
    if (toolbarRef.current) resizeObserver.observe(toolbarRef.current);
    resizeObserver.observe(button);

    return () => resizeObserver.disconnect();
  }, [highlightedView, isNarrowRail]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRail();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  });

  useEffect(() => () => clearHoverOpenTimer(), []);
  useEffect(() => () => onPreview(null), [onPreview]);

  return (
    <motion.nav
      aria-label="Character apps"
      animate={{ opacity: 1 }}
      className="stats-app-switcher flex flex-wrap items-start justify-center gap-x-3 gap-y-4"
      data-docked={forceRail}
      data-expanded={isOpen}
      data-rail={isNarrowRail}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      ref={toolbarRef}
      style={{ pointerEvents: isPresent ? undefined : "none" }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => {
        if (!isNarrowRail || isOpen) return;
        clearHoverOpenTimer();
        hoverOpenTimer.current = setTimeout(() => {
          setIsOpen(true);
          hoverOpenTimer.current = null;
        }, 180);
      }}
      onMouseLeave={() => {
        if (!isNarrowRail) onPreview(null);
      }}
      onPointerMove={(event) => {
        if (!isNarrowRail || !isOpen || draggedView.current !== null || !pointerOrigin.current) return;
        if (!pointerMoved(event)) return;
        const hoveredView = document.elementFromPoint(event.clientX, event.clientY)
          ?.closest<HTMLButtonElement>("[data-stats-view]")?.dataset.statsView as StatsAppView | undefined;
        previewView(hoveredView && statsApps.some(({ id }) => id === hoveredView) ? hoveredView : null);
      }}
    >
      {isNarrowRail && isOpen && (
        <button
          aria-label="Close character apps"
          className="stats-app-switcher-backdrop touch-none overscroll-none"
          onClick={closeRail}
          onFocus={() => previewView(null)}
          onMouseEnter={() => {
            if (draggedView.current === null) previewView(null);
          }}
          onWheel={(event) => event.preventDefault()}
          tabIndex={-1}
          type="button"
        />
      )}

      <span aria-hidden="true" className="stats-app-switcher-highlight" ref={highlightRef} />

      {statsApps.map(({ id, label, Icon }, index) => {
        const isHighlighted = highlightedView === id;

        return (
          <button
          aria-label={label}
          aria-pressed={activeView === id}
          className={`stats-app-switcher-button group relative z-10 flex min-w-12 cursor-pointer flex-col items-center justify-self-center gap-2 ${statsAppLabelTypography} transition-colors hover:z-20 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white ${isHighlighted ? "text-white" : "text-white/40 hover:text-white/75"}`}
          data-highlighted={isHighlighted}
          data-stats-view={id}
          key={id}
          onClick={(event) => {
            if (ignoreNextClickView.current === id) {
              ignoreNextClickView.current = null;
              return;
            }

            clearHoverOpenTimer();

            if (activeView === id) {
              if (isNarrowRail) {
                if (isOpen) closeRail();
                else setIsOpen(true);
              }
              return;
            }

            selectView(id);
            if (isNarrowRail) closeRail();
            event.currentTarget.blur();
          }}
          onFocus={() => {
            if (isNarrowRail && isOpen) previewView(id);
          }}
          onMouseEnter={() => {
            if (isNarrowRail && isOpen && !pointerOrigin.current) previewView(id);
          }}
          onPointerCancel={() => {
            ignoreNextClickView.current = null;
            draggedView.current = null;
            pointerOrigin.current = null;
            previewView(null);
          }}
          onPointerDown={(event) => {
            if (!isNarrowRail || event.button !== 0) return;

            if (activeView === id) {
              clearHoverOpenTimer();
              dragStartedOpen.current = isOpen;
              draggedView.current = id;
              pointerOrigin.current = { x: event.clientX, y: event.clientY };
              ignoreNextClickView.current = id;
              event.currentTarget.setPointerCapture(event.pointerId);
              setIsOpen(true);
              previewView(null);
              event.preventDefault();
              return;
            }

            if ((event.pointerType === "touch" || event.pointerType === "pen") && isOpen) previewView(id);
          }}
          onPointerMove={(event) => {
            if (!isNarrowRail || draggedView.current === null) return;
            if (!pointerMoved(event)) return;

            const hoveredButton = document
              .elementFromPoint(event.clientX, event.clientY)
              ?.closest<HTMLButtonElement>("[data-stats-view]");
            const hoveredView = hoveredButton?.dataset.statsView as StatsAppView | undefined;

            if (!hoveredView || !statsApps.some(({ id: appId }) => appId === hoveredView)) return;
            if (draggedView.current === hoveredView) return;

            draggedView.current = hoveredView;
            previewView(hoveredView);
          }}
          onPointerUp={(event) => {
            if (draggedView.current !== null) {
              const selectedView = draggedView.current;
              const startedOpen = dragStartedOpen.current;

              draggedView.current = null;
              dragStartedOpen.current = false;
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }

              if (selectedView !== activeView) {
                selectView(selectedView);
                closeRail();
              } else if (startedOpen) {
                closeRail();
              } else {
                setIsOpen(true);
                previewView(null);
              }
              return;
            }

            if ((event.pointerType !== "touch" && event.pointerType !== "pen") || !isOpen) return;

            ignoreNextClickView.current = id;
            if (activeView !== id) selectView(id);
            closeRail();
          }}
          ref={(button) => {
            buttonRefs.current[index] = button;
          }}
          title={label}
          type="button"
        >
          <span className={`stats-icon-warp relative z-0 grid shrink-0 origin-center place-items-center border transition-[color,background-color,border-color] duration-200 ease-out motion-reduce:transition-none ${forceRail ? "size-10 rounded-xl" : "size-9 rounded-full"} ${
            isHighlighted
              ? isNarrowRail
                ? "border-white bg-white text-black"
                : "border-transparent bg-transparent text-black"
              : "border-transparent bg-black text-white/55 group-hover:text-white"
          }`}>
            <Icon aria-hidden="true" className="stats-icon-warp-glyph size-4" />
          </span>
          <span className="stats-app-switcher-label">
            {label}
          </span>
          </button>
        );
      })}
      {forceRail && (
        <button
          aria-expanded={isOpen}
          aria-current="page"
          aria-label="Character views"
          className="pointer-events-auto mt-2 grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-transparent bg-black text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={() => {
            if (isOpen) closeRail();
            else setIsOpen(true);
          }}
          onPointerDown={(event) => {
            pointerOrigin.current = { x: event.clientX, y: event.clientY };
          }}
          title="Character views"
          type="button"
        >
          <PiPersonSimple aria-hidden="true" className="size-5" />
        </button>
      )}
    </motion.nav>
  );
}

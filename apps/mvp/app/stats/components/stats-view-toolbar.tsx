"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { FiBarChart2, FiBox, FiCpu, FiFilm } from "react-icons/fi";
import { useRightRailVisibility } from "../../components/right-rail-visibility-context";

export type StatsAppView =
  | "storyboard"
  | "stats"
  | "os"
  | "hud"
  | "inventory"
  | "arc"
  | "guild"
  | "connections";

export const statsAppLabelTypography = "text-[0.55rem] font-semibold uppercase tracking-[0.12em]";

function VisorIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M4 7.5c2.3-1 5-1.5 8-1.5s5.7.5 8 1.5l-1.2 7.2c-2 .9-4.3 1.3-6.8 1.3s-4.8-.4-6.8-1.3L4 7.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="M6.2 9.3c3.8-1 7.8-1 11.6 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function AisleIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 4h5v16H5M14 4h5v16h-5M10 7H5M19 7h-5M10 12H5M19 12h-5M10 17H5M19 17h-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
      <path d="m10 20 2-4 2 4M10 4l2 4 2-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

const statsApps = [
  { id: "arc" as const, label: "ARC", Icon: FiFilm },
  { id: "storyboard" as const, label: "Storyboard", Icon: AisleIcon },
  { id: "stats" as const, label: "Stats", Icon: FiBarChart2 },
  { id: "os" as const, label: "OS", Icon: FiCpu },
  { id: "hud" as const, label: "HUD", Icon: VisorIcon },
  { id: "inventory" as const, label: "Inventory", Icon: FiBox },
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
  onPreview: (view: StatsAppView | null) => void;
  onSelect: (view: StatsAppView) => void;
};

export function StatsViewToolbar(props: StatsViewToolbarProps) {
  const isNarrowRail = useMediaQuery(verticalRailMediaQuery);
  const { hidden } = useRightRailVisibility();
  return (
    <AnimatePresence initial={false}>
      {(!isNarrowRail || !hidden) && <StatsViewToolbarContent {...props} isNarrowRail={isNarrowRail} key="stats-toolbar" />}
    </AnimatePresence>
  );
}

function StatsViewToolbarContent({
  activeView,
  displayedView,
  onPreview,
  onSelect,
  isNarrowRail,
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
  const hoverOpenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverOpenTimer = () => {
    if (hoverOpenTimer.current === null) return;
    clearTimeout(hoverOpenTimer.current);
    hoverOpenTimer.current = null;
  };

  const closeRail = () => {
    clearHoverOpenTimer();
    setIsOpen(false);
    onPreview(null);
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
      data-expanded={isOpen}
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
    >
      {isNarrowRail && isOpen && (
        <button
          aria-label="Close character apps"
          className="stats-app-switcher-backdrop touch-none overscroll-none"
          onClick={closeRail}
          onFocus={() => onPreview(null)}
          onMouseEnter={() => {
            if (draggedView.current === null) onPreview(null);
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

            onSelect(id);
            if (isNarrowRail) closeRail();
            event.currentTarget.blur();
          }}
          onFocus={() => {
            if (isNarrowRail && isOpen) onPreview(id);
          }}
          onMouseEnter={() => {
            if (isNarrowRail && isOpen) onPreview(id);
          }}
          onPointerCancel={() => {
            ignoreNextClickView.current = null;
            draggedView.current = null;
            onPreview(null);
          }}
          onPointerDown={(event) => {
            if (!isNarrowRail || event.button !== 0) return;

            if (activeView === id) {
              clearHoverOpenTimer();
              dragStartedOpen.current = isOpen;
              draggedView.current = id;
              ignoreNextClickView.current = id;
              event.currentTarget.setPointerCapture(event.pointerId);
              setIsOpen(true);
              onPreview(id);
              event.preventDefault();
              return;
            }

            if ((event.pointerType === "touch" || event.pointerType === "pen") && isOpen) onPreview(id);
          }}
          onPointerMove={(event) => {
            if (!isNarrowRail || draggedView.current === null) return;

            const hoveredButton = document
              .elementFromPoint(event.clientX, event.clientY)
              ?.closest<HTMLButtonElement>("[data-stats-view]");
            const hoveredView = hoveredButton?.dataset.statsView as StatsAppView | undefined;

            if (!hoveredView || !statsApps.some(({ id: appId }) => appId === hoveredView)) return;
            if (draggedView.current === hoveredView) return;

            draggedView.current = hoveredView;
            onPreview(hoveredView);
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
                onSelect(selectedView);
                closeRail();
              } else if (startedOpen) {
                closeRail();
              } else {
                setIsOpen(true);
                onPreview(null);
              }
              return;
            }

            if ((event.pointerType !== "touch" && event.pointerType !== "pen") || !isOpen) return;

            ignoreNextClickView.current = id;
            if (activeView !== id) onSelect(id);
            closeRail();
          }}
          ref={(button) => {
            buttonRefs.current[index] = button;
          }}
          title={label}
          type="button"
        >
          <span className={`stats-icon-warp relative z-0 grid size-9 origin-center place-items-center rounded-full border transition-[color,background-color,border-color] duration-200 ease-out motion-reduce:transition-none ${
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
    </motion.nav>
  );
}

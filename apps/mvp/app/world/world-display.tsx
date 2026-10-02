"use client";

import { LayoutGroup, motion } from "framer-motion";
import { FiArrowLeft, FiBarChart2, FiCornerDownRight } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import cognitiveNetworkMap from "../../../agent/public/cognitive-network-map.png";
import { AttentionCountBadge, worldTreeNotifications } from "../components/attention-notifications";
import { ActionsWorkspace } from "../components/activity-workspace";
import { StoreContent } from "../components/bounty-board";
import { PinScrollArea } from "../components/pin-scroll-area";
import { openWorkshopEvent, WORLD_VIEW_STATE_KEY } from "../components/page-transition-events";
import { StatsLevelsContent } from "../state/state-display";

const worldLocations = ["Guild", "Inventory", "Store", "Workshop", "Dungeon"] as const;
type WorldLocation = (typeof worldLocations)[number];
export type WorkshopApplication =
  | "health"
  | "wealth"
  | "interactions"
  | "sentience"
  | "skills"
  | "experience";
const layoutTransition = { duration: 0.45, ease: [0.4, 0, 0.2, 1] as const };
type PersistedWorldView = {
  returnLocation: WorldLocation | null;
  selectedLocation: WorldLocation | null;
  workshopApplication: WorkshopApplication | null;
  worldTreeFocused: boolean;
};

function isWorldLocation(value: unknown): value is WorldLocation {
  return typeof value === "string" && worldLocations.includes(value as WorldLocation);
}

function isWorkshopApplication(value: unknown): value is WorkshopApplication {
  return (
    value === "health" ||
    value === "wealth" ||
    value === "interactions" ||
    value === "sentience" ||
    value === "skills" ||
    value === "experience"
  );
}

function readPersistedWorldView(): PersistedWorldView | null {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(WORLD_VIEW_STATE_KEY) ?? "null") as Record<string, unknown> | null;
    if (!value) return null;

    return {
      returnLocation: isWorldLocation(value.returnLocation) ? value.returnLocation : null,
      selectedLocation: isWorldLocation(value.selectedLocation) ? value.selectedLocation : null,
      workshopApplication: isWorkshopApplication(value.workshopApplication)
        ? value.workshopApplication
        : null,
      worldTreeFocused: value.worldTreeFocused === true,
    };
  } catch {
    return null;
  }
}

function WorldGrid({
  compact = false,
  interactive = true,
  onSelect,
  selectedLocation,
  showLabels = true,
}: {
  compact?: boolean;
  interactive?: boolean;
  onSelect?: (location: WorldLocation) => void;
  selectedLocation: WorldLocation | null;
  showLabels?: boolean;
}) {
  return (
    <div
      aria-label="World locations"
      className={`pointer-events-auto grid aspect-square w-full grid-cols-2 overflow-hidden border-l border-t border-white/45 bg-black ${
        compact
          ? "text-[0.38rem] tracking-[0.08em] sm:text-[0.48rem]"
          : "text-xs tracking-[0.18em] sm:text-sm"
      } font-semibold uppercase text-white`}
      role="group"
    >
      {worldLocations.map((location) => {
        const selected = selectedLocation === location;
        const className = `grid ${location === "Dungeon" ? "col-span-2" : ""} place-items-center border-b border-r border-white/45 text-center transition-colors ${
          compact ? "p-1" : "p-4"
        } ${selected ? "bg-white text-black" : "text-white"}`;

        if (!interactive) {
          return (
            <div className={className} key={location}>
              {compact ? <span aria-hidden="true" className={`transition-opacity duration-75 ${showLabels ? "opacity-100" : "opacity-0"}`}>{location}</span> : location}
            </div>
          );
        }

        return (
          <button
            aria-label={`Open ${location}`}
            aria-pressed={selected}
            className={`${className} cursor-pointer focus-visible:z-10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-inset ${
              selected
                ? "hover:bg-white focus-visible:outline-black"
                : "hover:bg-white/10 focus-visible:outline-white"
            }`}
            key={location}
            onClick={() => onSelect?.(location)}
            type="button"
          >
            {compact ? <span aria-hidden="true" className={`transition-opacity duration-75 ${showLabels ? "opacity-100" : "opacity-0"}`}>{location}</span> : location}
          </button>
        );
      })}
    </div>
  );
}

function SquareGrid() {
  return (
    <div aria-label="Vertical feed view" className="grid w-full grid-cols-1 gap-3" role="grid">
      {Array.from({ length: 18 }, (_, index) => (
        <div aria-hidden="true" className="aspect-square min-w-0 border border-white/15 bg-white/[0.04]" key={index} role="gridcell" />
      ))}
    </div>
  );
}

function NetworkImage() {
  return (
    <>
      {/* A plain image avoids relying on a runtime image optimizer. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Colorful cognitive network map"
        className="h-auto w-full rounded-full object-contain"
        src={cognitiveNetworkMap.src}
      />
    </>
  );
}

function WorldTreeHoverPreview({ x, y }: { x: number; y: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[140] w-44 -translate-y-full overflow-hidden border border-white/35 bg-black p-1 shadow-2xl"
      style={{ left: x + 16, top: y - 16 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="block aspect-[5/4] w-full object-cover" src="/world-tree-preview-grid.png" />
    </div>
  );
}

function WorldImage({ interactive, onClick }: { interactive?: boolean; onClick?: () => void }) {
  if (interactive) {
    return (
      <motion.button
        aria-label="Show World"
        className="pointer-events-auto block w-full cursor-pointer rounded-full focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
        layoutId="world-image"
        onClick={onClick}
        transition={layoutTransition}
        type="button"
      >
        <NetworkImage />
      </motion.button>
    );
  }

  return (
    <motion.div layoutId="world-image" transition={layoutTransition}>
      <NetworkImage />
    </motion.div>
  );
}

function WorldTreeHealthPanel() {
  return (
    <section aria-labelledby="world-tree-health-heading" className="w-[min(78vw,38rem)] border border-white/30 bg-black/70 p-6 text-white sm:p-8">
      <div className="flex items-end justify-between gap-6 border-b border-white/20 pb-5">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/40">World Tree</p>
          <h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.18em] sm:text-4xl" id="world-tree-health-heading">
            Health
          </h1>
        </div>
        <p className="font-mono text-3xl tabular-nums text-white sm:text-5xl">100%</p>
      </div>
      <div className="mt-6 h-2 border border-white/45 p-px">
        <div className="h-full w-full bg-white" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/50">
        <div>
          <p>Integrity</p>
          <p className="mt-2 text-white">Stable</p>
        </div>
        <div>
          <p>Canopy</p>
          <p className="mt-2 text-white">Sustained</p>
        </div>
      </div>
    </section>
  );
}

function WorkshopEditor({ application }: { application: WorkshopApplication }) {
  const applicationLabel = `${application.charAt(0).toUpperCase()}${application.slice(1)}`;

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      aria-labelledby="workshop-heading"
      className="w-full min-w-0 max-w-[56rem]"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
    >
      <header className="text-center uppercase">
        <p className="font-mono text-[0.625rem] tracking-[0.24em] text-white/40">Domain</p>
        <h1
          className="mt-2 text-2xl font-semibold tracking-[0.24em] text-white sm:text-4xl"
          id="workshop-heading"
        >
          Workshop
        </h1>
        <p className="mt-3 font-mono text-[0.6rem] tracking-[0.16em] text-white/45">
          {applicationLabel} application · visual program
        </p>
      </header>

      <div
        aria-label={`${applicationLabel} application program graph`}
        className="relative mt-6 aspect-[16/9] w-full min-w-0 overflow-hidden border border-white/25 bg-black bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:18px_18px]"
        role="img"
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 1000 560"
        >
          <defs>
            <marker id="workshop-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
              <path d="M0 0L8 4L0 8Z" fill="rgba(255,255,255,0.72)" />
            </marker>
          </defs>
          <g markerEnd="url(#workshop-arrow)" stroke="rgba(255,255,255,0.58)" strokeWidth="2">
            <path d="M210 125C310 125 300 280 410 280" />
            <path d="M210 430C310 430 300 280 410 280" />
            <path d="M590 280C700 280 690 130 800 130" />
            <path d="M590 280C700 280 690 425 800 425" />
          </g>
        </svg>

        <div className="absolute left-[4%] top-[10%] w-[21%] border border-white/40 bg-black p-3">
          <p className="text-[0.5rem] uppercase tracking-[0.16em] text-white/35">Input</p>
          <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white">Quest context</p>
        </div>
        <div className="absolute bottom-[10%] left-[4%] w-[21%] border border-white/40 bg-black p-3">
          <p className="text-[0.5rem] uppercase tracking-[0.16em] text-white/35">Input</p>
          <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white">Live signals</p>
        </div>
        <div className="absolute left-1/2 top-1/2 w-[25%] -translate-x-1/2 -translate-y-1/2 border border-white bg-white p-4 text-black shadow-[0_0_32px_rgba(255,255,255,0.12)]">
          <p className="text-[0.5rem] uppercase tracking-[0.16em] text-black/45">Program</p>
          <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em]">
            {applicationLabel} logic
          </p>
        </div>
        <div className="absolute right-[4%] top-[11%] w-[21%] border border-white/40 bg-black p-3">
          <p className="text-[0.5rem] uppercase tracking-[0.16em] text-white/35">Output</p>
          <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white">HUD application</p>
        </div>
        <div className="absolute bottom-[10%] right-[4%] w-[21%] border border-white/40 bg-black p-3">
          <p className="text-[0.5rem] uppercase tracking-[0.16em] text-white/35">Output</p>
          <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white">Metrics + events</p>
        </div>
      </div>
    </motion.section>
  );
}

export function WorldDisplay({
  embedded = false,
  explicitDestination = false,
  initialLocation = null,
  initialWorldTreeFocused = false,
  initialDomainGrid = false,
  workshopApplication = null,
}: {
  embedded?: boolean;
  explicitDestination?: boolean;
  initialLocation?: WorldLocation | null;
  initialWorldTreeFocused?: boolean;
  initialDomainGrid?: boolean;
  workshopApplication?: WorkshopApplication | null;
}) {
  const [worldTreeFocused, setWorldTreeFocused] = useState(initialWorldTreeFocused);
  const [worldTreeStatsOpen, setWorldTreeStatsOpen] = useState(false);
  const [domainGridFocused] = useState(initialDomainGrid);
  const [worldTreeHover, setWorldTreeHover] = useState<{ x: number; y: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<WorldLocation | null>(initialLocation);
  const [returnLocation, setReturnLocation] = useState<WorldLocation | null>(initialLocation);
  const [activeWorkshopApplication, setActiveWorkshopApplication] =
    useState<WorkshopApplication | null>(workshopApplication);
  const [worldViewReady, setWorldViewReady] = useState(explicitDestination);
  const [navigationExpanded, setNavigationExpanded] = useState(false);
  const [navigationReady, setNavigationReady] = useState(false);
  const navigationRef = useRef<HTMLDivElement>(null);
  const overviewOpen = selectedLocation === null;
  const navigationOpen = overviewOpen || navigationExpanded;
  const navigationInteractive = navigationOpen && navigationReady;

  function openNavigation() {
    if (navigationExpanded) return;
    setNavigationReady(false);
    setNavigationExpanded(true);
  }

  function closeNavigation() {
    setNavigationReady(false);
    setNavigationExpanded(false);
  }

  useEffect(() => {
    if (!navigationOpen) return;
    const timer = window.setTimeout(() => setNavigationReady(true), 220);
    return () => window.clearTimeout(timer);
  }, [navigationOpen]);

  useEffect(() => {
    if (explicitDestination) return;

    const restoreFrame = window.requestAnimationFrame(() => {
      const storedView = readPersistedWorldView();
      if (storedView) {
        setWorldTreeFocused(storedView.worldTreeFocused);
        setSelectedLocation(storedView.selectedLocation);
        setReturnLocation(storedView.returnLocation);
        setActiveWorkshopApplication(storedView.workshopApplication);
      }
      setWorldViewReady(true);
    });

    return () => window.cancelAnimationFrame(restoreFrame);
  }, [explicitDestination]);

  useEffect(() => {
    const openWorkshop = () => {
      setSelectedLocation("Workshop");
      setReturnLocation("Workshop");
      setActiveWorkshopApplication(null);
      setWorldTreeFocused(false);
      setWorldTreeStatsOpen(false);
      setWorldViewReady(true);
    };
    window.addEventListener(openWorkshopEvent, openWorkshop);
    return () => window.removeEventListener(openWorkshopEvent, openWorkshop);
  }, []);

  useEffect(() => {
    if (!worldViewReady) return;

    const worldView: PersistedWorldView = {
      returnLocation,
      selectedLocation,
      workshopApplication: activeWorkshopApplication,
      worldTreeFocused,
    };
    window.sessionStorage.setItem(WORLD_VIEW_STATE_KEY, JSON.stringify(worldView));
  }, [activeWorkshopApplication, returnLocation, selectedLocation, worldTreeFocused, worldViewReady]);

  function selectLocation(location: WorldLocation) {
    setSelectedLocation(location);
    setReturnLocation(location);
    setWorldTreeFocused(false);
    setWorldTreeStatsOpen(false);
  }

  function showDomainRoot() {
    setSelectedLocation(null);
    setReturnLocation(null);
    setWorldTreeFocused(false);
    setWorldTreeStatsOpen(false);
  }

  function showWorldTree() {
    setReturnLocation(selectedLocation);
    setSelectedLocation(null);
    setWorldTreeFocused(true);
    setWorldTreeStatsOpen(false);
  }

  function restoreDomainView() {
    setSelectedLocation(returnLocation);
    setWorldTreeFocused(false);
    setWorldTreeStatsOpen(false);
  }

  const workshopTerminalOpen = selectedLocation === "Workshop" && !activeWorkshopApplication && !worldTreeFocused;

  return (
    <main className={`relative mx-auto flex h-full min-h-0 w-full max-w-[var(--composer-max-width,72rem)] touch-pan-y flex-col overflow-hidden overscroll-x-none bg-background text-foreground ${worldViewReady ? "opacity-100" : "opacity-0"}`}>
      <LayoutGroup id="world-layout">
        {!embedded && (
        <div
          aria-label="World navigation"
          className={`absolute top-3 z-30 aspect-square transition-[width,right] duration-200 ease-out motion-reduce:transition-none ${navigationOpen ? "right-4 w-[clamp(7rem,11vw,9rem)]" : `${embedded ? "right-0" : "right-3"} w-10`}`}
          onKeyDown={(event) => {
            if (event.key !== "Escape" || overviewOpen) return;
            closeNavigation();
            navigationRef.current?.querySelector<HTMLButtonElement>("[aria-controls='world-navigation-options']")?.focus();
          }}
          ref={navigationRef}
        >
          <div aria-hidden={!navigationInteractive} className="relative size-full" id="world-navigation-options" inert={!navigationInteractive}>
          {selectedLocation ? (
            <div
              aria-label={`${selectedLocation} location minimap`}
              className="relative size-full"
            >
              <div className="pointer-events-auto absolute -left-8 top-0 z-20 flex h-7 w-8 items-center">
                <button
                  aria-label="Return to Domain"
                  className={`grid size-7 cursor-pointer place-items-center rounded-full bg-black text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${navigationOpen ? "opacity-100" : "opacity-0"}`}
                  onClick={showDomainRoot}
                  type="button"
                >
                  <FiArrowLeft aria-hidden="true" className="size-4" />
                </button>
              </div>
              <motion.div
                className="absolute left-0 top-0 w-[66%]"
                layoutId="world-grid"
                transition={layoutTransition}
              >
                <WorldGrid
                  compact
                  interactive={navigationInteractive}
                  onSelect={selectLocation}
                  selectedLocation={selectedLocation}
                  showLabels={navigationInteractive}
                />
              </motion.div>
              <div className="pointer-events-none absolute right-0 top-0 z-10 w-[52%] origin-center rotate-[14deg]">
                <WorldImage />
              </div>
              {navigationInteractive && <button
                aria-label="Show World"
                className="pointer-events-auto absolute left-[66%] top-[-6%] z-20 h-[64%] w-[40%] cursor-pointer rounded-full focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={showWorldTree}
                type="button"
              />}
            </div>
          ) : worldTreeFocused && worldTreeStatsOpen ? (
            <div aria-label="World Tree overview" className="relative size-full">
              <motion.button
                aria-label="Return to World Tree focus"
                className="pointer-events-auto absolute left-0 top-0 block w-[66%] cursor-pointer rounded-full focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => {
                  setWorldTreeStatsOpen(false);
                }}
                transition={layoutTransition}
                type="button"
              >
                <WorldImage />
              </motion.button>
              <motion.button
                aria-label={returnLocation ? `Return to ${returnLocation}` : "Return to Domain"}
                className="pointer-events-auto absolute right-0 top-0 z-10 block w-[52%] cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={restoreDomainView}
                transition={layoutTransition}
                type="button"
              >
                <WorldGrid compact interactive={false} selectedLocation={null} showLabels={navigationInteractive} />
              </motion.button>
            </div>
          ) : worldTreeFocused ? (
            <motion.button
              aria-label={returnLocation ? `Return to ${returnLocation}` : "Return to Domain"}
              className="pointer-events-auto block w-full cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
              layoutId="world-grid"
              onClick={restoreDomainView}
              transition={layoutTransition}
              type="button"
            >
              <WorldGrid compact interactive={false} selectedLocation={null} showLabels={navigationInteractive} />
            </motion.button>
          ) : (
            <WorldImage interactive onClick={showWorldTree} />
          )}
          </div>
          {navigationInteractive && !overviewOpen && (
            <button
              aria-label="Dock world navigation in the right rail"
              className="absolute bottom-0 right-0 z-30 grid size-7 cursor-pointer place-items-center rounded-md border border-white/50 bg-black text-white/75 transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={() => {
                closeNavigation();
                window.requestAnimationFrame(() => navigationRef.current?.querySelector<HTMLButtonElement>("[aria-controls='world-navigation-options']")?.focus());
              }}
              title="Dock world navigation"
              type="button"
            >
              <FiCornerDownRight aria-hidden="true" className="size-4" />
            </button>
          )}
          {!overviewOpen && <button
            aria-controls="world-navigation-options"
            aria-expanded={navigationOpen}
            aria-label="Expand world navigation"
            className={`absolute inset-0 z-30 size-full cursor-pointer rounded-md focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${navigationInteractive ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"}`}
            onClick={openNavigation}
            tabIndex={navigationInteractive ? -1 : 0}
            type="button"
          />}
          <AttentionCountBadge count={worldTreeNotifications.length} />
        </div>
        )}

        {workshopTerminalOpen ? (
          <section aria-label="Workshop terminal" className={`pointer-events-auto absolute left-0 bottom-20 top-0 z-10 ${embedded ? "right-0" : "right-[var(--composer-gutter,1.5rem)]"}`}>
            <div className="flex h-full w-full flex-col">
              <ActionsWorkspace workshop showSummary={!embedded} />
            </div>
          </section>
        ) : (
        <PinScrollArea wrapperClassName="absolute inset-x-0 bottom-20 top-0 z-10" className={`grid px-[clamp(1.5rem,5vw,4rem)] ${domainGridFocused ? "pointer-events-auto justify-items-center content-start pb-12 pt-2" : (selectedLocation === "Dungeon" || selectedLocation === "Store") && !worldTreeFocused ? "pointer-events-auto items-start pb-12 pt-2" : "pointer-events-none place-items-center"}`}>
          {worldTreeFocused ? (
            <div className="w-[min(78vw,38rem)]">
              {worldTreeStatsOpen ? <WorldTreeHealthPanel /> : (
                <div
                  className="pointer-events-auto relative"
                  onMouseEnter={(event) => setWorldTreeHover({ x: event.clientX, y: event.clientY })}
                  onMouseLeave={() => setWorldTreeHover(null)}
                  onMouseMove={(event) => setWorldTreeHover({ x: event.clientX, y: event.clientY })}
                >
                  <WorldImage />
                  {worldTreeHover && <WorldTreeHoverPreview x={worldTreeHover.x} y={worldTreeHover.y} />}
                </div>
              )}
            </div>
          ) : domainGridFocused ? (
            <div className="w-[min(78vw,36rem)]">
              <SquareGrid />
            </div>
          ) : selectedLocation === "Workshop" && activeWorkshopApplication ? (
            <WorkshopEditor application={activeWorkshopApplication} />
          ) : selectedLocation === "Store" ? (
            <StoreContent />
          ) : selectedLocation === "Dungeon" ? (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              aria-labelledby="dungeon-domain-heading"
              className="mx-auto w-full max-w-5xl"
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <header className="mb-8 text-center uppercase">
                <p className="font-mono text-[0.625rem] tracking-[0.24em] text-white/40">
                  Domain
                </p>
                <h1
                  className="mt-3 text-2xl font-semibold tracking-[0.24em] text-white sm:text-4xl"
                  id="dungeon-domain-heading"
                >
                  Dungeon
                </h1>
              </header>
              <StatsLevelsContent />
            </motion.section>
          ) : selectedLocation ? (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              aria-labelledby="selected-domain-heading"
              className="text-center uppercase"
              initial={{ opacity: 0, y: 8 }}
              key={selectedLocation}
              transition={{ duration: 0.2 }}
            >
              <p className="font-mono text-[0.625rem] tracking-[0.24em] text-white/40">
                Domain
              </p>
              <h1
                className="mt-3 text-2xl font-semibold tracking-[0.24em] text-white sm:text-4xl"
                id="selected-domain-heading"
              >
                {selectedLocation}
              </h1>
            </motion.section>
          ) : (
            <motion.div
              className="pointer-events-auto w-[min(78vw,36rem)]"
              layoutId="world-grid"
              transition={layoutTransition}
            >
              <WorldGrid
                onSelect={selectLocation}
                selectedLocation={null}
              />
            </motion.div>
          )}
        </PinScrollArea>
        )}
      </LayoutGroup>
      {worldTreeFocused && (
        <button
          aria-label="Open World Tree health stats"
          className="pointer-events-auto absolute bottom-24 left-[clamp(1.5rem,4.4vw,3.5rem)] z-20 flex w-52 items-center gap-3 border border-transparent p-2 text-white transition-colors hover:border-white/55 hover:bg-white/10 focus-visible:border-white focus-visible:outline-none"
          onClick={() => setWorldTreeStatsOpen(true)}
          type="button"
        >
          <FiBarChart2 aria-hidden="true" className="size-5 shrink-0 text-white/70" />
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-3 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-white/60">
              <span>World Tree Health</span>
              <span className="text-white">100%</span>
            </span>
            <span aria-hidden="true" className="mt-2 block h-1 border border-white/45 p-px">
              <span className="block h-full w-full bg-white" />
            </span>
          </span>
        </button>
      )}
    </main>
  );
}

"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiChevronDown, FiVideo } from "react-icons/fi";
import portrait from "../../../agent/public/assets/live-stats-profile.png";
import { AttentionCountBadge, mapPlanNotifications } from "../components/attention-notifications";
import { ActivityCategoryIcon } from "../components/activity-category-icon";
import { getArcDay, getArcTimeRemaining } from "../components/arc-time";
import { AdminContent } from "../components/admin";
import { InventoryContent } from "../components/inventory-content";
import { HudCategoryApp, type HudCategory } from "../components/hud";
import { PinScrollArea } from "../components/pin-scroll-area";
import { ExecuteCommandControl, QuestCommandHistory } from "../components/quest-terminal";
import { type ActiveActivity, useActiveActivity } from "../components/quest-terminal/use-active-activity";
import { StoryboardBuilder, StoryboardContent } from "../components/storyboard";
import { statsAppLabelTypography } from "./components/state-view-toolbar";
import { StateFigureNavigation } from "./components/state-figure-navigation";
import { SystemsView } from "./components/systems-view";
import { useStateView } from "./components/state-view-context";

type AppSummary = {
  id: HudCategory;
  label: string;
  value: string;
  detail: string;
};

type Stat = {
  label: string;
  status: string;
  points: string;
  chartLabel: string;
  chartValue: number;
  chartDisplay: string;
};

const syncRatioStatus = "84%";
const streakStatus = "6 days";

const stats: Stat[] = [
  { label: "Sync Ratio", status: syncRatioStatus, points: "", chartLabel: "Sync Ratio", chartValue: 84, chartDisplay: "84%" },
  { label: "Streak", status: streakStatus, points: "", chartLabel: "Sync Ratio", chartValue: 84, chartDisplay: "84%" },
  { label: "Experience", status: "—", points: "0 XP", chartLabel: "Experience", chartValue: 0, chartDisplay: "0 XP" },
  { label: "Health", status: "hours/24", points: "0 HP", chartLabel: "Health", chartValue: 0, chartDisplay: "0 / 24" },
  { label: "Wealth", status: "—", points: "", chartLabel: "Wealth", chartValue: 0, chartDisplay: "0" },
  { label: "Sentience", status: "—", points: "0 AP · 0 PP · 0 MP", chartLabel: "Sentience", chartValue: 0, chartDisplay: "0 AP · 0 PP · 0 MP" },
  { label: "Skills", status: "—", points: "0 SP", chartLabel: "Skills", chartValue: 0, chartDisplay: "0 SP" },
  { label: "Titles", status: "—", points: "", chartLabel: "Titles", chartValue: 0, chartDisplay: "0" },
  { label: "Builds", status: "0", points: "0 BP", chartLabel: "Builds", chartValue: 0, chartDisplay: "0 BP" },
];

const sentienceStats: Stat[] = [
  { label: "Interaction", status: "hours/24", points: "0 KP", chartLabel: "Interaction", chartValue: 0, chartDisplay: "0 / 24" },
  { label: "Personality", status: "—", points: "0 AP", chartLabel: "Personality", chartValue: 0, chartDisplay: "0 AP" },
  { label: "Perception", status: "—", points: "0 PP", chartLabel: "Perception", chartValue: 0, chartDisplay: "0 PP" },
  { label: "Volition", status: "hours/24", points: "0 MP", chartLabel: "Volition", chartValue: 0, chartDisplay: "0 / 24" },
];

const connectionCategories = ["Family", "Friends", "Professional", "Roster", "Guild", "Acquaintance", "Proselyte"] as const;
type ConnectionCategory = (typeof connectionCategories)[number];
type Connection = { id: string; name: string; categories: readonly ConnectionCategory[] };
const connections: readonly Connection[] = [];

const appSummaries: AppSummary[] = [
  { id: "health", label: "Health", value: "0 HP", detail: "0 / 24 hours" },
  { id: "wealth", label: "Wealth", value: "0", detail: "No assets tracked" },
  { id: "interactions", label: "Interactions", value: "0 KP", detail: "0 / 24 hours" },
  { id: "sentience", label: "Sentience", value: "0 AP · 0 PP · 0 MP", detail: "Personality · Perception · Volition" },
  { id: "skills", label: "Skills", value: "0 SP", detail: "No skills tracked" },
  { id: "experience", label: "Experience", value: "0 XP", detail: "6 day streak" },
];

function HudSummaryButton({
  onSelect,
  selected,
  summary,
}: {
  onSelect: (category: HudCategory) => void;
  selected: boolean;
  summary: AppSummary;
}) {
  return (
    <button
      aria-expanded={selected}
      aria-pressed={selected}
      className={`flex min-h-36 cursor-pointer flex-col justify-between rounded-lg border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white ${
        selected
          ? "border-white bg-white text-black"
          : "border-white/20 bg-white/[0.02] text-white hover:border-white/60"
      }`}
      onClick={() => onSelect(summary.id)}
      type="button"
    >
      <h2 className={`text-[0.65rem] font-semibold uppercase tracking-[0.22em] ${selected ? "text-black/60" : "text-white/50"}`}>
        {summary.label}
      </h2>
      <div className="mt-8">
        <p className="text-sm font-medium uppercase tracking-[0.12em]">{summary.value}</p>
        <p className={`mt-2 text-[0.6rem] uppercase leading-5 tracking-[0.14em] ${selected ? "text-black/55" : "text-white/40"}`}>
          {summary.detail}
        </p>
      </div>
    </button>
  );
}

function HudSummaryRows({
  columns,
  onSelect,
  selectedCategory,
}: {
  columns: 1 | 2 | 3;
  onSelect: (category: HudCategory) => void;
  selectedCategory: HudCategory | null;
}) {
  const rows = Array.from(
    { length: Math.ceil(appSummaries.length / columns) },
    (_, rowIndex) => appSummaries.slice(rowIndex * columns, (rowIndex + 1) * columns),
  );
  const gridColumns = columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <section aria-label="HUD app summaries">
      {rows.map((row, rowIndex) => {
        const expandedCategory = row.find((summary) => summary.id === selectedCategory)?.id ?? null;
        const previousRowExpanded = rowIndex > 0 && rows[rowIndex - 1].some((summary) => summary.id === selectedCategory);

        return (
          <div
            className={rowIndex === 0 || previousRowExpanded ? "" : "mt-3"}
            key={row.map((summary) => summary.id).join("-")}
          >
            <div className={`grid gap-3 ${gridColumns}`}>
              {row.map((summary) => (
                <HudSummaryButton
                  key={summary.id}
                  onSelect={onSelect}
                  selected={selectedCategory === summary.id}
                  summary={summary}
                />
              ))}
            </div>
            {expandedCategory && (
              <div className="pb-12">
                <HudCategoryApp category={expandedCategory} />
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

const devlogEntries = [
  {
    day: "DAY 1",
    time: "05:30 PM",
    duration: "00:42:18",
    title: "Drive",
    assets: [],
  },
  {
    day: null,
    time: "04:10 PM",
    duration: "00:18:42",
    title: "Route study",
    assets: [],
  },
  {
    day: null,
    time: "03:25 PM",
    duration: "—",
    title: "After Action Report (ARR)",
    assets: ["ARR"],
  },
];

const dayActivityEntries = devlogEntries.filter((entry) => entry.assets.length === 0);

function formatCompactLogTime(time: string) {
  return time.replace(/^0/, "");
}

function DayLogContent({ onOpenArr }: { onOpenArr: () => void }) {
  return (
    <ol className="relative mt-6 ml-2 border-l border-solid border-white/30">
      <li className="relative ml-7">
        <div className="flex justify-end">
          <p className="flex items-center gap-3 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-white/55">
            <span>09.03.2026</span>
            <span>DAY 1</span>
          </p>
        </div>
        <span
          aria-hidden="true"
          className="absolute -left-[2.05rem] top-11 size-2 rounded-full bg-white"
        />
        <article className="mt-10 grid gap-5 pb-8 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-white/50">
            <p>Total time</p>
            <p className="mt-2 text-white">01:01:00</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-white">
              Day summary
            </h3>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
              <span>2 events</span>
              <span>1 ARR</span>
            </div>
          </div>
        </article>
        <ol aria-label="Day 1 activity log" className="mb-8 grid gap-5">
          {devlogEntries.map((entry) => (
            <li
              className="min-w-0"
              key={`${entry.time}-${entry.title}-day`}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
                <h4 className="min-w-0 text-left text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                  {entry.title}
                </h4>
                <time className="whitespace-nowrap text-right font-mono text-[0.55rem] uppercase tracking-[0.08em] text-white/45">
                  {formatCompactLogTime(entry.time)}
                </time>
              </div>
              {entry.assets.length > 0 && (
                <button
                  aria-label="Open attached ARR media"
                  className="mt-4 grid h-40 aspect-[9/16] cursor-pointer place-items-center border border-white/25 bg-white/[0.03] text-base font-semibold uppercase tracking-[0.24em] text-white/65 transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                  onClick={onOpenArr}
                  type="button"
                >
                  ARR
                </button>
              )}
            </li>
          ))}
        </ol>
      </li>
    </ol>
  );
}

const levelObjectives = [
  { label: "Food", completed: false },
  { label: "Shelter", completed: false },
  { label: "Clothing", completed: false },
  { label: "Sleep", completed: false },
];

const incompleteObjectiveColor = "#595959";
const activeQuestProgress = 70;
// Match the composer's border grey without changing the colors of its contents.
const selectedSummarySurface = "border-transparent bg-white/[0.20] shadow-none";
const revealedSummarySurface = "border-transparent bg-transparent shadow-none hover:border-transparent hover:bg-white/[0.20] hover:shadow-none";

function CurrentActivitySummary({
  activeActivity,
  activityView,
  categoryPickerOpen = false,
  expanded = false,
  onActivityViewChange,
  onCurrentActivityClick,
  onCategoryClick,
}: {
  activeActivity: ActiveActivity | null;
  activityView: "current" | "tasks";
  categoryPickerOpen?: boolean;
  expanded?: boolean;
  onActivityViewChange?: (view: "current" | "tasks") => void;
  onCurrentActivityClick?: () => void;
  onCategoryClick?: () => void;
}) {
  const [titleSelected, setTitleSelected] = useState(false);
  const title = activeActivity?.name && activeActivity.name !== activeActivity.category
    ? activeActivity.name
    : "Current activity";
  const isDefaultTitle = title === "Current activity";
  const titleHighlighted = expanded && activityView === "current" && titleSelected;

  return (
    <div className="flex min-w-0 flex-[0_1_auto] items-center gap-2 font-sans text-xs font-medium">
      {activeActivity?.category && !categoryPickerOpen ? (
        <motion.button
          layoutId={`activity-category-${activeActivity.category}`}
          transition={{ layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }}
          aria-label={`View ${activeActivity.category} activity grid`}
          title={`View ${activeActivity.category} activity grid`}
          className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 max-[430px]:size-5"
          onClick={(event) => { event.stopPropagation(); onCategoryClick?.(); }}
          onKeyDown={(event) => event.stopPropagation()}
          type="button"
        >
          <motion.span layoutId={`activity-category-icon-${activeActivity.category}`} className="grid size-7 place-items-center rounded-full max-[430px]:size-5">
            <ActivityCategoryIcon category={activeActivity.category} className="size-5 max-[430px]:size-4" />
          </motion.span>
        </motion.button>
      ) : null}
      <div className={`flex w-[clamp(9rem,40vw,16rem)] min-w-0 flex-[0_1_auto] items-center rounded-lg transition-colors ${titleHighlighted ? "bg-[#e8e8e8] text-black" : "bg-black/30 text-white"}`}>
          <button
            id="activity-current-tab"
            aria-controls="activity-current-panel"
            aria-selected={activityView === "current"}
            role="tab"
            type="button"
            className={`min-w-0 flex-1 cursor-pointer truncate px-2 py-1.5 text-left font-sans text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 max-[430px]:px-1 ${titleHighlighted ? "text-black" : isDefaultTitle ? "italic text-white/45 hover:text-white" : "text-white/75 hover:text-white"}`}
            onClick={(event) => {
              event.stopPropagation();
              setTitleSelected(true);
              if (onCurrentActivityClick) onCurrentActivityClick();
              else onActivityViewChange?.("current");
            }}
            onKeyDown={(event) => event.stopPropagation()}
          >{title}</button>
      </div>
    </div>
  );
}

export function ActiveQuestPanel({
  className = "",
  headingId = "active-quest-heading",
}: {
  className?: string;
  headingId?: string;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className={`flex w-full min-h-0 flex-col border border-white/20 p-5 ${className}`}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h3
          className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/55"
          id={headingId}
        >
          Active Quest
        </h3>
        <ul
          aria-label="Quest modes"
          className="ml-auto flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/60"
        >
          <li>Modes</li>
          <li className="flex items-center gap-2.5">
            <span aria-hidden="true" className="size-2 bg-white" />
            Explore
          </li>
          <li className="flex items-center gap-2.5">
            <span aria-hidden="true" className="size-2 border border-white" />
            Exploit
          </li>
        </ul>
      </div>
      <div className="mt-4 flex shrink-0 items-center justify-between gap-4 border-t border-white/15 pt-4">
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/35">
          B-Code
        </span>
        <ExecuteCommandControl />
      </div>
      <PinScrollArea className="pr-2" wrapperClassName="mt-4 flex-1">
        <QuestCommandHistory />
      </PinScrollArea>
    </section>
  );
}

export function CampaignActivitySummary({
  activityView = "current",
  categoryPickerOpen = false,
  expanded = false,
  onActivityViewChange,
  onCurrentActivityClick,
  onCampaignToggle,
  onCategoryClick,
  selectedCampaign = "current",
  summary = "quest",
}: {
  activityView?: "current" | "tasks";
  categoryPickerOpen?: boolean;
  expanded?: boolean;
  onActivityViewChange?: (view: "current" | "tasks") => void;
  onCurrentActivityClick?: () => void;
  onCampaignToggle?: () => void;
  onCategoryClick?: () => void;
  selectedCampaign?: "all" | "current";
  summary?: "activity" | "quest";
}) {
  const [now, setNow] = useState(() => Date.now());
  const { activeActivity } = useActiveActivity();
  const remaining = getArcTimeRemaining(now);
  const arcDay = getArcDay(remaining.days);
  const summarySurface = expanded ? selectedSummarySurface : revealedSummarySurface;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      aria-label={summary === "quest" ? "Campaign summary" : "Activity summary"}
      className={`relative ${summary === "activity" ? "mb-12" : "mb-3"} grid min-w-0 grid-cols-1 items-stretch ${summary === "activity" ? "w-fit max-w-full rounded-2xl bg-transparent py-1.5" : `arc-summary-container w-full border ${onCampaignToggle ? `${expanded ? "px-3" : "px-0 hover:px-3"} py-0 transition-[background-color,border-color,box-shadow,padding] ${summarySurface}` : "border-transparent bg-transparent"}`}`}
    >
      {summary === "activity" ? (
        <div className="flex min-w-0 items-center gap-2 py-0.5 font-sans text-xs font-medium text-white/60 max-[430px]:gap-1" id="terminal-campaign-activity-summary-content">
          <div className="flex min-w-0 items-center gap-2">
            <CurrentActivitySummary activeActivity={activeActivity} activityView={activityView} categoryPickerOpen={categoryPickerOpen} expanded={expanded} onActivityViewChange={onActivityViewChange} onCurrentActivityClick={onCurrentActivityClick} onCategoryClick={onCategoryClick} />
            {onActivityViewChange && (
              <div aria-label="Activity views" role="tablist" className="flex shrink-0 gap-1">
                <button
                  id="activity-tasks-tab"
                  aria-label="Activities"
                  title="Activities"
                  aria-controls="activity-tasks-panel"
                  aria-selected={expanded && activityView === "tasks"}
                  role="tab"
                  type="button"
                  onClick={(event) => { event.stopPropagation(); onActivityViewChange("tasks"); }}
                  onKeyDown={(event) => event.stopPropagation()}
                  className="relative grid size-10 cursor-pointer place-items-center rounded-[4px] bg-background text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" aria-hidden="true" className={`size-7 ${expanded && activityView === "tasks" ? "brightness-0 invert" : ""}`} height={28} src="/cleaned-treasure-map.svg" width={28} />
                  <AttentionCountBadge count={mapPlanNotifications.length} />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          aria-controls="stats-campaign-view"
          aria-expanded={expanded}
          aria-label={expanded ? "Close campaign view" : "Open campaign view"}
          className="grid min-w-0 cursor-pointer content-between gap-3 py-0 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={onCampaignToggle}
          type="button"
        >
          <div className={`arc-summary-heading flex gap-2 text-white/60 ${statsAppLabelTypography}`}>
            <p className="whitespace-nowrap bg-white px-1.5 text-black">
              {selectedCampaign === "all" ? "All campaigns" : "Current campaign"}
            </p>
            <span className="whitespace-nowrap font-mono tracking-normal tabular-nums text-white/60" suppressHydrationWarning>
              DAY {arcDay.current} / {arcDay.total}
            </span>
          </div>
          <div className={`arc-summary-activity flex gap-2 text-white/60 ${statsAppLabelTypography}`}>
            <p className="break-words text-white/45">Arc: Crucible · Act I</p>
            <div className="flex items-center gap-2">
              <div aria-hidden="true" className="arc-progress-bar h-3 w-16 border border-white/50 sm:w-20">
                <div className="h-full bg-white" style={{ width: `${activeQuestProgress}%` }} />
              </div>
              <span className="w-8 text-right font-mono tracking-normal tabular-nums text-white/45">
                {activeQuestProgress}%
              </span>
            </div>
          </div>
        </button>
      )}
    </section>
  );
}

function CampaignSelectorChip({ selectedCampaign, onSelect }: { selectedCampaign: "all" | "current"; onSelect: (campaign: "all" | "current") => void }) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedLabel = selectedCampaign === "all" ? "All campaigns" : "Current campaign";

  useEffect(() => {
    if (!selectorOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!selectorRef.current?.contains(event.target as Node)) setSelectorOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSelectorOpen(false);
      triggerRef.current?.focus();
    };
    window.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectorOpen]);

  return (
    <div className="relative min-w-0" ref={selectorRef}>
      <button
        aria-expanded={selectorOpen}
        aria-label={`Campaigns: ${selectedLabel}`}
        aria-haspopup="true"
        className="flex max-w-[12rem] cursor-pointer items-center gap-2 rounded-full border border-white/40 bg-transparent px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-white/65 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={() => setSelectorOpen((open) => !open)}
        ref={triggerRef}
        title={selectedLabel}
        type="button"
      >
        <span className="truncate">{selectedLabel}</span>
        <FiChevronDown aria-hidden="true" className="size-3 shrink-0" />
      </button>
      {selectorOpen && (
        <div aria-label="Campaign views" className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-48 border border-white/40 bg-black p-1 shadow-xl" id="campaign-category-options" role="group">
          {([
            ["current", "Current campaign"],
            ["all", "All campaigns"],
          ] as const).map(([value, label]) => (
            <button
              aria-pressed={selectedCampaign === value}
              className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${selectedCampaign === value ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              key={value}
              onClick={() => {
                onSelect(value);
                setSelectorOpen(false);
                triggerRef.current?.focus();
              }}
              type="button"
            >
              {label}{selectedCampaign === value && <FiCheck aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignLeaderboardPlaceholder({ selectedCampaign, onSelect }: { selectedCampaign: "all" | "current"; onSelect: (campaign: "all" | "current") => void }) {
  return (
    <section aria-labelledby="campaign-leaderboard-heading" className="mt-6 w-full text-white" id="stats-campaign-view">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70" id="campaign-leaderboard-heading">Leaderboard</h2>
        <CampaignSelectorChip onSelect={onSelect} selectedCampaign={selectedCampaign} />
      </div>
      <div className="mt-5 grid min-h-48 place-items-center border border-dashed border-white/25 p-6 text-center text-[0.65rem] uppercase tracking-[0.16em] text-white/40">Leaderboard coming soon</div>
    </section>
  );
}

function StatChart({ stat }: { stat: Stat }) {
  return (
    <div
      aria-label={`${stat.chartLabel}: ${stat.chartDisplay}`}
      className="relative grid h-full w-full place-items-center rounded-full transition-opacity duration-200"
      role="img"
      style={{
        background: `conic-gradient(#f5f5f5 ${stat.chartValue}%, rgba(245,245,245,0.16) 0)`,
      }}
    >
      <div className="grid size-[72%] place-content-center rounded-full bg-black px-2 text-center">
        <span className="text-[0.42rem] font-semibold uppercase tracking-[0.08em] text-white/50">
          {stat.chartLabel}
        </span>
        <strong className="mt-1 text-sm font-medium tracking-[0.06em] text-white">
          {stat.chartDisplay}
        </strong>
      </div>
    </div>
  );
}

const arcPreviewImages = [
  { src: "/arc-preview/robot-arms.png", mangaSrc: "/arc-preview/robot-arms-manga.webp", alt: "Robotic arms in a workshop" },
  { src: "/arc-preview/rainbow.png", mangaSrc: "/arc-preview/rainbow-manga.webp", alt: "Rainbow over forested mountains" },
  { src: "/arc-preview/canyon.png", mangaSrc: "/arc-preview/canyon-manga.webp", alt: "Sunlit canyon beneath a blue sky" },
];

function ArcVideoPanel({ className, manga, panel }: { className?: string; manga: boolean; panel: number }) {
  const image = arcPreviewImages[(panel - 1) % arcPreviewImages.length];
  return (
    <div
      aria-label={`Panel ${panel}`}
      className={`relative min-h-24 overflow-hidden border border-white/55 bg-white/[0.025] ${className ?? ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={`${image.alt}${manga ? ", manga illustration" : ""}`} src={manga ? image.mangaSrc : image.src} className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}

function ArcPanelLayouts({ manga }: { manga: boolean }) {
  return (
    <div className="w-full space-y-10" aria-label="ARC comic panels">
      <article aria-label="ARC layout 1" className="grid grid-cols-[2fr_1fr] items-start gap-2">
        <ArcVideoPanel className="aspect-[16/9]" manga={manga} panel={1} />
        <ArcVideoPanel className="aspect-[3/4]" manga={manga} panel={2} />
      </article>
      <article aria-label="ARC layout 2" className="grid grid-cols-[1fr_1.45fr] gap-2">
        <ArcVideoPanel className="aspect-square" manga={manga} panel={3} />
        <div className="grid grid-rows-2 gap-2">
          <ArcVideoPanel className="h-full" manga={manga} panel={4} />
          <ArcVideoPanel className="h-full" manga={manga} panel={5} />
        </div>
      </article>
      <article aria-label="ARC layout 3" className="grid grid-cols-3 gap-2">
        <ArcVideoPanel className="aspect-[3/4]" manga={manga} panel={6} />
        <ArcVideoPanel className="aspect-[3/4]" manga={manga} panel={7} />
        <ArcVideoPanel className="aspect-[3/4]" manga={manga} panel={8} />
      </article>
    </div>
  );
}

function ArcStoriesContent({ view, onSelect, onOpenArr }: { view: "worldline" | "logs" | "storyboard"; onSelect: (view: "worldline" | "logs" | "storyboard") => void; onOpenArr: () => void }) {
  const [manga, setManga] = useState(false);
  return (
    <section aria-label="Campaign stories" className="mt-3">
      <div className="flex w-full justify-end" aria-label="Campaign stories views" role="tablist">
        <div className="flex items-center rounded-full border border-white/35 p-0.5">
          {(["worldline", "storyboard", "logs"] as const).map((option) => (
            <button key={option} type="button" role="tab" aria-selected={view === option} aria-controls="arc-view-content" id={`arc-${option}-tab`} onClick={() => onSelect(option)} className={`relative cursor-pointer rounded-full px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.12em] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${view === option ? "text-black" : "text-white/55 hover:text-white"}`}>
              {view === option && <motion.span aria-hidden="true" className="absolute inset-0 rounded-full bg-white" layoutId="arc-view-fill" transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} />}
              <span className="relative z-10">{option}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 [&>*]:mt-0" id="arc-view-content" role="tabpanel" aria-labelledby={`arc-${view}-tab`}>
        {view === "logs" ? <DayLogContent onOpenArr={onOpenArr} /> : view === "storyboard" ? (
          <div className="w-full border border-white/20 p-[clamp(1.25rem,3vw,2.5rem)]"><StoryboardContent /></div>
        ) : <div><button aria-pressed={manga} className={`mb-3 cursor-pointer rounded-full border px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${manga ? "border-white bg-white text-black" : "border-white/35 text-white/60 hover:border-white hover:text-white"}`} onClick={() => setManga((current) => !current)} type="button">Manga</button><ArcPanelLayouts manga={manga} /></div>}
      </div>
    </section>
  );
}

function ObjectiveMarker({ completed, label }: { completed: boolean; label: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg
        aria-label={`${label}: ${completed ? "complete" : "incomplete"}`}
        className="size-5 shrink-0"
        role="img"
        viewBox="0 0 20 20"
      >
        <polygon
          fill={completed ? "white" : incompleteObjectiveColor}
          points="10,1 18.5,5.5 18.5,14.5 10,19 1.5,14.5 1.5,5.5"
          stroke={completed ? "white" : incompleteObjectiveColor}
          strokeWidth="1.5"
        />
        <polygon
          fill="black"
          points="10,5 15,7.7 15,12.3 10,15 5,12.3 5,7.7"
          stroke={completed ? "white" : incompleteObjectiveColor}
          strokeWidth="1.25"
        />
      </svg>
      {label}
    </span>
  );
}

const levelFieldClass =
  "mt-2 w-full border border-white/20 bg-black px-3 py-2 text-xs normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-white/60";

function LevelOneSystem() {
  return (
    <li className="w-full py-6">
      <header className="flex flex-wrap items-center justify-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" aria-hidden="true" className="h-5 w-auto shrink-0" src="/levels.svg" />
        <span>LEVEL I</span>
        <span className="text-white/40">ESSENTIALS</span>
      </header>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.6rem] tracking-[0.18em] text-white/55">
        {levelObjectives.map((objective) => (
          <ObjectiveMarker completed={objective.completed} key={objective.label} label={objective.label} />
        ))}
      </div>

      <div className="mt-8 space-y-8 text-left">
        <section className="border-t border-white/15 pt-6">
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/55">
            Description · Specific
          </h3>
          <p className="mt-3 max-w-4xl text-sm font-normal normal-case leading-6 tracking-normal text-white/70">
            Level I is a dungeon level. Defeat the four monsters—Food, Shelter, Clothing, and Sleep—by securing each objective before reaching the boss.
          </p>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="border border-white/15 p-4">
              <dt className="text-[0.6rem] uppercase tracking-[0.18em] text-white/35">Level requirement</dt>
              <dd className="mt-2 text-xs font-normal normal-case leading-5 tracking-normal text-white/65">
                Secure food, shelter, clothing, and at least seven hours of tracked sleep.
              </dd>
            </div>
            <div className="border border-white/15 p-4">
              <dt className="text-[0.6rem] uppercase tracking-[0.18em] text-white/35">Boss requirement</dt>
              <dd className="mt-2 text-xs font-normal normal-case leading-5 tracking-normal text-white/65">
                Secure a stable source of income capable of clearing every Level I requirement.
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/55">
            Measurable
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-[0.6rem] uppercase tracking-[0.16em] text-white/40">
              Income sources
              <textarea className={`${levelFieldClass} min-h-24 resize-y`} placeholder="List expected income sources" />
            </label>
            <label className="text-[0.6rem] uppercase tracking-[0.16em] text-white/40">
              Bills and financial obligations
              <textarea className={`${levelFieldClass} min-h-24 resize-y`} placeholder="List bills and obligation scenarios" />
            </label>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Achievable", "Not prevented by the laws of physics, so why not?"],
            ["Relevant", "Required to live and aligned with the World Seed."],
            ["Time-bound", "30 days remaining before this level expires."],
          ].map(([label, value]) => (
            <section className="border border-white/15 p-4" key={label}>
              <h3 className="text-[0.6rem] uppercase tracking-[0.18em] text-white/35">{label}</h3>
              <p className="mt-2 text-xs font-normal normal-case leading-5 tracking-normal text-white/65">{value}</p>
            </section>
          ))}
        </div>

        <section>
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/55">
            Telemetry
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Income expected", "Debts expected", "Income actual", "Debt actual"].map((label) => (
              <label className="text-[0.6rem] uppercase tracking-[0.16em] text-white/40" key={label}>
                {label}
                <input className={levelFieldClass} inputMode="decimal" placeholder="$0.00" type="text" />
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/55">
            Requirements
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="border border-white/15 p-4">
              <label className="text-[0.6rem] uppercase tracking-[0.16em] text-white/40">
                Shelter · Rent
                <input className={levelFieldClass} inputMode="decimal" placeholder="Amount due" type="text" />
              </label>
              <label className="mt-3 flex items-center gap-3 text-xs normal-case tracking-normal text-white/65">
                <input className="size-4 accent-white" type="checkbox" /> Paid
              </label>
            </div>
            <div className="border border-white/15 p-4">
              <label className="text-[0.6rem] uppercase tracking-[0.16em] text-white/40">
                Clothing · Inventory item
                <input className={levelFieldClass} placeholder="Item name" type="text" />
              </label>
              <button className="mt-3 border border-white/30 px-3 py-2 text-[0.6rem] uppercase tracking-[0.14em] text-white/60" type="button">
                Add to inventory
              </button>
            </div>
            <div className="border border-white/15 p-4">
              <label className="text-[0.6rem] uppercase tracking-[0.16em] text-white/40">
                Sleep · Hours tracked
                <input className={levelFieldClass} defaultValue="7" min="0" step="0.5" type="number" />
              </label>
              <p className="mt-3 text-xs font-normal normal-case tracking-normal text-white/45">Minimum target: 7 hours.</p>
            </div>
            <div className="border border-white/15 p-4">
              <label className="text-[0.6rem] uppercase tracking-[0.16em] text-white/40">
                Food · Inventory item
                <input className={levelFieldClass} placeholder="Food item" type="text" />
              </label>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-3 text-xs normal-case tracking-normal text-white/65">
                  <input className="size-4 accent-white" type="checkbox" /> Meal prep complete
                </label>
                <button className="border border-white/30 px-3 py-2 text-[0.6rem] uppercase tracking-[0.14em] text-white/60" type="button">
                  Add to inventory
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </li>
  );
}

function LevelTwoVision() {
  return (
    <li className="w-full border-t border-white/15 py-6 text-white/35">
      <header className="flex flex-wrap items-center justify-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" aria-hidden="true" className="h-5 w-auto shrink-0 opacity-40" src="/levels.svg" />
        <span>LEVEL II</span>
        <span>VISION</span>
        <span className="rounded-full bg-white/20 px-3 py-1 text-[0.5rem] text-black">LOCKED</span>
      </header>
      <div className="mx-auto mt-6 max-w-3xl border border-white/10 p-5 text-left">
        <p className="text-[0.6rem] uppercase tracking-[0.18em]">Core objective</p>
        <p className="mt-2 text-sm font-normal normal-case tracking-normal text-white/45">Define a goal.</p>
        <blockquote className="mt-5 flex items-center gap-4 border-t border-white/10 pt-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Simulacra" className="h-7 w-auto shrink-0 opacity-50" src="/sim.svg" />
          <p className="text-sm font-normal italic normal-case leading-6 tracking-normal text-white/45">
            “A person without a vision is like a city without walls.”
          </p>
        </blockquote>
      </div>
    </li>
  );
}

export function StatsLevelsContent({ className = "" }: { className?: string }) {
  return (
    <ul
      aria-label="O.S. levels"
      className={`w-full border-y border-white/20 text-center text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/70 ${className}`}
    >
      <LevelOneSystem />
      <LevelTwoVision />
    </ul>
  );
}

function ConnectionsView() {
  const [selectedCategories, setSelectedCategories] = useState<ConnectionCategory[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedLabel = selectedCategories.length ? selectedCategories.join(", ") : "All";
  const visibleConnections = connections.filter((connection) =>
    selectedCategories.length === 0 || connection.categories.some((category) => selectedCategories.includes(category)),
  );

  useEffect(() => {
    if (!selectorOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!selectorRef.current?.contains(event.target as Node)) setSelectorOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSelectorOpen(false);
      triggerRef.current?.focus();
    };
    window.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectorOpen]);

  const toggleCategory = (category: ConnectionCategory) => {
    setSelectedCategories((current) => current.includes(category)
      ? current.filter((selected) => selected !== category)
      : [...current, category]);
  };

  return (
    <section aria-labelledby="connections-view-title" className="w-full border border-white/25 bg-white/[0.02] p-5 sm:p-7">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/20 pb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-white" id="connections-view-title">Connections</h2>
          <span className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-white/40">{visibleConnections.length} Active</span>
        </div>
        <div className="relative" ref={selectorRef}>
          <button
            aria-expanded={selectorOpen}
            aria-label={`Connection views: ${selectedLabel}`}
            aria-haspopup="true"
            className="flex max-w-[12rem] cursor-pointer items-center gap-2 rounded-full border border-white/45 px-3 py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-white/75 hover:border-white hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => setSelectorOpen((open) => !open)}
            ref={triggerRef}
            title={selectedLabel}
            type="button"
          >
            <span className="truncate">{selectedLabel}</span>
            <FiChevronDown aria-hidden="true" className="size-3 shrink-0" />
          </button>
          {selectorOpen && (
            <div aria-label="Connection views" className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-48 border border-white/40 bg-black p-1 shadow-xl" id="connection-category-options" role="group">
              <button aria-pressed={selectedCategories.length === 0} className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${selectedCategories.length === 0 ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"}`} onClick={() => { setSelectedCategories([]); setSelectorOpen(false); }} type="button">All{selectedCategories.length === 0 && <FiCheck aria-hidden="true" />}</button>
              <div className="my-1 border-t border-white/20" />
              {connectionCategories.map((category) => {
                const selected = selectedCategories.includes(category);
                return <button aria-pressed={selected} className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${selected ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"}`} key={category} onClick={() => toggleCategory(category)} type="button">{category}{selected && <FiCheck aria-hidden="true" />}</button>;
              })}
            </div>
          )}
        </div>
      </header>
      {visibleConnections.length ? (
        <div className="grid gap-3 py-5 sm:grid-cols-2">
          {visibleConnections.map((connection) => <article className="border border-white/20 p-4" key={connection.id}><h3 className="text-xs font-semibold uppercase tracking-[0.12em]">{connection.name}</h3><p className="mt-2 text-[0.6rem] uppercase tracking-[0.12em] text-white/45">{connection.categories.join(" · ")}</p></article>)}
        </div>
      ) : (
        <div className="grid min-h-48 place-items-center text-center">
          <p className="max-w-sm text-[0.65rem] uppercase leading-6 tracking-[0.2em] text-white/45">{selectedCategories.length ? "No connections match these views" : "No connections mapped"}</p>
        </div>
      )}
    </section>
  );
}

export default function StateDisplay({ embedded = false }: { embedded?: boolean }) {
  const [characterStatsOpen, setCharacterStatsOpen] = useState(false);
  const profileDetailsRef = useRef<HTMLDivElement>(null);
  const profileSummaryRef = useRef<HTMLDivElement>(null);
  const [activeStat, setActiveStat] = useState<Stat | null>(null);
  const {
    arcView, campaignSelected, displayedAppView, navigationHome, selectedCampaign,
    selectAppView, setArcView, setCampaignSelected, setNavigationHome, setSelectedCampaign,
  } = useStateView();
  const viewOpen = !navigationHome;
  const [arrOpen, setArrOpen] = useState(false);
  const [selectedHudCategory, setSelectedHudCategory] = useState<HudCategory | null>(null);
  const [sentienceExpanded, setSentienceExpanded] = useState(false);

  useEffect(() => {
    const details = profileDetailsRef.current;
    const summary = profileSummaryRef.current;
    if (!details || !summary || characterStatsOpen || displayedAppView !== "storyboard") return;
    const measure = () => {
      details.parentElement?.style.setProperty("--profile-stack-height", `${details.getBoundingClientRect().height}px`);
      summary.style.setProperty("--profile-toggle-top", `${details.getBoundingClientRect().top - summary.getBoundingClientRect().top}px`);
      summary.style.setProperty("--profile-toggle-width", `${details.getBoundingClientRect().width}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(details);
    return () => observer.disconnect();
  }, [displayedAppView, characterStatsOpen, viewOpen]);

  useEffect(() => {
    if (!arrOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setArrOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [arrOpen]);


  const statsSummary = (
    <>
                <div className="grid grid-cols-[minmax(9rem,1fr)_minmax(7rem,0.65fr)_minmax(4rem,auto)] gap-x-5 border-b border-white/15 pb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
                  <span>Attributes</span>
                  <span className="text-right">Status</span>
                  <span className="text-right">Points</span>
                </div>

                <dl className="mt-6" onMouseLeave={() => setActiveStat(null)}>
                  {stats.map((stat) => (
                    <Fragment key={stat.label}>
                      <div
                        aria-expanded={stat.label === "Sentience" ? sentienceExpanded : undefined}
                        className={`grid cursor-pointer grid-cols-[minmax(9rem,1fr)_minmax(7rem,0.65fr)_minmax(4rem,auto)] items-center gap-x-5 py-1.5 text-[0.7rem] uppercase tracking-[0.26em] outline-none transition-colors hover:text-white focus-visible:bg-white/5 ${
                          stat.label === "Experience" || stat.label === "Skills" ? "mt-7" : ""
                        }`}
                        key={stat.label}
                        onBlur={() => setActiveStat(null)}
                        onClick={() => stat.label === "Sentience" && setSentienceExpanded((expanded) => !expanded)}
                        onFocus={() => setActiveStat(stat)}
                        onKeyDown={(event) => {
                          if (stat.label !== "Sentience" || (event.key !== "Enter" && event.key !== " ")) return;
                          event.preventDefault();
                          setSentienceExpanded((expanded) => !expanded);
                        }}
                        onMouseEnter={() => setActiveStat(stat)}
                        role={stat.label === "Sentience" ? "button" : undefined}
                        tabIndex={0}
                      >
                        <dt className="flex items-center justify-between gap-3 text-white/50 transition-colors group-hover:text-white">
                          <span>{stat.label}</span>
                          {stat.label === "Sentience" && <span aria-hidden="true" className="text-white/45">{sentienceExpanded ? "−" : "+"}</span>}
                        </dt>
                        <dd className="text-right text-white">{stat.status}</dd>
                        <dd className="text-right text-white">{stat.points}</dd>
                      </div>
                      {stat.label === "Sentience" && sentienceExpanded && (
                        <div className="ml-4 border-l border-white/20 pl-4">
                          {sentienceStats.map((substat) => (
                            <div className="grid grid-cols-[minmax(9rem,1fr)_minmax(7rem,0.65fr)_minmax(4rem,auto)] items-center gap-x-5 py-1.5 text-[0.65rem] uppercase tracking-[0.2em]" key={substat.label}>
                              <span className="text-white/45">{substat.label}</span>
                              <span className="text-right text-white/80">{substat.status}</span>
                              <span className="text-right text-white/80">{substat.points}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Fragment>
                  ))}
                </dl>
    </>
  );
  return (
    <section className={`relative mx-auto flex w-full max-w-[72rem] flex-1 flex-col ${embedded ? "pb-8" : "px-[clamp(1.5rem,4.4vw,3.5rem)] pb-24"} ${displayedAppView === "os" && !navigationHome ? "pt-2" : navigationHome || displayedAppView === "arc" ? "pt-4" : displayedAppView === "admin" ? "pt-12" : displayedAppView === "storyboard" ? "pt-8" : "pt-16"}`}>
      {viewOpen && displayedAppView === "admin" && (
        <header className={`absolute top-5 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-white/70 ${embedded ? "left-0" : "left-[clamp(1.5rem,4.4vw,3.5rem)]"}`}>
          APP VERSION 0.1.0
        </header>
      )}
      <StateFigureNavigation activeView={displayedAppView} showPlayback={viewOpen && displayedAppView === "arc" && arcView === "worldline" && !campaignSelected} inlineDiagram={viewOpen && displayedAppView === "admin"} navigationHome={navigationHome} onReturn={() => setNavigationHome(true)} onSelect={(view) => { selectAppView(view); setNavigationHome(false); }} />

      <AnimatePresence initial={false}>
      {viewOpen && <motion.div animate={{ opacity: 1 }} className="w-full" exit={{ opacity: 0 }} initial={{ opacity: 0 }} key="stats-view-content" transition={{ duration: 0.2 }}>

      {(displayedAppView === "stats" || displayedAppView === "hud" || displayedAppView === "storyboard") && (
        <div className="grid w-full gap-y-6">
          <div className="w-full lg:col-span-2">
            {displayedAppView === "hud" ? (
              <div>
                <div className="sm:hidden">
                  <HudSummaryRows
                    columns={1}
                    onSelect={(category) => setSelectedHudCategory((current) => current === category ? null : category)}
                    selectedCategory={selectedHudCategory}
                  />
                </div>
                <div className="hidden sm:block lg:hidden">
                  <HudSummaryRows
                    columns={2}
                    onSelect={(category) => setSelectedHudCategory((current) => current === category ? null : category)}
                    selectedCategory={selectedHudCategory}
                  />
                </div>
                <div className="hidden lg:block">
                  <HudSummaryRows
                    columns={3}
                    onSelect={(category) => setSelectedHudCategory((current) => current === category ? null : category)}
                    selectedCategory={selectedHudCategory}
                  />
                </div>
              </div>
            ) : (
              <>
                <div ref={profileSummaryRef} className={`relative mx-auto w-full ${displayedAppView === "storyboard" ? "mb-5" : "mb-10"}`}>
                  {displayedAppView === "storyboard" && <button type="button" aria-controls="character-profile-content" onClick={() => setCharacterStatsOpen(previous => !previous)} style={{ top: "var(--profile-toggle-top, 0px)", width: "var(--profile-toggle-width, 8.5rem)" }} className="absolute left-1/2 z-10 h-8 -translate-x-1/2 cursor-pointer rounded-full border border-white/30 px-3 text-center font-sans text-xs font-normal text-white/70 transition-colors hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white">{characterStatsOpen ? "Profile Summary" : "Stats"}</button>}
                  <div id="character-profile-content">
                  {displayedAppView === "storyboard" && characterStatsOpen && <div style={{ paddingTop: "calc(var(--profile-toggle-top, 0px) + 3rem)" }}>{statsSummary}</div>}
                  <div style={displayedAppView === "storyboard" && characterStatsOpen ? { display: "none" } : undefined} className="character-summary-layout text-[0.5rem] font-semibold uppercase tracking-normal">
                    <div style={displayedAppView === "storyboard" ? { height: "var(--profile-stack-height, 4.75rem)", width: "var(--profile-stack-height, 4.75rem)" } : undefined} className="character-summary-profile block size-[4.75rem] overflow-hidden rounded-full border border-white/25 bg-white/5">
                      {activeStat ? (
                        <StatChart stat={activeStat} />
                      ) : (
                        // A plain image avoids relying on a runtime image optimizer.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="Illustrated portrait of Steven Wilcox" className="h-full w-full object-cover" src={portrait.src} />
                      )}
                    </div>
                    <div ref={profileDetailsRef} className={`character-summary-details grid min-h-[4.75rem] content-center gap-y-1 text-left font-mono text-white/60 ${displayedAppView === "storyboard" ? "min-w-[8.5rem]" : "min-w-0"}`}>
                      {displayedAppView === "storyboard" && <div aria-hidden="true" className="mb-2 h-8" />}
                      <p className="min-w-0 whitespace-nowrap">Character v0.1.0</p>
                      <p className="min-w-0 whitespace-nowrap">Job: Getaway Driver</p>
                      <p className="min-w-0 whitespace-nowrap">Build: NPC</p>
                      <p className="flex min-w-0 items-center gap-1 whitespace-nowrap">
                        <span>Streak {streakStatus}</span>
                        <span>Sync Ratio {syncRatioStatus}</span>
                      </p>
                    </div>
                    <div style={displayedAppView === "storyboard" ? { height: "var(--profile-stack-height, 4.75rem)", width: "var(--profile-stack-height, 4.75rem)" } : undefined} className="character-summary-profile character-summary-secondary relative size-[4.75rem] overflow-hidden rounded-full border border-white/25 bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="Character bust portrait" src="/chat-reader-figure.png" className="absolute left-[-12.5%] top-[-7.5%] h-auto w-[125%] max-w-none invert" />
                    </div>
                  </div>
                  </div>
                </div>
                {displayedAppView !== "storyboard" && statsSummary}
              </>
            )}
          </div>
        </div>
      )}

      {displayedAppView === "guild" && (
        <section aria-labelledby="guild-view-title" className="w-full border border-white/25 bg-white/[0.02] p-5 sm:p-7">
          <header className="flex items-center justify-between gap-6 border-b border-white/20 pb-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-white" id="guild-view-title">
              Guild
            </h2>
            <span className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-white/40">
              Unaligned
            </span>
          </header>
          <div className="grid min-h-48 place-items-center text-center">
            <p className="max-w-sm text-[0.65rem] uppercase leading-6 tracking-[0.2em] text-white/45">
              No guild membership recorded
            </p>
          </div>
        </section>
      )}

      {displayedAppView === "connections" && (
        <ConnectionsView />
      )}

      {displayedAppView === "admin" && (
        <div className="w-full">
          <AdminContent showPortrait={false} />
        </div>
      )}

      {false && (
        <section aria-label="Devlog" className="mt-8 w-full">
          <DayLogContent onOpenArr={() => setArrOpen(true)} />
          <div aria-hidden="true" className="hidden">
          {false ? (
          <ol className="relative mt-6 ml-2 border-l border-dashed border-white/30">
            {devlogEntries.map((entry, index) => (
              <li
                className={`relative ml-7 ${
                  index < devlogEntries.length - 1 ? "pb-12" : ""
                }`}
                key={`${entry.time}-${entry.title}`}
              >
                {entry.day && (
                  <div className="relative h-px w-full bg-white/20">
                    <p className="absolute right-0 top-1/2 grid size-12 -translate-y-1/2 place-items-center bg-black text-center text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-white/55">
                      {entry.day}
                    </p>
                  </div>
                )}
                <span
                  aria-hidden="true"
                  className={`absolute -left-[2.05rem] size-2 rounded-full bg-white ${
                    entry.day ? "top-11" : "top-1"
                  }`}
                />
                <article
                  className={`grid gap-5 pb-8 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8 ${
                    entry.day ? "mt-10" : ""
                  }`}
                >
                  <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-white/50">
                    <time>{entry.time}</time>
                    <p className="mt-2 text-white">{entry.duration}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-white">
                      {entry.title}
                    </h3>
                    {entry.assets.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {entry.assets.map((asset) => (
                          <li key={asset}>
                            <button
                              aria-label="Open attached ARR media"
                              className="grid size-9 cursor-pointer place-items-center text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                              onClick={() => setArrOpen(true)}
                              type="button"
                            >
                              <FiVideo aria-hidden="true" className="size-5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ol>
          ) : (
            <ol className="relative mt-6 ml-2 border-l border-dashed border-white/30">
              <li className="relative ml-7">
                <div className="relative h-px w-full bg-white/20">
                  <p className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-3 bg-black px-3 py-2 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-white/55">
                    <span>09.03.2026</span>
                    <span>DAY 1</span>
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="absolute -left-[2.05rem] top-11 size-2 rounded-full bg-white"
                />
                <article className="mt-10 grid gap-5 pb-8 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8">
                  <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-white/50">
                    <p>Total time</p>
                    <p className="mt-2 text-white">01:01:00</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-white">
                      Day summary
                    </h3>
                    <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
                      <span>2 events</span>
                      <span>1 ARR</span>
                    </div>
                  </div>
                </article>
                <ol aria-label="Day 1 activity log" className="mb-8 divide-y divide-white/15 border-y border-white/15">
                  {dayActivityEntries.map((entry) => (
                    <li
                      className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-4 py-4"
                      key={`${entry.time}-${entry.title}-day`}
                    >
                      <time className="text-left font-mono text-[0.55rem] uppercase tracking-[0.08em] text-white/45">
                        {formatCompactLogTime(entry.time)}
                      </time>
                      <h4 className="min-w-0 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                        {entry.title}
                      </h4>
                      <span className="whitespace-nowrap font-mono text-[0.55rem] tracking-[0.08em] text-white/40">
                        {entry.duration}
                      </span>
                    </li>
                  ))}
                </ol>
                <section className="pb-8">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-white">
                    After Action Report
                  </h4>
                  <button
                    className="mt-4 grid h-40 aspect-[9/16] cursor-pointer place-items-center border border-white/25 bg-white/[0.03] text-base font-semibold uppercase tracking-[0.24em] text-white/65 transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                    onClick={() => setArrOpen(true)}
                    type="button"
                  >
                    ARR
                  </button>
                </section>
              </li>
            </ol>
          )}
          </div>
      </section>
      )}

      {displayedAppView === "os" && (
        <SystemsView />
      )}
      {displayedAppView === "inventory" && <InventoryContent />}

      {displayedAppView === "storyboard" && (
        <section aria-label="Character" className="mt-4 w-full">
          <StoryboardBuilder layoutRevision={characterStatsOpen} />
        </section>
      )}

      {displayedAppView === "arc" && (
        <section aria-label="ARC" className="w-full">
          <div className="relative mb-3 w-full pl-12 [&>section]:mb-0">
            <div className="absolute left-0 top-0 h-full aspect-square overflow-hidden rounded-full border border-white/25 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Portfolio profile portrait" className="h-full w-full object-cover" src={portrait.src} />
            </div>
            <CampaignActivitySummary expanded={campaignSelected} onCampaignToggle={() => { setCampaignSelected((selected) => !selected); }} selectedCampaign={selectedCampaign} />
          </div>
          {campaignSelected ? (
            <section aria-label="Campaign details" className="mt-3 [&>*]:mt-0">
              <CampaignLeaderboardPlaceholder onSelect={setSelectedCampaign} selectedCampaign={selectedCampaign} />
            </section>
          ) : (
            <ArcStoriesContent view={arcView} onSelect={setArcView} onOpenArr={() => setArrOpen(true)} />
          )}
        </section>
      )}


      {arrOpen && (
        <div
          aria-labelledby="arr-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 sm:p-8"
          onClick={() => setArrOpen(false)}
          role="dialog"
        >
          <article
            className="max-h-[88dvh] w-full max-w-3xl overflow-hidden border border-white/40 bg-black text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <PinScrollArea className="max-h-[88dvh] p-6 sm:p-10" wrapperClassName="max-h-[88dvh]">
            <header className="flex items-start justify-between gap-8 border-b border-white/30 pb-6">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/45">
                  ARR-001 · DAY 1
                </p>
                <h2
                  className="mt-3 text-xl font-semibold uppercase tracking-[0.14em] sm:text-2xl"
                  id="arr-title"
                >
                  After Action Report
                </h2>
              </div>
              <button
                autoFocus
                className="cursor-pointer text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/60 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                onClick={() => setArrOpen(false)}
                type="button"
              >
                Close
              </button>
            </header>

            <dl className="grid gap-px border-b border-white/30 sm:grid-cols-3">
              {[
                ["Date", "09.03.2026"],
                ["Mission", "Route calibration"],
                ["Result", "Pass"],
              ].map(([label, value]) => (
                <div className="py-6 sm:pr-6" key={label}>
                  <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
                    {label}
                  </dt>
                  <dd className="mt-2 text-xs uppercase tracking-[0.14em]">{value}</dd>
                </div>
              ))}
            </dl>

            <section className="border-b border-white/30 py-7">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/50">
                Objective
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/85">
                Complete the primary getaway route in under 45 minutes while maintaining a clean line and logging each route adjustment.
              </p>
            </section>

            <section className="grid border-b border-white/30 py-7 sm:grid-cols-3 sm:gap-8">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">Target</p>
                <p className="mt-2 font-mono text-lg">00:45:00</p>
              </div>
              <div className="mt-5 sm:mt-0">
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">Actual</p>
                <p className="mt-2 font-mono text-lg">00:42:18</p>
              </div>
              <div className="mt-5 sm:mt-0">
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">Delta</p>
                <p className="mt-2 font-mono text-lg">−00:02:42</p>
              </div>
            </section>

            <div className="grid sm:grid-cols-2">
              <section className="border-b border-white/30 py-7 sm:border-r sm:pr-8">
                <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/50">
                  What worked
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  Early braking points were consistent. The alternate turn sequence reduced idle time and kept the route below target.
                </p>
              </section>
              <section className="border-b border-white/30 py-7 sm:pl-8">
                <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/50">
                  Friction
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  The second checkpoint created hesitation. Two route notes were recorded too late to use during the active run.
                </p>
              </section>
            </div>

            <section className="pt-7">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/50">
                Next action
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/85">
                Rehearse the second checkpoint three times, move route notes into the pre-run brief, and target a 41-minute clean run.
              </p>
            </section>
            </PinScrollArea>
          </article>
        </div>
      )}
      </motion.div>}
      </AnimatePresence>
    </section>
  );
}

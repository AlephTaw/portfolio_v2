"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  FiBox,
  FiCheck,
  FiChevronRight,
  FiMessageCircle,
  FiPlay,
  FiPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";
import {
  POPULATE_COMPOSER_EVENT,
  type PopulateComposerDetail,
} from "@/src/apps/collections/composerEvents";
import { uploadCollectionImage } from "@/src/apps/collections/uploadImage";
import type { CollectionItemCreate } from "@/src/apps/collections/types";
import { useTelemetry } from "@/src/apps/telemetry/useTelemetry";
import {
  ACTIVITY_FOCUS_EVENT,
  ACTIVITY_VISIBILITY_TOGGLE_EVENT,
  requestActivityNavigation,
  requestActivityTimerToggle,
} from "@/src/apps/telemetry/navigationEvents";
import { CollectionManager } from "@/src/apps/collections/CollectionManager";
import portfolioQuestContent from "@/src/apps/quests/portfolioQuestContent.generated.json";
import {
  getAdjacentItem,
  useHorizontalSwipeNavigation,
} from "@/src/hooks/useHorizontalSwipeNavigation";
import { AfterActionReports } from "./character-sheet/AfterActionReports";
import {
  CampaignDetail,
  CampaignSummary,
} from "./character-sheet/CampaignSummary";
import { lifeQuests } from "@/src/life-rpg/data";

type TerminalEntry = {
  id: number;
  role: "player" | "system";
  content: string;
  pending?: boolean;
};

type DockPanel = "inventory" | "plan" | "threads";
type PortfolioQuestSection = {
  sectionId: string;
  sectionTitle: string;
  items: Array<{ id: string; title: string; content: string }>;
};

const portfolioQuestSections = portfolioQuestContent.quests as Record<
  string,
  PortfolioQuestSection
>;

const dockDestinations = [
  "threads",
  "plan",
  "inventory",
] as const;
const inventoryModes = ["inventory", "achievements", "store"] as const;
const threadModes = ["threads", "orgs", "connections"] as const;
const activityModes = ["quests", "timeline", "kanban"] as const;
type InventoryMode = (typeof inventoryModes)[number];
type ThreadMode = (typeof threadModes)[number];
type ActivityMode = (typeof activityModes)[number];
const surrogateQuestTitles = [
  "Python",
  "SQL",
  "Probability and Statistics",
  "Algorithms",
  "ML in Practice",
  "Containerization",
  "ML Deployments",
  "Robotics",
] as const;
const emptyQuestCategories = [
  "Health",
  "Wealth",
  "Connection",
  "Sentience",
] as const;

function ComposerAttachment({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const source = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(source), [source]);
  return (
    <div className="flex max-w-44 items-center gap-2 rounded-full border border-white/35 bg-white/10 py-1 pl-1 pr-2 text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="size-6 rounded-full object-cover" src={source} />
      <span className="min-w-0 flex-1 truncate text-[0.5rem]">{file.name}</span>
      <button aria-label={`Remove ${file.name}`} className="shrink-0" onClick={onRemove} type="button">
        <FiX aria-hidden="true" className="size-3" />
      </button>
    </div>
  );
}

const gameLoopNodes = [
  ["observe", "Observe", "Read current health, money, time, quests, and recent activity."],
  ["prioritize", "Prioritize", "Select the most important current constraint or fire."],
  ["commit", "Commit", "Turn the priority into a named, measurable activity."],
  ["execute", "Execute", "Perform the activity and track focused effort."],
  ["record", "Record", "Save the result, evidence, duration, and quest progress."],
  ["review", "Review", "Compare the objective with reality in an after action report."],
  ["adapt", "Adapt", "Update the plan, next action, or strategy from what happened."],
  ["advance", "Advance", "Complete the milestone and unlock the next challenge."],
] as const;

function GameLoopGraph() {
  const [selectedNode, setSelectedNode] = useState("observe");
  const selected = gameLoopNodes.find(([id]) => id === selectedNode) ?? gameLoopNodes[0];

  return (
    <div className="w-full">
      <div aria-label="Life RPG game loop" className="flex flex-wrap items-center gap-1.5" role="tablist">
        {gameLoopNodes.map(([id, label], index) => (
          <div className="flex items-center gap-1.5" key={id}>
            <button
              aria-selected={selectedNode === id}
              className={`rounded-full border px-3 py-2 text-[0.5rem] font-semibold uppercase tracking-[0.12em] transition-colors ${selectedNode === id ? "border-black bg-black text-white" : "border-[#bdb4a8] hover:border-black"}`}
              onClick={() => setSelectedNode(id)}
              role="tab"
              type="button"
            >
              {label}
            </button>
            {index < gameLoopNodes.length - 1 ? <span aria-hidden="true" className="text-[#8a8177]">→</span> : null}
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-[#d4ccc0] pt-3">
        <p className="text-[0.5rem] font-semibold uppercase tracking-[0.16em] text-[#766b5d]">{selected[1]}</p>
        <p className="mt-1 text-xs text-[#191714]">{selected[2]}</p>
        {selectedNode === "advance" ? (
          <div className="mt-4 flex justify-start p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Life RPG campaign map in progress"
              className="max-h-[28rem] w-full max-w-[13rem] object-contain grayscale invert"
              src="/map_in_progress.svg"
            />
          </div>
        ) : null}
      </div>
      {selectedNode === "review" ? (
        <div className="mt-4 border-t border-black pt-4">
          <AfterActionReports />
        </div>
      ) : null}
    </div>
  );
}

type ThreadListItem = {
  id: string;
  kind: "conversation" | "group";
  title: string;
  preview: string;
  meta: string;
  unread?: boolean;
};

function ThreadListSection({
  items,
  label,
  onSelect,
  selectedId,
}: {
  items: ThreadListItem[];
  label: string;
  onSelect: (id: string) => void;
  selectedId: string;
}) {
  return (
    <section aria-labelledby={`thread-section-${label.toLowerCase()}`}>
      <h3
        className="mb-2 text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-[#6d6257]"
        id={`thread-section-${label.toLowerCase()}`}
      >
        {label}
      </h3>
      <ul className="divide-y divide-black/10 border-y border-black/10">
        {items.map((item) => {
          const Icon = item.kind === "group" ? FiUsers : FiMessageCircle;
          const selected = selectedId === item.id;

          return (
            <li key={item.id}>
              <button
                aria-pressed={selected}
                className={`grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 px-2 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black ${
                  selected ? "bg-black text-white" : "text-[#191714] hover:bg-black/5"
                }`}
                onClick={() => onSelect(item.id)}
                type="button"
              >
                <span
                  className={`grid size-8 place-items-center rounded-full border ${
                    selected ? "border-white/35" : "border-black/15 bg-white"
                  }`}
                >
                  <Icon aria-hidden="true" className="size-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{item.title}</span>
                    {item.unread ? (
                      <span
                        aria-label="Unread"
                        className={`size-1.5 shrink-0 rounded-full ${selected ? "bg-white" : "bg-black"}`}
                      />
                    ) : null}
                  </span>
                  <span
                    className={`mt-0.5 block truncate text-xs ${
                      selected ? "text-white/65" : "text-[#746b61]"
                    }`}
                  >
                    {item.preview}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className={`text-[0.5rem] uppercase tracking-[0.12em] ${
                      selected ? "text-white/55" : "text-[#8a8178]"
                    }`}
                  >
                    {item.meta}
                  </span>
                  <FiChevronRight aria-hidden="true" className="size-3.5" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ConnectionList({
  label = "Connections",
  items,
}: {
  label?: string;
  items: Array<{ name: string; type: string; detail: string }>;
}) {
  return (
    <section aria-labelledby="connection-list-title">
      <h3
        className="mb-2 text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-[#6d6257]"
        id="connection-list-title"
      >
        {label}
      </h3>
      <ul className="divide-y divide-black/10 border-y border-black/10">
        {items.map((item) => (
          <li
            className="flex items-center justify-between gap-4 px-2 py-4"
            key={item.name}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="mt-1 truncate text-xs text-[#746b61]">{item.detail}</p>
            </div>
            <span className="shrink-0 text-[0.5rem] uppercase tracking-[0.12em] text-[#8a8178]">
              {item.type}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GuildDetails() {
  return (
    <section className="mt-6 border-t border-black/10 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.48rem] font-semibold uppercase tracking-[0.2em] text-[#6d6257]">
            Top organization
          </p>
          <h3 className="mt-2 text-lg font-semibold uppercase tracking-[0.12em]">
            Guild
          </h3>
        </div>
        <span className="border border-black px-2 py-1 text-[0.45rem] font-semibold uppercase tracking-[0.14em]">
          Active
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["Name", "SIRL Guild"],
          ["Members", "01"],
          ["Focus", "Genesis"],
        ].map(([label, value]) => (
          <div className="border border-black/10 bg-black/[0.03] p-3" key={label}>
            <p className="text-[0.42rem] uppercase tracking-[0.14em] text-[#8a8178]">
              {label}
            </p>
            <p className="mt-2 text-[0.52rem] font-semibold uppercase tracking-[0.1em]">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyQuestCategory({
  headingId,
  title,
}: {
  headingId: string;
  title: string;
}) {
  return (
    <section aria-labelledby={headingId} className="border-b border-black/10 py-4">
      <div className="flex items-center justify-between gap-4">
        <h3
          className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#191714]"
          id={headingId}
        >
          {title}
        </h3>
        <span className="text-[0.5rem] uppercase tracking-[0.14em] text-[#8a8177]">
          0 quests
        </span>
      </div>
      <p className="mt-2 text-xs text-[#746b61]">No quests assigned.</p>
    </section>
  );
}

function SurrogateQuestList({
  description = "Active objectives and completed missions",
  headingId,
  heading = "Quests",
  onPlayQuest,
  playDisabled = false,
  presetQuests = [],
  questItems,
}: {
  description?: string;
  headingId: string;
  heading?: string;
  onPlayQuest: (questTitle: string) => void;
  playDisabled?: boolean;
  presetQuests?: readonly string[];
  questItems: ReturnType<typeof useTelemetry>["todos"];
}) {
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  const dynamicQuestNames = new Set(
    questItems.map((quest) => quest.title.trim().toLocaleLowerCase()),
  );
  const visibleQuests = [
    ...presetQuests
      .filter(
        (title) => !dynamicQuestNames.has(title.trim().toLocaleLowerCase()),
      )
      .map((title, index) => ({
        completed: false,
        createdAt: null,
        details: {} as Record<string, string>,
        id: `surrogate-preset-quest-${index}`,
        title,
        workspace: "quests" as const,
      })),
    ...questItems,
  ];

  return (
    <section aria-labelledby={headingId} className="py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3
            className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#191714]"
            id={headingId}
          >
            {heading}
          </h3>
          <p className="mt-1 text-[0.5rem] uppercase tracking-[0.14em] text-[#746b61]">
            {description}
          </p>
        </div>
        <span className="text-[0.5rem] uppercase tracking-[0.14em] text-[#8a8177]">
          {visibleQuests.filter((quest) => !quest.completed).length} active
        </span>
      </div>
      {visibleQuests.length ? (
        <div className="mt-4 grid gap-3">
          {visibleQuests.map((quest) => {
            const expanded = expandedQuestId === quest.id;
            const detailsId = `${headingId}-${quest.id}-details`;
            const recordedDetails = Object.entries(quest.details).filter(
              ([, value]) => value.trim(),
            );
            const portfolioDetails = portfolioQuestSections[quest.title];

            return (
              <article
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-black/15 bg-black/[0.025] p-4"
                key={quest.id}
              >
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${quest.completed ? "bg-[#bdb4a8]" : "bg-black"}`}
              />
              <div className="min-w-0">
                <p
                  className={`truncate text-sm ${quest.completed ? "text-[#8a8177] line-through" : "text-[#191714]"}`}
                >
                  {quest.title}
                </p>
                {quest.details.objective ? (
                  <p className="mt-1 truncate text-xs text-[#746b61]">
                    {quest.details.objective}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-controls={detailsId}
                  aria-expanded={expanded}
                  aria-label={`${expanded ? "Collapse" : "Explore"} ${quest.title} quest`}
                  className={`h-7 rounded-full border border-black px-3 text-[0.5rem] font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                    expanded
                      ? "bg-black text-background"
                      : "text-black hover:bg-black hover:text-background"
                  }`}
                  onClick={() =>
                    setExpandedQuestId((current) =>
                      current === quest.id ? null : quest.id,
                    )
                  }
                  title={expanded ? "Collapse quest details" : "Explore quest"}
                  type="button"
                >
                  Explore
                </button>
                <button
                  aria-label={`Play ${quest.title} quest`}
                  className="grid size-7 place-items-center rounded-full border border-black text-black transition-colors hover:bg-black hover:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-black/25 disabled:text-black/25 disabled:hover:bg-transparent"
                  disabled={playDisabled}
                  onClick={() => onPlayQuest(quest.title)}
                  title={playDisabled ? "Complete the current activity first" : "Play quest"}
                  type="button"
                >
                  <FiPlay aria-hidden="true" className="size-3 fill-current" />
                </button>
              </div>
              {expanded ? (
                <section
                  aria-label={`${quest.title} details`}
                  className="col-span-3 mt-2 bg-background/70 p-4"
                  id={detailsId}
                >
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-[0.44rem] font-semibold uppercase tracking-[0.14em] text-[#8a8177]">
                        Status
                      </dt>
                      <dd className="mt-1 text-xs text-[#191714]">
                        {quest.completed ? "Completed" : "Active"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.44rem] font-semibold uppercase tracking-[0.14em] text-[#8a8177]">
                        Source
                      </dt>
                      <dd className="mt-1 text-xs text-[#191714]">
                        {quest.createdAt === null ? "Surrogate" : "Telemetry"}
                      </dd>
                    </div>
                    {recordedDetails.map(([label, value]) => (
                      <div className="sm:col-span-2" key={label}>
                        <dt className="text-[0.44rem] font-semibold uppercase tracking-[0.14em] text-[#8a8177]">
                          {label.replaceAll("_", " ")}
                        </dt>
                        <dd className="mt-1 text-xs leading-5 text-[#191714]">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {portfolioDetails?.items.length ? (
                    <div className="mt-5 grid gap-5 border-t border-black/10 pt-5 sm:grid-cols-[minmax(9rem,0.35fr)_minmax(0,1fr)]">
                      <nav
                        aria-label={`${portfolioDetails.sectionTitle} table of contents`}
                      >
                        <p className="text-[0.44rem] font-semibold uppercase tracking-[0.14em] text-[#8a8177]">
                          Contents
                        </p>
                        <ol className="mt-3 grid gap-2 border-l border-black/15 pl-3">
                          {portfolioDetails.items.map((item, index) => (
                            <li key={item.id}>
                              <a
                                className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-1 text-[0.52rem] leading-4 text-[#514a43] transition-colors hover:text-black focus:outline-none focus-visible:underline"
                                href={`#${detailsId}-${item.id}`}
                              >
                                <span className="text-[#9a9085]">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <span>{item.title}</span>
                              </a>
                            </li>
                          ))}
                        </ol>
                      </nav>
                      <div className="min-w-0">
                        <p className="text-[0.44rem] font-semibold uppercase tracking-[0.14em] text-[#8a8177]">
                          {portfolioDetails.sectionTitle}
                        </p>
                        <div className="mt-3 divide-y divide-black/10 border-y border-black/10">
                          {portfolioDetails.items.map((item) => (
                            <article
                              className="scroll-mt-6 py-4"
                              id={`${detailsId}-${item.id}`}
                              key={item.id}
                            >
                              <h4 className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#191714]">
                                {item.title}
                              </h4>
                              <p className="mt-2 whitespace-pre-line text-xs leading-5 text-[#61584f]">
                                {item.content}
                              </p>
                            </article>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {!recordedDetails.length && !portfolioDetails?.items.length ? (
                    <p className="mt-3 text-xs leading-5 text-[#746b61]">
                      No matching portfolio section or additional quest details
                      have been published yet.
                    </p>
                  ) : null}
                </section>
              ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 border border-dashed border-[#bdb4a8] px-4 py-10 text-center text-xs text-[#7f7468]">
          Quests added through Telemetry will appear here.
        </p>
      )}
    </section>
  );
}

export function QuestCatalog({
  onPlayQuest,
  playDisabled = false,
  questItems,
}: {
  onPlayQuest: (questTitle: string) => void;
  playDisabled?: boolean;
  questItems: ReturnType<typeof useTelemetry>["todos"];
}) {
  return (
    <div>
      {emptyQuestCategories.map((category) => (
        <EmptyQuestCategory
          headingId={`activity-${category.toLowerCase()}-quests-heading`}
          key={category}
          title={category}
        />
      ))}
      <SurrogateQuestList
        description="Technical curriculum and skill-building quests"
        heading="Competence"
        headingId="activity-competence-quests-heading"
        onPlayQuest={onPlayQuest}
        playDisabled={playDisabled}
        presetQuests={surrogateQuestTitles}
        questItems={questItems}
      />
      <section aria-labelledby="activity-experience-quests-heading" className="py-4">
        <div className="flex items-center justify-between gap-4">
          <h3
            className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#191714]"
            id="activity-experience-quests-heading"
          >
            Experience
          </h3>
          <span className="text-[0.5rem] uppercase tracking-[0.14em] text-[#8a8177]">
            {lifeQuests.length} quests
          </span>
        </div>
        <CampaignDetail embedded mode="quests" />
      </section>
    </div>
  );
}

function DockUtilityPanel({
  entries,
  inventoryMode,
  onInventoryModeChange,
  onThreadModeChange,
  panel,
  threadMode,
}: {
  entries: TerminalEntry[];
  inventoryMode: InventoryMode;
  onInventoryModeChange: (mode: InventoryMode) => void;
  onThreadModeChange: (mode: ThreadMode) => void;
  panel: DockPanel;
  threadMode: ThreadMode;
}) {
  const isInventory = panel === "inventory";
  const isThreads = panel === "threads";
  const [planViewMode, setPlanViewMode] = useState<"view" | "edit">("edit");
  const [selectedThreadId, setSelectedThreadId] = useState("conversation-current");
  const navigateModal = useCallback(
    (direction: -1 | 1) => {
      if (isInventory) {
        const next = getAdjacentItem(inventoryModes, inventoryMode, direction);
        if (next) onInventoryModeChange(next);
        return;
      }
      if (isThreads) {
        const next = getAdjacentItem(threadModes, threadMode, direction);
        if (next) onThreadModeChange(next);
        return;
      }
      return;
    },
    [
      inventoryMode,
      isInventory,
      isThreads,
      onInventoryModeChange,
      onThreadModeChange,
      threadMode,
    ],
  );
  const modalSwipeHandlers = useHorizontalSwipeNavigation(navigateModal);
  const firstPlayerEntry = entries.find((entry) => entry.role === "player");
  const latestEntry = entries.at(-1);
  const conversationItems: ThreadListItem[] = [
    {
      id: "conversation-current",
      kind: "conversation",
      title: firstPlayerEntry?.content || "New conversation",
      preview: latestEntry
        ? latestEntry.pending
          ? "System is responding…"
          : latestEntry.content
        : "Start a conversation from the terminal.",
      meta: "Now",
    },
    {
      id: "conversation-interview",
      kind: "conversation",
      title: "Interview preparation",
      preview: "SQL, Python, algorithms, and machine learning",
      meta: "Today",
      unread: true,
    },
    {
      id: "conversation-portfolio",
      kind: "conversation",
      title: "Portfolio review",
      preview: "Presentation, project narrative, and final polish",
      meta: "Sun",
    },
  ];
  const groupItems: ThreadListItem[] = [
    {
      id: "group-ml-study",
      kind: "group",
      title: "Machine learning study group",
      preview: "4 members · Models, evaluation, and MLOps",
      meta: "4 new",
      unread: true,
    },
    {
      id: "group-projects",
      kind: "group",
      title: "Project collaborators",
      preview: "3 members · Portfolio and deployment feedback",
      meta: "Fri",
    },
  ];
  const connectionItems = [
    { name: "SIRL Guild", type: "Guild", detail: "Primary organization" },
    { name: "The Crucible", type: "Campaign", detail: "Active campaign" },
    { name: "Worldline", type: "Evidence", detail: "Activity and history" },
  ];
  const orgItems = [
    { name: "SIRL Guild", type: "Guild", detail: "Primary organization" },
    { name: "ML Study Group", type: "Collective", detail: "Models, evaluation, and MLOps" },
    { name: "Project Collaborators", type: "Network", detail: "Portfolio and deployment feedback" },
  ];
  const activeTabTitle = isInventory
    ? inventoryMode
    : isThreads
      ? threadMode
      : "Game Loop";

  return (
    <section
      aria-label={
        isInventory
          ? "Current inventory"
          : isThreads
            ? threadMode === "threads"
              ? "Current threads"
              : threadMode === "orgs"
                ? "Current organizations"
                : "Current connections"
            : "Current plan"
      }
      aria-modal="false"
      className="composer-rail-modal fixed z-[10004] flex -translate-x-1/2 touch-pan-y flex-col border border-black/15 bg-background px-8 py-5 text-[#191714] sm:px-10"
      role="dialog"
      {...modalSwipeHandlers}
    >
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#191714]">
            {activeTabTitle}
          </h2>
          {panel !== "plan" ? (
            <p className="mt-1 text-[0.52rem] uppercase tracking-[0.16em] text-[#746b61]">
              {isInventory
                ? inventoryMode === "inventory"
                  ? "Current items"
                  : inventoryMode === "achievements"
                    ? "Earned and in-progress achievements"
                    : "Available items"
                : threadMode === "threads"
                  ? "Conversations and groups"
                  : threadMode === "orgs"
                    ? "Guilds and groups"
                    : "Linked organizations and systems"}
            </p>
          ) : null}
        </div>
        {panel !== "plan" && !isInventory ? (
          <p className="text-[0.52rem] uppercase tracking-[0.16em] text-[#746b61]">
            {threadMode === "threads"
                ? `${conversationItems.length} conversations · ${groupItems.length} groups`
                : threadMode === "orgs"
                  ? `${orgItems.length} organizations`
                  : `${connectionItems.length} connections`}
          </p>
        ) : null}
      </header>

      <div
        className="pane-scroll mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain"
        data-lenis-prevent
      >
        {isInventory ? (
          <CollectionManager collection={inventoryMode} />
        ) : isThreads ? (threadMode === "threads" ? (
          <div className="grid gap-6">
            <ThreadListSection
              items={conversationItems}
              label="Conversations"
              onSelect={setSelectedThreadId}
              selectedId={selectedThreadId}
            />
            <ThreadListSection
              items={groupItems}
              label="Groups"
              onSelect={setSelectedThreadId}
              selectedId={selectedThreadId}
            />
          </div>
        ) : threadMode === "orgs" ? (
          <>
            <ConnectionList items={orgItems} label="Organizations" />
            <GuildDetails />
          </>
        ) : (
          <ConnectionList items={connectionItems} />
        )) : (
            <div>
              <GameLoopGraph />
              <section
                aria-labelledby="surrogate-game-loop-plan-heading"
                className="mt-10"
              >
                <header className="mb-5 flex items-center justify-between gap-4">
                  <h2
                    className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#191714]"
                    id="surrogate-game-loop-plan-heading"
                  >
                    Plan
                  </h2>
                  <div
                    aria-label="Plan display mode"
                    className="flex shrink-0 items-center gap-1 rounded-full border border-black p-0.5"
                    role="group"
                  >
                    {(["view", "edit"] as const).map((mode) => (
                      <button
                        aria-pressed={planViewMode === mode}
                        className={`rounded-full px-3 py-1 text-[0.48rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                          planViewMode === mode
                            ? "bg-black text-background"
                            : "text-[#514a43] hover:bg-black/10"
                        }`}
                        key={mode}
                        onClick={() => setPlanViewMode(mode)}
                        type="button"
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </header>
                {planViewMode === "view" ? (
                  <CampaignDetail mode="plan" />
                ) : (
                  <div className="flex min-h-[24rem] items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Plan map placeholder"
                      className="max-h-full w-full max-w-[61.9375rem] object-contain"
                      src="/map.svg"
                    />
                  </div>
                )}
              </section>
              <section
                aria-labelledby="surrogate-game-loop-campaign-heading"
                className="mt-10"
              >
                <header className="mb-5">
                  <h2
                    className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#191714]"
                    id="surrogate-game-loop-campaign-heading"
                  >
                    Telemetry
                  </h2>
                </header>
                <div className="[&>:first-child]:!mt-0">
                  <CampaignSummary
                    showWorkspacePlaceholders
                    workspaceLayout="campaign"
                  />
                </div>
              </section>
            </div>
          )}
      </div>
    </section>
  );
}

export function ComposerDock() {
  const pathname = usePathname();
  const {
    activeTimer,
    activeWorkspace,
    isOpen: telemetryOpen,
    setTelemetryView,
    setWorkspaceFilter,
    telemetryView,
    toggle: toggleTelemetry,
  } = useTelemetry();
  const dockRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const entryIdRef = useRef(0);
  const [activeDockPanel, setActiveDockPanel] = useState<DockPanel | null>(null);
  const [inventoryMode, setInventoryMode] = useState<InventoryMode>("inventory");
  const [threadMode, setThreadMode] = useState<ThreadMode>("threads");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [pendingCollectionAction, setPendingCollectionAction] = useState<
    CollectionItemCreate | null
  >(null);
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const compactActivityBanner = useCallback(() => {
    if (!telemetryOpen) return;
    if (telemetryView !== null) setTelemetryView(null);
    if (activeWorkspace !== null) setWorkspaceFilter(null);
  }, [activeWorkspace, setTelemetryView, setWorkspaceFilter, telemetryOpen, telemetryView]);
  const navigateDock = useCallback(
    (direction: -1 | 1) => {
      const destination = getAdjacentItem(
        dockDestinations,
        activeDockPanel ?? undefined,
        direction,
      );
      if (!destination || destination === activeDockPanel) return;

      compactActivityBanner();
      setActiveDockPanel(destination);
    },
    [activeDockPanel, compactActivityBanner],
  );
  const dockSwipeHandlers = useHorizontalSwipeNavigation(navigateDock);
  const kanbanSelected =
    telemetryView === "all" ||
    telemetryView === "todo" ||
    telemetryView === "current" ||
    telemetryView === "completed";
  const activeActivityMode: ActivityMode | undefined =
    activeWorkspace === "quests" && telemetryView === null
      ? "quests"
      : telemetryView === "timeline"
        ? "timeline"
        : kanbanSelected
          ? "kanban"
          : undefined;
  const selectActivityMode = useCallback(
    (mode: ActivityMode) => {
      requestActivityNavigation(mode);
    },
    [],
  );
  const navigateModalTabs = useCallback(
    (direction: -1 | 1) => {
      if (activeDockPanel === "inventory") {
        const next = getAdjacentItem(inventoryModes, inventoryMode, direction);
        if (next) setInventoryMode(next);
        return;
      }
      if (activeDockPanel === "threads") {
        const next = getAdjacentItem(threadModes, threadMode, direction);
        if (next) setThreadMode(next);
        return;
      }
      if (activeDockPanel === "plan") {
        return;
      }
      if (telemetryOpen) {
        const next = getAdjacentItem(
          activityModes,
          activeActivityMode,
          direction,
        );
        if (next) selectActivityMode(next);
      }
    },
    [
      activeActivityMode,
      activeDockPanel,
      inventoryMode,
      selectActivityMode,
      telemetryOpen,
      threadMode,
    ],
  );
  const modalTabsSwipeHandlers = useHorizontalSwipeNavigation(navigateModalTabs);

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    let updateFrame = 0;
    let lastActivityModalMaxHeight = "";
    let lastOffset = "";
    let lastWidth = "";

    const updateDockOffset = () => {
      window.cancelAnimationFrame(updateFrame);
      updateFrame = window.requestAnimationFrame(() => {
        const bounds = dock.getBoundingClientRect();
        const activityModalMaxHeight = `${Math.round(bounds.top * 0.75 * 100) / 100}px`;
        const offset = `${Math.round((window.innerHeight - bounds.top) * 100) / 100}px`;
        const width = `${Math.round(bounds.width * 100) / 100}px`;

        if (activityModalMaxHeight !== lastActivityModalMaxHeight) {
          document.documentElement.style.setProperty(
            "--activity-modal-max-height",
            activityModalMaxHeight,
          );
          lastActivityModalMaxHeight = activityModalMaxHeight;
        }
        if (offset !== lastOffset) {
          document.documentElement.style.setProperty("--composer-dock-offset", offset);
          lastOffset = offset;
        }
        if (width !== lastWidth) {
          document.documentElement.style.setProperty("--composer-dock-width", width);
          lastWidth = width;
        }
      });
    };

    const observer = new ResizeObserver(updateDockOffset);
    observer.observe(dock);
    window.addEventListener("resize", updateDockOffset);
    updateDockOffset();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateDockOffset);
      window.cancelAnimationFrame(updateFrame);
      document.documentElement.style.removeProperty("--activity-modal-max-height");
      document.documentElement.style.removeProperty("--composer-dock-offset");
      document.documentElement.style.removeProperty("--composer-dock-width");
    };
  }, []);

  useEffect(() => {
    function populateComposer(event: Event) {
      const { action, files, prompt } = (event as CustomEvent<PopulateComposerDetail>).detail;
      setActiveDockPanel(null);
      setMessage(prompt);
      setAttachments(files);
      setPendingCollectionAction(action.payload);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
    window.addEventListener(POPULATE_COMPOSER_EVENT, populateComposer);
    return () => window.removeEventListener(POPULATE_COMPOSER_EVENT, populateComposer);
  }, []);

  useEffect(() => {
    const toggleActivityVisibility = () => {
      toggleTelemetry();
    };
    window.addEventListener(
      ACTIVITY_VISIBILITY_TOGGLE_EVENT,
      toggleActivityVisibility,
    );
    return () =>
      window.removeEventListener(
        ACTIVITY_VISIBILITY_TOGGLE_EVENT,
        toggleActivityVisibility,
      );
  }, [toggleTelemetry]);

  useEffect(() => {
    const focusActivity = () => setActiveDockPanel(null);
    window.addEventListener(ACTIVITY_FOCUS_EVENT, focusActivity);
    return () => window.removeEventListener(ACTIVITY_FOCUS_EVENT, focusActivity);
  }, []);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (transcript) transcript.scrollTop = transcript.scrollHeight;
  }, [entries]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = message.trim();
    if (!prompt) return;

    const submittedAttachments = attachments;
    const submittedCollectionAction = pendingCollectionAction;
    setMessage("");
    setAttachments([]);
    setPendingCollectionAction(null);
    window.requestAnimationFrame(() => inputRef.current?.focus());
    entryIdRef.current += 1;
    const playerEntryId = entryIdRef.current;
    entryIdRef.current += 1;
    const systemEntryId = entryIdRef.current;
    setEntries((current) => [
      ...current,
      { id: playerEntryId, role: "player", content: prompt },
      { id: systemEntryId, role: "system", content: "", pending: true },
    ]);

    try {
      const uploads = submittedAttachments.length
        ? await Promise.all(submittedAttachments.map(uploadCollectionImage))
        : [];
      let createdRecord: { id: string; name: string } | null = null;
      if (submittedCollectionAction) {
        const collectionResponse = await fetch("/api/game/items", {
          body: JSON.stringify({
            ...submittedCollectionAction,
            image_url: uploads[1]?.url || uploads[0]?.url || null,
            thumbnail_url: uploads[0]?.url || null,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const collectionPayload = (await collectionResponse.json().catch(() => null)) as
          | { detail?: string; id?: string; name?: string }
          | null;
        if (!collectionResponse.ok || !collectionPayload?.id) {
          throw new Error(collectionPayload?.detail || "Unable to create collection item");
        }
        createdRecord = {
          id: collectionPayload.id,
          name: collectionPayload.name || submittedCollectionAction.name,
        };
      }
      const executionMetadata = {
        created_record: createdRecord,
        uploaded_images: uploads.map(({ content_type, original_name, size, url }) => ({
          content_type,
          original_name,
          size,
          url,
        })),
      };
      const requestPrompt = uploads.length || createdRecord
        ? `${prompt}\n\nAction result: ${JSON.stringify(
            executionMetadata,
          )}`
        : prompt;
      const result = await fetch("/api/mock-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: requestPrompt }),
      });
      const payload = (await result.json()) as { content?: string; error?: string };
      if (!result.ok || !payload.content) {
        throw new Error(payload.error || "The mock LLM request failed.");
      }
      setEntries((current) =>
        current.map((entry) =>
          entry.id === systemEntryId
            ? { ...entry, content: payload.content as string, pending: false }
            : entry,
        ),
      );
    } catch (requestError) {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === systemEntryId
            ? {
                ...entry,
                content:
                  requestError instanceof Error
                    ? requestError.message
                    : "The mock LLM request failed.",
                pending: false,
              }
            : entry,
        ),
      );
    }
  }

  function toggleDockPanel(panel: DockPanel) {
    compactActivityBanner();
    setActiveDockPanel((current) => (current === panel ? null : panel));
  }

  const activeModalTabs = activeDockPanel === "inventory"
      ? inventoryModes.map((mode) => ({
          id: mode,
          label: mode,
          onSelect: () => setInventoryMode(mode),
          selected: inventoryMode === mode,
        }))
      : activeDockPanel === "threads"
        ? threadModes.map((mode) => ({
            id: mode,
            label: mode,
            onSelect: () => setThreadMode(mode),
            selected: threadMode === mode,
          }))
      : activeDockPanel === "plan"
        ? []
        : telemetryOpen
          ? activityModes.map((mode) => ({
              id: mode,
              label:
                mode === "quests"
                  ? "Quests"
                  : mode === "timeline"
                    ? "Timelines"
                    : "Kanban",
              onSelect: () => selectActivityMode(mode),
              selected: activeActivityMode === mode,
            }))
          : [];

  return (
    <>
      {activeDockPanel
        ? createPortal(
            <DockUtilityPanel
              entries={entries}
              inventoryMode={inventoryMode}
              onInventoryModeChange={setInventoryMode}
              onThreadModeChange={setThreadMode}
              panel={activeDockPanel}
              threadMode={threadMode}
            />,
            document.body,
          )
        : null}
      <section
        aria-label="Agent composer"
        className="fixed inset-x-0 bottom-0 z-[10002] mx-auto flex w-full max-w-5xl flex-col bg-black px-4 pb-3 pt-2 sm:px-5 lg:rounded-t-2xl xl:bottom-2 xl:rounded-2xl"
        ref={dockRef}
      >
      {attachments.length ? (
        <div aria-label="Attached images" className="mb-2 flex flex-wrap gap-1.5">
          {attachments.map((file, index) => (
            <ComposerAttachment
              file={file}
              key={`${file.name}-${file.lastModified}-${index}`}
              onRemove={() => setAttachments((current) => {
                const next = current.filter((_, itemIndex) => itemIndex !== index);
                if (!next.length) setPendingCollectionAction(null);
                return next;
              })}
            />
          ))}
        </div>
      ) : null}

      {activeModalTabs.length ? (
        <div
          aria-label="Active modal navigation"
          className="mb-2 flex min-h-7 min-w-0 touch-pan-y flex-wrap items-center justify-center gap-1.5 text-white"
          role="group"
          {...modalTabsSwipeHandlers}
        >
          {activeModalTabs.map((tab) => (
            <button
              aria-pressed={tab.selected}
              className={`shrink-0 rounded-full border px-3 py-1 text-[0.48rem] font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                tab.selected
                  ? "border-white bg-white text-black"
                  : "border-white/40 text-white hover:border-white hover:bg-white/10"
              }`}
              key={tab.id}
              onClick={tab.onSelect}
              type="button"
            >
              {tab.label}
            </button>
          ))}
          {telemetryOpen && !activeDockPanel ? (
            <button
              aria-label={activeTimer ? "Complete current activity" : "Start activity timer"}
              className="grid size-7 shrink-0 place-items-center rounded-full border border-white text-white transition-colors hover:bg-white hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
              onClick={requestActivityTimerToggle}
              title={activeTimer ? "Complete activity" : "Start timer"}
              type="button"
            >
              {activeTimer ? (
                <FiCheck aria-hidden="true" className="size-3.5" />
              ) : (
                <FiPlay aria-hidden="true" className="size-3 fill-current" />
              )}
            </button>
          ) : null}
        </div>
      ) : null}

      <form
        className="relative mb-2 flex min-h-12 items-center rounded-2xl border border-[#d8d0c1] bg-white px-10 shadow-[0_4px_4px_rgba(25,23,20,0.08)]"
        onSubmit={submitMessage}
      >
        <button
          aria-label="Add to composer"
          className="absolute left-3 grid size-5 place-items-center rounded-full border border-black bg-white text-black"
          onClick={() => imageInputRef.current?.click()}
          type="button"
        >
          <FiPlus aria-hidden="true" className="size-3.5" />
        </button>
        <input
          accept="image/gif,image/jpeg,image/png,image/webp"
          className="sr-only"
          multiple
          onChange={(event) => {
            const selectedFiles = Array.from(event.target.files || []);
            setAttachments((current) => [...current, ...selectedFiles]);
            setPendingCollectionAction(null);
            event.target.value = "";
          }}
          ref={imageInputRef}
          type="file"
        />
        <input
          aria-label="Agent message"
          className="h-8 min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-[#8D7A70]"
          onChange={(event) => setMessage(event.target.value)}
          placeholder=""
          ref={inputRef}
          type="text"
          value={message}
        />
        <button
          aria-label="Submit message"
          className="absolute right-3 grid size-6 place-items-center rounded-full border border-black bg-white text-black disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!message.trim()}
          type="submit"
        >
          <span
            aria-hidden="true"
            className="block h-3 w-[18px] bg-current [mask-image:url('/icons/sirl-logo.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/icons/sirl-logo.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]"
          />
        </button>
      </form>

      <div
        aria-label="Agent dock"
        className="flex min-h-8 min-w-0 touch-pan-y items-start justify-center overflow-x-hidden text-white"
        role="toolbar"
        {...dockSwipeHandlers}
      >
        <div
          className="flex shrink-0 items-center justify-center gap-1.5"
        >
          <button
            aria-label="Chat"
            aria-pressed={activeDockPanel === "threads"}
            className={`grid h-7 w-12 place-items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
              activeDockPanel === "threads"
                ? "border-white bg-white text-black"
                : "border-transparent text-white hover:border-white/50 hover:bg-white/10"
            }`}
            onClick={() => toggleDockPanel("threads")}
            title="Chat"
            type="button"
          >
            <FiMessageCircle aria-hidden="true" className="size-[1.05rem]" />
          </button>
          <button
            aria-label="Plan"
            aria-pressed={activeDockPanel === "plan"}
            className={`grid h-7 w-12 place-items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
              activeDockPanel === "plan"
                ? "border-white bg-white text-black"
                : "border-transparent text-white hover:border-white/50 hover:bg-white/10"
            }`}
            onClick={() => toggleDockPanel("plan")}
            title="Surrogate"
            type="button"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              aria-hidden="true"
              className={`h-6 w-[7px] ${activeDockPanel === "plan" ? "invert" : ""}`}
              src="/plan.svg"
            />
          </button>
          <button
            aria-label="Inventory"
            aria-pressed={activeDockPanel === "inventory"}
            className={`grid h-7 w-12 place-items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
              activeDockPanel === "inventory"
                ? "border-white bg-white text-black"
                : "border-transparent text-white hover:border-white/50 hover:bg-white/10"
            }`}
            onClick={() => toggleDockPanel("inventory")}
            title="Inventory"
            type="button"
          >
            <FiBox aria-hidden="true" className="size-[1.05rem]" />
          </button>
        </div>
      </div>

      {pathname === "/" && entries.length ? (
        <div
          aria-live="polite"
          className="pane-scroll fixed left-1/2 bottom-[calc(var(--composer-dock-offset,6.5rem)+1rem)] z-10 grid max-h-[calc(100dvh-var(--composer-dock-offset,6.5rem)-2rem)] w-full max-w-5xl -translate-x-1/2 gap-3 overflow-y-auto overscroll-contain px-8 py-3 text-sm text-[#191714] touch-pan-y sm:px-10"
          data-lenis-prevent
          ref={transcriptRef}
          role="log"
        >
          {entries.map((entry) => (
            <div
              className={`flex ${entry.role === "player" ? "justify-end" : "justify-start"}`}
              key={entry.id}
            >
              <div className={`max-w-[82%] ${entry.role === "player" ? "text-right" : "text-left"}`}>
                <p className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-[#7f7f7f]">
                  {entry.role === "player" ? "Player" : "System"}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#191714]">
                  {entry.pending ? "…" : entry.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      </section>
    </>
  );
}

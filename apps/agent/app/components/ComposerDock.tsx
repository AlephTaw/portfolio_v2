"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  FiBox,
  FiChevronRight,
  FiMessageCircle,
  FiPlus,
  FiUsers,
} from "react-icons/fi";
import { useTelemetry } from "@/src/apps/telemetry/useTelemetry";
import {
  inventoryCategories,
  taskWorkspaces,
  type InventoryCategory,
  type TodoItem,
} from "@/src/apps/telemetry/types";
import { Achievements } from "./character-sheet/Achievements";
import { AfterActionReports } from "./character-sheet/AfterActionReports";

type TerminalEntry = {
  id: number;
  role: "player" | "system";
  content: string;
  pending?: boolean;
};

type DockPanel = "inventory" | "plan" | "threads";

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

function InventorySlot({ item }: { item?: TodoItem }) {
  if (!item) {
    return (
      <div aria-hidden="true" className="flex min-w-0 justify-center">
        <div className="size-12 rounded-sm border border-[#e5e5e5] bg-background" />
      </div>
    );
  }

  return (
    <article
      className="group flex min-w-0 flex-col items-center text-center"
      title={item.details.condition || item.title}
    >
      <div
        className={`relative flex size-12 items-center justify-center rounded-sm border transition-colors group-hover:border-[#686057] ${
          item.completed
            ? "border-[#e5e5e5] bg-[#eeeae3] text-[#92887e]"
            : "border-[#d8d8d8] bg-background text-[#3f3f3f]"
        }`}
      >
        <FiBox aria-hidden="true" className="size-5" />
        {item.details.quantity ? (
          <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#3f3f3f] px-1 text-[0.42rem] font-semibold leading-none text-white">
            {item.details.quantity}
          </span>
        ) : null}
      </div>
      <p
        className={`mt-1 max-w-full truncate text-[0.5rem] leading-3 ${
          item.completed
            ? "text-[#92887e] line-through"
            : "text-[#3f3f3f]"
        }`}
      >
        {item.title}
      </p>
    </article>
  );
}

function InventorySlotGrid({
  items,
  minimumDesktopSlots,
  minimumMobileSlots,
}: {
  items: TodoItem[];
  minimumDesktopSlots: number;
  minimumMobileSlots: number;
}) {
  const desktopSlotCount = Math.max(
    minimumDesktopSlots,
    Math.ceil(items.length / 8) * 8,
  );
  const mobileSlotCount = Math.max(
    minimumMobileSlots,
    Math.ceil(items.length / 4) * 4,
  );
  const emptySlotCount = desktopSlotCount - items.length;
  const mobileHiddenSlotCount = desktopSlotCount - mobileSlotCount;

  return (
    <div className="grid grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-8">
      {items.map((item) => (
        <InventorySlot item={item} key={item.id} />
      ))}
      {Array.from({ length: emptySlotCount }, (_, index) => (
        <div
          className={index >= emptySlotCount - mobileHiddenSlotCount ? "hidden sm:block" : "block"}
          key={`empty-inventory-slot-${index}`}
        >
          <InventorySlot />
        </div>
      ))}
    </div>
  );
}

function DockUtilityPanel({
  entries,
  inventoryItems,
  panel,
  questItems,
}: {
  entries: TerminalEntry[];
  inventoryItems: ReturnType<typeof useTelemetry>["todos"];
  panel: DockPanel;
  questItems: ReturnType<typeof useTelemetry>["todos"];
}) {
  const isInventory = panel === "inventory";
  const isThreads = panel === "threads";
  const [inventoryMode, setInventoryMode] = useState<
    "inventory" | "achievements" | "store"
  >("inventory");
  const [threadMode, setThreadMode] = useState<
    "threads" | "orgs" | "connections"
  >("threads");
  const [planMode, setPlanMode] = useState<"plan" | "game-loop" | "quests">("plan");
  const [inventoryCategory, setInventoryCategory] = useState<
    "all" | InventoryCategory
  >("all");
  const [selectedThreadId, setSelectedThreadId] = useState("conversation-current");
  const inventorySourceItems =
    inventoryMode === "inventory" ? inventoryItems : [];
  const visibleInventoryItems =
    inventoryCategory === "all"
      ? inventorySourceItems
      : inventorySourceItems.filter(
          (item) => item.details.category === inventoryCategory,
        );
  const uncategorizedInventoryItems = inventorySourceItems.filter(
    (item) => !inventoryCategories.includes(item.details.category as InventoryCategory),
  );
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
      className="fixed bottom-[var(--composer-dock-offset,6.5rem)] left-1/2 z-[10002] flex h-[var(--composer-utility-panel-height,75dvh)] w-[var(--composer-dock-width,100vw)] max-w-5xl -translate-x-1/2 flex-col border-t border-black/15 bg-background px-8 py-5 text-[#191714] sm:px-10"
      role="dialog"
    >
      <header className="flex shrink-0 items-end justify-between gap-4">
        <div>
          {isInventory ? (
            <div
              aria-label="Inventory mode"
              className="flex items-center gap-1"
              role="group"
            >
              {(["inventory", "achievements", "store"] as const).map((mode) => (
                <button
                  aria-pressed={inventoryMode === mode}
                  className={`rounded-full border px-3 py-1 text-[0.48rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    inventoryMode === mode
                      ? "border-black bg-black text-background"
                      : "border-transparent text-[#514a43] hover:bg-black/10"
                  }`}
                  key={mode}
                  onClick={() => setInventoryMode(mode)}
                  type="button"
                >
                  {mode}
                </button>
              ))}
            </div>
          ) : isThreads ? (
            <div
              aria-label="Chat mode"
              className="flex items-center gap-1"
              role="group"
            >
              {(["threads", "orgs", "connections"] as const).map((mode) => (
                <button
                  aria-pressed={threadMode === mode}
                  className={`rounded-full border px-3 py-1 text-[0.48rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    threadMode === mode
                      ? "border-black bg-black text-background"
                      : "border-transparent text-[#514a43] hover:bg-black/10"
                  }`}
                  key={mode}
                  onClick={() => setThreadMode(mode)}
                  type="button"
                >
                  {mode}
                </button>
              ))}
            </div>
          ) : (
            <div
              aria-label="Surrogate mode"
              className="flex items-center gap-1"
              role="group"
            >
              {(["game-loop", "plan", "quests"] as const).map((mode) => (
                <button
                  aria-pressed={planMode === mode}
                  className={`rounded-full border px-3 py-1 text-[0.48rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    planMode === mode
                      ? "border-black bg-black text-background"
                      : "border-transparent text-[#514a43] hover:bg-black/10"
                  }`}
                  key={mode}
                  onClick={() => setPlanMode(mode)}
                  type="button"
                >
                  {mode === "game-loop" ? "GAME LOOP" : mode.toUpperCase()}
                </button>
              ))}
            </div>
          )}
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
        {panel !== "plan" ? (
          <p className="text-[0.52rem] uppercase tracking-[0.16em] text-[#746b61]">
            {isInventory
              ? inventoryMode === "achievements"
                ? "4 achievements"
                : `${inventorySourceItems.length} ${inventorySourceItems.length === 1 ? "item" : "items"}`
              : threadMode === "threads"
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
        {isInventory ? inventoryMode === "inventory" ? (
          <div className="bg-background px-3 py-2">
            <div
              aria-label="Inventory categories"
              className="mb-4 flex flex-wrap gap-1.5"
              role="group"
            >
              {(["all", ...inventoryCategories] as const).map((category) => (
                <button
                  aria-pressed={inventoryCategory === category}
                  className={`rounded-full border px-3 py-1 text-[0.48rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    inventoryCategory === category
                      ? "border-black bg-black text-white"
                      : "border-[#bdb4a8] text-[#514a43] hover:border-black"
                  }`}
                  key={category}
                  onClick={() => setInventoryCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
            {inventoryCategory === "all" ? (
              <div className="grid gap-6">
                {inventoryCategories.map((category) => (
                  <section key={category}>
                    <h3 className="mb-2 text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-[#6d6257]">
                      {category}
                    </h3>
                    <InventorySlotGrid
                      items={inventorySourceItems.filter(
                        (item) => item.details.category === category,
                      )}
                      minimumDesktopSlots={8}
                      minimumMobileSlots={4}
                    />
                  </section>
                ))}
                {uncategorizedInventoryItems.length ? (
                  <section>
                    <h3 className="mb-2 text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-[#6d6257]">
                      Uncategorized
                    </h3>
                    <InventorySlotGrid
                      items={uncategorizedInventoryItems}
                      minimumDesktopSlots={8}
                      minimumMobileSlots={4}
                    />
                  </section>
                ) : null}
              </div>
            ) : (
              <section>
                <h3 className="mb-2 text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-[#6d6257]">
                  {inventoryCategory}
                </h3>
                <InventorySlotGrid
                  items={visibleInventoryItems}
                  minimumDesktopSlots={8}
                  minimumMobileSlots={4}
                />
              </section>
            )}
          </div>
        ) : inventoryMode === "achievements" ? (
          <Achievements compact />
        ) : null : isThreads ? (threadMode === "threads" ? (
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
        )) : planMode === "plan" ? (
            <div className="flex h-full min-h-0 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Plan map placeholder"
                className="max-h-full w-full max-w-[61.9375rem] object-contain"
                src="/map.svg"
              />
            </div>
          ) : planMode === "game-loop" ? (
            <GameLoopGraph />
          ) : (
            <section aria-labelledby="surrogate-quests-heading">
              <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-3">
                <div>
                  <h3
                    className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#191714]"
                    id="surrogate-quests-heading"
                  >
                    Quests
                  </h3>
                  <p className="mt-1 text-[0.5rem] uppercase tracking-[0.14em] text-[#746b61]">
                    Active objectives and completed missions
                  </p>
                </div>
                <span className="text-[0.5rem] uppercase tracking-[0.14em] text-[#8a8177]">
                  {questItems.filter((quest) => !quest.completed).length} active
                </span>
              </div>
              {questItems.length ? (
                <div className="divide-y divide-black/10">
                  {questItems.map((quest) => (
                    <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-4" key={quest.id}>
                      <span
                        aria-hidden="true"
                        className={`size-2 rounded-full ${quest.completed ? "bg-[#bdb4a8]" : "bg-black"}`}
                      />
                      <div className="min-w-0">
                        <p className={`truncate text-sm ${quest.completed ? "text-[#8a8177] line-through" : "text-[#191714]"}`}>
                          {quest.title}
                        </p>
                        {quest.details.objective ? (
                          <p className="mt-1 truncate text-xs text-[#746b61]">
                            {quest.details.objective}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-[0.46rem] font-semibold uppercase tracking-[0.12em] text-[#8a8177]">
                        {quest.completed ? "Complete" : "Active"}
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 border border-dashed border-[#bdb4a8] px-4 py-10 text-center text-xs text-[#7f7468]">
                  Quests added through Telemetry will appear here.
                </p>
              )}
            </section>
          )}
      </div>
    </section>
  );
}

export function ComposerDock() {
  const pathname = usePathname();
  const {
    activeWorkspace,
    isOpen: telemetryOpen,
    setWorkspaceFilter,
    todos,
    toggle: toggleTelemetry,
  } = useTelemetry();
  const dockRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const entryIdRef = useRef(0);
  const [activeDockPanel, setActiveDockPanel] = useState<DockPanel | null>(null);
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const inventoryItems = todos.filter((todo) => todo.workspace === "inventory");
  const questItems = todos.filter((todo) => todo.workspace === "quests");

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    let updateFrame = 0;
    let lastOffset = "";
    let lastUtilityPanelHeight = "";
    let lastWidth = "";

    const updateDockOffset = () => {
      window.cancelAnimationFrame(updateFrame);
      updateFrame = window.requestAnimationFrame(() => {
        const bounds = dock.getBoundingClientRect();
        const offset = `${Math.round((window.innerHeight - bounds.top) * 100) / 100}px`;
        const utilityPanelHeight = `${Math.round(bounds.top * 0.75 * 100) / 100}px`;
        const width = `${Math.round(bounds.width * 100) / 100}px`;

        if (offset !== lastOffset) {
          document.documentElement.style.setProperty("--composer-dock-offset", offset);
          lastOffset = offset;
        }
        if (utilityPanelHeight !== lastUtilityPanelHeight) {
          document.documentElement.style.setProperty(
            "--composer-utility-panel-height",
            utilityPanelHeight,
          );
          lastUtilityPanelHeight = utilityPanelHeight;
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
      document.documentElement.style.removeProperty("--composer-dock-offset");
      document.documentElement.style.removeProperty(
        "--composer-utility-panel-height",
      );
      document.documentElement.style.removeProperty("--composer-dock-width");
    };
  }, []);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (transcript) transcript.scrollTop = transcript.scrollHeight;
  }, [entries]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = message.trim();
    if (!prompt) return;

    setMessage("");
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
      const result = await fetch("/api/mock-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
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
    if (telemetryOpen) {
      toggleTelemetry();
      setActiveDockPanel(panel);
      return;
    }
    setActiveDockPanel((current) => (current === panel ? null : panel));
  }

  function handleToggleTelemetry() {
    setActiveDockPanel(null);
    toggleTelemetry();
  }

  return (
    <>
      {activeDockPanel
        ? createPortal(
            <DockUtilityPanel
              entries={entries}
              inventoryItems={inventoryItems}
              panel={activeDockPanel}
              questItems={questItems}
            />,
            document.body,
          )
        : null}
      <section
        aria-label="Agent composer"
        className="fixed inset-x-0 bottom-0 z-[10002] mx-auto flex w-full max-w-5xl flex-col bg-black px-4 pb-3 pt-2 sm:px-5 lg:rounded-t-2xl xl:bottom-2 xl:rounded-2xl"
        ref={dockRef}
      >
      <div
        aria-label="Agent dock"
        className="mb-2 flex min-h-8 min-w-0 items-start overflow-x-hidden text-white"
        role="toolbar"
      >
        {telemetryOpen ? (
          <div aria-label="Telemetry category filters" className="flex min-w-0 flex-1 flex-wrap justify-start gap-1.5 overflow-x-hidden pr-2">
              {taskWorkspaces
                .filter(
                  (workspace) =>
                    workspace !== "quests" && workspace !== "training",
                )
                .map((workspace) => (
                <button
                  aria-pressed={activeWorkspace === workspace}
                  className={`h-7 shrink-0 rounded-full border px-3 text-[0.48rem] font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                    activeWorkspace === workspace
                      ? "border-white bg-white text-black"
                      : "border-white/40 text-white hover:border-white hover:bg-white/10"
                  }`}
                  key={workspace}
                  onClick={() => setWorkspaceFilter(workspace)}
                  type="button"
                >
                  {workspace === "plan" ? "Game Design" : workspace}
                </button>
                ))}
              <button
                aria-pressed={activeWorkspace === null}
                className={`h-7 shrink-0 rounded-full border px-3 text-[0.48rem] font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                  activeWorkspace === null
                    ? "border-white bg-white text-black"
                    : "border-white/40 text-white hover:border-white hover:bg-white/10"
                }`}
                onClick={() => setWorkspaceFilter(null)}
                type="button"
              >
                All
              </button>
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div
          className="ml-auto flex shrink-0 items-center gap-1.5"
        >
          <button
            aria-label="Toggle telemetry"
            aria-pressed={telemetryOpen}
            className={`grid h-7 w-12 shrink-0 place-items-center rounded-full border px-3 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
              telemetryOpen
                ? "border-white bg-white text-black"
                : "border-transparent text-white hover:border-white/50 hover:bg-white/10"
            }`}
            onClick={handleToggleTelemetry}
            title="Telemetry"
            type="button"
          >
            <span
              aria-hidden="true"
              className="block h-3 w-[18px] bg-current [mask-image:url('/icons/sirl-logo.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/icons/sirl-logo.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]"
            />
          </button>
          <button
            aria-label="Inventory"
            aria-pressed={activeDockPanel === "inventory"}
            className={`order-3 grid h-7 w-12 place-items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
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
          <button
            aria-label="Chat"
            aria-pressed={activeDockPanel === "threads"}
            className={`order-1 grid h-7 w-12 place-items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
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
            className={`order-2 grid h-7 w-12 place-items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
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

      <form
        className="relative flex min-h-12 items-center rounded-2xl border border-[#d8d0c1] bg-white px-10 shadow-[0_4px_4px_rgba(25,23,20,0.08)]"
        onSubmit={submitMessage}
      >
        <button
          aria-label="Add to composer"
          className="absolute left-3 grid size-5 place-items-center rounded-full border border-black bg-white text-black"
          type="button"
        >
          <FiPlus aria-hidden="true" className="size-3.5" />
        </button>
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
          className="absolute right-3 grid size-5 place-items-center rounded-full border border-black bg-white text-[0.65rem] font-semibold leading-none text-black disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!message.trim()}
          type="submit"
        >
          A
        </button>
      </form>
      </section>
    </>
  );
}

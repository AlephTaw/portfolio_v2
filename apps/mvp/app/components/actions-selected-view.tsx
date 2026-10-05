"use client";

import { useEffect, useState } from "react";
import { FiGrid, FiList, FiMessageCircle, FiMonitor, FiShield } from "react-icons/fi";
import { WorldDisplay } from "../world/world-display";
import StateDisplay from "../state/state-display";
import { useActivityWorkspace } from "./activity-workspace-context";
import { ActivityCategoryIcon } from "./activity-category-icon";
import { CodeWorkspace } from "./code-workspace";
import { InventoryContent } from "./inventory-content";
import { PinScrollArea } from "./pin-scroll-area";
import { useQuestCommands } from "./quest-terminal/use-quest-commands";
import { activityCategories } from "./quest-terminal/use-active-activity";
import { type ActionsView } from "./actions-view-context";
import { TaskRunnerPage } from "./running-tasks";
import { SystemsView } from "../state/components/systems-view";
import { activityTasksChangedEvent, readTasks, starterTasks, taskStorageKey } from "./activity-task-data";
import { protocolsForTask } from "./mvd-protocols";

const systems = [
  { name: "Advocate", Icon: FiShield },
  { name: "Interface", Icon: FiMonitor },
] as const;

export function CampaignQuestContent() {
  const { requestActivityCategory, requestActivityTask } = useActivityWorkspace();
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [tasks, setTasks] = useState(starterTasks);
  useEffect(() => {
    const refresh = () => setTasks(readTasks());
    const frame = requestAnimationFrame(refresh);
    const onStorage = (event: StorageEvent) => { if (event.key === taskStorageKey || event.key === null) refresh(); };
    window.addEventListener(activityTasksChangedEvent, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(activityTasksChangedEvent, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <div className="px-2 py-6">
        <div aria-label="Category view controls" className="flex items-center justify-between gap-2">
          <h2 className="text-base font-medium text-white/85" id="terminal-quests-heading">Quests</h2>
          <button type="button" aria-controls="actions-category-sections" aria-label={`Switch category view to ${layout === "grid" ? "list" : "grid"}`} title={`Switch category view to ${layout === "grid" ? "list" : "grid"}`} onClick={() => setLayout((current) => current === "grid" ? "list" : "grid")} className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white">
            {layout === "grid" ? <FiList aria-hidden="true" className="size-4" /> : <FiGrid aria-hidden="true" className="size-4" />}
          </button>
        </div>
      <div id="actions-category-sections" className="mt-4 space-y-10">
      <section aria-labelledby="terminal-quests-heading">
        {layout === "list" ? <div className="space-y-6">
          {activityCategories.map((category) => {
            const categoryTasks = tasks.filter((task) => task.category === category);
            return <section key={category} aria-labelledby={`actions-quest-category-${category}`}>
              <h3 id={`actions-quest-category-${category}`} className="text-sm font-medium text-white/80">
                <button type="button" onClick={() => requestActivityCategory(category)} className="flex cursor-pointer items-center gap-2 rounded-sm text-left hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white"><ActivityCategoryIcon category={category} className="size-4" />{category}</button>
              </h3>
              {categoryTasks.length ? <ul className="mt-2 space-y-1 text-sm leading-6 text-white/60">{categoryTasks.map((task) => <li key={task.id} className="break-words">
                <button type="button" onClick={() => requestActivityTask(task.id)} className="w-full cursor-pointer rounded-lg px-2 py-1 text-left transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white">
                  {task.name}{protocolsForTask(task).length > 0 && <span className="ml-2 text-[0.625rem] text-white/40">MVD</span>}
                </button>
              </li>)}</ul> : <p className="mt-2 text-sm text-white/40">No quests yet</p>}
            </section>;
          })}
        </div> : <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {activityCategories.map((category) => (
            <button className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-3 text-xs font-medium text-white/75 transition-colors hover:border-white/45 hover:bg-white/[0.08] hover:text-white" key={category} onClick={() => requestActivityCategory(category)} type="button">
              <ActivityCategoryIcon category={category} className="size-7" />
              {category}
            </button>
          ))}
        </div>}
      </section>
      <section aria-labelledby="terminal-systems-heading">
        <h2 className="text-base font-medium text-white/85" id="terminal-systems-heading">Systems</h2>
        {layout === "list" ? <div className="mt-4 space-y-6">
          {systems.map(({ name, Icon }) => <section key={name} aria-labelledby={`actions-system-${name}`}>
            <h3 id={`actions-system-${name}`} className="flex items-center gap-2 text-sm font-medium text-white/80"><Icon aria-hidden="true" className="size-4 text-white/65" />{name}</h3>
            <p className="mt-2 text-sm text-white/40">No content yet</p>
          </section>)}
        </div> : <div className="mt-6 grid grid-cols-2 gap-3">
          {systems.map(({ name, Icon }) => (
            <div className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-3 text-center" key={name}>
              <Icon aria-hidden="true" className="size-7 text-white/65" />
              <span className="text-xs font-medium text-white/75">{name}</span>
              <span className="text-[0.625rem] text-white/40">No content yet</span>
            </div>
          ))}
        </div>}
      </section>
      <section aria-labelledby="terminal-actions-heading">
        <h2 className="text-base font-medium text-white/85" id="terminal-actions-heading">Actions</h2>
        <p className="mt-6 text-sm text-white/40">No actions yet</p>
      </section>
      </div>
    </div>
  );
}

export function ActionsSelectedView({ view }: { view: Exclude<ActionsView, "code" | "notes" | "notes-hidden"> }) {
  const { commands } = useQuestCommands();
  const chatMessages = commands.filter((command) => command.type === "chat-message");

  if (view === "code-preview") {
    return <CodeWorkspace />;
  }

  if (view === "stats") {
    return (
      <PinScrollArea aria-label="State view" className="flex flex-col pb-24" wrapperClassName="min-h-0 flex-1">
        <StateDisplay embedded />
      </PinScrollArea>
    );
  }

  if (view === "minimap") {
    return <div aria-label="Minimap view" className="relative min-h-0 flex-1"><WorldDisplay embedded explicitDestination initialLocation="Workshop" /></div>;
  }

  if (view === "world-tree") {
    return <div aria-label="World Tree view" className="relative min-h-0 flex-1"><WorldDisplay embedded explicitDestination initialLocation="Workshop" initialWorldTreeFocused /></div>;
  }

  if (view === "world-grid") {
    return <div aria-label="World grid view" className="relative min-h-0 flex-1"><WorldDisplay embedded explicitDestination initialDomainGrid /></div>;
  }

  if (view === "world-heatmap") {
    return <div aria-label="World Tree heat map view" className="relative min-h-0 flex-1"><WorldDisplay embedded explicitDestination initialWorldTreeFocused /></div>;
  }

  if (view === "inventory") {
    return <PinScrollArea aria-label="Inventory" className="pb-24 pt-8" wrapperClassName="min-h-0 flex-1"><InventoryContent /></PinScrollArea>;
  }

  if (view === "running-tasks") {
    return <PinScrollArea aria-label="Tasks view" className="pb-24 pt-8" wrapperClassName="min-h-0 flex-1">
      <TaskRunnerPage />
    </PinScrollArea>;
  }

  if (view === "systems") {
    return <PinScrollArea aria-label="Systems view" className="pb-24" wrapperClassName="min-h-0 flex-1"><SystemsView /></PinScrollArea>;
  }

  return (
    <PinScrollArea aria-label={view === "apps" ? "Quests and systems" : "Communications"} className="pb-16 font-sans" wrapperClassName="flex-1">
      {view === "apps" ? (
        <CampaignQuestContent />
      ) : (
        <section className="px-2 py-6">
          <h2 className="text-base font-medium text-white/85">Communications</h2>
          {chatMessages.length ? (
            <ol className="mt-6 space-y-3">
              {chatMessages.map((message, index) => (
                <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={`${message.executedAt ?? index}-${index}`}>
                  <FiMessageCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-white/60" />
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-white/85">{message.item}</p>
                    {message.executedAt && <time className="mt-2 block text-xs text-white/40" dateTime={message.executedAt}>{new Date(message.executedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>}
                  </div>
                </li>
              ))}
            </ol>
          ) : <p className="mt-6 text-sm text-white/40">No active threads</p>}
        </section>
      )}
    </PinScrollArea>
  );
}

"use client";

import { FiMessageCircle, FiMonitor, FiShield } from "react-icons/fi";
import { WorldDisplay } from "../world/world-display";
import StatsDisplay from "../stats/stats-display";
import { useActivityWorkspace } from "./activity-workspace-context";
import { ActivityCategoryIcon } from "./activity-category-icon";
import { CodeWorkspace } from "./code-workspace";
import { InventoryContent } from "./inventory-content";
import { PinScrollArea } from "./pin-scroll-area";
import { useQuestCommands } from "./quest-terminal/use-quest-commands";
import { activityCategories } from "./quest-terminal/use-active-activity";
import { type TerminalView } from "./terminal-view-context";

const systems = [
  { name: "Advocate", Icon: FiShield },
  { name: "Interface", Icon: FiMonitor },
] as const;

export function CampaignQuestContent() {
  const { requestActivityCategory } = useActivityWorkspace();

  return (
    <div className="space-y-10 px-2 py-6">
      <section aria-labelledby="terminal-quests-heading">
        <h2 className="text-base font-medium text-white/85" id="terminal-quests-heading">Quests</h2>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {activityCategories.map((category) => (
            <button className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-3 text-xs font-medium text-white/75 transition-colors hover:border-white/45 hover:bg-white/[0.08] hover:text-white" key={category} onClick={() => requestActivityCategory(category)} type="button">
              <ActivityCategoryIcon category={category} className="size-7" />
              {category}
            </button>
          ))}
        </div>
      </section>
      <section aria-labelledby="terminal-systems-heading">
        <h2 className="text-base font-medium text-white/85" id="terminal-systems-heading">Systems</h2>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {systems.map(({ name, Icon }) => (
            <div className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-3 text-center" key={name}>
              <Icon aria-hidden="true" className="size-7 text-white/65" />
              <span className="text-xs font-medium text-white/75">{name}</span>
              <span className="text-[0.625rem] text-white/40">No content yet</span>
            </div>
          ))}
        </div>
      </section>
      <section aria-labelledby="terminal-actions-heading">
        <h2 className="text-base font-medium text-white/85" id="terminal-actions-heading">Actions</h2>
        <p className="mt-6 text-sm text-white/40">No actions yet</p>
      </section>
    </div>
  );
}

export function TerminalSelectedView({ view }: { view: Exclude<TerminalView, "code" | "notes" | "notes-hidden"> }) {
  const { commands } = useQuestCommands();
  const chatMessages = commands.filter((command) => command.type === "chat-message");

  if (view === "code-preview") {
    return <CodeWorkspace />;
  }

  if (view === "stats") {
    return (
      <PinScrollArea aria-label="Stats view" className="flex flex-col pb-24" wrapperClassName="min-h-0 flex-1">
        <StatsDisplay embedded />
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

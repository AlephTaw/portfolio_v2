"use client";

import { useState } from "react";
import { FiArrowLeft, FiChevronRight, FiGrid, FiList } from "react-icons/fi";
import { useStateView } from "./state-view-context";

const systemCategories = ["Health", "Wealth", "Connection", "Sentience", "Skills", "Experience", "Builds", "Quests"] as const;

const sampleSystems = [
  { id: "recovery", category: "Health", name: "Recovery", description: "A daily rhythm for sleep, meals, mobility, and recovery.", steps: ["Check energy and sleep", "Choose a recovery activity", "Record progress"] },
  { id: "health-hair", category: "Health", name: "Hair", description: "System details to be defined.", steps: [] },
  { id: "health-skin", category: "Health", name: "Skin", description: "System details to be defined.", steps: [] },
  { id: "health-sleep", category: "Health", name: "Sleep", description: "System details to be defined.", steps: [] },
  { id: "health-strength", category: "Health", name: "Strength", description: "System details to be defined.", steps: [] },
  { id: "health-conditioning", category: "Health", name: "Conditioning", description: "System details to be defined.", steps: [] },
  { id: "health-mobility", category: "Health", name: "Mobility", description: "System details to be defined.", steps: [] },
  { id: "health-nutrition", category: "Health", name: "Nutrition", description: "System details to be defined.", steps: [] },
  { id: "health-mouth", category: "Health", name: "Mouth", description: "System details to be defined.", steps: [] },
  { id: "health-connection", category: "Health", name: "Connection", description: "System details to be defined.", steps: [] },
  { id: "learning", category: "Skills", name: "Subject Mastery", description: "Turn a learning goal into practice, feedback, and review.", steps: ["Choose a subject", "Practice a skill", "Review and refine"] },
  { id: "earning", category: "Wealth", name: "Daily Earning Quota", description: "Plan work sessions and track progress toward the daily earning goal.", steps: ["Set the daily target", "Complete a work session", "Review earnings"] },
  { id: "connection", category: "Connection", name: "Connection", description: "Make room for meaningful conversations and follow-ups.", steps: ["Choose a connection", "Start a conversation", "Plan a follow-up"] },
  { id: "pipelines", category: "Connection", name: "Pipelines", description: "Organize connections and keep track of conversations and next steps.", steps: ["Add a connection", "Track the conversation", "Choose the next step"] },
  { id: "operation-kinosaki", category: "Connection", name: "Operation Kinosaki", description: "System details to be defined.", steps: [] },
  { id: "family", category: "Connection", name: "Family", description: "System details to be defined.", steps: [] },
  { id: "guild", category: "Connection", name: "Guild", description: "System details to be defined.", steps: [] },
  { id: "sentience-mvsos", category: "Sentience", name: "MVSOS", description: "System details to be defined.", steps: [] },
  { id: "experience-enjoyment", category: "Experience", name: "Enjoyment", description: "System details to be defined.", steps: [] },
  { id: "experience-exploration-exploitation", category: "Experience", name: "Exploration - Exploitation", description: "System details to be defined.", steps: [] },
  { id: "experience-telemetry", category: "Experience", name: "Telemetry", description: "System details to be defined.", steps: [] },
  { id: "builds-game-of-life", category: "Builds", name: "Game of Life", description: "System details to be defined.", steps: [] },
  { id: "builds-developer-game", category: "Builds", name: "Developer Game", description: "A repeatable loop for planning, building, testing, and shipping software.", steps: ["Choose the next feature", "Build and test it", "Record what shipped"] },
  { id: "quests-minimum-viable-day", category: "Quests", name: "Minimum Viable Day", description: "System details to be defined.", steps: [] },
] as const;

const chipClass = "inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/30 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white";

export function SystemsView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"manifest" | "factory">("manifest");
  const [displayMode, setDisplayMode] = useState<"list" | "grid">("list");
  const { quests } = useStateView();
  const system = sampleSystems.find(({ id }) => id === selectedId);

  return (
    <section aria-label="Systems" className="w-full font-sans text-white">
      {system && <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button type="button" className={chipClass} onClick={() => setSelectedId(null)}><FiArrowLeft aria-hidden="true" />Systems</button>
      </div>}

      {system ? (
        <section aria-label={`${system.name} details`}>
          <h2 className="text-lg font-medium">{system.name}</h2>
          <p className="mt-3 text-sm leading-6 text-white/55">{system.description}</p>
          <ol className="mt-6 space-y-3 text-sm text-white/75">
            {system.steps.map((step, index) => <li className="flex gap-3" key={`${index}-${step}`}><span className="text-white/35">{index + 1}.</span>{step}</li>)}
          </ol>
        </section>
      ) : (
        <div>
          <div className="mb-2 flex min-h-9 items-center justify-end gap-3">
            <button
              aria-pressed={viewMode === "factory"}
              className="cursor-pointer rounded-full border border-white/35 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white/70 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={() => setViewMode((current) => current === "manifest" ? "factory" : "manifest")}
              type="button"
            >
              {viewMode === "manifest" ? "View Factory" : "View Manifest"}
            </button>
            <button
              aria-label={`Switch to ${displayMode === "list" ? "grid" : "list"} view`}
              className="grid size-9 cursor-pointer place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white disabled:cursor-default disabled:opacity-35"
              disabled={viewMode === "factory"}
              onClick={() => setDisplayMode((current) => current === "list" ? "grid" : "list")}
              title={`Switch to ${displayMode === "list" ? "grid" : "list"} view`}
              type="button"
            >
              {displayMode === "list" ? <FiGrid aria-hidden="true" className="size-4" /> : <FiList aria-hidden="true" className="size-4" />}
            </button>
          </div>
          {viewMode === "factory" ? (
            <section aria-label="Systems factory" className="py-3">
              <h2 className="text-lg font-semibold text-white/85">Factory</h2>
              <p className="mt-2 text-sm text-white/55">Factory workspace coming soon.</p>
            </section>
          ) : (
          <div className="divide-y divide-white/15">
          {systemCategories.map((category) => {
            const items = sampleSystems.filter((item) => item.category === category);
            return <section aria-label={`${category} systems`} className="py-3 first:pt-0" key={category}>
              <div className="mb-2 flex min-h-9 items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white/85">{category}</h2>
              </div>
              <ul className={displayMode === "grid" ? "grid grid-cols-[repeat(auto-fill,minmax(min(100%,13rem),1fr))] gap-2" : ""}>
                {items.map((item) => (
                  <li key={item.id}>
                    <button type="button" className={`group flex min-h-11 w-full cursor-pointer justify-between gap-3 rounded-lg text-left transition-colors hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white ${displayMode === "grid" ? "h-full flex-col border border-white/15 p-3" : "items-center py-2"}`} onClick={() => setSelectedId(item.id)}>
                      <span className={`min-w-0 text-sm leading-5 ${displayMode === "grid" ? "flex flex-col gap-1" : ""}`}>
                        <span className="font-medium">{item.name}</span>{" "}
                        <span className="ml-2 text-white/45 transition-colors group-hover:text-white/75 group-focus-visible:text-white/75">{item.description}</span>
                      </span>
                      <FiChevronRight aria-hidden="true" className="shrink-0 text-white/45 transition-colors group-hover:text-white group-focus-visible:text-white" />
                    </button>
                  </li>
                ))}
              </ul>
              {category === "Quests" && quests.length > 0 && <ul className="mt-3 space-y-2 text-sm text-white/75">{quests.map((name, index) => <li key={`${index}-${name}`}>{name}</li>)}</ul>}
              {items.length === 0 && (category !== "Quests" || quests.length === 0) && <p className="mt-3 text-xs text-white/35">No systems yet.</p>}
            </section>;
          })}
          </div>
          )}
        </div>
      )}
    </section>
  );
}

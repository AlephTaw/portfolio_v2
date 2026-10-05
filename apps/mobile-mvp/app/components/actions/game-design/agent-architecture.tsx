"use client";

import { useId, useState } from "react";
import { useWatcher } from "../../watcher/watcher";
import { mvdItemId } from "../field-report/mvd-checklist-data";
import { appSystems, type AppSystem } from "./system-catalog";

const toggleClass = "min-h-11 rounded-full bg-white/5 px-3 text-[11px] text-white/65 hover:bg-white/10";

export function AgentArchitecture() {
  const [grid, setGrid] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { componentConfigs, completedMvd } = useWatcher();
  const contentId = useId();
  const systems: AppSystem[] = [...appSystems, ...Object.entries(componentConfigs).flatMap(([target, config]) => config.systems.map((system) => ({
    id: `custom-${target}-${system.id}`, name: system.name, category: `Custom · ${config.displayName}`,
    description: [system.enabled ? "Enabled" : "Disabled", system.protocol].filter(Boolean).join("\n\n"),
  })))];
  const selected = systems.find((system) => system.id === selectedId);
  const categories = [...new Set(systems.map((system) => system.category))];
  return <section aria-label="MVSOS overview" className="pt-5">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-medium text-white/90">{grid ? "Systems" : "MVSOS"}</h2>
      <button type="button" className={toggleClass} aria-controls={contentId} aria-label={grid ? "Show agent architecture" : "Show systems grid"} onClick={() => { setGrid(!grid); setSelectedId(null); }}>{grid ? "Systems grid" : "Agent architecture"}</button>
    </div>
    <div id={contentId}>
      {!grid ? <figure className="mt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mvsos.svg" alt="MVSOS agent diagram with Telemetry, Experiment, Axiom of Choice, and Techniques systems" className="mx-auto w-[80%] max-w-[300px]" />
        <figcaption className="mx-auto mt-3 max-w-[340px] text-center text-[11px] leading-5 text-white/40">To add: Inventory, Chat, and Game progression within MVSOS.</figcaption>
      </figure> : selected ? <section aria-label={`${selected.name} system details`} className="mt-4 rounded-xl bg-black/15 p-3">
        <button type="button" className={toggleClass} onClick={() => setSelectedId(null)}>← All systems</button>
        <p className="mb-1 mt-4 text-[10px] text-white/40">{selected.category}</p>
        <h3 className="text-sm font-medium text-white/90">{selected.name}</h3>
        {selected.description && <p className="mt-2 whitespace-pre-line text-xs leading-5 text-white/55">{selected.description}</p>}
        {selected.groups?.map((group) => <section key={group.id} aria-label={`${group.title} protocol`} className="mt-4">
          {group.title !== selected.name && <h4 className="text-xs font-medium text-white/75">{group.title}</h4>}
          <ul className="mt-2 divide-y divide-white/5">{group.items.map((item, index) => <li key={mvdItemId(group, index)} className="flex items-start gap-2 py-2 text-[11px] leading-5">
            <span aria-label={completedMvd.includes(mvdItemId(group, index)) ? "Completed" : "Pending"} className="text-white/45">{completedMvd.includes(mvdItemId(group, index)) ? "✓" : "○"}</span>
            <span className="flex-1 text-white/75">{item.label}</span>
            {item.points && <span className="shrink-0 text-white/45">{item.points}</span>}
          </li>)}</ul>
          {group.note && <p className="mt-2 text-[11px] leading-5 text-white/40">{group.note}</p>}
        </section>)}
      </section> : <div aria-label="App systems grid" className="mt-4 space-y-4">
        {categories.map((category) => <section key={category} aria-label={`${category} systems`}>
          <h3 className="mb-2 text-xs font-medium text-white/55">{category}</h3>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">{systems.filter((system) => system.category === category).map((system) => <li key={system.id}>
            <button type="button" onClick={() => setSelectedId(system.id)} aria-label={`Explore ${category}: ${system.name}`} className="flex min-h-16 h-full w-full items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-left text-xs leading-5 text-white/80 transition-colors hover:bg-white/10 focus-visible:bg-white/10">
              <span>{system.name}</span><span aria-hidden="true" className="text-white/35">›</span>
            </button>
          </li>)}</ul>
        </section>)}
      </div>}
    </div>
  </section>;
}

"use client";

import { useWatcher } from "../../watcher/watcher";
import { CategoryStatus } from "../game-design/category-status";
import { categories, categoryAchievements, categoryProgress, systemHealth } from "../game-design/dashboard-data";
import { Storyboard } from "../game-design/storyboard";
import { AgentArchitecture } from "../game-design/agent-architecture";
import { pointsEarnedColors } from "../game-design/point-colors";

export function GameDesignView() {
  const { completedMvd } = useWatcher();
  const pending = categories.flatMap((category) => categoryAchievements(category.name, completedMvd).filter((item) => !item.achieved).map((item) => ({ ...item, category: category.name, color: category.color })));
  return <section aria-label="Game design" className="game-design pb-4 pl-4 pr-12 text-white min-[768px]:px-6">
    <h1 className="sr-only">Game design</h1>

    <AgentArchitecture />

    <section aria-label="MVSOS system health" className="mt-6">
      <div className="mb-3 flex items-baseline justify-between gap-3"><h2 className="text-xs font-medium text-white/80">System health</h2><span className="text-[10px] text-white/40">Sample readings</span></div>
      <div className="grid grid-cols-4 gap-2 rounded-xl bg-black/15 p-3">
        {systemHealth.map((system) => <div key={system.name} className="min-w-0">
          <p className="min-h-8 text-[10px] leading-4 text-white/55">{system.name}</p>
          <p className="mb-2 mt-1 text-sm tabular-nums text-white/85">{system.value}<span className="ml-0.5 text-[10px] text-white/40">%</span></p>
          <span role="progressbar" aria-label={`${system.name} health`} aria-valuenow={system.value} aria-valuemin={0} aria-valuemax={100} className="block h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-[#83c6a3]/70" style={{ width: `${system.value}%` }} /></span>
        </div>)}
      </div>
    </section>

    <section aria-label="Character category progress" className="mt-6">
      <div className="mb-1 flex items-baseline justify-between gap-3"><h2 className="text-xs font-medium text-white/80">Daily progression</h2><span className="text-[10px] text-white/40">Points · achievements</span></div>
      {categories.map((category) => <CategoryStatus key={category.name} category={category} />)}
      <details className="mt-2 text-[10px] leading-5 text-white/40"><summary className="cursor-pointer py-2">Scoring rules</summary><p>Rewards follow the MVD checklist. Unassigned rewards currently count as 1 point, and non-point actions count as 0. The level preview advances every 10 earned points.</p></details>
    </section>

    <section aria-label="Pending achievements and points" className="mt-6 border-t border-white/10 pt-5">
      <div className="flex items-baseline justify-between gap-3"><h2 className="text-xs font-medium text-white/80">Pending achievements</h2><span className="text-[11px] tabular-nums text-white/40">{pending.length} queued</span></div>
      <details className="mt-3 rounded-xl bg-black/15 px-3">
        <summary className="cursor-pointer py-3 text-xs text-white/60">{pending.length ? "View achievement queue" : "All daily achievements completed"}</summary>
        <ul className="pb-2">{pending.map((item) => <li key={item.id} className="flex items-center gap-2 border-t border-white/5 py-2.5 text-xs"><span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full" style={{ background: item.color }} /><span className="flex-1 text-white/75">{item.title}</span><span className="text-[10px] text-white/40">{item.category}</span></li>)}</ul>
      </details>
      <h3 className="mb-2 mt-4 text-[11px] text-white/50">Points earned</h3>
      <div className="flex flex-wrap gap-x-5 gap-y-2">{categories.map((category) => <span key={category.name} className="flex items-baseline gap-1.5 text-xs"><span className="font-medium tabular-nums" style={{ color: pointsEarnedColors[category.name] }}>{categoryProgress(category.name, completedMvd).earned}</span><span className="text-[10px] text-white/45">{category.unit}</span></span>)}</div>
    </section>

    <div className="mt-7 border-t border-white/10 pt-5"><Storyboard /></div>
  </section>;
}

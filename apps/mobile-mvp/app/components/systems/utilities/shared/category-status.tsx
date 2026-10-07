"use client";

import { useId, useState } from "react";
import { categories, categoryAchievements, categoryProgress, categoryTasks, skillSections } from "./dashboard-data";
import { SkillBehaviorIcon } from "../skills/skill-behavior-icon";

export type AchievementApps = { visible: readonly string[]; reveal: (id: string) => void; toggle: (id: string) => void };
export function CategoryStatus({ category, displayName = category.name, completedMvd, toggleMvd, apps }: { category: typeof categories[number]; displayName?: string; completedMvd: readonly string[]; toggleMvd: (id: string) => void; apps?: AchievementApps }) {
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(!!apps);
  const [selected, setSelected] = useState<string | null>(null);
  const id = useId();
  const { earned, total, percent, level } = categoryProgress(category.name, completedMvd);
  const tasks = categoryTasks(category.name);
  const achievements = categoryAchievements(category.name, completedMvd);
  const detail = achievements.find((item) => item.id === selected);
  const completedAchievements = achievements.filter((item) => item.achieved).length;
  const sectionTitles = category.name === "Skills" ? skillSections : [...new Set(achievements.map((item) => item.subcategory))];
  const achievementSections = sectionTitles.map((title) => ({
    title, items: achievements.filter((item) => item.subcategory === title),
  }));

  return <section aria-label={`${displayName} status`} className="border-b border-white/10 py-2 last:border-0">
    <button type="button" aria-expanded={checklistOpen} aria-controls={`${id}-checklist`} aria-label={`${displayName} progress — show checklist`} onClick={() => setChecklistOpen(!checklistOpen)} className="group block min-h-11 w-full text-left">
      <span className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-sans" style={{ color: category.color }}>
        <span className="flex items-baseline gap-2.5"><span role="heading" aria-level={2} className="text-sm font-medium">{displayName}</span><span className="text-[11px] opacity-60">Lv. {level}</span></span>
        <span className="flex items-center gap-2 text-xs tabular-nums"><span>{earned}<span className="opacity-60"> / {total} {category.unit}</span></span><Chevron expanded={checklistOpen} /></span>
      </span>
      <span role="progressbar" aria-label={`${category.name} points`} aria-valuenow={earned} aria-valuemin={0} aria-valuemax={total} className="block h-1.5 overflow-hidden rounded-full bg-white/10">
        <span className="block h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${percent}%`, background: category.color }} />
      </span>
    </button>

    <ul id={`${id}-checklist`} hidden={!checklistOpen} className="mt-3 rounded-xl bg-black/15 px-3">
      {tasks.map((task) => <li key={`${task.group}-${task.id}`} className="border-b border-white/5 last:border-0">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 py-2.5 text-xs">
          <input type="checkbox" checked={completedMvd.includes(task.id)} onChange={() => toggleMvd(task.id)} className="h-4 w-4 shrink-0 accent-[#b8b8bc]" />
          <span className={`min-w-0 flex-1 leading-5 ${completedMvd.includes(task.id) ? "text-white/40 line-through" : "text-white/80"}`}>{task.label}</span>
          <span className="shrink-0 text-[11px] tabular-nums text-white/55">{task.points} {category.unit}</span>
        </label>
      </li>)}
    </ul>

    <button type="button" aria-expanded={gridOpen} aria-controls={`${id}-achievements`} onClick={() => { setGridOpen(!gridOpen); setSelected(null); }} className="mt-2 flex min-h-11 w-full items-center gap-2 text-left" aria-label={`${gridOpen ? "Collapse" : "Expand"} ${category.name} achievements`}>
      <span className="flex items-center gap-1.5" aria-hidden="true">{achievements.slice(0, 5).map((item) => item.subcategory === "Health" ? <SkillBehaviorIcon key={item.id} id={item.id} color={item.achieved ? category.color : "#737781"} /> : <HexRing key={item.id} color={item.achieved ? category.color : "#737781"} completed={item.achieved} />)}</span>
      {achievements.length > 5 && <span className="text-[10px] text-white/45">+{achievements.length - 5}</span>}
      <span className="ml-auto flex items-center gap-2 text-[11px] text-white/45"><span>{completedAchievements}/{achievements.length}</span><Chevron expanded={gridOpen} /></span>
    </button>

    <div id={`${id}-achievements`} hidden={!gridOpen}>
      {achievementSections.map((section) => <section key={section.title ?? "achievements"} aria-label={section.title} className="mt-3">
      {section.title && <h3 className="mb-2 text-xs font-medium text-white/65">{section.title}</h3>}
      <div className="mt-2 grid grid-cols-3 gap-2">
        {Array.from({ length: Math.max(3, Math.ceil(section.items.length / 3) * 3) }, (_, index) => {
          const item = section.items[index];
          return item ? <div key={item.id} className="relative min-w-0"><button type="button" aria-label={`${item.title} achievement`} aria-pressed={selected === item.id} onClick={() => setSelected(selected === item.id ? null : item.id)} onDoubleClick={() => apps?.reveal(item.id)} title={apps ? "Double-click to reveal app" : undefined} className={`flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border px-2 pb-3 ${apps ? "pt-11" : "pt-3"} text-center transition-colors ${selected === item.id ? "border-white/30 bg-white/10" : "border-white/5 bg-black/15 hover:bg-white/5"}`}>
            {item.subcategory === "Health" ? <SkillBehaviorIcon id={item.id} color={item.achieved ? category.color : "#a8adb7"} large /> : <HexRing color={item.achieved ? category.color : "#737781"} completed={item.achieved} large />}
            <span className="text-[11px] leading-4 text-white/70">{item.title}</span>
            {item.rewardPoints !== undefined && <span className="text-[10px] tabular-nums" style={{ color: category.color }}>{item.rewardPoints} {category.unit}</span>}
          </button>{apps && <button type="button" className="absolute right-0 top-0 grid h-11 w-11 place-items-center rounded-xl hover:bg-white/5 focus-visible:outline focus-visible:outline-white/60" style={{ color: apps.visible.includes(item.id) ? category.color : "#737781" }} aria-label={`${apps.visible.includes(item.id) ? "Hide" : "Show"} ${item.title} app`} title={`${apps.visible.includes(item.id) ? "Hide" : "Show"} app`} aria-pressed={apps.visible.includes(item.id)} onClick={() => apps.toggle(item.id)} onDoubleClick={(event) => event.stopPropagation()}><VisibilityEye visible={apps.visible.includes(item.id)} /></button>}</div> : <span key={`empty-${index}`} aria-label="Empty achievement slot" className="grid min-h-24 place-items-center rounded-xl border border-dashed border-white/10"><HexRing color="#454951" large /></span>;
        })}
      </div>
      </section>)}
    </div>

    {detail && <section aria-label={`${detail.title} achievement details`} className="mt-3 rounded-xl bg-black/20 p-3">
      <div className="flex items-center gap-3">
        {detail.subcategory === "Health" ? <SkillBehaviorIcon id={detail.id} color={detail.achieved ? category.color : "#a8adb7"} /> : <HexRing color={detail.achieved ? category.color : "#737781"} completed={detail.achieved} />}
        <div className="min-w-0 flex-1"><h3 className="text-xs font-medium">{detail.title}</h3><p className="mt-1 text-[10px] text-white/45">{detail.achieved ? "Earned" : "Complete every requirement"}</p></div>
        {detail.rewardPoints !== undefined && <span className="shrink-0 text-xs tabular-nums" style={{ color: category.color }}>{detail.rewardPoints} {category.unit}</span>}
        <button type="button" aria-label="Close achievement details" onClick={() => setSelected(null)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white/50 hover:bg-white/5 hover:text-white">×</button>
      </div>
      <ul className="mt-2 space-y-2">{tasks.filter((task) => task.group === detail.groupTitle).map((task) => <li key={task.id} className="flex items-start justify-between gap-3 text-xs leading-5"><span className={completedMvd.includes(task.id) ? "text-white/40 line-through" : "text-white/70"}>{task.label}</span><span className="shrink-0 tabular-nums text-white/45">{task.points} {category.unit}</span></li>)}</ul>
      {!tasks.some((task) => task.group === detail.groupTitle) && <ul className="mt-2 space-y-2 text-xs leading-5 text-white/70">{detail.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>}
    </section>}
  </section>;
}

function VisibilityEye({ visible }: { visible: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{!visible && <path d="m3 3 18 18" />}</svg>;
}

function Chevron({ expanded }: { expanded: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 16 16" className={`h-3.5 w-3.5 shrink-0 text-white/40 transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m4 6 4 4 4-4" /></svg>;
}

function HexRing({ color, completed = false, large = false }: { color: string; completed?: boolean; large?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 32 36" className={`${large ? "h-10 w-9" : "h-7 w-6"} shrink-0`} fill="none"><path d="m16 2 13.5 8v16L16 34 2.5 26V10Z" stroke={color} strokeWidth="1.5" fill={completed ? color : "none"} fillOpacity="0.12" />{completed && <path d="m10 18 4 4 8-8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}</svg>;
}

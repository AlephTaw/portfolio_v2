"use client";

import { useState } from "react";
import { FiArrowLeft, FiChevronRight, FiCode, FiPlus } from "react-icons/fi";

const sampleSystems = [
  { id: "recovery", name: "Recovery", description: "A daily rhythm for sleep, meals, mobility, and recovery.", steps: ["Check energy and sleep", "Choose a recovery activity", "Record progress"] },
  { id: "learning", name: "Subject Mastery", description: "Turn a learning goal into practice, feedback, and review.", steps: ["Choose a subject", "Practice a skill", "Review and refine"] },
  { id: "earning", name: "Daily Earning", description: "Plan work sessions and track progress toward the daily earning goal.", steps: ["Set the daily target", "Complete a work session", "Review earnings"] },
  { id: "connection", name: "Connection", description: "Make room for meaningful conversations and follow-ups.", steps: ["Choose a connection", "Start a conversation", "Plan a follow-up"] },
] as const;

const chipClass = "inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/30 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white";
const inputClass = "w-full rounded-xl border border-white/20 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/55";

export function SystemsView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [creatingQuest, setCreatingQuest] = useState(false);
  const [questName, setQuestName] = useState("");
  const [quests, setQuests] = useState<string[]>([]);
  const system = sampleSystems.find(({ id }) => id === selectedId);

  return (
    <section aria-label="Systems" className="w-full font-sans text-white">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {system ? (
          <button type="button" className={chipClass} onClick={() => { setSelectedId(null); setEditorOpen(false); }}><FiArrowLeft aria-hidden="true" />Systems</button>
        ) : <h1 className="text-base font-medium">Systems</h1>}
        <button type="button" className={chipClass} aria-expanded={creatingQuest} onClick={() => setCreatingQuest((open) => !open)}><FiPlus aria-hidden="true" />Create new quest</button>
      </div>

      {creatingQuest && (
        <form className="mb-6 grid gap-3 rounded-xl border border-white/15 p-4" onSubmit={(event) => {
          event.preventDefault();
          if (!questName.trim()) return;
          setQuests((current) => [...current, questName.trim()]);
          setQuestName("");
          setCreatingQuest(false);
        }}>
          <label className="grid gap-2 text-xs text-white/65">Quest name<input autoFocus required value={questName} onChange={(event) => setQuestName(event.target.value)} className={inputClass} /></label>
          <div className="flex gap-2"><button type="submit" className={chipClass}>Create quest</button><button type="button" className={chipClass} onClick={() => setCreatingQuest(false)}>Cancel</button></div>
        </form>
      )}

      {system ? (
        <section aria-label={`${system.name} details`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium">{system.name}</h2>
            <button type="button" className={`${chipClass} ${editorOpen ? "border-white/60 text-white" : ""}`} aria-expanded={editorOpen} onClick={() => setEditorOpen((open) => !open)}><FiCode aria-hidden="true" />System editor</button>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/55">{system.description}</p>
          {editorOpen ? (
            <label className="mt-6 grid gap-2 text-xs text-white/65">System steps
              <textarea rows={8} className={`${inputClass} resize-y font-mono`} value={drafts[system.id] ?? system.steps.join("\n")} onChange={(event) => setDrafts((current) => ({ ...current, [system.id]: event.target.value }))} />
            </label>
          ) : (
            <ol className="mt-6 space-y-3 text-sm text-white/75">
              {(drafts[system.id] ?? system.steps.join("\n")).split("\n").filter(Boolean).map((step, index) => <li className="flex gap-3" key={`${index}-${step}`}><span className="text-white/35">{index + 1}.</span>{step}</li>)}
            </ol>
          )}
        </section>
      ) : (
        <ul className="divide-y divide-white/15">
          {sampleSystems.map((item) => (
            <li key={item.id}><button type="button" className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-1 focus-visible:outline-white" onClick={() => { setSelectedId(item.id); setEditorOpen(false); }}><span><span className="block text-sm font-medium">{item.name}</span><span className="mt-2 block text-xs leading-5 text-white/45">{item.description}</span></span><FiChevronRight aria-hidden="true" className="shrink-0 text-white/45" /></button></li>
          ))}
        </ul>
      )}

      {quests.length > 0 && <section aria-label="New quests" className="mt-8"><h2 className="text-sm font-medium text-white/65">Quests</h2><ul className="mt-3 space-y-2 text-sm text-white/75">{quests.map((name, index) => <li key={`${index}-${name}`}>{name}</li>)}</ul></section>}
    </section>
  );
}

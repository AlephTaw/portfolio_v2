"use client";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ActionComposer } from "./action-composer";
import { TerminalLog, type TerminalEntry } from "./history/terminal-log";
import { PrimaryColumn } from "./layouts/primary-column";
import { SecondaryColumn } from "./layouts/secondary-column";
import { BottomNavigation, type Category } from "./navigation/bottom-navigation";
import { TerminalView } from "./views/terminal-view";
import { WealthPlanner } from "../wealth/wealth-planner";
import { CategoryAppView } from "../categories/category-app-view";
import { addJourneyObjective } from "../journey/use-journey";

type Workspace = Category | "Terminal";
export function WealthWorkspace() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [entries, setEntries] = useState<Partial<Record<Workspace, TerminalEntry[]>>>({});
  const [drafts, setDrafts] = useState<Partial<Record<Workspace, string>>>({});
  const [completed, setCompleted] = useState<string[]>([]);
  function toggleTask(id: string) {
    setCompleted((previous) => previous.includes(id) ? previous.filter((task) => task !== id) : [...previous, id]);
  }
  const nextId = useRef(1);
  const input = useRef<HTMLTextAreaElement>(null);
  const workspace = activeCategory ?? "Terminal";
  const notes = entries[workspace] ?? [];
  function addNote(text: string) {
    if (workspace === "Journey") { addJourneyObjective(text); return; }
    const entry = { id: nextId.current++, text };
    setEntries((previous) => ({ ...previous, [workspace]: [...(previous[workspace] ?? []), entry] }));
  }
  function selectCategory(category: Category) {
    flushSync(() => setActiveCategory(category));
    const prompt = input.current;
    prompt?.focus({ preventScroll: true });
    prompt?.setSelectionRange(prompt.value.length, prompt.value.length);
  }
  return <main className="wealth-page">
    <PrimaryColumn>
      <SecondaryColumn content={<TerminalView title={workspace} hideHeader={activeCategory !== null}>
        <div className={activeCategory === "Wealth" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
          <WealthPlanner header={<CategoryAppView category="Wealth" completed={completed} onToggle={toggleTask} />} />
          {notes.length > 0 && activeCategory === "Wealth" && <ol aria-label="Wealth session actions" aria-live="polite" className="max-h-28 shrink-0 space-y-2 overflow-y-auto px-5 py-2">{notes.map((entry) => <li key={entry.id} className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-white/65">› {entry.text}</li>)}</ol>}
        </div>
        <div className={activeCategory === "Wealth" ? "hidden" : "flex min-h-0 flex-1 flex-col"}>
          <TerminalLog entries={notes} category={activeCategory} header={activeCategory ? <CategoryAppView key={activeCategory} category={activeCategory} completed={completed} onToggle={toggleTask} /> : undefined} />
        </div>
        <ActionComposer inputRef={input} value={drafts[workspace] ?? ""} onChange={(value) => setDrafts((previous) => ({ ...previous, [workspace]: value }))} onSubmit={addNote} />
      </TerminalView>}
        navigation={<BottomNavigation activeCategory={activeCategory} onSelect={selectCategory} />} />
    </PrimaryColumn>
  </main>;
}

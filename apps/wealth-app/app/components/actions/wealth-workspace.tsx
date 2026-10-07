"use client";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ActionComposer } from "./action-composer";
import { TerminalLog, type TerminalEntry } from "./history/terminal-log";
import { PrimaryColumn } from "./layouts/primary-column";
import { SecondaryColumn } from "./layouts/secondary-column";
import { BottomNavigation, type Category } from "./navigation/bottom-navigation";
import { TerminalView } from "./views/terminal-view";
import { WealthApps } from "../wealth/wealth-apps";
import { CategoryAppView } from "../categories/category-app-view";
import { addJourneyObjective } from "../journey/use-journey";
import { WorldMapView } from "../world/world-map-view";
import { AltWorldView } from "../world/alt-world-view";

type Workspace = Category | "Terminal";
export function WealthWorkspace() {
  const [worldView, setWorldView] = useState(false);
  const [worldMode, setWorldMode] = useState<"default" | "alt">("default");
  const [altWorldVisited, setAltWorldVisited] = useState(false);
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
    flushSync(() => { setActiveCategory(category); setWorldView(false); });
    const prompt = input.current;
    prompt?.focus({ preventScroll: true });
    prompt?.setSelectionRange(prompt.value.length, prompt.value.length);
  }
  return <main className="wealth-page relative isolate">
    <PrimaryColumn>
      <SecondaryColumn content={<div className="flex min-h-0 flex-1 flex-col">
        <section id="workspace-world" aria-label="World view" className={worldView ? "fixed inset-0 z-0 overflow-hidden bg-[#f9c486]" : "hidden"}>
          <div id="world-default" aria-label="Default world view" className={worldMode === "default" ? "h-full w-full" : "hidden"}>
            <WorldMapView />
          </div>
          <div id="world-alt" aria-label="Alt world view — location-based gameplay" className={worldMode === "alt" ? "h-full w-full" : "hidden"}>
            {altWorldVisited && <AltWorldView />}
          </div>
        </section>
        <div id="workspace-terminal" className={worldView ? "hidden" : "min-h-0 flex-1"}>
        <TerminalView title={workspace} hideHeader={activeCategory !== null}>
        <div className={activeCategory === "Wealth" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
          <WealthApps completed={completed} onToggle={toggleTask} />
          {notes.length > 0 && activeCategory === "Wealth" && <ol aria-label="Wealth session actions" aria-live="polite" className="max-h-28 shrink-0 space-y-2 overflow-y-auto px-5 py-2">{notes.map((entry) => <li key={entry.id} className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-white/65">› {entry.text}</li>)}</ol>}
        </div>
        <div className={activeCategory === "Wealth" ? "hidden" : "flex min-h-0 flex-1 flex-col"}>
          <TerminalLog entries={notes} category={activeCategory} header={activeCategory ? <CategoryAppView key={activeCategory} category={activeCategory} completed={completed} onToggle={toggleTask} /> : undefined} />
        </div>
        <ActionComposer inputRef={input} value={drafts[workspace] ?? ""} onChange={(value) => setDrafts((previous) => ({ ...previous, [workspace]: value }))} onSubmit={addNote} />
      </TerminalView>
        </div>
      </div>}
        navigation={<div className="relative z-10">
          <BottomNavigation activeCategory={activeCategory} onSelect={selectCategory} />
          <aside aria-label="Display controls" className="wealth-visor-rail absolute z-40 flex flex-col items-center gap-2">
            <button type="button" aria-label={worldView ? "Close visor — show terminal" : "Open visor — show world map"} aria-pressed={worldView} aria-controls="workspace-terminal workspace-world" title={worldView ? "Close visor" : "Open visor"} onClick={() => setWorldView((previous) => !previous)} className={`relative grid h-12 w-12 touch-manipulation select-none place-items-center rounded-xl bg-transparent ${worldView ? "text-white" : "text-white/60 hover:text-white"}`}>
              <span aria-hidden="true" className="absolute h-9 w-9 bg-current transition-[opacity,transform] duration-150 motion-reduce:transition-none" style={{ mask: `url('/icons/${worldView ? "helmet" : "helmet-visor-closed"}.svg?v=2') center / contain no-repeat`, WebkitMask: `url('/icons/${worldView ? "helmet" : "helmet-visor-closed"}.svg?v=2') center / contain no-repeat` }} />
            </button>
          </aside>
        </div>} />
    </PrimaryColumn>
    {worldView && <aside aria-label="World view selection" className="wealth-world-mode-rail fixed z-40 w-32 rounded-xl bg-black/60 p-0.5 text-white shadow-lg backdrop-blur-md">
      <div role="group" aria-label="World mode" className="flex gap-0.5">
        {(["default", "alt"] as const).map((mode) => <button key={mode} type="button" aria-pressed={worldMode === mode} aria-controls={`world-${mode}`} onClick={() => { if (mode === "alt") setAltWorldVisited(true); setWorldMode(mode); }} className={`grid min-h-11 w-full touch-manipulation place-items-center rounded-lg text-[10px] transition-colors ${worldMode === mode ? "bg-white/20 text-white" : "text-white/50 hover:bg-white/10 hover:text-white"}`}>{mode === "default" ? "Default" : "Alt"}</button>)}
      </div>
    </aside>}
  </main>;
}

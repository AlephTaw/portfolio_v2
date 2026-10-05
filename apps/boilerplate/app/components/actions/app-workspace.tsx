"use client";
import { useRef, useState } from "react";
import { ActionComposer } from "./action-composer";
import { TerminalLog, type TerminalEntry } from "./history/terminal-log";
import { PrimaryColumn } from "./layouts/primary-column";
import { SecondaryColumn } from "./layouts/secondary-column";
import { BottomNavigation } from "./navigation/bottom-navigation";
import { TerminalView } from "./views/terminal-view";

export function AppWorkspace() {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const nextId = useRef(1);
  const input = useRef<HTMLTextAreaElement>(null);
  function addNote(text: string) {
    const entry = { id: nextId.current++, text };
    setEntries((previous) => [...previous, entry]);
  }
  return <main className="app-page">
    <PrimaryColumn>
      <SecondaryColumn content={<TerminalView><TerminalLog entries={entries} /><ActionComposer inputRef={input} onSubmit={addNote} /></TerminalView>}
        navigation={<BottomNavigation onFocusInput={() => input.current?.focus()} />} />
    </PrimaryColumn>
  </main>;
}

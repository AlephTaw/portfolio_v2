"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useStateView } from "../../state/components/state-view-context";

const chipClass = "inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/30 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white";

export function CreateQuestControl() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { setQuests } = useStateView();

  return <div className="min-w-0">
    <button type="button" className={chipClass} aria-expanded={open} onClick={() => setOpen(previous => !previous)}><FiPlus aria-hidden="true" />Create new quest</button>
    {open && <form className="mt-3 grid gap-3 rounded-xl border border-white/15 p-4" onSubmit={event => {
      event.preventDefault();
      if (!name.trim()) return;
      setQuests(previous => [...previous, name.trim()]);
      setName("");
      setOpen(false);
    }}>
      <label className="grid gap-2 text-xs text-white/65">Quest name<input autoFocus required value={name} onChange={event => setName(event.target.value)} className="w-full rounded-xl border border-white/20 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/55" /></label>
      <div className="flex flex-wrap gap-2"><button type="submit" className={chipClass}>Create quest</button><button type="button" className={chipClass} onClick={() => setOpen(false)}>Cancel</button></div>
    </form>}
  </div>;
}

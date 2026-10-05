"use client";

import { useId, useRef, useState } from "react";
import { useWatcher } from "../../watcher/watcher";
import { normalizeComponentConfig } from "../settings/component-config";

export function ComponentSettingsView() {
  const { settingsTarget, componentConfigs, setComponentConfigs, dispatch } = useWatcher();
  const [draft, setDraft] = useState(componentConfigs[settingsTarget]);
  const [saved, setSaved] = useState(false);
  const systemPrefix = useId();
  const nextSystemId = useRef(0);
  const inputClass = "admin-input min-h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm focus:border-[var(--speedrun-blue)]";
  const update = (next: typeof draft) => { setDraft(next); setSaved(false); };
  return <div className="view-glass min-h-full pb-6 text-white">
    <header className="flex min-h-11 items-center gap-3 px-4"><button type="button" aria-label="Back to configuration" onClick={() => dispatch({ type: "open-panel", view: "settings" })} className="grid h-11 w-11 place-items-center text-white/60"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m14 6-6 6 6 6" /></svg></button><h1 className="text-xs font-medium">Component · {componentConfigs[settingsTarget].displayName}</h1></header>
    <form className="mx-auto grid max-w-xl gap-4 px-4" onSubmit={(event) => {
      event.preventDefault();
      const config = normalizeComponentConfig(draft, settingsTarget);
      setComponentConfigs((previous) => ({ ...previous, [settingsTarget]: config }));
      setDraft(config);
      setSaved(true);
    }}>
      <label className="grid gap-1 text-xs text-white/65">Display name<input className={inputClass} value={draft.displayName} onChange={(event) => update({ ...draft, displayName: event.target.value })} /></label>
      <section aria-label="Component systems" className="grid gap-3">
        <h2 className="text-sm font-medium">Systems</h2>
        {draft.systems.map((system, index) => <fieldset key={system.id} className="grid gap-3 rounded-xl bg-black/15 p-3">
          <legend className="sr-only">System {index + 1}</legend>
          <label className="grid gap-1 text-xs text-white/65">System name<input required className={inputClass} value={system.name} onChange={(event) => update({ ...draft, systems: draft.systems.map((item) => item.id === system.id ? { ...item, name: event.target.value } : item) })} /></label>
          <label className="grid gap-1 text-xs text-white/65">Actions / protocol · one per line<textarea className={`${inputClass} min-h-24 resize-y`} value={system.protocol} onChange={(event) => update({ ...draft, systems: draft.systems.map((item) => item.id === system.id ? { ...item, protocol: event.target.value } : item) })} /></label>
          <div className="flex items-center justify-between gap-3"><label className="flex min-h-11 items-center gap-2 text-xs"><input type="checkbox" checked={system.enabled} onChange={(event) => update({ ...draft, systems: draft.systems.map((item) => item.id === system.id ? { ...item, enabled: event.target.checked } : item) })} />Show in component</label><button type="button" className="min-h-11 px-2 text-xs text-white/50" onClick={() => update({ ...draft, systems: draft.systems.filter((item) => item.id !== system.id) })}>Remove system</button></div>
        </fieldset>)}
        <button type="button" className="min-h-11 rounded-xl border border-dashed border-white/20 px-3 text-xs text-white/65" onClick={() => update({ ...draft, systems: [...draft.systems, { id: `${systemPrefix}-${++nextSystemId.current}`, name: "", protocol: "", enabled: true }] })}>+ Add system</button>
      </section>
      <div className="flex flex-wrap items-center gap-3"><button type="submit" className="admin-accent-button min-h-11 rounded-full bg-[var(--app-accent)] px-4 text-xs text-white">Save component settings</button>{saved && <p role="status" className="text-xs text-white/55">Saved for this session.</p>}</div>
      <p className="text-[11px] leading-5 text-white/45">These settings apply to this component only. Added systems appear as protocol cards; they do not replace built-in features or execute actions.</p>
    </form>
  </div>;
}

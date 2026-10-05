"use client";

import { useWatcher } from "../../watcher/watcher";

export function SettingsMenuView() {
  const { settingsTarget, componentConfigs, dispatch } = useWatcher();
  return <div className="view-glass flex h-full min-h-0 flex-col px-4 pb-4 text-white">
    <header className="flex h-11 shrink-0 items-center"><h1 className="text-xs font-medium text-white/70">Configuration</h1></header>
    <button type="button" onClick={() => dispatch({ type: "open-panel", view: "component-settings" })} className="flex min-h-16 shrink-0 flex-col items-start justify-center rounded-xl bg-black/20 px-4 py-3 text-left hover:bg-white/10">
      <span className="text-sm font-medium">Component</span>
      <span className="mt-1 text-xs text-white/45">{componentConfigs[settingsTarget].displayName}</span>
    </button>
    <button type="button" onClick={() => dispatch({ type: "open-panel", view: "harness" })} className="mt-auto flex min-h-16 shrink-0 items-center rounded-xl bg-black/20 px-4 py-3 text-left hover:bg-white/10">
      <span className="text-sm font-medium">Harness</span>
    </button>
    <button type="button" onClick={() => dispatch({ type: "open-panel", view: "admin" })} className="mt-2 flex min-h-16 shrink-0 items-center gap-3 rounded-xl bg-black/20 px-4 py-3 text-left hover:bg-white/10">
      <span aria-hidden="true" className="h-10 w-10 shrink-0 rounded-full bg-[#242329]" style={{ backgroundImage: "url('/build-toon-covers-v4.png')", backgroundSize: "300% auto", backgroundPosition: "50% 22%" }} />
      <span className="text-sm font-medium">Profile Admin</span>
    </button>
  </div>;
}

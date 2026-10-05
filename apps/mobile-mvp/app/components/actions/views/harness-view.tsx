"use client";

import { useWatcher } from "../../watcher/watcher";
import { defaultGlassTint } from "../design-system/glass-tint";
import { DesignSystemSummary } from "../design-system/design-system-summary";

export function HarnessView() {
  const { panelTheme, setPanelTheme, glassTint, setGlassTint } = useWatcher();
  return <section aria-label="Harness configuration" className="view-glass min-h-full px-4 py-4 pb-8 text-white">
    <h1 className="text-xs font-medium text-white/70">Harness configuration</h1>
    <details className="group/design-system mt-6">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-white/90 [&::-webkit-details-marker]:hidden"><span>Design system</span><svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-white/50 group-open/design-system:rotate-180"><path d="m4 6 4 4 4-4" /></svg></summary>
      <div className="mt-3 space-y-5">
      <p className="text-[11px] leading-5 text-white/50">Shared appearance for every activity window. Changes apply immediately and last for this session.</p>
      <div className="rounded-xl bg-black/15 p-3">
        <h3 className="text-xs font-medium text-white/80">Color mode</h3>
        <div role="group" aria-label="Color theme" className="mt-3 inline-flex gap-1 rounded-full bg-black/20 p-1">{(["dark", "light"] as const).map((theme) => <button key={theme} type="button" aria-pressed={panelTheme === theme} onClick={() => setPanelTheme(theme)} className={`min-h-11 rounded-full px-4 text-xs capitalize ${panelTheme === theme ? "design-system-accent bg-[var(--app-accent)] text-white" : "text-white/60"}`}>{theme}</button>)}</div>
      </div>
      <div className="space-y-4 rounded-xl bg-black/15 p-3">
        <div className="flex items-center justify-between gap-3"><h3 className="text-xs font-medium text-white/80">Adaptive glass tint</h3><button type="button" role="switch" aria-label="Adaptive glass tint" aria-checked={glassTint.enabled} onClick={() => setGlassTint((previous) => ({ ...previous, enabled: !previous.enabled }))} className="min-h-11 rounded-full bg-white/5 px-3 text-[11px] text-white/70">{glassTint.enabled ? "On" : "Off"}</button></div>
        <p className="text-[11px] leading-5 text-white/50">Clear below the brightness threshold; gradually tinted above it. Light mode reverses this to protect dark text. Sampling follows the visible window as you resize or scroll.</p>
        <label className="block text-xs text-white/70"><span className="flex justify-between gap-3"><span>Maximum tint</span><span className="tabular-nums">{Math.round(glassTint.strength * 100)}%</span></span><input aria-label="Maximum glass tint" type="range" min="0" max="95" step="1" disabled={!glassTint.enabled} value={Math.round(glassTint.strength * 100)} onChange={(event) => setGlassTint((previous) => ({ ...previous, strength: Number(event.target.value) / 100 }))} className="mt-2 h-11 w-full accent-[var(--app-accent)] disabled:opacity-40" /></label>
        <label className="block text-xs text-white/70"><span className="flex justify-between gap-3"><span>Brightness threshold</span><span className="tabular-nums">{Math.round(glassTint.threshold * 100)}%</span></span><input aria-label="Glass brightness threshold" type="range" min="0" max="80" step="1" disabled={!glassTint.enabled} value={Math.round(glassTint.threshold * 100)} onChange={(event) => setGlassTint((previous) => ({ ...previous, threshold: Number(event.target.value) / 100 }))} className="mt-2 h-11 w-full accent-[var(--app-accent)] disabled:opacity-40" /></label>
        <label className="block text-xs text-white/70"><span className="flex justify-between gap-3"><span>Background blur</span><span className="tabular-nums">{glassTint.blur}px</span></span><input aria-label="Glass background blur" type="range" min="0" max="80" step="2" value={glassTint.blur} onChange={(event) => setGlassTint((previous) => ({ ...previous, blur: Number(event.target.value) }))} className="mt-2 h-11 w-full accent-[var(--app-accent)]" /><span className="block text-[11px] leading-5 text-white/45">Softens background detail without blurring the interface. Works even when adaptive tint is off.</span></label>
        <button type="button" className="min-h-11 rounded-full bg-white/5 px-3 text-[11px] text-white/60" onClick={() => setGlassTint(defaultGlassTint)}>Reset glass</button>
      </div>
      <DesignSystemSummary />
      </div>
    </details>
  </section>;
}

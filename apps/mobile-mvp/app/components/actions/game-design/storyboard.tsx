"use client";

import { useState } from "react";
import { useWatcher } from "../../watcher/watcher";
import { NarrationInput } from "./narration-input";

export function Storyboard({ editable = false, preview = false, outline: controlledOutline, onOutlineChange, showViewToggle = true }: { editable?: boolean; preview?: boolean; outline?: boolean; onOutlineChange?: (outline: boolean) => void; showViewToggle?: boolean }) {
  const { storyScenes, setStoryScenes, storyScript, setStoryScript } = useWatcher();
  const [localOutline, setLocalOutline] = useState(false);
  const outline = controlledOutline ?? localOutline;
  const setOutline = onOutlineChange ?? setLocalOutline;
  const [selected, setSelected] = useState<string | null>(null);
  const canEdit = editable && !preview;
  const editingScene = storyScenes.find((scene) => scene.id === selected);
  return <section aria-label={editable ? "Authorship" : outline ? "Outline" : "Storyboard"} className="space-y-4">
    <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-medium text-white/90">{editable ? "Authorship" : outline ? "Outline" : "Storyboard"}</h2>{showViewToggle && <button type="button" onClick={() => setOutline(!outline)} className="min-h-11 rounded-full bg-white/5 px-3 text-[11px] text-white/65 hover:bg-white/10">{outline ? "Storyboard view" : "Outline view"}</button>}</div>
    <ol className={outline ? "space-y-3" : "grid grid-cols-3 gap-2"}>{storyScenes.map((scene, index) => <li key={scene.id} className={`min-w-0 ${outline ? "flex gap-3 border-b border-white/5 pb-3 last:border-0" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={scene.image} alt={`${scene.title} scene`} className={outline ? "h-20 w-14 shrink-0 rounded-lg object-cover" : "mb-2 aspect-[4/5] w-full rounded-xl object-cover"} />
      <div className="min-w-0 flex-1">
        <h3 className="text-xs font-medium leading-5 text-white/85"><span className="mr-1 text-white/35">{index + 1}.</span>{scene.title}</h3>
        <p className="mt-1 text-[11px] leading-5 text-white/50">{scene.text}</p>
        {canEdit && <button type="button" aria-expanded={selected === scene.id} aria-label={`Edit ${scene.title} scene`} onClick={() => setSelected(selected === scene.id ? null : scene.id)} className="mt-1 min-h-11 text-[11px] text-white/60 hover:text-white">{selected === scene.id ? "Done" : "Edit scene"}</button>}
      </div>
    </li>)}</ol>
    {canEdit && editingScene && <div className="space-y-3 rounded-xl bg-black/20 p-3">
      <label className="block text-[11px] text-white/55">Scene title<input value={editingScene.title} maxLength={80} onChange={(event) => setStoryScenes((previous) => previous.map((item) => item.id === editingScene.id ? { ...item, title: event.target.value } : item))} className="actions-input mt-1 min-h-11 w-full rounded-lg p-2 text-xs text-white" /></label>
      <label className="block text-[11px] text-white/55">Scene outline<textarea value={editingScene.text} maxLength={700} onChange={(event) => setStoryScenes((previous) => previous.map((item) => item.id === editingScene.id ? { ...item, text: event.target.value } : item))} className="actions-input mt-1 min-h-24 w-full rounded-lg p-2 text-xs leading-5 text-white" /></label>
    </div>}
    {editable && <div className="rounded-xl bg-black/15 p-3">
      <label className="block text-xs text-white/75">Chapter script · up to 700 characters<textarea aria-label="Authorship script" value={storyScript} readOnly={!canEdit} maxLength={700} onChange={(event) => setStoryScript(event.target.value.slice(0, 700))} placeholder="Write the story of the actions you took, what changed, and what comes next…" rows={5} className="actions-input mt-2 w-full resize-y rounded-xl p-3 text-xs leading-5 text-white" /></label>
      <div className="mt-1 flex justify-between text-[10px] text-white/45"><span>Aim for ~50 seconds spoken; timing varies.</span><span>{storyScript.length}/700</span></div>
      {canEdit && <NarrationInput />}
    </div>}
  </section>;
}

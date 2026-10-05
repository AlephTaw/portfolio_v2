"use client";
import { useRef, useState, useSyncExternalStore } from "react";

type Photo = { url: string; name: string } | null;
const initial: Photo[] = Array.from({ length: 9 }, () => null);
let photos = initial;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function replace(index: number, photo: Photo) {
  if (photos[index]) URL.revokeObjectURL(photos[index]!.url);
  photos = photos.map((previous, slot) => slot === index ? photo : previous);
  listeners.forEach((listener) => listener());
}

export function ConnectionsGrid() {
  const slots = useSyncExternalStore(subscribe, () => photos, () => initial);
  const picker = useRef<HTMLInputElement>(null);
  const selected = useRef(0);
  const [error, setError] = useState("");
  function choose(index: number) { selected.current = index; picker.current?.click(); }
  return <section aria-label="Connections photo grid" className="my-4">
    <input type="file" accept="image/*" ref={picker} className="hidden" aria-label="Choose a Connections photo" onChange={(event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) { setError("Choose an image file."); event.target.value = ""; return; }
      replace(selected.current, { url: URL.createObjectURL(file), name: file.name });
      setError(""); event.target.value = "";
    }} />
    <div className="grid grid-cols-3 gap-[2px]">
      {slots.map((photo, index) => <div key={index} className="group relative aspect-square min-w-0 overflow-hidden bg-white/[0.04]">
        <button type="button" className="absolute inset-0 grid h-full w-full place-items-center transition-colors hover:bg-white/5" aria-label={(photo ? "Replace" : "Add") + " photo " + (index + 1)} onClick={() => choose(index)}>
          {photo
            // Object URLs are local session previews and are not remote image assets.
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
            : <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-white/15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="1" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 5-5 4 4 3-3 6 6" /></svg>}
        </button>
        {photo && <button type="button" aria-label={"Remove photo " + (index + 1)} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-sm text-white/80 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100" onClick={() => replace(index, null)}>×</button>}
      </div>)}
    </div>
    {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
  </section>;
}

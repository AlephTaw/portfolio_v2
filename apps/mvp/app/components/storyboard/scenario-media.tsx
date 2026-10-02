"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type SupportingMedia = { id: string; name: string; type: string; url: string; actionId: string | null };

export function useScenarioMedia() {
  const [media, setMedia] = useState<SupportingMedia[]>([]);
  const urls = useRef(new Set<string>());
  useEffect(() => () => { for (const url of urls.current) URL.revokeObjectURL(url); }, []);
  const add = (files: File[], actionId: string | null = null) => {
          const additions = files.map((file) => {
            const url = URL.createObjectURL(file);
            urls.current.add(url);
            return { id: url, url, name: file.name, type: file.type, actionId };
          });
          setMedia((current) => [...current, ...additions]);
  };
  const remove = (item: SupportingMedia) => {
    setMedia((current) => current.filter((entry) => entry.id !== item.id));
    URL.revokeObjectURL(item.url);
    urls.current.delete(item.url);
  };
  const attach = (id: string, actionId: string | null) => setMedia((current) => current.map((entry) => entry.id === id ? { ...entry, actionId } : entry));
  return { media, add, remove, attach };
}

export function MediaUpload({ onUpload, label = "Upload supporting media", text = "Add media", compact = false }: { onUpload: (files: File[]) => void; label?: string; text?: string; compact?: boolean }) {
  return <label className={`inline-block cursor-pointer rounded-full border border-white/25 text-white/65 hover:border-white focus-within:outline focus-within:outline-white ${compact ? "px-2 py-0.5 text-[0.65rem]" : "px-3 py-1.5 text-xs"}`}>{text}
        <input aria-label={label} type="file" accept="image/*,video/*,audio/*" multiple className="sr-only" onChange={(event) => {
          onUpload(Array.from(event.target.files ?? []).filter((file) => /^(image|video|audio)\//.test(file.type)));
          event.target.value = "";
        }} />
      </label>;
}

export function MediaAttachments({ media, onRemove, actions, onAttach, compact = false }: {
  media: SupportingMedia[];
  onRemove: (item: SupportingMedia) => void;
  actions?: { id: string; label: string }[];
  onAttach?: (id: string, actionId: string | null) => void;
  compact?: boolean;
}) {
  return <ul className={compact ? "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3" : "mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2"}>
    {media.map((item) => <li key={item.id} className="min-w-0">
        {item.type.startsWith("image/") ? <Image unoptimized width={640} height={400} alt={item.name} src={item.url} className={`${compact ? "h-24" : "h-40"} w-full rounded-lg bg-white/5 object-contain`} />
          : item.type.startsWith("video/") ? <video aria-label={item.name} src={item.url} controls className={`${compact ? "h-24" : "h-40"} w-full rounded-lg bg-white/5`} />
            : <audio aria-label={item.name} src={item.url} controls className="w-full" />}
        <div className={`${compact ? "mt-1 text-[0.6rem]" : "mt-2 text-xs"} flex items-start justify-between gap-2`}>
          <span title={item.name} className={`${compact ? "min-w-0 truncate" : "break-all"} text-white/65`}>{item.name}</span>
          <button type="button" aria-label={`Remove ${item.name}`} className="shrink-0 cursor-pointer text-white/45 hover:text-white" onClick={() => onRemove(item)}>Remove</button>
        </div>
        {actions && onAttach && <label className="mt-2 block text-xs text-white/45">Outline section
          <select aria-label={`Attach ${item.name} to outline section`} value={actions.some((action) => action.id === item.actionId) ? item.actionId ?? "" : ""} onChange={(event) => onAttach(item.id, event.target.value || null)} className="mt-1 block w-full rounded-lg border border-white/20 bg-black p-2 text-xs text-white/70">
            <option value="">Supporting media only</option>
            {actions.map((action, index) => <option key={action.id} value={action.id}>{index + 1}. {action.label}</option>)}
          </select>
        </label>}
      </li>)}
    </ul>;
}

export function ScenarioMedia({ library, actions }: { library: ReturnType<typeof useScenarioMedia>; actions: { id: string; label: string }[] }) {
  return <section aria-label="Uploaded media" className="mt-6 border-t border-white/15 pt-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h4 className="text-xs font-medium uppercase tracking-wider text-white/65">Uploaded media</h4>
      <MediaUpload onUpload={(files) => library.add(files)} />
    </div>
    <p className="mt-2 text-xs text-white/40">Local previews while this view is open. Files are not sent to a server.</p>
    {library.media.length === 0 ? <p className="mt-3 text-sm text-white/45">No supporting media uploaded yet.</p> : <MediaAttachments media={library.media} onRemove={library.remove} actions={actions} onAttach={library.attach} />}
  </section>;
}

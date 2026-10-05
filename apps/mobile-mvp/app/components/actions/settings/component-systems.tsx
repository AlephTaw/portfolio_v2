"use client";

import { useWatcher } from "../../watcher/watcher";
import type { SettingsTarget } from "./component-config";

export function ComponentHeading({ target }: { target: SettingsTarget }) {
  const { componentConfigs } = useWatcher();
  return <h1 className="text-xs font-medium text-white/70">{componentConfigs[target].displayName}</h1>;
}

export function ComponentSystems({ target }: { target: SettingsTarget }) {
  const { componentConfigs } = useWatcher();
  const systems = componentConfigs[target].systems.filter((system) => system.enabled);
  if (!systems.length) return null;
  return <section aria-label={`${componentConfigs[target].displayName} custom systems`} className="space-y-2 px-4 py-3 text-white">
    {systems.map((system) => <article key={system.id} className="rounded-xl bg-black/20 p-3">
      <h2 className="text-xs font-semibold">{system.name}</h2>
      {system.protocol.trim() && <ul className="mt-2 space-y-1 text-xs leading-5 text-white/65">{system.protocol.split("\n").filter((line) => line.trim()).map((line, index) => <li key={index}>{line}</li>)}</ul>}
    </article>)}
  </section>;
}

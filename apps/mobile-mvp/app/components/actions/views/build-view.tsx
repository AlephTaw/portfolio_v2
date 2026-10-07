"use client";

import { useState } from "react";
import { useWatcher } from "../../watcher/watcher";
import { GameDesignView } from "./game-design-view";
import { ArtworkTile } from "./artwork-tile";
import { ProfileSummary } from "../profile/profile-summary";
import { ComponentHeading, ComponentSystems } from "../settings/component-systems";
import { Storyboard } from "../game-design/storyboard";

const characters = [
  { title: "Explorer", description: "Awareness · discovery", position: "0%" },
  { title: "Builder", description: "Skills · resilience", position: "50%" },
  { title: "Connector", description: "Relationships · community", position: "100%" },
] as const;

function CoverRow({ title, image, compact = false }: { title: string; image: string; compact?: boolean }) {
  return <section aria-label={title}>
    <div className="grid grid-cols-3 gap-2">
      {characters.map((character, index) => <article key={character.title} className="min-w-0">
        <ArtworkTile image={image} position={character.position} label={compact ? ["Earth's blue atmosphere", "Sunrise over Earth", "Earth clouds and moon"][index] : `${character.title} toon character portrait`} aspect={compact ? "aspect-[2/3]" : "aspect-[1/2]"} />
      </article>)}
    </div>
  </section>;
}

export function BuildView({ preview = false }: { preview?: boolean }) {
  const { gameDesignOpen } = useWatcher();
  const [cutsceneOpen, setCutsceneOpen] = useState(false);
  const [outliner, setOutliner] = useState(false);
  const designing = gameDesignOpen && !preview;
  return <div className={`view-glass min-h-full ${designing ? "pb-6" : ""}`}>
        <ProfileSummary name="Alex Morgan" build="Builder" level={1} image="/build-toon-covers-v4.png" actions={!designing && !preview ? <div className="flex items-center gap-2">
          <button type="button" aria-pressed={cutsceneOpen} onClick={() => setCutsceneOpen((open) => !open)} className="min-h-11 rounded-full bg-white/5 px-3 text-[11px] text-white/65 hover:bg-white/10 focus-visible:outline focus-visible:outline-white/60">Cutscenes</button>
          <button type="button" role="switch" aria-label="Outliner" aria-checked={outliner} onClick={() => { setOutliner((value) => !value); setCutsceneOpen(true); }} className="flex min-h-11 items-center gap-2 rounded-full px-1 text-[11px] text-white/65 focus-visible:outline focus-visible:outline-white/60">
            <span>Outliner</span><span aria-hidden="true" className={`flex h-4 w-7 items-center rounded-full p-0.5 transition-colors ${outliner ? "bg-[#353f89]" : "bg-white/15"}`}><span className={`h-3 w-3 rounded-full bg-white/80 transition-transform motion-reduce:transition-none ${outliner ? "translate-x-3" : "translate-x-0"}`} /></span>
          </button>
        </div> : undefined} />
        {designing ? <GameDesignView /> : cutsceneOpen && !preview ? <div className="p-3"><Storyboard outline={outliner} onOutlineChange={setOutliner} showViewToggle={false} /></div> : <div className="pb-2">
        <ComponentSystems target="build" />
        <header className="relative h-[56dvh] min-h-80 max-h-[620px] overflow-hidden bg-[#242329]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/build-hero-toon-v4.png" alt="Quietly drawn desert travelers beneath a pale turquoise sky" className="absolute inset-0 h-full w-full object-cover object-[center_35%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" />
          <div className="sr-only"><ComponentHeading target="build" /></div>
          <div aria-hidden="true" className="absolute bottom-4 left-4 flex gap-1.5"><span className="h-1 w-1 rounded-full bg-white" /><span className="h-1 w-1 rounded-full bg-white/30" /><span className="h-1 w-1 rounded-full bg-white/30" /></div>
        </header>
        {/* Comic panels share 8px outer/inter-panel gutters; the edge-to-edge
            summary panel gets a distinct 24px break before the cover grid. */}
        <div className="mt-6 space-y-2 px-2">
          <CoverRow title="Character builds" image="/build-toon-covers-v4.png" />
          <CoverRow title="Earth and space" image="/build-space-covers-v2.png" compact />
        </div>
    </div>}
  </div>;
}

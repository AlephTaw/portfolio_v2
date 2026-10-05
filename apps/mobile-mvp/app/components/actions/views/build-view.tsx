"use client";

import { useWatcher } from "../../watcher/watcher";
import { GameDesignView } from "./game-design-view";
import { ArtworkTile } from "./artwork-tile";
import { ProfileSummary } from "../profile/profile-summary";
import { ComponentHeading, ComponentSystems } from "../settings/component-systems";

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
  const designing = gameDesignOpen && !preview;
  return <div className={`view-glass min-h-full ${designing ? "pb-6" : ""}`}>
        <ProfileSummary name="Alex Morgan" build="Builder" level={1} image="/build-toon-covers-v4.png" />
        {designing ? <GameDesignView /> : <div className="pb-2">
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

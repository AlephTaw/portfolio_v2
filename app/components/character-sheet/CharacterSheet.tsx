import { Achievements } from "./Achievements";
import { CampaignSummary } from "./CampaignSummary";
import { CharacterStats } from "./CharacterStats";
import { DevLog } from "./DevLog";

export function CharacterSheet({ className = "" }: { className?: string }) {
  return (
    <section
      aria-label="Character Sheet"
      className={`text-[#191919] ${className}`.trim()}
    >
      <div className="mx-auto w-full max-w-xl lg:mx-0">
        <div className="flex items-center justify-between gap-4">
          <p className="text-left text-[0.55rem] uppercase tracking-[0.28em] text-[#7f7f7f]">
            Public Alpha
          </p>
          <button
            className="whitespace-nowrap border border-black bg-transparent px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-[#f5f5f5]"
            type="button"
          >
            Join!
          </button>
        </div>

        <CharacterStats />
        <CampaignSummary />
        <DevLog />
        <Achievements />
      </div>
    </section>
  );
}

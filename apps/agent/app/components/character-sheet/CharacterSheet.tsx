"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Achievements } from "./Achievements";
import { CampaignSummary } from "./CampaignSummary";
import { CharacterStats } from "./CharacterStats";
import { DevLog } from "./DevLog";

function ClickableSection({
  bottomCornerOffset,
  children,
  cornerColor,
  href,
  label,
  topCornerOffset,
}: {
  bottomCornerOffset: string;
  children: ReactNode;
  cornerColor: string;
  href: string;
  label: string;
  topCornerOffset: string;
}) {
  return (
    <div className="group relative flow-root hover:z-[200] focus-within:z-[200]">
      <Link
        aria-label={`Open ${label}`}
        className="absolute inset-0 z-10 cursor-pointer focus:outline-none"
        href={href}
      >
        <span className="sr-only">Open {label}</span>
      </Link>
      <div className="pointer-events-none relative z-20 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_select]:pointer-events-auto [&_textarea]:pointer-events-auto">
        {children}
      </div>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -left-4 z-[210] size-6 border-l-[3px] border-t-[3px] opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100 group-focus-within:opacity-100 ${cornerColor}`}
        style={{ top: topCornerOffset }}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-4 z-[210] size-6 border-b-[3px] border-r-[3px] opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100 group-focus-within:opacity-100 ${cornerColor}`}
        style={{ bottom: `-${bottomCornerOffset}` }}
      />
    </div>
  );
}

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
            className="h-6 whitespace-nowrap border border-black bg-transparent px-3 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-[#f5f5f5]"
            type="button"
          >
            Join!
          </button>
        </div>

        <div className="relative">
          <ClickableSection
            bottomCornerOffset="1.75rem"
            cornerColor="border-[#5E8FA8]"
            href="/live-stats/character-stats"
            label="Character Stats"
            topCornerOffset="0.5rem"
          >
            <CharacterStats />
          </ClickableSection>
          <ClickableSection
            bottomCornerOffset="1rem"
            cornerColor="border-[#8D7A70]"
            href="/live-stats/campaign-summary"
            label="Campaign Summary"
            topCornerOffset="1.75rem"
          >
            <CampaignSummary />
          </ClickableSection>
          <ClickableSection
            bottomCornerOffset="1.125rem"
            cornerColor="border-[#FFC548]"
            href="/live-stats/commit-history"
            label="Commit History"
            topCornerOffset="1rem"
          >
            <DevLog />
          </ClickableSection>
          <ClickableSection
            bottomCornerOffset="1.5rem"
            cornerColor="border-[#89A968]"
            href="/live-stats/achievements"
            label="Achievements"
            topCornerOffset="1.125rem"
          >
            <Achievements />
          </ClickableSection>
        </div>
      </div>
    </section>
  );
}

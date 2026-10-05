"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import portrait from "../../../agent/public/assets/live-stats-profile.png";
import { StoryboardBuilder } from "./storyboard";

export type Stat = {
  label: string;
  status: string;
  points: string;
  chartLabel: string;
  chartValue: number;
  chartDisplay: string;
};

const syncRatioStatus = "84%";
const streakStatus = "6 days";

const stats: Stat[] = [
  { label: "Sync Ratio", status: syncRatioStatus, points: "", chartLabel: "Sync Ratio", chartValue: 84, chartDisplay: "84%" },
  { label: "Streak", status: streakStatus, points: "", chartLabel: "Sync Ratio", chartValue: 84, chartDisplay: "84%" },
  { label: "Experience", status: "—", points: "0 XP", chartLabel: "Experience", chartValue: 0, chartDisplay: "0 XP" },
  { label: "Health", status: "hours/24", points: "0 HP", chartLabel: "Health", chartValue: 0, chartDisplay: "0 / 24" },
  { label: "Wealth", status: "—", points: "", chartLabel: "Wealth", chartValue: 0, chartDisplay: "0" },
  { label: "Sentience", status: "—", points: "0 AP · 0 PP · 0 MP", chartLabel: "Sentience", chartValue: 0, chartDisplay: "0 AP · 0 PP · 0 MP" },
  { label: "Skills", status: "—", points: "0 SP", chartLabel: "Skills", chartValue: 0, chartDisplay: "0 SP" },
  { label: "Titles", status: "—", points: "", chartLabel: "Titles", chartValue: 0, chartDisplay: "0" },
  { label: "Builds", status: "0", points: "0 BP", chartLabel: "Builds", chartValue: 0, chartDisplay: "0 BP" },
];

const sentienceStats: Stat[] = [
  { label: "Interaction", status: "hours/24", points: "0 KP", chartLabel: "Interaction", chartValue: 0, chartDisplay: "0 / 24" },
  { label: "Personality", status: "—", points: "0 AP", chartLabel: "Personality", chartValue: 0, chartDisplay: "0 AP" },
  { label: "Perception", status: "—", points: "0 PP", chartLabel: "Perception", chartValue: 0, chartDisplay: "0 PP" },
  { label: "Volition", status: "hours/24", points: "0 MP", chartLabel: "Volition", chartValue: 0, chartDisplay: "0 / 24" },
];

export function StatChart({ stat }: { stat: Stat }) {
  return (
    <div
      aria-label={`${stat.chartLabel}: ${stat.chartDisplay}`}
      className="relative grid h-full w-full place-items-center rounded-full transition-opacity duration-200"
      role="img"
      style={{
        background: `conic-gradient(#f5f5f5 ${stat.chartValue}%, rgba(245,245,245,0.16) 0)`,
      }}
    >
      <div className="grid size-[72%] place-content-center rounded-full bg-black px-2 text-center">
        <span className="text-[0.42rem] font-semibold uppercase tracking-[0.08em] text-white/50">
          {stat.chartLabel}
        </span>
        <strong className="mt-1 text-sm font-medium tracking-[0.06em] text-white">
          {stat.chartDisplay}
        </strong>
      </div>
    </div>
  );
}



export function CharacterStatsSummary({ onActiveStat }: { onActiveStat: (stat: Stat | null) => void }) {
  const [sentienceExpanded, setSentienceExpanded] = useState(false);
  return (
    <>
                <div className="grid grid-cols-[minmax(9rem,1fr)_minmax(7rem,0.65fr)_minmax(4rem,auto)] gap-x-5 border-b border-white/15 pb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
                  <span>Attributes</span>
                  <span className="text-right">Status</span>
                  <span className="text-right">Points</span>
                </div>

                <dl className="mt-6" onMouseLeave={() => onActiveStat(null)}>
                  {stats.map((stat) => (
                    <Fragment key={stat.label}>
                      <div
                        aria-expanded={stat.label === "Sentience" ? sentienceExpanded : undefined}
                        className={`grid cursor-pointer grid-cols-[minmax(9rem,1fr)_minmax(7rem,0.65fr)_minmax(4rem,auto)] items-center gap-x-5 py-1.5 text-[0.7rem] uppercase tracking-[0.26em] outline-none transition-colors hover:text-white focus-visible:bg-white/5 ${
                          stat.label === "Experience" || stat.label === "Skills" ? "mt-7" : ""
                        }`}
                        key={stat.label}
                        onBlur={() => onActiveStat(null)}
                        onClick={() => stat.label === "Sentience" && setSentienceExpanded((expanded) => !expanded)}
                        onFocus={() => onActiveStat(stat)}
                        onKeyDown={(event) => {
                          if (stat.label !== "Sentience" || (event.key !== "Enter" && event.key !== " ")) return;
                          event.preventDefault();
                          setSentienceExpanded((expanded) => !expanded);
                        }}
                        onMouseEnter={() => onActiveStat(stat)}
                        role={stat.label === "Sentience" ? "button" : undefined}
                        tabIndex={0}
                      >
                        <dt className="flex items-center justify-between gap-3 text-white/50 transition-colors group-hover:text-white">
                          <span>{stat.label}</span>
                          {stat.label === "Sentience" && <span aria-hidden="true" className="text-white/45">{sentienceExpanded ? "−" : "+"}</span>}
                        </dt>
                        <dd className="text-right text-white">{stat.status}</dd>
                        <dd className="text-right text-white">{stat.points}</dd>
                      </div>
                      {stat.label === "Sentience" && sentienceExpanded && (
                        <div className="ml-4 border-l border-white/20 pl-4">
                          {sentienceStats.map((substat) => (
                            <div className="grid grid-cols-[minmax(9rem,1fr)_minmax(7rem,0.65fr)_minmax(4rem,auto)] items-center gap-x-5 py-1.5 text-[0.65rem] uppercase tracking-[0.2em]" key={substat.label}>
                              <span className="text-white/45">{substat.label}</span>
                              <span className="text-right text-white/80">{substat.status}</span>
                              <span className="text-right text-white/80">{substat.points}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Fragment>
                  ))}
                </dl>
    </>
  );
}

export function CharacterViewContent() {
  const profileId = useId();
  const [characterStatsOpen, setCharacterStatsOpen] = useState(false);
  const [activeStat, setActiveStat] = useState<Stat | null>(null);
  const profileDetailsRef = useRef<HTMLDivElement>(null);
  const profileSummaryRef = useRef<HTMLDivElement>(null);
  const statsSummary = <CharacterStatsSummary onActiveStat={setActiveStat} />;
  useEffect(() => {
    const details = profileDetailsRef.current;
    const summary = profileSummaryRef.current;
    if (!details || !summary || characterStatsOpen) return;
    const measure = () => {
      details.parentElement?.style.setProperty("--profile-stack-height", `${details.getBoundingClientRect().height}px`);
      summary.style.setProperty("--profile-toggle-top", `${details.getBoundingClientRect().top - summary.getBoundingClientRect().top}px`);
      summary.style.setProperty("--profile-toggle-width", `${details.getBoundingClientRect().width}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(details);
    return () => observer.disconnect();
  }, [characterStatsOpen]);
  return (
    <section aria-label="Character" className="w-full">
                <div ref={profileSummaryRef} className="relative mx-auto mb-5 w-full">
                  <button type="button" aria-controls={profileId} onClick={() => setCharacterStatsOpen(previous => !previous)} style={{ top: "var(--profile-toggle-top, 0px)", width: "var(--profile-toggle-width, 8.5rem)" }} className="absolute left-1/2 z-10 h-8 -translate-x-1/2 cursor-pointer rounded-full border border-white/30 px-3 text-center font-sans text-xs font-normal text-white/70 transition-colors hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white">{characterStatsOpen ? "Profile Summary" : "Stats"}</button>
                  <div id={profileId}>
                  {characterStatsOpen && <div style={{ paddingTop: "calc(var(--profile-toggle-top, 0px) + 3rem)" }}>{statsSummary}</div>}
                  <div style={characterStatsOpen ? { display: "none" } : undefined} className="character-summary-layout text-[0.5rem] font-semibold uppercase tracking-normal">
                    <div style={{ height: "var(--profile-stack-height, 4.75rem)", width: "var(--profile-stack-height, 4.75rem)" }} className="character-summary-profile block size-[4.75rem] overflow-hidden rounded-full border border-white/25 bg-white/5">
                      {activeStat ? (
                        <StatChart stat={activeStat} />
                      ) : (
                        // A plain image avoids relying on a runtime image optimizer.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="Illustrated portrait of Steven Wilcox" className="h-full w-full object-cover" src={portrait.src} />
                      )}
                    </div>
                    <div ref={profileDetailsRef} className="character-summary-details grid min-h-[4.75rem] min-w-[8.5rem] content-center gap-y-1 text-left font-mono text-white/60">
                      <div aria-hidden="true" className="mb-2 h-8" />
                      <p className="min-w-0 whitespace-nowrap">Character v0.1.0</p>
                      <p className="min-w-0 whitespace-nowrap">Job: Getaway Driver</p>
                      <p className="min-w-0 whitespace-nowrap">Build: NPC</p>
                      <p className="flex min-w-0 items-center gap-1 whitespace-nowrap">
                        <span>Streak {streakStatus}</span>
                        <span>Sync Ratio {syncRatioStatus}</span>
                      </p>
                    </div>
                    <div style={{ height: "var(--profile-stack-height, 4.75rem)", width: "var(--profile-stack-height, 4.75rem)" }} className="character-summary-profile character-summary-secondary relative size-[4.75rem] overflow-hidden rounded-full border border-white/25 bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="Character bust portrait" src="/chat-reader-figure.png" className="absolute left-[-12.5%] top-[-7.5%] h-auto w-[125%] max-w-none invert" />
                    </div>
                  </div>
                  </div>
                </div>
      <div className="mt-4 w-full"><StoryboardBuilder layoutRevision={characterStatsOpen} /></div>
    </section>
  );
}

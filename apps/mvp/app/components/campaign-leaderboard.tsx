"use client";

import { useId, useState, type ReactNode } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { demoAccount } from "./chat-demo-data";
import { getArcDay, getArcTimeRemaining } from "./arc-time";

// Daily snapshots of the same demo player used in the conversations.
const dailyResults = [
  { date: "2026-09-27", syncRatio: 84, focus: "Chat flow, strength, and the Sunday reset" },
  { date: "2026-09-28", syncRatio: 76, focus: "Earning quota and meal prep" },
  { date: "2026-09-29", syncRatio: 88, focus: "Workshop build and family check-in" },
  { date: "2026-09-30", syncRatio: 80, focus: "MVSOS and mobility" },
  { date: "2026-10-01", syncRatio: 92, focus: "Daily earning quota, nutrition, and a build step" },
  { date: "2026-10-02", syncRatio: 86, focus: "Storyboard review with Build Crew" },
  { date: "2026-10-03", syncRatio: 84, focus: "Sleep, learning, and the next workshop feature" },
] as const;
const rankedResults = [...dailyResults].sort((a, b) => b.syncRatio - a.syncRatio || b.date.localeCompare(a.date)).map((result, index) => ({ ...result, rank: index + 1 }));
const latestDate = dailyResults[dailyResults.length - 1].date;
const latestResult = dailyResults[dailyResults.length - 1];
const latestMvd = { completed: 18, available: 22 };
const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

export function CampaignPlayerSummary() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-semibold text-white/75">{demoAccount.initials}</span>
      <p className="text-sm text-white/85">{demoAccount.name} <span className="text-xs text-white/45">{demoAccount.handle} · You</span></p>
    </div>
  );
}

export function CampaignLeaderboard({ characterContent }: { characterContent: ReactNode }) {
  const switcherId = useId();
  const [view, setView] = useState<"stats" | "leaderboard">("stats");
  const [order, setOrder] = useState<{ column: "rank" | "day"; direction: "ascending" | "descending" }>({ column: "rank", direction: "ascending" });
  const changeOrder = (column: "rank" | "day") => setOrder((current) => ({ column, direction: current.column === column ? current.direction === "ascending" ? "descending" : "ascending" : column === "rank" ? "ascending" : "descending" }));
  const results = [...rankedResults].sort((a, b) => {
    const comparison = order.column === "rank" ? a.rank - b.rank : a.date.localeCompare(b.date);
    return order.direction === "ascending" ? comparison : -comparison;
  });
  const orderLabel = order.column === "rank" ? order.direction === "ascending" ? "Best rank first" : "Lowest rank first" : order.direction === "descending" ? "Newest day first" : "Oldest day first";
  const OrderIcon = order.direction === "ascending" ? FiChevronUp : FiChevronDown;
  return <div className="mt-5 min-w-0">
    <dl aria-label="Latest daily campaign metrics" className="mb-5 grid grid-cols-2 gap-4">
      <div>
        <dt className="text-xs text-white/50">Sync ratio</dt>
        <dd className="mt-1 font-mono text-xl tabular-nums text-white/90">{latestResult.syncRatio}%</dd>
        <dd className="mt-1 text-xs text-white/40">Latest day</dd>
      </div>
      <div>
        <dt className="text-xs text-white/50">MVD completion rate</dt>
        <dd className="mt-1 font-mono text-xl tabular-nums text-white/90">{Math.round(latestMvd.completed / latestMvd.available * 100)}%</dd>
        <dd className="mt-1 text-xs text-white/40">{latestMvd.completed} / {latestMvd.available} daily requirements</dd>
      </div>
    </dl>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-white/45" aria-live="polite">{view === "stats" ? "Latest daily stats" : `Daily comparison · ${orderLabel}`} · Sample data</p>
      <LayoutGroup id={switcherId}>
      <div role="group" aria-label="Campaign summary views" className="flex shrink-0 items-center rounded-full border border-white/35 p-0.5">
        {(["stats", "leaderboard"] as const).map((option) => (
          <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)} className={`relative cursor-pointer rounded-full px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.12em] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white ${view === option ? "text-black" : "text-white/55 hover:text-white"}`}>
            {view === option && <motion.span aria-hidden="true" className="absolute inset-0 rounded-full bg-white" layoutId="campaign-summary-view-fill" transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} />}
            <span className="relative z-10">{option === "stats" ? "Character" : "Leaderboard"}</span>
          </button>
        ))}
      </div>
      </LayoutGroup>
    </div>
    {view === "stats" ? characterContent : <table className="w-full table-fixed text-left text-sm">
      <caption className="sr-only">Crucible daily leaderboard for {demoAccount.name}. Ranks are based on sync ratio, highest first, with equal scores ranked newest first. Display order: {orderLabel}. Synthetic data.</caption>
      <thead className="border-b border-white/15 text-xs text-white/45">
        <tr>
          {(["rank", "day"] as const).map((column) => <th key={column} scope="col" aria-sort={order.column === column ? order.direction : undefined} className={`${column === "rank" ? "w-16" : ""} font-medium`}>
            <button type="button" onClick={() => changeOrder(column)} className={`flex min-h-11 cursor-pointer items-center gap-1 rounded-sm text-left capitalize transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white ${order.column === column ? "text-white/80" : ""}`}>
              {column}{order.column === column && <OrderIcon aria-hidden="true" className="size-3 shrink-0" />}
            </button>
          </th>)}
          <th scope="col" className="w-20 py-2 text-right font-medium">Sync ratio</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) => {
          const date = Date.parse(`${result.date}T12:00:00-04:00`);
          const day = getArcDay(getArcTimeRemaining(date).days).current;
          const latest = result.date === latestDate;
          return <tr key={result.date} className={`border-b border-white/[0.08] ${latest ? "bg-white/[0.04]" : ""}`}>
            <td className="py-3 align-top font-mono text-xs tabular-nums text-white/45">{result.rank}</td>
            <th scope="row" className="min-w-0 py-3 pr-3 font-normal">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-white/80"><time dateTime={result.date}>{dateFormatter.format(date)}</time><span className="text-xs text-white/40">Day {day}</span>{latest && <span className="text-[0.625rem] text-white/65">Latest</span>}</span>
              <span className="mt-1 block break-words text-xs leading-5 text-white/45">{result.focus}</span>
            </th>
            <td className="py-3 text-right align-top font-mono tabular-nums text-white/85">{result.syncRatio}%</td>
          </tr>;
        })}
      </tbody>
    </table>}
  </div>;
}

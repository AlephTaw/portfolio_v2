"use client";

import { useState } from "react";
import { AttributeCycle } from "./AttributeCycle";
import { CampaignCountdown } from "./CampaignCountdown";
import { CommitHistoryGrid } from "./CampaignHistory";
import { AfterActionReports } from "./AfterActionReports";
import { VisionBoard } from "./VisionBoard";
import { lifePlanActivities, lifeQuests } from "@/src/life-rpg/data";

const leaderboard = [
  { name: "Steven Wilcox", score: "84%" },
  { name: "Player 02", score: "76%" },
  { name: "Player 03", score: "68%" },
];

function PlaceholderPanel({
  description,
  onClick,
  title,
}: {
  description: string;
  onClick?: () => void;
  title: string;
}) {
  const content = (
    <section className="border-2 border-black bg-[#e5e5e5] p-4 sm:p-5">
      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.24em] text-[#191919]">
        {title}
      </p>
      <div className="mt-4 flex min-h-28 items-center justify-center border border-dashed border-[#a7a7a7] bg-background/60 px-4 text-center sm:min-h-32">
        <p className="max-w-xs text-[0.48rem] uppercase leading-relaxed tracking-[0.16em] text-[#7f7f7f]">
          {description}
        </p>
      </div>
    </section>
  );
  return onClick ? (
    <button
      aria-label={`Expand ${title}`}
      className="block w-full text-left"
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  ) : content;
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span className="border border-black px-1.5 py-0.5 text-[0.42rem] uppercase tracking-[0.1em]" key={tag}>
          {tag}
        </span>
      ))}
    </div>
  );
}

export function CampaignDetail({ mode }: { mode: "plan" | "quests" }) {
  return (
    <section className="mt-3 border-t-2 border-black pt-4 sm:mt-4" aria-label={`Campaign ${mode}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[0.58rem] font-semibold uppercase tracking-[0.2em]">Full {mode}</h2>
        <span className="text-[0.45rem] uppercase tracking-[0.14em] text-[#7f7f7f]">2026-08-31 → 2026-09-30</span>
      </div>
      <div className="mt-3 grid gap-2">
        {mode === "quests" ? lifeQuests.map((quest) => (
          <article className="border border-black bg-background p-3" key={quest.id}>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[0.58rem] font-semibold uppercase tracking-[0.12em]">L{quest.level} · {quest.name}</h3>
              <span className="text-[0.45rem] text-[#7f7f7f]">{quest.milestones.length} milestones</span>
            </div>
            <p className="mt-1 text-xs text-[#615754]">{quest.purpose}</p>
            <TagList tags={quest.tags} />
          </article>
        )) : lifePlanActivities.map((activity) => (
          <article className="border border-[#c9c1b4] bg-background p-3" key={activity.id}>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[0.58rem] font-semibold uppercase tracking-[0.12em]">{activity.timestamp}</h3>
              <span className="text-[0.45rem] text-[#7f7f7f]">{lifeQuests.find((quest) => quest.id === activity.questId)?.name}</span>
            </div>
            <p className="mt-1 text-xs text-[#191714]">{activity.title}</p>
            <TagList tags={activity.tags} />
          </article>
        ))}
      </div>
    </section>
  );
}

function ActivityLogPreview() {
  return (
    <section className="border-2 border-black bg-[#e5e5e5] p-4 sm:p-5">
      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.24em] text-[#191919]">Activity Log</p>
      <div className="mt-4 min-h-28 border border-dashed border-[#a7a7a7] bg-background/60 px-4 py-3">
        <p className="text-[0.48rem] uppercase leading-relaxed tracking-[0.16em] text-[#7f7f7f]">Recorded actions, results, and campaign evidence will appear here.</p>
        <p className="mt-3 font-mono text-xs">{lifePlanActivities.length} planned activities · {lifeQuests.length} quests</p>
      </div>
    </section>
  );
}

function ExpandedCampaignPanel({ panel }: { panel: CampaignPanel }) {
  return (
    <div className="mt-3 border-t-2 border-black pt-4">
      {panel === "vision" ? <VisionBoard /> : null}
      {panel === "game-loop" ? (
        <div>
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.24em] text-[#191919]">
            Game Loop
          </p>
          <div className="mt-4">
            <AfterActionReports initialOpen />
          </div>
        </div>
      ) : null}
      {panel === "plan" || panel === "quests" ? (
        <CampaignDetail mode={panel} />
      ) : null}
      {panel === "activity" ? (
        <div>
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.24em] text-[#191919]">
            Activity Log
          </p>
          <div className="mt-4 border border-[#d8d0c1] bg-background/60 px-4 py-3">
            <div className="divide-y divide-[#d8d0c1] border-y border-[#d8d0c1]">
              {lifePlanActivities.map((activity) => (
                <div className="grid gap-1 py-3" key={activity.id}>
                  <p className="text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-[#191919]">
                    {activity.timestamp} · {activity.title}
                  </p>
                  <p className="text-xs leading-5 text-[#615754]">
                    {lifeQuests.find((quest) => quest.id === activity.questId)?.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type CampaignPanel = "vision" | "game-loop" | "plan" | "quests" | "activity";

export function CampaignSummary({
  showWorkspacePlaceholders = false,
}: {
  showWorkspacePlaceholders?: boolean;
} = {}) {
  const [expandedPanel, setExpandedPanel] = useState<CampaignPanel | null>(null);

  function togglePanel(panel: CampaignPanel) {
    setExpandedPanel((current) => (current === panel ? null : panel));
  }

  return (
    <div className="mt-14 grid w-full grid-cols-[112fr_27fr] gap-x-3 sm:gap-x-4">
      <div className="col-span-2 row-start-1">
        <CampaignCountdown />
      </div>
      <div className="col-span-2 row-start-2 mt-[3px] sm:mt-1">
        <AttributeCycle />
      </div>
      <div className="col-span-2 row-start-3">
        <CommitHistoryGrid />
      </div>
      <div
        aria-label="Campaign leaderboard"
          className={`col-start-1 row-start-4 mt-3 aspect-[21/9] w-full border-black bg-[#e5e5e5] px-3 py-2 sm:mt-4 sm:px-4 sm:py-3 ${
          showWorkspacePlaceholders ? "border-2" : "border-[6px]"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.24em] text-[#191919]">
            Leaderboard
          </p>
          <p className="text-[0.45rem] uppercase tracking-[0.16em] text-[#7f7f7f]">
            Sync Ratio
          </p>
        </div>
        <div className="mt-2 border-t border-[#bdbdbd]">
          {leaderboard.map(({ name, score }, index) => (
            <div
              className="grid grid-cols-[1.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 border-b border-[#cfcfcf] py-1 text-[0.48rem] uppercase tracking-[0.12em] text-[#3f3f3f] sm:grid-cols-[2rem_minmax(0,1fr)_3rem] sm:text-[0.52rem]"
              key={name}
            >
              <span className="text-[#7f7f7f]">{String(index + 1).padStart(2, "0")}</span>
              <span className={index === 0 ? "font-semibold text-black" : ""}>
                {name}
              </span>
              <span className="text-right font-semibold text-black">{score}</span>
            </div>
          ))}
        </div>
      </div>
      <div
        aria-label="Profile comic panel"
        className={`col-start-2 row-start-4 mt-3 aspect-[9/16] w-full overflow-hidden border-black bg-[#e5e5e5] sm:mt-4 ${
          showWorkspacePlaceholders ? "border-2" : "border-[6px]"
        }`}
      >
        {/* A plain image keeps this panel compatible with the current image setup. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Anime-styled portrait of Steven Wilcox"
          className="h-full w-full object-cover object-center"
          src="/assets/campaign-profile-panel.png"
        />
      </div>
      {showWorkspacePlaceholders && (
        <>
          <div className="col-span-2 row-start-5 mt-3 sm:mt-4">
            <PlaceholderPanel
              description="Vision and campaign direction will live here."
              onClick={() => togglePanel("vision")}
              title="Vision"
            />
            {expandedPanel === "vision" ? <ExpandedCampaignPanel panel="vision" /> : null}
          </div>
          <div className="col-span-2 row-start-6 mt-3 sm:mt-4">
            <PlaceholderPanel
              description="The daily loop: choose priorities, execute, log evidence, and review results."
              onClick={() => togglePanel("game-loop")}
              title="Game Loop"
            />
            {expandedPanel === "game-loop" ? <ExpandedCampaignPanel panel="game-loop" /> : null}
          </div>
          <div className="col-span-2 row-start-7 mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
            <PlaceholderPanel
              description={`${lifePlanActivities.length} timestamped activities across the campaign. Click to open the full plan.`}
              onClick={() => togglePanel("plan")}
              title="Plan"
            />
            {expandedPanel === "plan" ? <ExpandedCampaignPanel panel="plan" /> : null}
            <PlaceholderPanel
              description={`${lifeQuests.length} parallel quests across Levels 0–7. Click to open the quest list.`}
              onClick={() => togglePanel("quests")}
              title="Quests"
            />
            {expandedPanel === "quests" ? <ExpandedCampaignPanel panel="quests" /> : null}
          </div>
          <div className="col-span-2 row-start-8 mt-3 sm:mt-4">
            <button
              aria-label="Expand Activity Log"
              className="block w-full text-left"
              onClick={() => togglePanel("activity")}
              type="button"
            >
              <ActivityLogPreview />
            </button>
            {expandedPanel === "activity" ? <ExpandedCampaignPanel panel="activity" /> : null}
          </div>
        </>
      )}
    </div>
  );
}

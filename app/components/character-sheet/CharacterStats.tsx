"use client";

import { useState } from "react";

const stats = [
  { label: "Sync Ratio", value: "84%" },
  { label: "Streak", value: "6 days" },
  { label: "Experience", points: "0 XP", value: "—" },
  { label: "Health", points: "0 HP", value: "hours/24" },
  { label: "Wealth", value: "—" },
  { label: "Interaction", points: "0 KP", value: "hours/24" },
  { label: "Personality", points: "0 AP", value: "—" },
  { label: "Volition", points: "0 MP", value: "hours/24" },
  { label: "Competence", points: "0 SP", value: "—" },
  { label: "Builds", points: "0 BP", value: "0" },
];

function getStatGridRow(index: number, label: string) {
  return index + 1 + (index >= 2 ? 1 : 0) + (label === "Builds" ? 1 : 0);
}

function getAttributeId(label: string) {
  return label.toLowerCase().replaceAll(" ", "-");
}

function AttributeWorkspace({
  stat,
}: {
  stat: (typeof stats)[number];
}) {
  const workspaceId = `${getAttributeId(stat.label)}-workspace`;
  const quests = [
    `${stat.label} Baseline Quest`,
    `${stat.label} Consistency Quest`,
    `${stat.label} Mastery Quest`,
  ];
  const telemetry = [
    { label: "Recent Signal", value: "Awaiting data" },
    { label: "7-Day Trend", value: "No baseline" },
    { label: "Last Sync", value: "Pending" },
  ];

  return (
    <div className="mt-8 grid gap-4" id={workspaceId}>
      <section className="border-[6px] border-black bg-[#e5e5e5] p-4 sm:p-5">
        <h2 className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[#191919]">
          Core {stat.label} Stats
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Current Status", value: stat.value },
            { label: "Points", value: stat.points ?? "—" },
            { label: "Sync State", value: "Tracking" },
          ].map(({ label, value }) => (
            <div
              className="border border-[#bdbdbd] bg-background/70 px-2 py-3 text-center sm:px-3"
              key={label}
            >
              <p className="text-[0.42rem] uppercase leading-3 tracking-[0.14em] text-[#7f7f7f]">
                {label}
              </p>
              <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-black">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-[6px] border-black bg-[#e5e5e5] p-4 sm:p-5">
        <h2 className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[#191919]">
          {stat.label} Telemetry
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
          <div className="border border-[#bdbdbd] bg-background/70 p-3">
            <p className="text-[0.46rem] font-semibold uppercase tracking-[0.18em] text-[#6d6d6d]">
              Quests
            </p>
            <ol className="mt-3 grid gap-2">
              {quests.map((quest, index) => (
                <li
                  className="flex items-center gap-2 border-b border-[#d4d4d4] pb-2 text-[0.52rem] uppercase leading-4 tracking-[0.1em] text-[#4b4b4b]"
                  key={quest}
                >
                  <span className="text-[#8a8a8a]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{quest}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {telemetry.map(({ label, value }) => (
              <article
                className="flex min-h-28 flex-col justify-between border border-[#bdbdbd] bg-background/70 p-3"
                key={label}
              >
                <p className="text-[0.42rem] font-semibold uppercase leading-3 tracking-[0.14em] text-[#6d6d6d]">
                  {label}
                </p>
                <p className="text-[0.5rem] uppercase leading-4 tracking-[0.1em] text-[#7f7f7f]">
                  {value}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ArcTimeline() {
  return (
    <section aria-label="After Action Reports" className="mt-8" id="arc-timeline">
      <div className="space-y-6">
        <div className="grid grid-cols-[2fr_1fr] items-start gap-2">
          <div className="aspect-[16/9] border-[6px] border-black bg-[#e5e5e5]" />
          <div className="aspect-[3/4] border-[6px] border-black bg-[#e5e5e5]" />
        </div>
        <div className="grid grid-cols-[1fr_1.45fr] gap-2">
          <div className="aspect-square border-[6px] border-black bg-[#e5e5e5]" />
          <div className="grid grid-rows-2 gap-2">
            <div className="border-[6px] border-black bg-[#e5e5e5]" />
            <div className="border-[6px] border-black bg-[#e5e5e5]" />
          </div>
        </div>
        <div className="grid grid-cols-[1fr_2fr] items-end gap-2">
          <div className="aspect-[3/4] border-[6px] border-black bg-[#e5e5e5]" />
          <div className="aspect-[16/9] border-[6px] border-black bg-[#e5e5e5]" />
        </div>
      </div>
    </section>
  );
}

export function CharacterStats({
  showAttributeWorkspace = false,
}: {
  showAttributeWorkspace?: boolean;
} = {}) {
  const [reportsOpen, setReportsOpen] = useState(false);
  const [activeAttribute, setActiveAttribute] = useState<string | null>(null);
  const activeStat =
    stats.find(({ label }) => label === activeAttribute) ?? null;

  return (
    <div className="mt-4 w-full">
      <div
        onClick={(event) => {
          if (
            !showAttributeWorkspace ||
            (event.target as HTMLElement).closest("button")
          ) {
            return;
          }

          setActiveAttribute(null);
          setReportsOpen(false);
        }}
      >
        <div className="mb-3 flex w-full items-end justify-between gap-[60px] text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-[#6d6d6d] sm:gap-24 sm:text-[0.62rem] sm:tracking-[0.2em] lg:gap-[120px]">
          <p className="w-[9.75rem] shrink-0 text-left sm:w-48">
            Character v0.1.0
          </p>
          <div className="grid min-w-0 w-full max-w-[23rem] grid-cols-[max-content_minmax(0,1fr)_max-content] gap-x-2 sm:gap-x-4">
            <p className="whitespace-nowrap text-left">Attributes</p>
            <p className="text-right">Status</p>
            <p className="text-right">Points</p>
          </div>
        </div>

        <div className="flex w-full items-start justify-between gap-[60px] text-[#4b4b4b] sm:gap-24 lg:gap-[120px]">
        <div className="flex h-[11.75rem] w-[9.75rem] shrink-0 flex-col gap-1 sm:h-[14.5rem] sm:w-48 sm:gap-2">
          <div className="size-[7.75rem] shrink-0 overflow-hidden rounded-full bg-[#f3ecde] sm:size-[9.5rem]">
            {/* A plain image avoids Vinext's unavailable local image optimizer binding. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Illustrated portrait of Steven Wilcox"
              className="h-full w-full object-cover"
              src="/assets/live-stats-profile.png"
            />
          </div>
          <div aria-hidden="true" className="h-3 shrink-0" />
          <p className="w-[7.75rem] whitespace-nowrap text-center text-[0.55rem] italic uppercase leading-3 tracking-[0.28em] text-[#7f7f7f] sm:w-[9.5rem]">
            Title: Data Scientist
          </p>
          <div aria-hidden="true" className="h-3 shrink-0" />
          {showAttributeWorkspace ? (
            <button
              aria-controls="arc-timeline"
              aria-expanded={reportsOpen}
              className={`w-[7.75rem] whitespace-nowrap border border-black px-2 py-1 text-[0.45rem] font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-black hover:text-[#f5f5f5] focus:outline-none focus-visible:ring-1 focus-visible:ring-black sm:w-[9.5rem] sm:text-[0.5rem] sm:tracking-[0.12em] ${
                reportsOpen
                  ? "bg-black text-[#f5f5f5]"
                  : "bg-transparent text-black"
              }`}
              onClick={() => {
                setActiveAttribute(null);
                setReportsOpen((open) => !open);
              }}
              type="button"
            >
              ARC
            </button>
          ) : (
            <div className="w-[7.75rem] border border-black bg-transparent px-2 py-1 text-center text-[0.45rem] font-semibold uppercase tracking-[0.1em] text-black sm:w-[9.5rem] sm:text-[0.5rem] sm:tracking-[0.12em]">
              ARC
            </div>
          )}
        </div>

        <dl className="grid min-w-0 w-full max-w-[23rem] auto-rows-[0.75rem] grid-cols-[max-content_minmax(0,1fr)_max-content] gap-x-2 gap-y-1 sm:gap-x-4 sm:gap-y-2">
          {stats.map((stat, index) => {
            const isActive = activeAttribute === stat.label;

            return (
              <div
                className={`group col-span-3 grid min-w-0 grid-cols-subgrid items-center ${
                  showAttributeWorkspace
                    ? `cursor-pointer hover:bg-black hover:shadow-[0_0_0_4px_black] ${
                        isActive
                          ? "bg-black shadow-[0_0_0_4px_black]"
                          : ""
                      }`
                    : ""
                }`}
                key={stat.label}
                onClick={
                  showAttributeWorkspace
                    ? (event) => {
                        event.stopPropagation();
                        setReportsOpen(false);
                        setActiveAttribute((attribute) =>
                          attribute === stat.label ? null : stat.label,
                        );
                      }
                    : undefined
                }
                style={{ gridRow: getStatGridRow(index, stat.label) }}
              >
                <dt
                  className={`col-start-1 whitespace-nowrap text-left text-[0.55rem] uppercase tracking-[0.28em] ${
                    showAttributeWorkspace
                      ? "group-hover:text-[#f5f5f5]"
                      : ""
                  } ${
                    isActive ? "text-[#f5f5f5]" : "text-[#7f7f7f]"
                  }`}
                >
                  {showAttributeWorkspace ? (
                    <button
                      aria-controls={`${getAttributeId(stat.label)}-workspace`}
                      aria-expanded={activeAttribute === stat.label}
                      className={`text-left hover:text-[#f5f5f5] focus:outline-none focus-visible:underline ${
                        isActive
                          ? "font-semibold text-[#f5f5f5] hover:text-[#f5f5f5] focus-visible:text-[#f5f5f5]"
                          : ""
                      }`}
                      type="button"
                    >
                      {stat.label}
                    </button>
                  ) : (
                    stat.label
                  )}
                </dt>
                <dd
                  className={`col-start-2 text-right text-[0.55rem] uppercase tracking-[0.28em] ${
                    showAttributeWorkspace
                      ? "group-hover:text-[#f5f5f5]"
                      : ""
                  } ${
                    isActive ? "text-[#f5f5f5]" : "text-black"
                  }`}
                >
                  {stat.value}
                </dd>
                <dd
                  className={`col-start-3 text-right text-[0.55rem] uppercase tracking-[0.28em] ${
                    showAttributeWorkspace
                      ? "group-hover:text-[#f5f5f5]"
                      : ""
                  } ${
                    isActive ? "text-[#f5f5f5]" : "text-black"
                  }`}
                >
                  {stat.points ?? ""}
                </dd>
              </div>
            );
          })}
          </dl>
        </div>
      </div>

      {showAttributeWorkspace && activeStat ? (
        <AttributeWorkspace stat={activeStat} />
      ) : null}

      {showAttributeWorkspace && reportsOpen ? <ArcTimeline /> : null}
    </div>
  );
}

import Link from "next/link";
import { Fragment } from "react";

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

export function CharacterStats() {
  return (
    <div className="mt-4 w-full">
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
          <Link
            className="flex w-[7.75rem] items-center justify-between whitespace-nowrap text-[0.55rem] uppercase leading-3 tracking-[0.28em] text-[#7f7f7f] transition-colors hover:text-black focus:outline-none focus-visible:text-black focus-visible:ring-1 focus-visible:ring-black sm:w-[9.5rem]"
            href="/sirl"
          >
            <span>More Detail</span>
            <span>&gt;&gt;&gt;</span>
          </Link>
        </div>

        <dl className="grid min-w-0 w-full max-w-[23rem] auto-rows-[0.75rem] grid-cols-[max-content_minmax(0,1fr)_max-content] gap-x-2 gap-y-1 sm:gap-x-4 sm:gap-y-2">
          {stats.map((stat, index) => (
            <Fragment key={stat.label}>
              <dt
                className="col-start-1 whitespace-nowrap text-left text-[0.55rem] uppercase tracking-[0.28em] text-[#7f7f7f]"
                style={{ gridRow: getStatGridRow(index, stat.label) }}
              >
                {stat.label}
              </dt>
              <dd
                className="col-start-2 text-right text-[0.55rem] uppercase tracking-[0.28em] text-black"
                style={{ gridRow: getStatGridRow(index, stat.label) }}
              >
                {stat.value}
              </dd>
              <dd
                className="col-start-3 text-right text-[0.55rem] uppercase tracking-[0.28em] text-black"
                style={{ gridRow: getStatGridRow(index, stat.label) }}
              >
                {stat.points ?? ""}
              </dd>
            </Fragment>
          ))}
        </dl>
      </div>
    </div>
  );
}

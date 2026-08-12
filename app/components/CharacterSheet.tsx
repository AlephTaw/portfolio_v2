import Link from "next/link";
import { Fragment } from "react";
import { FiAward } from "react-icons/fi";
import { CampaignCountdown } from "../live-stats/CampaignCountdown";
import { AttributeCycle } from "./AttributeCycle";
import { CommitmentHistoryMarker } from "./CommitmentHistoryMarker";

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

const commitmentHistory = [
  [8, 7, 8, 8, 6, 7, 8, 5, 4, 3, 4, 2, 1, 0, 2, 1, 0],
  [7, 8, 7, 6, 8, 8, 7, 5, 4, 4, 3, 1, 2, 2, 1, 0, 1],
  [8, 8, 8, 7, 7, 8, 6, 4, 3, 2, 3, 1, 1, 0, 1, 0, 0],
  [6, 7, 8, 6, 7, 6, 5, 4, 3, 3, 2, 1, 1, 2, 0, 0, 1],
  [7, 6, 7, 8, 6, 8, 7, 5, 3, 4, 2, 2, 1, 1, 0, 1, 0],
  [8, 7, 6, 7, 8, 7, 6, 4, 4, 3, 3, 1, 2, 0, 1, 0, 1],
  [6, 8, 7, 6, 7, 8, 5, 5, 3, 2, 4, 2, 1, 1, 0, 0, 1],
];

const commitmentHistoryBlocks = [0, 5, 11].map((offset) =>
  commitmentHistory.map((row, rowIndex) =>
    row.map(
      (_, columnIndex) =>
        commitmentHistory[(rowIndex + offset) % commitmentHistory.length][
          (columnIndex + offset) % row.length
        ],
    ),
  ),
);

const achievements = [
  "Achievement Name",
  "Achievement Name",
  "Achievement Name",
  "Achievement Name",
];

const eventLog = [
  "Built momentum before noon",
  "Protected focus for the highest-value task",
  "Closed the loop on reflection and next action",
];

function getStatGridRow(index: number, label: string) {
  return index + 1 + (index >= 2 ? 1 : 0) + (label === "Builds" ? 1 : 0);
}

function SectionHeading({ children }: { children: string }) {
  return (
    <p className="w-full whitespace-nowrap text-left text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-[#6d6d6d] sm:text-[0.62rem] sm:tracking-[0.2em]">
      {children}
    </p>
  );
}

function RuleList({
  evenSpacing = false,
  items,
}: {
  evenSpacing?: boolean;
  items: string[];
}) {
  return (
    <div className={evenSpacing ? "space-y-3" : "space-y-5"}>
      {items.map((item) => (
        <div key={item}>
          <p className="text-center text-[0.72rem] text-[#4b4b4b]">{item}</p>
          <div className="mt-3 border-t border-[#d8d0c1]" />
        </div>
      ))}
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
            className="whitespace-nowrap border border-black bg-transparent px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-[#f5f5f5]"
            type="button"
          >
            Join!
          </button>
        </div>

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

          <div className="mt-14 grid w-full grid-cols-[112fr_27fr] gap-x-3 sm:gap-x-4">
            <div className="col-span-2 row-start-1">
              <CampaignCountdown />
            </div>
            <div className="col-span-2 row-start-2 mt-[3px] sm:mt-1">
              <AttributeCycle />
            </div>
            <div
              aria-label="21:9 image placeholder"
              className="col-start-1 row-start-3 mt-3 flex aspect-[21/9] w-full items-center justify-center border-[3px] border-black bg-[#e5e5e5] sm:mt-4"
              role="img"
            >
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#7f7f7f]">
                Placeholder
              </span>
            </div>
            <div
              aria-label="9:16 image placeholder"
              className="col-start-2 row-start-3 mt-3 flex aspect-[9/16] w-full items-center justify-center border-[3px] border-black bg-[#e5e5e5] sm:mt-4"
              role="img"
            >
              <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#7f7f7f]">
                9:16
              </span>
            </div>
          </div>

        </div>

        <div className="mt-8">
          <SectionHeading>Commit History</SectionHeading>
          <div className="mt-4 flex w-full gap-2">
            {commitmentHistoryBlocks.map((block, blockIndex) => (
              <div className="min-w-0 flex-1" key={`history-block-${blockIndex}`}>
                <div
                  className="grid grid-cols-[repeat(17,minmax(0,1fr))]"
                >
                  {block.flatMap((row, rowIndex) =>
                    row.map((value, columnIndex) => (
                      <div
                        className={
                          blockIndex === 0 &&
                          rowIndex === block.length - 1 &&
                          columnIndex === row.length - 1
                            ? "relative z-10 aspect-square w-full border border-black"
                            : `aspect-square w-full border-l border-t border-black ${
                                columnIndex === row.length - 1 ? "border-r" : ""
                              } ${rowIndex === block.length - 1 ? "border-b" : ""}`
                        }
                        key={`cell-${rowIndex}-${columnIndex}`}
                        style={
                          blockIndex === 0
                            ? {
                                backgroundColor: `hsl(0 0% ${97 - value * 4.25}%)`,
                                boxShadow:
                                  rowIndex === block.length - 1 &&
                                  columnIndex === row.length - 1
                                    ? "inset 0 0 0 3px #000000"
                                    : undefined,
                              }
                            : undefined
                        }
                      />
                    )),
                  )}
                </div>
                {blockIndex === 0 ? (
                  <div className="relative h-[25px]">
                    <div className="absolute right-[calc(100%/34)] top-1 translate-x-1/2">
                      <CommitmentHistoryMarker />
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[0.5rem] font-medium uppercase leading-3 tracking-[0.08em] text-black">
            <span aria-label="Preview">...</span>
            <span className="text-right">Events</span>
          </div>
          <div className="mt-3">
            <RuleList evenSpacing items={eventLog.slice(0, 2)} />
          </div>
        </div>

        <div className="mt-9">
          <SectionHeading>Achievements</SectionHeading>
          <div className="mt-5 flex flex-wrap justify-between gap-y-4 bg-background px-3 py-3">
            {achievements.map((achievement, index) => (
              <div
                className="flex w-24 flex-col items-center text-center"
                key={`${achievement}-${index}`}
              >
                <div className="flex size-24 items-center justify-center border-2 border-black bg-[#f7f7f7]">
                  <FiAward className="size-5 text-[#3f3f3f]" />
                </div>
                <p className="mt-3 text-[0.65rem] leading-4 text-[#3f3f3f]">
                  {achievement}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

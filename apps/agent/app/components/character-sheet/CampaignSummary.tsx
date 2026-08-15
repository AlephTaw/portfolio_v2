import { AttributeCycle } from "./AttributeCycle";
import { AfterActionReports } from "./AfterActionReports";
import { CampaignCountdown } from "./CampaignCountdown";

const leaderboard = [
  { name: "Steven Wilcox", score: "84%" },
  { name: "Player 02", score: "76%" },
  { name: "Player 03", score: "68%" },
];

const kanbanColumns = [
  "Priority Queue",
  "Backlog",
  "To Do",
  "Doing",
  "Done",
];

function PlaceholderPanel({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
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
}

export function CampaignSummary({
  showWorkspacePlaceholders = false,
}: {
  showWorkspacePlaceholders?: boolean;
} = {}) {
  return (
    <div className="mt-14 grid w-full grid-cols-[112fr_27fr] gap-x-3 sm:gap-x-4">
      <div className="col-span-2 row-start-1">
        <CampaignCountdown />
      </div>
      <div className="col-span-2 row-start-2 mt-[3px] sm:mt-1">
        <AttributeCycle />
      </div>
      <div
        aria-label="Campaign leaderboard"
        className={`col-start-1 row-start-3 mt-3 aspect-[21/9] w-full border-black bg-[#e5e5e5] px-3 py-2 sm:mt-4 sm:px-4 sm:py-3 ${
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
        className={`col-start-2 row-start-3 mt-3 aspect-[9/16] w-full overflow-hidden border-black bg-[#e5e5e5] sm:mt-4 ${
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
          <div className="col-span-2 row-start-4 mt-3 sm:mt-4">
            <PlaceholderPanel
              description="Vision board content will live here."
              title="Vision Board"
            />
          </div>
          <section className="col-span-2 row-start-5 mt-3 border-2 border-black bg-[#e5e5e5] p-4 sm:mt-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[0.55rem] font-semibold uppercase tracking-[0.24em] text-[#191919]">
                Kanban
              </p>
              <p className="text-[0.45rem] uppercase tracking-[0.16em] text-[#7f7f7f]">
                Workflow Placeholder
              </p>
            </div>
            <div className="pane-scroll mt-4 overflow-x-auto pb-1">
              <div className="grid min-w-[42rem] grid-cols-5 gap-2">
                {kanbanColumns.map((column) => (
                  <div
                    className="min-h-36 border border-[#bdbdbd] bg-background/60 p-2.5"
                    key={column}
                  >
                    <p className="border-b border-[#cfcfcf] pb-2 text-[0.45rem] font-semibold uppercase tracking-[0.14em] text-[#3f3f3f]">
                      {column}
                    </p>
                    <div className="mt-2 flex h-20 items-center justify-center border border-dashed border-[#c7c7c7] px-2 text-center">
                      <span className="text-[0.42rem] uppercase tracking-[0.12em] text-[#8f8f8f]">
                        Items coming soon
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <div className="col-span-2 row-start-6 mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
            <PlaceholderPanel
              description="Campaign planning content will live here."
              title="Plan"
            />
            <PlaceholderPanel
              description="Campaign quests will live here."
              title="Quests"
            />
          </div>
          <div className="col-span-2 row-start-7 mt-3 sm:mt-4">
            <AfterActionReports />
          </div>
        </>
      )}
    </div>
  );
}

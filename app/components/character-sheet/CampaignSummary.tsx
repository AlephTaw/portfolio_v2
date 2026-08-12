import { AttributeCycle } from "./AttributeCycle";
import { CampaignCountdown } from "./CampaignCountdown";

export function CampaignSummary() {
  return (
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
  );
}

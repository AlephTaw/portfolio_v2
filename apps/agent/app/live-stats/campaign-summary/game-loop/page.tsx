import type { Metadata } from "next";
import { AfterActionReports } from "../../../components/character-sheet/AfterActionReports";
import { CharacterSheetSectionPage } from "../../CharacterSheetSectionPage";

export const metadata: Metadata = { title: "Game Loop - Steven Wilcox" };

export default function GameLoopPage() {
  return (
    <CharacterSheetSectionPage title="Game Loop">
      <section aria-label="Game Loop" className="mt-14">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#6d6d6d]">
          Game Loop
        </p>
        <div className="mt-4">
          <AfterActionReports initialOpen />
        </div>
      </section>
    </CharacterSheetSectionPage>
  );
}

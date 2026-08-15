import type { Metadata } from "next";
import { Achievements } from "../../components/character-sheet/Achievements";
import { CharacterSheetSectionPage } from "../CharacterSheetSectionPage";

export const metadata: Metadata = {
  title: "Achievements - Steven Wilcox",
};

export default function AchievementsPage() {
  return (
    <CharacterSheetSectionPage title="Achievements">
      <Achievements compact />
    </CharacterSheetSectionPage>
  );
}

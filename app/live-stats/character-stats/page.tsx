import type { Metadata } from "next";
import { CharacterStats } from "../../components/character-sheet/CharacterStats";
import { CharacterSheetSectionPage } from "../CharacterSheetSectionPage";

export const metadata: Metadata = {
  title: "Character Stats - Steven Wilcox",
};

export default function CharacterStatsPage() {
  return (
    <CharacterSheetSectionPage title="Character Stats">
      <CharacterStats showAttributeWorkspace />
    </CharacterSheetSectionPage>
  );
}

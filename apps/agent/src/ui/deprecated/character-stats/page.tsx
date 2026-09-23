import type { Metadata } from "next";
import { CharacterStats } from "@/app/components/character-sheet/CharacterStats";
import { CharacterSheetSectionPage } from "@/app/live-stats/CharacterSheetSectionPage";

export const metadata: Metadata = {
  title: "Character Stats - Steven Wilcox",
};

/**
 * Archived source for the retired /live-stats/character-stats route.
 * This directory is intentionally excluded from the application build.
 */
export default function DeprecatedCharacterStatsPage() {
  return (
    <CharacterSheetSectionPage title="Character Stats">
      <CharacterStats showAttributeWorkspace />
    </CharacterSheetSectionPage>
  );
}

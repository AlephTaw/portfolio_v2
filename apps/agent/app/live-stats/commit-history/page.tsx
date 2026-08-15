import type { Metadata } from "next";
import { DevLog } from "../../components/character-sheet/DevLog";
import { CharacterSheetSectionPage } from "../CharacterSheetSectionPage";

export const metadata: Metadata = {
  title: "Commit History - Steven Wilcox",
};

export default function CommitHistoryPage() {
  return (
    <CharacterSheetSectionPage title="Commit History">
      <DevLog />
    </CharacterSheetSectionPage>
  );
}

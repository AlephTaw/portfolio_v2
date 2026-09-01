import type { Metadata } from "next";
import { VisionBoard } from "../../../components/character-sheet/VisionBoard";
import { CharacterSheetSectionPage } from "../../CharacterSheetSectionPage";

export const metadata: Metadata = {
  title: "Vision - Steven Wilcox",
};

export default function VisionPage() {
  return (
    <CharacterSheetSectionPage title="Vision">
      <VisionBoard />
    </CharacterSheetSectionPage>
  );
}

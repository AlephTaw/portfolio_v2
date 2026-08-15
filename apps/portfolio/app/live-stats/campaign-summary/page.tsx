import type { Metadata } from "next";
import { CampaignSummary } from "../../components/character-sheet/CampaignSummary";
import { CharacterSheetSectionPage } from "../CharacterSheetSectionPage";

export const metadata: Metadata = {
  title: "Campaign Summary - Steven Wilcox",
};

export default function CampaignSummaryPage() {
  return (
    <CharacterSheetSectionPage title="Campaign Summary">
      <CampaignSummary showWorkspacePlaceholders />
    </CharacterSheetSectionPage>
  );
}

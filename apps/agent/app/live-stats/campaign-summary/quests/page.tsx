import type { Metadata } from "next";
import { CampaignDetail } from "../../../components/character-sheet/CampaignSummary";
import { CharacterSheetSectionPage } from "../../CharacterSheetSectionPage";

export const metadata: Metadata = { title: "Campaign Quests - Steven Wilcox" };

export default function CampaignQuestsPage() {
  return (
    <CharacterSheetSectionPage title="Campaign Quests">
      <CampaignDetail mode="quests" />
    </CharacterSheetSectionPage>
  );
}

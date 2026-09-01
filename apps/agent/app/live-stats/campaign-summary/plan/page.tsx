import type { Metadata } from "next";
import { CampaignDetail } from "../../../components/character-sheet/CampaignSummary";
import { CharacterSheetSectionPage } from "../../CharacterSheetSectionPage";

export const metadata: Metadata = { title: "Campaign Plan - Steven Wilcox" };

export default function CampaignPlanPage() {
  return (
    <CharacterSheetSectionPage title="Campaign Plan">
      <CampaignDetail mode="plan" />
    </CharacterSheetSectionPage>
  );
}

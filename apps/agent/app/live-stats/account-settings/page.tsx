import type { Metadata } from "next";
import { AccountSettings } from "../../components/character-sheet/AccountSettings";
import { CharacterSheetSectionPage } from "../CharacterSheetSectionPage";

export const metadata: Metadata = {
  title: "Account & Settings - Steven Wilcox",
};

export default function AccountSettingsPage() {
  return (
    <CharacterSheetSectionPage title="Account & Settings">
      <AccountSettings />
    </CharacterSheetSectionPage>
  );
}

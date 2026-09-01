import type { Metadata } from "next";
import { CharacterSheet } from "../components/character-sheet/CharacterSheet";

export const metadata: Metadata = {
  title: "Steven Wilcox Agent - Character Sheet",
  description:
    "The character sheet for Steven Wilcox's personal productivity agent.",
};

export default function CharacterSheetPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-[#191919] sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-xl">
        <CharacterSheet />
      </div>
    </main>
  );
}

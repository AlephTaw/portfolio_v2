"use client";

import { CategoryStatus } from "../../actions/game-design/category-status";
import { categories } from "../../actions/game-design/dashboard-data";
import { terminalCategories, type TerminalCategory } from "../../actions/terminal-categories";
import { JourneyView } from "./journey/journey-view";

export function CategoryAppView({ category }: { category: TerminalCategory }) {
  const metadata = terminalCategories.find((item) => item.name === category)!;
  if (category === "Journey") return <JourneyView />;
  const dashboard = categories.find((item) => item.name === (category === "Connections" ? "Connection" : category))!;
  return <section aria-label={`${category} app`} className="rounded-2xl bg-black/70 px-4 py-3">
    <h2 className={`text-sm font-medium ${metadata.color}`}>{category}</h2>
    <CategoryStatus category={dashboard} />
  </section>;
}

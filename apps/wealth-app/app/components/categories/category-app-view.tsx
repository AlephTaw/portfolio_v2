"use client";
import type { Category } from "../actions/navigation/bottom-navigation";
import { CategoryStatus } from "./category-status";
import { categories, categoryTasks } from "./dashboard-data";
import { JourneyView } from "../journey/journey-view";
import { ConnectionsGrid } from "./connections-grid";

export function CategoryAppView({ category, completed, onToggle }: {
  category: Category;
  completed: readonly string[];
  onToggle: (id: string) => void;
}) {
  if (category === "Journey") {
    return <JourneyView />;
  }
  const dashboard = categories.find((item) => item.name === (category === "Connections" ? "Connection" : category))!;
  const provisional = categoryTasks(dashboard.name).some((task) => task.provisional);
  return <section aria-label={category + " app"} className="rounded-2xl bg-black/70 px-4 py-3">
    <CategoryStatus category={dashboard} displayName={category} completedMvd={completed} toggleMvd={onToggle} />
    {category === "Connections" && <ConnectionsGrid />}
    <p className="text-[11px] leading-5 text-white/35">Starter checklist · session progress{provisional ? " · unassigned point values are provisional" : ""}</p>
  </section>;
}

import type { Metadata } from "next";
import { ActionsWorkspace } from "../components/activity-workspace";

export const metadata: Metadata = {
  title: "Actions | Speedrun IRL",
  description: "Campaign actions.",
};

export default function ActionsPage() {
  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <section className="flex min-h-0 w-full flex-1 flex-col pb-10">
        <ActionsWorkspace />
      </section>
    </main>
  );
}

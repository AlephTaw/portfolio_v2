import type { Metadata } from "next";
import { TerminalActivityWorkspace } from "../components/activity-workspace";

export const metadata: Metadata = {
  title: "Terminal | Speedrun IRL",
  description: "Campaign terminal.",
};

export default function TerminalPage() {
  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <section className="flex min-h-0 w-full flex-1 flex-col pb-10">
        <TerminalActivityWorkspace />
      </section>
    </main>
  );
}

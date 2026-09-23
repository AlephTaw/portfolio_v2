import type { Metadata } from "next";
import { TerminalActivityWorkspace } from "../components/activity-workspace";
import { PageSwipeNavigation } from "../components/page-swipe-navigation";

export const metadata: Metadata = {
  title: "Terminal | Speedrun IRL",
  description: "Campaign terminal.",
};

export default function TerminalPage() {
  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <PageSwipeNavigation
        direction="right"
        href="/stats"
        transitionDirection={1}
      />
      <section className="mx-auto flex min-h-0 w-full max-w-[72rem] flex-1 flex-col px-[clamp(1.5rem,4.4vw,3.5rem)] pb-10">
        <TerminalActivityWorkspace />
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import { PageSwipeNavigation } from "../components/page-swipe-navigation";
import { PinScrollArea } from "../components/pin-scroll-area";
import StatsDisplay from "./stats-display";

export const metadata: Metadata = {
  title: "Stats | Speedrun IRL",
  description: "Live game statistics.",
};

export default function StatsPage() {
  return (
    <main className="h-dvh overflow-hidden bg-background text-foreground">
      <PageSwipeNavigation
        direction="left"
        href="/terminal"
        transitionDirection={-1}
      />
      <PinScrollArea className="flex flex-col overscroll-contain touch-pan-y" wrapperClassName="h-full">
        <StatsDisplay />
      </PinScrollArea>
    </main>
  );
}

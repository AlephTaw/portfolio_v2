import type { Metadata } from "next";
import { PinScrollArea } from "../components/pin-scroll-area";
import { StatsScreen } from "./components/stats-screen";

export const metadata: Metadata = {
  title: "Stats | Speedrun IRL",
  description: "Live game statistics.",
};

export default function StatsPage() {
  return (
    <main className="h-full overflow-hidden bg-background text-foreground">
      <PinScrollArea className="flex flex-col overscroll-contain touch-pan-y" wrapperClassName="h-full">
        <StatsScreen />
      </PinScrollArea>
    </main>
  );
}

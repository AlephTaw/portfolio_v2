import type { Metadata } from "next";
import { PinScrollArea } from "../components/pin-scroll-area";
import { StateScreen } from "./components/state-screen";

export const metadata: Metadata = {
  title: "State | Speedrun IRL",
  description: "Live game state.",
};

export default function StatePage() {
  return (
    <main className="h-full overflow-hidden bg-background text-foreground">
      <PinScrollArea className="flex flex-col overscroll-contain touch-pan-y" wrapperClassName="h-full">
        <StateScreen />
      </PinScrollArea>
    </main>
  );
}

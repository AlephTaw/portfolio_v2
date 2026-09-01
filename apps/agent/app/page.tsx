import type { Metadata } from "next";
import { TerminalTimelineRail } from "./components/TimelineRail";

export const metadata: Metadata = {
  title: "Steven Wilcox Agent",
  description: "A minimal workspace for Steven Wilcox's personal agent.",
};

export default function Home() {
  return (
    <main className="flex min-h-[calc(100dvh-var(--composer-dock-offset,6.5rem))] bg-background text-[#191714]">
      <div className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col">
        <TerminalTimelineRail />
        <section aria-label="Agent workspace" className="relative min-h-0 flex-1" />
      </div>
    </main>
  );
}

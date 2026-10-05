import type { Metadata } from "next";
import { SyncIntroduction } from "../components/bootloader/sync-introduction";

export const metadata: Metadata = { title: "Bootloader | Speedrun IRL" };

export default function BootloaderPage() {
  // Authentication is not connected in this stripped-down prototype, so
  // visitors enter the signed-out introduction rather than implying a session.
  return <main className="app-shell min-h-dvh bg-black">
    <SyncIntroduction />
  </main>;
}

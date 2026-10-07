import type { Metadata } from "next";
import { ComingSoonScreen } from "../components/coming-soon/coming-soon-screen";

export const metadata: Metadata = {
  title: "Coming Soon | Speedrun IRL",
  description: "Speedrun IRL is coming soon.",
};

export default function ComingSoonPage() {
  return <ComingSoonScreen />;
}

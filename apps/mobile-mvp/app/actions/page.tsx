import type { Metadata } from "next";
import { ActionsWorkspace } from "../components/actions/actions-workspace";

export const metadata: Metadata = { title: "Actions | Speedrun IRL" };

export default async function ActionsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const initialView = view === "build" || view === "inventory" || view === "chat" || view === "activity" ? view : null;
  return <ActionsWorkspace initialView={initialView} />;
}

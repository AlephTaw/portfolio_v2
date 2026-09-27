import type { Metadata } from "next";
import { InteractionsApp } from "../components/interactions-app";

export const metadata: Metadata = {
  title: "Interactions | Speedrun IRL",
  description: "Conversations and group chats.",
};

export default function InteractionsPage() {
  return <InteractionsApp />;
}

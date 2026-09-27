import { redirect } from "next/navigation";

export default function LegacyInteractionsRedirect() {
  redirect("/interactions");
}

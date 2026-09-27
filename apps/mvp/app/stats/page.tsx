import { redirect } from "next/navigation";

export default function LegacyStateRedirect() {
  redirect("/state");
}

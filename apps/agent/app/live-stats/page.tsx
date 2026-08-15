import { redirect } from "next/navigation";

export default function LiveStatsPage() {
  redirect("/?view=character-sheet");
}

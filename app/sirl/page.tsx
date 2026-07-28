import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HighlightDetailPage } from "../components/HighlightDetailPage";
import { work } from "../data/content";

const highlight = work.find((item) => item.slug === "sirl")!;

export const metadata: Metadata = {
  title: "SIRL - Steven Wilcox",
  description: highlight.description,
};

export default function SirlPage() {
  if (!highlight.isPublished) {
    notFound();
  }

  return <HighlightDetailPage highlight={highlight} showTimeline={false} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HighlightDetailPage } from "../components/HighlightDetailPage";
import { work } from "../data/content";

const highlight = work.find((item) => item.slug === "lhc")!;

export const metadata: Metadata = {
  title: "Large Hadron Collider - Steven Wilcox",
  description: highlight.description,
};

export default function LhcPage() {
  if (!highlight.isPublished) {
    notFound();
  }

  return <HighlightDetailPage highlight={highlight} />;
}

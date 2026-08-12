import type { Metadata } from "next";
import { notFound } from "next/navigation";
import catalogData from "../generated/curriculum-catalog.json";
import { HighlightDetailPage } from "../components/HighlightDetailPage";
import { work } from "../data/content";
import type { CurriculumCatalog } from "../lib/curriculum";
import { CurriculumReader } from "./_components/CurriculumReader";

const highlight = work.find((item) => item.slug === "mlphd")!;

export const metadata: Metadata = {
  title: "Machine Learning PhD Quest - Steven Wilcox",
  description: highlight.description,
};

export default function MlPhdPage() {
  if (!highlight.isPublished) {
    notFound();
  }

  return (
    <HighlightDetailPage
      compactHeader
      detailContent={
        <CurriculumReader catalog={catalogData as CurriculumCatalog} />
      }
      highlight={highlight}
      hideTags
      showTimeline={false}
      tagsBeforeDescription
    />
  );
}

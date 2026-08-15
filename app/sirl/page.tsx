import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HighlightDetailPage } from "../components/HighlightDetailPage";
import { SirlAuthBackground } from "../components/SirlAuthBackground";
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

  return (
    <HighlightDetailPage
      compactHeader
      highlight={highlight}
      hideTags
      placeholderContent={
        <>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.32em] text-[#766b5d]">
            Coming Soon
          </p>
          <SirlAuthBackground />
        </>
      }
      showTimeline={false}
      tagsBeforeDescription
    />
  );
}

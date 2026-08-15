import type { Metadata } from "next";
import { CvPage } from "../page";

export const metadata: Metadata = {
  title: "Steven Wilcox - Serif Smaller Preview",
  description: "A smaller serif typography preview for the CV site.",
};

export default function SerifSmallerPreview() {
  return <CvPage serifVariant="smaller" />;
}

import type { Metadata } from "next";
import { CvPage } from "../page";

export const metadata: Metadata = {
  title: "Steven Wilcox - Serif Thinner Preview",
  description: "A thinner serif typography preview for the CV site.",
};

export default function SerifThinnerPreview() {
  return <CvPage serifVariant="thinner" />;
}

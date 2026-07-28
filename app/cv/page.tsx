import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft, FiDownload } from "react-icons/fi";

const resumePath = "/assets/steven-wilcox-anonymized-resume.pdf";

export const metadata: Metadata = {
  title: "Steven Wilcox - CV",
  description: "View or download Steven Wilcox's anonymized CV.",
};

export default function CvViewerPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#e9e5dc] text-[#191714]">
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-black/15 bg-[#FEFCF1] px-4 py-3 sm:px-6">
        <Link
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#514a40] transition hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FEFCF1]"
          href="/"
        >
          <FiArrowLeft aria-hidden="true" />
          Back to profile
        </Link>

        <p className="hidden text-sm font-semibold uppercase tracking-[0.16em] sm:block">
          Steven Wilcox - CV
        </p>

        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-4 text-sm font-semibold text-[#FEFCF1] transition hover:bg-[#615754] focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FEFCF1]"
          download="steven-wilcox-cv.pdf"
          href={resumePath}
        >
          <FiDownload aria-hidden="true" />
          Download
        </a>
      </header>

      <section aria-label="CV document viewer" className="min-h-0 flex-1 p-2 sm:p-4">
        <object
          aria-label="Steven Wilcox anonymized CV"
          className="h-[calc(100dvh-5rem)] w-full rounded-sm bg-white shadow-sm"
          data={`${resumePath}#view=FitH&navpanes=0`}
          type="application/pdf"
        >
          <div className="mx-auto mt-16 max-w-md bg-[#FEFCF1] p-8 text-center shadow-sm">
            <p className="text-base leading-7 text-[#514a40]">
              Your browser cannot display the CV inline.
            </p>
            <a
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-black px-5 text-sm font-semibold text-[#FEFCF1]"
              download="steven-wilcox-cv.pdf"
              href={resumePath}
            >
              Download the PDF
            </a>
          </div>
        </object>
      </section>
    </main>
  );
}

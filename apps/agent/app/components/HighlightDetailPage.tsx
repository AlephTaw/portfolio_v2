import Link from "next/link";
import type { ReactNode } from "react";
import { work } from "../data/content";
import { DocumentToc } from "./DocumentToc";
import { MarkdownDocument } from "../lib/markdown";
import { Timeline } from "./Timeline";

type Highlight = (typeof work)[number];

export function HighlightDetailPage({
  highlight,
  showTimeline = true,
  document,
  placeholderContent,
  tagsBeforeDescription = false,
  compactHeader = false,
  hideTags = false,
  detailContent,
}: {
  highlight: Highlight;
  showTimeline?: boolean;
  document?: {
    title?: string;
    description?: string;
    toc: { id: string; text: string; level: number }[];
    content: string;
  };
  placeholderContent?: ReactNode;
  tagsBeforeDescription?: boolean;
  compactHeader?: boolean;
  hideTags?: boolean;
  detailContent?: ReactNode;
}) {
  const tags = hideTags ? null : (
    <ul
      className={`${tagsBeforeDescription ? "mt-4" : "mt-8"} flex flex-wrap justify-center gap-2`}
    >
      {highlight.tags.map((tag) => (
        <li
          className="border border-[#d8d0c1] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#615754]"
          key={tag}
        >
          {tag}
        </li>
      ))}
    </ul>
  );

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-[#191714] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          className="text-xs font-semibold uppercase tracking-[0.32em] text-[#766b5d]"
          href="/"
        >
          Back
        </Link>

        <header
          className={`mx-auto flex max-w-3xl flex-col items-center text-center ${
            compactHeader
              ? "min-h-0 justify-start pb-10"
              : "min-h-[48vh] justify-center"
          }`}
        >
          <h1 className="text-3xl font-light leading-tight sm:text-4xl">
            {highlight.title}
          </h1>
          <p className="mt-5 text-sm text-[#8D7A70]">{highlight.period}</p>
          {tagsBeforeDescription ? tags : null}
          <p
            className={`${tagsBeforeDescription ? "mt-4" : "mt-8"} max-w-2xl text-base leading-7 text-[#514a40]`}
          >
            {highlight.description}
          </p>
          {tagsBeforeDescription ? null : tags}
        </header>

        {showTimeline ? (
          <Timeline
            items={highlight.timeline}
            label={`${highlight.title} timeline`}
          />
        ) : detailContent ? (
          detailContent
        ) : document ? (
          <section className="grid gap-10 lg:grid-cols-[minmax(14rem,16rem)_minmax(0,1fr)] lg:items-start">
            <DocumentToc items={document.toc} />

            <article className="min-w-0 bg-background px-6 py-0 sm:px-8">
              <div>
                <MarkdownDocument source={document.content} />
              </div>
            </article>
          </section>
        ) : placeholderContent ? (
          <section className="space-y-10">{placeholderContent}</section>
        ) : (
          <section className="space-y-10">
            <section className="mx-auto max-w-3xl border border-[#d8d0c1] px-6 py-16 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#766b5d]">
                Coming Soon
              </p>
              <p className="mt-4 text-base leading-7 text-[#514a40]">
                This timeline is temporarily hidden while the detail page is being
                updated.
              </p>
            </section>
          </section>
        )}
      </div>
    </main>
  );
}

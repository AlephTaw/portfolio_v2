import Link from "next/link";
import { work } from "../data/content";
import { Timeline } from "./Timeline";

type Highlight = (typeof work)[number];

export function HighlightDetailPage({
  highlight,
  showTimeline = true,
}: {
  highlight: Highlight;
  showTimeline?: boolean;
}) {
  return (
    <main className="min-h-screen bg-[#FEFCF1] px-5 py-8 text-[#191714] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          className="text-xs font-semibold uppercase tracking-[0.32em] text-[#766b5d]"
          href="/"
        >
          Back
        </Link>

        <header className="mx-auto flex min-h-[48vh] max-w-3xl flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-light leading-tight sm:text-4xl">
            {highlight.title}
          </h1>
          <p className="mt-5 text-sm text-[#8D7A70]">{highlight.period}</p>
          <p className="mt-8 max-w-2xl text-base leading-7 text-[#514a40]">
            {highlight.description}
          </p>
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {highlight.tags.map((tag) => (
              <li
                className="border border-[#d8d0c1] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#615754]"
                key={tag}
              >
                {tag}
              </li>
            ))}
          </ul>
        </header>

        {showTimeline ? (
          <Timeline
            items={highlight.timeline}
            label={`${highlight.title} timeline`}
          />
        ) : (
          <section className="mx-auto max-w-3xl border border-[#d8d0c1] px-6 py-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#766b5d]">
              Coming Soon
            </p>
            <p className="mt-4 text-base leading-7 text-[#514a40]">
              This timeline is temporarily hidden while the detail page is being
              updated.
            </p>
            {/*
            <Timeline
              items={highlight.timeline}
              label={`${highlight.title} timeline`}
            />
            */}
          </section>
        )}
      </div>
    </main>
  );
}

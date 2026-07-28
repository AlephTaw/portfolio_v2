import Link from "next/link";
import type { Metadata } from "next";
import { ConwayLife } from "./ConwayLife";
import { PublicationHeading, PublicationRow } from "./PublicationMotion";
import {
  achievements,
  capabilities,
  courses,
  experience,
  profile,
  work,
} from "./data/content";

export const metadata: Metadata = {
  title: `${profile.name} - CV and Work`,
  description: profile.summary,
};

type SerifVariant = "default" | "thinner" | "smaller";

const serifVariants: Record<
  SerifVariant,
  { name: string; intro: string }
> = {
  default: {
    name: "font-serif text-2xl font-light leading-[1.02] sm:text-3xl lg:text-4xl",
    intro: "font-serif text-xl font-thin italic leading-[1.35] tracking-[0.015em] text-[#615754]",
  },
  thinner: {
    name: "font-serif text-2xl font-thin leading-[1.02] sm:text-3xl lg:text-4xl",
    intro: "font-serif text-xl font-thin italic leading-[1.35] tracking-[0.015em] text-[#615754]",
  },
  smaller: {
    name: "font-serif text-xl font-light leading-[1.02] sm:text-2xl lg:text-3xl",
    intro: "font-serif text-xl font-thin italic leading-[1.35] tracking-[0.015em] text-[#615754]",
  },
};

export function CvPage({ serifVariant = "default" }: { serifVariant?: SerifVariant }) {
  const serif = serifVariants[serifVariant];

  return (
    <main className="min-h-screen bg-[#FEFCF1] text-[#191714]">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 px-5 py-5 sm:px-8 lg:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)] lg:gap-10 lg:px-10">
        <aside className="flex flex-col items-center border-b border-[#d8d0c1] pb-8 text-center transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:items-start lg:border-b-0 lg:border-r lg:py-10 lg:pr-10 lg:text-left">
          <div className="flex w-full flex-col items-center lg:items-start">
            <h1 className={`max-w-[12ch] text-center lg:text-left ${serif.name}`}>
              {profile.name}
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-[#514a40]">
              {profile.role}
            </p>
          </div>

          <div className="my-8 flex w-full max-w-sm flex-col items-center gap-6">
            <div className="aspect-[1.62/1] w-full overflow-hidden border border-black bg-transparent">
              <ConwayLife />
            </div>

            <Link
              className="rounded-full border border-black bg-transparent px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-black hover:text-[#FEFCF1] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#FEFCF1]"
              href="/live-stats"
            >
              LIVE STATS
            </Link>

            <nav
              aria-label="Profile links"
              className="flex w-full items-start justify-between"
            >
              {profile.links.map((link) => (
                <a
                  aria-label={link.label}
                  className="group flex min-w-0 flex-col items-center gap-2 text-[#766b5d] focus:outline-none"
                  href={link.href}
                  key={link.label}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-black text-[#FEFCF1] transition group-hover:bg-[#766b5d] group-focus-visible:bg-[#766b5d] group-focus-visible:ring-2 group-focus-visible:ring-[#766b5d] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#FEFCF1]">
                    <link.Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="min-h-4 text-[0.65rem] font-medium uppercase tracking-[0.16em] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {link.label}
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="py-10 lg:py-10">
          <section
            aria-labelledby="intro-heading"
            className="border-b border-[#d8d0c1] pb-12"
          >
            <div className="space-y-6 text-center lg:text-left">
              <p className="text-xs uppercase tracking-[0.32em] text-[#766b5d]">
                Based in the {profile.location}
              </p>
              <h2
                id="intro-heading"
                className={`mx-auto max-w-3xl lg:mx-0 ${serif.intro}`}
              >
                “{profile.summary}”
              </h2>
            </div>
          </section>

          <section
            aria-labelledby="work-heading"
            className="border-b border-[#d8d0c1] py-12"
          >
            <PublicationHeading className="mb-8 flex items-end justify-between gap-6">
              <h2
                id="work-heading"
                className="text-xs font-semibold uppercase tracking-[0.32em] text-[#615754]"
              >
                Career Highlights
              </h2>
            </PublicationHeading>

            <div className="grid gap-4">
              {work.map((item) => (
                <PublicationRow
                  className="group grid gap-5 border border-[#d8d0c1] bg-[#FEFCF1] p-5 transition-colors duration-300 hover:border-black md:grid-cols-[1fr_1.4fr]"
                  key={item.title}
                >
                  <div className="flex min-h-full flex-col">
                    <div>
                      <p className="text-sm text-[#8D7A70]">{item.period}</p>
                      <h3 className="mt-2 text-xl font-medium">
                        {item.title}
                      </h3>
                      {item.title === "Machine Learning PhD Quest" ? (
                        <div
                          aria-hidden="true"
                          className="mt-4 h-1.5 w-32 border border-black"
                        >
                          <div className="h-full w-9 bg-black" />
                        </div>
                      ) : null}
                    </div>
                    {item.isPublished ? (
                      <Link
                        className="mt-auto pt-5 text-sm font-medium text-[#8D7A70] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        href={`/${item.slug}`}
                      >
                        Explore &gt;&gt;
                      </Link>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-base leading-7 text-[#514a40]">
                      {item.description}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <li
                          className="border border-[#d8d0c1] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#615754]"
                          key={tag}
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </PublicationRow>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="experience-heading"
            className="border-b border-[#d8d0c1] py-12"
          >
            <PublicationHeading>
              <h2
                id="experience-heading"
                className="text-xs font-semibold uppercase tracking-[0.32em] text-[#615754]"
              >
                Experience
              </h2>
            </PublicationHeading>

            <div className="mt-8 divide-y divide-[#d8d0c1]">
              {experience.map((item) => (
                <PublicationRow
                  className="py-5"
                  key={`${item.organization}-${item.period}`}
                >
                  <p className="font-medium">{item.organization}</p>
                  <p className="mt-1 text-base text-[#514a40]">{item.role}</p>
                  <p className="mt-1 text-sm text-[#8D7A70]">{item.period}</p>
                </PublicationRow>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="achievements-heading"
            className="border-b border-[#d8d0c1] py-12"
          >
            <PublicationHeading>
              <h2
                id="achievements-heading"
                className="text-xs font-semibold uppercase tracking-[0.32em] text-[#615754]"
              >
                Achievements
              </h2>
            </PublicationHeading>

            <div className="mt-6 divide-y divide-[#d8d0c1]">
              {achievements.map((achievement) => (
                <PublicationRow
                  className="py-3 text-base text-[#514a40]"
                  key={achievement}
                >
                  {achievement}
                </PublicationRow>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="capabilities-heading"
            className="border-b border-[#d8d0c1] py-12"
          >
            <h2
              id="capabilities-heading"
              className="text-xs font-semibold uppercase tracking-[0.32em] text-[#615754]"
            >
              Capabilities
            </h2>
            <ul className="mt-6 space-y-5">
              {capabilities.map((capability) => (
                <li key={capability.category}>
                  <p className="text-sm font-semibold text-[#615754]">
                    {capability.category}
                  </p>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-[#514a40]">
                    <p>
                      <span className="font-medium text-[#615754]">Skills:</span>{" "}
                      {capability.skills.join(" | ")}
                    </p>
                    {capability.technologies?.length ? (
                      <p>
                        <span className="font-medium text-[#615754]">
                          Technologies:
                        </span>{" "}
                        {capability.technologies.join(" | ")}
                      </p>
                    ) : null}
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {capability.examples.map((skill) => (
                      <li
                        className="border border-[#d8d0c1] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#615754]"
                        key={skill}
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="courses-heading" className="py-12">
            <PublicationHeading>
              <h2
                id="courses-heading"
                className="text-xs font-semibold uppercase tracking-[0.32em] text-[#615754]"
              >
                Selected Courses
              </h2>
            </PublicationHeading>

            <div className="mt-6 space-y-3">
              {courses.map((course) => (
                <PublicationRow
                  className="text-base text-[#514a40]"
                  key={course}
                >
                  {course}
                </PublicationRow>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  return <CvPage />;
}

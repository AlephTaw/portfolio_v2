import type { Metadata } from "next";
import { PublicationHeading, PublicationRow } from "./PublicationMotion";

const profile = {
  name: "Steven Wilcox",
  role: "Software engineer and product-minded builder",
  location: "United States",
  email: "hello@example.com",
  summary:
    "I build calm, capable software for people who need systems to be understandable, reliable, and a little easier to live inside.",
  links: [
    { label: "Email", href: "mailto:hello@example.com" },
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "CV PDF", href: "/cv.pdf" },
  ],
};

const work = [
  {
    title: "Applied AI Interfaces",
    period: "Recent",
    description:
      "Designed and implemented tools that turn ambiguous workflows into focused, inspectable product experiences.",
    tags: ["React", "TypeScript", "AI UX"],
  },
  {
    title: "Developer Systems",
    period: "Recent",
    description:
      "Built internal platforms, automation, and integration surfaces that improve engineering feedback loops.",
    tags: ["APIs", "Tooling", "Reliability"],
  },
  {
    title: "Data-Rich Products",
    period: "Earlier",
    description:
      "Created interfaces for exploring operational data with an emphasis on speed, legibility, and trust.",
    tags: ["Dashboards", "Design Systems", "Analytics"],
  },
];

const experience = [
  {
    organization: "Independent / Consulting",
    role: "Software Engineer",
    period: "2024 - Present",
    details:
      "Partnering with teams on product architecture, frontend systems, AI-assisted workflows, and practical delivery.",
  },
  {
    organization: "Previous Company",
    role: "Senior Engineer",
    period: "2021 - 2024",
    details:
      "Led implementation across user-facing products, shared frontend foundations, and backend service integrations.",
  },
  {
    organization: "Earlier Roles",
    role: "Engineer",
    period: "Before 2021",
    details:
      "Developed production software across web applications, workflow tools, data products, and platform services.",
  },
];

const capabilities = [
  "Frontend architecture",
  "Product engineering",
  "AI-assisted workflows",
  "TypeScript and React",
  "Design systems",
  "Data visualization",
  "API integration",
  "Technical writing",
];

export const metadata: Metadata = {
  title: `${profile.name} - CV and Work`,
  description: profile.summary,
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#191714]">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 px-5 py-5 sm:px-8 lg:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)] lg:gap-10 lg:px-10">
        <aside className="flex flex-col justify-between border-b border-[#d8d0c1] pb-8 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:py-10 lg:pr-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7f4b31]">
              Public CV
            </p>
            <h1 className="mt-8 max-w-[12ch] text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl">
              {profile.name}
            </h1>
            <p className="mt-6 max-w-sm text-lg leading-7 text-[#514a40]">
              {profile.role}
            </p>
          </div>

          <div className="mt-10 space-y-8">
            <p className="max-w-sm text-pretty text-xl leading-8 text-[#2f2b25]">
              {profile.summary}
            </p>

            <nav aria-label="Profile links" className="flex flex-wrap gap-2">
              {profile.links.map((link) => (
                <a
                  className="inline-flex h-10 items-center border border-[#bcae9a] px-4 text-sm font-medium text-[#191714] transition hover:border-[#7f4b31] hover:bg-[#ebe1d2] focus:outline-none focus:ring-2 focus:ring-[#7f4b31] focus:ring-offset-2 focus:ring-offset-[#f6f1e8]"
                  href={link.href}
                  key={link.label}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="py-10 lg:py-10">
          <section
            aria-labelledby="intro-heading"
            className="grid gap-6 border-b border-[#d8d0c1] pb-12 md:grid-cols-[0.7fr_1.3fr]"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-[#766b5d]">
                Based in {profile.location}
              </p>
            </div>
            <div>
              <h2
                id="intro-heading"
                className="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl"
              >
                I like software that earns trust through clarity: thoughtful
                interfaces, boringly solid systems, and details that hold up
                under daily use.
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
                className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7f4b31]"
              >
                Selected Work
              </h2>
              <p className="hidden max-w-xs text-right text-sm leading-6 text-[#675f54] sm:block">
                A compact view of the kinds of projects this page can point to.
              </p>
            </PublicationHeading>

            <div className="grid gap-4">
              {work.map((item) => (
                <PublicationRow
                  className="grid gap-5 border border-[#d8d0c1] bg-[#fbf8f1] p-5 md:grid-cols-[1fr_1.4fr]"
                  key={item.title}
                >
                  <div>
                    <p className="text-sm text-[#766b5d]">{item.period}</p>
                    <h3 className="mt-2 text-2xl font-semibold">
                      {item.title}
                    </h3>
                  </div>
                  <div>
                    <p className="text-base leading-7 text-[#514a40]">
                      {item.description}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <li
                          className="border border-[#cfc4b3] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#675f54]"
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
                className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7f4b31]"
              >
                Experience
              </h2>
            </PublicationHeading>

            <div className="mt-8 divide-y divide-[#d8d0c1]">
              {experience.map((item) => (
                <PublicationRow
                  className="grid gap-3 py-6 md:grid-cols-[0.8fr_1.2fr]"
                  key={`${item.organization}-${item.period}`}
                >
                  <div>
                    <p className="font-semibold">{item.organization}</p>
                    <p className="mt-1 text-sm text-[#766b5d]">
                      {item.period}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{item.role}</h3>
                    <p className="mt-2 max-w-2xl leading-7 text-[#514a40]">
                      {item.details}
                    </p>
                  </div>
                </PublicationRow>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="capabilities-heading"
            className="grid gap-8 py-12 md:grid-cols-[0.75fr_1.25fr]"
          >
            <div>
              <h2
                id="capabilities-heading"
                className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7f4b31]"
              >
                Capabilities
              </h2>
              <p className="mt-4 max-w-xs leading-7 text-[#514a40]">
                The page is intentionally plainspoken: it should read like a CV,
                not a campaign.
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {capabilities.map((capability) => (
                <li
                  className="border-b border-[#d8d0c1] pb-3 text-lg font-medium"
                  key={capability}
                >
                  {capability}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}

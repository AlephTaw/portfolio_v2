"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DragScrollPane } from "./DragScrollPane";

type PageId =
  | "live-campaign-status"
  | "core-character-statistics"
  | "identity-details"
  | "highlights"
  | "utility-rows"
  | "health-achievements"
  | "wealth-achievements"
  | "interaction-achievements"
  | "sentience-achievements"
  | "competence-achievements"
  | "achievements-copy"
  | "inventory"
  | "skills"
  | "templates-placeholder";

const achievementPages: Array<{ id: PageId; title: string }> = [
  { id: "health-achievements", title: "Health Achievements Row" },
  { id: "wealth-achievements", title: "Wealth Achievements Row" },
  { id: "interaction-achievements", title: "Interaction Achievements Row" },
  { id: "sentience-achievements", title: "Sentience Achievements Row" },
  { id: "competence-achievements", title: "Competence Achievements Row" },
  { id: "achievements-copy", title: "Achievements Copy" },
];

const pageNumbers: Record<Exclude<PageId, "live-campaign-status">, string> = {
  "core-character-statistics": "1",
  "identity-details": "2",
  highlights: "3",
  "utility-rows": "4",
  "health-achievements": "5",
  "wealth-achievements": "6",
  "interaction-achievements": "7",
  "sentience-achievements": "8",
  "competence-achievements": "9",
  "achievements-copy": "10",
  inventory: "11",
  skills: "12",
  "templates-placeholder": "13",
};

const detailPageTitles: Record<Exclude<PageId, "live-campaign-status">, string> = {
  "core-character-statistics": "Core Character Statistics",
  "identity-details": "Occupation and Titles",
  highlights: "Highlights",
  "utility-rows": "Campaign Metrics",
  "health-achievements": "Health Achievements Row",
  "wealth-achievements": "Wealth Achievements Row",
  "interaction-achievements": "Interaction Achievements Row",
  "sentience-achievements": "Sentience Achievements Row",
  "competence-achievements": "Competence Achievements Row",
  "achievements-copy": "Achievements Copy",
  inventory: "Inventory",
  skills: "Skills",
  "templates-placeholder": "Templates Placeholder",
};

const highlightCategories = [
  "Social",
  "Money",
  "Skills",
  "Training",
  "Experience",
  "Health Blueprint",
];

const coreStatSections = [
  "Aura",
  "Mana",
  "Health",
  "Vitality",
  "Sentience",
  "Karma",
  "Experience",
  "Wealth",
];

const planningSections = ["Experiments", "Strategy", "Plans"];

type StatId =
  | "mana"
  | "aura"
  | "wealth"
  | "experience"
  | "karma"
  | "sentience"
  | "vitality"
  | "health";

const statExplorerItems: Array<{
  id: StatId;
  label: string;
  dot: { cx: number; cy: number };
  pathIndex: number;
}> = [
  {
    id: "mana",
    label: "Mana",
    dot: { cx: 130, cy: 34.35 },
    pathIndex: 5,
  },
  {
    id: "aura",
    label: "Aura",
    dot: { cx: 177.75, cy: 48.25 },
    pathIndex: 3,
  },
  {
    id: "wealth",
    label: "Wealth",
    dot: { cx: 191.15, cy: 95.5 },
    pathIndex: 7,
  },
  {
    id: "experience",
    label: "Experience",
    dot: { cx: 177.75, cy: 143.75 },
    pathIndex: 6,
  },
  {
    id: "karma",
    label: "Karma",
    dot: { cx: 130, cy: 156.65 },
    pathIndex: 2,
  },
  {
    id: "sentience",
    label: "Sentience",
    dot: { cx: 82.25, cy: 143.75 },
    pathIndex: 4,
  },
  {
    id: "vitality",
    label: "Vitality",
    dot: { cx: 68.85, cy: 95.5 },
    pathIndex: 8,
  },
  {
    id: "health",
    label: "Health",
    dot: { cx: 82.25, cy: 48.25 },
    pathIndex: 9,
  },
];

function PlaceholderLine({
  width,
  height = "h-4",
}: {
  width: string;
  height?: string;
}) {
  return <div className={`${height} ${width} rounded bg-[#ddd5c8]`} />;
}

function PlaceholderLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8D7A70]">
      {children}
    </p>
  );
}

function PlaceholderCard() {
  return (
    <div className="group grid gap-5 border border-[#d8d0c1] bg-[#FEFCF1] p-5 transition-colors duration-300 hover:border-black md:grid-cols-[1fr_1.4fr]">
      <div className="flex min-h-full flex-col gap-3">
        <PlaceholderLine height="h-3" width="w-24" />
        <PlaceholderLine height="h-6" width="w-48" />
        <div className="mt-4 h-1.5 w-32 rounded-none border border-[#44413b]" />
        <div className="mt-auto pt-5">
          <PlaceholderLine height="h-4" width="w-20" />
        </div>
      </div>
      <div className="space-y-3">
        <PlaceholderLine width="w-full" />
        <PlaceholderLine width="w-[92%]" />
        <PlaceholderLine width="w-[76%]" />
        <div className="mt-5 flex flex-wrap gap-2">
          <div className="h-7 w-16 border border-[#d8d0c1] bg-[#f5efe1]" />
          <div className="h-7 w-24 border border-[#d8d0c1] bg-[#f5efe1]" />
          <div className="h-7 w-20 border border-[#d8d0c1] bg-[#f5efe1]" />
        </div>
      </div>
    </div>
  );
}

function PlaceholderRow() {
  return (
    <div className="py-5">
      <PlaceholderLine width="w-40" />
      <div className="mt-3">
        <PlaceholderLine width="w-56" />
      </div>
      <div className="mt-3">
        <PlaceholderLine height="h-3" width="w-28" />
      </div>
    </div>
  );
}

function PlaceholderCapability() {
  return (
    <li>
      <PlaceholderLine width="w-32" />
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="h-7 w-20 border border-[#d8d0c1] bg-[#f5efe1]" />
        <div className="h-7 w-24 border border-[#d8d0c1] bg-[#f5efe1]" />
        <div className="h-7 w-28 border border-[#d8d0c1] bg-[#f5efe1]" />
        <div className="h-7 w-16 border border-[#d8d0c1] bg-[#f5efe1]" />
      </div>
    </li>
  );
}

function PlaceholderFourBoxRow({ values }: { values?: string[] }) {
  const [leftA, rightA, leftB, rightB] = values ?? [];

  return (
    <div className="flex w-full items-center gap-4">
      <div className="flex flex-1 items-center justify-between gap-3">
        <div className="flex h-10 min-w-0 items-center justify-start rounded bg-[#ddd5c8] px-3 text-sm font-medium text-[#191714]">
          {leftA}
        </div>
        <div className="flex h-10 min-w-0 items-center justify-end rounded bg-[#ddd5c8] px-3 text-right text-sm italic text-[#191714]">
          {rightA}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-between gap-3">
        <div className="flex h-10 min-w-0 items-center justify-start rounded bg-[#ddd5c8] px-3 text-sm italic text-[#191714]">
          {leftB}
        </div>
        <div className="flex h-10 min-w-0 items-center justify-end rounded bg-[#ddd5c8] px-3 text-right text-sm font-medium text-[#191714]">
          {rightB}
        </div>
      </div>
    </div>
  );
}

function PlaceholderColumnSeries({ id }: { id: string }) {
  return (
    <div className="grid w-full grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="grid gap-2" key={`${id}-${index}`}>
          <div className="aspect-square w-full border border-[#d8d0c1] bg-[#ddd5c8]" />
          <div className="h-5 w-full rounded bg-[#ddd5c8]" />
        </div>
      ))}
    </div>
  );
}

function CampaignStatusSummary() {
  return (
    <div className="flex h-12 w-full items-stretch gap-4">
      <div className="h-12 w-12 shrink-0 rounded-full border border-[#d8d0c1] bg-[#ddd5c8]" />

      <div className="flex h-full flex-1 overflow-hidden">
        <div className="flex h-full w-full flex-col">
          <div className="grid flex-1 grid-cols-[minmax(0,1fr)_auto] items-stretch gap-4">
            <div className="flex min-w-0 items-center justify-start gap-2 bg-[#ddd5c8] px-1">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#191714]" />
              <span className="truncate text-xs font-medium text-[#191714]">
                CRUCIBLE:
              </span>
            </div>
            <div className="flex min-w-0 items-center justify-end bg-[#ddd5c8] px-1">
              <span className="truncate text-right text-xs font-bold text-[#191714]">
                -14D:13h:29m:13s
              </span>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-[minmax(0,1fr)_auto] items-stretch gap-4">
            <div className="flex min-w-0 items-center justify-start bg-[#ddd5c8] pl-1 pr-3">
              <span className="min-w-0 text-xs italic text-[#191714]">
                ACT I: The Bruised Reed
              </span>
            </div>
            <div className="flex min-w-0 items-stretch justify-end bg-[#ddd5c8]">
              <div className="aspect-square h-full shrink-0 rounded-full border border-[#191714]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatExplorer({
  onActivate,
  selectedStat,
  onSelectStat,
}: {
  onActivate: () => void;
  selectedStat: StatId;
  onSelectStat: (stat: StatId) => void;
}) {
  const objectRef = useRef<HTMLObjectElement | null>(null);
  const [isVersionSelected, setIsVersionSelected] = useState(false);
  const [svgLoadVersion, setSvgLoadVersion] = useState(0);

  useEffect(() => {
    const svgDocument = objectRef.current?.contentDocument;
    const svg = svgDocument?.querySelector("svg");

    if (!svgDocument || !svg) {
      return;
    }

    svg.style.cursor = "pointer";
    svg.onclick = () => {
      onActivate();
    };

    const paths = Array.from(svgDocument.querySelectorAll("path"));
    let markerLayer = svgDocument.querySelector<SVGGElement>(
      "[data-stat-marker-layer]",
    );
    let versionLabel = svgDocument.querySelector<SVGTextElement>(
      "[data-stat-version-label]",
    );

    if (!markerLayer) {
      markerLayer = svgDocument.createElementNS(
        "http://www.w3.org/2000/svg",
        "g",
      );
      markerLayer.setAttribute("data-stat-marker-layer", "true");
      svg.appendChild(markerLayer);
    }

    markerLayer.replaceChildren();

    if (!versionLabel) {
      versionLabel = svgDocument.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      versionLabel.setAttribute("data-stat-version-label", "true");
      svg.appendChild(versionLabel);
    }

    versionLabel.textContent = "v0.1.0";
    versionLabel.setAttribute("x", "130");
    versionLabel.setAttribute("y", "95.5");
    versionLabel.setAttribute("text-anchor", "middle");
    versionLabel.setAttribute("dominant-baseline", "middle");
    versionLabel.setAttribute("fill", "#191714");
    versionLabel.setAttribute("fill-opacity", "0.45");
    versionLabel.setAttribute("font-size", "12");
    versionLabel.setAttribute("font-weight", isVersionSelected ? "700" : "300");
    versionLabel.style.cursor = "pointer";
    versionLabel.style.pointerEvents = "auto";
    versionLabel.onclick = (event) => {
      event.stopPropagation();
      onActivate();
      setIsVersionSelected(true);
    };

    statExplorerItems.forEach((item) => {
      const isSelected = item.id === selectedStat;
      const labelPath = paths[item.pathIndex];

      if (labelPath) {
        labelPath.style.cursor = "pointer";
        labelPath.style.fillOpacity = isSelected ? "1" : "0.2";
        labelPath.onclick = (event) => {
          event.stopPropagation();
          onActivate();
          onSelectStat(item.id);
        };
      }

      const marker = svgDocument.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      marker.setAttribute("cx", String(item.dot.cx));
      marker.setAttribute("cy", String(item.dot.cy));
      marker.setAttribute("r", "2.5");
      marker.setAttribute("fill", "black");
      marker.style.opacity = isSelected ? "1" : "0";
      marker.style.transition = "opacity 160ms ease";
      markerLayer?.appendChild(marker);
    });

    const originalAuraDot = svgDocument.querySelector("circle");
    originalAuraDot?.setAttribute("opacity", "0");
  }, [isVersionSelected, onActivate, onSelectStat, selectedStat, svgLoadVersion]);

  return (
    <object
      aria-label="Core character stat explorer"
      className="h-full w-full"
      data="/mockups/stat-selector.svg"
      data-no-drag-scroll="true"
      onLoad={() => setSvgLoadVersion((version) => version + 1)}
      ref={objectRef}
      type="image/svg+xml"
    />
  );
}

function LeftPaneButton({
  active,
  children,
  onClick,
  className = "p-3",
}: {
  active: boolean;
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <div
      className={`w-full cursor-pointer border border-black text-left transition ${className} ${
        active ? "bg-[#f5efe1]" : "bg-transparent hover:bg-[#f5efe1]"
      }`}
      data-no-drag-scroll="true"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

function DefaultRightPane() {
  return (
    <div>
      <section
        aria-label="Intro placeholder"
        className="border-b border-[#d8d0c1] pb-12"
      >
        <div className="space-y-6 text-center lg:text-left">
          <PlaceholderLine height="h-3" width="w-40" />
          <div className="space-y-3">
            <PlaceholderLine height="h-6" width="w-full max-w-3xl" />
            <PlaceholderLine height="h-6" width="w-[85%]" />
          </div>
        </div>
      </section>

      <section
        aria-label="Career highlight placeholders"
        className="border-b border-[#d8d0c1] py-12"
      >
        <div className="mb-8 flex items-end justify-between gap-6">
          <PlaceholderLine height="h-3" width="w-32" />
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <PlaceholderCard key={index} />
          ))}
        </div>
      </section>

      <section
        aria-label="Experience placeholders"
        className="border-b border-[#d8d0c1] py-12"
      >
        <PlaceholderLine height="h-3" width="w-24" />

        <div className="mt-8 divide-y divide-[#d8d0c1]">
          {Array.from({ length: 6 }).map((_, index) => (
            <PlaceholderRow key={index} />
          ))}
        </div>
      </section>

      <section
        aria-label="Achievement placeholders"
        className="border-b border-[#d8d0c1] py-12"
      >
        <PlaceholderLine height="h-3" width="w-28" />

        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <PlaceholderLine key={index} width="w-full" />
          ))}
        </div>
      </section>

      <section
        aria-label="Capability placeholders"
        className="border-b border-[#d8d0c1] py-12"
      >
        <PlaceholderLine height="h-3" width="w-24" />
        <ul className="mt-6 space-y-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <PlaceholderCapability key={index} />
          ))}
        </ul>
      </section>

      <section aria-label="Course placeholders" className="py-12">
        <PlaceholderLine height="h-3" width="w-32" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <PlaceholderLine key={index} width="w-[70%]" />
          ))}
        </div>
      </section>
    </div>
  );
}

function DetailRightPane({
  pageNumber,
  title,
}: {
  pageNumber: string;
  title: string;
}) {
  return (
    <div>
      <section
        aria-label="Intro placeholder"
        className="border-b border-[#d8d0c1] pb-12"
      >
        <div className="space-y-6 text-center lg:text-left">
          <p className="text-xs font-light uppercase tracking-[0.32em] text-[#8D7A70]">
            {title}
          </p>
          <div className="space-y-3">
            <PlaceholderLine height="h-6" width="w-full max-w-3xl" />
            <PlaceholderLine height="h-6" width="w-[85%]" />
          </div>
        </div>
      </section>

      <section
        aria-label="Career highlight placeholder"
        className="border-b border-[#d8d0c1] py-12"
      >
        <div className="mb-8 flex items-end justify-between gap-6">
          <PlaceholderLine height="h-3" width="w-32" />
        </div>

        <div className="grid gap-4">
          <PlaceholderCard />
        </div>

        <p className="mt-10 text-right text-sm font-medium text-[#615754]">
          {pageNumber}
        </p>
      </section>
    </div>
  );
}

const categorizedDetailPages: Partial<
  Record<PageId, { title: string; categories: string[] }>
> = {
  inventory: {
    title: "Inventory",
    categories: ["Physical", "Digital"],
  },
  skills: {
    title: "Skills",
    categories: [
      "Machine Learning Engineering",
      "Dev Ops",
      "Data",
      "Full Stack",
      "ML Scientist",
    ],
  },
};

function CategorizedDetailRightPane({
  categories,
  pageNumber,
  title,
}: {
  categories: string[];
  pageNumber: string;
  title: string;
}) {
  return (
    <div>
      <section
        aria-label={`${title} detail intro`}
        className="border-b border-[#d8d0c1] pb-12"
      >
        <div className="space-y-6 text-center lg:text-left">
          <p className="text-xs font-light uppercase tracking-[0.32em] text-[#8D7A70]">
            {title}
          </p>
        </div>
      </section>

      <section
        aria-label={`${title} categorized placeholders`}
        className="border-b border-[#d8d0c1] py-12"
      >
        <div className="space-y-10">
          {categories.map((category) => (
            <div key={`${title}-${category}`}>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-[#615754]">
                {category}
              </p>
              <PlaceholderColumnSeries id={`${title}-${category}`} />
            </div>
          ))}
        </div>

        <p className="mt-10 text-right text-sm font-medium text-[#615754]">
          {pageNumber}
        </p>
      </section>
    </div>
  );
}

function HighlightsDetailRightPane({ pageNumber }: { pageNumber: string }) {
  return (
    <div className="flex min-h-full flex-col">
      <section
        aria-label="Highlights detail intro"
        className="border-b border-[#d8d0c1] pb-12"
      >
        <div className="space-y-6 text-center lg:text-left">
          <p className="text-xs font-light uppercase tracking-[0.32em] text-[#8D7A70]">
            Highlights
          </p>
        </div>
      </section>

      <section
        aria-label="Highlights panel grid"
        className="grid flex-1 grid-cols-1 gap-4 border-b border-[#d8d0c1] py-12 sm:grid-cols-2 xl:grid-cols-3"
      >
        {highlightCategories.map((category) => (
          <div
            className="min-h-48 border border-[#d8d0c1] bg-[#ddd5c8] p-4"
            key={`highlight-panel-${category}`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#615754]">
              {category}
            </p>
          </div>
        ))}
      </section>

      <p className="mt-10 text-right text-sm font-medium text-[#615754]">
        {pageNumber}
      </p>
    </div>
  );
}

function CoreStatsDetailPane({ pageNumber }: { pageNumber: string }) {
  return (
    <div>
      <section
        aria-label="Core character statistics detail intro"
        className="border-b border-[#d8d0c1] pb-12"
      >
        <div className="space-y-6 text-center lg:text-left">
          <p className="text-xs font-light uppercase tracking-[0.32em] text-[#8D7A70]">
            Core Character Statistics
          </p>
        </div>
      </section>

      <section
        aria-label="Core character statistics sections"
        className="border-b border-[#d8d0c1] py-12"
      >
        <div className="divide-y divide-[#d8d0c1]">
          {coreStatSections.map((section) => (
            <div className="py-5" key={`core-stat-${section}`}>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#615754]">
                {section}
              </p>
              <div className="mt-4 space-y-3">
                <PlaceholderLine height="h-5" width="w-full max-w-3xl" />
                <PlaceholderLine height="h-5" width="w-[82%]" />
              </div>
            </div>
          ))}

          <div className="py-5">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#615754]">
              Achievements
            </p>
            <div className="mt-4 space-y-8">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-[#615754]">
                  Projects
                </p>
                <PlaceholderColumnSeries id="core-stats-projects" />
              </div>
            </div>
          </div>

          {planningSections.map((section) => (
            <div className="py-5" key={`core-planning-${section}`}>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#615754]">
                {section}
              </p>
              <div className="mt-4 space-y-3">
                <PlaceholderLine height="h-5" width="w-full max-w-3xl" />
                <PlaceholderLine height="h-5" width="w-[82%]" />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-right text-sm font-medium text-[#615754]">
          {pageNumber}
        </p>
      </section>
    </div>
  );
}

function OccupationTitlesDetailPane() {
  return (
    <div>
      <section
        aria-label="Occupation and titles detail"
        className="border-b border-[#d8d0c1] pb-12"
      >
        <div className="space-y-6 text-center lg:text-left">
          <p className="text-xs font-light uppercase tracking-[0.32em] text-[#8D7A70]">
            Occupation and Titles
          </p>
        </div>
      </section>

      <section
        aria-label="Titles detail list"
        className="border-b border-[#d8d0c1] py-12"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#615754]">
          Title
        </p>

        <div className="mt-8 divide-y divide-[#d8d0c1]">
          <div className="py-5">
            <p className="text-sm font-medium text-[#615754]">Engineering:</p>
            <div className="mt-4 space-y-3 text-base text-[#514a40]">
              <p>Physicist</p>
              <p>Mathematician</p>
              <p>Data Scientist</p>
              <p>Full Stack Developer</p>
              <p>Machine Learning Engineer</p>
              <p>Machine Learning Research Scientist</p>
            </div>
          </div>

          <div className="py-5">
            <p className="text-sm font-medium text-[#615754]">
              Entrepreneurship:
            </p>
            <div className="mt-4 space-y-3 text-base text-[#514a40]">
              <p>Founder</p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-right text-sm font-medium text-[#615754]">
          2
        </p>
      </section>
    </div>
  );
}

export function StatsBasePage() {
  const [activePage, setActivePage] =
    useState<PageId>("live-campaign-status");
  const [selectedStat, setSelectedStat] = useState<StatId>("aura");
  const categorizedDetailPage = categorizedDetailPages[activePage];

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#FEFCF1] text-[#191714]">
      <header className="flex min-h-16 items-center border-b border-[#d8d0c1] px-5 py-3 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl items-center">
          <Link
            className="text-xs font-semibold uppercase tracking-[0.32em] text-[#766b5d] transition hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FEFCF1]"
            href="/"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-0 flex-1 w-full max-w-7xl grid-cols-1 px-5 py-5 sm:px-8 lg:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)] lg:gap-10 lg:px-10">
        <DragScrollPane className="min-h-0 border-b border-[#d8d0c1] pb-8 text-center transition-all duration-300 lg:h-full lg:border-b-0 lg:border-r lg:py-10 lg:pr-10">
          <aside className="flex flex-col items-center">
            <div className="flex w-full flex-col items-center">
              <div className="flex w-full max-w-sm flex-col items-center gap-6">
                <LeftPaneButton
                  active={activePage === "live-campaign-status"}
                  className="p-0"
                  onClick={() => setActivePage("live-campaign-status")}
                >
                  <CampaignStatusSummary />
                </LeftPaneButton>

                <LeftPaneButton
                  active={activePage === "core-character-statistics"}
                  className="aspect-[1.62/1] overflow-hidden"
                  onClick={() => setActivePage("core-character-statistics")}
                >
                  <StatExplorer
                    onActivate={() => setActivePage("core-character-statistics")}
                    onSelectStat={setSelectedStat}
                    selectedStat={selectedStat}
                  />
                </LeftPaneButton>

                <LeftPaneButton
                  active={activePage === "identity-details"}
                  onClick={() => setActivePage("identity-details")}
                >
                  <div className="space-y-3 text-left text-base leading-7 text-[#514a40]">
                    <p>
                      <span className="font-medium text-[#191714]">Occupation:</span>{" "}
                      Adventurer
                    </p>
                    <p>
                      <span className="font-medium text-[#191714]">Titles:</span>{" "}
                      Machine Learning Scientist | Full Stack...
                    </p>
                  </div>
                </LeftPaneButton>

                <LeftPaneButton
                  active={activePage === "highlights"}
                  onClick={() => setActivePage("highlights")}
                >
                  <div className="mb-3 text-left">
                    <PlaceholderLabel>Highlights</PlaceholderLabel>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {highlightCategories.map((category) => (
                      <div
                        className="flex aspect-square items-center justify-center border border-[#d8d0c1] bg-[#ddd5c8] px-1 text-[0.55rem] font-medium uppercase tracking-[0.14em] text-[#615754]"
                        key={`highlights-preview-${category}`}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                </LeftPaneButton>

                <LeftPaneButton
                  active={activePage === "utility-rows"}
                  onClick={() => setActivePage("utility-rows")}
                >
                  <div className="flex w-full flex-col gap-4">
                    <PlaceholderFourBoxRow
                      values={["12 days", "Streak", "Sync Ratio", "80%"]}
                    />
                    <PlaceholderFourBoxRow
                      values={["12%", "Alignment", "Units", "$120.32"]}
                    />
                  </div>
                </LeftPaneButton>

                <div className="w-full border border-black p-2">
                  <div className="mb-2 text-left">
                    <PlaceholderLabel>Quests</PlaceholderLabel>
                  </div>
                  {achievementPages.map((page) => (
                    <LeftPaneButton
                      active={activePage === page.id}
                      className="border-0 p-1 first:pt-0 last:pb-0"
                      key={page.id}
                      onClick={() => setActivePage(page.id)}
                    >
                      <div className="flex w-full items-center gap-3">
                        <div className="h-8 w-8 shrink-0 rounded-full border border-[#d8d0c1] bg-[#ddd5c8]" />
                        <div className="flex flex-1 gap-3">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div
                              className="h-8 w-8 border border-[#d8d0c1] bg-[#ddd5c8]"
                              key={index}
                            />
                          ))}
                        </div>
                      </div>
                    </LeftPaneButton>
                  ))}
                </div>

                <div className="flex w-full flex-col gap-4">
                  <LeftPaneButton
                    active={activePage === "inventory"}
                    onClick={() => setActivePage("inventory")}
                  >
                    <div className="mb-3 text-left">
                      <PlaceholderLabel>Inventory</PlaceholderLabel>
                    </div>
                    <PlaceholderColumnSeries id="inventory" />
                  </LeftPaneButton>

                  <LeftPaneButton
                    active={activePage === "skills"}
                    onClick={() => setActivePage("skills")}
                  >
                    <div className="mb-3 text-left">
                      <PlaceholderLabel>Skills</PlaceholderLabel>
                    </div>
                    <PlaceholderColumnSeries id="skills" />
                  </LeftPaneButton>

                  <LeftPaneButton
                    active={activePage === "templates-placeholder"}
                    onClick={() => setActivePage("templates-placeholder")}
                  >
                    <div className="mb-3 text-left">
                      <PlaceholderLabel>Templates Placeholder</PlaceholderLabel>
                    </div>
                    <PlaceholderLine height="h-10" width="w-full" />
                  </LeftPaneButton>
                </div>
              </div>
            </div>
          </aside>
        </DragScrollPane>

        <DragScrollPane className="min-h-0 py-10 lg:h-full lg:py-10">
          {activePage === "live-campaign-status" ||
          activePage === "templates-placeholder" ? (
            <DefaultRightPane />
          ) : null}
          {activePage === "core-character-statistics" ? (
            <CoreStatsDetailPane
              pageNumber={pageNumbers["core-character-statistics"]}
            />
          ) : null}
          {activePage === "identity-details" ? <OccupationTitlesDetailPane /> : null}
          {activePage === "highlights" ? (
            <HighlightsDetailRightPane pageNumber={pageNumbers.highlights} />
          ) : null}
          {categorizedDetailPage ? (
            <CategorizedDetailRightPane
              categories={categorizedDetailPage.categories}
              pageNumber={pageNumbers[activePage]}
              title={categorizedDetailPage.title}
            />
          ) : null}
          {activePage !== "live-campaign-status" &&
          activePage !== "templates-placeholder" &&
          activePage !== "core-character-statistics" &&
          activePage !== "identity-details" &&
          activePage !== "highlights" &&
          !categorizedDetailPage ? (
            <DetailRightPane
              pageNumber={pageNumbers[activePage]}
              title={detailPageTitles[activePage]}
            />
          ) : null}
        </DragScrollPane>
      </section>
    </main>
  );
}

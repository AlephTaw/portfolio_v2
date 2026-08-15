"use client";

import { useState } from "react";
import { FiCheck, FiCpu, FiDatabase, FiGlobe, FiUploadCloud } from "react-icons/fi";
import type { IconType } from "react-icons";
import { SiPython } from "react-icons/si";

type Achievement = {
  Icon: IconType;
  label: string;
  requirement: string;
  topics: string[];
};

const achievements: Achievement[] = [
  {
    Icon: FiDatabase,
    label: "SQL",
    requirement:
      "Complete the SQL curriculum, demonstrate accurate query construction, and solve the section exercises without relying on solution code.",
    topics: ["SELECT and filtering", "Query exercises", "Grouping and aggregation"],
  },
  {
    Icon: SiPython,
    label: "Python",
    requirement:
      "Complete the Python Language curriculum and demonstrate fluency writing clear, typed, testable programs with the standard library.",
    topics: [
      "Values, names, and identity",
      "Expressions, truthiness, and built-ins",
      "Control flow and pattern matching",
      "Functions and parameter forms",
      "Containers, comprehensions, and unpacking",
      "Iteration and generators",
      "Exceptions and resource handling",
      "Classes and protocols",
      "Type hints and decorators",
      "Modules, packages, and environments",
      "Input, output, and structured data",
      "Standard-library tools",
    ],
  },
  {
    Icon: FiCpu,
    label: "Machine Learning",
    requirement:
      "Complete the Machine Learning curriculum and show that you can frame, validate, tune, and evaluate a model for a realistic problem.",
    topics: [
      "Problem framing, splits, and leakage",
      "Linear models and regularization",
      "Decision trees and ensembles",
      "Classification metrics and thresholds",
      "Preprocessing and feature pipelines",
      "Cross-validation and hyperparameter tuning",
      "Clustering and dimensionality reduction",
      "Production inference and monitoring",
    ],
  },
  {
    Icon: FiUploadCloud,
    label: "Deployments",
    requirement:
      "Complete the Docker and Docker Compose curriculum and ship a reproducible, tested service that can be operated safely in production.",
    topics: [
      "Images and containers",
      "The Docker CLI lifecycle",
      "Dockerfiles",
      "Builds, cache, tags, and registries",
      "Networking, ports, volumes, and environment",
      "Docker Compose fundamentals",
      "Compose development workflows",
      "Testing Docker containers",
      "Security and image quality",
      "Docker in production",
      "Troubleshooting and operations",
    ],
  },
];

const builds: Achievement[] = [
  {
    Icon: FiGlobe,
    label: "Portfolio",
    requirement:
      "Publish a polished body of work that demonstrates technical depth, clear communication, reproducibility, and thoughtful product decisions.",
    topics: [
      "Project framing and audience",
      "Data and methodology documentation",
      "Reproducible implementation",
      "Testing and quality assurance",
      "Deployment and operations",
      "Technical writing and presentation",
    ],
  },
];

const compactMobileRowSize = 4;
const compactRowSize = 8;

function CompactAchievementGrid({
  items,
  onSelect,
  selectedAchievement,
}: {
  items: Achievement[];
  onSelect: (achievement: Achievement) => void;
  selectedAchievement: Achievement | null;
}) {
  const emptySlotCount =
    (compactRowSize - (items.length % compactRowSize)) % compactRowSize;
  const mobileEmptySlotCount =
    (compactMobileRowSize - (items.length % compactMobileRowSize)) %
    compactMobileRowSize;

  return (
    <div className="mt-2 bg-background px-3 py-2">
      <div className="grid grid-cols-4 gap-x-2 gap-y-2 sm:grid-cols-8">
        {items.map((achievement) => {
          const { Icon, label } = achievement;
          const isSelected = selectedAchievement?.label === label;

          return (
            <button
              aria-expanded={isSelected}
              className="group flex min-w-0 flex-col items-center text-center focus:outline-none"
              key={label}
              onClick={() => onSelect(achievement)}
              type="button"
            >
              <span
                className={`flex size-12 items-center justify-center rounded-sm border transition-colors group-hover:border-[#686057] group-focus-visible:ring-2 group-focus-visible:ring-[#686057] group-focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-[#3f3f3f] bg-[#3f3f3f]"
                    : "border-[#d8d8d8] bg-background"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`size-5 ${isSelected ? "text-white" : "text-[#3f3f3f]"}`}
                />
              </span>
              <span className="mt-1 text-[0.5rem] leading-3 text-[#3f3f3f]">
                {label}
              </span>
            </button>
          );
        })}
        {Array.from({ length: emptySlotCount }, (_, index) => (
          <div
            aria-hidden="true"
            className={`${index < mobileEmptySlotCount ? "flex" : "hidden sm:flex"} min-w-0 justify-center`}
            key={`empty-${index}`}
          >
            <div className="size-12 rounded-sm border border-[#e5e5e5] bg-background" />
          </div>
        ))}
      </div>
      {selectedAchievement &&
      items.some(({ label }) => label === selectedAchievement.label) ? (
        <MasteryReceipt achievement={selectedAchievement} />
      ) : null}
    </div>
  );
}

function MasteryReceipt({ achievement }: { achievement: Achievement }) {
  const { Icon, label, requirement, topics } = achievement;

  return (
    <article
      aria-live="polite"
      className="relative mx-auto mt-5 max-w-lg overflow-hidden border border-[#cbc4b8] bg-[#fbfaf6] px-5 py-6 shadow-[0_12px_32px_rgba(54,47,39,0.08)] sm:px-8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-[repeating-linear-gradient(90deg,#8d8274_0,#8d8274_8px,transparent_8px,transparent_13px)] opacity-45"
      />
      <header className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#bdb4a7] bg-background shadow-sm">
          <Icon aria-hidden="true" className="size-7 text-[#3f3f3f]" />
        </div>
        <p className="mt-4 text-[0.5rem] font-semibold uppercase tracking-[0.34em] text-[#8a8176]">
          Achievement Details
        </p>
        <h2 className="mt-2 font-serif text-xl text-[#27231f]">
          {label} Mastery Receipt
        </h2>
      </header>

      <div className="my-5 border-t border-dashed border-[#c8c0b5]" />

      <section>
        <h3 className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#71685e]">
          Requirements to unlock {label} mastery
        </h3>
        <p className="mt-2 text-[0.72rem] leading-5 text-[#4a453f]">
          {requirement}
        </p>
      </section>

      <section className="mt-5">
        <h3 className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#71685e]">
          Major topics
        </h3>
        <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {topics.map((topic) => (
            <li
              className="flex items-start gap-2 text-[0.67rem] leading-4 text-[#4a453f]"
              key={topic}
            >
              <FiCheck
                aria-hidden="true"
                className="mt-0.5 size-3 shrink-0 text-[#70815e]"
              />
              <span>{topic}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 flex items-center justify-between gap-4 border-y border-dashed border-[#c8c0b5] py-3">
        <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#71685e]">
          Capstone requirement
        </span>
        <span className="text-right font-serif text-sm text-[#27231f]">
          {label} Capstone
        </span>
      </div>

      <p className="mt-4 text-center text-[0.48rem] uppercase tracking-[0.26em] text-[#9a9185]">
        Complete all requirements to unlock
      </p>
    </article>
  );
}

export function Achievements({ compact = false }: { compact?: boolean }) {
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  return (
    <div className="mt-9">
      <p className="w-full whitespace-nowrap text-left text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-[#6d6d6d] sm:text-[0.62rem] sm:tracking-[0.2em]">
        Achievements
      </p>
      <p className="mt-3 text-right text-[0.55rem] uppercase tracking-[0.28em] text-[#7f7f7f]">
        Authored Tutorials
      </p>
      {compact ? (
        <CompactAchievementGrid
          items={achievements}
          onSelect={setSelectedAchievement}
          selectedAchievement={selectedAchievement}
        />
      ) : (
        <div className="mt-3 flex flex-wrap justify-between gap-y-4 bg-background px-3 py-3">
          {achievements.map(({ Icon, label }) => (
            <div
              className="flex w-12 flex-col items-center text-center"
              key={label}
            >
              <div className="flex size-12 items-center justify-center rounded-md border border-[#d8d8d8] bg-background">
                <Icon aria-hidden="true" className="size-5 text-[#3f3f3f]" />
              </div>
              <p className="mt-3 text-[0.65rem] leading-4 text-[#3f3f3f]">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}
      <p className={`${compact ? "mt-3" : "mt-5"} text-right text-[0.55rem] uppercase tracking-[0.28em] text-[#7f7f7f]`}>
        Builds
      </p>
      {compact ? (
        <CompactAchievementGrid
          items={builds}
          onSelect={setSelectedAchievement}
          selectedAchievement={selectedAchievement}
        />
      ) : (
        <div className="mt-3 flex flex-wrap justify-between gap-y-4 bg-background px-3 py-3">
          {builds.map(({ Icon, label }) => (
            <div
              className="flex w-12 flex-col items-center text-center"
              key={label}
            >
              <div className="flex size-12 items-center justify-center rounded-md border border-[#d8d8d8] bg-background">
                <Icon aria-hidden="true" className="size-5 text-[#3f3f3f]" />
              </div>
              <p className="mt-3 text-[0.65rem] leading-4 text-[#3f3f3f]">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

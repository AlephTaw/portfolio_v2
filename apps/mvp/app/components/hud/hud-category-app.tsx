"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiEdit3 } from "react-icons/fi";

export type HudCategory =
  | "health"
  | "wealth"
  | "interactions"
  | "sentience"
  | "skills"
  | "experience";

type Metric = {
  label: string;
  value: string;
};

const questContexts = ["Mastery Path", "Level I: Essentials", "Unassigned"] as const;

const categoryMetrics: Record<HudCategory, Metric[]> = {
  health: [
    { label: "Health points", value: "0 HP" },
    { label: "Sleep", value: "0 / 7 H" },
    { label: "Recovery", value: "Not logged" },
  ],
  wealth: [
    { label: "Income actual", value: "$0" },
    { label: "Obligations", value: "$0" },
    { label: "Net", value: "$0" },
  ],
  interactions: [
    { label: "Interaction points", value: "0 KP" },
    { label: "Connections", value: "0" },
    { label: "Follow-ups", value: "0" },
  ],
  sentience: [
    { label: "Personality", value: "0 AP" },
    { label: "Perception", value: "0 PP" },
    { label: "Volition", value: "0 MP" },
  ],
  skills: [
    { label: "Skill points", value: "0 SP" },
    { label: "Active skills", value: "0" },
    { label: "Evidence", value: "0" },
  ],
  experience: [
    { label: "Experience", value: "0 XP" },
    { label: "Streak", value: "6 days" },
    { label: "Completed", value: "0" },
  ],
};

function Metrics({ metrics }: { metrics: Metric[] }) {
  return (
    <dl className="grid border-l border-t border-white/20 sm:grid-cols-3">
      {metrics.map((metric) => (
        <div className="border-b border-r border-white/20 p-5" key={metric.label}>
          <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/40">
            {metric.label}
          </dt>
          <dd className="mt-3 font-mono text-sm uppercase tracking-[0.08em] text-white">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ProgressRow({ label, value = 0 }: { label: string; value?: number }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_4rem] items-center gap-5 py-3">
      <span className="text-xs uppercase tracking-[0.16em] text-white/60">{label}</span>
      <span className="h-2 border border-white/35">
        <span className="block h-full bg-white" style={{ width: `${value}%` }} />
      </span>
    </li>
  );
}

function EmptyLog({ label }: { label: string }) {
  return (
    <section className="border border-dashed border-white/20 p-6">
      <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/45">
        Recent activity
      </h3>
      <p className="mt-8 text-sm text-white/35">No {label.toLowerCase()} records yet.</p>
    </section>
  );
}

export const minimumViableDay = [
  { category: "Fitness", items: ["10 toe touches", "10 pushups", "10 situps", "10 squats", "50 jumping jacks"] },
  { category: "Sleep", items: ["7 hours"] },
  { category: "Meal Prep", items: ["Oatmeal", "Rotisserie chicken", "Bread", "Grain", "Salad", "Water"] },
  {
    category: "Nutrition",
    items: ["Micros", "Macros", "Calories"],
    note: "One chicken breast, 4–5 cups fruits and veg, 64 oz water, oatmeal, protein shake",
  },
  { category: "Skin", items: ["Daily cleanser morning and night", "Sunscreen face & head (4 dots)"] },
  { category: "Mouth", items: ["Brush morning", "Floss morning", "Brush at night", "Floss at night", "Mouthwash at night"] },
  { category: "Hair", items: ["5 min whole-scalp warmup massage"] },
];

function HealthSummary() {
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const completionItem = (category: string, item: string) => {
    const itemId = `${category}:${item}`;
    return (
    <label key={item} className="mr-3 inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap last:mr-0">
      <input
        type="checkbox"
        checked={completedItems.includes(itemId)}
        onChange={(event) => {
          const checked = event.target.checked;
          setCompletedItems((items) => checked ? [...items, itemId] : items.filter((entry) => entry !== itemId));
        }}
        className="size-3.5 cursor-pointer accent-white"
      />
      <span className={completedItems.includes(itemId) ? "text-white" : undefined}>{item}</span>
    </label>
    );
  };

  return (
    <section aria-label="Health summary" className="mb-6 space-y-5">
      <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/45">Summary</h3>
      <div>
        <p className="text-xs text-white/60">HP / Total available</p>
        <p className="mt-2 font-mono text-2xl text-white">
          0 <span className="text-sm text-white/45">/ 100 HP</span>
        </p>
        <p className="mt-2 text-xs text-white/40">Placeholder health points</p>
      </div>
      <section aria-label="Minimum Viable Day" className="rounded-xl bg-white/[0.04] p-5">
        <h4 className="text-sm font-medium text-white">Minimum Viable Day (MVD)</h4>
        <dl className="mt-3 space-y-2 text-sm text-white/75">
          {minimumViableDay.map(({ category, items, note }) => (
            <div key={category}>
              <dt className="inline font-medium text-white">{category}: </dt>
              <dd className="inline">
                {items.map((item) => completionItem(category, item))}
                {note && <span className="text-white/45">({note})</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </section>
  );
}

function HealthApp() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="border border-white/20 p-5">
        <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/45">Daily protocol</h3>
        <ul className="mt-4 divide-y divide-white/15">
          <ProgressRow label="Sleep · 7 hours" />
          <ProgressRow label="Movement · 30 minutes" />
          <ProgressRow label="Meal preparation" />
        </ul>
      </section>
      <EmptyLog label="Health" />
    </div>
  );
}

function WealthApp() {
  return (
    <section className="overflow-hidden border border-white/20">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(5rem,0.4fr)_minmax(5rem,0.4fr)] border-b border-white/20 px-5 py-3 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/40">
        <span>Ledger</span><span className="text-right">Expected</span><span className="text-right">Actual</span>
      </div>
      {[
        ["Income", "$0", "$0"],
        ["Debts and obligations", "$0", "$0"],
      ].map(([label, expected, actual]) => (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(5rem,0.4fr)_minmax(5rem,0.4fr)] border-b border-white/10 px-5 py-4 text-xs uppercase tracking-[0.12em] last:border-b-0" key={label}>
          <span className="text-white/60">{label}</span><span className="text-right font-mono">{expected}</span><span className="text-right font-mono">{actual}</span>
        </div>
      ))}
    </section>
  );
}

function InteractionsApp() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <section className="border border-white/20 p-5">
        <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/45">Connection queue</h3>
        <p className="mt-10 text-sm text-white/35">No connections are waiting for follow-up.</p>
      </section>
      <EmptyLog label="Interaction" />
    </div>
  );
}

function SentienceApp() {
  return (
    <section className="border border-white/20 p-5">
      <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/45">Sentience vectors</h3>
      <ul className="mt-4 divide-y divide-white/15">
        <ProgressRow label="Personality" />
        <ProgressRow label="Perception" />
        <ProgressRow label="Volition" />
      </ul>
    </section>
  );
}

function SkillsApp() {
  return (
    <section className="border border-white/20">
      <header className="grid grid-cols-[minmax(0,1fr)_7rem_7rem] border-b border-white/20 px-5 py-3 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/40">
        <span>Skill register</span><span>Level</span><span>Evidence</span>
      </header>
      <p className="px-5 py-12 text-center text-sm text-white/35">No skills tracked.</p>
    </section>
  );
}

function ExperienceApp() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="border border-white/20 p-5">
        <div className="flex items-center justify-between gap-4 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/45">
          <h3>Level progress</h3><span className="font-mono">0 / 100 XP</span>
        </div>
        <div className="mt-5 h-3 border border-white/35" />
        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-white/35">Next level at 100 XP</p>
      </section>
      <EmptyLog label="Experience" />
    </div>
  );
}

const categoryApp = {
  health: HealthApp,
  wealth: WealthApp,
  interactions: InteractionsApp,
  sentience: SentienceApp,
  skills: SkillsApp,
  experience: ExperienceApp,
} satisfies Record<HudCategory, () => React.ReactNode>;

const categoryLabels: Record<HudCategory, string> = {
  health: "Health",
  wealth: "Wealth",
  interactions: "Interactions",
  sentience: "Sentience",
  skills: "Skills",
  experience: "Experience",
};

export function HudCategoryApp({ category, className = "mt-12" }: { category: HudCategory; className?: string }) {
  const AppContent = categoryApp[category];
  const categoryLabel = categoryLabels[category];
  const availableQuests: readonly string[] = category === "health" ? ["Minimum Viable Day (MVD)"] : questContexts;
  const [questContext, setQuestContext] = useState<string>(availableQuests[0]);
  const [questSelectorOpen, setQuestSelectorOpen] = useState(false);
  const questSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!questSelectorOpen) return;

    const closeSelector = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setQuestSelectorOpen(false);
        return;
      }
      if (!questSelectorRef.current?.contains(event.target as Node)) setQuestSelectorOpen(false);
    };

    window.addEventListener("pointerdown", closeSelector);
    window.addEventListener("keydown", closeSelector);
    return () => {
      window.removeEventListener("pointerdown", closeSelector);
      window.removeEventListener("keydown", closeSelector);
    };
  }, [questSelectorOpen]);

  return (
    <section aria-label={`${categoryLabel} System`} className={`${className} border-t border-white/30 pt-6`}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/35">H.U.D. application</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-white">{categoryLabel} System</h2>
            <div className="flex items-center gap-2">
              <span className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                Quest
              </span>
              <div className="relative" ref={questSelectorRef}>
                <button
                  aria-expanded={questSelectorOpen}
                  aria-haspopup="listbox"
                  className="cursor-pointer rounded-full bg-white/20 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-white/75 transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white"
                  onClick={() => setQuestSelectorOpen((open) => !open)}
                  type="button"
                >
                  {category === "health" ? availableQuests[0] : questContext}
                </button>
                {questSelectorOpen && (
                  <div
                    aria-label="Quest context"
                    className="absolute left-0 top-[calc(100%+0.5rem)] z-30 min-w-52 border border-white/35 bg-black p-1"
                    role="listbox"
                  >
                    {availableQuests.map((quest) => (
                      <button
                        aria-selected={(category === "health" ? availableQuests[0] : questContext) === quest}
                        className={`block w-full cursor-pointer px-3 py-2 text-left text-[0.6rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                          (category === "health" ? availableQuests[0] : questContext) === quest
                            ? "bg-white text-black"
                            : "text-white/60 hover:bg-white hover:text-black"
                        }`}
                        key={quest}
                        onClick={() => {
                          setQuestContext(quest);
                          setQuestSelectorOpen(false);
                        }}
                        role="option"
                        type="button"
                      >
                        {quest}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-white/35">Live summary</span>
          <Link
            aria-label={`Edit ${category} application in Workshop`}
            className="inline-flex cursor-pointer items-center gap-2 border border-white/35 px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/65 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white"
            href={`/world?domain=workshop&app=${category}`}
          >
            <FiEdit3 aria-hidden="true" className="size-3.5" />
            Edit
          </Link>
        </div>
      </header>
      {category === "health" && <HealthSummary />}
      <Metrics metrics={categoryMetrics[category]} />
      <div className="mt-5">
        <AppContent />
      </div>
    </section>
  );
}

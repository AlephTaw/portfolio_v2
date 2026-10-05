"use client";

import { useEffect, useRef, useState } from "react";
import { minimumViableDay, monthlyBills, connectionCriteria, sentienceCriteria, skillsCriteria, buildsCriteria, wealthCriteria, specialQuestCriteria, telemetryCriteria, firefightingActions } from "../mvd-protocol-data";
import { systemCallSequence } from "../mvd-protocols";

const lifeCategories = ["Health", "Wealth", "Connection", "Sentience", "Skills", "Experience", "Builds"] as const;
const pointCategories = [
  { category: "Health", unit: "Hp", name: "Health points", available: null },
  { category: "Wealth", unit: "Wp", name: "Wealth points", available: 1 },
  { category: "Connection", unit: "Ip", name: "Interaction points", available: 13 },
  { category: "Sentience", unit: "Mp", name: "Mana points", available: 6 },
  { category: "Skills", unit: "Sp", name: "Skill points", available: 2 },
  { category: "Experience", unit: "Xp", name: "Experience points", available: null },
  { category: "Builds", unit: "Bp", name: "Build points", available: 1 },
  { category: "Telemetry", unit: "Pp", name: "Perception points", available: 2 },
  { category: "Special Quests", unit: "Xp", name: "Special quest points", available: null },
];
const formatDollars = (amount: number) => `$${amount.toLocaleString("en-US")}`;
const totalMonthlyBills = monthlyBills.reduce((total, bill) => total + bill.amount, 0);
type WealthView = "profile" | "month" | "timeline";
const selectorStyle = "cursor-pointer rounded-full border border-white/25 bg-black px-3 py-1.5 text-xs text-white/80 outline-none hover:border-white/60 focus-visible:border-white";

function FocusStar() {
  return <span role="img" aria-label="Focus area">⭐</span>;
}

function WealthBillsDashboard() {
  const [view, setView] = useState<WealthView>("profile");
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const bills = monthlyBills.map((bill) => ({
    name: bill.name,
    amount: view === "profile" ? bill.amount : bill.overrides?.[month] ?? bill.amount,
  }));
  const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const monthLabel = new Date(`${month}-01T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <section aria-label="Wealth bills dashboard" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-white/80"><FocusStar /> Daily earning quota</span>
        <span className="font-mono text-white/45">Not set</span>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <select aria-label="Wealth view" className={selectorStyle} value={view} onChange={(event) => setView(event.target.value as WealthView)}>
          <option value="profile">Current expense profile</option>
          <option value="month">Month view</option>
          <option value="timeline">Timeline view</option>
        </select>
        {view !== "profile" && (
          <input aria-label="Expense month" type="month" value={month} className={`${selectorStyle} [color-scheme:dark]`} onChange={(event) => { if (event.target.value) setMonth(event.target.value); }} />
        )}
      </div>
      <h4 className="text-sm font-medium text-white/80">Bills dashboard</h4>
      {view !== "profile" && <p className="text-xs text-white/45">{monthLabel} · Expense profile with any monthly adjustments.</p>}
      {view === "timeline" ? (
        <div>
          <p className="mb-3 text-xs text-white/45">Due dates are needed to place bills chronologically. These bills are currently undated.</p>
          <ul className="space-y-3 border-l border-white/20 pl-4">
            {bills.map((bill) => (
              <li key={bill.name} className="relative flex flex-wrap justify-between gap-2 text-sm text-white/75">
                <span aria-hidden="true" className="absolute -left-[1.2rem] top-1.5 size-1.5 rounded-full bg-white/50" />
                <span>{bill.name} <span className="text-xs text-white/40">· Due date not set</span></span>
                <span className="font-mono tabular-nums">{formatDollars(bill.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <table className="w-full text-left text-sm text-white/75">
          <thead className="text-xs text-white/45">
            <tr><th scope="col" className="pb-2 font-normal">Monthly bill</th><th scope="col" className="px-3 pb-2 text-right font-normal">Amount</th><th scope="col" className="pb-2 text-right font-normal">Due date</th></tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.name}>
                <th scope="row" className="py-1 font-normal">{bill.name}</th>
                <td className="px-3 py-1 text-right font-mono tabular-nums">{formatDollars(bill.amount)}</td>
                <td className="py-1 text-right text-xs text-white/40">Not set</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="flex items-baseline justify-between gap-3 text-sm font-medium text-white">
        <span>{view === "profile" ? "Monthly total" : `${monthLabel} total`}</span>
        <span className="font-mono tabular-nums">{formatDollars(total)}</span>
      </p>
      {view !== "profile" && <p className="text-xs text-white/45">Usual monthly total: {formatDollars(totalMonthlyBills)}.</p>}
    </section>
  );
}


function PointChecklist({ label, items, onPointsChange, stageRisk = false }: { label: string; items: readonly { points: string; label: string }[]; onPointsChange?: (points: number) => void; stageRisk?: boolean }) {
  const [completed, setCompleted] = useState<string[]>([]);
  return (
    <ul aria-label={label} className="space-y-2">
      {items.map((item) => (
        <li key={item.label}>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 size-3.5 shrink-0 cursor-pointer accent-white"
              checked={completed.includes(item.label)}
              onChange={(event) => {
                const checked = event.target.checked;
                const next = checked ? [...completed, item.label] : completed.filter((entry) => entry !== item.label);
                setCompleted(next);
                onPointsChange?.(items.reduce((total, criterion) => next.includes(criterion.label) ? total + (Number(criterion.points.match(/\d+/)?.[0]) || 0) : total, 0));
              }}
            />
            <span>{stageRisk && <><span role="img" aria-label="Stage-failure risk">🔥</span> </>}<span className="text-white/85">{item.points}: </span>{item.label}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function SentienceMvd({ onPointsChange }: { onPointsChange: (points: number) => void }) {
  return (
    <div className="space-y-3">
      <p><span className="font-medium text-white/80">System Call Sequence: </span>{systemCallSequence.join(" → ")}.</p>
      <p>Use a calendar and time tracking.</p>
      <p>Check emails once in the morning, once at night, and as little as necessary in between.</p>
      <PointChecklist label="Sentience mana criteria" items={sentienceCriteria} onPointsChange={onPointsChange} />
      <h4 className="font-medium text-white/80">Special Quests</h4>
      <PointChecklist label="Special quest criteria" items={specialQuestCriteria} />
      <p className="text-xs text-white/40">Special Xp rewards are not configured yet.</p>
    </div>
  );
}

const progressionSteps = [
  "Food, shelter, clothing",
  "Income",
  "Surplus (time / money)",
  "Compounding action 1",
  "Compounding action 2",
  "Compounding action …",
] as const;

function LifeProgression() {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const boardRef = useRef<HTMLOListElement>(null);
  const [route, setRoute] = useState({ width: 0, height: 0, path: "" });

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const measure = () => {
      const bounds = board.getBoundingClientRect();
      const nodes = Array.from(board.querySelectorAll<HTMLButtonElement>("button")).map((button) => {
        const rect = button.getBoundingClientRect();
        return { x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2 };
      });
      const path = nodes.map((node, index) => {
        if (index === 0) return `M ${node.x} ${node.y}`;
        const previous = nodes[index - 1];
        if (Math.abs(previous.y - node.y) < 1) return `L ${node.x} ${node.y}`;
        const middle = (previous.y + node.y) / 2 + 16;
        return `H ${bounds.width - 2} V ${middle} H 2 V ${node.y} H ${node.x}`;
      }).join(" ");
      setRoute({ width: bounds.width, height: bounds.height, path });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-label="Life progression" className="mb-6">
      <h3 className="text-sm font-medium text-white">Progression</h3>
      <div className="relative mt-4">
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" viewBox={`0 0 ${route.width || 1} ${route.height || 1}`}>
        <path d={route.path} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4 5" strokeLinejoin="round" />
      </svg>
      <ol ref={boardRef} className="relative grid gap-x-6 gap-y-10 px-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 8rem), 1fr))" }}>
        {progressionSteps.map((step, index) => {
          const completed = completedSteps.includes(step);
          return (
            <li key={step} className="relative flex min-w-0 flex-col items-center text-center">
              <button
                type="button"
                aria-label={`${step}: ${completed ? "complete" : "incomplete"}. Toggle completion`}
                aria-pressed={completed}
                onClick={() => setCompletedSteps((steps) => completed ? steps.filter((entry) => entry !== step) : [...steps, step])}
                className={`relative flex size-10 rotate-45 cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white ${completed ? "border-white bg-white text-black" : "border-white/45 bg-black text-white/70 hover:border-white hover:text-white"}`}
              >
                <span className="-rotate-45 font-mono text-sm">{index + 1}</span>
              </button>
              <span className="mt-3 break-words text-sm text-white/75">{step}</span>
            </li>
          );
        })}
      </ol>
      </div>
    </section>
  );
}

export function QuestHud() {
  const [earnedPoints, setEarnedPoints] = useState<Record<string, number>>({});
  const updatePoints = (category: string, points: number) => setEarnedPoints((earned) => ({ ...earned, [category]: points }));

  return (
    <section aria-label="Quests HUD" className="border-t border-white/15 py-6 font-sans">
      <h1 className="mb-5 text-lg font-medium text-white">Act I: Crucible</h1>
      <LifeProgression />
      <h2 className="text-sm font-medium text-white">Summary · All categories</h2>
      <div className="mt-4">
        <p className="text-xs text-white/60">Earned XP / Available XP</p>
        <p className="mt-2 font-mono text-2xl text-white">0 <span className="text-sm text-white/45">/ — XP</span></p>
        <p className="mt-2 text-xs text-white/40">XP totals are not configured yet.</p>
      </div>
      <p className="mt-5 text-xs text-white/45">Today · Achieved / Available</p>
      <dl aria-label="Daily points by category" className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {pointCategories.map(({ category, unit, name, available }) => (
          <div key={category} title={name} className="flex flex-col rounded-lg bg-white/[0.04] p-3">
            <dd aria-label={`${earnedPoints[category] ?? 0} achieved out of ${available ?? "unconfigured"} available ${name} today`} className="order-first font-mono text-lg text-white">
              {`${earnedPoints[category] ?? 0} / ${available ?? "—"}`} <span className="text-xs text-white/45">{unit}</span>
            </dd>
            <dt className="mt-2 text-xs text-white/65">{category}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-white/40">— means the daily target or reward has not been configured.</p>
      <section aria-label="Firefighting" className="mt-5 rounded-xl bg-white/[0.04] p-5">
        <h3 className="mb-3 text-sm font-medium text-white">Firefighting</h3>
        <PointChecklist label="Firefighting actions" items={firefightingActions} stageRisk />
      </section>
      <section aria-label="All-category Minimum Viable Day" className="mt-5 rounded-xl bg-white/[0.04] p-5">
        <h3 className="text-sm font-medium text-white">Minimum Viable Day (MVD)</h3>
        <p className="mt-2 text-xs text-white/45">⭐ focus area · 🔥 stage-failure risk</p>
        <dl className="mt-4 space-y-4">
          {lifeCategories.map((category) => {
            return (
              <div key={category}>
                <dt className="flex items-center gap-2 text-sm font-medium text-white">
                  {category}
                </dt>
                <dd className="mt-1 text-sm text-white/60">
                  {category === "Health" ? (
                    <ul className="space-y-1">
                      {minimumViableDay.map(({ category: healthCategory, items, note }) => (
                        <li key={healthCategory}>
                          <span className="text-white/80">{["Sleep", "Meal Prep", "Nutrition"].includes(healthCategory) && <><FocusStar /> </>}{healthCategory}: </span>
                          {items.map((item, index) => (
                            <span key={item}>
                              {["Sleep", "Meal Prep", "Nutrition"].includes(healthCategory) && <><span role="img" aria-label="Stage-failure risk">🔥</span> </>}
                              {item}{index < items.length - 1 ? ", " : ""}
                            </span>
                          ))}{note && ` (${note})`}
                        </li>
                      ))}
                    </ul>
                  ) : category === "Wealth" ? (
                    <div className="space-y-4">
                      <WealthBillsDashboard />
                      <PointChecklist label="Wealth earning criteria" items={wealthCriteria} stageRisk onPointsChange={(points) => updatePoints("Wealth", points)} />
                      <dl className="space-y-2 text-xs">
                        {["Time until monthly solvency", "Time until long-term solvency"].map((label) => (
                          <div key={label} className="flex flex-wrap items-baseline justify-between gap-2">
                            <dt>{label}</dt>
                            <dd className="font-mono text-white/45">Not configured</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : category === "Connection" ? (
                    <PointChecklist label="Connection point criteria" items={connectionCriteria} onPointsChange={(points) => updatePoints("Connection", points)} />
                  ) : category === "Sentience" ? (
                    <SentienceMvd onPointsChange={(points) => updatePoints("Sentience", points)} />
                  ) : category === "Skills" ? (
                    <PointChecklist label="Skills point criteria" items={skillsCriteria} onPointsChange={(points) => updatePoints("Skills", points)} />
                  ) : category === "Builds" ? (
                    <div className="space-y-3">
                    <PointChecklist label="Builds point criteria" items={buildsCriteria} onPointsChange={(points) => updatePoints("Builds", points)} />
                    <section aria-label="Builds telemetry">
                      <h4 className="mb-2 font-medium text-white/80">Telemetry · Perception points (Pp)</h4>
                      <PointChecklist label="Telemetry point criteria" items={telemetryCriteria} onPointsChange={(points) => updatePoints("Telemetry", points)} />
                    </section>
                    </div>
                  ) : "MVD not configured yet."}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>
    </section>
  );
}

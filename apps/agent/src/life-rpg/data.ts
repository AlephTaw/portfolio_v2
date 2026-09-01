export const lifeCategories = [
  "health",
  "wealth",
  "connection",
  "sentience",
  "competence",
  "experience",
  "planning",
] as const;

export type LifeCategory = (typeof lifeCategories)[number];

export type QuestMilestone = {
  timestamp: string;
  dueDate: string;
  outcome: string;
};

export type LifeQuest = {
  id: string;
  level: number;
  name: string;
  purpose: string;
  tags: LifeCategory[];
  unlock: string;
  milestones: QuestMilestone[];
};

export type LifePlanActivity = {
  id: string;
  title: string;
  questId: string;
  tags: LifeCategory[];
  timestamp: string;
  description: string;
  measure: string;
  kpis: string[];
  completionCriterion: string;
};

const campaignDates = [
  ["Day 0 / Today", "2026-08-31"],
  ["Day 3", "2026-09-03"],
  ["Day 7 / Week 1", "2026-09-07"],
  ["Day 14 / Week 2", "2026-09-14"],
  ["Day 21 / Week 3", "2026-09-21"],
  ["Day 30 / Month 1", "2026-09-30"],
] as const;

const milestones = (outcomes: string[]): QuestMilestone[] =>
  outcomes.map((outcome, index) => ({
    timestamp: campaignDates[index][0],
    dueDate: campaignDates[index][1],
    outcome,
  }));

export const lifeQuests: LifeQuest[] = [
  {
    id: "map-territory",
    level: 0,
    name: "Map the Territory",
    purpose: "Establish an accurate starting state and weekly decision loop.",
    tags: ["planning", "wealth", "health", "sentience"],
    unlock: "Current reality is documented and priorities are ranked.",
    milestones: milestones([
      "Record cash, bills, health, work, skills, relationships, and obligations; choose three campaign outcomes.",
      "Reconcile every bill into amount, due date, priority, and status.",
      "Identify the largest current constraint from the first seven days of data.",
      "Complete a midpoint review and revise the plan using actual results.",
      "Remove, combine, or defer three low-value tasks.",
      "Write the one-page campaign review and next-level priorities.",
    ]),
  },
  {
    id: "secure-base",
    level: 1,
    name: "Secure the Base",
    purpose: "Protect food, housing, health, sleep, and immediate obligations.",
    tags: ["health", "wealth", "planning"],
    unlock: "No essential need is unknown or unmanaged for the next seven days.",
    milestones: milestones([
      "Confirm food, housing, transportation, medication, and the next urgent payment; set a seven-day spending limit.",
      "Pay or schedule the most urgent obligation and purchase only planned necessities.",
      "Maintain sleep, meals, movement, and one priority action on five of seven days.",
      "Have no missed essential payment and 14 days of basic routine data.",
      "Correct one recurring threat to stability.",
      "Finish the month with essential needs paid, scheduled, or covered by a documented plan.",
    ]),
  },
  {
    id: "control-treasury",
    level: 2,
    name: "Control the Treasury",
    purpose: "Create control over bills, spending, and short-term cash flow.",
    tags: ["wealth", "planning"],
    unlock: "Essential cash flow is visible and actively managed.",
    milestones: milestones([
      "Build a seven-day cash-flow plan with starting cash, income, essential spending, and balance.",
      "Calculate the daily earning target and hours required for the next major payment.",
      "Reconcile actual spending and adjust the next seven-day budget.",
      "Maintain a rolling two-week forecast and track every transaction.",
      "Reduce, pause, or renegotiate one recurring expense.",
      "Produce next month's survival budget and minimum income floor.",
    ]),
  },
  {
    id: "restore-income",
    level: 3,
    name: "Restore the Income Engine",
    purpose: "Secure or materially advance toward reliable income.",
    tags: ["wealth", "competence", "connection", "planning"],
    unlock: "Reliable income is secured or has a credible near-term path.",
    milestones: milestones([
      "Choose three role types, prepare one targeted résumé, and list five prospects.",
      "Submit three applications and contact two work-related people or organizations.",
      "Reach eight income-generating actions and investigate one short-term earning path.",
      "Reach 15–20 prospects and complete two mock interviews.",
      "Review response rates and revise the résumé and outreach strategy.",
      "Secure work or maintain at least 20 active prospects with a credible next stage.",
    ]),
  },
  {
    id: "forge-skill",
    level: 4,
    name: "Forge the Core Skill",
    purpose: "Build a marketable technical capability tied to earning power.",
    tags: ["competence", "wealth", "planning"],
    unlock: "At least one marketable skill is demonstrated through completed work.",
    milestones: milestones([
      "Select Python, SQL, data science, ML engineering, or MLOps and schedule a 60–90 minute block.",
      "Complete one lesson or notebook unit and five exercises.",
      "Complete three focused sessions and one small working artifact.",
      "Finish one portfolio-ready mini-project and two interview practice sessions.",
      "Add the artifact to the résumé or portfolio and rank two skill gaps.",
      "Complete and document one coherent technical project.",
    ]),
  },
  {
    id: "rebuild-body",
    level: 5,
    name: "Rebuild the Operating Body",
    purpose: "Make health and planning routines repeatable.",
    tags: ["health", "sentience", "planning"],
    unlock: "The body reliably supports work, learning, and connection.",
    milestones: milestones([
      "Set a sleep window, plan meals, move for 20 minutes, and record baseline health signals.",
      "Log health data for three days and complete three movement sessions.",
      "Meet the sleep window on five days and complete four movement sessions.",
      "Maintain the routine on 10 of 14 days and test one energy intervention.",
      "Keep the best routine and schedule one overdue health-maintenance action.",
      "Complete 20 movement sessions and maintain the routine on 80% of days.",
    ]),
  },
  {
    id: "reopen-world",
    level: 6,
    name: "Reopen the Social World",
    purpose: "Deliberately rebuild relationships and community.",
    tags: ["connection", "experience", "sentience"],
    unlock: "At least three active connections are being maintained.",
    milestones: milestones([
      "Identify three people to reconnect with and send one sincere message.",
      "Send two more messages and schedule one shared activity.",
      "Complete one meaningful interaction and identify one recurring community.",
      "Complete two meaningful interactions and follow up with one person or group.",
      "Attend one recurring social or community activity.",
      "Maintain three active connections and complete four social experiences.",
    ]),
  },
  {
    id: "first-crucible",
    level: 7,
    name: "Claim the First Crucible",
    purpose: "Create meaning through deliberate challenge and self-direction.",
    tags: ["sentience", "experience", "planning"],
    unlock: "One major personal challenge is completed and reviewed.",
    milestones: milestones([
      "Choose one avoided fear or obstacle and define a binary victory condition.",
      "Take the first uncomfortable action and record what happened.",
      "Complete the first phase and write an after-action review.",
      "Maintain an 80% synchronization ratio between planned and completed actions.",
      "Choose the next challenge using evidence from the first.",
      "Complete the challenge and document the lesson or new capability.",
    ]),
  },
];

export const lifePlanActivities: LifePlanActivity[] = lifeQuests.flatMap((quest) =>
  quest.milestones.map((milestone, index) => ({
    id: `${quest.id}-${index}`,
    title: milestone.outcome,
    questId: quest.id,
    tags: quest.tags,
    timestamp: milestone.timestamp,
    description: quest.purpose,
    measure: "Complete the stated outcome and record the result.",
    kpis: ["Completion status", "Adherence to deadline", "Observed result"],
    completionCriterion: milestone.outcome,
  })),
);

export function filterByCategory<T extends { tags: LifeCategory[] }>(items: T[], category: LifeCategory | "all") {
  return category === "all" ? items : items.filter((item) => item.tags.includes(category));
}

export function questForActivity(activityId: string) {
  const activity = lifePlanActivities.find((item) => item.id === activityId);
  return lifeQuests.find((quest) => quest.id === activity?.questId) ?? null;
}

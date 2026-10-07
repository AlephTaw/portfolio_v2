// Local starter protocols copied from mobile-mvp. No cross-app runtime imports.
export type MvdItem = { id?: string; label: string; points?: string };
export type MvdGroup = { id: string; category: string; title: string; items: readonly MvdItem[]; subcategory?: string; note?: string; focus?: boolean };
const items = (...labels: string[]): MvdItem[] => labels.map((label) => ({ label }));

export const mvdChecklist: readonly MvdGroup[] = [
  { id: "fitness", category: "Health", title: "Fitness", items: items("10 toe touches", "10 pushups", "10 situps", "10 squats", "50 jumping jacks") },
  { id: "sleep", category: "Health", title: "Sleep", items: items("7 hours"), focus: true },
  { id: "meal-prep", category: "Health", title: "Meal Prep", items: items("Oatmeal", "Rotisserie chicken", "Bread", "Grain", "Salad", "Water"), focus: true },
  { id: "nutrition", category: "Health", title: "Nutrition", items: items("Micros", "Macros", "Calories"), note: "One chicken breast, 4–5 cups fruits and veg, 64 oz water, oatmeal, protein shake", focus: true },
  { id: "skin", category: "Health", title: "Skin", items: items("Daily cleanser morning and night", "Sunscreen face & head (4 dots)") },
  { id: "mouth", category: "Health", title: "Mouth", items: items("Brush morning", "Floss morning", "Brush at night", "Floss at night", "Mouthwash at night") },
  { id: "hair", category: "Health", title: "Hair", items: items("5 min whole-scalp warmup massage") },
  { id: "earning", category: "Wealth", title: "Daily Earning Quota", items: [{ points: "1 Wp", label: "Complete the earning quota for the day" }], focus: true },
  { id: "solvency", category: "Wealth", title: "Debt Repayment", items: [{ points: "1 Wp", label: "Repay the debt balance" }] },
  { id: "monthly-expenses", category: "Wealth", title: "Cover Monthly Expenses", items: [{ points: "1 Wp", label: "Cover all expenses for the month" }] },
  { id: "connection", category: "Connection", title: "Minimum daily connection", items: [
    { id: "connection-3", points: "+10 bonus Ip", label: 'Connect to meet up for a marriage “toxin-style” date — intentionally interact in a non-selfish, outcome-motivated way, potentially to get to know the person better' },
    { id: "connection-kindness", points: "1 Ip", label: "Do one act of random kindness" },
  ] },
  { id: "100-new-friends-irl", category: "Connection", title: "100 new friends irl", items: [
    { id: "connection-0", points: "1 Ip", label: "One daily family check-in call" },
    { id: "connection-1", points: "+1 bonus Ip", label: "Talk with one person who is not a close friend or family member" },
    { id: "connection-2", points: "+1 bonus Ip", label: "Positive interaction with a stranger" },
    { id: "connection-kindness", points: "+1 bonus Ip", label: "Do one act of random kindness" },
  ] },
  { id: "system-call", category: "Sentience", title: "System call sequence", items: items("Nothing wrong with my life", "Think emotionally and notice three things", "Accept and embrace feelings", "Let go of feelings and thoughts (mindfulness)", "Address the matter of priority", "Run towards where possible") },
  { id: "sentience", category: "Sentience", title: "Daily practice", items: [
    { label: "Use a calendar and time tracking" },
    { label: "Check emails once in the morning, once at night, and as little as necessary in between" },
    { points: "1 Mp", label: "Maintain noting zone 2 for 10 minutes" },
    { points: "1 Mp", label: "Complete the system call sequence" },
    { points: "1 Mp", label: "Observability: track 80% or more of time" },
    { points: "1 Mp", label: "Feedback: share a daily field report in a call with family" },
    { points: "+1 bonus Mp", label: "Accountability: complete both observability and feedback requirements" },
    { points: "+1 bonus Mp", label: "Do something that sucks: cold shower, 1–5 minutes max HIIT heart rate, or activity until failure (pushups, jumping jacks, situps, squats, plank)" },
  ] },
  { id: "skills", category: "Skills", subcategory: "Software skills", title: "Skills", items: [
    { points: "1 Sp", label: "Complete 1 graduate math problem" },
    { points: "1 Sp", label: "Read 1 ML abstract" },
  ] },
  { id: "data-science", category: "Skills", subcategory: "Software skills", title: "Data Science", items: [] },
  { id: "algorithms", category: "Skills", subcategory: "Software skills", title: "Algorithms", items: [] },
  { id: "google-cloud", category: "Skills", subcategory: "Software skills", title: "Google Cloud", items: [] },
  { id: "react", category: "Skills", subcategory: "Software skills", title: "React", items: [] },
  { id: "fastapi", category: "Skills", subcategory: "Software skills", title: "FastAPI", items: [] },
  { id: "python", category: "Skills", subcategory: "Software skills", title: "Python", items: [] },
  { id: "typescript", category: "Skills", subcategory: "Software skills", title: "TypeScript", items: [] },
  { id: "ai-engineering", category: "Skills", subcategory: "Software skills", title: "AI Engineering", items: [] },
  { id: "sql", category: "Skills", subcategory: "Software skills", title: "SQL", items: [] },
  { id: "mobile-development", category: "Skills", subcategory: "Software skills", title: "Mobile Development", items: [] },
  { id: "meal-prep-behavior", category: "Skills", subcategory: "Health", title: "Meal Prep Behavior", items: [] },
  { id: "fitness-behavior", category: "Skills", subcategory: "Health", title: "Fitness Behavior", items: [] },
  { id: "sleep-behavior", category: "Skills", subcategory: "Health", title: "Sleep Behavior", items: [] },
  { id: "fabio-behavior", category: "Skills", subcategory: "Health", title: "Fabio Behavior", items: [] },
  { id: "baby-face-behavior", category: "Skills", subcategory: "Health", title: "Baby Face Behavior", items: [] },
  { id: "abstract-algebra", category: "Skills", subcategory: "Math", title: "Abstract Algebra", items: [] },
  { id: "real-analysis", category: "Skills", subcategory: "Math", title: "Real Analysis", items: [] },
  { id: "topology", category: "Skills", subcategory: "Math", title: "Topology", items: [] },
  { id: "probability", category: "Skills", subcategory: "Math", title: "Probability", items: [] },
  { id: "experience", category: "Experience", title: "Special quests", items: [
    { points: "Special Xp", label: "Schedule or do one thing you enjoy" },
    { points: "Special Xp", label: "Confront one fear" },
  ], note: "Special XP rewards are not configured yet." },
  { id: "telemetry", category: "Experience", title: "Telemetry", items: [
    { points: "1 Pp", label: "Time tracking throughout the day" },
    { points: "1 Pp", label: "Mental zone (1–5) tracking throughout the day" },
  ] },
  { id: "builds", category: "Builds", title: "Daily feature", items: [{ points: "1 Bp", label: "Build one feature per day" }] },
];

export const mvdItemId = (group: MvdGroup, index: number) => group.items[index].id ?? `${group.id}-${index}`;

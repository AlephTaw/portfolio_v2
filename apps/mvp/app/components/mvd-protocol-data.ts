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

export const monthlyBills = [
  { name: "Rent", amount: 1600 },
  { name: "Phone", amount: 100 },
  { name: "Utilities", amount: 200 },
  { name: "Internet", amount: 80 },
  { name: "Vehicle", amount: 650 },
  { name: "Taxes", amount: 60 },
  { name: "Student loans", amount: 150 },
  { name: "Groceries", amount: 400 },
  { name: "Credit card", amount: 1500, overrides: { "2026-09": 450 } as Record<string, number> },
];
export const connectionCriteria = [
  { points: "1 Ip", label: "One daily family check-in call" },
  { points: "+1 bonus Ip", label: "Talk with one person who is not a close friend or family member" },
  { points: "+1 bonus Ip", label: "Positive interaction with a stranger" },
  { points: "+10 bonus Ip", label: 'Connect to meet up for a marriage “toxin-style” date — intentionally interact in a non-selfish, outcome-motivated way, potentially to get to know the person better' },
];
export const sentienceCriteria = [
  { points: "1 Mp", label: "Maintain noting zone 2 for 10 minutes" },
  { points: "1 Mp", label: "Complete the system call sequence" },
  { points: "1 Mp", label: "Observability: track 80% or more of time" },
  { points: "1 Mp", label: "Feedback: share a daily field report in a call with family" },
  { points: "+1 bonus Mp", label: "Accountability: complete both observability and feedback requirements" },
  { points: "+1 bonus Mp", label: "Do something that sucks: cold shower, 1–5 minutes max HIIT heart rate, or activity until failure (pushups, jumping jacks, situps, squats, plank)" },
];
export const skillsCriteria = [
  { points: "1 Sp", label: "Complete 1 graduate math problem" },
  { points: "1 Sp", label: "Read 1 ML abstract" },
];
export const buildsCriteria = [
  { points: "1 Bp", label: "Build one feature per day" },
];
export const wealthCriteria = [
  { points: "1 Wp", label: "Complete the earning quota for the day" },
];
export const specialQuestCriteria = [
  { points: "Special Xp", label: "Schedule or do one thing you enjoy" },
  { points: "Special Xp", label: "Confront one fear" },
];
export const telemetryCriteria = [
  { points: "1 Pp", label: "Time tracking throughout the day" },
  { points: "1 Pp", label: "Mental zone (1–5) tracking throughout the day" },
];
export const firefightingActions = [{ points: "Action", label: "Re-establish solvency" }];

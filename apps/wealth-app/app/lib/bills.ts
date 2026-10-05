// Planning facts from the daily-calculations chat. Used as the default editable plan.
// null dates are unknown; they must not be treated as confirmed month-end deadlines.
export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string | null;
  deadlineConfirmed: boolean;
  note?: string;
};
export const planningPeriod = {
  start: "2026-10-05", end: "2026-10-31", hourlyRate: 25, currency: "USD",
} as const;
export const initialBills: Bill[] = [
  { id: "rent-first", name: "Rent — first portion", amount: 700, dueDate: "2026-10-10", deadlineConfirmed: true, note: "Before 5 p.m." },
  { id: "rent-balance", name: "Rent — balance", amount: 900, dueDate: null, deadlineConfirmed: false },
  { id: "phone", name: "Phone", amount: 100, dueDate: null, deadlineConfirmed: false },
  { id: "utilities", name: "Utilities", amount: 450, dueDate: "2026-10-15", deadlineConfirmed: true, note: "$200 regular + $250 catch-up." },
  { id: "internet", name: "Internet", amount: 150, dueDate: "2026-10-10", deadlineConfirmed: true, note: "$80 regular + $70 extra." },
  { id: "vehicle-catchup", name: "Vehicle — catch-up", amount: 650, dueDate: "2026-10-15", deadlineConfirmed: true },
  { id: "vehicle-regular", name: "Vehicle — regular", amount: 650, dueDate: "2026-10-30", deadlineConfirmed: true },
  { id: "insurance", name: "Car insurance", amount: 460, dueDate: "2026-10-12", deadlineConfirmed: true },
  { id: "taxes", name: "Regular taxes", amount: 60, dueDate: null, deadlineConfirmed: false },
  { id: "tax-extra", name: "Additional tax payment", amount: 70, dueDate: null, deadlineConfirmed: false },
  { id: "student-loans", name: "Student loans", amount: 150, dueDate: "2026-10-10", deadlineConfirmed: true },
  { id: "groceries", name: "Groceries", amount: 400, dueDate: null, deadlineConfirmed: false, note: "Fund throughout the month." },
  { id: "credit-card", name: "Credit card", amount: 1700, dueDate: "2026-10-30", deadlineConfirmed: false },
  { id: "oil", name: "Oil change", amount: 70, dueDate: "2026-10-13", deadlineConfirmed: true },
  { id: "wipers", name: "Windshield wipers", amount: 30, dueDate: "2026-10-05", deadlineConfirmed: true },
  { id: "socks", name: "Socks", amount: 35, dueDate: "2026-10-05", deadlineConfirmed: true },
];

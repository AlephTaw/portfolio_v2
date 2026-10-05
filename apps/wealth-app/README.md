# Wealth

Single-page mobile-first financial planner in slot 1 of a terminal shell. Derived from mobile-mvp, preserving React 19, Next 16, Vinext/Vite, Tailwind 4, TypeScript and ESLint versions. The independent generic copy is apps/boilerplate.

## Run

```sh
pnpm --filter @stevenwilcox/wealth-app dev
pnpm --filter @stevenwilcox/wealth-app typecheck
pnpm --filter @stevenwilcox/wealth-app lint
pnpm --filter @stevenwilcox/wealth-app test
pnpm --filter @stevenwilcox/wealth-app build
```

Live preview: http://localhost:3008. HMR and LAN access are enabled; port 3008 is strict.

## UI and state

The single route / opens the terminal and ...next action composer. The bottom navigation selects Wealth, Health, Skills, Sentience, or Connections and immediately focuses the category's prompt. Wealth retains the editable financial planner; the other categories provide session-action workspaces for future features. Each category keeps its own draft and action history across navigation; those clear on refresh and do not modify financial facts. The center category is Skills with a yellow lightning bolt.

Every category has a bottom composer. Enter/Return submits an action, Shift+Enter inserts a newline, and IME composition is protected. The microphone uses mobile-mvp's grey circular styling; it is a disabled visual placeholder until voice input is connected. There is no submit button.

Wealth has Analysis, Bills & extras, and Income & dates tabs. Add, edit or remove expenses and incidental income. Edit dates, confirmation status, paid status, notes, earning rate, planned daily earnings, starting cash and the planning period. Edits immediately recalculate and save to localStorage key wealth-plan-v1 on this browser. Browser storage is local, not cloud backup; a status message reports storage failures.

## Analysis rules

- Start/end dates must be within one month; every calendar day in that range is an earning day.
- Hourly earnings are funds available after driving costs and deductions.
- Dated unpaid expenses are funded on the preceding day, except start-day and overdue expenses funded on the start date.
- Unknown-date expenses are reserved evenly across the period, with month-end a provisional funding target.
- Unconfirmed dates are used provisionally and clearly marked.
- Paid/excluded entries and entries after the period end are excluded.
- Dated incidental income is available on its date; prior income is included at the start. Already-received income included in starting cash should be marked accounted for to avoid double counting.
- Each funding window requires a constant daily earning target sufficient for every prefix of that window. Starting cash, carryover and timely incidental income reduce required driving. Late income cannot pay earlier obligations.
- Planned daily earnings are compared to requirements; they are not counted a second time as incidental income.
- Calendar targets are rounded to dollars; selecting a day shows exact dollars, hours, bills and notes. Green/red compares to the period's average required earnings; equal days are neutral.
- Targets above 24 driving hours/day are flagged as infeasible. No early-saving optimization is implied.
- Money inputs are rounded to cents for calculations; per-day division uses full precision.

## Structure

app/components/actions retains layouts, terminal, composer, history and navigation. app/components/wealth owns planner UI and saved state. app/lib/planner.ts is the pure analysis pipeline; app/lib/bills.ts seeds the editable plan. tests cover timing, sums, exclusions, cash and validation.

Default October expenses: $6,575. Student loans $150 on Oct 10; vehicle $650 on Oct 15 and Oct 30; credit card Oct 30 remains unconfirmed. Totals are 263 hours, $243.52/day and 9.74 hours/day over Oct 5–31.

Manifest and safe-area foundations remain; offline caching and full PWA installation are not implemented.

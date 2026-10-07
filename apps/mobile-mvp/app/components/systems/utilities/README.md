# Systems utilities

Category-specific components and small apps live here, separate from actions-page navigation, layout, and terminal history.

- `health/`: health utilities.
- `wealth/`: financial utilities.
- `connection/`: relationship utilities (displayed as Connections).
- `sentience/`: reflection and cognition utilities.
- `skills/`: learning and practice utilities.
- `journey/`: progression and planning utilities.

`category-app-view.tsx` dispatches to a named app in each category directory. These apps use the implementations imported from wealth-app: shared checklist/progress screens, Wealth's editable financial planner, Connections' photo grid, and Journey's objective queue and gameplay timeline. Supporting calculations and scoped styles live here; there are no cross-app runtime imports.

Checklist completion uses the Watcher. Wealth and Journey plans persist under mobile-mvp-specific browser storage keys. Photos are session previews. Submitting the terminal prompt with Journey selected adds an objective to its queue.

Keep category UI and domain logic in their category directory. Feed activation and minimization remain owned by the shared Watcher session, not utility components.

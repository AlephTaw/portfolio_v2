# Systems utilities

Category-specific components and small apps live here, separate from actions-page navigation, layout, and terminal history.

- `health/`: health utilities.
- `wealth/`: financial utilities.
- `connection/`: relationship utilities (displayed as Connections).
- `sentience/`: reflection and cognition utilities.
- `skills/`: learning and practice utilities.
- `journey/`: progression and planning utilities.

`category-app-view.tsx` is the shared feed entry point. The first five categories currently reuse the existing dashboard; Journey has an empty entry surface awaiting its utilities. This directory does not import implementations from sibling apps.

Keep category UI and domain logic in their category directory. Feed activation and minimization remain owned by the shared Watcher session, not utility components.

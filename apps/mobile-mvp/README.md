# Mobile MVP

An independent, stripped-down mobile-first Speedrun IRL app. Main pages are `/` (landing), `/bootloader`, and `/actions`. Build, Inventory, Chat, and HUD are components hosted within Actions, not independently navigated pages. Old `/build`, `/inventory`, and `/chat` URLs are thin compatibility redirects into Actions. No full-MVP providers, authentication, quest systems, or APIs are imported. The root `Watcher` owns in-memory session state across route changes: active views, activity history, inventory additions, and per-view split sizes. Reloading starts a new session; no backend or durable persistence is implied. The composer remains an editable draft, not a command executor.

## Component structure

Route `page.tsx` files compose page content and handle metadata or route inputs. Keep feature UI in `app/components`, not in route files.

Actions components live in `app/components/actions/`:

- `actions-workspace.tsx`: renders Watcher state and measures timeline marker geometry.
- `activity-session.ts`: pure history/minimize/restore transitions; visor state is independent of the shared activity window state.
- `history/`: scrollable running log and phone-shaped, restorable view previews.
- `workspace-state.ts`: typed, pure navigation transitions (tested in `tests/`). One tap on an inactive icon opens its view; one tap on the active icon closes it; a different icon directly switches views. There are no double-click handlers or timing thresholds. Closed-visor Chat opens at its remembered partial height (initially 50% of the content area); other closed-visor panels open full-screen. Open-visor panels open at one-third of the viewport height. Manual resizing remains available through the shared rail dot.
- `views/`: independent Build, Inventory, Chat, HUD, and Admin content; no route or dock ownership. Admin adapts the rendered MVP Profile, Appearance, Integrations, and Logout sections, with mobile-owned components and no runtime imports from the sibling app. Profile saves and glass-panel theme changes are session-only; integration services remain clearly marked as coming soon and Logout returns to landing (no authentication backend).
- `layouts/`: `PrimaryColumn` centers the complete timeline + 24px gutter + content group. Its grid row is explicitly constrained with `minmax(0, 1fr)`. `SecondaryColumn` has separate `content` and `navigation` slots and rows (`minmax(0, 1fr) auto`), so content scrolls without pushing navigation out of the viewport. Both grid items have `min-height: 0`. The secondary column (maximum width 604.8px) anchors its right rail. `FullView` hosts the full-height activity log; `ActivityOverlay` independently positions a resizable window above it without dividing or resizing the log. The retired split-screen wrapper has been removed.
- `navigation/`: separate `BottomNavigation`, `RightSideRail`, and `TimelineRail` components. The timeline occupies the primary layout's left edge, outside scrolling panes. The outer margins on its left and the content's right are equal; both grow equally after the group reaches its maximum width.
- A deliberate right swipe anywhere in Actions (including floating views and outer gutters) reveals and pins the timeline until a left swipe hides it. Native touch swipes, mouse/pen drags, and horizontal trackpad wheel gestures are supported. Vertical scrolling, multi-touch zoom, text editing, and resize-dot gestures are excluded. Unpinned hover/focus reveals retain the original idle-fade behavior. The right rail contains only the reserved resize-dot slot and visor, in 48px slots with an 8px gap. The cog at the bottom of the visible timeline aligns vertically with the visor and opens/closes the Settings menu.
- When Build is active, the right rail additionally shows the Game design controller with opposing circular iteration arrows above the resize dot, replacing the former profile-header controller/pencil graphic. Both right-rail controls have translucent grey circular backgrounds independent of timeline visibility. The timeline-anchored resize dot stays bare, without a background. Pressing Game design opens the dashboard within Build and changes the control to a comic-panels return icon. Pressing again restores the existing panels. Watcher retains this subview across visor and navigation changes; history thumbnails remain panels previews.
- Game Design reuses Build's single glass surface and profile summary. It contains the original MVSOS diagram, four sample system-health readings, five category progress/checklist disclosures, expandable three-column hex achievement grids with requirement details, the pending queue, earned points, and Storyboard/Outline. Authorship uses the same storyboard component with a full-width scene editor, a 700-character script, and local narration. Checklist and story edits share Watcher session state with Field Report. Health readings, levels, and unassigned reward values remain explicitly provisional/demo data.
- Configuration captures the active component when opened. Its options open Component, Harness, or the bottom-docked Profile Admin. Component supports a custom display name and adding, editing, hiding, or removing protocol systems rendered within that component. Configuration is session-only; custom protocols do not replace built-in features or execute actions. Harness is currently a reserved surface for future runtime tools. Profile Admin retains the existing account settings. It is distinct from `/bootloader`, which retains the game introduction, build/mode selection, and bilateral-upload prompt.
- `ActivityOverlay` owns window sizing and corner styling. With the timeline hidden, windows span the viewport below their 629.8px maximum width and remain centered above that cap in either visor mode. A revealed timeline reserves its existing gutter and narrows the windows accordingly. Full-height visor-down windows extend through the shell's top gutter to viewport y=0, retaining notch-safe content padding. Rounded windows become square at full height when the timeline is hidden, then recover their 24px top corners immediately when resized smaller or when the timeline is revealed. Content views do not impose a conflicting outer radius.
- `profile/`: reusable, prop-driven profile summary.
- `action-composer.tsx`: command draft editor, separate from navigation. In the terminal, Enter submits a non-empty command as a typed timeline history entry, clears the input, and retains focus; Shift+Enter inserts a newline and IME composition is not submitted accidentally. Terminal typography matches the event log. Submissions explicitly display an execution preview because no backend command runner is connected; no arbitrary shell command is run. Field-report draft inputs retain their separate editing behavior.
- The terminal log and input stay mounted once: `ActivityOverlay` changes presentation between hidden, full-screen, and glass window layouts without replacing its children. `ActionComposer` owns the terminal draft locally; hiding its input or changing visor modes does not copy state, reset selection, or create a second input instance. The helmet restores input focus synchronously when a prompt is active.
- Terminal history and its timeline markers/counter appear only after the visor-down sliding surface has finished closing. `ActionsBackground` observes the actual CSS transition through `getAnimations().finished`, with cancellation for reversed toggles and immediate settlement when reduced motion disables animation. History stays mounted but hidden/inert during the transition; logging, the prompt draft, and nav controls remain uninterrupted.
- `field-report/`: complete mobile-owned MVP MVD checklist data, completion UI, and receipt attachments. The Current Activity dock icon opens `FieldReportView` through the shared overlay, initially scrolled to Next Action. Checklist completion, the report draft, and attached receipt files survive window minimize/restore and visor toggles in Watcher session state. Files are selected/dropped locally; no upload backend or durable storage is implied. Checklist tests compare the copied content against the MVP source to catch omissions.
- `views/terminal-view.tsx`: the visor-open Terminal mini-window reuses the activity log, composer, and shared glass overlay at 30% viewport height. The center button is always a plus: with the visor closed it returns to/focuses the persistent terminal prompt, while with the visor open it reveals this window without closing the visor (another tap dismisses it). Both paths focus the prompt synchronously for mobile keyboard activation. The visor-down prompt is fixed beside the visor, initially matching its 36px image height and bottom edge, with an 8px gap. It wraps/grows upward up to 40dvh, then scrolls internally; history reserves clearance independently. The thin microphone sits in a light-grey circle at bottom right and is currently visual-only. Drafts survive switching views. The rail dot resizes the visor-open mini-window; a left swipe dismisses it without discarding the draft.
- `actions-background.tsx`: independent gradient/planet layers; the visor moves the gradient up or down without moving the layout.
- `design-system/`: shared adaptive window tint and the Harness summary. A 32×32 canvas samples mean linear luminance from the local desert background asset behind the visible window, accounting for its cover crop and viewport position. Resize/scroll measurements run in animation frames, not inside ResizeObserver callbacks. Above the configurable threshold, a neutral tint eases in to the configured maximum with gentle desaturation; dark mode dims bright regions, light mode lifts dark regions. Dark closed-visor backgrounds receive no dark tint. Harness → Design system owns color mode, tint enable/strength/threshold, reset, and a compact summary of shared rules. These settings are session-only; no screen capture or user media sampling is used.

Landing animation and bootloader introduction remain separate components composed by their own route pages. No dependency on the sibling MVP app.

`app/components/watcher/` wraps the entire app. UI actions dispatch explicit events rather than scraping global clicks. Opening/closing interfaces, composer engagement, inventory additions, and route changes are logged. Resizing is not treated as a new activity. Swiping either active gold dot left archives the pane; vertical dragging resizes it. Past views remain above the current activity as thumbnails, with aligned timeline dots and a minimized-view count at the top.

Keep navigation state out of content views and layout wrappers. Add future HUD content to `HudView`; do not duplicate the page shell or navigation there. Preserve the centered column and safe-area layout in the workspace shell.

Only the helmet toggle changes `visorOpen`. Build/Inventory/Chat use the same `ActivityOverlay`, sizing state, rail-dot resize control, glass material, and toggle/switch/minimize/restore transitions. There is no visor-specific window selection or alternate dialog wrapper. New windows use visor-specific launch sizes; toggling the visor while a window is already active preserves that window's size and content. With the visor closed, the window floats above an uninterrupted, independently scrolling activity log. Opening and resizing a window do not reset log scroll; new entries follow the bottom only when the user is already there.

## Video authoring

In-app video uses portrait 9:16, preferably 1080 × 1920. Film vertically with the subject centered, or prepare the final portrait crop in an external editor before uploading. Export MP4 with H.264 video and AAC audio when audio is needed; preserve the source frame rate. Leave breathing room around the subject for interface overlays.

Experiences requiring multiple views should provide explicit filming instructions or an editing preset defining each shot, framing, and final composition. Do not introduce a general-purpose in-app video editor or automatic subject tracking for ordinary uploads.

The existing landscape landing clip uses one fixed focal point (27% from the left, 50% from the top). Its cover crop centers that point during resizing where image boundaries permit. This keeps the imported clip usable on phones without changing the source video or the landing tour's layout.

## Development

From the workspace root:

```sh
pnpm install
pnpm dev:mobile-mvp -- --port 3007
```

The server binds to all network interfaces for mobile LAN testing. Choose a free port; other apps are not stopped or replaced.

```sh
pnpm --filter @stevenwilcox/mobile-mvp typecheck
pnpm --filter @stevenwilcox/mobile-mvp test
pnpm lint:mobile-mvp
pnpm build:mobile-mvp
pnpm --filter @stevenwilcox/mobile-mvp start --port 3007
```

## PWA foundation

The manifest defines standalone display, home-screen icons, and `/actions` as the installed start URL. Layout includes safe-area support, an Apple touch icon, and viewport/theme metadata. A production-only service worker caches static branding and provides a dedicated offline fallback. It does not cache personalized pages, development bundles, or action data.

PWA installation and service workers require HTTPS (or localhost). Plain HTTP to a LAN IP supports UI testing, but not full PWA testing on a phone. Validate installation and offline behavior on an HTTPS deployment before shipping.

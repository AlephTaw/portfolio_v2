# Quest HUD — Game Design Notes

> Unofficial working notes for the Quest HUD prototype. This file is not the official game design document.

## Purpose

The Quest HUD is the cross-category daily control surface for **Act I: Crucible**. These notes capture the current prototype content and intended interaction model; they are not a final product specification.

It translates the player’s life systems into a compact game loop:

1. Establish the minimum conditions for progress.
2. Earn category-specific points by completing concrete actions.
3. Protect the current progression stage from failure risks.
4. Convert surplus time, money, attention, and capability into compounding actions.

The HUD is currently a front-end prototype. Completion state is local to the active view, and several totals are intentionally placeholders until persistence and reward configuration are added.

## HUD structure

The HUD is presented in this order:

1. **Act I: Crucible** title.
2. **Progression** track.
3. **Summary · All categories**.
4. **Firefighting** actions.
5. **Minimum Viable Day (MVD)** by life category.

The HUD uses a dark, compact, data-dense presentation. Checkboxes represent completion state. A checked item is counted in the current category’s achieved points.

## Progression track

The progression track is a horizontally wrapping sequence of clickable numbered nodes connected by a route line. Each node can be toggled complete.

| Step | Requirement |
| --- | --- |
| 1 | Food, shelter, clothing |
| 2 | Income |
| 3 | Surplus (time / money) |
| 4 | Compounding action 1 |
| 5 | Compounding action 2 |
| 6 | Compounding action … |

Completed nodes use the completed visual state. The route is intentionally open-ended after the first compounding actions so the system can support an expanding arc of productive behaviors.

## All-category summary

The summary begins with **Earned XP / Available XP**. The current prototype displays `0 / — XP` and notes that XP totals are not configured yet.

The daily point grid then displays **achieved / available** totals for each category. An em dash means that the daily target or reward has not been configured.

| Category | Unit | Meaning | Current daily availability |
| --- | --- | --- | ---: |
| Health | Hp | Health points | Not configured |
| Wealth | Wp | Wealth points | 1 |
| Connection | Ip | Interaction points | 13 |
| Sentience | Mp | Mana points | 6 |
| Skills | Sp | Skill points | 2 |
| Experience | Xp | Experience points | Not configured |
| Builds | Bp | Build points | 1 |
| Telemetry | Pp | Perception points | 2 |
| Special Quests | Xp | Special quest points | Not configured |

The current prototype initializes every achieved value to zero and updates the value when checklist items are checked.

## Focus and failure-risk notation

- `⭐` marks a focus area: an action that deserves extra attention in the current stage.
- `🔥` marks a stage-failure risk: missing the action can cause failure of the current progression stage.

The current stage-failure risks are nutrition-related actions, the earning quota, and the sleep quota.

## Firefighting

Firefighting is a separate recovery section for urgent actions that restore stage viability.

| Action | Reward / role |
| --- | --- |
| Re-establish solvency | Emergency action; marked as a stage-failure risk |

## Minimum Viable Day

The MVD is the smallest daily routine intended to preserve health and forward motion. Each listed action is individually checkable where the UI presents it as a checklist item.

### Health

#### Fitness

- `🔥` 10 toe touches
- `🔥` 10 pushups
- `🔥` 10 situps
- `🔥` 10 squats
- `🔥` 50 jumping jacks

#### Sleep

- `⭐ 🔥` 7 hours

#### Meal Prep

- `⭐ 🔥` Oatmeal
- `⭐ 🔥` Rotisserie chicken
- `⭐ 🔥` Bread
- `⭐ 🔥` Grain
- `⭐ 🔥` Salad
- `⭐ 🔥` Water

#### Nutrition

- `⭐ 🔥` Micros
- `⭐ 🔥` Macros
- `⭐ 🔥` Calories
- Supporting target: one chicken breast, 4–5 cups of fruits and vegetables, 64 oz of water, oatmeal, and a protein shake.

#### Skin

- Daily cleanser morning and night
- Sunscreen on face and head — 4 dots

#### Mouth

- Brush in the morning
- Floss in the morning
- Brush at night
- Floss at night
- Mouthwash at night

#### Hair

- 5-minute whole-scalp warmup massage

### Wealth

#### Daily earning quota

- `⭐ 🔥` Complete the earning quota for the day.
- The quota amount is currently **not set**.

#### Bills dashboard

The bills dashboard supports three views:

- **Current expense profile** — default view.
- **Month view** — selects a month and applies that month’s adjustments.
- **Timeline view** — lists bills in chronological structure; due dates are currently not set.

Current recurring obligations:

| Bill | Usual monthly amount |
| --- | ---: |
| Rent | $1,600 |
| Phone | $100 |
| Utilities | $200 |
| Internet | $80 |
| Vehicle | $650 |
| Taxes | $60 |
| Student loans | $150 |
| Groceries | $400 |
| Credit card | $1,500 |
| **Usual monthly total** | **$4,740** |

For September 2026, the credit-card amount is overridden to **$450**, making the displayed month total **$3,690**. All bill due dates are currently shown as **Not set**.

The dashboard also reserves fields for:

- Time until monthly solvency — not configured.
- Time until long-term solvency — not configured.

### Connection

Connection points are earned through increasingly broad social contact:

- `1 Ip` — one daily family check-in call.
- `+1 bonus Ip` — talk with one person who is not a close friend or family member.
- `+1 bonus Ip` — have a positive interaction with a stranger.
- `+10 bonus Ip` — connect to meet up for a marriage “toxin-style” date: an intentional, non-selfish, outcome-motivated interaction that may help the player get to know the person better.

### Sentience

#### System Call Sequence

The sequence is:

1. Nothing wrong with my life.
2. Think emotionally and notice three things.
3. Accept and embrace feelings.
4. Let go of feelings and thoughts through mindfulness.
5. Address the matter of priority.
6. Run towards where possible.

Additional operating rules:

- Use a calendar and time tracking.
- Check email once in the morning and once at night, and as little as necessary in between.

#### Mana criteria

- `1 Mp` — maintain noting zone 2 for 10 minutes.
- `1 Mp` — complete the System Call Sequence.
- `1 Mp` — meet the observability requirement: track at least 80% of time.
- `1 Mp` — meet the feedback requirement: share a daily field report in a call with family.
- `+1 bonus Mp` — complete both observability and feedback requirements.
- `+1 bonus Mp` — do something that sucks: a cold shower, 1–5 minutes of max-HIIT heart rate, or an activity to failure such as pushups, jumping jacks, situps, squats, or plank.

#### Special quests

Special experience rewards are reserved for:

- Schedule or do one thing that brings enjoyment.
- Confront one fear.

The current prototype labels these rewards **Special Xp** and notes that the reward configuration is not yet complete.

### Skills

- `1 Sp` — complete one graduate-level math problem.
- `1 Sp` — read one ML abstract.

### Experience

The current MVD content is not configured yet. The broader Experience systems include enjoyment, exploration–exploitation, and telemetry.

### Builds

- `1 Bp` — build one feature per day.

#### Telemetry / Perception

Telemetry is currently displayed under Builds as a Perception-point subsection:

- `1 Pp` — time tracking throughout the day.
- `1 Pp` — mental-zone tracking throughout the day on a 1–5 scale.

### Quests

The current cross-category HUD does not render a separate Quests block in its MVD category list. The Quest systems page includes **Minimum Viable Day (MVD)** as the quest-level system.

## Category HUD applications

The category-specific HUD applications provide a more focused view when a life category is selected.

### Health System

Summary metrics:

- Health points: `0 HP`.
- Sleep: `0 / 7 H`.
- Recovery: `Not logged`.

Daily protocol:

- Sleep · 7 hours.
- Movement · 30 minutes.
- Meal preparation.

The Health app also includes an empty recent-activity log and the full checkable MVD list above.

### Wealth System

The wealth app contains a ledger with:

- Income — expected `$0`, actual `$0`.
- Debts and obligations — expected `$0`, actual `$0`.

### Interactions / Connection System

- Interaction points: `0 KP`.
- Connections: `0`.
- Follow-ups: `0`.
- Connection queue: no connections waiting for follow-up.
- Recent interaction log: empty.

### Sentience System

Sentience vectors:

- Personality — `0 AP`.
- Perception — `0 PP`.
- Volition — `0 MP`.

### Skills System

The skill register includes columns for:

- Skill.
- Level.
- Evidence.

The current register is empty.

### Experience System

- Experience: `0 XP`.
- Streak: `6 days`.
- Completed: `0`.
- Level progress: `0 / 100 XP`.
- Next level: `100 XP`.
- Recent experience log: empty.

## Open configuration work

The following values are intentionally placeholders in the current prototype:

- Total XP availability and earned XP persistence.
- Health daily target.
- Experience daily target.
- Daily earning quota amount.
- Bill due dates.
- Monthly and long-term solvency estimates.
- Special quest reward values.
- Experience MVD actions.
- Persistent completion history and cross-device synchronization.

## Design principles

- **Minimum viable first:** protect the conditions required to remain in the current stage before optimizing.
- **Concrete actions:** every reward should map to an observable behavior.
- **Cross-category balance:** progress is not only wealth or productivity; health, relationships, sentience, skills, experience, and builds all contribute.
- **Focus is contextual:** stars identify what matters most now, while fire marks genuine stage-failure risk.
- **Compounding after surplus:** once food, shelter, clothing, income, and surplus are stable, the system expands into compounding actions.

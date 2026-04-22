# CYBER GYM OS — Claude Code Instructions

## Project Overview
Local-network home gym dashboard built with React + Vite frontend and an Express backend. Runs on a home server (Raspberry Pi or similar), accessed via touchscreen/TV in the gym. Single user, no auth.

## Tech Stack
- **Frontend:** React 18, Vite, styling via inline JS objects + a small injected `<style>` block for layout classes and media queries
- **Backend:** Express (ESM), Node.js
- **Storage:** Flat JSON files in `data/` — one file per key, written atomically via `/api/storage/:key`
- **AI:** Anthropic Claude API proxied through `/api/chat` — API key lives server-side only, never touches the frontend
- **Music:** YouTube IFrame API loaded at runtime, no npm package

## Project Structure
```
HomeGymDashboard/
├── src/
│   ├── ForgeGym.jsx      — entire frontend, single file (~960 lines). Filename kept from the pre-rebrand project; component is default-exported as ForgeGym
│   └── main.jsx          — React entry point
├── server/
│   └── index.js          — Express server (storage API + Anthropic proxy + static serving)
├── public/               — served at web root by Vite
│   ├── CyberGym-icon.png — square emblem (favicon + header logo + Ubuntu launcher icon)
│   ├── CyberGym-logo.png — full "Cyber Gym" logotype with emblem
│   └── exercises/        — form diagram images keyed by exerciseId (gif/jpg/png); ExerciseImage auto-hides if file missing
├── data/                 — auto-created, gitignored — forge-history.json, forge-last-weights.json, forge-prs.json, forge-templates.json, forge-bodyweight.json, forge-weekly-summary-date.json (storage keys keep the "forge-" prefix from the pre-rebrand project to preserve saved data)
├── .env                  — ANTHROPIC_API_KEY=sk-... (already configured, do not touch)
├── forge.sh              — Linux launcher (name kept for stability; installer refs this path)
├── install-desktop-icon.sh — one-time Ubuntu installer: writes ~/Desktop/cyber-gym.desktop + menu entry with absolute paths
├── FORGE.bat             — Windows launcher (legacy, kept for portability)
├── CLAUDE.md             — this file
├── index.html
├── package.json
└── vite.config.js
```

## Dev Commands
```bash
npm run dev        # starts both server (:3000) and Vite client (:5173) concurrently
npm run build      # builds frontend to dist/
npm start          # production: serves built dist/ from Express on :3000
```

Vite proxies `/api/*` to `http://localhost:3000` in dev — already configured in `vite.config.js`.

## Styling Architecture
Two layers — keep both in sync when making changes:

**1. CSS class layer** — injected via `<style>{gCss}</style>` inside `ForgeGym()`. Handles layout, responsive breakpoints, and active-mode toggling. Key classes:
```css
.forge-root          /* grid wrapper: 1fr 320px */
.forge-main          /* left content column: max-width 720px, centered */
.music-panel         /* right sidebar, 320px */
.forge-root.active-mode          /* collapses grid to 1fr during active workout */
.forge-root.active-mode .music-panel  /* hides panel (display:none) — music keeps playing */
@media (max-width:900px)         /* collapses to single column on small screens */
```

**2. Inline style layer** — all component-level styles. Design tokens:
```js
const C = {
  bg: "#080808", surf: "#111111", surf2: "#181818",
  border: "#1e1e1e", border2: "#2a2a2a",
  pink: "#ff2d95", pinkBright: "#ff4fb0", pinkDim: "#662d5f88",
  cyan: "#00d9ff",
  text: "#e8e8e8", muted: "#666", faint: "#333",
};
const s = {
  bigBtn: { ... },   // primary CTA button
  adjBig: { ... },   // large +/- touch buttons (52x52px)
  adjSm:  { ... },   // small adjustment buttons
  card:   { ... },   // surface card
  label:  { ... },   // Orbitron uppercase label
};
```

**Fonts:** Orbitron (headers, labels, numbers) + Rajdhani (body). Loaded via Google Fonts link tag injected in the main `ForgeGym` component's `useEffect` (runs once on mount).

**Aesthetic:** Dark cyberpunk with hot-pink primary (`C.pink`) and electric-cyan secondary (`C.cyan`) — the palette lifted from the Cyber Gym logo (pink→purple→blue gradient on black). Use `C.pink` for primary actions, borders on selected/active items, and heading accents; reach for `C.cyan` sparingly for secondary highlights or gradient endpoints. Keep it dark, neon, and intentional — not bubblegum. Rounded corners are fine here (the logo uses them); no hard rule either way.

## Layout Structure
Single centered column, max-width 820px. `.forge-root` is a flex wrapper that centers `.forge-main`; no sidebars. `.forge-main` holds the header, screen content, and bottom nav stacked vertically. On active/summary screens the header and nav are conditionally hidden.

```
┌──────────────────────────────────┐
│  .forge-main (max 820px)         │
│   [header]  CYBER GYM · KIOSK    │
│   [screen content]               │
│   [bottom nav: 5 tabs]           │
└──────────────────────────────────┘
```

## Screen / State Flow
```
screen: "home" | "library" | "ai" | "progress" | "history" | "active" | "summary"
```
- `startWorkout(plan)` — initializes `active` state; pre-fills weight from `lastWeights[firstExId]` or 95
- `logSet()` — advances set/exercise index, starts rest timer; saves `lastWeights[exId] = wt`
- `skipExercise()` — advances past the current exercise without a rest timer
- `subExercise(newId)` — swaps current exercise for another in the same category; clears that slot's logged sets
- `repeatWorkout(session)` — rebuilds a plan from a history entry and calls `startWorkout`
- `finishWorkout(w)` — saves to `forge-history`, computes per-exercise 1RM PRs (Epley), updates `forge-prs`, navigates to `"summary"`

Navigation lives in bottom nav (5 tabs: HOME / EXERCISES / AI COACH / PROGRESS / HISTORY). Back button + KIOSK fullscreen toggle appear in the header; active workout and summary screens have no header or nav.

## Data Shapes
```js
// Workout plan (input to startWorkout)
{ name: string, exercises: [{ exerciseId, name, sets, targetReps, restSecs }] }

// Active workout state (extends plan)
{ ...plan, startTime, exIdx, setIdx, logged: [[{wt, reps}]], resting, restLeft, restTotal, wt, reps }

// Saved session (in history array — now includes exerciseId for PR lookups)
{ id, date, name, duration, exercises: [{ exerciseId, name, sets: [{wt, reps}] }] }

// forge-last-weights: { [exerciseId]: number }   // last weight used per exercise
// forge-prs:          { [exerciseId]: { best1rm, bestWeight, bestReps, date } }
// forge-templates:    [{ id, name, createdAt, exercises: [...plan.exercises] }]
// forge-bodyweight:   [{ date, weight }]  // newest first
// forge-weekly-summary-date: "YYYY-MM-DD" string — last day the Monday recap fired
```

## Plate Calculator
`calcPlates(totalWeight)` assumes a 45 lb Smith bar and returns `{ perSide: [{weight, count}], remainder }`. `<PlateBreakdown weight={n} compact?>` renders the breakdown; only shown when weight > 45. Used in ActiveScreen (below the weight input) and in LibraryScreen configure cards for Smith Machine exercises.

## Progressive Overload
`getOverloadSuggestion(exerciseId, currentWeight, targetReps, history)` scans back through history; if every set in the last session with this exercise met the minimum rep target at ≥ currentWeight, returns `{ suggest: true, newWeight: currentWeight + 5 }`. Shown in ActiveScreen as a green "↑ TRY X LBS TODAY" nudge above the weight display, only before the first set is logged for that exercise.

## Streak Tracker
`calcStreak(history)` counts consecutive calendar days with ≥1 logged session. Alive only if today or yesterday has a session. Shown as a HomeScreen stat card. Derived from history — no dedicated storage.

## Workout Templates
Save named plans for one-tap relaunch. Stored in `forge-templates`. Saved from LibraryScreen via a "SAVE AS TEMPLATE" toggle next to the workout name. Listed on HomeScreen between the AI card and stats row (tap to launch, × to delete). The AI coach can also save templates by returning a \`\`\`save-template JSON block — `sendChat` parses it identically to the `workout` block, persists the template, and shows a "✓ Saved as template: …" confirmation in the chat.

## Bodyweight Logging
Stored in `forge-bodyweight` (newest first). `BodyweightSection` at the top of ProgressScreen has a weight input (pre-filled with last value) and an SVG line chart of the last 12 entries. If current bodyweight is logged, it's also injected into the AI system prompt.

## PR Flash + Hall of Fame
`finishWorkout` collects exercise names where a new best1rm was hit into `newPrs` state. `SummaryScreen` shows a prominent pink banner listing them. `ProgressScreen` has an "ALL-TIME RECORDS" card listing every exercise with a PR, sorted by date (newest first).

## Rest Day Intelligence
The AI system prompt includes derived frequency context: days since last session, sessions in last 7 days, muscle groups trained this week, and current bodyweight if logged. The prompt instructs the model to proactively flag recovery needs and undertrained muscle groups.

## Weekly Recap
A "WEEKLY RECAP" button in the AI screen header fires `requestWeeklyRecap`, which builds a prompt with the last 7 days of sessions and routes it through `sendChat`. Also auto-fires once on Mondays if the chat is empty and no recap has been logged that day (tracked in `forge-weekly-summary-date`).

## Strength Levels
`STRENGTH_LEVELS` is an exerciseId → `[Beginner, Novice, Intermediate, Advanced, Elite]` 1RM table at the top of the file. `getStrengthLevel(id, e1rm)` returns `{ level, name, color, nextTarget, prevTarget, pctToNext }`. `epley1rm(wt, reps) = round(wt * (1 + reps/30))`. PR updates happen in `finishWorkout` — whenever a set's e1RM exceeds the stored `best1rm`, the PR entry is replaced.

## Form Media + Instructions
All exercise form media lives in `public/exercises/` keyed by exerciseId and is populated by `scrape_musclewiki.py`. Per exercise we may have:
- `<id>.mp4` — looping side-view form video (falls back to webm/gif/jpg/png)
- `<id>.json` — `{ steps: [string], muscles: { primary, secondary, tertiary }, source_slug, source_name }`
- `<id>-muscles-front.png` and `<id>-muscles-back.png` — highlighted body-map diagrams

Components:
- `ExerciseImage` — renders video or image, tries `mp4 → webm → gif → jpg → png`, hides if all missing.
- `useInstructions(id)` — fetches and caches the JSON file; returns null while loading, object if present, null if 404.
- `MuscleDiagram` — tries `front` view, falls back to `back`, hides if neither file exists.
- `FormPanel` — bundles video + muscle diagram + primary/secondary muscle pills + form steps. Used as the right column on `ActiveScreen`.

## Active Workout Layout
During an active (non-resting) set, `ActiveScreen` renders a 2-column flex layout via the `.form-split` / `.form-inputs` / `.form-panel` CSS classes. Left column holds the weight/reps/log controls; right column is a 380 px wide `FormPanel`. The `.forge-main` wrapper widens to `max-width: 1280px` via the `.wide` modifier class while `isActive`. Below 900 px the split stacks to a single column so phones/tablets still work. The rest-period view stays centered full-width (no split).

## Exercise Database
42 exercises at the top of `ForgeGym.jsx`, all mapped to the Mikolo Smith Machine / Power Cage with dual cable system and vertical leg press. Shape:
```js
{ id, name, cat, equip, type: "compound"|"isolation", rest: seconds }
```
Categories: `Chest | Back | Legs | Shoulders | Arms | Core`

## AI Coach
Calls `/api/chat` which proxies to Anthropic (`claude-sonnet-4-5`). System prompt tells the model to return workout plans as a triple-backtick `workout` JSON block. Frontend regex-parses that block and renders a "START THIS WORKOUT" button. Do not change the model string or the `workout` block format without updating both the system prompt and the parse regex.

## What's Intentionally Simple — Don't Change These
- No TypeScript — plain JSX only
- No state management library — useState / useRef only
- No CSS modules, no Tailwind — inline styles + the gCss block, use C and s constants
- No router — screen state string drives all navigation
- No database — flat JSON files are correct for single-user local use
- Single ForgeGym.jsx file — do not split into multiple component files

## Home Assistant Integration (Planned — Not Yet Built)
Fire webhooks to HA on key workout events. Will need `HA_BASE_URL` and `HA_TOKEN` added to `.env` and a server-side proxy endpoint (same pattern as `/api/chat` — never expose the token to the frontend). Planned hook points:
- `logSet()` when rest timer starts — trigger "rest" scene (color change or sound)
- `startWorkout()` — "focus" scene (dim red)
- `finishWorkout()` — "done" celebration scene

# FORGE GYM OS — Claude Code Instructions

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
│   ├── ForgeGym.jsx      — entire frontend, single file (~960 lines)
│   └── main.jsx          — React entry point
├── server/
│   └── index.js          — Express server (storage API + Anthropic proxy + static serving)
├── data/                 — auto-created, gitignored — forge-history.json, forge-playlist.json
├── .env                  — ANTHROPIC_API_KEY=sk-... (already configured, do not touch)
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
  red: "#cc1111", redBright: "#ff2222",
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

**Fonts:** Orbitron (headers, labels, numbers) + Rajdhani (body). Loaded via Google Fonts link tag injected in `MusicPanel`'s `useEffect` (runs once on mount).

**Aesthetic:** Dark cyberpunk, crimson red accents. No purple gradients, no rounded-everything — keep it industrial and intentional.

## Layout Structure
```
┌─────────────────────────────────┬──────────────┐
│  .forge-main (1fr, max 720px)   │ .music-panel │
│                                 │    (320px)   │
│  [header]                       │              │
│  [screen content]               │  YouTube     │
│  [bottom nav]                   │  player      │
└─────────────────────────────────┴──────────────┘
```
During active workout: `.forge-root` gets class `active-mode` → grid becomes `1fr`, music panel gets `display:none` (but stays mounted so playback continues uninterrupted).

## Screen / State Flow
```
screen: "home" | "library" | "ai" | "history" | "active" | "summary"
```
- `startWorkout(plan)` — initializes `active` state, navigates to `"active"`
- `logSet()` — advances set/exercise index, starts rest timer
- `finishWorkout(w)` — saves to `/api/storage/forge-history`, navigates to `"summary"`

Navigation lives in bottom nav (4 tabs). Back button appears in header when not on home. Active workout and summary have no nav bar.

## Data Shapes
```js
// Workout plan (input to startWorkout)
{ name: string, exercises: [{ exerciseId, name, sets, targetReps, restSecs }] }

// Active workout state (extends plan)
{ ...plan, startTime, exIdx, setIdx, logged: [[{wt, reps}]], resting, restLeft, restTotal, wt, reps }

// Saved session (in history array)
{ id, date, name, duration, exercises: [{ name, sets: [{wt, reps}] }] }
```

## Exercise Database
42 exercises at the top of `ForgeGym.jsx`, all mapped to the Mikolo Smith Machine / Power Cage with dual cable system and vertical leg press. Shape:
```js
{ id, name, cat, equip, type: "compound"|"isolation", rest: seconds }
```
Categories: `Chest | Back | Legs | Shoulders | Arms | Core`

## AI Coach
Calls `/api/chat` which proxies to Anthropic (`claude-sonnet-4-5`). System prompt tells the model to return workout plans as a triple-backtick `workout` JSON block. Frontend regex-parses that block and renders a "START THIS WORKOUT" button. Do not change the model string or the `workout` block format without updating both the system prompt and the parse regex.

## YouTube Music Panel
`MusicPanel` is **always mounted** — it renders as the `.music-panel` aside and is only visually hidden via CSS during active workout. This keeps the YouTube iframe alive and music playing across screen changes.

Implementation details:
- Uses `containerRef` — a `useRef` pointing to a div inside the panel. The YT API replaces a throwaway child element inside that div with an iframe (React never touches the iframe directly).
- `cuePlaylist()` loads a playlist without autoplaying — user taps play manually.
- Playlist URL is saved to `/api/storage/forge-playlist` and restored on mount.
- `extractPlaylistId(url)` handles both `youtube.com/playlist?list=ID` and `music.youtube.com/playlist?list=ID` URL formats.
- **Do not convert this to a conditional render** — the panel must stay mounted or playback dies on screen change.

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

# FORGE GYM OS — Claude Code Instructions

## Project Overview
Local-network home gym dashboard built with React + Vite frontend and an Express backend. Runs on a home server (Raspberry Pi or similar), accessed via touchscreen/TV in the gym. Single user, no auth.

## Tech Stack
- **Frontend:** React 18, Vite, all styling via inline JS objects (no CSS files, no Tailwind, no component libraries)
- **Backend:** Express (ESM), Node.js
- **Storage:** Flat JSON files in `data/` directory — one file per key, written atomically via `/api/storage/:key`
- **AI:** Anthropic Claude API proxied through `/api/chat` — API key lives server-side only, never touches the frontend
- **Music:** YouTube IFrame API loaded at runtime, no npm package

## Project Structure
```
HomeGymDashboard/
├── src/
│   ├── ForgeGym.jsx      — entire frontend, single file
│   └── main.jsx          — React entry point
├── server/
│   └── index.js          — Express server (storage API + Anthropic proxy + static serving)
├── data/                 — auto-created, gitignored, holds forge-history.json / forge-playlist.json
├── .env                  — ANTHROPIC_API_KEY=sk-... (already configured, do not touch)
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

Vite proxies `/api/*` to `http://localhost:3000` in dev mode — already configured in `vite.config.js`.

## Design System
All styles are inline JS objects. The design tokens live at the top of `ForgeGym.jsx`:

```js
const C = {
  bg: "#080808", surf: "#111111", surf2: "#181818",
  border: "#1e1e1e", border2: "#2a2a2a",
  red: "#cc1111", redBright: "#ff2222",
  text: "#e8e8e8", muted: "#666", faint: "#333",
};
const s = {
  bigBtn: { ... },   // primary CTA button
  adjBig: { ... },   // large +/- touch buttons
  adjSm:  { ... },   // small adjustment buttons
  card:   { ... },   // surface card
  label:  { ... },   // Orbitron uppercase label
};
```

**Fonts:** Orbitron (headers, labels, numbers) + Rajdhani (body). Loaded via Google Fonts in the `MusicPanel` useEffect.
**Aesthetic:** Dark cyberpunk. Crimson red accents. No gradients except on the START WORKOUT hero card. Keep it industrial.

## Layout
The root wrapper uses a CSS grid: `1fr 320px`. Left = main content, right = persistent `MusicPanel`. During active workout the grid collapses to `1fr` and the music panel is hidden (but stays mounted so playback continues). Under 900px wide, the panel is also hidden and the main content takes the full width.

Bottom nav has 4 tabs: Home, Exercises, AI Forge, History.

## Screen/State Flow
```
screen state: "home" | "library" | "ai" | "history" | "active" | "summary"
```
- `startWorkout(plan)` — sets `active` state and switches to "active"
- `logSet()` — advances set/exercise index, triggers rest timer
- `finishWorkout(w)` — saves session to history via `/api/storage/forge-history`, goes to "summary"

## Data Shapes
```js
// Workout plan (passed to startWorkout)
{ name: string, exercises: [{ exerciseId, name, sets, targetReps, restSecs }] }

// Active workout state (extends plan)
{ ...plan, startTime, exIdx, setIdx, logged: [[{wt, reps}]], resting, restLeft, restTotal, wt, reps }

// Saved session (stored in history)
{ id, date, name, duration, exercises: [{ name, sets: [{wt, reps}] }] }
```

## Exercise Database
42 exercises at the top of `ForgeGym.jsx`. All mapped to a Mikolo Smith Machine / Power Cage with dual cable system and vertical leg press. Shape:
```js
{ id, name, cat, equip, type: "compound"|"isolation", rest: seconds }
```
Categories: Chest, Back, Legs, Shoulders, Arms, Core.

## AI Coach
Calls `/api/chat` which proxies to Anthropic. The system prompt instructs the model (claude-sonnet-4-5) to return workout plans as a ` ```workout ` JSON block. The frontend parses this and renders a "START THIS WORKOUT" button. Keep the system prompt as-is unless changing equipment context.

## YouTube Music Panel
Uses `window.YT.Player` (YouTube IFrame API). The player mounts into a ref-held container div inside `MusicPanel` — YT replaces a throwaway child element with an iframe, so React never touches it. `MusicPanel` is always mounted (even during active workout — it's hidden via `display:none` so playback continues). Playlist URL is saved to `/api/storage/forge-playlist`. Accepts full YouTube/YouTube Music URLs or raw playlist IDs via `extractPlaylistId()`.

## What's Intentionally Simple
- No TypeScript — plain JSX
- No state management library — useState/useRef only
- No CSS modules or Tailwind — inline styles throughout, use the `C` and `s` constants
- No router — single component with a `screen` state string
- No database — flat JSON files are fine for single-user local use

## Home Assistant Integration (Planned)
Future feature: fire webhooks from the dashboard to HA on rest-end, workout-start, and workout-complete events. Will need a HA base URL + long-lived token stored in `.env`. Hook points are in `logSet()` (rest timer end) and `startWorkout()` / `finishWorkout()`.

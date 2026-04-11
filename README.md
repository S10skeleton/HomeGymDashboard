# FORGE GYM OS

A personal home gym dashboard built around my Mikolo Smith Machine Multi-Function Power Cage. Runs on my home server and is accessed from a smart TV browser in the gym, a Pi touchscreen on the rack, or whatever phone is closest. Single user, LAN-only, no auth — physical access to the network is the access control.

## Why local

- Workout logs never leave the house
- The Anthropic API key lives in an env file on the server, never in the browser
- Works even when the internet is down (everything except the AI Coach)
- Same URL from every device — history is shared between the TV, the touchscreen, and my phone

## Features

- **Home** — today's date, total sessions, last workout recap, quick launch
- **Exercise Library** — 40+ exercises organized by muscle group (Chest, Back, Legs, Shoulders, Arms, Core), all mapped to what the Mikolo cage can actually do
- **Workout Builder** — pick exercises, configure sets / reps / rest per-exercise, then launch
- **Active Workout** — one-screen-at-a-time flow with big touch targets: weight and rep steppers, previous-set reference, a circular rest timer with skip, per-exercise progress bar
- **AI Coach (FORGE)** — Claude-powered coach that knows the Mikolo cage's capabilities and returns fully-configured workouts as structured JSON you can start with one tap
- **History** — every session stored with full set-by-set detail, expandable cards, total volume
- **Summary** — post-workout stats: duration, total sets, total volume, exercise breakdown

## Equipment the AI Coach knows about

The AI Coach is primed with the specific capabilities of my rig so it can only suggest things I can actually do:

- Mikolo Smith Machine Multi-Function Power Cage
- Dual cable system (with rope, lat bar, v-bar, ankle strap, handles)
- Vertical leg press
- Pull-up bar
- Dip handles

## Stack

- **Frontend:** React + Vite — single-page app, dark tactical UI, all inline styles (no CSS framework)
- **Backend:** Node + Express — serves the built frontend, proxies the Anthropic API so the key stays server-side, and persists workout history as atomic JSON file writes
- **AI:** Claude (Anthropic Messages API) via server-side proxy
- **Storage:** Flat JSON file on disk. Single user, append-only, no database needed

## First-time setup

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env
# edit .env and paste your ANTHROPIC_API_KEY
```

## Develop (Windows or Linux)

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:3000
- Vite proxies `/api/*` to the backend automatically, so the browser only ever talks to one origin.

## Run on the home server

```bash
npm run build    # bundles the frontend into dist/
npm start        # Express serves dist/ + /api on :3000, bound to 0.0.0.0
```

From any device on the LAN, open `http://<server-hostname-or-ip>:3000`.

## Data

Workout history is saved to `data/forge-history.json` on the server. The whole `data/` directory is gitignored — back it up yourself if you want to keep your logs long-term. Writes are atomic (tmp + rename) so a crash mid-write won't corrupt history.

## Environment variables

See `.env.example`:

- `ANTHROPIC_API_KEY` — required for the AI Coach screen. The rest of the app (library, builder, active workout, history) works fine without it.
- `PORT` — default `3000`
- `HOST` — default `0.0.0.0` (bind all interfaces so LAN devices can reach it)

## Auto-start on boot (Linux + systemd)

Create `/etc/systemd/system/forge.service`:

```ini
[Unit]
Description=FORGE Gym OS
After=network-online.target

[Service]
Type=simple
User=YOUR_USER
WorkingDirectory=/path/to/HomeGymDashboard
EnvironmentFile=/path/to/HomeGymDashboard/.env
ExecStart=/usr/bin/node server/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now forge
sudo systemctl status forge
```

## Roadmap / ideas

Things I'd like to add when I get around to them:

- **Local Ollama mode** — route the AI Coach to a local Ollama model instead of the Anthropic API for fully-offline operation (the home server already runs Ollama)
- **PR tracking** — auto-detect 1RM / volume PRs per exercise and surface them on the home screen
- **Plate calculator** — given a target weight, show the plate loadout per side (useful for the Smith bar's specific counterweight)
- **Progression suggestions** — "last time you did 185×8, try 190×8 today"
- **Rest-day / split planning** — weekly calendar view
- **Body metrics** — bodyweight log, simple charts
- **Voice control** — "FORGE, log set" when my hands are chalky
- **Touchscreen kiosk mode** — Pi boots straight into the browser fullscreen on the gym touchscreen, no Linux desktop visible
- **Multi-user** — if anyone else ever uses the gym, per-user history (would mean moving from JSON file to SQLite)

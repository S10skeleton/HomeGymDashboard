import { useState, useEffect, useRef } from "react";

// ── FONTS ──────────────────────────────────────────────────────────────────
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap";

// ── EXERCISE DATABASE (mapped to Mikolo cage capabilities) ─────────────────
const EXERCISES = [
  // CHEST
  { id: "smith-bench",    name: "Smith Machine Bench Press",  cat: "Chest",     equip: "Smith Machine", type: "compound", rest: 90  },
  { id: "smith-incline",  name: "Smith Incline Press",         cat: "Chest",     equip: "Smith Machine", type: "compound", rest: 90  },
  { id: "smith-decline",  name: "Smith Decline Press",         cat: "Chest",     equip: "Smith Machine", type: "compound", rest: 90  },
  { id: "cable-fly-mid",  name: "Cable Chest Fly (Mid)",       cat: "Chest",     equip: "Cable",         type: "isolation",rest: 60  },
  { id: "cable-fly-high", name: "Cable Fly (High to Low)",     cat: "Chest",     equip: "Cable",         type: "isolation",rest: 60  },
  { id: "cable-fly-low",  name: "Cable Fly (Low to High)",     cat: "Chest",     equip: "Cable",         type: "isolation",rest: 60  },
  { id: "cage-dips",      name: "Weighted Dips",               cat: "Chest",     equip: "Cage",          type: "compound", rest: 90  },
  // BACK
  { id: "lat-pulldown",   name: "Lat Pulldown",                cat: "Back",      equip: "Cable",         type: "compound", rest: 90  },
  { id: "wide-pulldown",  name: "Wide Grip Pulldown",          cat: "Back",      equip: "Cable",         type: "compound", rest: 90  },
  { id: "seated-row",     name: "Seated Cable Row",            cat: "Back",      equip: "Cable",         type: "compound", rest: 90  },
  { id: "pullups",        name: "Pull-Ups",                    cat: "Back",      equip: "Cage",          type: "compound", rest: 90  },
  { id: "single-row",     name: "Single Arm Cable Row",        cat: "Back",      equip: "Cable",         type: "compound", rest: 60  },
  { id: "straight-pull",  name: "Straight Arm Pulldown",       cat: "Back",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "cable-shrug",    name: "Cable Shrug",                 cat: "Back",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "smith-rdl",      name: "Smith Machine RDL",           cat: "Back",      equip: "Smith Machine", type: "compound", rest: 90  },
  // LEGS
  { id: "smith-squat",    name: "Smith Machine Squat",         cat: "Legs",      equip: "Smith Machine", type: "compound", rest: 120 },
  { id: "smith-fsquat",   name: "Smith Front Squat",           cat: "Legs",      equip: "Smith Machine", type: "compound", rest: 120 },
  { id: "vert-press",     name: "Vertical Leg Press",          cat: "Legs",      equip: "Leg Press",     type: "compound", rest: 120 },
  { id: "smith-lunge",    name: "Smith Machine Lunge",         cat: "Legs",      equip: "Smith Machine", type: "compound", rest: 90  },
  { id: "smith-calf",     name: "Smith Machine Calf Raise",    cat: "Legs",      equip: "Smith Machine", type: "isolation",rest: 60  },
  { id: "cable-kickback", name: "Cable Glute Kickback",        cat: "Legs",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "cable-abduct",   name: "Cable Hip Abduction",         cat: "Legs",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "rdl",            name: "Romanian Deadlift",           cat: "Legs",      equip: "Smith Machine", type: "compound", rest: 90  },
  // SHOULDERS
  { id: "smith-ohp",      name: "Smith Machine OHP",           cat: "Shoulders", equip: "Smith Machine", type: "compound", rest: 90  },
  { id: "cable-lat",      name: "Cable Lateral Raise",         cat: "Shoulders", equip: "Cable",         type: "isolation",rest: 60  },
  { id: "cable-front",    name: "Cable Front Raise",           cat: "Shoulders", equip: "Cable",         type: "isolation",rest: 60  },
  { id: "face-pull",      name: "Face Pull",                   cat: "Shoulders", equip: "Cable",         type: "isolation",rest: 60  },
  { id: "cable-upright",  name: "Cable Upright Row",           cat: "Shoulders", equip: "Cable",         type: "compound", rest: 60  },
  { id: "rear-delt",      name: "Cable Rear Delt Fly",         cat: "Shoulders", equip: "Cable",         type: "isolation",rest: 60  },
  // ARMS
  { id: "cable-curl",     name: "Cable Bicep Curl",            cat: "Arms",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "cable-hammer",   name: "Cable Hammer Curl",           cat: "Arms",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "cable-preacher", name: "Cable Preacher Curl",         cat: "Arms",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "rope-pushdown",  name: "Rope Pushdown",               cat: "Arms",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "bar-pushdown",   name: "Bar Pushdown",                cat: "Arms",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "oh-tri-ext",     name: "Overhead Tricep Extension",   cat: "Arms",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "skull-crusher",  name: "Skull Crushers (Smith)",      cat: "Arms",      equip: "Smith Machine", type: "isolation",rest: 60  },
  { id: "tri-dips",       name: "Tricep Dips",                 cat: "Arms",      equip: "Cage",          type: "compound", rest: 60  },
  // CORE
  { id: "cable-crunch",   name: "Cable Crunch",                cat: "Core",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "hanging-lr",     name: "Hanging Leg Raise",           cat: "Core",      equip: "Cage",          type: "isolation",rest: 60  },
  { id: "woodchop",       name: "Cable Wood Chop",             cat: "Core",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "pallof",         name: "Pallof Press",                cat: "Core",      equip: "Cable",         type: "isolation",rest: 60  },
  { id: "plank",          name: "Plank",                       cat: "Core",      equip: "Bodyweight",    type: "isolation",rest: 45  },
];

const CATS = ["All","Chest","Back","Legs","Shoulders","Arms","Core"];
const getEx = (id) => EXERCISES.find(e => e.id === id) || {};

// ── STRENGTH LEVELS ────────────────────────────────────────────────────────
// Estimated 1RM thresholds (lbs) per exercise: [Beginner, Novice, Intermediate, Advanced, Elite].
// Based on general population strength standards (Symmetric Strength / ExRx).
const STRENGTH_LEVELS = {
  "smith-bench":    [65,  115, 175, 245, 340],
  "smith-incline":  [55,  95,  145, 205, 285],
  "smith-decline":  [70,  120, 180, 255, 350],
  "smith-squat":    [75,  135, 205, 295, 405],
  "smith-fsquat":   [65,  115, 175, 250, 345],
  "vert-press":     [90,  160, 245, 350, 480],
  "smith-lunge":    [45,  80,  120, 170, 235],
  "smith-calf":     [80,  145, 220, 315, 430],
  "smith-ohp":      [45,  75,  115, 160, 220],
  "smith-rdl":      [85,  150, 230, 325, 445],
  "rdl":            [85,  150, 230, 325, 445],
  "skull-crusher":  [30,  55,  85,  120, 165],
  "lat-pulldown":   [50,  85,  130, 185, 255],
  "wide-pulldown":  [45,  80,  120, 170, 235],
  "seated-row":     [55,  95,  145, 205, 280],
  "pullups":        [10,  35,  70,  115, 170],
  "single-row":     [35,  60,  95,  135, 185],
  "straight-pull":  [30,  55,  85,  120, 165],
  "cable-shrug":    [60,  105, 160, 230, 315],
  "cable-fly-mid":  [20,  35,  55,  80,  110],
  "cable-fly-high": [20,  35,  55,  80,  110],
  "cable-fly-low":  [20,  35,  55,  80,  110],
  "cage-dips":      [10,  35,  70,  115, 170],
  "cable-lat":      [10,  18,  28,  40,  55],
  "cable-front":    [10,  18,  28,  40,  55],
  "face-pull":      [25,  45,  70,  100, 135],
  "cable-upright":  [25,  45,  70,  100, 135],
  "rear-delt":      [10,  18,  28,  40,  55],
  "cable-curl":     [25,  45,  70,  100, 135],
  "cable-hammer":   [25,  45,  70,  100, 135],
  "cable-preacher": [20,  38,  58,  83,  113],
  "rope-pushdown":  [25,  45,  70,  100, 135],
  "bar-pushdown":   [30,  55,  85,  120, 165],
  "oh-tri-ext":     [20,  38,  58,  83,  113],
  "tri-dips":       [10,  35,  70,  115, 170],
  "cable-crunch":   [30,  55,  85,  120, 165],
  "hanging-lr":     [0,   10,  25,  50,  80],
  "woodchop":       [20,  38,  58,  83,  113],
  "pallof":         [15,  28,  43,  60,  83],
  "cable-kickback": [15,  28,  43,  60,  83],
  "cable-abduct":   [15,  28,  43,  60,  83],
  "plank":          [0,   0,   0,   0,   0],
};
const LEVEL_NAMES = ["BEGINNER", "NOVICE", "INTERMEDIATE", "ADVANCED", "ELITE"];
const LEVEL_COLORS = ["#666", "#4a7a4a", "#4a6a9a", "#9a7a2a", "#ff2d95"];

const epley1rm = (w, r) => Math.round(w * (1 + r / 30));

// ── PLATE CALCULATOR ───────────────────────────────────────────────────────
// Smith bar assumed 45 lbs. Returns { perSide: [{weight,count}], remainder }.
const PLATE_SIZES = [45, 35, 25, 10, 5, 2.5];
const SMITH_BAR = 45;

function calcPlates(totalWeight) {
  if (totalWeight <= SMITH_BAR) return { perSide: [], remainder: 0 };
  let remaining = (totalWeight - SMITH_BAR) / 2;
  const perSide = [];
  for (const plate of PLATE_SIZES) {
    const count = Math.floor(remaining / plate);
    if (count > 0) {
      perSide.push({ weight: plate, count });
      remaining -= plate * count;
      remaining = Math.round(remaining * 10) / 10;
    }
  }
  return { perSide, remainder: Math.round(remaining * 10) / 10 };
}

// ── PROGRESSIVE OVERLOAD ───────────────────────────────────────────────────
// Look back at the last session that included this exercise. If every set
// met the minimum rep target at ≥ currentWeight, suggest +5 lbs today.
function getOverloadSuggestion(exerciseId, currentWeight, targetReps, history) {
  for (const session of history) {
    const ex = session.exercises.find(e =>
      e.exerciseId === exerciseId || EXERCISES.find(x => x.name === e.name)?.id === exerciseId
    );
    if (!ex || !ex.sets.length) continue;
    const minReps = parseInt(String(targetReps).split("-")[0]) || parseInt(targetReps) || 10;
    const allHit = ex.sets.every(st => st.reps >= minReps && st.wt >= currentWeight);
    if (allHit) return { suggest: true, newWeight: currentWeight + 5 };
    return { suggest: false };
  }
  return { suggest: false };
}

// ── STREAK ─────────────────────────────────────────────────────────────────
// Consecutive calendar days with ≥1 logged session. Alive if today or
// yesterday has a session; otherwise 0.
function calcStreak(history) {
  if (!history.length) return 0;
  const dates = [...new Set(history.map(s => s.date.split("T")[0]))].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev - curr) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function PlateBreakdown({ weight, compact = false }) {
  if (weight <= SMITH_BAR) return null;
  const { perSide, remainder } = calcPlates(weight);
  return (
    <div style={{ textAlign: "center", marginTop: compact ? 2 : 6 }}>
      {!compact && <div style={{ ...s.label, fontSize: 8, marginBottom: 5 }}>PLATES PER SIDE</div>}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
        {perSide.map(({ weight: pw, count }) => (
          <span key={pw} style={{
            background: C.surf2, border: `1px solid ${C.border2}`,
            borderRadius: 4, padding: compact ? "2px 6px" : "3px 8px",
            fontSize: compact ? 11 : 13, fontFamily: "Orbitron", color: C.text,
          }}>{count > 1 ? `${count}×` : ""}{pw}</span>
        ))}
        {perSide.length === 0 && (
          <span style={{ color: C.muted, fontSize: 12 }}>bar only</span>
        )}
        {remainder > 0 && (
          <span style={{ color: C.pink, fontSize: 11 }}>+{remainder} off</span>
        )}
      </div>
    </div>
  );
}

// ── FORM MEDIA ─────────────────────────────────────────────────────────────
// Drop files into public/exercises/ named [exerciseId].[ext].
// The component tries each extension in order and hides itself if all fail.
// mp4/webm render as muted looping <video>; others render as <img>.
const MEDIA_EXTS = ["mp4", "webm", "gif", "jpg", "png"];
const VIDEO_EXTS = new Set(["mp4", "webm"]);

function getStrengthLevel(exerciseId, estimated1rm) {
  const thresholds = STRENGTH_LEVELS[exerciseId];
  if (!thresholds || estimated1rm <= 0) {
    return { level: 0, name: "UNRANKED", color: "#444", nextTarget: null, prevTarget: 0, pctToNext: 0 };
  }
  let level = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (estimated1rm >= thresholds[i]) level = i + 1;
  }
  level = Math.min(level, 5);
  const name = level === 5 ? "ELITE" : level === 0 ? "BEGINNER" : LEVEL_NAMES[level];
  const color = LEVEL_COLORS[Math.min(level, 4)];
  const nextTarget = level < 5 ? thresholds[level] : null;
  const prevTarget = level > 0 ? thresholds[level - 1] : 0;
  const pctToNext = nextTarget
    ? Math.min(100, Math.round(((estimated1rm - prevTarget) / (nextTarget - prevTarget)) * 100))
    : 100;
  return { level, name, color, nextTarget, prevTarget, pctToNext };
}

// ── STORAGE ────────────────────────────────────────────────────────────────
// Backed by the Express server at /api/storage/:key. Single JSON file per key,
// persisted to disk on the home server so history survives browser wipes and
// is shared between the TV, touchscreen, and phone.
const store = {
  async get(k) {
    try {
      const r = await fetch(`/api/storage/${encodeURIComponent(k)}`);
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  },
  async set(k, v) {
    try {
      await fetch(`/api/storage/${encodeURIComponent(k)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
    } catch {}
  },
};

// ── STYLE CONSTANTS ────────────────────────────────────────────────────────
const C = {
  bg: "#080808", surf: "#111111", surf2: "#181818",
  border: "#1e1e1e", border2: "#2a2a2a",
  pink: "#ff2d95", pinkBright: "#ff4fb0", pinkDim: "#662d5f88",
  cyan: "#00d9ff",
  text: "#e8e8e8", muted: "#888", faint: "#555",
  success: "#22cc66",
};

const s = {
  bigBtn: { background: C.pink, border: "none", borderRadius: 12, padding: "20px 0", color: "#fff", fontFamily: "Orbitron, monospace", fontSize: 17, letterSpacing: 3, cursor: "pointer", width: "100%", boxShadow: "0 0 32px rgba(255,45,149,0.35)", transition: "box-shadow 0.15s" },
  adjBig: { background: C.surf2, border: `1px solid ${C.border2}`, color: C.text, width: 52, height: 52, borderRadius: 10, cursor: "pointer", fontSize: 20, fontFamily: "Rajdhani, sans-serif", fontWeight: 700 },
  adjSm: { background: "transparent", border: `1px solid ${C.border}`, color: C.muted, padding: "5px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontFamily: "Rajdhani, sans-serif" },
  card: { background: C.surf, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 },
  label: { fontFamily: "Orbitron, monospace", fontSize: 10, letterSpacing: 3, color: C.muted },
};

// ── CIRCULAR TIMER ─────────────────────────────────────────────────────────
function CircularTimer({ seconds, total, onSkip }) {
  const r = 58, circ = 2 * Math.PI * r;
  const pct = Math.max(0, seconds / total);
  const offset = circ * (1 - pct);
  const urgent = seconds <= 10;
  const m = Math.floor(seconds / 60), sec = seconds % 60;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ position: "relative", width: 150, height: 150 }}>
        <svg width="150" height="150" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="75" cy="75" r={r} fill="none" stroke={C.surf2} strokeWidth="9" />
          <circle cx="75" cy="75" r={r} fill="none"
            stroke={urgent ? C.pinkBright : C.pink} strokeWidth="9"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "Orbitron, monospace", fontSize: 32, fontWeight: 700, color: urgent ? C.pinkBright : C.text, letterSpacing: 2 }}>
            {m}:{String(sec).padStart(2, "0")}
          </div>
          <div style={{ ...s.label, fontSize: 9, marginTop: 4 }}>REST</div>
        </div>
      </div>
      <button onClick={onSkip} style={{ ...s.adjSm, padding: "10px 28px", letterSpacing: 1 }}>SKIP REST</button>
    </div>
  );
}

// ── EXERCISE INSTRUCTIONS LOADER ───────────────────────────────────────────
// Reads public/exercises/<id>.json written by the scraper. Caches in-memory.
const _instructionCache = new Map();
function useInstructions(id) {
  const [data, setData] = useState(() => (id ? _instructionCache.get(id) : null) || null);
  useEffect(() => {
    if (!id) { setData(null); return; }
    if (_instructionCache.has(id)) { setData(_instructionCache.get(id)); return; }
    let cancelled = false;
    fetch(`/exercises/${id}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled) { _instructionCache.set(id, d); setData(d); } })
      .catch(() => { if (!cancelled) { _instructionCache.set(id, null); setData(null); } });
    return () => { cancelled = true; };
  }, [id]);
  return data;
}

// Muscle diagram: renders front + back side-by-side so back-side muscles
// (triceps, lats, glutes, etc.) stay visible. Each half hides itself if
// the file is missing; the wrapper hides if both are gone.
function MuscleDiagram({ id, style }) {
  const [frontOk, setFrontOk] = useState(true);
  const [backOk, setBackOk] = useState(true);
  useEffect(() => { setFrontOk(true); setBackOk(true); }, [id]);
  if (!id || (!frontOk && !backOk)) return null;
  const imgStyle = { flex: 1, minWidth: 0, maxHeight: 240, objectFit: "contain" };
  return (
    <div style={{ display: "flex", gap: 6, background: "#0d0d0d", border: `1px solid ${C.border}`, borderRadius: 10, padding: 8, justifyContent: "center", ...style }}>
      {frontOk && (
        <img src={`/exercises/${id}-muscles-front.png`} alt=""
          onError={() => setFrontOk(false)} style={imgStyle} />
      )}
      {backOk && (
        <img src={`/exercises/${id}-muscles-back.png`} alt=""
          onError={() => setBackOk(false)} style={imgStyle} />
      )}
    </div>
  );
}

// ── EXERCISE FORM IMAGE ────────────────────────────────────────────────────
// Tries mp4 → webm → gif → jpg → png; unmounts itself if none exist.
function ExerciseImage({ id, style, onClick, onMissing }) {
  const [extIdx, setExtIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setExtIdx(0); setFailed(false); }, [id]);
  if (failed || !id) return null;
  const ext = MEDIA_EXTS[extIdx];
  const src = `/exercises/${id}.${ext}`;
  const advance = () => {
    if (extIdx < MEDIA_EXTS.length - 1) setExtIdx(extIdx + 1);
    else { setFailed(true); onMissing?.(); }
  };
  if (VIDEO_EXTS.has(ext)) {
    return (
      <video
        key={src}
        src={src}
        autoPlay muted loop playsInline
        onClick={onClick}
        onError={advance}
        style={style}
      />
    );
  }
  return (
    <img
      src={src}
      alt=""
      onClick={onClick}
      onError={advance}
      style={style}
    />
  );
}

// ── FORM PANEL (right column on ActiveScreen) ─────────────────────────────
function FormPanel({ exerciseId, exerciseName, onEnlarge }) {
  const info = useInstructions(exerciseId);
  return (
    <>
      <div style={{ background: "#000", borderRadius: 10, overflow: "hidden", aspectRatio: "4 / 3", width: "100%" }}>
        <ExerciseImage
          id={exerciseId}
          onClick={onEnlarge}
          style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
        />
      </div>

      <MuscleDiagram id={exerciseId} />

      {info?.muscles?.primary?.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {info.muscles.primary.map(m => (
            <span key={m} style={{ background: C.pink, color: "#fff", fontSize: 10, fontFamily: "Orbitron", letterSpacing: 1, padding: "3px 9px", borderRadius: 10 }}>{m}</span>
          ))}
          {(info.muscles.secondary || []).map(m => (
            <span key={m} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border2}`, fontSize: 10, fontFamily: "Orbitron", letterSpacing: 1, padding: "3px 9px", borderRadius: 10 }}>{m}</span>
          ))}
        </div>
      )}

      {info?.steps?.length > 0 ? (
        <div style={{ ...s.card }}>
          <div style={{ ...s.label, fontSize: 9, marginBottom: 10 }}>FORM STEPS</div>
          <ol style={{ paddingLeft: 22, margin: 0, color: C.text, fontSize: 13, lineHeight: 1.5, display: "flex", flexDirection: "column", gap: 8 }}>
            {info.steps.map((step, i) => (
              <li key={i} style={{ paddingLeft: 4 }}>{step}</li>
            ))}
          </ol>
        </div>
      ) : info === null ? (
        <div style={{ color: C.faint, fontSize: 12, textAlign: "center", padding: 12 }}>
          No form notes for {exerciseName}
        </div>
      ) : null}
    </>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function ForgeGym() {
  const [screen, setScreen] = useState("home");
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastSession, setLastSession] = useState(null);
  const [chat, setChat] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastWeights, setLastWeights] = useState({});
  const [prs, setPrs] = useState({});
  const [templates, setTemplates] = useState([]);
  const [bodyweight, setBodyweight] = useState([]);
  const [newPrs, setNewPrs] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_LINK;
    document.head.appendChild(link);
    store.get("forge-history").then(h => h && setHistory(h));
    store.get("forge-last-weights").then(w => w && setLastWeights(w));
    store.get("forge-prs").then(p => p && setPrs(p));
    store.get("forge-templates").then(t => t && setTemplates(t));
    store.get("forge-bodyweight").then(b => b && setBodyweight(b));
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  // Rest timer tick
  useEffect(() => {
    clearInterval(timerRef.current);
    if (active?.resting) {
      timerRef.current = setInterval(() => {
        setActive(w => {
          if (!w?.resting) return w;
          if (w.restLeft <= 1) { clearInterval(timerRef.current); return { ...w, resting: false, restLeft: 0 }; }
          return { ...w, restLeft: w.restLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [active?.resting]);

  const startWorkout = (plan) => {
    const firstEx = plan.exercises[0];
    setActive({
      ...plan,
      startTime: Date.now(),
      exIdx: 0, setIdx: 0,
      logged: plan.exercises.map(() => []),
      resting: false, restLeft: 0, restTotal: 0,
      wt: lastWeights[firstEx?.exerciseId] || 95, reps: 10,
    });
    setScreen("active");
  };

  const logSet = () => {
    const w = active;
    const ex = w.exercises[w.exIdx];
    const newLogged = w.logged.map((s, i) => i === w.exIdx ? [...s, { wt: w.wt, reps: w.reps }] : s);
    const lastSet = w.setIdx >= ex.sets - 1;
    const lastEx = w.exIdx >= w.exercises.length - 1;

    if (ex.exerciseId) {
      const updatedWeights = { ...lastWeights, [ex.exerciseId]: w.wt };
      setLastWeights(updatedWeights);
      store.set("forge-last-weights", updatedWeights);
    }

    if (lastSet && lastEx) { finishWorkout({ ...w, logged: newLogged }); return; }

    const rest = ex.restSecs || 90;
    if (lastSet) {
      const nextEx = w.exercises[w.exIdx + 1];
      const nextReps = parseInt(nextEx?.targetReps) || 10;
      const nextWt = lastWeights[nextEx?.exerciseId] || 95;
      setActive({ ...w, logged: newLogged, exIdx: w.exIdx + 1, setIdx: 0, resting: true, restLeft: rest, restTotal: rest, wt: nextWt, reps: nextReps });
    } else {
      setActive({ ...w, logged: newLogged, setIdx: w.setIdx + 1, resting: true, restLeft: rest, restTotal: rest });
    }
  };

  const skipExercise = () => {
    const w = active;
    if (!w) return;
    const lastEx = w.exIdx >= w.exercises.length - 1;
    if (lastEx) { finishWorkout(w); return; }
    const nextEx = w.exercises[w.exIdx + 1];
    const nextReps = parseInt(nextEx?.targetReps) || 10;
    const nextWt = lastWeights[nextEx?.exerciseId] || 95;
    setActive({ ...w, exIdx: w.exIdx + 1, setIdx: 0, resting: false, restLeft: 0, restTotal: 0, wt: nextWt, reps: nextReps });
  };

  const subExercise = (newId) => {
    const w = active;
    if (!w) return;
    const newEx = getEx(newId);
    if (!newEx.id) return;
    const current = w.exercises[w.exIdx];
    const replacement = {
      exerciseId: newEx.id,
      name: newEx.name,
      sets: current.sets,
      targetReps: current.targetReps,
      restSecs: newEx.rest || current.restSecs,
    };
    const newExercises = w.exercises.map((e, i) => i === w.exIdx ? replacement : e);
    setActive({ ...w, exercises: newExercises, setIdx: 0, logged: w.logged.map((s, i) => i === w.exIdx ? [] : s), wt: lastWeights[newId] || 95 });
  };

  const saveTemplate = async (plan) => {
    const tpl = {
      id: Date.now().toString(),
      name: plan.name,
      createdAt: new Date().toISOString(),
      exercises: plan.exercises,
    };
    const next = [tpl, ...templates];
    setTemplates(next);
    await store.set("forge-templates", next);
    return tpl;
  };

  const deleteTemplate = async (id) => {
    const next = templates.filter(t => t.id !== id);
    setTemplates(next);
    await store.set("forge-templates", next);
  };

  const launchTemplate = (t) => startWorkout({ name: t.name, exercises: t.exercises });

  const requestWeeklyRecap = async () => {
    const DAY = 86400000;
    const weekSessions = history.filter(s => (Date.now() - new Date(s.date)) / DAY <= 7);
    const prompt = `Generate my weekly training summary. Sessions from the last 7 days:
${JSON.stringify(weekSessions, null, 2)}

Write a 2-3 sentence motivational recap covering: total volume, sessions completed, any PRs hit, and one specific thing to focus on next week. Be direct and coach-like.`;
    await store.set("forge-weekly-summary-date", new Date().toISOString().split("T")[0]);
    sendChat(prompt);
  };

  const saveBodyweight = async (weight) => {
    const entry = { date: new Date().toISOString(), weight };
    const next = [entry, ...bodyweight];
    setBodyweight(next);
    await store.set("forge-bodyweight", next);
  };

  const repeatWorkout = (session) => {
    const plan = {
      name: session.name,
      exercises: session.exercises.map(ex => {
        const found = EXERCISES.find(e => e.name === ex.name);
        return {
          exerciseId: found?.id || ex.name,
          name: ex.name,
          sets: ex.sets.length || 3,
          targetReps: "10",
          restSecs: found?.rest || 90,
        };
      }),
    };
    startWorkout(plan);
  };

  const finishWorkout = async (w) => {
    const dur = Math.floor((Date.now() - w.startTime) / 1000);
    const session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name: w.name, duration: dur,
      exercises: w.exercises.map((ex, i) => ({
        exerciseId: ex.exerciseId,
        name: getEx(ex.exerciseId)?.name || ex.name || ex.exerciseId,
        sets: w.logged[i] || [],
      })),
    };
    const newHist = [session, ...history];
    setHistory(newHist);
    await store.set("forge-history", newHist);

    const nextPrs = { ...prs };
    const hitNames = new Set();
    session.exercises.forEach(ex => {
      const exId = ex.exerciseId || EXERCISES.find(e => e.name === ex.name)?.id;
      if (!exId) return;
      ex.sets.forEach(set => {
        const e1rm = epley1rm(set.wt, set.reps);
        const existing = nextPrs[exId];
        if (!existing || e1rm > (existing.best1rm || 0)) {
          nextPrs[exId] = { best1rm: e1rm, bestWeight: set.wt, bestReps: set.reps, date: session.date };
          hitNames.add(ex.name);
        }
      });
    });
    if (hitNames.size > 0) { setPrs(nextPrs); await store.set("forge-prs", nextPrs); }
    setNewPrs([...hitNames]);

    setLastSession(session);
    setActive(null);
    setScreen("summary");
  };

  // AI Coach
  const sendChat = async (override) => {
    const text = (typeof override === "string" && override) ? override : chatInput;
    if (!text.trim() || chatLoading) return;
    const userMsg = { role: "user", content: text };
    const msgs = [...chat, userMsg];
    setChat(msgs);
    if (!override) setChatInput("");
    setChatLoading(true);
    const exIds = EXERCISES.map(e => `${e.id}→${e.name}`).join(", ");

    const recentSessions = history.slice(0, 5).map(s => ({
      date: s.date.split("T")[0],
      name: s.name,
      duration: Math.floor(s.duration / 60),
      exercises: s.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.map(st => `${st.wt}lbs×${st.reps}`).join(", "),
      })),
    }));

    const prSummary = Object.entries(prs).map(([id, pr]) => {
      const ex = getEx(id);
      const level = getStrengthLevel(id, pr.best1rm);
      return `${ex.name}: best ${pr.bestWeight}lbs×${pr.bestReps} (e1RM ${pr.best1rm}lbs) — ${level.name}`;
    }).join("\n");

    const DAY = 86400000;
    const daysSinceLastSession = history.length
      ? Math.floor((Date.now() - new Date(history[0].date)) / DAY)
      : null;
    const last7Days = history.filter(s => (Date.now() - new Date(s.date)) / DAY <= 7).length;
    const musclesTrainedThisWeek = [...new Set(
      history
        .filter(s => (Date.now() - new Date(s.date)) / DAY <= 7)
        .flatMap(s => s.exercises.map(e => {
          const found = EXERCISES.find(ex => ex.name === e.name);
          return found?.cat || null;
        }))
        .filter(Boolean)
    )];
    const currentBw = bodyweight[0]?.weight;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          system: `You are CYBER, an elite AI fitness coach for a home gym dashboard. The user has a Mikolo Smith Machine Multi-Function Power Cage with dual cable system, vertical leg press, pull-up bar, and all standard attachments (rope, lat bar, v-bar, ankle strap, handles).

When creating a workout routine, return a JSON block labeled "workout" using this EXACT format:
\`\`\`workout
{"name":"Push Day A","exercises":[{"exerciseId":"smith-bench","name":"Smith Machine Bench Press","sets":4,"targetReps":"8-10","restSecs":90}]}
\`\`\`

If the user asks you to save the routine or add it to their templates, return a \`save-template\` block with the same shape (can be in addition to or instead of a \`workout\` block):
\`\`\`save-template
{"name":"Push Day A","exercises":[{"exerciseId":"smith-bench","name":"Smith Machine Bench Press","sets":4,"targetReps":"8-10","restSecs":90}]}
\`\`\`

Available exercise IDs: ${exIds}

targetReps should be a string like "8-10" or "12". Be direct, motivating, no fluff. The user is experienced.

The user's last 5 sessions:
${JSON.stringify(recentSessions, null, 2)}

Their current PRs and strength levels:
${prSummary || "No PRs recorded yet."}

Training frequency context:
- Days since last session: ${daysSinceLastSession ?? "unknown"}
- Sessions in last 7 days: ${last7Days}
- Muscle groups trained this week: ${musclesTrainedThisWeek.join(", ") || "none"}
- Current bodyweight: ${currentBw ? `${currentBw} lbs` : "not logged"}

If the user has trained 5+ days in a row or 6+ sessions in 7 days, proactively mention recovery. If a muscle group hasn't been trained in 5+ days and the user is asking for a routine, suggest it. Never ignore the frequency data.

Use this data to give personalized advice, call out progress, suggest progressive overload, and push them toward their next level milestone.`,
          messages: msgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "Error connecting.";
      const workoutMatch = text.match(/```workout\s*([\s\S]*?)```/);
      const templateMatch = text.match(/```save-template\s*([\s\S]*?)```/);
      let parsedPlan = null;
      let savedTemplateName = null;
      if (workoutMatch) { try { parsedPlan = JSON.parse(workoutMatch[1]); } catch {} }
      if (templateMatch) {
        try {
          const tpl = JSON.parse(templateMatch[1]);
          if (tpl?.name && Array.isArray(tpl.exercises)) {
            await saveTemplate(tpl);
            savedTemplateName = tpl.name;
          }
        } catch {}
      }
      setChat(c => [...c, { role: "assistant", content: text, parsedPlan, savedTemplateName }]);
    } catch {
      setChat(c => [...c, { role: "assistant", content: "Connection error." }]);
    }
    setChatLoading(false);
  };

  // ── GLOBAL CSS ─────────────────────────────────────────────────────────
  const gCss = `
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    :root{color-scheme:dark}
    html,body{background:${C.bg};min-height:100vh}
    ::-webkit-scrollbar{width:3px}
    ::-webkit-scrollbar-track{background:${C.bg}}
    ::-webkit-scrollbar-thumb{background:${C.pink};border-radius:2px}
    input,textarea,select{outline:none}
    button{display:flex;align-items:center;justify-content:center}
    .forge-root{min-height:100vh;background:${C.bg};color:${C.text};font-family:Rajdhani,sans-serif;display:flex;justify-content:center}
    .forge-main{display:flex;flex-direction:column;min-height:100vh;max-width:820px;width:100%;overflow:hidden}
    .forge-main.wide{max-width:1280px}
    .form-split{display:flex;gap:20px;padding:24px 20px;flex:1;overflow:hidden;min-height:0}
    .form-split > .form-inputs{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;overflow-y:auto;min-width:0}
    .form-split > .form-panel{flex:0 0 380px;display:flex;flex-direction:column;gap:14px;overflow-y:auto;padding-right:4px}
    @media (max-width:900px){.form-split{flex-direction:column;padding:16px 14px;gap:14px}.form-split > .form-panel{flex:0 0 auto}}
    @keyframes blink{0%,80%,100%{opacity:.15}40%{opacity:1}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scanline{0%{top:-20%}100%{top:120%}}
  `;

  const isActive = screen === "active";
  const isSummary = screen === "summary";

  return (
    <div className="forge-root">
      <style>{gCss}</style>

      <div className={`forge-main${isActive ? " wide" : ""}`}>
      {/* HEADER */}
      {!isActive && !isSummary && (
        <header style={{ background: "#0a0a0a", borderBottom: `1px solid ${C.border}`, padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,45,149,0.03) 2px, rgba(255,45,149,0.03) 4px)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/CyberGym-icon.png" alt="" style={{ height: 32, width: 32, objectFit: "contain", filter: "drop-shadow(0 0 6px rgba(255,45,149,0.4))" }} />
            <div style={{ fontFamily: "Orbitron, monospace", fontWeight: 900, letterSpacing: 4, display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ color: C.pink, fontSize: 20 }}>CYBER</span>
              <span style={{ color: C.faint, fontSize: 9, letterSpacing: 3 }}>GYM OS</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {screen !== "home" && (
              <button onClick={() => setScreen("home")} style={{ background: "transparent", border: "none", color: C.muted, fontFamily: "Rajdhani", fontSize: 13, letterSpacing: 1, cursor: "pointer" }}>← HOME</button>
            )}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
              style={{
                background: isFullscreen ? C.pink : "transparent",
                border: `1px solid ${isFullscreen ? C.pink : C.border2}`,
                color: isFullscreen ? "#fff" : C.muted,
                fontFamily: "Orbitron, monospace",
                fontSize: 10,
                letterSpacing: 2,
                padding: "7px 12px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {isFullscreen ? "⛶ EXIT" : "⛶ KIOSK"}
            </button>
          </div>
        </header>
      )}

      {/* CONTENT */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {screen === "home"    && <HomeScreen setScreen={setScreen} history={history} templates={templates} onLaunchTemplate={launchTemplate} onDeleteTemplate={deleteTemplate} />}
        {screen === "library" && <LibraryScreen startWorkout={startWorkout} lastWeights={lastWeights} onSaveTemplate={saveTemplate} />}
        {screen === "ai"      && <AIScreen messages={chat} loading={chatLoading} input={chatInput} setInput={setChatInput} onSend={sendChat} onStart={startWorkout} onWeeklyRecap={requestWeeklyRecap} historyLen={history.length} />}
        {screen === "history" && <HistoryScreen history={history} onRepeat={repeatWorkout} />}
        {screen === "progress" && <ProgressScreen prs={prs} bodyweight={bodyweight} onLogBodyweight={saveBodyweight} />}
        {screen === "active"  && active && <ActiveScreen workout={active} setWorkout={setActive} onLog={logSet} onFinish={() => { if (window.confirm("End workout early?")) finishWorkout(active); }} onSkip={skipExercise} onSub={subExercise} prs={prs} history={history} />}
        {screen === "summary" && lastSession && <SummaryScreen session={lastSession} newPrs={newPrs} onHome={() => setScreen("home")} />}
      </main>

      {/* BOTTOM NAV */}
      {!isActive && !isSummary && (
        <nav style={{ background: "#0a0a0a", borderTop: `1px solid ${C.border}`, display: "flex", flexShrink: 0 }}>
          {[
            { id: "home",    icon: "⌂", label: "HOME"      },
            { id: "library", icon: "◈", label: "EXERCISES"  },
            { id: "ai",      icon: "◉", label: "AI COACH"   },
            { id: "progress",icon: "▲", label: "PROGRESS"   },
            { id: "history", icon: "◷", label: "HISTORY"    },
          ].map(t => (
            <button key={t.id} onClick={() => setScreen(t.id)} style={{
              flex: 1, padding: "11px 4px", background: "transparent", border: "none",
              borderTop: screen === t.id ? `2px solid ${C.pink}` : "2px solid transparent",
              color: screen === t.id ? C.pink : "#606060",
              fontFamily: "Rajdhani", fontSize: 9, letterSpacing: 1.5, cursor: "pointer",
              flexDirection: "column", gap: 3,
            }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}
      </div>
    </div>
  );
}

// ── HOME SCREEN ────────────────────────────────────────────────────────────
function HomeScreen({ setScreen, history, templates = [], onLaunchTemplate, onDeleteTemplate }) {
  const today = new Date().toDateString();
  const todayCount = history.filter(h => new Date(h.date).toDateString() === today).length;
  const last = history[0];
  const streak = calcStreak(history);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ ...s.label, fontSize: 9 }}>
        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
      </div>

      {/* Main CTA */}
      <button onClick={() => setScreen("library")} style={{ background: "linear-gradient(140deg, #1a0515 0%, #2a0a28 100%)", border: `1px solid ${C.pink}`, borderRadius: 12, padding: "28px 20px", cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 80, color: C.pink, opacity: 0.08, fontFamily: "Orbitron", fontWeight: 900, letterSpacing: -5 }}>LIFT</div>
        <div style={{ fontFamily: "Orbitron, monospace", fontSize: 28, fontWeight: 900, color: C.pink, letterSpacing: 3, lineHeight: 1.1 }}>START<br />
          <span style={{ color: C.text }}>WORKOUT</span>
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 10, letterSpacing: 1 }}>BUILD FROM EXERCISE LIBRARY →</div>
      </button>

      {/* AI Route */}
      <button onClick={() => setScreen("ai")} style={{ ...s.card, border: `1px solid ${C.border2}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 16, textAlign: "left" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${C.pink}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: C.pink, flexShrink: 0, boxShadow: `0 0 18px rgba(255,45,149,0.3)` }}>◉</div>
        <div>
          <div style={{ fontFamily: "Orbitron", fontSize: 13, letterSpacing: 2, color: C.pink }}>CYBER AI COACH</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Generate a custom routine with AI</div>
        </div>
      </button>

      {/* Templates */}
      {templates.length > 0 && (
        <div>
          <div style={{ ...s.label, fontSize: 9, marginBottom: 8 }}>MY TEMPLATES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {templates.map(t => (
              <div key={t.id} onClick={() => onLaunchTemplate?.(t)} role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onLaunchTemplate?.(t); }}
                style={{ ...s.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{t.exercises.length} exercises</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: C.pink, fontSize: 18 }}>▶</span>
                  <button onClick={e => { e.stopPropagation(); if (window.confirm(`Delete template "${t.name}"?`)) onDeleteTemplate?.(t.id); }}
                    style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", fontSize: 18, padding: "4px 8px", lineHeight: 1 }}
                    title="Delete template">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { label: "SESSIONS", val: history.length },
          { label: "STREAK", val: streak > 0 ? `${streak}🔥` : "0" },
          { label: "TODAY", val: todayCount },
        ].map(stat => (
          <div key={stat.label} style={{ ...s.card, flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "Orbitron", fontSize: 26, fontWeight: 700, color: C.pink }}>{stat.val}</div>
            <div style={{ ...s.label, fontSize: 9, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Last workout */}
      {last && (
        <div style={{ ...s.card }}>
          <div style={{ ...s.label, fontSize: 9, marginBottom: 10 }}>LAST SESSION</div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{last.name}</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            {new Date(last.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ·{" "}
            {Math.floor(last.duration / 60)} min ·{" "}
            {last.exercises.reduce((a, e) => a + e.sets.length, 0)} sets
          </div>
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {last.exercises.map((e, i) => (
              <span key={i} style={{ background: "#1a1a1a", border: `1px solid ${C.border2}`, borderRadius: 4, padding: "3px 8px", fontSize: 12, color: C.muted }}>{e.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── LIBRARY SCREEN ─────────────────────────────────────────────────────────
function LibraryScreen({ startWorkout, lastWeights = {}, onSaveTemplate }) {
  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState([]);
  const [configMode, setConfigMode] = useState(false);
  const [name, setName] = useState("My Workout");
  const [cfg, setCfg] = useState({});
  const [detail, setDetail] = useState(null);
  const [saveTpl, setSaveTpl] = useState(false);

  const filtered = cat === "All" ? EXERCISES : EXERCISES.filter(e => e.cat === cat);
  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const updateCfg = (id, key, val) => {
    const base = cfg[id] || { sets: 3, targetReps: "10", restSecs: getEx(id).rest || 90 };
    setCfg(c => ({ ...c, [id]: { ...base, [key]: val } }));
  };
  const getCfg = (id) => cfg[id] || { sets: 3, targetReps: "10", restSecs: getEx(id).rest || 90 };

  const handleStart = () => {
    const exercises = selected.map(id => {
      const c = getCfg(id);
      return { exerciseId: id, name: getEx(id).name, sets: c.sets, targetReps: c.targetReps, restSecs: c.restSecs };
    });
    const plan = { name, exercises };
    if (saveTpl && onSaveTemplate) onSaveTemplate(plan);
    startWorkout(plan);
  };

  if (configMode && selected.length > 0) {
    return (
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setConfigMode(false)} style={{ background: "none", border: "none", color: C.muted, fontFamily: "Rajdhani", cursor: "pointer", fontSize: 14 }}>← BACK</button>
          <div style={{ ...s.label, color: C.pink }}>CONFIGURE WORKOUT</div>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} style={{ background: C.surf2, border: `1px solid ${C.border2}`, borderRadius: 8, padding: "12px 16px", color: C.text, fontFamily: "Orbitron", fontSize: 13, letterSpacing: 2, width: "100%" }} />
        <button
          onClick={() => setSaveTpl(v => !v)}
          style={{
            background: saveTpl ? C.pink : "transparent",
            border: `1px solid ${saveTpl ? C.pink : C.border2}`,
            color: saveTpl ? "#fff" : C.muted,
            fontFamily: "Rajdhani", fontSize: 12, letterSpacing: 2,
            padding: "8px 14px", borderRadius: 6, cursor: "pointer", alignSelf: "flex-start",
          }}
        >{saveTpl ? "✓ WILL SAVE AS TEMPLATE" : "SAVE AS TEMPLATE"}</button>
        {selected.map(id => {
          const ex = getEx(id);
          const c = getCfg(id);
          return (
            <div key={id} style={{ ...s.card }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{ex.name}</div>
                {ex.equip === "Smith Machine" && <PlateBreakdown weight={lastWeights[id] || 95} compact />}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ ...s.label, fontSize: 9, marginBottom: 8 }}>SETS</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => updateCfg(id, "sets", Math.max(1, c.sets - 1))} style={{ ...s.adjBig, width: 38, height: 38 }}>−</button>
                    <span style={{ fontFamily: "Orbitron", fontSize: 20, minWidth: 28, textAlign: "center" }}>{c.sets}</span>
                    <button onClick={() => updateCfg(id, "sets", c.sets + 1)} style={{ ...s.adjBig, width: 38, height: 38 }}>+</button>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...s.label, fontSize: 9, marginBottom: 8 }}>REPS</div>
                  <select value={c.targetReps} onChange={e => updateCfg(id, "targetReps", e.target.value)}
                    style={{ background: C.surf2, border: `1px solid ${C.border2}`, color: C.text, padding: "8px 6px", borderRadius: 6, fontFamily: "Rajdhani", fontSize: 14, width: "100%" }}>
                    {["5","6","8","10","12","15","20","6-8","8-10","10-12","12-15","15-20"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...s.label, fontSize: 9, marginBottom: 8 }}>REST</div>
                  <select value={c.restSecs} onChange={e => updateCfg(id, "restSecs", Number(e.target.value))}
                    style={{ background: C.surf2, border: `1px solid ${C.border2}`, color: C.text, padding: "8px 6px", borderRadius: 6, fontFamily: "Rajdhani", fontSize: 14, width: "100%" }}>
                    {[30,45,60,90,120,180].map(r => <option key={r} value={r}>{r}s</option>)}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
        <button onClick={handleStart} style={{ ...s.bigBtn, marginTop: 8 }}>▶ BEGIN WORKOUT</button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Category tabs */}
      <div style={{ display: "flex", overflowX: "auto", padding: "12px 16px", gap: 8, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            background: cat === c ? C.pink : C.surf, border: `1px solid ${cat === c ? C.pink : C.border2}`,
            borderRadius: 20, padding: "7px 15px", color: cat === c ? "#fff" : C.muted,
            fontFamily: "Rajdhani", fontSize: 13, letterSpacing: 1, cursor: "pointer",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>{c}</button>
        ))}
      </div>
      {/* Exercise list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px" }}>
        {filtered.map(ex => {
          const sel = selected.includes(ex.id);
          return (
            <button key={ex.id} onClick={() => toggle(ex.id)} style={{
              width: "100%", background: sel ? "#1a0515" : C.surf,
              border: `1px solid ${sel ? C.pink : C.border}`,
              borderRadius: 10, padding: "13px 16px", marginBottom: 8,
              textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${sel ? C.pink : C.faint}`, background: sel ? C.pink : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, flexShrink: 0 }}>
                {sel ? "✓" : ""}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{ex.name}</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{ex.equip} · {ex.type}</div>
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); setDetail(ex); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setDetail(ex); } }}
                style={{ color: C.muted, fontSize: 20, padding: "0 8px", cursor: "pointer", lineHeight: 1 }}
                title="Show form"
              >ⓘ</span>
              <div style={{ fontSize: 11, color: C.faint }}>{ex.rest}s rest</div>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <button onClick={() => setConfigMode(true)} style={{ ...s.bigBtn }}>
            CONFIGURE {selected.length} EXERCISE{selected.length !== 1 ? "S" : ""} →
          </button>
        </div>
      )}

      {detail && (
        <div onClick={() => setDetail(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.surf, border: `1px solid ${C.pink}`, borderRadius: 12, padding: 20, maxWidth: 460, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontFamily: "Orbitron", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{detail.name}</div>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 14 }}>{detail.cat} · {detail.equip} · {detail.type}</div>
            <div style={{ background: "#000", borderRadius: 8, minHeight: 100, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, padding: 10 }}>
              <ExerciseImage id={detail.id} style={{ maxWidth: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 6 }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDetail(null)} style={{ ...s.adjSm, flex: 1, padding: "10px 0", letterSpacing: 2 }}>CLOSE</button>
              <button
                onClick={() => { toggle(detail.id); setDetail(null); }}
                style={{ flex: 2, padding: "10px 0", fontFamily: "Orbitron", fontSize: 12, letterSpacing: 2, background: selected.includes(detail.id) ? C.surf2 : C.pink, border: `1px solid ${C.pink}`, color: "#fff", borderRadius: 6, cursor: "pointer" }}
              >
                {selected.includes(detail.id) ? "DESELECT" : "SELECT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ACTIVE WORKOUT SCREEN ──────────────────────────────────────────────────
function ActiveScreen({ workout: w, setWorkout, onLog, onFinish, onSkip, onSub, prs, history = [] }) {
  const [tick, setTick] = useState(0);
  const [subOpen, setSubOpen] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { setImgOpen(false); }, [w?.exIdx]);

  if (!w) return null;
  const ex = w.exercises[w.exIdx];
  const exInfo = getEx(ex?.exerciseId);
  const logged = w.logged[w.exIdx] || [];
  const lastSet = logged[logged.length - 1];
  const isLastSet = w.setIdx >= ex?.sets - 1;
  const isLastEx = w.exIdx >= w.exercises.length - 1;
  const overload = ex?.exerciseId && logged.length === 0
    ? getOverloadSuggestion(ex.exerciseId, w.wt, ex.targetReps, history)
    : { suggest: false };

  const adj = (key, delta, min = 0) => setWorkout(prev => ({ ...prev, [key]: Math.max(min, (prev[key] || 0) + delta) }));
  const elapsed = Math.floor((Date.now() - w.startTime) / 1000);
  const em = Math.floor(elapsed / 60), es = elapsed % 60;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "#0a0a0a", borderBottom: `1px solid ${C.border}`, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, gap: 10 }}>
        <div style={{ ...s.label, fontSize: 9, whiteSpace: "nowrap" }}>{em}:{String(es).padStart(2,"0")} ELAPSED</div>
        <div style={{ fontFamily: "Orbitron", fontSize: 11, color: C.pink, letterSpacing: 2, flex: 1, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name.toUpperCase()}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setSubOpen(true)} style={{ ...s.adjSm }}>SUB</button>
          <button onClick={onSkip} style={{ ...s.adjSm }}>SKIP</button>
          <button onClick={onFinish} style={{ background: "transparent", border: `1px solid ${C.border2}`, color: C.muted, padding: "5px 12px", fontFamily: "Rajdhani", fontSize: 12, cursor: "pointer", borderRadius: 4, letterSpacing: 1 }}>END</button>
        </div>
      </div>

      {/* Exercise progress */}
      <div style={{ display: "flex", height: 4, gap: 2, padding: "0 4px", background: "#0a0a0a", flexShrink: 0 }}>
        {w.exercises.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < w.exIdx ? C.pink : i === w.exIdx ? C.pinkBright : C.surf2, transition: "background 0.3s" }} />
        ))}
      </div>

      {/* Main content */}
      {w.resting ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", gap: 24, overflowY: "auto" }}>
          <div style={{ fontFamily: "Orbitron", fontSize: 10, letterSpacing: 4, color: C.muted }}>REST PERIOD</div>
          <CircularTimer seconds={w.restLeft} total={w.restTotal} onSkip={() => setWorkout(p => ({ ...p, resting: false, restLeft: 0 }))} />
          <div style={{ textAlign: "center", color: C.faint, fontSize: 13, letterSpacing: 1 }}>
            UP NEXT: <span style={{ color: C.muted }}>{isLastSet ? w.exercises[w.exIdx]?.name : exInfo?.name}</span>
          </div>
        </div>
      ) : (
        <div className="form-split">
          {/* LEFT: inputs */}
          <div className="form-inputs">
            {/* Exercise name + counter */}
            <div style={{ textAlign: "center", animation: "fadeUp 0.3s ease" }}>
              <div style={{ ...s.label, color: C.pink, fontSize: 10, marginBottom: 10 }}>
                EX {w.exIdx + 1}/{w.exercises.length}
              </div>
              <div style={{ fontFamily: "Orbitron", fontSize: 22, fontWeight: 700, lineHeight: 1.3, maxWidth: 320 }}>
                {exInfo?.name || ex.name}
              </div>
              {(() => {
                const pr = prs?.[ex.exerciseId];
                if (!pr) return null;
                const lvl = getStrengthLevel(ex.exerciseId, pr.best1rm);
                if (lvl.level === 0 && lvl.name === "UNRANKED") return null;
                return (
                  <div style={{ marginTop: 8, display: "inline-block", fontFamily: "Orbitron", fontSize: 10, letterSpacing: 2, color: "#fff", background: lvl.color, padding: "4px 10px", borderRadius: 12 }}>
                    {lvl.name}
                  </div>
                );
              })()}
              <div style={{ color: C.muted, fontSize: 13, marginTop: 8, letterSpacing: 1 }}>
                SET <span style={{ color: C.pink, fontFamily: "Orbitron" }}>{w.setIdx + 1}</span> of {ex.sets} · TARGET: {ex.targetReps} REPS
              </div>
            </div>

            {/* Last set ref */}
            {lastSet && (
              <div style={{ background: C.surf2, borderRadius: 8, padding: "8px 20px", border: `1px solid ${C.border}` }}>
                <div style={{ ...s.label, fontSize: 9, textAlign: "center", marginBottom: 4 }}>PREV SET</div>
                <div style={{ fontFamily: "Orbitron", fontSize: 16, color: C.muted, textAlign: "center" }}>{lastSet.wt} lbs × {lastSet.reps}</div>
              </div>
            )}

            {/* Weight + Reps */}
            <div style={{ display: "flex", gap: 32, justifyContent: "center", width: "100%", flexWrap: "wrap" }}>
              {/* Weight */}
              <div style={{ textAlign: "center" }}>
                <div style={{ ...s.label, fontSize: 9, marginBottom: 10 }}>WEIGHT (lbs)</div>
                {overload.suggest && (
                  <div style={{ color: C.success, fontSize: 11, fontFamily: "Orbitron", letterSpacing: 1, textAlign: "center", marginBottom: 6 }}>
                    ↑ TRY {overload.newWeight} LBS TODAY
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => adj("wt", -5)} style={s.adjBig}>−5</button>
                  <div style={{ fontFamily: "Orbitron", fontSize: 34, fontWeight: 700, color: C.pink, minWidth: 76, textAlign: "center" }}>{w.wt}</div>
                  <button onClick={() => adj("wt", 5)} style={s.adjBig}>+5</button>
                </div>
                <PlateBreakdown weight={w.wt} />
                <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center" }}>
                  <button onClick={() => adj("wt", -2.5)} style={s.adjSm}>−2.5</button>
                  <button onClick={() => adj("wt", 2.5)} style={s.adjSm}>+2.5</button>
                </div>
              </div>

              {/* Reps */}
              <div style={{ textAlign: "center" }}>
                <div style={{ ...s.label, fontSize: 9, marginBottom: 10 }}>REPS</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => adj("reps", -1, 1)} style={s.adjBig}>−</button>
                  <div style={{ fontFamily: "Orbitron", fontSize: 34, fontWeight: 700, color: C.pink, minWidth: 58, textAlign: "center" }}>{w.reps}</div>
                  <button onClick={() => adj("reps", 1)} style={s.adjBig}>+</button>
                </div>
              </div>
            </div>

            {/* Log button */}
            <button onClick={onLog} style={{ ...s.bigBtn, maxWidth: 360, fontSize: 20 }}>
              {isLastSet && isLastEx ? "✓  FINISH WORKOUT" : "✓  LOG SET"}
            </button>

            {/* Completed sets */}
            {logged.length > 0 && (
              <div style={{ width: "100%", maxWidth: 360 }}>
                <div style={{ ...s.label, fontSize: 9, marginBottom: 10, textAlign: "center" }}>COMPLETED SETS</div>
                {logged.map((set, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, color: C.muted, fontSize: 14 }}>
                    <span style={{ color: C.faint }}>Set {i + 1}</span>
                    <span>{set.wt} lbs × {set.reps} reps</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: form panel */}
          <div className="form-panel">
            <FormPanel
              exerciseId={ex.exerciseId}
              exerciseName={exInfo?.name || ex.name}
              onEnlarge={() => setImgOpen(true)}
            />
          </div>
        </div>
      )}

      {subOpen && (
        <SubstituteOverlay
          current={ex}
          existingIds={new Set(w.exercises.map(e => e.exerciseId))}
          onPick={(id) => { onSub(id); setSubOpen(false); }}
          onClose={() => setSubOpen(false)}
        />
      )}

      {imgOpen && (
        <div onClick={() => setImgOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 20 }}>
          <ExerciseImage id={ex.exerciseId} style={{ maxWidth: "95%", maxHeight: "85vh", borderRadius: 10 }} />
        </div>
      )}
    </div>
  );
}

// ── SUBSTITUTE OVERLAY ─────────────────────────────────────────────────────
function SubstituteOverlay({ current, existingIds, onPick, onClose }) {
  const currentInfo = getEx(current?.exerciseId);
  const options = EXERCISES.filter(e => e.cat === currentInfo.cat && !existingIds.has(e.id));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 50, display: "flex", flexDirection: "column", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ ...s.label, color: C.pink }}>SUBSTITUTE · {currentInfo.cat?.toUpperCase()}</div>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>Swap {currentInfo.name} for…</div>
        </div>
        <button onClick={onClose} style={{ ...s.adjSm, padding: "7px 16px" }}>CANCEL</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {options.length === 0 && (
          <div style={{ textAlign: "center", color: C.faint, paddingTop: 40 }}>No other {currentInfo.cat} exercises available.</div>
        )}
        {options.map(opt => (
          <button key={opt.id} onClick={() => onPick(opt.id)} style={{
            width: "100%", background: C.surf, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "13px 16px", marginBottom: 8,
            textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{opt.name}</div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{opt.equip} · {opt.type}</div>
            </div>
            <div style={{ fontSize: 11, color: C.faint }}>{opt.rest}s rest</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── AI COACH SCREEN ────────────────────────────────────────────────────────
function AIScreen({ messages, loading, input, setInput, onSend, onStart, onWeeklyRecap, historyLen = 0 }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } };

  // Monday auto-trigger: if today is Monday and we haven't generated a summary
  // this week (stored in forge-weekly-summary-date), fire the recap once.
  useEffect(() => {
    if (!onWeeklyRecap || historyLen === 0 || loading || messages.length > 0) return;
    const today = new Date();
    if (today.getDay() !== 1) return;
    store.get("forge-weekly-summary-date").then(stamp => {
      const todayStr = today.toISOString().split("T")[0];
      if (stamp === todayStr) return;
      onWeeklyRecap();
    });
  }, [onWeeklyRecap, historyLen]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "Orbitron", fontSize: 12, letterSpacing: 3, color: C.pink }}>CYBER AI COACH</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Ask for a routine · modify workouts · get coached</div>
        </div>
        {onWeeklyRecap && historyLen > 0 && (
          <button onClick={onWeeklyRecap} disabled={loading}
            style={{ background: "transparent", border: `1px solid ${C.border2}`, color: C.pink, fontFamily: "Orbitron", fontSize: 10, letterSpacing: 2, padding: "7px 12px", borderRadius: 6, cursor: loading ? "default" : "pointer", whiteSpace: "nowrap" }}>
            WEEKLY RECAP
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: C.faint, paddingTop: 60 }}>
            <div style={{ fontFamily: "Orbitron", fontSize: 48, color: C.border2 }}>◉</div>
            <div style={{ fontSize: 15, marginTop: 12 }}>CYBER is ready</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 6 }}>Try: "Give me a push/pull/legs split"</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>or: "Make me a leg day with 5 exercises"</div>
          </div>
        )}
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          const displayText = msg.content
            .replace(/```workout[\s\S]*?```/g, "")
            .replace(/```save-template[\s\S]*?```/g, "")
            .trim();
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: 16, animation: "fadeUp 0.25s ease" }}>
              {!isUser && <div style={{ ...s.label, color: C.pink, fontSize: 9, marginBottom: 5 }}>CYBER AI</div>}
              {displayText && (
                <div style={{ background: isUser ? "#1a0515" : C.surf, border: `1px solid ${isUser ? C.pink : C.border}`, borderRadius: 10, padding: "12px 16px", maxWidth: "88%", fontSize: 15, lineHeight: 1.65, color: isUser ? C.text : "#c8c8c8", whiteSpace: "pre-wrap" }}>
                  {displayText}
                </div>
              )}
              {msg.savedTemplateName && (
                <div style={{ marginTop: 8, color: C.success, fontSize: 12, fontFamily: "Orbitron", letterSpacing: 1 }}>
                  ✓ Saved as template: {msg.savedTemplateName}
                </div>
              )}
              {msg.parsedPlan && (
                <div style={{ marginTop: 8, background: "#0d0d0d", border: `1px solid ${C.pink}`, borderRadius: 10, padding: 16, maxWidth: "88%", width: "88%" }}>
                  <div style={{ fontFamily: "Orbitron", fontSize: 12, letterSpacing: 2, color: C.pink, marginBottom: 10 }}>{msg.parsedPlan.name}</div>
                  {msg.parsedPlan.exercises?.map((ex, j) => (
                    <div key={j} style={{ color: C.muted, fontSize: 13, padding: "5px 0", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
                      <span>{ex.name}</span>
                      <span style={{ color: C.faint }}>{ex.sets}×{ex.targetReps}</span>
                    </div>
                  ))}
                  <button onClick={() => onStart(msg.parsedPlan)} style={{ ...s.bigBtn, marginTop: 14, fontSize: 14, letterSpacing: 2, padding: "14px 0" }}>
                    ▶ START THIS WORKOUT
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div style={{ display: "flex", gap: 7, padding: "8px 0", alignItems: "center" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: C.pink, animation: `blink 1.2s ${i * 0.2}s infinite` }} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, flexShrink: 0, display: "flex", gap: 10 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Ask CYBER..." rows={2}
          style={{ flex: 1, background: C.surf, border: `1px solid ${C.border2}`, borderRadius: 10, padding: "10px 14px", color: C.text, fontFamily: "Rajdhani", fontSize: 15, resize: "none" }} />
        <button onClick={onSend} disabled={loading} style={{ background: loading ? C.surf2 : C.pink, border: "none", borderRadius: 10, width: 52, cursor: loading ? "default" : "pointer", color: "#fff", fontSize: 22 }}>▶</button>
      </div>
    </div>
  );
}

// ── BODYWEIGHT CHART ───────────────────────────────────────────────────────
function BodyweightChart({ data }) {
  if (data.length < 2) return null;
  const weights = data.map(d => d.weight);
  const minW = Math.min(...weights) - 5;
  const maxW = Math.max(...weights) + 5;
  const W = 320, H = 100, pad = 20;
  const xStep = (W - pad * 2) / (data.length - 1);
  const yScale = (w) => H - pad - ((w - minW) / (maxW - minW)) * (H - pad * 2);
  const points = data.map((d, i) => [pad + i * xStep, yScale(d.weight)]);
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: H, overflow: "visible" }}>
      <path d={pathD} fill="none" stroke={C.pink} strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={C.pink} />
      ))}
    </svg>
  );
}

function BodyweightSection({ bodyweight, onLog }) {
  const last = bodyweight[0];
  const [val, setVal] = useState(last?.weight ? String(last.weight) : "");
  useEffect(() => { if (last?.weight) setVal(String(last.weight)); }, [last?.weight]);
  const submit = () => {
    const n = parseFloat(val);
    if (!isFinite(n) || n <= 0) return;
    onLog(n);
  };
  const chartData = bodyweight.slice(0, 12).reverse();
  return (
    <div style={{ ...s.card, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <div style={{ ...s.label, fontSize: 9 }}>BODYWEIGHT</div>
        {last && <div style={{ color: C.muted, fontSize: 11 }}>last: {new Date(last.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <input
          type="number" inputMode="decimal" step="0.1"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") submit(); }}
          placeholder="lbs"
          style={{ flex: 1, background: C.surf2, border: `1px solid ${C.border2}`, borderRadius: 6, padding: "9px 12px", color: C.text, fontFamily: "Orbitron", fontSize: 15 }}
        />
        <button onClick={submit} style={{ background: C.pink, border: "none", borderRadius: 6, padding: "9px 18px", color: "#fff", fontFamily: "Orbitron", fontSize: 12, letterSpacing: 2, cursor: "pointer" }}>LOG</button>
      </div>
      {bodyweight.length >= 2 ? (
        <BodyweightChart data={chartData} />
      ) : (
        <div style={{ color: C.faint, fontSize: 12, textAlign: "center", padding: "8px 0" }}>
          {bodyweight.length === 1 ? "Log more entries to see chart" : "No bodyweight logged yet"}
        </div>
      )}
    </div>
  );
}

// ── PROGRESS SCREEN ────────────────────────────────────────────────────────
function ProgressScreen({ prs, bodyweight = [], onLogBodyweight }) {
  const tracked = EXERCISES.filter(e => prs[e.id]);
  const levelCounts = [0, 0, 0, 0, 0, 0]; // index 0 = unranked/beginner
  const eliteList = [];
  tracked.forEach(e => {
    const lvl = getStrengthLevel(e.id, prs[e.id].best1rm);
    levelCounts[lvl.level] += 1;
    if (lvl.level === 5) eliteList.push({ ex: e, pr: prs[e.id], lvl });
  });

  const byCat = {};
  EXERCISES.forEach(e => {
    (byCat[e.cat] = byCat[e.cat] || []).push(e);
  });

  if (tracked.length === 0) {
    return (
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        <BodyweightSection bodyweight={bodyweight} onLog={onLogBodyweight} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: C.faint, gap: 12, padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontFamily: "Orbitron", fontSize: 48 }}>▲</div>
          <div>No PRs yet — log a workout to start tracking strength levels.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
      <BodyweightSection bodyweight={bodyweight} onLog={onLogBodyweight} />

      {/* Summary */}
      <div style={{ ...s.card, marginBottom: 16 }}>
        <div style={{ ...s.label, fontSize: 9, marginBottom: 10 }}>STRENGTH OVERVIEW</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>{tracked.length} of {EXERCISES.length} exercises tracked</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {LEVEL_NAMES.map((nm, i) => (
            <div key={nm} style={{ flex: "1 1 auto", minWidth: 80, textAlign: "center", background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 4px" }}>
              <div style={{ fontFamily: "Orbitron", fontSize: 16, fontWeight: 700, color: LEVEL_COLORS[i] }}>{levelCounts[i + 1] || 0}</div>
              <div style={{ ...s.label, fontSize: 8, marginTop: 2 }}>{nm}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Elite board */}
      {eliteList.length > 0 && (
        <div style={{ ...s.card, marginBottom: 16, borderColor: C.pink }}>
          <div style={{ ...s.label, color: C.pink, marginBottom: 10 }}>ELITE BOARD</div>
          {eliteList.map(({ ex, pr }) => (
            <div key={ex.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 14 }}>
              <span>{ex.name}</span>
              <span style={{ color: C.pink, fontFamily: "Orbitron", fontSize: 13 }}>{pr.best1rm} lbs e1RM</span>
            </div>
          ))}
        </div>
      )}

      {/* All-time records */}
      <div style={{ ...s.card, marginBottom: 18 }}>
        <div style={{ ...s.label, color: C.pink, marginBottom: 10 }}>ALL-TIME RECORDS</div>
        {[...tracked]
          .sort((a, b) => new Date(prs[b.id].date) - new Date(prs[a.id].date))
          .map(ex => {
            const pr = prs[ex.id];
            return (
              <div key={ex.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0", borderBottom: `1px solid ${C.border}`, gap: 10 }}>
                <span style={{ fontSize: 14 }}>⚡ {ex.name}</span>
                <span style={{ color: C.muted, fontSize: 12, whiteSpace: "nowrap" }}>
                  <span style={{ color: C.text, fontFamily: "Orbitron" }}>{pr.bestWeight} × {pr.bestReps}</span>
                  {" "}· {new Date(pr.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            );
          })}
      </div>

      {/* Per-category lists */}
      {CATS.filter(c => c !== "All").map(cat => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <div style={{ ...s.label, fontSize: 10, marginBottom: 8, color: C.pink }}>{cat.toUpperCase()}</div>
          {byCat[cat]?.map(ex => {
            const pr = prs[ex.id];
            if (!pr) {
              return (
                <div key={ex.id} style={{ ...s.card, marginBottom: 6, opacity: 0.5 }}>
                  <div style={{ fontSize: 14 }}>{ex.name}</div>
                  <div style={{ color: C.faint, fontSize: 11, marginTop: 4 }}>No data yet</div>
                </div>
              );
            }
            const lvl = getStrengthLevel(ex.id, pr.best1rm);
            const noThresholds = !STRENGTH_LEVELS[ex.id] || STRENGTH_LEVELS[ex.id].every(v => v === 0);
            return (
              <div key={ex.id} style={{ ...s.card, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{ex.name}</div>
                  {!noThresholds && (
                    <div style={{ fontFamily: "Orbitron", fontSize: 9, letterSpacing: 2, color: "#fff", background: lvl.color, padding: "3px 8px", borderRadius: 10 }}>{lvl.name}</div>
                  )}
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: noThresholds ? 0 : 8 }}>
                  Best: {pr.bestWeight} lbs × {pr.bestReps} · <span style={{ color: C.pink }}>e1RM: {pr.best1rm} lbs</span>
                </div>
                {!noThresholds && lvl.nextTarget && (
                  <>
                    <div style={{ background: C.surf2, borderRadius: 4, height: 6, overflow: "hidden", marginBottom: 6 }}>
                      <div style={{ width: `${lvl.pctToNext}%`, height: "100%", background: lvl.color, transition: "width 0.3s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: C.faint, letterSpacing: 1 }}>
                      {lvl.pctToNext}% → {lvl.level < 5 ? LEVEL_NAMES[lvl.level] : "MAX"} ({lvl.nextTarget} lbs · +{lvl.nextTarget - pr.best1rm} to go)
                    </div>
                  </>
                )}
                {!noThresholds && !lvl.nextTarget && (
                  <div style={{ fontSize: 11, color: C.pink, letterSpacing: 1 }}>MAX TIER REACHED</div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── HISTORY SCREEN ─────────────────────────────────────────────────────────
function HistoryScreen({ history, onRepeat }) {
  const [expanded, setExpanded] = useState(null);
  if (!history.length) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: C.faint, gap: 12 }}>
      <div style={{ fontFamily: "Orbitron", fontSize: 48 }}>◷</div>
      <div>No sessions logged yet</div>
    </div>
  );

  const totalVol = (s) => s.exercises.reduce((a, e) => a + e.sets.reduce((b, st) => b + (st.wt * st.reps), 0), 0);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
      <div style={{ ...s.label, fontSize: 9, marginBottom: 16 }}>{history.length} SESSIONS LOGGED</div>
      {history.map(w => (
        <div key={w.id} style={{ marginBottom: 10 }}>
          <button onClick={() => setExpanded(expanded === w.id ? null : w.id)} style={{ width: "100%", ...s.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{w.name}</div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>
                {new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {Math.floor(w.duration / 60)}min · {w.exercises.reduce((a, e) => a + e.sets.length, 0)} sets · {totalVol(w).toLocaleString()} lbs vol
              </div>
            </div>
            <span style={{ color: C.pink, fontSize: 14 }}>{expanded === w.id ? "▲" : "▼"}</span>
          </button>
          {expanded === w.id && (
            <div style={{ background: "#0d0d0d", border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: 16 }}>
              {w.exercises.map((ex, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "Orbitron", fontSize: 11, letterSpacing: 2, color: C.pink, marginBottom: 6 }}>{ex.name}</div>
                  {ex.sets.map((st, j) => (
                    <div key={j} style={{ color: C.muted, fontSize: 13, padding: "3px 0", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: C.faint }}>Set {j + 1}</span>
                      <span>{st.wt} lbs × {st.reps} reps</span>
                    </div>
                  ))}
                </div>
              ))}
              {onRepeat && (
                <button onClick={() => onRepeat(w)} style={{ ...s.adjSm, letterSpacing: 1, marginTop: 6, padding: "8px 18px", borderColor: C.pink, color: C.pink }}>▶ REPEAT</button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── SUMMARY SCREEN ─────────────────────────────────────────────────────────
function SummaryScreen({ session, newPrs = [], onHome }) {
  const totalSets = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const totalVol = session.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + s.wt * s.reps, 0), 0);
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
      {newPrs.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #1a0515, #2a0a28)",
          border: `1px solid ${C.pink}`,
          borderRadius: 10, padding: "16px 20px", textAlign: "center",
          boxShadow: `0 0 40px rgba(255,45,149,0.3)`,
          width: "100%",
        }}>
          <div style={{ fontFamily: "Orbitron", fontSize: 22, color: C.pink, letterSpacing: 3 }}>
            ⚡ NEW PR{newPrs.length > 1 ? "s" : ""}
          </div>
          {newPrs.map((name, i) => (
            <div key={i} style={{ color: C.text, fontSize: 14, marginTop: 6 }}>{name}</div>
          ))}
        </div>
      )}
      <div style={{ ...s.label, color: C.pink, letterSpacing: 6 }}>WORKOUT COMPLETE</div>
      <div style={{ fontFamily: "Orbitron", fontSize: 26, fontWeight: 900, textAlign: "center" }}>{session.name}</div>
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        {[
          { l: "DURATION", v: `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` },
          { l: "SETS", v: totalSets },
          { l: "VOLUME", v: `${totalVol.toLocaleString()}` },
        ].map(stat => (
          <div key={stat.l} style={{ flex: 1, ...s.card, textAlign: "center" }}>
            <div style={{ fontFamily: "Orbitron", fontSize: stat.l === "VOLUME" ? 16 : 22, fontWeight: 700, color: C.pink }}>{stat.v}</div>
            <div style={{ ...s.label, fontSize: 9, marginTop: 4 }}>{stat.l}{stat.l === "VOLUME" ? " (lbs)" : ""}</div>
          </div>
        ))}
      </div>
      {session.exercises.map((ex, i) => (
        <div key={i} style={{ ...s.card, width: "100%" }}>
          <div style={{ fontFamily: "Orbitron", fontSize: 11, letterSpacing: 2, color: C.pink, marginBottom: 10 }}>{ex.name}</div>
          {ex.sets.map((st, j) => (
            <div key={j} style={{ display: "flex", justifyContent: "space-between", color: C.muted, fontSize: 14, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.faint }}>Set {j + 1}</span>
              <span>{st.wt} lbs × {st.reps} reps</span>
            </div>
          ))}
        </div>
      ))}
      <button onClick={onHome} style={{ ...s.bigBtn }}>← BACK TO HOME</button>
    </div>
  );
}

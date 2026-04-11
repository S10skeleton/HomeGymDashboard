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
  red: "#cc1111", redBright: "#ff2222", redDim: "#66080888",
  text: "#e8e8e8", muted: "#666", faint: "#333",
  success: "#22cc66",
};

const s = {
  bigBtn: { background: C.red, border: "none", borderRadius: 12, padding: "20px 0", color: "#fff", fontFamily: "Orbitron, monospace", fontSize: 17, letterSpacing: 3, cursor: "pointer", width: "100%", boxShadow: "0 0 32px rgba(204,17,17,0.35)", transition: "box-shadow 0.15s" },
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
            stroke={urgent ? C.redBright : C.red} strokeWidth="9"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "Orbitron, monospace", fontSize: 32, fontWeight: 700, color: urgent ? C.redBright : C.text, letterSpacing: 2 }}>
            {m}:{String(sec).padStart(2, "0")}
          </div>
          <div style={{ ...s.label, fontSize: 9, marginTop: 4 }}>REST</div>
        </div>
      </div>
      <button onClick={onSkip} style={{ ...s.adjSm, padding: "10px 28px", letterSpacing: 1 }}>SKIP REST</button>
    </div>
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
  const timerRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = FONT_LINK;
    document.head.appendChild(link);
    store.get("forge-history").then(h => h && setHistory(h));
  }, []);

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
    setActive({
      ...plan,
      startTime: Date.now(),
      exIdx: 0, setIdx: 0,
      logged: plan.exercises.map(() => []),
      resting: false, restLeft: 0, restTotal: 0,
      wt: 95, reps: 10,
    });
    setScreen("active");
  };

  const logSet = () => {
    const w = active;
    const ex = w.exercises[w.exIdx];
    const newLogged = w.logged.map((s, i) => i === w.exIdx ? [...s, { wt: w.wt, reps: w.reps }] : s);
    const lastSet = w.setIdx >= ex.sets - 1;
    const lastEx = w.exIdx >= w.exercises.length - 1;

    if (lastSet && lastEx) { finishWorkout({ ...w, logged: newLogged }); return; }

    const rest = ex.restSecs || 90;
    if (lastSet) {
      const nextEx = w.exercises[w.exIdx + 1];
      const nextReps = parseInt(nextEx?.targetReps) || 10;
      setActive({ ...w, logged: newLogged, exIdx: w.exIdx + 1, setIdx: 0, resting: true, restLeft: rest, restTotal: rest, wt: 95, reps: nextReps });
    } else {
      setActive({ ...w, logged: newLogged, setIdx: w.setIdx + 1, resting: true, restLeft: rest, restTotal: rest });
    }
  };

  const finishWorkout = async (w) => {
    const dur = Math.floor((Date.now() - w.startTime) / 1000);
    const session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name: w.name, duration: dur,
      exercises: w.exercises.map((ex, i) => ({
        name: getEx(ex.exerciseId)?.name || ex.name || ex.exerciseId,
        sets: w.logged[i] || [],
      })),
    };
    const newHist = [session, ...history];
    setHistory(newHist);
    await store.set("forge-history", newHist);
    setLastSession(session);
    setActive(null);
    setScreen("summary");
  };

  // AI Coach
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput };
    const msgs = [...chat, userMsg];
    setChat(msgs);
    setChatInput("");
    setChatLoading(true);
    const exIds = EXERCISES.map(e => `${e.id}→${e.name}`).join(", ");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          system: `You are FORGE, an elite AI fitness coach for a home gym dashboard. The user has a Mikolo Smith Machine Multi-Function Power Cage with dual cable system, vertical leg press, pull-up bar, and all standard attachments (rope, lat bar, v-bar, ankle strap, handles).

When creating a workout routine, return a JSON block labeled "workout" using this EXACT format:
\`\`\`workout
{"name":"Push Day A","exercises":[{"exerciseId":"smith-bench","name":"Smith Machine Bench Press","sets":4,"targetReps":"8-10","restSecs":90}]}
\`\`\`

Available exercise IDs: ${exIds}

targetReps should be a string like "8-10" or "12". Be direct, motivating, no fluff. The user is experienced.`,
          messages: msgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "Error connecting.";
      const workoutMatch = text.match(/```workout\s*([\s\S]*?)```/);
      let parsedPlan = null;
      if (workoutMatch) { try { parsedPlan = JSON.parse(workoutMatch[1]); } catch {} }
      setChat(c => [...c, { role: "assistant", content: text, parsedPlan }]);
    } catch {
      setChat(c => [...c, { role: "assistant", content: "Connection error." }]);
    }
    setChatLoading(false);
  };

  // ── GLOBAL CSS ─────────────────────────────────────────────────────────
  const gCss = `
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    :root{color-scheme:dark}
    ::-webkit-scrollbar{width:3px}
    ::-webkit-scrollbar-track{background:${C.bg}}
    ::-webkit-scrollbar-thumb{background:${C.red};border-radius:2px}
    input,textarea,select{outline:none}
    button{display:flex;align-items:center;justify-content:center}
    @keyframes blink{0%,80%,100%{opacity:.15}40%{opacity:1}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scanline{0%{top:-20%}100%{top:120%}}
  `;

  const isActive = screen === "active";
  const isSummary = screen === "summary";

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Rajdhani, sans-serif", color: C.text, display: "flex", flexDirection: "column", maxWidth: 600, margin: "0 auto" }}>
      <style>{gCss}</style>

      {/* HEADER */}
      {!isActive && !isSummary && (
        <header style={{ background: "#0a0a0a", borderBottom: `1px solid ${C.border}`, padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(204,17,17,0.02) 2px, rgba(204,17,17,0.02) 4px)", pointerEvents: "none" }} />
          <div style={{ fontFamily: "Orbitron, monospace", fontWeight: 900, letterSpacing: 4, display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ color: C.red, fontSize: 20 }}>FORGE</span>
            <span style={{ color: C.faint, fontSize: 9, letterSpacing: 3 }}>GYM OS</span>
          </div>
          {screen !== "home" && (
            <button onClick={() => setScreen("home")} style={{ background: "transparent", border: "none", color: C.muted, fontFamily: "Rajdhani", fontSize: 13, letterSpacing: 1, cursor: "pointer" }}>← HOME</button>
          )}
        </header>
      )}

      {/* CONTENT */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {screen === "home"    && <HomeScreen setScreen={setScreen} history={history} />}
        {screen === "library" && <LibraryScreen startWorkout={startWorkout} />}
        {screen === "ai"      && <AIScreen messages={chat} loading={chatLoading} input={chatInput} setInput={setChatInput} onSend={sendChat} onStart={startWorkout} />}
        {screen === "history" && <HistoryScreen history={history} />}
        {screen === "active"  && active && <ActiveScreen workout={active} setWorkout={setActive} onLog={logSet} onFinish={() => { if (window.confirm("End workout early?")) finishWorkout(active); }} />}
        {screen === "summary" && lastSession && <SummaryScreen session={lastSession} onHome={() => setScreen("home")} />}
      </main>

      {/* BOTTOM NAV */}
      {!isActive && !isSummary && (
        <nav style={{ background: "#0a0a0a", borderTop: `1px solid ${C.border}`, display: "flex", flexShrink: 0 }}>
          {[
            { id: "home",    icon: "⌂", label: "HOME"      },
            { id: "library", icon: "◈", label: "EXERCISES"  },
            { id: "ai",      icon: "◉", label: "AI FORGE"   },
            { id: "history", icon: "◷", label: "HISTORY"    },
          ].map(t => (
            <button key={t.id} onClick={() => setScreen(t.id)} style={{
              flex: 1, padding: "11px 4px", background: "transparent", border: "none",
              borderTop: screen === t.id ? `2px solid ${C.red}` : "2px solid transparent",
              color: screen === t.id ? C.red : "#3a3a3a",
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
  );
}

// ── HOME SCREEN ────────────────────────────────────────────────────────────
function HomeScreen({ setScreen, history }) {
  const today = new Date().toDateString();
  const todayCount = history.filter(h => new Date(h.date).toDateString() === today).length;
  const last = history[0];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ ...s.label, fontSize: 9 }}>
        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
      </div>

      {/* Main CTA */}
      <button onClick={() => setScreen("library")} style={{ background: "linear-gradient(140deg, #1a0505 0%, #250808 100%)", border: `1px solid ${C.red}`, borderRadius: 12, padding: "28px 20px", cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 80, color: C.red, opacity: 0.08, fontFamily: "Orbitron", fontWeight: 900, letterSpacing: -5 }}>LIFT</div>
        <div style={{ fontFamily: "Orbitron, monospace", fontSize: 28, fontWeight: 900, color: C.red, letterSpacing: 3, lineHeight: 1.1 }}>START<br />
          <span style={{ color: C.text }}>WORKOUT</span>
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 10, letterSpacing: 1 }}>BUILD FROM EXERCISE LIBRARY →</div>
      </button>

      {/* AI Route */}
      <button onClick={() => setScreen("ai")} style={{ ...s.card, border: `1px solid ${C.border2}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 16, textAlign: "left" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${C.red}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: C.red, flexShrink: 0, boxShadow: `0 0 18px rgba(204,17,17,0.3)` }}>◉</div>
        <div>
          <div style={{ fontFamily: "Orbitron", fontSize: 13, letterSpacing: 2, color: C.red }}>FORGE AI COACH</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Generate a custom routine with AI</div>
        </div>
      </button>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { label: "TOTAL SESSIONS", val: history.length },
          { label: "TODAY", val: todayCount },
        ].map(stat => (
          <div key={stat.label} style={{ ...s.card, flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "Orbitron", fontSize: 26, fontWeight: 700, color: C.red }}>{stat.val}</div>
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
function LibraryScreen({ startWorkout }) {
  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState([]);
  const [configMode, setConfigMode] = useState(false);
  const [name, setName] = useState("My Workout");
  const [cfg, setCfg] = useState({});

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
    startWorkout({ name, exercises });
  };

  if (configMode && selected.length > 0) {
    return (
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setConfigMode(false)} style={{ background: "none", border: "none", color: C.muted, fontFamily: "Rajdhani", cursor: "pointer", fontSize: 14 }}>← BACK</button>
          <div style={{ ...s.label, color: C.red }}>CONFIGURE WORKOUT</div>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} style={{ background: C.surf2, border: `1px solid ${C.border2}`, borderRadius: 8, padding: "12px 16px", color: C.text, fontFamily: "Orbitron", fontSize: 13, letterSpacing: 2, width: "100%" }} />
        {selected.map(id => {
          const ex = getEx(id);
          const c = getCfg(id);
          return (
            <div key={id} style={{ ...s.card }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>{ex.name}</div>
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
            background: cat === c ? C.red : C.surf, border: `1px solid ${cat === c ? C.red : C.border2}`,
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
              width: "100%", background: sel ? "#1a0505" : C.surf,
              border: `1px solid ${sel ? C.red : C.border}`,
              borderRadius: 10, padding: "13px 16px", marginBottom: 8,
              textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${sel ? C.red : C.faint}`, background: sel ? C.red : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, flexShrink: 0 }}>
                {sel ? "✓" : ""}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{ex.name}</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{ex.equip} · {ex.type}</div>
              </div>
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
    </div>
  );
}

// ── ACTIVE WORKOUT SCREEN ──────────────────────────────────────────────────
function ActiveScreen({ workout: w, setWorkout, onLog, onFinish }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!w) return null;
  const ex = w.exercises[w.exIdx];
  const exInfo = getEx(ex?.exerciseId);
  const logged = w.logged[w.exIdx] || [];
  const lastSet = logged[logged.length - 1];
  const isLastSet = w.setIdx >= ex?.sets - 1;
  const isLastEx = w.exIdx >= w.exercises.length - 1;

  const adj = (key, delta, min = 0) => setWorkout(prev => ({ ...prev, [key]: Math.max(min, (prev[key] || 0) + delta) }));
  const elapsed = Math.floor((Date.now() - w.startTime) / 1000);
  const em = Math.floor(elapsed / 60), es = elapsed % 60;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "#0a0a0a", borderBottom: `1px solid ${C.border}`, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ ...s.label, fontSize: 9 }}>{em}:{String(es).padStart(2,"0")} ELAPSED</div>
        <div style={{ fontFamily: "Orbitron", fontSize: 11, color: C.red, letterSpacing: 2 }}>{w.name.toUpperCase()}</div>
        <button onClick={onFinish} style={{ background: "transparent", border: `1px solid ${C.border2}`, color: C.muted, padding: "5px 12px", fontFamily: "Rajdhani", fontSize: 12, cursor: "pointer", borderRadius: 4, letterSpacing: 1 }}>END</button>
      </div>

      {/* Exercise progress */}
      <div style={{ display: "flex", height: 4, gap: 2, padding: "0 4px", background: "#0a0a0a", flexShrink: 0 }}>
        {w.exercises.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < w.exIdx ? C.red : i === w.exIdx ? "#ff4444" : C.surf2, transition: "background 0.3s" }} />
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", gap: 24, overflowY: "auto" }}>
        {w.resting ? (
          <>
            <div style={{ fontFamily: "Orbitron", fontSize: 10, letterSpacing: 4, color: C.muted }}>REST PERIOD</div>
            <CircularTimer seconds={w.restLeft} total={w.restTotal} onSkip={() => setWorkout(p => ({ ...p, resting: false, restLeft: 0 }))} />
            <div style={{ textAlign: "center", color: C.faint, fontSize: 13, letterSpacing: 1 }}>
              UP NEXT: <span style={{ color: C.muted }}>{isLastSet ? w.exercises[w.exIdx]?.name : exInfo?.name}</span>
            </div>
          </>
        ) : (
          <>
            {/* Exercise name + counter */}
            <div style={{ textAlign: "center", animation: "fadeUp 0.3s ease" }}>
              <div style={{ ...s.label, color: C.red, fontSize: 10, marginBottom: 10 }}>
                EX {w.exIdx + 1}/{w.exercises.length}
              </div>
              <div style={{ fontFamily: "Orbitron", fontSize: 22, fontWeight: 700, lineHeight: 1.3, maxWidth: 320 }}>
                {exInfo?.name || ex.name}
              </div>
              <div style={{ color: C.muted, fontSize: 13, marginTop: 8, letterSpacing: 1 }}>
                SET <span style={{ color: C.red, fontFamily: "Orbitron" }}>{w.setIdx + 1}</span> of {ex.sets} · TARGET: {ex.targetReps} REPS
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
            <div style={{ display: "flex", gap: 32, justifyContent: "center", width: "100%" }}>
              {/* Weight */}
              <div style={{ textAlign: "center" }}>
                <div style={{ ...s.label, fontSize: 9, marginBottom: 10 }}>WEIGHT (lbs)</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => adj("wt", -5)} style={s.adjBig}>−5</button>
                  <div style={{ fontFamily: "Orbitron", fontSize: 34, fontWeight: 700, color: C.red, minWidth: 76, textAlign: "center" }}>{w.wt}</div>
                  <button onClick={() => adj("wt", 5)} style={s.adjBig}>+5</button>
                </div>
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
                  <div style={{ fontFamily: "Orbitron", fontSize: 34, fontWeight: 700, color: C.red, minWidth: 58, textAlign: "center" }}>{w.reps}</div>
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
          </>
        )}
      </div>
    </div>
  );
}

// ── AI COACH SCREEN ────────────────────────────────────────────────────────
function AIScreen({ messages, loading, input, setInput, onSend, onStart }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontFamily: "Orbitron", fontSize: 12, letterSpacing: 3, color: C.red }}>FORGE AI COACH</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Ask for a routine · modify workouts · get coached</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: C.faint, paddingTop: 60 }}>
            <div style={{ fontFamily: "Orbitron", fontSize: 48, color: C.border2 }}>◉</div>
            <div style={{ fontSize: 15, marginTop: 12 }}>FORGE is ready</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 6 }}>Try: "Give me a push/pull/legs split"</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>or: "Make me a leg day with 5 exercises"</div>
          </div>
        )}
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          const displayText = msg.content.replace(/```workout[\s\S]*?```/g, "").trim();
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: 16, animation: "fadeUp 0.25s ease" }}>
              {!isUser && <div style={{ ...s.label, color: C.red, fontSize: 9, marginBottom: 5 }}>FORGE AI</div>}
              {displayText && (
                <div style={{ background: isUser ? "#1a0505" : C.surf, border: `1px solid ${isUser ? C.red : C.border}`, borderRadius: 10, padding: "12px 16px", maxWidth: "88%", fontSize: 15, lineHeight: 1.65, color: isUser ? C.text : "#c8c8c8", whiteSpace: "pre-wrap" }}>
                  {displayText}
                </div>
              )}
              {msg.parsedPlan && (
                <div style={{ marginTop: 8, background: "#0d0d0d", border: `1px solid ${C.red}`, borderRadius: 10, padding: 16, maxWidth: "88%", width: "88%" }}>
                  <div style={{ fontFamily: "Orbitron", fontSize: 12, letterSpacing: 2, color: C.red, marginBottom: 10 }}>{msg.parsedPlan.name}</div>
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
            {[0,1,2].map(i => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: C.red, animation: `blink 1.2s ${i * 0.2}s infinite` }} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, flexShrink: 0, display: "flex", gap: 10 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Ask FORGE..." rows={2}
          style={{ flex: 1, background: C.surf, border: `1px solid ${C.border2}`, borderRadius: 10, padding: "10px 14px", color: C.text, fontFamily: "Rajdhani", fontSize: 15, resize: "none" }} />
        <button onClick={onSend} disabled={loading} style={{ background: loading ? C.surf2 : C.red, border: "none", borderRadius: 10, width: 52, cursor: loading ? "default" : "pointer", color: "#fff", fontSize: 22 }}>▶</button>
      </div>
    </div>
  );
}

// ── HISTORY SCREEN ─────────────────────────────────────────────────────────
function HistoryScreen({ history }) {
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
            <span style={{ color: C.red, fontSize: 14 }}>{expanded === w.id ? "▲" : "▼"}</span>
          </button>
          {expanded === w.id && (
            <div style={{ background: "#0d0d0d", border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: 16 }}>
              {w.exercises.map((ex, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "Orbitron", fontSize: 11, letterSpacing: 2, color: C.red, marginBottom: 6 }}>{ex.name}</div>
                  {ex.sets.map((st, j) => (
                    <div key={j} style={{ color: C.muted, fontSize: 13, padding: "3px 0", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: C.faint }}>Set {j + 1}</span>
                      <span>{st.wt} lbs × {st.reps} reps</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── SUMMARY SCREEN ─────────────────────────────────────────────────────────
function SummaryScreen({ session, onHome }) {
  const totalSets = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const totalVol = session.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + s.wt * s.reps, 0), 0);
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
      <div style={{ ...s.label, color: C.red, letterSpacing: 6 }}>WORKOUT COMPLETE</div>
      <div style={{ fontFamily: "Orbitron", fontSize: 26, fontWeight: 900, textAlign: "center" }}>{session.name}</div>
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        {[
          { l: "DURATION", v: `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` },
          { l: "SETS", v: totalSets },
          { l: "VOLUME", v: `${totalVol.toLocaleString()}` },
        ].map(stat => (
          <div key={stat.l} style={{ flex: 1, ...s.card, textAlign: "center" }}>
            <div style={{ fontFamily: "Orbitron", fontSize: stat.l === "VOLUME" ? 16 : 22, fontWeight: 700, color: C.red }}>{stat.v}</div>
            <div style={{ ...s.label, fontSize: 9, marginTop: 4 }}>{stat.l}{stat.l === "VOLUME" ? " (lbs)" : ""}</div>
          </div>
        ))}
      </div>
      {session.exercises.map((ex, i) => (
        <div key={i} style={{ ...s.card, width: "100%" }}>
          <div style={{ fontFamily: "Orbitron", fontSize: 11, letterSpacing: 2, color: C.red, marginBottom: 10 }}>{ex.name}</div>
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

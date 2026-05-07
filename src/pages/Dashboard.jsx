import { useState, useEffect, useRef } from "react";

// ─── Tiny SVG icon primitive ────────────────────────────────────────────────
const IC = ({ d, size = 16, fill = "none", className = "", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const P = {
  edit:      "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  note:      ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  task:      "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  template:  ["M4 4h6v6H4z","M14 4h6v6h-6z","M4 14h6v6H4z","M14 17h6M17 14v6"],
  chevRight: "M9 18l6-6-6-6",
  chevLeft:  "M15 18l-6-6 6-6",
  chevDown:  "M6 9l6 6 6-6",
  check:     "M20 6L9 17l-5-5",
  circle:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  sun:       "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  clock:     ["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M12 6v6l4 2"],
  tag:       "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
  plus:      "M12 5v14M5 12h14",
  dots:      "M5 12h.01M12 12h.01M19 12h.01",
  image:     ["M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z","M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z","M21 15l-5-5L5 21"],
  user:      ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  grid2:     ["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
  flame:     "M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  link:      "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  layout:    ["M3 3h18v18H3z","M3 9h18","M9 21V9"],
};

// ─── Mock Data ───────────────────────────────────────────────────────────────
const USER = { name: "Alex Rivera", role: "Product Designer", avatar: null, streak: 7 };

const RECENT_NOTES = [
  { id: 1, title: "Q3 Product Roadmap", preview: "Prioritize the new onboarding flow, address the drop-off at step 3…", tag: "Product", tagColor: "#60a5fa", time: "2m ago", pinned: true },
  { id: 2, title: "Meeting Notes — Design Sync", preview: "Discussed component library updates, spacing tokens, and dark mode…", tag: "Design", tagColor: "#a78bfa", time: "1h ago", pinned: false },
  { id: 3, title: "Research: Competitor Analysis", preview: "Linear, Notion, Craft — key differentiators are speed and keyboard…", tag: "Research", tagColor: "#34d399", time: "Yesterday", pinned: false },
  { id: 4, title: "Personal Journal", preview: "Focusing on deep work blocks this week, no meetings before noon…", tag: "Personal", tagColor: "#f59e0b", time: "2d ago", pinned: false },
];

const RECENT_TASKS = [
  { id: 1, title: "Redesign onboarding screens", done: false, priority: "high",  due: "Today",    tag: "Design" },
  { id: 2, title: "Write API documentation",     done: true,  priority: "med",   due: "Done",     tag: "Dev" },
  { id: 3, title: "Review pull request #284",    done: false, priority: "low",   due: "Tomorrow", tag: "Dev" },
  { id: 4, title: "Prepare sprint retrospective",done: false, priority: "med",   due: "Fri",      tag: "Team" },
  { id: 5, title: "Update brand guidelines",     done: true,  priority: "low",   due: "Done",     tag: "Design" },
];

const TEMPLATES = [
  { id: 1, title: "Weekly Review",   icon: "🗓️", color: "#6366f1", uses: 24 },
  { id: 2, title: "Project Brief",   icon: "📋", color: "#0ea5e9", uses: 17 },
  { id: 3, title: "Meeting Agenda",  icon: "🎯", color: "#10b981", uses: 31 },
  { id: 4, title: "Daily Journal",   icon: "✍️", color: "#f59e0b", uses: 45 },
  { id: 5, title: "Design Spec",     icon: "🎨", color: "#ec4899", uses: 12 },
  { id: 6, title: "Bug Report",      icon: "🐛", color: "#ef4444", uses: 8  },
];

const QUICK_STATS = [
  { label: "Notes",      val: 48,  delta: "+3",  positive: true,  color: "#a78bfa", icon: P.note    },
  { label: "Tasks Done", val: 12,  delta: "+5",  positive: true,  color: "#34d399", icon: P.task    },
  { label: "Streak",     val: "7d",delta: "🔥",  positive: true,  color: "#f59e0b", icon: P.flame   },
  { label: "Templates",  val: 6,   delta: "+1",  positive: true,  color: "#60a5fa", icon: P.template},
];

const BANNERS = [
  { id: "aurora",  label: "Aurora",  style: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" },
  { id: "ember",   label: "Ember",   style: "linear-gradient(135deg, #1a0505 0%, #3d0c0c 50%, #1a0505 100%)" },
  { id: "forest",  label: "Forest",  style: "linear-gradient(135deg, #0a1a0f 0%, #0d3320 50%, #0a1a0f 100%)" },
  { id: "ocean",   label: "Ocean",   style: "linear-gradient(135deg, #020d1a 0%, #0a2540 50%, #020d1a 100%)" },
  { id: "void",    label: "Void",    style: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%)" },
];

const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── Helper ──────────────────────────────────────────────────────────────────
function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  return now;
}

function getGreeting(h) {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const priorityColors = { high: "#ef4444", med: "#f59e0b", low: "#6b7280" };

// ─── Sub-components ──────────────────────────────────────────────────────────

function Avatar({ name, size = 40 }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
  return (
    <div className="flex-shrink-0 flex items-center justify-center rounded-full font-bold select-none"
      style={{ width: size, height: size, fontSize: size * 0.35,
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
        color: "#fff", boxShadow: "0 0 0 2px #2f2f2f, 0 0 0 4px #7c3aed44" }}>
      {initials}
    </div>
  );
}

function MiniCalendar() {
  const now = useNow();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const today = now.getDate();
  const isCurrentMonth = cursor.y === now.getFullYear() && cursor.m === now.getMonth();

  const firstDay = new Date(cursor.y, cursor.m, 1).getDay();
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7) cells.push(null);

  const hasEvent = d => d && [3, 7, 14, 18, 22, 25].includes(d);

  const prev = () => setCursor(c => c.m === 0 ? { y: c.y-1, m: 11 } : { y: c.y, m: c.m-1 });
  const next = () => setCursor(c => c.m === 11 ? { y: c.y+1, m: 0 } : { y: c.y, m: c.m+1 });

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: "#1e1e1e", border: "1px solid #2f2f2f" }}>
      {/* Month header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          {MONTHS[cursor.m]} <span className="text-gray-600 font-normal">{cursor.y}</span>
        </span>
        <div className="flex gap-1">
          <button onClick={prev} className="w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a] transition-all">
            <IC d={P.chevLeft} size={12} />
          </button>
          <button onClick={next} className="w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a] transition-all">
            <IC d={P.chevRight} size={12} />
          </button>
        </div>
      </div>
      {/* Day names */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-700 font-medium py-0.5">{d}</div>
        ))}
        {cells.map((d, i) => {
          const isToday = isCurrentMonth && d === today;
          const ev = hasEvent(d);
          return (
            <div key={i}
              className="relative flex items-center justify-center text-[11px] rounded-md transition-all duration-150 cursor-pointer aspect-square"
              style={{
                color: !d ? "transparent" : isToday ? "#fff" : "#9ca3af",
                background: isToday ? "#7c3aed" : "transparent",
                fontWeight: isToday ? 700 : 400,
              }}
              onMouseEnter={e => { if (d && !isToday) e.currentTarget.style.background = "#2a2a2a"; }}
              onMouseLeave={e => { if (d && !isToday) e.currentTarget.style.background = "transparent"; }}>
              {d || ""}
              {ev && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7c3aed]" />
              )}
            </div>
          );
        })}
      </div>
      {/* Upcoming */}
      <div className="pt-2 border-t" style={{ borderColor: "#2a2a2a" }}>
        <p className="text-[10px] text-gray-700 mb-2 uppercase tracking-widest">Upcoming</p>
        {[{ d: "Tomorrow", t: "Design Review" }, { d: "Fri", t: "Sprint Retro" }].map((e, i) => (
          <div key={i} className="flex items-center gap-2 py-1">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#7c3aed" }} />
            <span className="text-xs text-gray-400 flex-1 truncate">{e.t}</span>
            <span className="text-[10px] text-gray-700">{e.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ stat }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="rounded-xl p-3.5 flex items-center gap-3 transition-all duration-200 cursor-default"
      style={{
        background: hov ? "#242424" : "#1e1e1e",
        border: `1px solid ${hov ? stat.color + "33" : "#2f2f2f"}`,
        boxShadow: hov ? `0 0 20px ${stat.color}18` : "none",
        transform: hov ? "translateY(-1px)" : "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: stat.color + "18", color: stat.color }}>
        <IC d={stat.icon} size={16} />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold text-white leading-none">{stat.val}</div>
        <div className="text-[11px] text-gray-600 mt-0.5">{stat.label}</div>
      </div>
      <div className="ml-auto text-xs font-medium" style={{ color: stat.positive ? "#34d399" : "#ef4444" }}>
        {stat.delta}
      </div>
    </div>
  );
}

function NoteCard({ note }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="rounded-xl p-3.5 cursor-pointer transition-all duration-200 group"
      style={{
        background: hov ? "#242424" : "#1e1e1e",
        border: `1px solid ${hov ? "#3f3f3f" : "#2a2a2a"}`,
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: hov ? "0 8px 30px #00000050" : "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {note.pinned && (
            <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ background: "#f59e0b22", color: "#f59e0b" }}>📌</span>
          )}
          <h4 className="text-sm font-medium text-white truncate">{note.title}</h4>
        </div>
        <span className="text-[10px] text-gray-700 flex-shrink-0">{note.time}</span>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2.5">{note.preview}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: note.tagColor + "18", color: note.tagColor }}>
          {note.tag}
        </span>
        <IC d={P.chevRight} size={12} className="text-gray-700 group-hover:text-gray-500 transition-colors" />
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group"
      style={{ background: hov ? "#242424" : "transparent" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      {/* Checkbox */}
      <button
        onClick={e => { e.stopPropagation(); onToggle(task.id); }}
        className="w-4.5 h-4.5 rounded-md flex-shrink-0 flex items-center justify-center transition-all duration-150"
        style={{
          width: 18, height: 18,
          background: task.done ? "#34d399" : "transparent",
          border: `1.5px solid ${task.done ? "#34d399" : "#3f3f3f"}`,
          boxShadow: task.done ? "0 0 8px #34d39944" : "none",
        }}>
        {task.done && <IC d={P.check} size={10} className="text-black" strokeWidth={3} />}
      </button>
      <span className="flex-1 text-sm truncate transition-all duration-150"
        style={{ color: task.done ? "#4b5563" : "#d1d5db",
          textDecoration: task.done ? "line-through" : "none" }}>
        {task.title}
      </span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] text-gray-700">{task.due}</span>
        <div className="w-1.5 h-1.5 rounded-full"
          style={{ background: priorityColors[task.priority] }} />
      </div>
    </div>
  );
}

function TemplateCard({ tpl }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="rounded-xl p-3.5 cursor-pointer transition-all duration-200 flex flex-col gap-2"
      style={{
        background: hov ? "#242424" : "#1e1e1e",
        border: `1px solid ${hov ? tpl.color + "44" : "#2a2a2a"}`,
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? `0 8px 24px ${tpl.color}22` : "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
        style={{ background: tpl.color + "18" }}>
        {tpl.icon}
      </div>
      <div>
        <p className="text-xs font-medium text-white leading-tight">{tpl.title}</p>
        <p className="text-[10px] text-gray-700 mt-0.5">{tpl.uses} uses</p>
      </div>
    </div>
  );
}

// ─── Banner picker ───────────────────────────────────────────────────────────
function BannerPicker({ current, onChange, onClose }) {
  return (
    <div className="absolute top-12 right-4 z-20 rounded-xl p-3 shadow-2xl"
      style={{ background: "#1e1e1e", border: "1px solid #3f3f3f", minWidth: 220 }}>
      <p className="text-xs text-gray-600 mb-2 uppercase tracking-widest">Banner Style</p>
      <div className="grid grid-cols-5 gap-1.5">
        {BANNERS.map(b => (
          <button key={b.id}
            onClick={() => { onChange(b); onClose(); }}
            className="w-8 h-8 rounded-lg transition-all duration-150 flex-shrink-0"
            style={{
              background: b.style,
              outline: current.id === b.id ? `2px solid #7c3aed` : "none",
              outlineOffset: 2,
            }}
            title={b.label} />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const now = useNow();
  const [banner, setBanner] = useState(BANNERS[0]);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [tasks, setTasks] = useState(RECENT_TASKS);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingName, setEditingName] = useState(false);
  const [userName, setUserName] = useState(USER.name);
  const [mounted, setMounted] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (editingName && nameRef.current) nameRef.current.focus();
  }, [editingName]);

  const toggleTask = id => setTasks(prev =>
    prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
  );

  const greeting = getGreeting(now.getHours());
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  const TABS = [
    { id: "overview",  label: "Overview"  },
    { id: "notes",     label: "Notes"     },
    { id: "tasks",     label: "Tasks"     },
    { id: "templates", label: "Templates" },
  ];

  const doneTasks = tasks.filter(t => t.done).length;

  return (
    <div className="min-h-screen overflow-x-hidden"
      style={{ background: "#191919", color: "#e5e7eb",
        fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif" }}>

      {/* ── Animated entrance keyframes ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.12s; }
        .d3 { animation-delay: 0.18s; }
        .d4 { animation-delay: 0.24s; }
        .d5 { animation-delay: 0.30s; }
        .d6 { animation-delay: 0.36s; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2f2f2f; border-radius: 99px; }
        input:focus { outline: none; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* ══ BANNER + WELCOME ══════════════════════════════════════════════ */}
        <div className={`relative rounded-2xl overflow-hidden fade-up d1 ${mounted ? "" : "opacity-0"}`}
          style={{ background: banner.style, border: "1px solid #2f2f2f",
            minHeight: 180, boxShadow: "0 8px 40px #00000060" }}>

          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")" }} />

          {/* Ambient orbs */}
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
          <div className="absolute -bottom-10 right-20 w-40 h-40 rounded-full opacity-15 pointer-events-none"
            style={{ background: "radial-gradient(circle, #4f46e5, transparent 70%)" }} />

          {/* Content */}
          <div className="relative z-10 p-6 flex items-end justify-between h-full" style={{ minHeight: 180 }}>
            <div className="flex items-end gap-5">
              <Avatar name={userName} size={56} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-500">{greeting},</p>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                    style={{ background: "#f59e0b22", border: "1px solid #f59e0b33" }}>
                    <IC d={P.flame} size={11} className="text-amber-400" fill="#f59e0b" />
                    <span className="text-[10px] text-amber-400 font-medium">{USER.streak} day streak</span>
                  </div>
                </div>
                {editingName ? (
                  <input ref={nameRef} value={userName}
                    onChange={e => setUserName(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onKeyDown={e => e.key === "Enter" && setEditingName(false)}
                    className="text-2xl font-bold text-white bg-transparent border-b border-purple-500 focus:border-purple-400 pb-0.5"
                    style={{ maxWidth: 260 }} />
                ) : (
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-2xl font-bold text-white hover:text-gray-200 transition-colors flex items-center gap-2 group">
                    {userName}
                    <IC d={P.edit} size={13} className="text-gray-600 group-hover:text-gray-400 transition-colors mt-0.5" />
                  </button>
                )}
                <p className="text-xs text-gray-600 mt-0.5">{USER.role}</p>
              </div>
            </div>

            {/* Time + date */}
            <div className="text-right hidden sm:block">
              <p className="text-3xl font-bold text-white tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>
                {timeStr}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{dateStr}</p>
            </div>
          </div>

          {/* Edit banner button */}
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => setShowBannerPicker(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150"
              style={{ background: "#00000044", border: "1px solid #ffffff18",
                color: "#9ca3af", backdropFilter: "blur(8px)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#00000066"; e.currentTarget.style.color = "#d1d5db"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#00000044"; e.currentTarget.style.color = "#9ca3af"; }}>
              <IC d={P.image} size={12} />
              Edit Banner
            </button>
            {showBannerPicker && (
              <BannerPicker current={banner} onChange={setBanner}
                onClose={() => setShowBannerPicker(false)} />
            )}
          </div>
        </div>

        {/* ══ QUICK STATS ══════════════════════════════════════════════════ */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 fade-up d2 ${mounted ? "" : "opacity-0"}`}>
          {QUICK_STATS.map(s => <StatCard key={s.label} stat={s} />)}
        </div>

        {/* ══ TABS ═════════════════════════════════════════════════════════ */}
        <div className={`flex items-center gap-1 fade-up d3 ${mounted ? "" : "opacity-0"}`}>
          {TABS.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3.5 py-1.5 rounded-lg text-sm transition-all duration-150"
              style={{
                background: activeTab === tab.id ? "#2a2a2a" : "transparent",
                color: activeTab === tab.id ? "#e5e7eb" : "#6b7280",
                border: `1px solid ${activeTab === tab.id ? "#3f3f3f" : "transparent"}`,
                fontWeight: activeTab === tab.id ? 500 : 400,
              }}>
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-700">
            <IC d={P.clock} size={12} />
            <span>Updated just now</span>
          </div>
        </div>

        {/* ══ MAIN GRID ════════════════════════════════════════════════════ */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-5 fade-up d4 ${mounted ? "" : "opacity-0"}`}>

          {/* ── Left Column (spans 2) ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Recent Notes */}
            {(activeTab === "overview" || activeTab === "notes") && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IC d={P.note} size={14} className="text-purple-400" />
                    <h2 className="text-sm font-semibold text-white">Recent Notes</h2>
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: "#2f2f2f", color: "#6b7280" }}>
                      {RECENT_NOTES.length}
                    </span>
                  </div>
                  <button className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1">
                    View all <IC d={P.chevRight} size={11} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {RECENT_NOTES.map(note => <NoteCard key={note.id} note={note} />)}
                </div>
              </section>
            )}

            {/* Tasks */}
            {(activeTab === "overview" || activeTab === "tasks") && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IC d={P.task} size={14} className="text-emerald-400" />
                    <h2 className="text-sm font-semibold text-white">Recent Tasks</h2>
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: "#2f2f2f", color: "#6b7280" }}>
                      {doneTasks}/{tasks.length}
                    </span>
                  </div>
                  <button className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1">
                    View all <IC d={P.chevRight} size={11} />
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden"
                  style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}>
                  {/* Progress bar */}
                  <div className="px-4 pt-3.5 pb-2.5 border-b" style={{ borderColor: "#2a2a2a" }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-600">Completion</span>
                      <span className="text-xs text-emerald-400 font-medium">
                        {Math.round((doneTasks / tasks.length) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#2f2f2f" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(doneTasks / tasks.length) * 100}%`,
                          background: "linear-gradient(90deg, #34d399, #059669)",
                          boxShadow: "0 0 8px #34d39966" }} />
                    </div>
                  </div>
                  <div className="py-1.5 px-1">
                    {tasks.map(t => <TaskRow key={t.id} task={t} onToggle={toggleTask} />)}
                  </div>
                  {/* Add task */}
                  <div className="px-4 pb-3.5 pt-1 border-t" style={{ borderColor: "#2a2a2a" }}>
                    <button className="flex items-center gap-2 text-xs text-gray-700 hover:text-gray-500 transition-colors">
                      <IC d={P.plus} size={13} />
                      Add task
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Templates */}
            {(activeTab === "overview" || activeTab === "templates") && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IC d={P.template} size={14} className="text-blue-400" />
                    <h2 className="text-sm font-semibold text-white">Favorite Templates</h2>
                  </div>
                  <button className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1">
                    Browse <IC d={P.chevRight} size={11} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TEMPLATES.map(tpl => <TemplateCard key={tpl.id} tpl={tpl} />)}
                </div>
              </section>
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="flex flex-col gap-5">

            {/* Calendar */}
            <div className={`fade-up d5 ${mounted ? "" : "opacity-0"}`}>
              <div className="flex items-center gap-2 mb-3">
                <IC d={P.clock} size={14} className="text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Calendar</h2>
              </div>
              <MiniCalendar />
            </div>

            {/* Activity + quick actions */}
            <div className={`fade-up d6 ${mounted ? "" : "opacity-0"}`}>
              <div className="flex items-center gap-2 mb-3">
                <IC d={P.flame} size={14} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-white">Activity</h2>
              </div>
              <div className="rounded-2xl p-4"
                style={{ background: "#1e1e1e", border: "1px solid #2f2f2f" }}>
                {/* Activity grid (github-style) */}
                <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
                  {Array.from({ length: 98 }, (_, i) => {
                    const intensity = Math.random();
                    const bg = intensity > 0.85 ? "#7c3aed"
                      : intensity > 0.65 ? "#6d28d966"
                      : intensity > 0.45 ? "#6d28d933"
                      : "#2a2a2a";
                    return (
                      <div key={i} className="aspect-square rounded-sm transition-all duration-150 hover:opacity-80"
                        style={{ background: bg }} />
                    );
                  })}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-gray-700">14 weeks</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#2a2a2a" }} />
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#6d28d933" }} />
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#7c3aed" }} />
                    <span className="text-[10px] text-gray-700 ml-1">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <IC d={P.link} size={14} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-white">Quick Access</h2>
              </div>
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "#1e1e1e", border: "1px solid #2f2f2f" }}>
                {[
                  { label: "New Note",       icon: P.note,     color: "#a78bfa" },
                  { label: "New Task",       icon: P.task,     color: "#34d399" },
                  { label: "New Template",   icon: P.template, color: "#60a5fa" },
                  { label: "Browse Library", icon: P.layout,   color: "#f59e0b" },
                ].map((item, i, arr) => (
                  <button key={item.label}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 group"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #242424" : "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#242424"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: item.color + "18", color: item.color }}>
                      <IC d={item.icon} size={13} />
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors flex-1 text-left">
                      {item.label}
                    </span>
                    <IC d={P.chevRight} size={12} className="text-gray-700 group-hover:text-gray-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom padding ── */}
        <div className="h-6" />
      </div>
    </div>
  );
}
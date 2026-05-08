import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from '../api/axiosInstance';

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

const BANNERS = [
  { id: "aurora",  label: "Aurora",  style: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" },
  { id: "ember",   label: "Ember",   style: "linear-gradient(135deg, #1a0505 0%, #3d0c0c 50%, #1a0505 100%)" },
  { id: "forest",  label: "Forest",  style: "linear-gradient(135deg, #0a1a0f 0%, #0d3320 50%, #0a1a0f 100%)" },
  { id: "ocean",   label: "Ocean",   style: "linear-gradient(135deg, #020d1a 0%, #0a2540 50%, #020d1a 100%)" },
  { id: "void",    label: "Void",    style: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%)" },
];

const DAYS = ["Pz","Pt","Sa","Ça","Pe","Cu","Ct"];
const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

// ─── Helper ──────────────────────────────────────────────────────────────────
function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  return now;
}

function getGreeting(h) {
  if (h < 12) return "Günaydın";
  if (h < 17) return "İyi Günler";
  return "İyi Akşamlar";
}

const priorityColors = { high: "#ef4444", med: "#f59e0b", low: "#6b7280", medium: "#f59e0b", urgent: "#ef4444" };

// ─── Sub-components ──────────────────────────────────────────────────────────

function Avatar({ name, size = 40 }) {
  const initials = (name || "U").split(" ").map(n => n[0]).join("").toUpperCase();
  return (
    <div className="flex-shrink-0 flex items-center justify-center rounded-full font-bold select-none"
      style={{ width: size, height: size, fontSize: size * 0.35,
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
        color: "#fff", boxShadow: "0 0 0 2px #09090b, 0 0 0 4px #7c3aed44" }}>
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

  const prev = () => setCursor(c => c.m === 0 ? { y: c.y-1, m: 11 } : { y: c.y, m: c.m-1 });
  const next = () => setCursor(c => c.m === 11 ? { y: c.y+1, m: 0 } : { y: c.y, m: c.m+1 });

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: "#111119", border: "1px solid #1e1e2c" }}>
      {/* Month header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          {MONTHS[cursor.m]} <span className="text-gray-500 font-normal">{cursor.y}</span>
        </span>
        <div className="flex gap-1">
          <button onClick={prev} className="w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-300 hover:bg-[#1e1e2c] transition-all">
            <IC d={P.chevLeft} size={12} />
          </button>
          <button onClick={next} className="w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-300 hover:bg-[#1e1e2c] transition-all">
            <IC d={P.chevRight} size={12} />
          </button>
        </div>
      </div>
      {/* Day names */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-500 font-medium py-0.5">{d}</div>
        ))}
        {cells.map((d, i) => {
          const isToday = isCurrentMonth && d === today;
          return (
            <div key={i}
              className="relative flex items-center justify-center text-[11px] rounded-md transition-all duration-150 cursor-pointer aspect-square"
              style={{
                color: !d ? "transparent" : isToday ? "#fff" : "#9ca3af",
                background: isToday ? "#6c6af6" : "transparent",
                fontWeight: isToday ? 700 : 400,
              }}
              onMouseEnter={e => { if (d && !isToday) e.currentTarget.style.background = "#1e1e2c"; }}
              onMouseLeave={e => { if (d && !isToday) e.currentTarget.style.background = "transparent"; }}>
              {d || ""}
            </div>
          );
        })}
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
        background: hov ? "#161622" : "#111119",
        border: `1px solid ${hov ? stat.color + "44" : "#1e1e2c"}`,
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
        <div className="text-[11px] text-gray-500 mt-0.5">{stat.label}</div>
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
        background: hov ? "#161622" : "#111119",
        border: `1px solid ${hov ? "#2a2a3c" : "#1e1e2c"}`,
        transform: hov ? "translateY(-2px)" : "none",
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
        <span className="text-[10px] text-gray-500 flex-shrink-0">{note.time}</span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2.5">{note.preview || 'İçerik yok...'}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: note.tagColor + "18", color: note.tagColor }}>
          {note.tag}
        </span>
        <IC d={P.chevRight} size={12} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
      </div>
    </div>
  );
}
 // DashboardHome.jsx içindeki TaskRow bileşenini şu hale getir:

function TaskRow({ task }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-default group"
      style={{ background: hov ? "#161622" : "transparent" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      
      {/* Tik kutusunu tamamen sildik, sadece küçük bir nokta veya ikon bırakabiliriz */}
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
           style={{ background: priorityColors[task.priority] || priorityColors.med }} />

      <span className="flex-1 text-sm truncate text-[#d1d5db]">
        {task.title}
      </span>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] text-gray-500">{task.due}</span>
      </div>
    </div>
  );
}
function BannerPicker({ current, onChange, onClose }) {
  return (
    <div className="absolute top-12 right-4 z-20 rounded-xl p-3 shadow-2xl"
      style={{ background: "#111119", border: "1px solid #1e1e2c", minWidth: 220 }}>
      <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Banner Stili</p>
      <div className="grid grid-cols-5 gap-1.5">
        {BANNERS.map(b => (
          <button key={b.id}
            onClick={() => { onChange(b); onClose(); }}
            className="w-8 h-8 rounded-lg transition-all duration-150 flex-shrink-0"
            style={{
              background: b.style,
              outline: current.id === b.id ? `2px solid #6c6af6` : "none",
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
  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);
  
  // Real Data States
  const [summary, setSummary] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  // Fetch Dashboard Data
  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/api/dashboard/summary');
      const data = res.data.data || res.data;
      setSummary(data);
      setRecentTasks(data.recentTasks || []);
      setRecentNotes(data.recentNotes || []);
      // Artık notları ve kitapları tek bir objeden (data) alabilirsin
    } catch (error) {
      console.error("Dashboard verileri alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchDashboardData();
}, []);

// KİTAPLAR İÇİN UI KISMI (Boş olan yere ekle):
<section>
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <IC d={P.template} size={14} className="text-blue-400" />
      <h2 className="text-sm font-semibold text-white">Son Eklenen Kitaplar</h2>
    </div>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {summary?.recentBooks?.map(book => (
      <div key={book.id} className="p-3 rounded-xl bg-[#111119] border border-[#1e1e2c]">
        <p className="text-sm font-medium text-white">{book.title}</p>
        <p className="text-xs text-gray-500">{book.author}</p>
      </div>
    ))}
  </div>
</section>

  const toggleTask = async (id, currentStatus) => {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    
    // Optimistic UI Update (Ekranda anında değişsin)
    setRecentTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    ));

    try {
      // Backend'i güncelle
      await api.patch(`/api/tasks/${id}/status`, { status: newStatus });
    } catch (error) {
      console.error("Görev güncellenemedi:", error);
      // Hata olursa eski haline al
      setRecentTasks(prev => prev.map(t => 
        t.id === id ? { ...t, status: currentStatus } : t
      ));
    }
  };

  const greeting = getGreeting(now.getHours());
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString('tr-TR', { weekday: "long", month: "long", day: "numeric" });

  const TABS = [
    { id: "overview",  label: "Genel Bakış" },
    { id: "notes",     label: "Notlar"      },
    { id: "tasks",     label: "Görevler"    },
  ];

  const doneTasks = recentTasks.filter(t => t.status === 'DONE').length;

  const STATS = [
    { label: "Toplam Not",  val: summary?.notesCount || 0, delta: "", positive: true,  color: "#a78bfa", icon: P.note },
    { label: "Toplam Görev", val: summary?.tasksCount || 0, delta: "", positive: true,  color: "#34d399", icon: P.task },
    { label: "Kütüphane",  val: summary?.booksCount || 0, delta: "", positive: true,  color: "#60a5fa", icon: P.template },
    { label: "Aylık Gider", val: `₺${summary?.totalMonthlyCost || 0}`, delta: "", positive: false, color: "#f87171", icon: P.circle },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden"
      style={{ background: "#09090b", color: "#e5e7eb",
        fontFamily: "'Inter', system-ui, sans-serif" }}>

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
        input:focus { outline: none; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* ══ BANNER + WELCOME ══════════════════════════════════════════════ */}
        <div className={`relative rounded-2xl overflow-hidden fade-up d1 ${mounted ? "" : "opacity-0"}`}
          style={{ background: banner.style, border: "1px solid #1e1e2c",
            minHeight: 180, boxShadow: "0 8px 40px #00000060" }}>

          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")" }} />

          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
          <div className="absolute -bottom-10 right-20 w-40 h-40 rounded-full opacity-15 pointer-events-none"
            style={{ background: "radial-gradient(circle, #4f46e5, transparent 70%)" }} />

          <div className="relative z-10 p-6 flex items-end justify-between h-full" style={{ minHeight: 180 }}>
            <div className="flex items-end gap-5">
              <Avatar name={summary?.displayName || summary?.username} size={56} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-300">{greeting},</p>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {loading ? 'Yükleniyor...' : summary?.displayName || summary?.username || 'Kullanıcı'}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">Bugün ne yapacağız?</p>
              </div>
            </div>

            {/* Time + date */}
            <div className="text-right hidden sm:block">
              <p className="text-3xl font-bold text-white tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>
                {timeStr}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{dateStr}</p>
            </div>
          </div>

          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => setShowBannerPicker(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150"
              style={{ background: "#00000044", border: "1px solid #ffffff18",
                color: "#9ca3af", backdropFilter: "blur(8px)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#00000066"; e.currentTarget.style.color = "#d1d5db"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#00000044"; e.currentTarget.style.color = "#9ca3af"; }}>
              <IC d={P.image} size={12} />
              Kapak Değiştir
            </button>
            {showBannerPicker && (
              <BannerPicker current={banner} onChange={setBanner}
                onClose={() => setShowBannerPicker(false)} />
            )}
          </div>
        </div>

        {/* ══ QUICK STATS ══════════════════════════════════════════════════ */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 fade-up d2 ${mounted ? "" : "opacity-0"}`}>
          {STATS.map(s => <StatCard key={s.label} stat={s} />)}
        </div>

        {/* ══ TABS ═════════════════════════════════════════════════════════ */}
        <div className={`flex items-center gap-1 fade-up d3 ${mounted ? "" : "opacity-0"}`}>
          {TABS.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3.5 py-1.5 rounded-lg text-sm transition-all duration-150"
              style={{
                background: activeTab === tab.id ? "#1e1e2c" : "transparent",
                color: activeTab === tab.id ? "#e5e7eb" : "#6b7280",
                border: `1px solid ${activeTab === tab.id ? "#2a2a3c" : "transparent"}`,
                fontWeight: activeTab === tab.id ? 500 : 400,
              }}>
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-600">
            <IC d={P.clock} size={12} />
            <span>Gerçek Zamanlı</span>
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
                    <IC d={P.note} size={14} className="text-[#6c6af6]" />
                    <h2 className="text-sm font-semibold text-white">Son Notlar</h2>
                  </div>
                  <Link to="/dashboard/notes" className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
                    Tümünü gör <IC d={P.chevRight} size={11} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentNotes.length > 0 ? recentNotes.map(note => (
                    <NoteCard key={note.id} note={{
                      id: note.id,
                      title: note.title,
                      preview: note.content?.replace(/<[^>]+>/g, '').substring(0, 60) + '...',
                      tag: note.folderName || 'Genel',
                      tagColor: note.color || '#6c6af6',
                      time: new Date(note.updatedAt || new Date()).toLocaleDateString('tr-TR'),
                      pinned: note.pinned
                    }} />
                  )) : (
                    <p className="text-sm text-gray-600 italic">Henüz not bulunmuyor...</p>
                  )}
                </div>
              </section>
            )}

            {/* Tasks */}
            {(activeTab === "overview" || activeTab === "tasks") && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IC d={P.task} size={14} className="text-emerald-400" />
                    <h2 className="text-sm font-semibold text-white">Son Görevler</h2>
                  </div>
                  <Link to="/dashboard/gorevler" className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
                    Tümünü gör <IC d={P.chevRight} size={11} />
                  </Link>
                </div>
                
                {recentTasks.length > 0 ? (
                  <div className="rounded-xl overflow-hidden"
                    style={{ background: "#111119", border: "1px solid #1e1e2c" }}>
                    {/* Progress bar */}
                   
                    <div className="py-1.5 px-1">
                      {recentTasks.map(t => (
  <TaskRow key={t.id} task={{
    id: t.id,
    title: t.title,
    priority: t.priority?.toLowerCase() || 'med',
    due: t.dueDate || 'Tarih Yok'
  }} />
))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic">Aktif görev bulunmuyor...</p>
                )}
              </section>
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="flex flex-col gap-5">

            {/* Calendar */}
            <div className={`fade-up d5 ${mounted ? "" : "opacity-0"}`}>
              <div className="flex items-center gap-2 mb-3">
                <IC d={P.clock} size={14} className="text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Takvim</h2>
              </div>
              <MiniCalendar />
            </div>

            {/* Quick links */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <IC d={P.link} size={14} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-white">Hızlı Erişim</h2>
              </div>
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "#111119", border: "1px solid #1e1e2c" }}>
                {[
                  { label: "Yeni Not Oluştur", icon: P.note, color: "#6c6af6", link: "/dashboard/notes" },
                  { label: "Görev Ekle",       icon: P.task, color: "#34d399", link: "/dashboard/gorevler" },
                  { label: "Kütüphaneye Git",  icon: P.layout, color: "#f59e0b", link: "/dashboard/kutuphane" },
                ].map((item, i, arr) => (
                  <Link to={item.link} key={item.label}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 group"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #1e1e2c" : "none", display: 'flex' }}
                    onMouseEnter={e => e.currentTarget.style.background = "#161622"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: item.color + "18", color: item.color }}>
                      <IC d={item.icon} size={13} />
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors flex-1 text-left">
                      {item.label}
                    </span>
                    <IC d={P.chevRight} size={12} className="text-gray-700 group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
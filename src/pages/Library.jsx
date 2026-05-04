import { useState, useRef, useCallback, useEffect } from "react";
import api from "../api/axiosInstance";

// ── Icons (inline SVG helpers) ────────────────────────────────────────────────
const Icon = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const icons = {
  heart:       "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  heartFill:   "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  folder:      "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  book:        "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  search:      "M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5zM16 16l4.5 4.5",
  grid:        "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  list:        "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  plus:        "M12 5v14M5 12h14",
  star:        "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  x:           "M18 6L6 18M6 6l12 12",
};

// ── Sabit Kategoriler ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",         label: "All Books",    color: "#a78bfa" },
  { id: "design",      label: "Design",       color: "#34d399" },
  { id: "engineering", label: "Engineering",  color: "#60a5fa" },
  { id: "productivity",label: "Productivity", color: "#f59e0b" },
  { id: "philosophy",  label: "Philosophy",   color: "#f87171" },
  { id: "business",    label: "Business",     color: "#fb923c" },
];

// ── Tema Renkleri (Kitap Ekleme için) ─────────────────────────────────────────
const BOOK_THEMES = [
  { id: 'purple', color: ['#a855f7', '#7e22ce'], accent: '#c084fc', spine: '#6b21a8' },
  { id: 'green',  color: ['#34d399', '#059669'], accent: '#6ee7b7', spine: '#047857' },
  { id: 'blue',   color: ['#60a5fa', '#2563eb'], accent: '#93c5fd', spine: '#1d4ed8' },
  { id: 'orange', color: ['#fb923c', '#ea580c'], accent: '#fdba74', spine: '#c2410c' },
  { id: 'red',    color: ['#f87171', '#dc2626'], accent: '#fca5a5', spine: '#b91c1c' },
  { id: 'dark',   color: ['#3f3f46', '#18181b'], accent: '#71717a', spine: '#09090b' },
];

// ── Shared Modal Styles ───────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #252530', background: '#0e0e14',
  color: '#d8d8e0', fontSize: 13, outline: 'none', transition: 'border-color 0.2s',
};
const labelStyle = {
  display: 'block', fontSize: 11.5, fontWeight: 600, color: '#55556a',
  textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6,
};

// ── Add Book Modal Component ──────────────────────────────────────────────────
function AddBookModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '', author: '', category: 'design',
    pages: '', currentPage: '', cover: '', description: '',
    year: new Date().getFullYear(), theme: BOOK_THEMES[0]
  });
  const [loading, setLoading] = useState(false);

  const update = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.author.trim() || !form.pages) return;
    setLoading(true);

    try {
      // Sayfa verisinden yüzdelik dilimi (progress) hesapla
      const totalP = parseInt(form.pages) || 1;
      const currP = parseInt(form.currentPage) || 0;
      const progress = Math.min(100, Math.max(0, Math.round((currP / totalP) * 100)));

      // API Payload
      const payload = {
        title: form.title,
        author: form.author,
        category: form.category,
        pages: totalP,
        progress: progress,
        cover: form.cover.substring(0, 2).toUpperCase() || form.title.substring(0, 1).toUpperCase(),
        description: form.description,
        year: parseInt(form.year) || new Date().getFullYear(),
        colorStart: form.theme.color[0],
        colorEnd: form.theme.color[1],
        accent: form.theme.accent,
        spine: form.theme.spine,
        tags: [CATEGORIES.find(c => c.id === form.category)?.label || form.category],
        rating: 0
      };

      const res = await api.post("/api/library", payload);
      onAdd(res.data.data || res.data); // Yeni kitabı listeye ekle
      onClose(); // Modalı kapat
    } catch (err) {
      console.error("Kitap eklenemedi:", err);
      alert("Kitap eklenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      
      <div className="w-full max-w-lg rounded-2xl flex flex-col shadow-2xl"
        style={{ background: '#16161e', border: '1px solid #252530', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div className="px-5 py-4 border-b flex justify-between items-center shrink-0" style={{ borderColor: '#1e1e26' }}>
          <h2 className="text-[15px] font-semibold text-gray-200">Yeni Kitap Ekle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <Icon d={icons.x} size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label style={labelStyle}>Kitap Adı *</label>
              <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Örn: The Design of Everyday Things" style={inputStyle} autoFocus />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label style={labelStyle}>Yazar *</label>
              <input value={form.author} onChange={e => update('author', e.target.value)} placeholder="Örn: Don Norman" style={inputStyle} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label style={labelStyle}>Kategori</label>
              <select value={form.category} onChange={e => update('category', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label style={labelStyle}>Toplam Sayfa *</label>
              <input type="number" min="1" value={form.pages} onChange={e => update('pages', e.target.value)} placeholder="320" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Şu Anki Sayfa</label>
              <input type="number" min="0" value={form.currentPage} onChange={e => update('currentPage', e.target.value)} placeholder="45" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Yayım Yılı</label>
              <input type="number" value={form.year} onChange={e => update('year', e.target.value)} placeholder="2013" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Kapak Logosu (1-2 Harf)</label>
              <input maxLength="2" value={form.cover} onChange={e => update('cover', e.target.value.toUpperCase())} placeholder="DN" style={{ ...inputStyle, textAlign: 'center', fontWeight: 'bold', letterSpacing: '2px' }} />
            </div>
            <div>
              <label style={labelStyle}>Renk Teması</label>
              <div className="flex items-center gap-2 mt-1">
                {BOOK_THEMES.map(theme => (
                  <button key={theme.id} onClick={() => update('theme', theme)}
                    className="w-7 h-7 rounded-full cursor-pointer transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${theme.color[0]}, ${theme.color[1]})`,
                      border: form.theme.id === theme.id ? `2px solid white` : `2px solid transparent`,
                      boxShadow: form.theme.id === theme.id ? `0 0 0 2px ${theme.accent}66` : 'none'
                    }} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Açıklama (Opsiyonel)</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Kitap hakkında kısa notlar..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex justify-end gap-3 shrink-0" style={{ borderColor: '#1e1e26' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:text-white transition-colors" style={{ background: 'transparent', border: '1px solid #2a2a36' }}>
            İptal
          </button>
          <button onClick={handleSubmit} disabled={!form.title || !form.author || !form.pages || loading} className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: '#7c3aed' }}>
            {loading ? "Ekleniyor..." : "Kitabı Ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden animate-pulse"
      style={{ height: "260px", background: "#111119", border: "1px solid #1e1e2c" }}>
      <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
        style={{ background: "#1e1e2c" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
        <div className="w-14 h-14 rounded-xl" style={{ background: "#1e1e2c" }} />
        <div className="w-full space-y-2">
          <div className="h-3 rounded" style={{ background: "#1e1e2c", width: "80%" }} />
          <div className="h-2 rounded" style={{ background: "#1e1e2c", width: "55%" }} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
        <div className="h-1 rounded-full" style={{ background: "#1e1e2c" }} />
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl animate-pulse"
      style={{ background: "#111119", border: "1px solid #1e1e2c" }}>
      <div className="w-9 h-12 rounded-md flex-shrink-0" style={{ background: "#1e1e2c" }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded" style={{ background: "#1e1e2c", width: "60%" }} />
        <div className="h-2 rounded" style={{ background: "#1e1e2c", width: "35%" }} />
      </div>
      <div className="w-20 h-1.5 rounded-full" style={{ background: "#1e1e2c" }} />
    </div>
  );
}

// ── BookCard ──────────────────────────────────────────────────────────────────
function BookCard({ book, isFavorite, onToggleFavorite, view }) {
  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const color  = Array.isArray(book.color) && book.color.length >= 2 ? book.color : ["#111111", "#222222"];
  const tags   = Array.isArray(book.tags) ? book.tags : [];
  const accent = book.accent || "#7c3aed";
  const spine  = book.spine  || "#6d28d9";

  const progressColor = book.progress === 100 ? "#34d399" : book.progress > 50 ? accent : "#6b7280";

  if (view === "list") {
    return (
      <div
        className="group flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer"
        style={{
          background:   hovered ? "#161622" : "#111119",
          borderColor:  hovered ? accent + "44" : "#1e1e2c",
          boxShadow:    hovered ? `0 0 0 1px ${accent}22, 0 4px 20px #00000040` : "none",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="w-9 h-12 rounded-md flex-shrink-0 flex items-center justify-center text-xs font-bold"
          style={{ background: `linear-gradient(160deg, ${color[0]}, ${color[1]})`,
            color: accent, border: `1px solid ${accent}33` }}>
          {book.cover}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{book.title}</p>
          <p className="text-xs text-gray-500">{book.author} · {book.year}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {tags.slice(0, 1).map(t => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: accent + "22", color: accent }}>
              {t}
            </span>
          ))}
          <div className="w-20 h-1.5 rounded-full bg-[#1e1e2c] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${book.progress}%`, background: progressColor }} />
          </div>
          <span className="text-xs text-gray-600 w-8 text-right">{book.progress}%</span>
          <button
            onClick={e => { e.stopPropagation(); onToggleFavorite(book.id); }}
            className="ml-1 transition-transform duration-150 hover:scale-125"
          >
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill={isFavorite ? accent : "none"}
              stroke={isFavorite ? accent : "#4b5563"}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={icons.heartFill} />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative group cursor-pointer select-none"
      style={{ perspective: "800px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setFlipped(false); }}
      onClick={() => setFlipped(f => !f)}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          height: "260px",
        }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: `linear-gradient(160deg, ${color[0]}, ${color[1]})`,
            border: `1px solid ${hovered ? accent + "55" : "#1e1e2c"}`,
            boxShadow: hovered
              ? `0 0 0 1px ${accent}33, 0 20px 60px -10px ${accent}44, 0 8px 30px #00000080`
              : "0 4px 20px #00000060",
            transform: hovered && !flipped ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
            style={{ background: spine }} />
          <div className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 30% 20%, ${accent}33, transparent 70%)` }} />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black"
              style={{ background: accent + "22", color: accent,
                border: `1px solid ${accent}44`, fontFamily: "monospace" }}>
              {book.cover}
            </div>
            <div className="text-center">
              <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">{book.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{book.author}</p>
            </div>
          </div>

          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1 flex-wrap px-3">
            {tags.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: accent + "22", color: accent, fontSize: "10px" }}>
                {t}
              </span>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-600">Progress</span>
              <span className="text-[10px]" style={{ color: progressColor }}>{book.progress}%</span>
            </div>
            <div className="h-1 rounded-full bg-[#111119] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${book.progress}%`, background: progressColor,
                  boxShadow: `0 0 6px ${progressColor}88` }} />
            </div>
          </div>

          <button
            className="absolute top-3 right-3 transition-all duration-150 hover:scale-125"
            onClick={e => { e.stopPropagation(); onToggleFavorite(book.id); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill={isFavorite ? accent : "none"}
              stroke={isFavorite ? accent : "#374151"}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={icons.heartFill} />
            </svg>
          </button>

          {book.progress === 100 && (
            <div className="absolute top-3 left-4 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#34d399", boxShadow: "0 0 10px #34d39988" }}>
              <Icon d={icons.check} size={10} className="text-black" />
            </div>
          )}
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-2xl p-4 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#111119",
            border: `1px solid ${accent}44`,
            boxShadow: `0 0 0 1px ${accent}22, 0 20px 60px -10px ${accent}33`,
          }}
        >
          <div>
            <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">{book.title}</h4>
            <p className="text-gray-500 text-xs mb-3">{book.author} · {book.year} · {book.pages}p</p>
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-4">{book.description}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <svg key={s} width="12" height="12" viewBox="0 0 24 24"
                  fill={s <= book.rating ? "#f59e0b" : "none"}
                  stroke={s <= book.rating ? "#f59e0b" : "#374151"}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icons.star} />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-600">Tekrar tıkla</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CategoryFolder ────────────────────────────────────────────────────────────
function CategoryFolder({ cat, count, isActive, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 w-full text-left"
      style={{
        background: isActive ? cat.color + "18" : hov ? "#161622" : "transparent",
        color:      isActive ? cat.color : hov ? "#d1d5db" : "#6b7280",
        border:     `1px solid ${isActive ? cat.color + "33" : "transparent"}`,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24"
        fill={isActive ? cat.color + "33" : "none"}
        stroke={isActive ? cat.color : "currentColor"}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={icons.folder} />
      </svg>
      <span className="flex-1 truncate">{cat.label}</span>
      <span className="text-xs px-1.5 py-0.5 rounded-md"
        style={{ background: isActive ? cat.color + "22" : "#1e1e2c",
          color: isActive ? cat.color : "#4b5563" }}>
        {count ?? 0}
      </span>
    </button>
  );
}

// ── ShelfRow (draggable) ──────────────────────────────────────────────────────
function ShelfRow({ books, favorites, onToggleFavorite }) {
  const ref        = useRef(null);
  const isDragging = useRef(false);
  const startX     = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback(e => {
    isDragging.current = true;
    startX.current     = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (ref.current) ref.current.style.cursor = "grab";
  }, []);

  const onMouseMove = useCallback(e => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x    = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  return (
    <div
      ref={ref}
      className="flex gap-4 overflow-x-auto pb-3 select-none"
      style={{ cursor: "grab", scrollbarWidth: "none", msOverflowStyle: "none" }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {(books || []).map(book => (
        <div key={book.id} className="flex-shrink-0" style={{ width: "180px" }}>
          <BookCard book={book} isFavorite={favorites.has(book.id)}
            onToggleFavorite={onToggleFavorite} view="grid" />
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Library() {
  const [books,          setBooks]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites,      setFavorites]      = useState(new Set());
  const [search,         setSearch]         = useState("");
  const [view,           setView]           = useState("grid");
  const [showFavOnly,    setShowFavOnly]    = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/library");
        if (cancelled) return;
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setBooks(data);
        const favIds = new Set(data.filter(b => b.isFavorite).map(b => b.id));
        setFavorites(favIds);
      } catch (err) {
        if (!cancelled) {
          console.error("Kitaplar yüklenemedi:", err);
          setError("Kitaplar yüklenirken bir hata oluştu.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBooks();
    return () => { cancelled = true; };
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      await api.patch(`/api/library/${id}/favorite`);
    } catch (err) {
      console.error("Favori güncellenemedi, geri alınıyor:", err);
      setFavorites(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  }, []);

  const safeBooks = books || [];

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat.id === "all"
      ? safeBooks.length
      : safeBooks.filter(b => b.category === cat.id).length;
    return acc;
  }, {});

  const filtered = safeBooks.filter(b => {
    if (activeCategory !== "all" && b.category !== activeCategory) return false;
    if (showFavOnly && !favorites.has(b.id)) return false;
    if (search) {
      const q = search.toLowerCase();
      const titleMatch  = (b.title  || "").toLowerCase().includes(q);
      const authorMatch = (b.author || "").toLowerCase().includes(q);
      if (!titleMatch && !authorMatch) return false;
    }
    return true;
  });

  const shelfGroups = CATEGORIES.slice(1).map(cat => ({
    ...cat,
    books: safeBooks.filter(b => b.category === cat.id),
  }));

  const activeCat = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

  const totalProgress = safeBooks.length > 0
    ? Math.round(safeBooks.reduce((a, b) => a + (b.progress || 0), 0) / safeBooks.length)
    : 0;

  const statsFooter = [
    { label: "Toplam",     val: safeBooks.length },
    { label: "Okunuyor",   val: safeBooks.filter(b => b.progress > 0 && b.progress < 100).length },
    { label: "Tamamlanan", val: safeBooks.filter(b => b.progress === 100).length, color: "#34d399" },
    { label: "Başlanmadı", val: safeBooks.filter(b => b.progress === 0).length },
  ];

  return (
    <div className="flex h-screen overflow-hidden"
      style={{ background: "#09090b", color: "#e5e7eb", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r"
        style={{ background: "#09090b", borderColor: "#1e1e2c" }}>
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              <Icon d={icons.book} size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">Kütüphane</span>
          </div>

          <div className="relative mb-4">
            <Icon d={icons.search} size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Kitap ara..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg outline-none transition-all duration-200"
              style={{ background: "#161622", border: "1px solid #1e1e2c", color: "#d1d5db" }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                <Icon d={icons.x} size={12} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFavOnly(f => !f)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-all duration-200 mb-4"
            style={{
              background: showFavOnly ? "#7c3aed22" : "transparent",
              color:      showFavOnly ? "#a78bfa"   : "#6b7280",
              border:     `1px solid ${showFavOnly ? "#7c3aed33" : "transparent"}`,
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24"
              fill={showFavOnly ? "#a78bfa" : "none"}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={icons.heartFill} />
            </svg>
            Favoriler
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded"
              style={{ background: "#1e1e2c", color: "#6b7280" }}>
              {favorites.size}
            </span>
          </button>

          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5 px-1">Kategoriler</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
          {CATEGORIES.map(cat => (
            <CategoryFolder
              key={cat.id} cat={cat}
              count={categoryCounts[cat.id]}
              isActive={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </nav>

        <div className="px-4 pb-5 pt-3 border-t" style={{ borderColor: "#1e1e2c" }}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Okunuyor", val: safeBooks.filter(b => b.progress > 0 && b.progress < 100).length },
              { label: "Bitti",    val: safeBooks.filter(b => b.progress === 100).length },
            ].map(s => (
              <div key={s.label} className="rounded-lg p-2 text-center"
                style={{ background: "#161622", border: "1px solid #1e1e2c" }}>
                <div className="text-base font-bold text-white">{s.val}</div>
                <div className="text-[10px] text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ background: "#09090b", borderColor: "#1e1e2c" }}>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: activeCat.color }} />
              <h1 className="text-base font-semibold text-white">{activeCat.label}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: activeCat.color + "18", color: activeCat.color }}>
                {filtered.length} kitap
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {favorites.size} favori · {safeBooks.filter(b => b.progress === 100).length} tamamlanan
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: "grid",  icon: icons.grid },
              { id: "shelf", icon: icons.book },
              { id: "list",  icon: icons.list },
            ].map(v => (
              <button key={v.id}
                onClick={() => setView(v.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
                style={{
                  background: view === v.id ? "#1e1e2c" : "transparent",
                  color:      view === v.id ? "#d1d5db" : "#4b5563",
                  border:     `1px solid ${view === v.id ? "#2a2a3c" : "transparent"}`,
                }}>
                <Icon d={v.icon} size={14} />
              </button>
            ))}
            <div className="w-px h-5 mx-1" style={{ background: "#1e1e2c" }} />
            
            {/* Modal Açma Butonu */}
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{ background: "#7c3aed", color: "#fff" }}
              onMouseEnter={e => e.currentTarget.style.background = "#6d28d9"}
              onMouseLeave={e => e.currentTarget.style.background = "#7c3aed"}>
              <Icon d={icons.plus} size={12} />
              Kitap Ekle
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-red-400">
              <Icon d={icons.x} size={32} className="mb-3 opacity-50" />
              <p className="text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "#1e1e2c", color: "#9ca3af" }}>
                Yeniden Dene
              </button>
            </div>
          )}

          {loading && !error && (
            view === "list" ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonList key={i} />)}
              </div>
            ) : (
              <div className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )
          )}

          {!loading && !error && (
            filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                <Icon d={icons.book} size={32} className="mb-3 opacity-30" />
                <p className="text-sm">Kitap bulunamadı</p>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  + Yeni Kitap Ekle
                </button>
              </div>
            ) : view === "shelf" ? (
              <div className="space-y-8">
                {(shelfGroups || []).map(group => {
                  const groupBooks = activeCategory === "all"
                    ? (group.books || [])
                    : group.id === activeCategory ? (group.books || []) : [];
                  if (groupBooks.length === 0) return null;
                  const visibleBooks = groupBooks.filter(b => {
                    if (showFavOnly && !favorites.has(b.id)) return false;
                    if (search) {
                      const q = search.toLowerCase();
                      if (!(b.title || "").toLowerCase().includes(q) &&
                          !(b.author || "").toLowerCase().includes(q)) return false;
                    }
                    return true;
                  });
                  if (visibleBooks.length === 0) return null;
                  return (
                    <div key={group.id}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                          <span className="text-sm font-medium text-gray-300">{group.label}</span>
                          <span className="text-xs text-gray-600">({visibleBooks.length})</span>
                        </div>
                        <div className="flex-1 h-px" style={{ background: "#1e1e2c" }} />
                        <span className="text-xs text-gray-600">kaydırarak incele →</span>
                      </div>
                      <div className="relative">
                        <ShelfRow books={visibleBooks} favorites={favorites}
                          onToggleFavorite={toggleFavorite} />
                        <div className="h-2 rounded-b-sm mt-1"
                          style={{ background: "linear-gradient(180deg, #1f1a14 0%, #110d08 100%)",
                            border: "1px solid #2d1f14", boxShadow: "0 4px 12px #00000060" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : view === "list" ? (
              <div className="space-y-2">
                <div className="flex items-center gap-4 px-4 pb-2 border-b text-xs text-gray-600"
                  style={{ borderColor: "#1e1e2c" }}>
                  <div className="w-9 flex-shrink-0">Kapak</div>
                  <div className="flex-1">Kitap Adı</div>
                  <div className="w-20 text-right">Etiket</div>
                  <div className="w-28 text-right">İlerleme</div>
                  <div className="w-6"></div>
                </div>
                {(filtered || []).map(book => (
                  <BookCard key={book.id} book={book}
                    isFavorite={favorites.has(book.id)}
                    onToggleFavorite={toggleFavorite}
                    view="list" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                {(filtered || []).map(book => (
                  <BookCard key={book.id} book={book}
                    isFavorite={favorites.has(book.id)}
                    onToggleFavorite={toggleFavorite}
                    view="grid" />
                ))}
              </div>
            )
          )}
        </div>

        <footer className="flex items-center gap-6 px-6 py-3 border-t flex-shrink-0"
          style={{ background: "#09090b", borderColor: "#1e1e2c" }}>
          {statsFooter.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full"
                style={{ background: s.color || "#4b5563" }} />
              <span className="text-xs text-gray-500">{s.label}:</span>
              <span className="text-xs font-semibold"
                style={{ color: s.color || "#9ca3af" }}>{s.val}</span>
            </div>
          ))}
          <div className="ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Genel İlerleme</span>
              <div className="w-24 h-1.5 rounded-full bg-[#1e1e2c] overflow-hidden">
                <div className="h-full rounded-full"
                  style={{
                    width: `${totalProgress}%`,
                    background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
                  }} />
              </div>
              <span className="text-xs text-purple-400 font-medium">
                {totalProgress}%
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* ── Add Book Modal Rendering ── */}
      {isAddModalOpen && (
        <AddBookModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={(newBook) => setBooks(prev => [...prev, newBook])} 
        />
      )}

    </div>
  );
}
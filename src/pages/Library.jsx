  import { useState, useRef, useCallback, useEffect } from "react";
  import api from '../api/axiosInstance'; // Kendi axios dosyanın yolu neyse onu yaz

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
    check:       "M20 6L9 17l-5-5",
    edit:        "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    trash:       "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  };

  // ── localStorage helpers ──────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { id: "design",       label: "Design",       color: "#34d399" },
  { id: "engineering",  label: "Engineering",  color: "#60a5fa" },
  { id: "productivity", label: "Productivity", color: "#f59e0b" },
  { id: "philosophy",   label: "Philosophy",   color: "#f87171" },
  { id: "business",     label: "Business",     color: "#fb923c" },
];


  // ── Tema Renkleri ─────────────────────────────────────────────────────────────
  const BOOK_THEMES = [
    { id: 'purple', color: ['#a855f7', '#7e22ce'], accent: '#c084fc', spine: '#6b21a8' },
    { id: 'green',  color: ['#34d399', '#059669'], accent: '#6ee7b7', spine: '#047857' },
    { id: 'blue',   color: ['#60a5fa', '#2563eb'], accent: '#93c5fd', spine: '#1d4ed8' },
    { id: 'orange', color: ['#fb923c', '#ea580c'], accent: '#fdba74', spine: '#c2410c' },
    { id: 'red',    color: ['#f87171', '#dc2626'], accent: '#fca5a5', spine: '#b91c1c' },
    { id: 'dark',   color: ['#3f3f46', '#18181b'], accent: '#71717a', spine: '#09090b' },
  ];

  const CAT_COLORS = ["#34d399","#60a5fa","#f59e0b","#f87171","#fb923c","#a78bfa","#e879f9","#22d3ee","#84cc16","#f43f5e"];

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

  // ── Category Manager Modal ────────────────────────────────────────────────────
  function CategoryManagerModal({ categories, onClose, onSave }) {
    const [cats, setCats] = useState(categories.map(c => ({ ...c })));
    const [newLabel, setNewLabel] = useState("");
    const [newColor, setNewColor] = useState(CAT_COLORS[0]);
    const [editingId, setEditingId] = useState(null);
    const [editLabel, setEditLabel] = useState("");

    const addCategory = () => {
      const label = newLabel.trim();
      if (!label) return;
      const id = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") + "_" + Date.now();
      setCats(prev => [...prev, { id, label, color: newColor }]);
      setNewLabel("");
      setNewColor(CAT_COLORS[Math.floor(Math.random() * CAT_COLORS.length)]);
    };

    const deleteCategory = (id) => {
      setCats(prev => prev.filter(c => c.id !== id));
    };

    const startEdit = (cat) => {
      setEditingId(cat.id);
      setEditLabel(cat.label);
    };

    const saveEdit = (id) => {
      const label = editLabel.trim();
      if (!label) { setEditingId(null); return; }
      setCats(prev => prev.map(c => c.id === id ? { ...c, label } : c));
      setEditingId(null);
    };

    const updateColor = (id, color) => {
      setCats(prev => prev.map(c => c.id === id ? { ...c, color } : c));
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        
        <div className="w-full max-w-md rounded-2xl flex flex-col shadow-2xl"
          style={{ background: '#16161e', border: '1px solid #252530', maxHeight: '85vh' }}>
          
          <div className="px-5 py-4 border-b flex justify-between items-center shrink-0" style={{ borderColor: '#1e1e26' }}>
            <h2 className="text-[15px] font-semibold text-gray-200">Kategorileri Yönet</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
              <Icon d={icons.x} size={18} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex flex-col gap-4">
            {/* Mevcut kategoriler */}
            <div className="flex flex-col gap-2">
              {cats.map(cat => (
                <div key={cat.id} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  style={{ background: '#0e0e14', border: '1px solid #252530' }}>
                  
                  {/* Renk seçici */}
                  <div className="relative group/color flex-shrink-0">
                    <div className="w-5 h-5 rounded-full cursor-pointer border-2"
                      style={{ background: cat.color, borderColor: cat.color + '88' }} />
                    <div className="absolute left-0 top-7 z-10 hidden group-hover/color:flex flex-wrap gap-1 p-2 rounded-lg shadow-xl"
                      style={{ background: '#1e1e2c', border: '1px solid #252535', width: 120 }}>
                      {CAT_COLORS.map(c => (
                        <button key={c} onClick={() => updateColor(cat.id, c)}
                          className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                          style={{ background: c, borderColor: cat.color === c ? 'white' : 'transparent' }} />
                      ))}
                    </div>
                  </div>

                  {editingId === cat.id ? (
                    <input
                      autoFocus
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                      onBlur={() => saveEdit(cat.id)}
                      className="flex-1 text-sm text-white bg-transparent outline-none border-b"
                      style={{ borderColor: '#7c3aed' }}
                    />
                  ) : (
                    <span className="flex-1 text-sm text-gray-200">{cat.label}</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(cat)} className="text-gray-600 hover:text-gray-300 transition-colors p-1">
                      <Icon d={icons.edit} size={13} />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                      <Icon d={icons.trash} size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Yeni kategori ekle */}
            <div className="pt-2 border-t" style={{ borderColor: '#1e1e26' }}>
              <label style={labelStyle}>Yeni Kategori</label>
              <div className="flex items-center gap-2">
                <div className="relative group/newcolor flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg cursor-pointer border"
                    style={{ background: newColor, borderColor: newColor + '88' }} />
                  <div className="absolute left-0 top-9 z-10 hidden group-hover/newcolor:flex flex-wrap gap-1 p-2 rounded-lg shadow-xl"
                    style={{ background: '#1e1e2c', border: '1px solid #252535', width: 120 }}>
                    {CAT_COLORS.map(c => (
                      <button key={c} onClick={() => setNewColor(c)}
                        className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                        style={{ background: c, borderColor: newColor === c ? 'white' : 'transparent' }} />
                    ))}
                  </div>
                </div>
                <input
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addCategory(); }}
                  placeholder="Kategori adı..."
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={addCategory} disabled={!newLabel.trim()}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-40 transition-colors flex-shrink-0"
                  style={{ background: '#7c3aed' }}>
                  Ekle
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t flex justify-end gap-3 shrink-0" style={{ borderColor: '#1e1e26' }}>
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:text-white transition-colors"
              style={{ background: 'transparent', border: '1px solid #2a2a36' }}>
              İptal
            </button>
            <button onClick={() => { onSave(cats); onClose(); }}
              className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white"
              style={{ background: '#7c3aed' }}>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Add Book Modal Component ──────────────────────────────────────────────────
  // ── Add Book Modal Component ──────────────────────────────────────────────────
function AddBookModal({ categories, onClose, onAdd, initialData }) { // <-- initialData eklendi
  
  // Eğer initialData varsa (düzenleme yapıyorsak), mevcut verileri form'a dolduruyoruz
  const [form, setForm] = useState({
    title: initialData?.title || '', 
    author: initialData?.author || '', 
    category: initialData?.tags?.[0] || categories[0]?.id || '',
    pages: initialData?.pages || '', 
    // Sayfa hesabı (progress üzerinden current page bulma)
    currentPage: initialData ? Math.round((initialData.progress / 100) * initialData.pages) : '', 
    cover: initialData?.cover || '', 
    description: initialData?.description || '',
    year: initialData?.year || new Date().getFullYear(), 
    theme: BOOK_THEMES.find(t => t.color[0] === initialData?.color?.[0]) || BOOK_THEMES[0]
  });

  const update = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleSubmit = () => {
  if (!form.title.trim() || !form.author.trim() || !form.pages) return;

      const totalP = parseInt(form.pages) || 1;
      const currP  = parseInt(form.currentPage) || 0;
      const progress = Math.min(100, Math.max(0, Math.round((currP / totalP) * 100)));
      const pubYear = parseInt(form.year) || new Date().getFullYear();

      // Backend'e gidecek EKSİKSİZ paket:
      const bookPayload = {
        title: form.title, 
        author: form.author, 
        category: form.category,
        description: form.description, 
        progress, 
        pages: totalP,
        year: pubYear, 
        rating: initialData?.rating || 0, 
        isFavorite: initialData?.isFavorite || false,
        
        // EKLENEN YENİ ÖZELLİKLER (Renk ve Kapak)
        cover: form.cover || form.title.substring(0, 2).toUpperCase(),
        color: form.theme.color,
        accent: form.theme.accent,
        spine: form.theme.spine
      };
      
      onAdd(bookPayload);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
  // ... kodun devamı aynı
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        
        <div className="w-full max-w-lg rounded-2xl flex flex-col shadow-2xl"
          style={{ background: '#16161e', border: '1px solid #252530', maxHeight: '90vh' }}>
          
          <div className="px-5 py-4 border-b flex justify-between items-center shrink-0" style={{ borderColor: '#1e1e26' }}>
            <h2 className="text-[15px] font-semibold text-gray-200">Yeni Kitap Ekle</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
              <Icon d={icons.x} size={18} />
            </button>
          </div>

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
                  {categories.map(c => (
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
<textarea
  value={form.description}
  onChange={e => update('description', e.target.value.substring(0, 200))}
  placeholder="Kitap hakkında kısa notlar..."
  rows={3}
  maxLength={200}
  style={{ ...inputStyle, resize: 'vertical' }}
/>
{/* Karakter sayacı */}
<div style={{ textAlign: 'right', fontSize: 11, color: '#55556a', marginTop: 4 }}>
  {form.description.length}/200
</div>            </div>
          </div>

          <div className="px-5 py-4 border-t flex justify-end gap-3 shrink-0" style={{ borderColor: '#1e1e26' }}>
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:text-white transition-colors" style={{ background: 'transparent', border: '1px solid #2a2a36' }}>
              İptal
            </button>
            <button onClick={handleSubmit} disabled={!form.title || !form.author || !form.pages}
              className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#7c3aed' }}>
              Kitabı Ekle
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
        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" style={{ background: "#1e1e2c" }} />
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
    function BookCard({ book, isFavorite, onToggleFavorite, view, onEdit, onDelete, onRate }) {
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
            // SONDAN 'relative' KELİMESİNİ SİLDİK, BOYUTLAR ARTIK ÖN YÜZLE BİREBİR AYNI!
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
              {/* BACK yüzündeki ilk <div> — flex-1 ve overflow ekle */}
<div className="flex-1 overflow-hidden flex flex-col">
  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
    <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2 pr-8">{book.title}</h4>
    <div className="flex gap-2 relative z-10">
      <button onClick={(e) => { e.stopPropagation(); onEdit(book); }} className="text-gray-400 hover:text-blue-400 transition-colors">
        <Icon d={icons.edit} size={14} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onDelete(book.id); }} className="text-gray-400 hover:text-red-400 transition-colors">
        <Icon d={icons.trash} size={14} />
      </button>
    </div>
  </div>
  <p className="text-gray-500 text-xs mb-2">{book.author} · {book.year} · {book.pages}p</p>
  {/* Description — flex-1 ile kalan alanı doldurur, overflow ile kesilir */}
  <p
    className="text-gray-400 text-xs leading-relaxed flex-1"
    style={{
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 5,
      WebkitBoxOrient: 'vertical',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      whiteSpace: 'normal',
    }}
  >
    {(book.description || '').substring(0, 200)}
  </p>
</div>
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              {/* YILDIZLAR SİSTEMİ */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={(e) => { e.stopPropagation(); onRate(book, s); }} className="transition-transform hover:scale-125">
                    <svg width="14" height="14" viewBox="0 0 24 24"
                      fill={s <= (book.rating || 0) ? "#f59e0b" : "none"}
                      stroke={s <= (book.rating || 0) ? "#f59e0b" : "#374151"}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icons.star} />
                    </svg>
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-600">Puanla</span>
            </div>
          </div>
        </div>
      </div>
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

 const mapBackendToFrontendBook = (b) => {
  const themeIndex = typeof b.id === 'number' ? b.id % BOOK_THEMES.length : 0;
  
  // Backend color array olarak döndürüyor mu kontrol et
  // Eğer color yoksa colorStart/colorEnd'den oluştur
  let colorArray = null;
  if (b.color && Array.isArray(b.color) && b.color.length >= 2) {
    colorArray = b.color;
  } else if (b.colorStart && b.colorEnd) {
    colorArray = [b.colorStart, b.colorEnd];
  } else if (b.colorStart) {
    colorArray = [b.colorStart, b.colorStart];
  }

  const theme = colorArray
    ? { color: colorArray, accent: b.accent || '#c084fc', spine: b.spine || '#6b21a8' }
    : BOOK_THEMES[themeIndex] || BOOK_THEMES[0];

  return {
    ...b,
    isFavorite: b.favorite ?? b.isFavorite ?? false,
    cover: b.cover || (b.title ? b.title.substring(0, 2).toUpperCase() : 'BK'),
    color: theme.color,
    accent: theme.accent,
    spine: theme.spine,
    tags: [b.category || 'Genel'],
  };
};

  // ── Main Component ────────────────────────────────────────────────────────────
  export default function Library() {
    const [books,          setBooks]          = useState([]);
    const [categories,     setCategories]     = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [activeCategory, setActiveCategory] = useState("all");
    const [favorites,      setFavorites]      = useState(new Set());
    const [search,         setSearch]         = useState("");
    const [view,           setView]           = useState("grid");
    const [showFavOnly,    setShowFavOnly]    = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState(null); // <-- YENİ EKLENDİ

    // ── KİTAP SİL ──
    const handleDeleteBook = async (id) => {
      try {
        await api.delete(`/api/library/${id}`);
        setBooks(prev => prev.filter(b => b.id !== id));
      } catch (err) { console.error("Silinemedi:", err); }
    };

   const handleRateBook = async (book, newRating) => {
  setBooks(prev => prev.map(b => b.id === book.id ? { ...b, rating: newRating } : b));
  try {
    const payload = {
      title:       book.title,
      author:      book.author,
      category:    book.category,
      description: book.description,
      progress:    book.progress,
      pages:       book.pages,
      year:        book.year,
      rating:      newRating,
      favorite:    book.isFavorite ?? false,  // ← boolean, null olmasın
      cover:       book.cover,
      // color, accent, spine YOK — backend'e gönderme
    };
    await api.put(`/api/library/${book.id}`, payload);
  } catch (err) {
    console.error("Puanlanamadı:", err.response?.data || err);
  }
};

   // ── YENİ EKLE VEYA GÜNCELLE ──
const handleSaveBook = async (payload) => {
  try {
    // ✅ color/accent/spine'ı ÇIKARMA — backend'e gönder, DB'ye kaydedilsin
    const { isFavorite, tags, ...rest } = payload;
    const backendPayload = {
      ...rest,
      favorite: isFavorite ?? false,
    };

    if (editingBook) {
      const res = await api.put(`/api/library/${editingBook.id}`, backendPayload);
      setBooks(prev => prev.map(b =>
        b.id === editingBook.id ? mapBackendToFrontendBook(res.data.data) : b
      ));
    } else {
      const res = await api.post('/api/library', backendPayload);
      setBooks(prev => [...prev, mapBackendToFrontendBook(res.data.data)]);
    }
    setIsAddModalOpen(false);
    setEditingBook(null);
  } catch (err) {
    console.error("Kaydedilemedi:", err.response?.data || err);
  }
};
    // ── İlk yükleme: localStorage'dan oku ──────────────────────────────────────
    // ── İlk yükleme: Gerçek veritabanından oku ──
   useEffect(() => {
  const fetchData = async () => {
    try {
      // Kitapları yükle
      const booksRes = await api.get('/api/library');
      const data = booksRes.data.data || booksRes.data;
      const mappedBooks = data.map(mapBackendToFrontendBook);
      setBooks(mappedBooks);
      setFavorites(new Set(mappedBooks.filter(b => b.isFavorite).map(b => b.id)));

      // Kategorileri backend'den yükle
      const catsRes = await api.get('/api/categories');
      const cats = catsRes.data.data || catsRes.data;
      
      // Hiç kategori yoksa default'ları kaydet
      if (cats.length === 0) {
        await api.post('/api/categories/save-all', DEFAULT_CATEGORIES.map(c => ({
          categoryId: c.id,
          label: c.label,
          color: c.color
        })));
        setCategories(DEFAULT_CATEGORIES);
      } else {
        setCategories(cats.map(c => ({
          id: c.categoryId,
          label: c.label,
          color: c.color,
          dbId: c.id  // silme için
        })));
      }
    } catch (err) {
      console.error("Veri yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

    // ── Kitap ekle ──────────────────────────────────────────────────────────────
    // ── Kitap ekle: Backend'e gönder ──
    const handleAddBook = async (newBookPayload) => {
      try {
        const res = await api.post('/api/library', newBookPayload);
        const savedBook = res.data.data || res.data;
        
        const mappedNewBook = mapBackendToFrontendBook(savedBook);
        setBooks(prev => [...prev, mappedNewBook]);
        setIsAddModalOpen(false);
      } catch (err) {
        console.error("Kitap eklenemedi:", err);
      }
    };

    // ── Favori toggle ────────────────────────────────────────────────────────────
    const toggleFavorite = async (id) => {
      setFavorites(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });

      setBooks(prev => prev.map(b => 
        b.id === id ? { ...b, isFavorite: !b.isFavorite } : b
      ));

      try {
        await api.patch(`/api/library/${id}/favorite`); // Backend'i de güncelle
      } catch (err) {
        console.error("Favori kaydedilemedi:", err);
      }
    };

    // ── Kategori kaydet ──────────────────────────────────────────────────────────
    const handleSaveCategories = useCallback(async (newCats) => {
  setCategories(newCats);
  try {
    await api.post('/api/categories/save-all', newCats.map(c => ({
      categoryId: c.id,
      label: c.label,
      color: c.color
    })));
  } catch (err) {
    console.error("Kategoriler kaydedilemedi:", err);
  }
  if (!newCats.find(c => c.id === activeCategory)) {
    setActiveCategory("all");
  }
}, [activeCategory]);

    const allCategories = [{ id: "all", label: "Tümü", color: "#a78bfa" }, ...categories];

    const safeBooks = books || [];

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

    const shelfGroups = categories.map(cat => ({
      ...cat,
      books: safeBooks.filter(b => b.category === cat.id),
    }));

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
      <div className="flex flex-col h-screen w-full overflow-hidden"
        style={{ background: "#09090b", color: "#e5e7eb", fontFamily: "'Inter', system-ui, sans-serif" }}>

        {/* ── Header ── */}
        <header className="px-6 py-5 border-b flex-shrink-0" style={{ background: "#09090b", borderColor: "#1e1e2c" }}>
          
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                <Icon d={icons.book} size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Kütüphane</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {safeBooks.length} kitap · {favorites.size} favori · {safeBooks.filter(b => b.progress === 100).length} tamamlanan
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Görünüm Değiştiriciler */}
              <div className="flex items-center gap-1 bg-[#161622] p-1 rounded-lg border border-[#1e1e2c]">
                {[
                  { id: "grid",  icon: icons.grid },
                  { id: "shelf", icon: icons.book },
                  { id: "list",  icon: icons.list },
                ].map(v => (
                  <button key={v.id} onClick={() => setView(v.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150"
                    style={{
                      background: view === v.id ? "#252535" : "transparent",
                      color:      view === v.id ? "#d1d5db" : "#6b7280",
                    }}>
                    <Icon d={v.icon} size={14} />
                  </button>
                ))}
              </div>

              {/* Kategori Yönet Butonu */}
              <button
                onClick={() => setIsCatModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border border-transparent"
                style={{ background: "#1e1e28", color: "#9090a0", borderColor: "#252530" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#252535"; e.currentTarget.style.color = "#c0c0d0"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#1e1e28"; e.currentTarget.style.color = "#9090a0"; }}>
                <Icon d={icons.folder} size={14} />
                Kategoriler
              </button>

              {/* Yeni Ekle Butonu */}
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border border-transparent"
                style={{ background: "#252535", color: "#9d9cf8", borderColor: "rgba(108,106,246,0.35)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1e1e28"; e.currentTarget.style.color = "#c0c0d0"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#252535"; e.currentTarget.style.color = "#9d9cf8"; }}>
                <Icon d={icons.plus} size={14} />
                Kitap Ekle
              </button>
            </div>
          </div>

          {/* Arama ve Filtre */}
          <div className="flex items-center gap-3">
            <div className="relative w-64 flex-shrink-0">
              <Icon d={icons.search} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Kitap ara..."
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg outline-none transition-all duration-200"
                style={{ background: "#111119", border: "1px solid #1e1e2c", color: "#d1d5db" }}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                  <Icon d={icons.x} size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {allCategories.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                    style={{
                      background: isActive ? "#252535" : "transparent",
                      color: isActive ? "#9d9cf8" : "#9090a0",
                      border: `1px solid ${isActive ? "rgba(108,106,246,0.35)" : "#252530"}`
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#1e1e28"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                    {cat.label}
                  </button>
                );
              })}
              
              <div className="w-px h-5 mx-1" style={{ background: "#1e1e2c" }} />
              
              <button onClick={() => setShowFavOnly(!showFavOnly)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                style={{
                  background: showFavOnly ? "#252535" : "transparent",
                  color: showFavOnly ? "#f43f5e" : "#9090a0",
                  border: `1px solid ${showFavOnly ? "rgba(244,63,94,0.35)" : "#252530"}`
                }}
                onMouseEnter={e => { if (!showFavOnly) e.currentTarget.style.background = "#1e1e28"; }}
                onMouseLeave={e => { if (!showFavOnly) e.currentTarget.style.background = "transparent"; }}>
                <Icon d={icons.heartFill} size={13} className={showFavOnly ? "text-rose-500" : "text-gray-500"} />
                Favoriler
              </button>
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
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

          {!loading && (
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
                    onEdit={(b) => { setEditingBook(b); setIsAddModalOpen(true); }} // <-- Eklendi
                    onDelete={handleDeleteBook} // <-- Eklendi
                    onRate={handleRateBook} // <-- Eklendi
                    view="grid" />
                ))}
              </div>
            )
          )}
        </main>

        {/* ── Footer ── */}
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

        {/* ── Modals ── */}
        {isAddModalOpen && (
          <AddBookModal
            categories={categories}
            initialData={editingBook} // <-- Düzenleme verisini içeri gönderiyoruz
            onClose={() => { setIsAddModalOpen(false); setEditingBook(null); }}
            onAdd={handleSaveBook} // <-- Artık handleSaveBook tetiklenecek
          />
        )}

        {isCatModalOpen && (
          <CategoryManagerModal
            categories={categories}
            onClose={() => setIsCatModalOpen(false)}
            onSave={handleSaveCategories}
          />
        )}
      </div>
    );
  }

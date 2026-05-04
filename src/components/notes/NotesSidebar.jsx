import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconChevronRight = ({ className = '' }) => (
  <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

const IconFolder = ({ open = false }) => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    {open ? (
      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clipRule="evenodd" />
    ) : (
      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    )}
  </svg>
);

const IconNote = () => (
  <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
  </svg>
);

const IconStar = ({ filled = false }) => (
  <svg width="11" height="11" viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const IconPlus = () => (
  <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const IconDots = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const IconSearch = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

const IconHash = () => (
  <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z" clipRule="evenodd" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_FAVORITES = [
  { id: 'f1', title: 'Proje Planı 2025', path: '/dashboard/notes/f1', emoji: '🗺️' },
  { id: 'f2', title: 'Haftalık Toplantı', path: '/dashboard/notes/f2', emoji: '📋' },
  { id: 'f3', title: 'Fikir Havuzu',      path: '/dashboard/notes/f3', emoji: '💡' },
];

const INITIAL_FOLDERS = [
  {
    id: 'work',
    name: 'İş',
    emoji: '💼',
    color: '#6c6af6',
    children: [
      { id: 'w1', title: 'Q2 OKR\'lar',        path: '/dashboard/notes/w1', tags: ['strateji'] },
      { id: 'w2', title: 'Müşteri Görüşmeleri', path: '/dashboard/notes/w2', tags: ['satış'] },
      { id: 'w3', title: 'Roadmap',             path: '/dashboard/notes/w3', tags: ['ürün'] },
      {
        id: 'design-sub',
        name: 'Tasarım',
        emoji: '🎨',
        color: '#f472b6',
        children: [
          { id: 'd1', title: 'Figma Notları',   path: '/dashboard/notes/d1', tags: [] },
          { id: 'd2', title: 'Design Tokens',   path: '/dashboard/notes/d2', tags: [] },
        ],
      },
    ],
  },
  {
    id: 'personal',
    name: 'Kişisel',
    emoji: '🌿',
    color: '#34d399',
    children: [
      { id: 'p1', title: 'Günlük',        path: '/dashboard/notes/p1', tags: ['rutin'] },
      { id: 'p2', title: 'Kitap Notları', path: '/dashboard/notes/p2', tags: ['okuma'] },
      { id: 'p3', title: 'Hedefler',      path: '/dashboard/notes/p3', tags: ['motivasyon'] },
    ],
  },
  {
    id: 'resources',
    name: 'Kaynaklar',
    emoji: '📚',
    color: '#fb923c',
    children: [
      { id: 'r1', title: 'Faydalı Linkler', path: '/dashboard/notes/r1', tags: [] },
      { id: 'r2', title: 'Snippet\'ler',    path: '/dashboard/notes/r2', tags: ['kod'] },
    ],
  },
];

// ─── Context Menu ─────────────────────────────────────────────────────────────

function ContextMenu({ x, y, onClose, items }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ top: y, left: x, position: 'fixed', zIndex: 9999 }}
      className="min-w-[150px] rounded-lg border border-[#2a2a36] bg-[#1a1a22] py-1 shadow-2xl shadow-black/40"
    >
      {items.map((item, i) =>
        item === 'divider' ? (
          <div key={i} className="my-1 border-t border-[#2a2a36]" />
        ) : (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            className={[
              'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px]',
              'transition-colors duration-100',
              item.danger
                ? 'text-[#f87171] hover:bg-[#2a1520]'
                : 'text-[#c0c0cc] hover:bg-[#1e1e28] hover:text-white',
            ].join(' ')}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

// ─── Note Row ─────────────────────────────────────────────────────────────────

function NoteRow({ note, depth = 1 }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const [ctx, setCtx] = useState(null);

  const isActive = location.pathname === note.path;
  const indent = depth * 12 + 8;

  const handleContextMenu = (e) => {
    e.preventDefault();
    setCtx({ x: e.clientX, y: e.clientY });
  };

  const ctxItems = [
    { label: '⭐ Favorilere Ekle', action: () => {} },
    { label: '✏️ Yeniden Adlandır', action: () => {} },
    { label: '📋 Kopyala', action: () => {} },
    'divider',
    { label: '🗑️ Sil', action: () => {}, danger: true },
  ];

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onContextMenu={handleContextMenu}
      >
        <Link
          to={note.path}
          aria-current={isActive ? 'page' : undefined}
          style={{ paddingLeft: indent }}
          className={[
            'group flex items-center gap-1.5 rounded-md py-[5px] pr-2',
            'transition-all duration-100 ease-out',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6c6af6]/50',
            isActive
              ? 'bg-[#202030] text-[#d0d0e8]'
              : 'text-[#7070848] hover:bg-[#181822] hover:text-[#c0c0cc] text-[#70708a]',
          ].join(' ')}
        >
          {/* Active pip */}
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[55%] w-[2px] rounded-r-full bg-[#6c6af6]" />
          )}

          <span className={['flex-shrink-0 transition-colors', isActive ? 'text-[#9d9cf8]' : 'text-[#404055]'].join(' ')}>
            <IconNote />
          </span>

          <span className="flex-1 truncate text-[12.5px] font-[440] leading-none tracking-[-0.01em]">
            {note.title}
          </span>

          {/* Tags */}
          {note.tags?.length > 0 && hovered && (
            <span className="flex-shrink-0 flex items-center gap-0.5 text-[#404055]">
              <IconHash />
              <span className="text-[10px]">{note.tags[0]}</span>
            </span>
          )}

          {/* Action dots */}
          {hovered && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCtx({ x: e.clientX, y: e.clientY }); }}
              className="flex-shrink-0 flex h-4 w-4 items-center justify-center rounded text-[#404055] hover:bg-[#2a2a3a] hover:text-[#9090a8] transition-colors"
            >
              <IconDots />
            </button>
          )}
        </Link>
      </div>

      {ctx && (
        <ContextMenu
          x={ctx.x} y={ctx.y}
          onClose={() => setCtx(null)}
          items={ctxItems}
        />
      )}
    </>
  );
}

// ─── Folder Row ───────────────────────────────────────────────────────────────

function FolderRow({ folder, depth = 0, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);
  const [ctx, setCtx] = useState(null);

  const indent = depth * 12 + 8;

  const handleContextMenu = (e) => {
    e.preventDefault();
    setCtx({ x: e.clientX, y: e.clientY });
  };

  const ctxItems = [
    { label: '📝 Yeni Not', action: () => {} },
    { label: '📁 Yeni Klasör', action: () => {} },
    'divider',
    { label: '✏️ Yeniden Adlandır', action: () => {} },
    { label: '🎨 İkon Değiştir', action: () => {} },
    'divider',
    { label: '🗑️ Sil', action: () => {}, danger: true },
  ];

  return (
    <div>
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onContextMenu={handleContextMenu}
      >
        <button
          onClick={() => setOpen(o => !o)}
          style={{ paddingLeft: indent }}
          className={[
            'group flex w-full items-center gap-1.5 rounded-md py-[5px] pr-2',
            'transition-all duration-100 ease-out text-left',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6c6af6]/50',
            open || hovered
              ? 'bg-[#181822] text-[#b0b0c8]'
              : 'text-[#60607a] hover:bg-[#181822] hover:text-[#b0b0c8]',
          ].join(' ')}
        >
          {/* Chevron */}
          <span
            className="flex-shrink-0 text-[#404055] transition-transform duration-150"
            style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <IconChevronRight />
          </span>

          {/* Emoji */}
          <span className="flex-shrink-0 text-[13px] leading-none select-none">{folder.emoji}</span>

          {/* Name */}
          <span className="flex-1 truncate text-[12.5px] font-[530] leading-none tracking-[-0.01em]">
            {folder.name}
          </span>

          {/* Color dot */}
          <span
            className="flex-shrink-0 h-1.5 w-1.5 rounded-full opacity-60"
            style={{ backgroundColor: folder.color }}
          />

          {/* Hover actions */}
          {hovered && (
            <div className="flex-shrink-0 flex items-center gap-0.5">
              <button
                onClick={(e) => { e.stopPropagation(); /* new note action */ }}
                className="flex h-4 w-4 items-center justify-center rounded text-[#404055] hover:bg-[#2a2a3a] hover:text-[#9090a8] transition-colors"
                title="Yeni not ekle"
              >
                <IconPlus />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCtx({ x: e.clientX, y: e.clientY }); }}
                className="flex h-4 w-4 items-center justify-center rounded text-[#404055] hover:bg-[#2a2a3a] hover:text-[#9090a8] transition-colors"
              >
                <IconDots />
              </button>
            </div>
          )}
        </button>
      </div>

      {/* Children */}
      <div
        className="overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          maxHeight: open ? '1000px' : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <div className="pt-0.5 pb-0.5">
          {folder.children.map(child =>
            child.children ? (
              <FolderRow key={child.id} folder={child} depth={depth + 1} />
            ) : (
              <NoteRow key={child.id} note={child} depth={depth + 1} />
            )
          )}
        </div>
      </div>

      {ctx && (
        <ContextMenu
          x={ctx.x} y={ctx.y}
          onClose={() => setCtx(null)}
          items={ctxItems}
        />
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label, action, actionLabel }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex items-center justify-between px-2 mb-0.5 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="text-[10px] font-[600] uppercase tracking-[0.08em] text-[#404055] select-none">
        {label}
      </span>
      {action && (
        <button
          onClick={action}
          title={actionLabel}
          className={[
            'flex h-4 w-4 items-center justify-center rounded',
            'text-[#404055] transition-all duration-100',
            hovered ? 'opacity-100 hover:bg-[#1e1e2a] hover:text-[#9090a8]' : 'opacity-0',
          ].join(' ')}
        >
          <IconPlus />
        </button>
      )}
    </div>
  );
}

// ─── Favorites Row ────────────────────────────────────────────────────────────

function FavoriteRow({ item }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const isActive = location.pathname === item.path;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={item.path}
        aria-current={isActive ? 'page' : undefined}
        className={[
          'flex items-center gap-2 rounded-md py-[5px] px-2',
          'transition-all duration-100 ease-out',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6c6af6]/50',
          isActive
            ? 'bg-[#202030] text-[#d0d0e8]'
            : 'text-[#70708a] hover:bg-[#181822] hover:text-[#c0c0cc]',
        ].join(' ')}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[55%] w-[2px] rounded-r-full bg-[#6c6af6]" />
        )}

        <span className="flex-shrink-0 text-[12px] leading-none select-none">{item.emoji}</span>
        <span className="flex-1 truncate text-[12.5px] font-[440] leading-none tracking-[-0.01em]">
          {item.title}
        </span>

        {hovered && (
          <span className="flex-shrink-0 text-amber-400/70">
            <IconStar filled />
          </span>
        )}
      </Link>
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar() {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');

  return (
    <div
      className={[
        'mx-2 mb-3 flex items-center gap-2 rounded-lg px-2.5 py-1.5',
        'border transition-all duration-150',
        focused
          ? 'border-[#6c6af6]/40 bg-[#181826]'
          : 'border-[#1e1e28] bg-[#141420] hover:border-[#2a2a38]',
      ].join(' ')}
    >
      <span className="flex-shrink-0 text-[#40405a]">
        <IconSearch />
      </span>
      <input
        type="text"
        placeholder="Notlarda ara…"
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={[
          'flex-1 bg-transparent text-[12px] leading-none text-[#c0c0cc]',
          'placeholder:text-[#35354a] outline-none',
        ].join(' ')}
      />
      {value && (
        <button onClick={() => setValue('')} className="flex-shrink-0 text-[#40405a] hover:text-[#8080a0] transition-colors">
          <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── New Note Button ──────────────────────────────────────────────────────────

function NewNoteButton() {
  return (
    <button
      className={[
        'mx-2 mb-3 flex w-[calc(100%-16px)] items-center gap-2 rounded-lg px-2.5 py-1.5',
        'border border-dashed border-[#252535]',
        'text-[#404055] hover:border-[#6c6af6]/30 hover:bg-[#181826] hover:text-[#9090a8]',
        'transition-all duration-150 group',
      ].join(' ')}
    >
      <span className="flex-shrink-0 transition-transform duration-150 group-hover:rotate-90">
        <IconPlus />
      </span>
      <span className="text-[12px] font-[440]">Yeni Not</span>
      <span className="ml-auto text-[10px] text-[#2a2a3a] group-hover:text-[#3a3a50]">⌘N</span>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotesSidebar() {
  const [folders, setFolders] = useState(INITIAL_FOLDERS);
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);
  const [favCollapsed, setFavCollapsed] = useState(false);

  return (
    <div
      className={[
        'flex h-full flex-col',
        'bg-[#10101a] border-r border-[#1a1a24]',
        // Custom minimal scrollbar on children nav
        '[&_.notes-scroll::-webkit-scrollbar]:w-[3px]',
        '[&_.notes-scroll::-webkit-scrollbar-track]:bg-transparent',
        '[&_.notes-scroll::-webkit-scrollbar-thumb]:rounded-full',
        '[&_.notes-scroll::-webkit-scrollbar-thumb]:bg-[#2a2a36]',
      ].join(' ')}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-[#1a1a24] px-3">
        <div className="flex items-center gap-2">
          <span className="text-[14px] leading-none select-none">📝</span>
          <span className="text-[13px] font-[580] tracking-[-0.02em] text-[#c8c8dc]">Notlar</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Yeni not (⌘N)"
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#404055] hover:bg-[#1e1e2a] hover:text-[#9090a8] transition-all duration-100"
          >
            <IconPlus />
          </button>
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 pt-3">
        <SearchBar />
        <NewNoteButton />
      </div>

      {/* ── Scrollable tree ──────────────────────────────────────────────── */}
      <div
        className={[
          'notes-scroll flex-1 overflow-y-auto overflow-x-hidden px-1.5 pb-4',
          'scrollbar-thin',
        ].join(' ')}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#2a2a36 transparent',
        }}
      >

        {/* Favorites section */}
        <div className="mb-3">
          <button
            onClick={() => setFavCollapsed(c => !c)}
            className="flex w-full items-center gap-1 px-2 mb-0.5 group"
          >
            <span
              className="text-[#404055] transition-transform duration-150"
              style={{ transform: favCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
            >
              <IconChevronRight />
            </span>
            <span className="text-[10px] font-[600] uppercase tracking-[0.08em] text-[#404055] select-none">
              Favoriler
            </span>
          </button>

          {!favCollapsed && (
            <div className="flex flex-col gap-0.5">
              {favorites.map(item => (
                <FavoriteRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-2 mb-3 border-t border-[#1a1a24]" />

        {/* Folders section */}
        <div className="mb-2">
          <SectionHeader label="Klasörler" action={() => {}} actionLabel="Yeni klasör" />

          <div className="flex flex-col gap-0.5 mt-1">
            {folders.map((folder, i) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                depth={0}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-2 my-3 border-t border-[#1a1a24]" />

        {/* Tags / Quick filters */}
        <div>
          <SectionHeader label="Etiketler" />
          <div className="mt-1 flex flex-col gap-0.5">
            {['strateji', 'okuma', 'kod', 'rutin', 'ürün', 'satış'].map(tag => (
              <button
                key={tag}
                className="flex items-center gap-2 rounded-md py-[5px] px-2 text-left transition-all duration-100 text-[#50505e] hover:bg-[#181822] hover:text-[#a0a0b8] group"
              >
                <span className="text-[#353548] group-hover:text-[#6060788]">
                  <IconHash />
                </span>
                <span className="text-[12px] font-[440] tracking-[-0.01em]">{tag}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer: note count ────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-[#1a1a24] px-3 py-2.5">
        <p className="text-[10.5px] text-[#2e2e42] select-none">
          8 not · 3 klasör
        </p>
      </div>
    </div>
  );
}

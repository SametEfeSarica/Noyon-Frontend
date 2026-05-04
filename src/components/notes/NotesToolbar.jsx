import { useState, useRef, useEffect, useCallback } from 'react';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const IconClose = () => (
  <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const IconGrid = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const IconList = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const IconSort = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3z" />
  </svg>
);

const IconFilter = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.553.894l-4 2A1 1 0 016 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// ─── Sort Dropdown ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'modified', label: 'Son Düzenleme' },
  { value: 'created',  label: 'Oluşturma Tarihi' },
  { value: 'alpha',    label: 'A → Z' },
  { value: 'alpha-desc', label: 'Z → A' },
];

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = SORT_OPTIONS.find(o => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={[
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
          'border text-[12px] font-[460] transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6c6af6]/50',
          open
            ? 'border-[#6c6af6]/40 bg-[#1a1a2e] text-[#c0c0d8]'
            : 'border-[#1e1e28] bg-[#141420] text-[#70708a] hover:border-[#2a2a38] hover:text-[#a0a0b8]',
        ].join(' ')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <IconSort />
        <span className="hidden sm:inline">{current.label}</span>
        <span
          className="transition-transform duration-150"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <IconChevronDown />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[170px] rounded-xl border border-[#242434] bg-[#16161f] py-1 shadow-2xl shadow-black/50">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={[
                'flex w-full items-center justify-between gap-3 px-3 py-2',
                'text-[12.5px] transition-colors duration-100',
                opt.value === value
                  ? 'text-[#9d9cf8] bg-[#1e1e2e]'
                  : 'text-[#8080a0] hover:bg-[#1a1a28] hover:text-[#c0c0d8]',
              ].join(' ')}
            >
              {opt.label}
              {opt.value === value && (
                <span className="text-[#6c6af6]"><IconCheck /></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Filter Chip ───────────────────────────────────────────────────────────────

function FilterChip({ label, color, onRemove }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
        'text-[11px] font-[500] leading-none',
        'border border-[#2a2a3a] bg-[#18182a] text-[#9090b8]',
        'transition-all duration-100',
      ].join(' ')}
    >
      {color && (
        <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      )}
      {label}
      <button
        onClick={onRemove}
        className="flex-shrink-0 rounded-full text-[#50506a] hover:text-[#a0a0c0] transition-colors ml-0.5"
        aria-label={`${label} filtresini kaldır`}
      >
        <IconClose />
      </button>
    </span>
  );
}

// ─── View Toggle ──────────────────────────────────────────────────────────────

function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center rounded-lg border border-[#1e1e28] bg-[#141420] p-0.5">
      {[
        { value: 'grid', icon: <IconGrid />, label: 'Izgara görünümü' },
        { value: 'list', icon: <IconList />, label: 'Liste görünümü' },
      ].map(({ value, icon, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          aria-label={label}
          aria-pressed={view === value}
          className={[
            'flex h-6 w-6 items-center justify-center rounded-md',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6c6af6]/50',
            view === value
              ? 'bg-[#252535] text-[#9d9cf8] shadow-sm'
              : 'text-[#454560] hover:text-[#8080a0]',
          ].join(' ')}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar({ value, onChange, onFocus, onBlur, focused, inputRef }) {
  return (
    <div
      className={[
        'relative flex items-center gap-2 rounded-xl px-3 py-2',
        'border transition-all duration-200',
        focused
          ? 'border-[#6c6af6]/50 bg-[#15152a] shadow-[0_0_0_3px_rgba(108,106,246,0.08)]'
          : 'border-[#1e1e2a] bg-[#121220] hover:border-[#2a2a38] hover:bg-[#14141f]',
      ].join(' ')}
      style={{ minWidth: focused ? 260 : 200, transition: 'min-width 0.2s cubic-bezier(0.4,0,0.2,1), border-color 0.15s, background 0.15s, box-shadow 0.15s' }}
    >
      {/* Search icon — shifts colour on focus */}
      <span
        className={[
          'flex-shrink-0 transition-colors duration-150',
          focused ? 'text-[#6c6af6]' : 'text-[#35354e]',
        ].join(' ')}
      >
        <IconSearch />
      </span>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Notlarda ara…"
        aria-label="Notlarda ara"
        className={[
          'flex-1 bg-transparent text-[13px] font-[420] leading-none',
          'text-[#c8c8dc] placeholder:text-[#30304a] outline-none',
          // Remove browser default search input chrome
          '[&::-webkit-search-cancel-button]:hidden',
          '[&::-webkit-search-decoration]:hidden',
        ].join(' ')}
      />

      {/* Keyboard shortcut hint — visible only when unfocused and empty */}
      {!focused && !value && (
        <span className="flex-shrink-0 flex items-center gap-0.5 pointer-events-none select-none">
          <kbd className="rounded border border-[#1e1e2a] bg-[#1a1a26] px-1 py-0.5 text-[9px] font-mono text-[#30304a] leading-none">⌘</kbd>
          <kbd className="rounded border border-[#1e1e2a] bg-[#1a1a26] px-1 py-0.5 text-[9px] font-mono text-[#30304a] leading-none">K</kbd>
        </span>
      )}

      {/* Clear button — visible only when there's a value */}
      {value && (
        <button
          onClick={() => { onChange(''); inputRef.current?.focus(); }}
          className="flex-shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#252535] text-[#60607a] hover:bg-[#303045] hover:text-[#a0a0c0] transition-all duration-100"
          aria-label="Aramayı temizle"
        >
          <IconClose />
        </button>
      )}
    </div>
  );
}

// ─── Add Note Button ──────────────────────────────────────────────────────────

function AddNoteButton({ onClick, compact = false }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={() => { setPressed(true); setTimeout(() => setPressed(false), 200); onClick?.(); }}
      aria-label="Yeni not oluştur (⌘N)"
      className={[
        'group relative flex flex-shrink-0 items-center gap-2 overflow-hidden rounded-xl',
        'bg-[#6c6af6] text-white',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c6af6]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e14]',
        'hover:bg-[#7a78f8] active:scale-[0.97]',
        'shadow-[0_1px_8px_rgba(108,106,246,0.35)]',
        compact ? 'h-8 w-8 justify-center' : 'px-3.5 py-2',
        pressed ? 'scale-[0.97]' : '',
      ].join(' ')}
    >
      {/* Shimmer layer */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]"
      />

      <span className={['flex-shrink-0 transition-transform duration-200', 'group-hover:rotate-90'].join(' ')}>
        <IconPlus />
      </span>

      {!compact && (
        <span className="text-[13px] font-[540] tracking-[-0.01em] leading-none">
          Yeni Not
        </span>
      )}

      {!compact && (
        <span className="hidden lg:flex items-center gap-0.5 ml-0.5 opacity-60">
          <kbd className="text-[9px] font-mono leading-none">⌘N</kbd>
        </span>
      )}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

const Divider = () => (
  <div className="h-5 w-px flex-shrink-0 bg-[#1e1e2a]" aria-hidden="true" />
);

// ─── NotesToolbar ─────────────────────────────────────────────────────────────

export default function NotesToolbar({
  // Search
  searchValue = '',
  onSearchChange,
  // View
  view = 'grid',
  onViewChange,
  // Sort
  sortBy = 'modified',
  onSortChange,
  // Active filters
  filters = [],
  onFilterRemove,
  // Actions
  onNewNote,
  // Counts
  totalNotes = 0,
  // Optional: controlled note count display
  activeFolder = 'Tüm Notlar',
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const inputRef = useRef(null);
  const filterRef = useRef(null);

  // ── ⌘K focuses search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        onNewNote?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNewNote]);

  // ── Close filter dropdown on outside click
  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [filterOpen]);

  const hasFilters = filters.length > 0;

  return (
    <div
      className={[
        'flex flex-col gap-0 border-b border-[#1a1a24]',
        'bg-[#0e0e14]',
      ].join(' ')}
    >
      {/* ── Main toolbar row ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3">

        {/* Left: breadcrumb / folder title */}
        <div className="flex flex-shrink-0 items-center gap-2 mr-1 min-w-0 hidden sm:flex">
          <h1 className="truncate text-[14px] font-[600] tracking-[-0.02em] text-[#c8c8dc] leading-none max-w-[140px]">
            {activeFolder}
          </h1>
          {totalNotes > 0 && (
            <span className="flex-shrink-0 rounded-full bg-[#1e1e2c] px-1.5 py-0.5 text-[10px] font-[500] leading-none text-[#50506a]">
              {totalNotes}
            </span>
          )}
        </div>

        <Divider />

        {/* Center: Search bar — grows to fill available space */}
        <div className="flex-1 flex items-center min-w-0">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange ?? (() => {})}
            focused={searchFocused}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            inputRef={inputRef}
          />
        </div>

        {/* Right: actions cluster */}
        <div className="flex flex-shrink-0 items-center gap-2">

          {/* Filter button */}
          <div ref={filterRef} className="relative">
            <button
              onClick={() => setFilterOpen(o => !o)}
              aria-label="Filtrele"
              aria-expanded={filterOpen}
              className={[
                'flex h-8 w-8 items-center justify-center rounded-lg border',
                'transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6c6af6]/50',
                filterOpen || hasFilters
                  ? 'border-[#6c6af6]/40 bg-[#1a1a2e] text-[#9d9cf8]'
                  : 'border-[#1e1e28] bg-[#141420] text-[#454560] hover:border-[#2a2a38] hover:text-[#8080a0]',
              ].join(' ')}
            >
              <IconFilter />
              {hasFilters && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#6c6af6] border-2 border-[#0e0e14]" />
              )}
            </button>

            {/* Filter popover */}
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-[200px] rounded-xl border border-[#242434] bg-[#16161f] p-3 shadow-2xl shadow-black/50">
                <p className="mb-2 text-[10px] font-[600] uppercase tracking-[0.07em] text-[#404055]">
                  Etiket Filtrele
                </p>
                <div className="flex flex-col gap-0.5">
                  {['strateji', 'okuma', 'kod', 'rutin', 'ürün', 'satış'].map(tag => {
                    const active = filters.some(f => f.label === tag);
                    return (
                      <button
                        key={tag}
                        className={[
                          'flex items-center justify-between rounded-md px-2.5 py-1.5',
                          'text-[12px] transition-colors duration-100',
                          active
                            ? 'bg-[#1e1e2e] text-[#9d9cf8]'
                            : 'text-[#70708a] hover:bg-[#1a1a28] hover:text-[#b0b0c8]',
                        ].join(' ')}
                      >
                        #{tag}
                        {active && <span className="text-[#6c6af6]"><IconCheck /></span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sort dropdown */}
          <SortDropdown value={sortBy} onChange={onSortChange ?? (() => {})} />

          <Divider />

          {/* View toggle */}
          <ViewToggle view={view} onChange={onViewChange ?? (() => {})} />

          <Divider />

          {/* New Note CTA */}
          <div className="hidden sm:block">
            <AddNoteButton onClick={onNewNote} />
          </div>
          <div className="sm:hidden">
            <AddNoteButton onClick={onNewNote} compact />
          </div>
        </div>
      </div>

      {/* ── Active filter chips row — only renders when filters are active ─── */}
      {hasFilters && (
        <div
          className="flex items-center gap-2 px-4 sm:px-5 pb-2.5 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <span className="flex-shrink-0 text-[11px] text-[#35354a] font-[450] select-none">
            Filtreler:
          </span>
          {filters.map((filter, i) => (
            <FilterChip
              key={i}
              label={filter.label}
              color={filter.color}
              onRemove={() => onFilterRemove?.(filter)}
            />
          ))}
          <button
            onClick={() => filters.forEach(f => onFilterRemove?.(f))}
            className="flex-shrink-0 text-[11px] text-[#404055] hover:text-[#8080a0] transition-colors duration-100 ml-1"
          >
            Tümünü Temizle
          </button>
        </div>
      )}

      {/* ── Search results hint — shows when searching ────────────────────── */}
      {searchValue && (
        <div className="flex items-center gap-2 px-4 sm:px-5 pb-2.5">
          <span className="text-[11.5px] text-[#404058]">
            <span className="text-[#7070a0] font-[500]">"{searchValue}"</span>
            {' '}için arama sonuçları
          </span>
          <button
            onClick={() => onSearchChange?.('')}
            className="text-[11px] text-[#40405a] hover:text-[#8080a0] transition-colors ml-1"
          >
            Temizle
          </button>
        </div>
      )}
    </div>
  );
}

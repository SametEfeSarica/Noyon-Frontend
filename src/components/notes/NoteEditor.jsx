import { useState, useEffect, useRef, useCallback } from 'react';
import DrawMode from '../../pages/Notes/DrawMode';
import PdfMode from '../../pages/Notes/PdfMode';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconBold = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5 4a1 1 0 011-1h5a4 4 0 013.161 6.447A4.5 4.5 0 0113.5 18H6a1 1 0 01-1-1V4zm2 1v4h4a2 2 0 100-4H7zm0 6v4h5.5a2.5 2.5 0 000-5H7z" />
  </svg>
);

const IconItalic = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8 1a1 1 0 011 1h2a1 1 0 010 2H9.93l-2.86 12H9a1 1 0 010 2H7a1 1 0 01-1-1H4a1 1 0 010-2h1.07l2.86-12H7a1 1 0 01-1-1V2a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const IconUnderline = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5 3a1 1 0 011 1v5a4 4 0 008 0V4a1 1 0 112 0v5a6 6 0 01-12 0V4a1 1 0 011-1z" />
    <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
  </svg>
);

const IconStrikethrough = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4H9a3 3 0 0 0-2.83 4" />
    <path d="M14 12a4 4 0 0 1 0 8H6" />
    <line x1="4" x2="20" y1="12" y2="12" />
  </svg>
);

const IconAlignLeft = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M2 4a1 1 0 011-1h14a1 1 0 010 2H3a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 010 2H3a1 1 0 01-1-1zm0 4a1 1 0 011-1h14a1 1 0 010 2H3a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 010 2H3a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const IconAlignCenter = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M2 4a1 1 0 011-1h14a1 1 0 010 2H3a1 1 0 01-1-1zm3 4a1 1 0 011-1h8a1 1 0 010 2H6a1 1 0 01-1-1zm-3 4a1 1 0 011-1h14a1 1 0 010 2H3a1 1 0 01-1-1zm3 4a1 1 0 011-1h8a1 1 0 010 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const IconList = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 4a1 1 0 100 2 1 1 0 000-2zM3 5a2 2 0 114 0 2 2 0 01-4 0zm5-1a1 1 0 011-1h7a1 1 0 010 2H9a1 1 0 01-1-1zm0 5a1 1 0 011-1h7a1 1 0 010 2H9a1 1 0 01-1-1zm-4 1a1 1 0 100 2 1 1 0 000-2zm-2 1a2 2 0 114 0 2 2 0 01-4 0zm6 4a1 1 0 011-1h7a1 1 0 010 2H9a1 1 0 01-1-1zm-4 1a1 1 0 100 2 1 1 0 000-2zm-2 1a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
  </svg>
);

const IconOrderedList = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 3a1 1 0 000 2h1v1a1 1 0 002 0V4h1a1 1 0 000-2H4zm4 5a1 1 0 011-1h7a1 1 0 010 2H9a1 1 0 01-1-1zm-4 .5c0-.28.22-.5.5-.5h2a.5.5 0 010 1H5.5v.5h1a1.5 1.5 0 010 3h-2a.5.5 0 010-1h2a.5.5 0 000-1h-1A1.5 1.5 0 014 9.5v-.5c0-.55.45-1 1-1h.5V9H4.5A.5.5 0 014 8.5zM9 13a1 1 0 011-1h7a1 1 0 010 2H10a1 1 0 01-1-1zm-5.5-1H5v1.5H3.5v.5H5a.5.5 0 010 1H3a.5.5 0 010-1h.5V12H3a.5.5 0 010-1h1.5a.5.5 0 01.5.5v.5H3.5z" clipRule="evenodd" />
  </svg>
);

const IconQuote = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4.414l-1.707 1.707A1 1 0 011 10V5a1 1 0 012 0v3h3V5a1 1 0 01-1-1H3zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-2.586l-1.707 1.707A1 1 0 0111 10V5a1 1 0 012 0v3h3V5a1 1 0 01-1-1h-1z" clipRule="evenodd" />
  </svg>
);

const IconCode = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const IconImage = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
  </svg>
);

const IconPDF = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const IconDraw = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const IconPencil = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

const IconHighlight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 11-6 6v3h9l3-3" />
    <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
  </svg>
);

const IconLink = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
  </svg>
);

const IconEraser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
    <path d="M22 21H7" /><path d="m5 11 9 9" />
  </svg>
);

const IconShape = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
  </svg>
);

const IconUndo = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const IconRedo = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const IconMore = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const IconTag = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const IconAttach = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
  </svg>
);

// ─── Toolbar Button ───────────────────────────────────────────────────────────

function ToolbarBtn({ onClick, active, title, children, danger }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick?.(); }}
      title={title}
      className={[
        'relative flex h-7 w-7 items-center justify-center rounded-md',
        'transition-all duration-100 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c6af6]/50',
        active
          ? 'bg-[#6c6af6]/20 text-[#9d9cf8]'
          : danger
            ? 'text-[#888898] hover:bg-[#2a1520] hover:text-[#f87171]'
            : 'text-[#888898] hover:bg-[#1e1e28] hover:text-[#d0d0da]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function ToolbarDivider() {
  return <div className="h-4 w-px bg-[#2a2a38] flex-shrink-0 mx-0.5" />;
}

// ─── Font Size Selector ───────────────────────────────────────────────────────

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48'];

function FontSizeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(p => !p); }}
        className={[
          'flex h-7 items-center gap-1 rounded-md px-2',
          'text-[12px] font-medium text-[#a0a0b0]',
          'border border-transparent',
          'transition-all duration-100',
          open
            ? 'bg-[#1e1e28] border-[#2f2f3e] text-[#d0d0da]'
            : 'hover:bg-[#1e1e28] hover:text-[#d0d0da]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c6af6]/50',
        ].join(' ')}
      >
        <span className="w-5 text-center">{value}</span>
        <IconChevronDown />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-16 rounded-lg border border-[#2a2a38] bg-[#16161f] shadow-xl shadow-black/40 overflow-hidden">
          <div className="py-1 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-[#2a2a38] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {FONT_SIZES.map(size => (
              <button
                key={size}
                onMouseDown={(e) => { e.preventDefault(); onChange(size); setOpen(false); }}
                className={[
                  'w-full px-3 py-1.5 text-left text-[12px] transition-colors',
                  value === size
                    ? 'bg-[#6c6af6]/15 text-[#9d9cf8]'
                    : 'text-[#a0a0b0] hover:bg-[#1e1e28] hover:text-[#d0d0da]',
                ].join(' ')}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────

const TEXT_COLORS = [
  { label: 'Default', value: '#d0d0da' },
  { label: 'Muted', value: '#888898' },
  { label: 'Purple', value: '#9d9cf8' },
  { label: 'Blue', value: '#60a5fa' },
  { label: 'Cyan', value: '#22d3ee' },
  { label: 'Green', value: '#4ade80' },
  { label: 'Yellow', value: '#fbbf24' },
  { label: 'Orange', value: '#fb923c' },
  { label: 'Red', value: '#f87171' },
  { label: 'Pink', value: '#f472b6' },
];

const HIGHLIGHT_COLORS = [
  { label: 'None', value: 'transparent' },
  { label: 'Purple', value: 'rgba(108,106,246,0.2)' },
  { label: 'Blue', value: 'rgba(96,165,250,0.2)' },
  { label: 'Green', value: 'rgba(74,222,128,0.2)' },
  { label: 'Yellow', value: 'rgba(251,191,36,0.2)' },
  { label: 'Red', value: 'rgba(248,113,113,0.2)' },
];

function ColorPicker({ textColor, onTextColor, highlightColor, onHighlight }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('text');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(p => !p); }}
        title="Text color"
        className={[
          'flex h-7 w-7 flex-col items-center justify-center gap-0.5 rounded-md',
          'transition-all duration-100',
          open ? 'bg-[#1e1e28] text-[#d0d0da]' : 'text-[#888898] hover:bg-[#1e1e28] hover:text-[#d0d0da]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c6af6]/50',
        ].join(' ')}
      >
        <span className="text-[11px] font-bold leading-none">A</span>
        <span
          className="h-[3px] w-4 rounded-full transition-colors duration-150"
          style={{ backgroundColor: textColor }}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-52 rounded-lg border border-[#2a2a38] bg-[#16161f] shadow-xl shadow-black/40 p-3">
          {/* Tabs */}
          <div className="flex gap-1 mb-3 bg-[#0e0e14] rounded-md p-0.5">
            {['text', 'highlight'].map(t => (
              <button
                key={t}
                onMouseDown={(e) => { e.preventDefault(); setTab(t); }}
                className={[
                  'flex-1 rounded py-1 text-[11px] font-medium capitalize transition-all',
                  tab === t ? 'bg-[#1e1e28] text-[#d0d0da]' : 'text-[#555568] hover:text-[#a0a0b0]',
                ].join(' ')}
              >
                {t === 'text' ? 'Metin' : 'Vurgu'}
              </button>
            ))}
          </div>

          {tab === 'text' && (
            <div className="grid grid-cols-5 gap-1.5">
              {TEXT_COLORS.map(c => (
                <button
                  key={c.value}
                  onMouseDown={(e) => { e.preventDefault(); onTextColor(c.value); setOpen(false); }}
                  title={c.label}
                  className={[
                    'h-7 w-7 rounded-md border transition-all duration-100',
                    textColor === c.value
                      ? 'border-[#6c6af6] scale-110 shadow-md'
                      : 'border-[#2a2a38] hover:border-[#3a3a48] hover:scale-105',
                  ].join(' ')}
                  style={{ backgroundColor: c.value === '#d0d0da' ? '#252530' : c.value }}
                >
                  <span className="sr-only">{c.label}</span>
                </button>
              ))}
            </div>
          )}

          {tab === 'highlight' && (
            <div className="grid grid-cols-3 gap-1.5">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.value}
                  onMouseDown={(e) => { e.preventDefault(); onHighlight(c.value); setOpen(false); }}
                  title={c.label}
                  className={[
                    'h-7 rounded-md border text-[10px] font-medium transition-all duration-100',
                    highlightColor === c.value
                      ? 'border-[#6c6af6] text-[#9d9cf8]'
                      : 'border-[#2a2a38] text-[#666678] hover:border-[#3a3a48]',
                  ].join(' ')}
                  style={{ backgroundColor: c.value === 'transparent' ? '#0e0e14' : c.value }}
                >
                  {c.label === 'None' ? 'Yok' : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Heading Select ───────────────────────────────────────────────────────────

const HEADING_OPTIONS = [
  { label: 'Metin', value: 'p' },
  { label: 'Başlık 1', value: 'h1' },
  { label: 'Başlık 2', value: 'h2' },
  { label: 'Başlık 3', value: 'h3' },
];

function HeadingSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = HEADING_OPTIONS.find(o => o.value === value) || HEADING_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(p => !p); }}
        className={[
          'flex h-7 items-center gap-1.5 rounded-md px-2.5',
          'text-[12px] font-medium',
          'transition-all duration-100',
          open
            ? 'bg-[#1e1e28] text-[#d0d0da]'
            : 'text-[#a0a0b0] hover:bg-[#1e1e28] hover:text-[#d0d0da]',
          'focus-visible:outline-none',
        ].join(' ')}
      >
        <span>{current.label}</span>
        <IconChevronDown />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-32 rounded-lg border border-[#2a2a38] bg-[#16161f] shadow-xl shadow-black/40 py-1 overflow-hidden">
          {HEADING_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false); }}
              className={[
                'w-full px-3 py-2 text-left transition-colors',
                value === opt.value
                  ? 'bg-[#6c6af6]/15 text-[#9d9cf8]'
                  : 'text-[#a0a0b0] hover:bg-[#1e1e28] hover:text-[#d0d0da]',
                opt.value === 'h1' ? 'text-[16px] font-bold' :
                opt.value === 'h2' ? 'text-[14px] font-semibold' :
                opt.value === 'h3' ? 'text-[13px] font-medium' :
                'text-[12px]',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Autosave Indicator ───────────────────────────────────────────────────────

function AutosaveIndicator({ status }) {
  const config = {
    idle: { text: '', show: false },
    saving: { text: 'Kaydediliyor...', show: true, color: '#888898' },
    saved: { text: 'Kaydedildi', show: true, color: '#4ade80' },
    error: { text: 'Kaydetme hatası', show: true, color: '#f87171' },
  }[status] || { show: false };

  return (
    <div
      className={[
        'flex items-center gap-1.5 transition-all duration-300',
        config.show ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
    >
      {status === 'saving' && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#888898] animate-pulse" />
      )}
      {status === 'saved' && (
        <svg width="11" height="11" viewBox="0 0 20 20" fill="#4ade80">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {status === 'error' && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#f87171]" />
      )}
      <span className="text-[11px]" style={{ color: config.color }}>
        {config.text}
      </span>
    </div>
  );
}

// ─── Attachment Item ──────────────────────────────────────────────────────────

function AttachmentItem({ attachment, onRemove }) {
  const isImage = attachment.type?.startsWith('image/');

  return (
    <div className="group relative flex items-center gap-2.5 rounded-lg border border-[#2a2a38] bg-[#15151e] px-3 py-2.5 transition-all duration-150 hover:border-[#3a3a4a]">
      {isImage && attachment.preview ? (
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-[#0e0e14]">
          <img src={attachment.preview} alt={attachment.name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[#1e1e28]">
          {isImage ? (
            <span className="text-[#6c6af6]"><IconImage /></span>
          ) : (
            <span className="text-[#f87171]"><IconPDF /></span>
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-medium text-[#c0c0cc]">{attachment.name}</p>
        <p className="text-[11px] text-[#555568]">{attachment.size}</p>
      </div>

      <button
        onClick={() => onRemove(attachment.id)}
        className="flex-shrink-0 rounded-md p-1 text-[#44445a] opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-[#2a1520] hover:text-[#f87171]"
      >
        <IconClose />
      </button>
    </div>
  );
}

// ─── Drawing Toolbar Placeholder ──────────────────────────────────────────────

function DrawingToolbar({ visible, onClose }) {
  const [activeTool, setActiveTool] = useState('pencil');
  const [strokeColor, setStrokeColor] = useState('#9d9cf8');
  const [strokeSize, setStrokeSize] = useState('medium');

  const tools = [
    { id: 'pencil', icon: <IconPencil />, label: 'Kalem' },
    { id: 'eraser', icon: <IconEraser />, label: 'Silgi' },
    { id: 'shape', icon: <IconShape />, label: 'Şekil' },
  ];

  const colors = ['#9d9cf8', '#60a5fa', '#4ade80', '#fbbf24', '#f87171', '#f472b6', '#d0d0da'];
  const sizes = [
    { id: 'small', px: 2 },
    { id: 'medium', px: 4 },
    { id: 'large', px: 7 },
  ];

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 border-t border-[#1e1e26] bg-[#0f0f18] px-4 py-2.5 animate-in">
      {/* Tools */}
      <div className="flex items-center gap-0.5">
        {tools.map(tool => (
          <ToolbarBtn
            key={tool.id}
            active={activeTool === tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
          >
            {tool.icon}
          </ToolbarBtn>
        ))}
      </div>

      <ToolbarDivider />

      {/* Colors */}
      <div className="flex items-center gap-1">
        {colors.map(c => (
          <button
            key={c}
            onClick={() => setStrokeColor(c)}
            className={[
              'h-4 w-4 rounded-full transition-all duration-100',
              strokeColor === c ? 'ring-2 ring-[#6c6af6] ring-offset-1 ring-offset-[#0f0f18] scale-110' : 'hover:scale-110',
            ].join(' ')}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <ToolbarDivider />

      {/* Stroke size */}
      <div className="flex items-center gap-1.5">
        {sizes.map(s => (
          <button
            key={s.id}
            onClick={() => setStrokeSize(s.id)}
            className={[
              'flex h-7 w-8 items-center justify-center rounded-md transition-all duration-100',
              strokeSize === s.id ? 'bg-[#6c6af6]/20' : 'hover:bg-[#1e1e28]',
            ].join(' ')}
          >
            <span
              className="rounded-full transition-colors"
              style={{
                width: s.px * 2 + 4,
                height: s.px,
                backgroundColor: strokeColor,
              }}
            />
          </button>
        ))}
      </div>

      <ToolbarDivider />

      {/* Canvas placeholder note */}
      <span className="text-[11px] text-[#44445a] italic flex-1">
        Çizim tuvali — yakında aktif olacak
      </span>

      {/* Close */}
      <button
        onClick={onClose}
        className="flex h-6 w-6 items-center justify-center rounded-md text-[#44445a] hover:bg-[#1e1e28] hover:text-[#a0a0b0] transition-colors"
      >
        <IconClose />
      </button>
    </div>
  );
}

// ─── Tag Input ────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');

  const addTag = (val) => {
    const t = val.trim().replace(/^#+/, '');
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };

  const removeTag = (t) => onChange(tags.filter(x => x !== t));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map(t => (
        <span
          key={t}
          className="group flex items-center gap-1 rounded-full bg-[#6c6af6]/10 border border-[#6c6af6]/20 px-2.5 py-0.5"
        >
          <span className="text-[11px] font-medium text-[#9d9cf8]">#{t}</span>
          <button
            onClick={() => removeTag(t)}
            className="text-[#6c6af6]/40 hover:text-[#f87171] transition-colors"
          >
            <IconClose />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
          if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1]);
        }}
        placeholder={tags.length ? '' : 'Etiket ekle...'}
        className="min-w-[80px] flex-1 bg-transparent text-[12px] text-[#888898] placeholder:text-[#3a3a4a] outline-none"
      />
    </div>
  );
}

// ─── Main NoteEditor ──────────────────────────────────────────────────────────

// ─── Main NoteEditor ──────────────────────────────────────────────────────────

export default function NoteEditor({ note, onSave, onClose }) {
  // ── State
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [isFavorited, setIsFavorited] = useState(note?.favorite || note?.favorited || false);
  const [autosaveStatus, setAutosaveStatus] = useState('idle');
  const [showDrawing, setShowDrawing] = useState(false);
  const [editorMode, setEditorMode] = useState('text'); // 'text' | 'draw' | 'pdf'
  const [attachments, setAttachments] = useState(note?.attachments || []);
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState('#d0d0da');
  const [highlightColor, setHighlightColor] = useState('transparent');
  const [headingType, setHeadingType] = useState('p');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const fileInputRef = useRef(null);
  const autosaveTimer = useRef(null);
  const saveTimer = useRef(null);

  // ── Word/char count (DÜZELTME: HTML etiketlerini kelime saymaması için temizlendi)
  useEffect(() => {
    const textOnly = content.replace(/<[^>]+>/g, '');
    const words = textOnly.trim() ? textOnly.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(textOnly.length);
  }, [content]);

  // ── Autosave logic (DÜZELTME: folderId kaybolmasın diye ...note eklendi)
  const triggerAutosave = useCallback(() => {
    setAutosaveStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onSave?.({ 
        ...note, // Çok önemli: Klasör ID'sini ve diğer verileri korur
        title, 
        content, 
        tags, 
        favorite: isFavorited, 
        attachments 
      });
      setAutosaveStatus('saved');
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => setAutosaveStatus('idle'), 2500);
    }, 800);
  }, [note, title, content, tags, isFavorited, attachments, onSave]);

  useEffect(() => {
    if (title || content) triggerAutosave();
    return () => { clearTimeout(saveTimer.current); clearTimeout(autosaveTimer.current); };
  }, [title, content, tags, isFavorited]);

  // ── execCommand helpers (contentEditable)
  const exec = useCallback((cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  }, []);

  const queryCmd = (cmd) => {
    try { return document.queryCommandState(cmd); } catch { return false; }
  };

  const applyHeading = useCallback((type) => {
    setHeadingType(type);
    exec('formatBlock', type);
  }, [exec]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(f => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      type: f.type,
      size: f.size > 1024 * 1024
        ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
        : `${Math.round(f.size / 1024)} KB`,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = '';
  }, []);

  const removeAttachment = useCallback((id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  // ── Initial Mount & Safe HTML Load (BÜYÜK DÜZELTME: İmleç kaybolmasını engeller)
  useEffect(() => {
    titleRef.current?.focus();
    // React'in döngüsüne sokmadan, HTML içeriğini sadece ilk girişte DOM'a basıyoruz
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = note?.content || '';
    }
  }, []);

  const today = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="flex flex-col h-full bg-[#111119] transition-all duration-200">
      
      {/* ── Editor Header ───────────────────────────────────────────────────── */}
      <div className="flex h-12 flex-shrink-0 items-center gap-2 border-b border-[#1e1e26] bg-[#0f0f18] px-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onClose}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-md px-2 py-1 text-[#555568] hover:bg-[#1e1e28] hover:text-[#a0a0b0] transition-all text-[12px]"
          >
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Notlar
          </button>
          <span className="text-[#2a2a38]">/</span>
          <span className="truncate text-[12.5px] text-[#888898]">
            {title || 'İsimsiz Not'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <AutosaveIndicator status={autosaveStatus} />
          <div className="mx-2 h-4 w-px bg-[#2a2a38]" />
          <ToolbarBtn
            onClick={() => setIsFavorited(p => !p)}
            active={isFavorited}
            title={isFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            <span className={isFavorited ? 'text-[#fbbf24]' : ''}>
              {/* Not: İkonu yukarıdaki component listenden otomatik alacaktır */}
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => fileInputRef.current?.click()} title="Dosya ekle">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
          </ToolbarBtn>
          <div style={{ display: 'flex', gap: 4, background: '#1a1a1a', borderRadius: 8, padding: 4, border: '1px solid #2e2e2e' }}>
  {[{ key: 'text', label: '⌨️ Metin' }, { key: 'draw', label: '✏️ Çizim' }, { key: 'pdf', label: '📄 PDF' }].map(({ key, label }) => (
    <button key={key} onClick={() => setEditorMode(key)} style={{ padding: '5px 12px', border: 'none', borderRadius: 6, background: editorMode === key ? '#6c6af6' : 'transparent', color: editorMode === key ? '#fff' : '#666', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
      {label}
    </button>
  ))}
</div>
          <ToolbarBtn onClick={() => setShowDrawing(p => !p)} active={showDrawing} title="Çizim araçları">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </ToolbarBtn>
        </div>
      </div>

      {/* ── Formatting Toolbar ───────────────────────────────────────────────── */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-0.5 border-b border-[#1a1a24] bg-[#0d0d16] px-3 py-1.5">
        <ToolbarBtn onClick={() => exec('undo')} title="Geri al (Ctrl+Z)">Geri</ToolbarBtn>
        <ToolbarBtn onClick={() => exec('redo')} title="Yinele (Ctrl+Y)">İleri</ToolbarBtn>
        <ToolbarDivider />
        <HeadingSelect value={headingType} onChange={applyHeading} />
        <ToolbarDivider />
        <FontSizeSelect value={fontSize} onChange={(s) => { setFontSize(s); exec('fontSize', '7'); }} />
        <ToolbarDivider />
        <ToolbarBtn onClick={() => exec('bold')} active={queryCmd('bold')} title="Kalın (Ctrl+B)">B</ToolbarBtn>
        <ToolbarBtn onClick={() => exec('italic')} active={queryCmd('italic')} title="İtalik (Ctrl+I)">I</ToolbarBtn>
        <ToolbarBtn onClick={() => exec('underline')} active={queryCmd('underline')} title="Altı çizili (Ctrl+U)">U</ToolbarBtn>
        <ToolbarBtn onClick={() => exec('strikeThrough')} active={queryCmd('strikeThrough')} title="Üstü çizili">S</ToolbarBtn>
        <ToolbarDivider />
        <ColorPicker textColor={textColor} onTextColor={(c) => { setTextColor(c); exec('foreColor', c); }} highlightColor={highlightColor} onHighlight={(c) => { setHighlightColor(c); exec('hiliteColor', c); }} />
        <ToolbarDivider />
        <ToolbarBtn onClick={() => exec('justifyLeft')} title="Sola hizala">Sol</ToolbarBtn>
        <ToolbarBtn onClick={() => exec('justifyCenter')} title="Ortala">Orta</ToolbarBtn>
        <ToolbarDivider />
        <ToolbarBtn onClick={() => exec('insertUnorderedList')} active={queryCmd('insertUnorderedList')} title="Madde listesi">•</ToolbarBtn>
        <ToolbarBtn onClick={() => exec('insertOrderedList')} active={queryCmd('insertOrderedList')} title="Sıralı liste">1.</ToolbarBtn>
      </div>

      <DrawingToolbar visible={showDrawing} onClose={() => setShowDrawing(false)} />

      {editorMode === 'draw' && <div className="flex-1 overflow-hidden"><DrawMode /></div>}
      {editorMode === 'pdf'  && <div className="flex-1 overflow-hidden"><PdfMode /></div>}
      {editorMode === 'text' && (
        <>
          {/* ── Scrollable Editor Body ───────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#2a2a36] scrollbar-thin scrollbar-thumb-[#2a2a36]">
            <div className="mx-auto w-full max-w-3xl px-8 py-8 md:px-12">
              
              <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-[#333344] select-none">
                {today}
              </p>

              <input
                ref={titleRef}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="İsimsiz Not"
                className="w-full bg-transparent outline-none text-[28px] font-bold tracking-[-0.03em] text-white placeholder:text-[#2e2e3e] mb-4 leading-tight transition-colors duration-150"
                style={{ caretColor: '#6c6af6' }}
              />

              <div className="mb-6 flex items-center gap-2">
                <span className="flex-shrink-0 text-[#333344]">#</span>
                <TagInput tags={tags} onChange={setTags} />
              </div>

              <div className="mb-6 h-px bg-[#1a1a24]" />

              {/* BÜYÜK DÜZELTME: dangerouslySetInnerHTML TAMAMEN KALDIRILDI! */}
              <div
                ref={editorRef}
                contentEditable="true"
                suppressContentEditableWarning
                onInput={e => setContent(e.currentTarget.innerHTML)}
                data-placeholder="Yazmaya başla..."
                className={[
                  'min-h-[360px] outline-none',
                  'text-[16px] leading-[1.75] text-[#c0c0cc]',
                  '[&:empty]:before:content-[attr(data-placeholder)]',
                  '[&:empty]:before:text-[#2e2e3e]',
                  '[&:empty]:before:pointer-events-none',
                  '[&_h1]:text-[26px] [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:tracking-tight',
                  '[&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:text-[#d8d8e4] [&_h2]:mb-2.5 [&_h2]:mt-5',
                  '[&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-[#c0c0cc] [&_h3]:mb-2 [&_h3]:mt-4',
                  '[&_p]:mb-3',
                  '[&_blockquote]:border-l-2 [&_blockquote]:border-[#6c6af6]/50 [&_blockquote]:pl-4 [&_blockquote]:text-[#888898] [&_blockquote]:italic [&_blockquote]:my-4',
                  '[&_pre]:bg-[#0d0d16] [&_pre]:border [&_pre]:border-[#2a2a38] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:text-[13px] [&_pre]:font-mono [&_pre]:text-[#9d9cf8] [&_pre]:my-4 [&_pre]:overflow-x-auto',
                  '[&_code]:bg-[#1a1a28] [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:font-mono [&_code]:text-[#9d9cf8]',
                  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1',
                  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1',
                  '[&_li]:leading-relaxed',
                  '[&_a]:text-[#6c6af6] [&_a]:underline [&_a]:underline-offset-2',
                  '[&_strong]:text-white [&_strong]:font-semibold',
                  'focus:outline-none',
                ].join(' ')}
                style={{
                  fontSize: `${fontSize}px`,
                  color: textColor,
                  caretColor: '#6c6af6',
                }}
              />

              {attachments.length > 0 && (
                <div className="mt-8">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-[#1a1a24]" />
                    <span className="text-[11px] font-medium uppercase tracking-widest text-[#333344] px-2">
                      Ekler ({attachments.length})
                    </span>
                    <div className="h-px flex-1 bg-[#1a1a24]" />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {attachments.map(a => (
                      <AttachmentItem key={a.id} attachment={a} onRemove={removeAttachment} />
                    ))}
                  </div>
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1e1e2c] py-6 cursor-pointer transition-all duration-150 hover:border-[#6c6af6]/30 hover:bg-[#6c6af6]/[0.02] group"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a24] text-[#3a3a50] transition-colors group-hover:bg-[#6c6af6]/10 group-hover:text-[#6c6af6]">
                  +
                </span>
                <p className="mt-2 text-[12px] text-[#333344] group-hover:text-[#555568] transition-colors">
                  Dosya eklemek için tıkla veya sürükle
                </p>
                <p className="text-[11px] text-[#252532] mt-0.5">PNG, JPG, PDF — maks. 20 MB</p>
              </div>
              <div className="h-16" />
            </div>
          </div>
        </>
      )}
      {/* ── Status Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-shrink-0 items-center justify-between border-t border-[#1a1a24] bg-[#0d0d16] px-6 py-1.5">
        <div className="flex items-center gap-4 text-[11px] text-[#333344] select-none">
          <span>{wordCount} kelime</span>
          <span>{charCount} karakter</span>
          {attachments.length > 0 && (
            <span>{attachments.length} ek</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <AutosaveIndicator status={autosaveStatus} />
          <span className="text-[11px] text-[#252532] select-none">Ctrl+S ile kaydet</span>
        </div>
      </div>

      <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />
    </div>
  );
}
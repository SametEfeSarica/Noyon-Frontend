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

const IconPDF = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const IconPencil = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

const IconUndo = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const IconRedo = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const IconTextMode = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2h8v2H6V6zm0 4h8v2H6v-2zm0 4h5v2H6v-2z" clipRule="evenodd" />
  </svg>
);

// ─── Toolbar Button ───────────────────────────────────────────────────────────

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick?.(); }}
      title={title}
      className={[
        'flex h-7 w-7 items-center justify-center rounded-md',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none',
        active
          ? 'bg-[#6c6af6]/20 text-[#9d9cf8]'
          : 'text-[#888898] hover:bg-[#1e1e28] hover:text-[#d0d0da]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="h-4 w-px bg-[#2a2a38] flex-shrink-0 mx-1" />;
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
    <div ref={ref} className="relative z-50">
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(p => !p); }}
        className={[
          'flex h-7 items-center gap-1 rounded-md px-2',
          'text-[12px] font-medium transition-all duration-150',
          open ? 'bg-[#1e1e28] text-[#d0d0da]' : 'text-[#a0a0b0] hover:bg-[#1e1e28] hover:text-[#d0d0da]',
          'focus-visible:outline-none',
        ].join(' ')}
      >
        <span className="w-4 text-center">{value}</span>
        <IconChevronDown />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-16 rounded-lg border border-[#2a2a38] bg-[#16161f] shadow-xl overflow-hidden">
          <div className="py-1 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-[#2a2a38] [&::-webkit-scrollbar-track]:bg-transparent">
            {FONT_SIZES.map(size => (
              <button
                key={size}
                onMouseDown={(e) => { e.preventDefault(); onChange(size); setOpen(false); }}
                className={[
                  'w-full px-3 py-1.5 text-left text-[12px] transition-colors',
                  value === size ? 'bg-[#6c6af6]/15 text-[#9d9cf8]' : 'text-[#a0a0b0] hover:bg-[#1e1e28]',
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
  { label: 'Default', value: '#d0d0da' }, { label: 'Muted', value: '#888898' }, { label: 'Purple', value: '#9d9cf8' },
  { label: 'Blue', value: '#60a5fa' }, { label: 'Cyan', value: '#22d3ee' }, { label: 'Green', value: '#4ade80' },
  { label: 'Yellow', value: '#fbbf24' }, { label: 'Orange', value: '#fb923c' }, { label: 'Red', value: '#f87171' },
  { label: 'Pink', value: '#f472b6' },
];

const HIGHLIGHT_COLORS = [
  { label: 'None', value: 'transparent' }, { label: 'Purple', value: 'rgba(108,106,246,0.2)' },
  { label: 'Blue', value: 'rgba(96,165,250,0.2)' }, { label: 'Green', value: 'rgba(74,222,128,0.2)' },
  { label: 'Yellow', value: 'rgba(251,191,36,0.2)' }, { label: 'Red', value: 'rgba(248,113,113,0.2)' },
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
    <div ref={ref} className="relative z-50">
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(p => !p); }}
        title="Metin ve Vurgu Rengi"
        className={[
          'flex h-7 w-7 flex-col items-center justify-center gap-0.5 rounded-md transition-all duration-150',
          open ? 'bg-[#1e1e28] text-[#d0d0da]' : 'text-[#888898] hover:bg-[#1e1e28] hover:text-[#d0d0da]',
        ].join(' ')}
      >
        <span className="text-[11px] font-bold leading-none">A</span>
        <span className="h-[3px] w-4 rounded-full transition-colors" style={{ backgroundColor: textColor }} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-52 rounded-lg border border-[#2a2a38] bg-[#16161f] shadow-xl p-3">
          <div className="flex gap-1 mb-3 bg-[#0e0e14] rounded-md p-0.5 border border-[#1e1e28]">
            {['text', 'highlight'].map(t => (
              <button
                key={t}
                onMouseDown={(e) => { e.preventDefault(); setTab(t); }}
                className={[
                  'flex-1 rounded py-1 text-[11px] font-medium capitalize transition-all',
                  tab === t ? 'bg-[#252535] text-[#d0d0da]' : 'text-[#555568] hover:text-[#a0a0b0]',
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
                    'h-7 w-7 rounded-md border transition-all',
                    textColor === c.value ? 'border-[#6c6af6] scale-110 shadow-sm' : 'border-[#2a2a38] hover:border-[#4a4a5a]',
                  ].join(' ')}
                  style={{ backgroundColor: c.value === '#d0d0da' ? '#252530' : c.value }}
                />
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
                    'h-7 rounded-md border text-[10px] font-medium transition-all',
                    highlightColor === c.value ? 'border-[#6c6af6] text-[#9d9cf8]' : 'border-[#2a2a38] text-[#666678] hover:border-[#4a4a5a]',
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
    <div ref={ref} className="relative z-50">
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(p => !p); }}
        className={[
          'flex h-7 items-center gap-1.5 rounded-md px-2.5',
          'text-[12px] font-medium transition-all duration-150',
          open ? 'bg-[#1e1e28] text-[#d0d0da]' : 'text-[#a0a0b0] hover:bg-[#1e1e28] hover:text-[#d0d0da]',
          'focus-visible:outline-none',
        ].join(' ')}
      >
        <span>{current.label}</span>
        <IconChevronDown />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-32 rounded-lg border border-[#2a2a38] bg-[#16161f] shadow-xl py-1 overflow-hidden">
          {HEADING_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false); }}
              className={[
                'w-full px-3 py-2 text-left transition-colors',
                value === opt.value ? 'bg-[#6c6af6]/15 text-[#9d9cf8]' : 'text-[#a0a0b0] hover:bg-[#1e1e28]',
                opt.value === 'h1' ? 'text-[16px] font-bold' :
                opt.value === 'h2' ? 'text-[14px] font-semibold' :
                opt.value === 'h3' ? 'text-[13px] font-medium' : 'text-[12px]',
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
    error: { text: 'Hata', show: true, color: '#f87171' },
  }[status] || { show: false };

  return (
    <div className={['flex items-center gap-1.5 transition-all duration-300', config.show ? 'opacity-100' : 'opacity-0'].join(' ')}>
      {status === 'saving' && <span className="h-1.5 w-1.5 rounded-full bg-[#888898] animate-pulse" />}
      {status === 'saved' && (
        <svg width="11" height="11" viewBox="0 0 20 20" fill="#4ade80">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {status === 'error' && <span className="h-1.5 w-1.5 rounded-full bg-[#f87171]" />}
      <span className="text-[11px]" style={{ color: config.color }}>{config.text}</span>
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
        <span key={t} className="group flex items-center gap-1 rounded-full bg-[#6c6af6]/10 border border-[#6c6af6]/20 px-2.5 py-0.5">
          <span className="text-[11px] font-medium text-[#9d9cf8]">#{t}</span>
          <button onClick={() => removeTag(t)} className="text-[#6c6af6]/40 hover:text-[#f87171] transition-colors"><IconClose /></button>
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

export default function NoteEditor({ note, onSave, onClose }) {
  // ── Temel State
  const [title, setTitle]           = useState(note?.title || '');
  const [content, setContent]       = useState(note?.content || '');
  const [tags, setTags]             = useState(note?.tags || []);
  const [isFavorited, setIsFavorited] = useState(note?.favorite || note?.favorited || false);
  const [autosaveStatus, setAutosaveStatus] = useState('idle');
  const [editorMode, setEditorMode] = useState('text'); // 'text' | 'draw' | 'pdf'

  // ── Çizim & PDF Annotation State (yeni)
  // handwritingBase64: DrawMode canvas'ının base64 PNG'si
  const [handwritingBase64, setHandwritingBase64] = useState(note?.handwritingBase64 || null);
  // pdfAnnotations: { [pageNumber]: base64DataUrl } — JSON olarak saklanır
  const [pdfAnnotations, setPdfAnnotations] = useState(() => {
    if (!note?.pdfAnnotations) return {};
    if (typeof note.pdfAnnotations === 'string') {
      try { return JSON.parse(note.pdfAnnotations); } catch { return {}; }
    }
    return note.pdfAnnotations;
  });

  // ── Formatlama State
  const [fontSize, setFontSize]         = useState('16');
  const [textColor, setTextColor]       = useState('#d0d0da');
  const [highlightColor, setHighlightColor] = useState('transparent');
  const [headingType, setHeadingType]   = useState('p');

  // ── Sayaç State
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editorRef    = useRef(null);
  const titleRef     = useRef(null);
  const autosaveTimer = useRef(null);
  const saveTimer    = useRef(null);

  // ── Word/char count
  useEffect(() => {
    const textOnly = content.replace(/<[^>]+>/g, '');
    const words = textOnly.trim() ? textOnly.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(textOnly.length);
  }, [content]);

  // ── Merkezi kaydetme fonksiyonu — tüm alanları birleştirip gönderir
const doSave = useCallback((overrides = {}) => {
  setAutosaveStatus('saving');
  clearTimeout(saveTimer.current);
  saveTimer.current = setTimeout(() => {
    onSave?.({
      ...note,
      title,
      content,
      tags,
      favorite: isFavorited,
      handwritingBase64: handwritingBase64 ?? null,
      pdfAnnotations: typeof pdfAnnotations === 'object'
        ? JSON.stringify(pdfAnnotations)
        : (pdfAnnotations ?? null),
      ...overrides,
    });
    setAutosaveStatus('saved');
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => setAutosaveStatus('idle'), 2500);
  }, 800);
}, [note, title, content, tags, isFavorited, handwritingBase64, pdfAnnotations, onSave]);

  // ── Text/title/tags/favori değişince otomatik kaydet
  useEffect(() => {
    if (title.trim() || content.trim() || tags.length > 0 || isFavorited !== note?.favorite) {
      doSave();
    }
    return () => {
      clearTimeout(saveTimer.current);
      clearTimeout(autosaveTimer.current);
    };
  }, [title, content, tags, isFavorited]);

  // ── DrawMode'dan gelen çizimi state'e yaz + kaydet
  const handleDrawingChange = useCallback((base64) => {
    setHandwritingBase64(base64);
    doSave({ handwritingBase64: base64 });
  }, [doSave]);

  // ── PdfMode'dan gelen annotation'ları state'e yaz + kaydet
  const handleAnnotationChange = useCallback((annotations) => {
    setPdfAnnotations(annotations);
    doSave({ pdfAnnotations: JSON.stringify(annotations) });
  }, [doSave]);

  // ── execCommand helpers
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

  useEffect(() => {
    titleRef.current?.focus();
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = note?.content || '';
    }
  }, []);

  const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full bg-[#111119] transition-all duration-200">

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-shrink-0 bg-[#0a0a10] border-b border-[#1a1a24] shadow-sm z-10">

        {/* Top Row */}
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={onClose}
              className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full text-[#70708a] hover:bg-[#1e1e2e] hover:text-[#d0d0e8] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="h-4 w-px bg-[#2a2a38]" />

            <input
              ref={titleRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="İsimsiz Not"
              className="w-full max-w-md bg-transparent outline-none text-[15px] font-[500] tracking-wide text-[#c8c8dc] placeholder:text-[#50506a] transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <AutosaveIndicator status={autosaveStatus} />

            <div className="h-4 w-px bg-[#2a2a38]" />

            {/* Mode Switcher */}
            <div className="flex items-center rounded-lg bg-[#14141e] p-1 border border-[#1e1e2c]">
              {[
                { key: 'text', icon: <IconTextMode />, title: 'Metin Modu' },
                { key: 'draw', icon: <IconPencil />, title: 'Çizim Modu' },
                { key: 'pdf',  icon: <IconPDF />,    title: 'PDF Modu' }
              ].map(({ key, icon, title }) => (
                <button
                  key={key}
                  onClick={() => setEditorMode(key)}
                  title={title}
                  className={[
                    'flex h-7 w-9 items-center justify-center rounded-md transition-all duration-200',
                    editorMode === key
                      ? 'bg-[#6c6af6] text-white shadow-md'
                      : 'text-[#666678] hover:text-[#b0b0c0] hover:bg-[#1e1e2e]'
                  ].join(' ')}
                >
                  {icon}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-[#2a2a38]" />

            {/* Favori */}
            <button
              onClick={() => setIsFavorited(p => !p)}
              title={isFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              className={[
                'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200',
                isFavorited
                  ? 'text-[#fbbf24] bg-[#fbbf24]/10'
                  : 'text-[#666678] hover:bg-[#1e1e2e] hover:text-[#b0b0c0]'
              ].join(' ')}
            >
              <IconStar />
            </button>
          </div>
        </div>

        {/* Formatting Toolbar — sadece text modunda */}
        {editorMode === 'text' && (
          <div className="flex items-center gap-1.5 flex-wrap px-4 sm:px-6 py-2 bg-[#0d0d16] border-t border-[#1a1a24]">
            <ToolbarBtn onClick={() => exec('undo')} title="Geri al (Ctrl+Z)"><IconUndo /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec('redo')} title="Yinele (Ctrl+Y)"><IconRedo /></ToolbarBtn>

            <ToolbarDivider />

            <HeadingSelect value={headingType} onChange={applyHeading} />

            <ToolbarDivider />

            <FontSizeSelect value={fontSize} onChange={(s) => { setFontSize(s); exec('fontSize', '7'); }} />

            <ToolbarDivider />

            <div className="flex items-center gap-0.5 rounded-lg bg-[#14141e] border border-[#1e1e2c] p-0.5">
              <ToolbarBtn onClick={() => exec('bold')} active={queryCmd('bold')} title="Kalın (Ctrl+B)"><IconBold /></ToolbarBtn>
              <ToolbarBtn onClick={() => exec('italic')} active={queryCmd('italic')} title="İtalik (Ctrl+I)"><IconItalic /></ToolbarBtn>
              <ToolbarBtn onClick={() => exec('underline')} active={queryCmd('underline')} title="Altı çizili (Ctrl+U)"><IconUnderline /></ToolbarBtn>
              <ToolbarBtn onClick={() => exec('strikeThrough')} active={queryCmd('strikeThrough')} title="Üstü çizili"><IconStrikethrough /></ToolbarBtn>
            </div>

            <ToolbarDivider />

            <ColorPicker
              textColor={textColor}
              onTextColor={(c) => { setTextColor(c); exec('foreColor', c); }}
              highlightColor={highlightColor}
              onHighlight={(c) => { setHighlightColor(c); exec('hiliteColor', c); }}
            />

            <ToolbarDivider />

            <div className="flex items-center gap-0.5 rounded-lg bg-[#14141e] border border-[#1e1e2c] p-0.5">
              <ToolbarBtn onClick={() => exec('justifyLeft')} title="Sola hizala"><IconAlignLeft /></ToolbarBtn>
              <ToolbarBtn onClick={() => exec('justifyCenter')} title="Ortala"><IconAlignCenter /></ToolbarBtn>
            </div>

            <ToolbarDivider />

            <div className="flex items-center gap-0.5 rounded-lg bg-[#14141e] border border-[#1e1e2c] p-0.5">
              <ToolbarBtn onClick={() => exec('insertUnorderedList')} active={queryCmd('insertUnorderedList')} title="Madde listesi"><IconList /></ToolbarBtn>
              <ToolbarBtn onClick={() => exec('insertOrderedList')} active={queryCmd('insertOrderedList')} title="Sıralı liste"><IconOrderedList /></ToolbarBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── Editor Body ──────────────────────────────────────────────────────── */}

      {/* 
        DrawMode ve PdfMode her zaman DOM'da tutulur (display:none ile gizlenir).
        Böylece mod değiştirildiğinde canvas içeriği sıfırlanmaz.
      */}
      <div
        className="flex-1 overflow-hidden"
        style={{ display: editorMode === 'draw' ? 'flex' : 'none', flexDirection: 'column' }}
      >
        <DrawMode
          initialData={handwritingBase64}
          onDrawingChange={handleDrawingChange}
        />
      </div>

      <div
        className="flex-1 overflow-hidden"
        style={{ display: editorMode === 'pdf' ? 'flex' : 'none', flexDirection: 'column' }}
      >
        <PdfMode
          initialAnnotations={pdfAnnotations}
          onAnnotationChange={handleAnnotationChange}
        />
      </div>

      {editorMode === 'text' && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#2a2a36]">
          <div className="mx-auto w-full max-w-3xl px-8 py-8 md:px-12">

            <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-[#333344] select-none">
              {today}
            </p>

            <div className="mb-6 flex items-center gap-2">
              <span className="flex-shrink-0 text-[#333344]">#</span>
              <TagInput tags={tags} onChange={setTags} />
            </div>

            <div className="mb-6 h-px bg-[#1a1a24]" />

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
            <div className="h-16" />
          </div>
        </div>
      )}

      {/* ── Status Bar ───────────────────────────────────────────────────────── */}
      <div className="flex flex-shrink-0 items-center justify-between border-t border-[#1a1a24] bg-[#0d0d16] px-6 py-1.5">
        <div className="flex items-center gap-4 text-[11px] text-[#333344] select-none">
          <span>{wordCount} kelime</span>
          <span>{charCount} karakter</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#252532] select-none">Otomatik kaydedilir</span>
        </div>
      </div>
    </div>
  );
}

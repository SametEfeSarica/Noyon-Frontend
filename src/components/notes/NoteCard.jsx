import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconStar = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 20 20" aria-hidden="true"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth={filled ? 0 : 1.8}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const IconDots = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const IconHash = () => (
  <svg width="9" height="9" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z" clipRule="evenodd" />
  </svg>
);

const IconClock = () => (
  <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const IconNote = () => (
  <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1)   return 'Az önce';
  if (diffMin < 60)  return `${diffMin}d önce`;
  if (diffHr < 24)   return `${diffHr}s önce`;
  if (diffDay === 1) return 'Dün';
  if (diffDay < 7)   return `${diffDay} gün önce`;

  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function stripMarkdown(text = '') {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
}

// ─── Context Menu ─────────────────────────────────────────────────────────────

function ContextMenu({ x, y, onClose, onFavorite, isFavorited, onDelete }) {
  const items = [
    {
      icon: <IconStar filled={isFavorited} />,
      label: isFavorited ? 'Favoriden Çıkar' : 'Favoriye Ekle',
      action: () => { onFavorite(); onClose(); }
    },
    'divider',
    {
      icon: <IconTrash />,
      label: 'Sil',
      danger: true,
      action: () => { onDelete?.(); onClose(); }
    },
  ];

  return createPortal(
    <>
      <div className="fixed inset-0 z-[998]" onClick={onClose} aria-hidden="true" />
      <div
        style={{ top: y, left: x, position: 'fixed', zIndex: 999 }}
        className="min-w-[160px] rounded-xl border border-[#232333] bg-[#16161f] py-1.5 shadow-2xl shadow-black/60 backdrop-blur-sm"
        role="menu"
      >
        {items.map((item, i) =>
          item === 'divider' ? (
            <div key={i} className="my-1 border-t border-[#1e1e2c]" />
          ) : (
            <button
              key={i}
              role="menuitem"
              onClick={item.action}
              className={[
                'flex w-full items-center gap-2.5 px-3 py-[7px] text-left text-[12.5px] font-[440]',
                'transition-colors duration-100',
                item.danger
                  ? 'text-[#f87171] hover:bg-[#2a1520]'
                  : 'text-[#a0a0bc] hover:bg-[#1d1d2b] hover:text-[#d0d0e8]',
              ].join(' ')}
            >
              <span className={item.danger ? 'text-[#f87171]/70' : 'text-[#50506a]'}>{item.icon}</span>
              {item.label}
            </button>
          )
        )}
      </div>
    </>,
    document.body
  );
}

// ─── Tag Pill ─────────────────────────────────────────────────────────────────

function TagPill({ tag }) {
  return (
    <span className="inline-flex items-center gap-[3px] rounded-full px-2 py-[3px] text-[10px] font-[500] leading-none bg-[#1a1a28] text-[#50507a] border border-[#222232] transition-colors duration-150 group-hover/card:border-[#2a2a40] group-hover/card:text-[#6868a0]">
      <IconHash />
      {tag}
    </span>
  );
}

// ─── Folder Badge ─────────────────────────────────────────────────────────────

function FolderBadge({ folder }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-[3px] text-[10px] font-[500] leading-none select-none"
      style={{
        background: `${folder.color}12`,
        color: folder.color,
        border: `1px solid ${folder.color}22`,
      }}
    >
      <span>{folder.emoji}</span>
      {folder.name}
    </span>
  );
}

// ─── Content Preview — çizim / pdf / metin ────────────────────────────────────

function ContentPreview({ handwritingBase64, pdfAnnotations, preview, variant }) {
  // Çizim notu
  if (handwritingBase64) {
    if (variant === 'grid') {
      return (
        <div
          className="relative w-full rounded-xl overflow-hidden border border-[#1e1e2c] bg-[#0d0d14] flex-shrink-0"
          style={{ height: 90 }}
        >
          <img
            src={handwritingBase64}
            alt="Çizim önizlemesi"
            className="w-full h-full object-cover object-top"
            style={{ opacity: 0.85 }}
          />
          <span className="absolute bottom-1.5 right-2 flex items-center gap-1 text-[9px] text-[#7070a0] bg-[#0d0d14]/90 rounded-md px-1.5 py-0.5 border border-[#1e1e2c]">
            ✏️ Çizim
          </span>
        </div>
      );
    }
    // list variant
    return (
      <p className="mt-1 truncate text-[11.5px] text-[#505070]">
        ✏️ Çizim notu
      </p>
    );
  }

  // PDF notu
  if (pdfAnnotations && pdfAnnotations !== '{}' && pdfAnnotations !== 'null') {
    if (variant === 'grid') {
      return (
        <div
          className="relative w-full rounded-xl overflow-hidden border border-[#1e2a1e] bg-[#0d140d] flex-shrink-0 flex items-center justify-center"
          style={{ height: 90 }}
        >
          <div className="flex flex-col items-center gap-1.5 opacity-60">
            <span style={{ fontSize: 28 }}>📄</span>
            <span className="text-[10px] text-[#4a7a4a] font-medium">PDF Notu</span>
          </div>
          <span className="absolute bottom-1.5 right-2 flex items-center gap-1 text-[9px] text-[#4a7a4a] bg-[#0d140d]/90 rounded-md px-1.5 py-0.5 border border-[#1e2a1e]">
            📄 PDF
          </span>
        </div>
      );
    }
    // list variant
    return (
      <p className="mt-1 truncate text-[11.5px] text-[#3a5a3a]">
        📄 PDF notu
      </p>
    );
  }

  // Metin notu
  if (variant === 'grid') {
    return preview ? (
      <p className="text-[12px] font-[420] leading-[1.65] text-[#484860] line-clamp-3 group-hover/card:text-[#585878] transition-colors duration-150">
        {preview}
      </p>
    ) : (
      <p className="text-[12px] italic text-[#2e2e42] leading-[1.65]">
        İçerik yok…
      </p>
    );
  }

  // list — metin
  return preview ? (
    <p className="mt-1 truncate text-[11.5px] text-[#3a3a52] group-hover/card:text-[#484860] transition-colors duration-150">
      {preview}
    </p>
  ) : null;
}

// ─── NoteCard ─────────────────────────────────────────────────────────────────

export default function NoteCard({
  handwritingBase64,
  pdfAnnotations,
  id,
  title = 'Başlıksız Not',
  content = '',
  emoji,
  tags = [],
  folder,
  isFavorited: initialFavorited = false,
  updatedAt,
  accentColor,
  onDelete,
  onFavoriteToggle,
  onClick,
  variant = 'grid',
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [hovered, setHovered]     = useState(false);
  const [ctx, setCtx]             = useState(null);

  const accent    = accentColor ?? '#6c6af6';
  const preview   = stripMarkdown(content);
  const timeLabel = updatedAt ? formatRelativeTime(updatedAt) : null;

  const handleFavorite = useCallback((e) => {
    e?.stopPropagation();
    e?.preventDefault();
    setFavorited(f => {
      const next = !f;
      onFavoriteToggle?.(id, next);
      return next;
    });
  }, [id, onFavoriteToggle]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setCtx({
      x: Math.min(e.clientX, window.innerWidth - 180),
      y: Math.min(e.clientY, window.innerHeight - 200),
    });
  }, []);

  const handleDotsClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setCtx({ x: rect.right - 160, y: rect.bottom + 4 });
  }, []);

  // ── Grid variant ────────────────────────────────────────────────────────────
  if (variant === 'grid') {
    return (
      <>
        <div
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onContextMenu={handleContextMenu}
          aria-label={title}
          className={[
            'cursor-pointer',
            'group/card relative flex flex-col rounded-2xl overflow-hidden',
            'border transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c6af6]/50',
            'bg-[#111119] border-[#1c1c28]',
            'hover:border-[#2a2a3c] hover:bg-[#131320]',
            'hover:shadow-[0_8px_32px_rgba(0,0,0,0.45),0_1px_0_rgba(108,106,246,0.06)_inset]',
            'hover:-translate-y-[2px]',
          ].join(' ')}
          style={{ '--accent': accent }}
        >
          {/* Top accent line */}
          <span
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl transition-opacity duration-200"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${accent}88 40%, ${accent}88 60%, transparent 100%)`,
              opacity: hovered ? 1 : 0,
            }}
          />

          {/* Card body */}
          <div className="flex flex-col flex-1 p-4 gap-3">

            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {emoji && (
                  <span
                    className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-[17px] leading-none select-none transition-transform duration-200 group-hover/card:scale-110"
                    style={{ background: `${accent}14`, border: `1px solid ${accent}20` }}
                  >
                    {emoji}
                  </span>
                )}
                <h3 className="truncate text-[13.5px] font-[580] tracking-[-0.02em] text-[#c8c8dc] leading-tight group-hover/card:text-white transition-colors duration-150">
                  {title}
                </h3>
              </div>

              {/* Action cluster */}
              <div className={['flex flex-shrink-0 items-center gap-1 transition-all duration-150', hovered ? 'opacity-100' : 'opacity-0'].join(' ')}>
                <button
                  onClick={handleFavorite}
                  aria-label={favorited ? 'Favoriden çıkar' : 'Favoriye ekle'}
                  aria-pressed={favorited}
                  className={[
                    'flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-150',
                    favorited
                      ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                      : 'text-[#404058] bg-transparent hover:bg-[#1e1e2e] hover:text-amber-400/70',
                  ].join(' ')}
                >
                  <IconStar filled={favorited} />
                </button>
                <button
                  onClick={handleDotsClick}
                  aria-label="Daha fazla seçenek"
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-[#404058] hover:bg-[#1e1e2e] hover:text-[#9090b0] transition-all duration-150"
                >
                  <IconDots />
                </button>
              </div>

              {favorited && !hovered && (
                <span className="flex-shrink-0 text-amber-400/60 mt-0.5">
                  <IconStar filled />
                </span>
              )}
            </div>

            {/* ── İçerik Önizlemesi (çizim / pdf / metin) ── */}
            <ContentPreview
              handwritingBase64={handwritingBase64}
              pdfAnnotations={pdfAnnotations}
              preview={preview}
              variant="grid"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 border-t border-[#191926] px-4 py-2.5">
            <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
              {folder && <FolderBadge folder={folder} />}
              {tags.slice(0, 2).map(tag => <TagPill key={tag} tag={tag} />)}
              {tags.length > 2 && (
                <span className="text-[10px] text-[#30304a] flex-shrink-0">+{tags.length - 2}</span>
              )}
            </div>
            {timeLabel && (
              <div className="flex-shrink-0 flex items-center gap-1 text-[10px] text-[#303048]">
                <IconClock />
                <span>{timeLabel}</span>
              </div>
            )}
          </div>
        </div>

        {ctx && (
          <ContextMenu
            x={ctx.x} y={ctx.y}
            onClose={() => setCtx(null)}
            onFavorite={handleFavorite}
            isFavorited={favorited}
            onDelete={onDelete}
          />
        )}
      </>
    );
  }

  // ── List variant ────────────────────────────────────────────────────────────
  return (
    <>
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onContextMenu={handleContextMenu}
        aria-label={title}
        className={[
          'cursor-pointer',
          'group/card relative flex items-center gap-3.5 rounded-xl px-4 py-3',
          'border transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c6af6]/50',
          'bg-[#111119] border-[#1c1c28]',
          'hover:border-[#252535] hover:bg-[#131320]',
          'hover:shadow-[0_4px_16px_rgba(0,0,0,0.35)]',
        ].join(' ')}
      >
        {/* Left accent pip */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-r-full transition-all duration-200"
          style={{
            height: hovered ? '55%' : '0%',
            background: accent,
            opacity: hovered ? 1 : 0,
          }}
        />

        {/* Emoji or default icon */}
        {emoji ? (
          <span
            className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-[16px] leading-none select-none"
            style={{ background: `${accent}14`, border: `1px solid ${accent}1a` }}
          >
            {emoji}
          </span>
        ) : (
          <span className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-[#30304a] bg-[#161622] border border-[#1e1e2c]">
            <IconNote />
          </span>
        )}

        {/* Title + preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-[13px] font-[560] tracking-[-0.015em] text-[#b8b8d0] group-hover/card:text-[#d8d8ec] transition-colors duration-150 leading-none">
              {title}
            </h3>
            {folder && <FolderBadge folder={folder} />}
          </div>

          {/* ── İçerik Önizlemesi (çizim / pdf / metin) ── */}
          <ContentPreview
            handwritingBase64={handwritingBase64}
            pdfAnnotations={pdfAnnotations}
            preview={preview}
            variant="list"
          />
        </div>

        {/* Tags */}
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
          {tags.slice(0, 2).map(tag => <TagPill key={tag} tag={tag} />)}
        </div>

        {/* Time */}
        {timeLabel && (
          <span className="hidden md:flex flex-shrink-0 items-center gap-1 text-[10.5px] text-[#2c2c44] min-w-[72px] justify-end">
            <IconClock />
            {timeLabel}
          </span>
        )}

        {/* Action cluster */}
        <div className={['flex flex-shrink-0 items-center gap-1 transition-all duration-150', hovered ? 'opacity-100' : 'opacity-0'].join(' ')}>
          <button
            onClick={handleFavorite}
            aria-label={favorited ? 'Favoriden çıkar' : 'Favoriye ekle'}
            aria-pressed={favorited}
            className={[
              'flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-150',
              favorited
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-[#404058] hover:bg-[#1e1e2e] hover:text-amber-400/70',
            ].join(' ')}
          >
            <IconStar filled={favorited} />
          </button>
          <button
            onClick={handleDotsClick}
            aria-label="Daha fazla seçenek"
            className="flex h-6 w-6 items-center justify-center rounded-lg text-[#404058] hover:bg-[#1e1e2e] hover:text-[#9090b0] transition-all duration-150"
          >
            <IconDots />
          </button>
        </div>

        {favorited && !hovered && (
          <span className="flex-shrink-0 text-amber-400/50 ml-1">
            <IconStar filled />
          </span>
        )}
      </div>

      {ctx && (
        <ContextMenu
          x={ctx.x} y={ctx.y}
          onClose={() => setCtx(null)}
          onFavorite={handleFavorite}
          isFavorited={favorited}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

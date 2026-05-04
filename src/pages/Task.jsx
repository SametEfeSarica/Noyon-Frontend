import { useState, useEffect, useRef, useCallback, memo } from 'react';
import api from '../api/axiosInstance';

// ─── SVG Icon Components ──────────────────────────────────────────────────────
const IconPlus = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);
const IconX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);
const IconPencil = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);
const IconTrash = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);
const IconCalendar = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);
const IconDots = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);
const IconFlag = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 7l2.55 2.4A1 1 0 0116 11H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
  </svg>
);
const IconCheck = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIORITIES = [
  { id: 'urgent', label: 'Acil',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)' },
  { id: 'high',   label: 'Yüksek', color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)' },
  { id: 'medium', label: 'Orta',   color: '#eab308', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.25)' },
  { id: 'low',    label: 'Düşük',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)' },
];

const AVATAR_COLORS = [
  { bg: 'rgba(108,106,246,0.25)', text: '#9d9cf8' },
  { bg: 'rgba(34,197,94,0.20)',   text: '#4ade80' },
  { bg: 'rgba(251,146,60,0.20)',  text: '#fb923c' },
  { bg: 'rgba(244,114,182,0.20)', text: '#f472b6' },
  { bg: 'rgba(34,211,238,0.20)',  text: '#22d3ee' },
];

// ─── Utility Helpers ──────────────────────────────────────────────────────────
const getPriority = (id) => PRIORITIES.find(p => p.id === id) || PRIORITIES[2];

const getMemberColor = (memberId, members = []) => {
  const idx = members.findIndex(m => String(m.id) === String(memberId));
  return AVATAR_COLORS[Math.max(0, idx) % AVATAR_COLORS.length];
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const diffDays = Math.ceil((d - now) / 86400000);
  const label = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  let color = '#9090a0';
  if (diffDays < 0) color = '#ef4444';
  else if (diffDays <= 2) color = '#f97316';
  else if (diffDays <= 7) color = '#eab308';
  return { label, color, overdue: diffDays < 0 };
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = memo(({ member, size = 22 }) => {
  if (!member) return null;
  // member = { id, name, initials } — API'den gelen AssigneeDto
  const colors = getMemberColor(member.id, [member]);
  return (
    <div
      title={member.name}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: colors.bg, color: colors.text,
        fontSize: size * 0.36, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid #13131a', flexShrink: 0,
        letterSpacing: '-0.02em',
      }}
    >
      {member.initials}
    </div>
  );
});

// ─── Priority Badge ───────────────────────────────────────────────────────────
const PriorityBadge = memo(({ priorityId, small = false }) => {
  const p = getPriority(priorityId);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: small ? '2px 6px' : '3px 8px',
      borderRadius: 5,
      background: p.bg,
      border: `1px solid ${p.border}`,
      color: p.color,
      fontSize: 11, fontWeight: 550,
      lineHeight: 1,
    }}>
      <IconFlag size={10} />
      {p.label}
    </span>
  );
});

// ─── Label Chip ───────────────────────────────────────────────────────────────
const LabelChip = memo(({ label }) => (
  <span style={{
    padding: '2px 7px',
    borderRadius: 4,
    background: 'rgba(108,106,246,0.12)',
    border: '1px solid rgba(108,106,246,0.2)',
    color: '#9d9cf8',
    fontSize: 11, fontWeight: 500, lineHeight: 1,
  }}>{label}</span>
));

// ─── Checklist Progress Bar ───────────────────────────────────────────────────
const ChecklistProgress = memo(({ checklist }) => {
  const list = checklist || [];
  if (!list.length) return null;
  const done = list.filter(i => i.done).length;
  const pct = Math.round((done / list.length) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 3, borderRadius: 9999, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{
          height: '100%', borderRadius: 9999,
          width: `${pct}%`,
          background: pct === 100 ? '#22c55e' : '#6c6af6',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <span style={{ fontSize: 11, color: pct === 100 ? '#4ade80' : '#55556a', fontWeight: 500, flexShrink: 0 }}>
        {done}/{list.length}
      </span>
    </div>
  );
});

// ─── Shared styles ────────────────────────────────────────────────────────────
const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 8,
  width: '100%', padding: '7px 10px', borderRadius: 6,
  border: 'none', background: 'transparent', cursor: 'pointer',
  color: '#b0b0c0', fontSize: 12.5, fontWeight: 450,
  transition: 'background 0.1s ease',
  textAlign: 'left',
};
const labelStyle = {
  display: 'block', fontSize: 11.5, fontWeight: 600,
  color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.06em',
  marginBottom: 7,
};
const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: '1px solid #252530', background: '#0e0e14',
  color: '#d8d8e0', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', transition: 'border-color 0.12s ease',
  boxSizing: 'border-box',
};
const smallBtnStyle = {
  padding: '7px 14px', borderRadius: 8, border: '1px solid #252530',
  background: '#1e1e26', color: '#9090a0', cursor: 'pointer',
  fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap',
  transition: 'all 0.12s ease',
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const BoardSkeleton = () => (
  <div style={{ display: 'flex', gap: 12, padding: '16px 20px' }}>
    {[1, 2, 3, 4].map(i => (
      <div key={i} style={{ minWidth: 292, background: '#13131a', border: '1px solid #1e1e26', borderRadius: 13, padding: 14 }}>
        <div style={{ height: 16, width: '60%', background: '#1e1e26', borderRadius: 6, marginBottom: 12 }} />
        {[1, 2].map(j => (
          <div key={j} style={{ height: 80, background: '#19191f', border: '1px solid #232330', borderRadius: 10, marginBottom: 8 }} />
        ))}
      </div>
    ))}
  </div>
);

// ─── Task Card ────────────────────────────────────────────────────────────────
const TaskCard = memo(({ card, columnId, onEdit, onDelete, onDragStart, onDragEnd, isDragging }) => {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const dateInfo = formatDate(card.dueDate);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('cardId', String(card.id));
        e.dataTransfer.setData('sourceColumnId', String(columnId));
        onDragStart(card.id);
      }}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      onClick={() => onEdit(card, columnId)}
      style={{
        background: isDragging ? 'rgba(108,106,246,0.08)' : hovered ? '#1e1e26' : '#19191f',
        border: `1px solid ${isDragging ? 'rgba(108,106,246,0.4)' : hovered ? '#2e2e3a' : '#232330'}`,
        borderRadius: 10,
        padding: '12px 13px',
        cursor: 'grab',
        transition: 'all 0.15s ease',
        opacity: isDragging ? 0.45 : 1,
        transform: isDragging ? 'rotate(1.5deg) scale(0.98)' : 'none',
        boxShadow: hovered && !isDragging ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {(card.labels || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {card.labels.map(l => <LabelChip key={l} label={l} />)}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: '#d8d8e0', lineHeight: 1.4, flex: 1, letterSpacing: '-0.01em' }}>
          {card.title}
        </p>
        <div style={{ position: 'relative' }} ref={menuRef} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, border: 'none', cursor: 'pointer',
              background: menuOpen ? '#2a2a36' : 'transparent',
              color: hovered || menuOpen ? '#9090a0' : 'transparent',
              transition: 'all 0.12s ease', flexShrink: 0, padding: 0,
            }}
          >
            <IconDots />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: '110%', right: 0, zIndex: 50,
              background: '#1a1a22', border: '1px solid #2e2e3a',
              borderRadius: 9, padding: 4, minWidth: 140,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              animation: 'dropIn 0.12s ease',
            }}>
              <button onClick={() => { setMenuOpen(false); onEdit(card, columnId); }} style={menuItemStyle}>
                <IconPencil /> Düzenle
              </button>
              <div style={{ height: 1, background: '#2a2a36', margin: '3px 0' }} />
              <button onClick={() => { setMenuOpen(false); onDelete(card.id, columnId); }} style={{ ...menuItemStyle, color: '#f87171' }}>
                <IconTrash /> Sil
              </button>
            </div>
          )}
        </div>
      </div>

      {card.description && (
        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#55556a', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {card.description}
        </p>
      )}

      {(card.checklist || []).length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <ChecklistProgress checklist={card.checklist} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <PriorityBadge priorityId={card.priority} small />
          {dateInfo && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 11, fontWeight: 500, color: dateInfo.color,
              padding: '2px 6px', borderRadius: 5,
              background: `${dateInfo.color}1a`, border: `1px solid ${dateInfo.color}30`,
            }}>
              <IconCalendar />
              {dateInfo.label}
            </span>
          )}
        </div>
        {(card.assignees || []).length > 0 && (
          <div style={{ display: 'flex', marginLeft: 4 }}>
            {card.assignees.slice(0, 3).map((member, idx) => (
              <div key={member.id} style={{ marginLeft: idx === 0 ? 0 : -6 }}>
                <Avatar member={member} size={20} />
              </div>
            ))}
            {card.assignees.length > 3 && (
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: '#2a2a36', border: '1.5px solid #13131a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: '#9090a0', marginLeft: -6,
              }}>+{card.assignees.length - 3}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Column ───────────────────────────────────────────────────────────────────
const Column = memo(({ column, onAddCard, onEditCard, onDeleteCard, onEditColumn, onDeleteColumn, onDrop, draggingCardId }) => {
  const [dragOver, setDragOver] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { if (addingCard) inputRef.current?.focus(); }, [addingCard]);
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleSubmitCard = () => {
    if (!newCardTitle.trim()) { setAddingCard(false); return; }
    onAddCard(column.id, newCardTitle.trim());
    setNewCardTitle('');
    setAddingCard(false);
  };

  const cards = column.cards || [];

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(e, column.id); }}
      style={{
        minWidth: 292, maxWidth: 292, flexShrink: 0,
        background: dragOver ? 'rgba(108,106,246,0.04)' : '#13131a',
        border: `1px solid ${dragOver ? 'rgba(108,106,246,0.3)' : '#1e1e26'}`,
        borderRadius: 13,
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.15s ease',
        maxHeight: 'calc(100vh - 160px)',
      }}
    >
      <div style={{ padding: '12px 14px 11px', borderBottom: '1px solid #1e1e26', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: column.color, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#d8d8e0', letterSpacing: '-0.01em' }}>{column.title}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#55556a', background: '#1e1e26', border: '1px solid #2a2a36', padding: '2px 7px', borderRadius: 20, lineHeight: 1.5 }}>
            {cards.length}
          </span>
          <button onClick={() => setAddingCard(true)} title="Kart ekle" style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#55556a', transition: 'all 0.12s ease' }} onMouseEnter={e => { e.currentTarget.style.background = '#1e1e26'; e.currentTarget.style.color = '#d8d8e0'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#55556a'; }}>
            <IconPlus size={14} />
          </button>
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button onClick={() => setMenuOpen(v => !v)} style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: menuOpen ? '#1e1e26' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#55556a', transition: 'all 0.12s ease' }}>
              <IconDots />
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '110%', right: 0, zIndex: 50, background: '#1a1a22', border: '1px solid #2e2e3a', borderRadius: 9, padding: 4, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', animation: 'dropIn 0.12s ease' }}>
                <button onClick={() => { setMenuOpen(false); onEditColumn(column); }} style={menuItemStyle}><IconPencil /> Sütunu düzenle</button>
                <div style={{ height: 1, background: '#2a2a36', margin: '3px 0' }} />
                <button onClick={() => { setMenuOpen(false); onDeleteColumn(column.id); }} style={{ ...menuItemStyle, color: '#f87171' }}><IconTrash /> Sütunu sil</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {cards.map(card => (
          <TaskCard
            key={card.id}
            card={card}
            columnId={column.id}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
            onDragStart={() => {}}
            onDragEnd={() => {}}
            isDragging={draggingCardId === card.id}
          />
        ))}

        {addingCard && (
          <div style={{ background: '#1e1e26', border: '1px solid #2e2e3a', borderRadius: 10, padding: '10px 12px', animation: 'slideDown 0.15s ease' }}>
            <textarea
              ref={inputRef}
              value={newCardTitle}
              onChange={e => setNewCardTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitCard(); }
                if (e.key === 'Escape') { setAddingCard(false); setNewCardTitle(''); }
              }}
              placeholder="Kart başlığı girin..."
              rows={2}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: '#d8d8e0', fontSize: 13, fontFamily: 'inherit', lineHeight: 1.5, padding: 0 }}
            />
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button onClick={handleSubmitCard} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', background: '#6c6af6', color: 'white', fontSize: 12.5, fontWeight: 550 }}>Ekle</button>
              <button onClick={() => { setAddingCard(false); setNewCardTitle(''); }} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer', background: 'transparent', color: '#55556a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconX /></button>
            </div>
          </div>
        )}

        {cards.length === 0 && !addingCard && (
          <div style={{ padding: '24px 16px', textAlign: 'center', border: '1.5px dashed #252530', borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: '#35354a', lineHeight: 1.6 }}>
              Bu sütun boş.<br />
              <button onClick={() => setAddingCard(true)} style={{ background: 'none', border: 'none', color: '#6c6af6', cursor: 'pointer', fontSize: 12.5, padding: 0, marginTop: 4 }}>+ Kart ekle</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Card Modal ───────────────────────────────────────────────────────────────
const CardModal = ({ card, columnId, columns, members, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: card?.title || '',
    description: card?.description || '',
    priority: card?.priority || 'medium',
    dueDate: card?.dueDate || '',
    assignees: (card?.assignees || []).map(a => a.id),  // id listesi tutuyoruz
    labels: card?.labels || [],
    checklist: card?.checklist || [],
  });
  const [newLabel, setNewLabel] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [targetCol, setTargetCol] = useState(columnId);
  const isNew = !card?.id;

  const update = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const toggleAssignee = (id) => setForm(p => ({
    ...p,
    assignees: p.assignees.includes(id) ? p.assignees.filter(x => x !== id) : [...p.assignees, id]
  }));
  const addLabel = () => { if (!newLabel.trim()) return; const l = newLabel.trim(); if (!form.labels.includes(l)) update('labels', [...form.labels, l]); setNewLabel(''); };
  const removeLabel = (l) => update('labels', form.labels.filter(x => x !== l));
  const addCheckItem = () => { if (!newCheckItem.trim()) return; update('checklist', [...form.checklist, { id: null, text: newCheckItem.trim(), done: false }]); setNewCheckItem(''); };
  const toggleCheckItem = (idx) => update('checklist', form.checklist.map((i, j) => j === idx ? { ...i, done: !i.done } : i));
  const removeCheckItem = (idx) => update('checklist', form.checklist.filter((_, j) => j !== idx));

  const handleSave = () => {
    if (!form.title.trim()) return;
    // API'ye gönderilecek payload
    onSave({
      ...form,
      columnId: targetCol,
      cardId: card?.id || null,
      originalColumnId: columnId,
    });
    onClose();
  };

  const done = form.checklist.filter(i => i.done).length;
  const total = form.checklist.length;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.15s ease' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: '100%', maxWidth: 580, background: '#16161e', border: '1px solid #252530', borderRadius: 16, display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.7)', animation: 'scaleIn 0.15s cubic-bezier(0.34,1.2,0.64,1)' }}>
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #1e1e26', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#d8d8e0' }}>{isNew ? 'Yeni Kart Oluştur' : 'Kartı Düzenle'}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#55556a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconX size={15} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Başlık *</label>
            <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Kart başlığı..." autoFocus style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Açıklama</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="İsteğe bağlı açıklama..." rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Öncelik</label>
              <select value={form.priority} onChange={e => update('priority', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Bitiş Tarihi</label>
              <input type="date" value={form.dueDate} onChange={e => update('dueDate', e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={labelStyle}>Sütun</label>
              <select value={targetCol} onChange={e => setTargetCol(Number(e.target.value))} style={{ ...inputStyle, cursor: 'pointer' }}>
                {(columns || []).map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
              </select>
            </div>
          </div>

          {/* Assignees — API'den gelen members listesi */}
          <div>
            <label style={labelStyle}>Atananlar</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(members || []).map(m => {
                const active = form.assignees.includes(m.id);
                return (
                  <button key={m.id} onClick={() => toggleAssignee(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px 5px 5px', borderRadius: 20, border: `1px solid ${active ? 'rgba(108,106,246,0.4)' : '#252530'}`, background: active ? 'rgba(108,106,246,0.12)' : '#1a1a22', cursor: 'pointer', transition: 'all 0.12s ease' }}>
                    <Avatar member={m} size={22} />
                    <span style={{ fontSize: 12.5, color: active ? '#a09ff5' : '#9090a0', fontWeight: active ? 550 : 450 }}>{m.name}</span>
                    {active && <IconCheck size={11} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Labels */}
          <div>
            <label style={labelStyle}>Etiketler</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {form.labels.map(l => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <LabelChip label={l} />
                  <button onClick={() => removeLabel(l)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#55556a', padding: 0, display: 'flex', lineHeight: 1 }}><IconX size={11} /></button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); } }} placeholder="Etiket ekle..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addLabel} style={smallBtnStyle}>Ekle</button>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Kontrol Listesi</span>
              {total > 0 && <span style={{ fontSize: 11, color: done === total ? '#4ade80' : '#55556a', fontWeight: 500 }}>{done} / {total} tamamlandı</span>}
            </label>
            {total > 0 && (
              <div style={{ height: 3, borderRadius: 9999, background: '#1e1e26', marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 9999, width: `${Math.round((done / total) * 100)}%`, background: done === total ? '#22c55e' : '#6c6af6', transition: 'width 0.3s ease' }} />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {form.checklist.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => toggleCheckItem(idx)} style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${item.done ? '#6c6af6' : '#3a3a4a'}`, background: item.done ? '#6c6af6' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s ease', padding: 0 }}>
                    {item.done && <IconCheck size={11} />}
                  </button>
                  <span style={{ flex: 1, fontSize: 13, color: item.done ? '#45455a' : '#b0b0c0', textDecoration: item.done ? 'line-through' : 'none', transition: 'all 0.12s ease' }}>{item.text}</span>
                  <button onClick={() => removeCheckItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#35354a', display: 'flex', padding: 4, borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = '#35354a'}><IconX size={12} /></button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCheckItem(); } }} placeholder="Yeni öğe ekle..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addCheckItem} style={smallBtnStyle}>Ekle</button>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #1e1e26', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #2a2a36', background: 'transparent', color: '#9090a0', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>İptal</button>
          <button onClick={handleSave} disabled={!form.title.trim()} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: form.title.trim() ? '#6c6af6' : '#2a2a36', color: form.title.trim() ? 'white' : '#45455a', cursor: form.title.trim() ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 550 }}>
            {isNew ? 'Kart Oluştur' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Column Edit Modal ────────────────────────────────────────────────────────
const ColumnModal = ({ column, onSave, onClose }) => {
  const [title, setTitle] = useState(column?.title || '');
  const [color, setColor] = useState(column?.color || '#6c6af6');
  const PRESET_COLORS = ['#6c6af6', '#22c55e', '#f97316', '#ef4444', '#eab308', '#06b6d4', '#ec4899', '#8b5cf6', '#505060'];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.15s ease' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: '100%', maxWidth: 360, background: '#16161e', border: '1px solid #252530', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.7)', animation: 'scaleIn 0.15s cubic-bezier(0.34,1.2,0.64,1)' }}>
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #1e1e26', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#d8d8e0' }}>{column ? 'Sütunu Düzenle' : 'Yeni Sütun'}</span>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: '#55556a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconX size={14} /></button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Başlık</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Sütun adı..." autoFocus onKeyDown={e => { if (e.key === 'Enter' && title.trim()) { onSave({ title: title.trim(), color }); onClose(); } }} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Renk</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', border: color === c ? '2.5px solid white' : '2px solid transparent', background: c, cursor: 'pointer', padding: 0, boxShadow: color === c ? `0 0 0 2px ${c}50` : 'none', transition: 'all 0.12s ease' }} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ ...smallBtnStyle, padding: '7px 16px' }}>İptal</button>
          <button onClick={() => { if (title.trim()) { onSave({ title: title.trim(), color }); onClose(); } }} disabled={!title.trim()} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: title.trim() ? '#6c6af6' : '#2a2a36', color: title.trim() ? 'white' : '#45455a', cursor: title.trim() ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 550 }}>Kaydet</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main TaskBoard ───────────────────────────────────────────────────────────
export default function Tasks() {
  const [columns, setColumns] = useState([]);
  const [members, setMembers] = useState([]);       // Proje üyeleri (AssigneeDto listesi)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggingCardId, setDraggingCardId] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const boardRef = useRef(null);

  // Keyframe animasyonları — sadece bir kez inject et
  useEffect(() => {
    const id = 'taskboard-animations';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
      @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(-6px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      @keyframes dropIn  { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: translateY(0) } }
      @keyframes slideDown { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
    `;
    document.head.appendChild(style);
  }, []);

  // ── İlk yükleme: GET /api/board ────────────────────────────────────────────
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/api/board');
        const data = res.data?.data || res.data;
        setColumns(data.columns || []);
        setMembers(data.members || []);
      } catch (err) {
        setError('Pano yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        console.error('Board fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, []);

  // ── Kart Ekleme ─────────────────────────────────────────────────────────────
  const handleAddCard = useCallback(async (columnId, title) => {
    // Optimistic UI: geçici kart hemen göster
    const tempId = `temp_${Date.now()}`;
    const tempCard = {
      id: tempId, title, description: '', priority: 'medium',
      dueDate: null, assignees: [], labels: [], checklist: [], columnId,
    };
    setColumns(cols => cols.map(col =>
      col.id === columnId ? { ...col, cards: [...(col.cards || []), tempCard] } : col
    ));

    try {
      const res = await api.post(`/board/columns/${columnId}/cards`, { title });
      const savedCard = res.data?.data || res.data;
      // Geçici kartı gerçek kart ile değiştir
      setColumns(cols => cols.map(col =>
        col.id === columnId
          ? { ...col, cards: (col.cards || []).map(c => c.id === tempId ? savedCard : c) }
          : col
      ));
    } catch (err) {
      console.error('Kart ekleme hatası:', err);
      // Başarısız olursa geçici kartı geri al
      setColumns(cols => cols.map(col =>
        col.id === columnId ? { ...col, cards: (col.cards || []).filter(c => c.id !== tempId) } : col
      ));
    }
  }, []);

  // ── Kart Düzenleme (modal aç) ───────────────────────────────────────────────
  const handleEditCard = useCallback((card, columnId) => {
    setEditingCard({ card, columnId });
  }, []);

  // ── Kart Kaydetme (modal'dan) ───────────────────────────────────────────────
  const handleSaveCard = useCallback(async (payload) => {
    const { cardId, originalColumnId, columnId: targetColumnId, ...formData } = payload;
    const isNew = !cardId;

    if (isNew) {
      // Zaten handleAddCard'da oluşturulmuş olabilir — modal üzerinden tam kart oluşturma
      try {
        const body = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          assigneeIds: formData.assignees,
          labels: formData.labels,
        };
        const res = await api.post(`/api/board/columns/${targetColumnId}/cards`, body);
        const saved = res.data?.data || res.data;
        setColumns(cols => cols.map(col =>
          col.id === targetColumnId ? { ...col, cards: [...(col.cards || []), saved] } : col
        ));
      } catch (err) {
        console.error('Kart oluşturma hatası:', err);
      }
    } else {
      // Optimistic update
      const updateFn = (cols) => cols.map(col => ({
        ...col,
        cards: (col.cards || []).map(c => c.id === cardId
          ? { ...c, ...formData, assignees: members.filter(m => formData.assignees.includes(m.id)), columnId: targetColumnId }
          : c
        ).filter(c => {
          // Farklı sütuna taşındıysa kaynak sütundan çıkar
          if (c.id === cardId && col.id === originalColumnId && targetColumnId !== originalColumnId) return false;
          return true;
        })
      })).map(col => {
        // Farklı sütuna taşındıysa hedef sütuna ekle
        if (col.id === targetColumnId && targetColumnId !== originalColumnId) {
          const movedCard = { ...formData, id: cardId, assignees: members.filter(m => formData.assignees.includes(m.id)), columnId: targetColumnId };
          if (!(col.cards || []).find(c => c.id === cardId)) {
            return { ...col, cards: [...(col.cards || []), movedCard] };
          }
        }
        return col;
      });

      setColumns(prev => updateFn(prev));

      try {
        const body = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          columnId: targetColumnId,
          assigneeIds: formData.assignees,
          labels: formData.labels,
          checklist: formData.checklist,
        };
        const res = await api.patch(`/api/board/cards/${cardId}`, body);
        const saved = res.data?.data || res.data;
        // Gerçek veriyle güncelle
        setColumns(cols => cols.map(col => ({
          ...col,
          cards: (col.cards || []).map(c => c.id === cardId ? saved : c)
        })));
      } catch (err) {
        console.error('Kart güncelleme hatası:', err);
        // Rollback: boardu yeniden yükle
        const res = await api.get('/board');
        const data = res.data?.data || res.data;
        setColumns(data.columns || []);
      }
    }
  }, [members]);

  // ── Kart Silme ──────────────────────────────────────────────────────────────
  const handleDeleteCard = useCallback(async (cardId, columnId) => {
    // Optimistic remove
    setColumns(cols => cols.map(col =>
      col.id === columnId ? { ...col, cards: (col.cards || []).filter(c => c.id !== cardId) } : col
    ));
    try {
      await api.delete(`/api/board/cards/${cardId}`);
    } catch (err) {
      console.error('Kart silme hatası:', err);
      // Rollback
      const res = await api.get('/board');
      const data = res.data?.data || res.data;
      setColumns(data.columns || []);
    }
  }, []);

  // ── Drag & Drop — Optimistic UI ─────────────────────────────────────────────
  const handleDrop = useCallback(async (e, targetColumnId) => {
    const cardId = Number(e.dataTransfer.getData('cardId'));
    const sourceColumnId = Number(e.dataTransfer.getData('sourceColumnId'));
    if (!cardId || targetColumnId === sourceColumnId) { setDraggingCardId(null); return; }

    // 1. Optimistic: kartı hemen taşı
    let movedCard = null;
    setColumns(cols => {
      let result = cols.map(col => {
        if (col.id === sourceColumnId) {
          movedCard = (col.cards || []).find(c => c.id === cardId);
          return { ...col, cards: (col.cards || []).filter(c => c.id !== cardId) };
        }
        return col;
      });
      return result.map(col =>
        col.id === targetColumnId && movedCard
          ? { ...col, cards: [...(col.cards || []), { ...movedCard, columnId: targetColumnId }] }
          : col
      );
    });
    setDraggingCardId(null);

    // 2. Arka planda API'ye bildir
    try {
      const targetCards = columns.find(c => c.id === targetColumnId)?.cards || [];
      const newPosition = targetCards.length; // Sütun sonuna ekle
      await api.patch(`/api/board/cards/${cardId}/move`, {
        targetColumnId,
        newPosition,
      });
    } catch (err) {
      console.error('Kart taşıma hatası:', err);
      // Başarısız olursa gerçek veriyle geri dön
      const res = await api.get('/board');
      const data = res.data?.data || res.data;
      setColumns(data.columns || []);
    }
  }, [columns]);

  // ── Sütun İşlemleri ─────────────────────────────────────────────────────────
  const handleAddColumn = useCallback(async (data) => {
    const tempId = `tempcol_${Date.now()}`;
    // Optimistic
    setColumns(cols => [...cols, { id: tempId, title: data.title, color: data.color, cards: [] }]);
    try {
      const res = await api.post('/api/board/columns', { title: data.title, color: data.color });
      const saved = res.data?.data || res.data;
      setColumns(cols => cols.map(col => col.id === tempId ? { ...saved, cards: [] } : col));
    } catch (err) {
      console.error('Sütun oluşturma hatası:', err);
      setColumns(cols => cols.filter(c => c.id !== tempId));
    }
  }, []);

  const handleEditColumn = useCallback((column) => setEditingColumn(column), []);

  const handleSaveColumn = useCallback(async (data) => {
    if (editingColumn === 'new') {
      await handleAddColumn(data);
    } else {
      // Optimistic
      setColumns(cols => cols.map(col => col.id === editingColumn.id ? { ...col, ...data } : col));
      try {
        await api.patch(`/board/columns/${editingColumn.id}`, data);
      } catch (err) {
        console.error('Sütun güncelleme hatası:', err);
        const res = await api.get('/api/board');
        const d = res.data?.data || res.data;
        setColumns(d.columns || []);
      }
    }
  }, [editingColumn, handleAddColumn]);

  const handleDeleteColumn = useCallback(async (columnId) => {
    // Optimistic
    setColumns(cols => cols.filter(c => c.id !== columnId));
    try {
      await api.delete(`/api/board/columns/${columnId}`);
    } catch (err) {
      console.error('Sütun silme hatası:', err);
      const res = await api.get('/api/board');
      const d = res.data?.data || res.data;
      setColumns(d.columns || []);
    }
  }, []);

  // ── Filtre & hesaplamalar ────────────────────────────────────────────────────
  const totalCards = (columns || []).reduce((acc, col) => acc + (col.cards || []).length, 0);
  const filteredColumns = (columns || []).map(col => ({
    ...col,
    cards: (col.cards || []).filter(card => {
      const matchesSearch = !searchQuery
        || (card.title || '').toLowerCase().includes(searchQuery.toLowerCase())
        || (card.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === 'all' || card.priority === filterPriority;
      return matchesSearch && matchesPriority;
    }),
  }));
  const filteredTotal = filteredColumns.reduce((acc, col) => acc + (col.cards || []).length, 0);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#0e0e14', color: '#d8d8e0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #1e1e26', flexShrink: 0, background: '#0e0e14' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(108,106,246,0.18)', border: '1px solid rgba(108,106,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="rgba(157,156,248,1)" aria-hidden="true">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 650, color: '#e8e8f0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Görev Takibi</h1>
              <p style={{ margin: 0, fontSize: 12, color: '#45455a', lineHeight: 1.4, marginTop: 1 }}>
                {loading ? 'Yükleniyor...' : `${filteredTotal} / ${totalCards} kart · ${(columns || []).length} sütun`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditingColumn('new')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #252530', background: '#1a1a22', color: '#9090a0', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, transition: 'all 0.12s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e1e2e'; e.currentTarget.style.color = '#a09ff5'; e.currentTarget.style.borderColor = 'rgba(108,106,246,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1a1a22'; e.currentTarget.style.color = '#9090a0'; e.currentTarget.style.borderColor = '#252530'; }}
          >
            <IconPlus size={13} /> Sütun Ekle
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160, maxWidth: 280 }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="#45455a" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Kart ara..."
              style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8, border: '1px solid #252530', background: '#13131a', color: '#d8d8e0', fontSize: 13, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.12s ease', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = 'rgba(108,106,246,0.5)'}
              onBlur={e => e.target.style.borderColor = '#252530'}
            />
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
            {[{ id: 'all', label: 'Tümü' }, ...PRIORITIES].map(p => (
              <button key={p.id} onClick={() => setFilterPriority(p.id)} style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${filterPriority === p.id ? 'rgba(108,106,246,0.4)' : '#252530'}`, background: filterPriority === p.id ? 'rgba(108,106,246,0.12)' : 'transparent', color: filterPriority === p.id ? '#9d9cf8' : '#55556a', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all 0.12s ease', whiteSpace: 'nowrap' }}>
                {p.label}
              </button>
            ))}
          </div>
          {/* Üye avatarları — API'den gelen members */}
          <div style={{ display: 'flex', marginLeft: 'auto' }}>
            {(members || []).map((m, idx) => (
              <div key={m.id} style={{ marginLeft: idx === 0 ? 0 : -8 }}>
                <Avatar member={m} size={26} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Board */}
      {loading ? (
        <BoardSkeleton />
      ) : error ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: 14 }}>
          {error}
        </div>
      ) : (
        <div
          ref={boardRef}
          style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '16px 20px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}
        >
          {filteredColumns.map(col => (
            <Column
              key={col.id}
              column={col}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onEditColumn={handleEditColumn}
              onDeleteColumn={handleDeleteColumn}
              onDrop={handleDrop}
              draggingCardId={draggingCardId}
            />
          ))}
          <button
            onClick={() => setEditingColumn('new')}
            style={{ minWidth: 240, height: 54, flexShrink: 0, border: '1.5px dashed #252530', borderRadius: 13, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#35354a', fontSize: 13, fontWeight: 500, transition: 'all 0.15s ease', alignSelf: 'flex-start' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,106,246,0.4)'; e.currentTarget.style.color = '#6c6af6'; e.currentTarget.style.background = 'rgba(108,106,246,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#252530'; e.currentTarget.style.color = '#35354a'; e.currentTarget.style.background = 'transparent'; }}
          >
            <IconPlus size={14} /> Sütun Ekle
          </button>
        </div>
      )}

      {/* Modals */}
      {editingCard && (
        <CardModal
          card={editingCard.card}
          columnId={editingCard.columnId}
          columns={columns}
          members={members}
          onSave={handleSaveCard}
          onClose={() => setEditingCard(null)}
        />
      )}
      {editingColumn && (
        <ColumnModal
          column={editingColumn === 'new' ? null : editingColumn}
          onSave={handleSaveColumn}
          onClose={() => setEditingColumn(null)}
        />
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, memo } from 'react';
import api from '../api/axiosInstance';

// ─── Inject keyframes once ────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById('cal-styles')) return;
  const s = document.createElement('style');
  s.id = 'cal-styles';
  s.textContent = `
    @keyframes calFadeIn   { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
    @keyframes calScaleIn  { from { opacity:0; transform:scale(0.96) translateY(-4px) } to { opacity:1; transform:scale(1) translateY(0) } }
    @keyframes calSlideUp  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
    @keyframes calPop      { 0%{transform:scale(1)} 40%{transform:scale(1.12)} 100%{transform:scale(1)} }
    @keyframes calShimmer  { from{background-position:200% 0} to{background-position:-200% 0} }

    .cal-day { transition: background 0.13s ease, box-shadow 0.13s ease; }
    .cal-day:hover .cal-day-inner { background: #1e1e28; }
    .cal-day:hover .cal-add-btn   { opacity: 1 !important; }

    .cal-event { transition: filter 0.12s ease, transform 0.12s ease; cursor:pointer; }
    .cal-event:hover { filter: brightness(1.15); transform: translateY(-1px); }

    .cal-nav-btn:hover { background: #1e1e28 !important; color: #d0d0e0 !important; }

    .cal-pill-btn { transition: all 0.12s ease; }
    .cal-pill-btn:hover { background: #1e1e28 !important; color: #d0d0e0 !important; }
    .cal-pill-btn.active { background: #252535 !important; color: #9d9cf8 !important; border-color: rgba(108,106,246,0.35) !important; }

    .cal-scroll::-webkit-scrollbar { width: 4px; }
    .cal-scroll::-webkit-scrollbar-track { background: transparent; }
    .cal-scroll::-webkit-scrollbar-thumb { background: #2a2a36; border-radius: 9999px; }
    .cal-scroll::-webkit-scrollbar-thumb:hover { background: #3a3a4a; }

    .cal-modal-overlay { animation: calFadeIn 0.15s ease; }
    .cal-modal-box     { animation: calScaleIn 0.18s cubic-bezier(0.34,1.2,0.64,1); }
    .cal-row           { animation: calSlideUp 0.22s ease both; }
    .cal-sidebar-item  { transition: background 0.12s ease, border-color 0.12s ease; }
    .cal-sidebar-item:hover { background: #1e1e28 !important; border-color: #2e2e3e !important; }
    .cal-today-ring { animation: calPop 0.4s ease; }

    .cal-shimmer {
      background: linear-gradient(90deg, #1a1a22 25%, #222230 50%, #1a1a22 75%);
      background-size: 200% 100%;
      animation: calShimmer 1.6s ease-in-out infinite;
    }
  `;
  document.head.appendChild(s);
};

// ─── Constants ────────────────────────────────────────────────────────────────
const FONT   = '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif';
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
                 'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const DAYS_SHORT = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
const DAYS_LONG  = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];

const EVENT_TYPES = {
  task:         { label: 'Görev',    color: '#6c6af6', bg: 'rgba(108,106,246,0.18)', border: 'rgba(108,106,246,0.35)', dot: '#6c6af6' },
  subscription: { label: 'Abonelik', color: '#a855f7', bg: 'rgba(168,85,247,0.16)',  border: 'rgba(168,85,247,0.32)',  dot: '#a855f7' },
  payment:      { label: 'Ödeme',    color: '#10b981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.30)',  dot: '#10b981' },
  note:         { label: 'Not',      color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.28)',  dot: '#f59e0b' },
};

const PRIORITY_COLORS = {
  urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e',
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IC = {
  ChevLeft: () => (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
    </svg>
  ),
  ChevRight: () => (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
    </svg>
  ),
  Plus: () => (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
    </svg>
  ),
  Flag: () => (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 7l2.55 2.4A1 1 0 0116 11H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/>
    </svg>
  ),
  CreditCard: () => (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
    </svg>
  ),
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
// ÖNEMLİ DEĞİŞİKLİK: Kullanıcıya özgü key kullanıyoruz.
// Çıkış yapıldığında token silinir, giriş yapılınca yeni token'a göre
// doğru etkinlikler yüklenir — karışma ve kaybolma sorunu ortadan kalkar.
const getLS_KEY = () => {
  try {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('access_token') ||
      'guest';
    // Token'ın ilk 20 karakterinden alfanümerik bir anahtar türet
    const userKey = token.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
    return `calendar_manual_events_${userKey}`;
  } catch {
    return 'calendar_manual_events_guest';
  }
};

const loadManualEvents = () => {
  try {
    const saved = localStorage.getItem(getLS_KEY());
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveManualEvents = (events) => {
  try {
    localStorage.setItem(getLS_KEY(), JSON.stringify(events));
  } catch (e) {
    console.warn('localStorage yazılamadı:', e);
  }
};

// ─── Date helpers ─────────────────────────────────────────────────────────────
const generateId = () => `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const toLocalDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateStr = (dateStr) => {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(y, mo - 1, d);
};

const getMonthGrid = (year, month) => {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;
  const cells = [];
  for (let i = offset - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, month: month - 1, year: month === 0 ? year - 1 : year, overflow: true });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, month, year, overflow: false });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++)
    cells.push({ day: d, month: month + 1, year: month === 11 ? year + 1 : year, overflow: true });
  return cells;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate();

const isToday = (year, month, day) => isSameDay(new Date(year, month, day), new Date());

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ w = '100%', h = 14, r = 6 }) => (
  <div className="cal-shimmer" style={{ width: w, height: h, borderRadius: r }} />
);

// ─── Event Pill ───────────────────────────────────────────────────────────────
const EventPill = memo(({ event, onClick, compact = false }) => {
  const cfg = EVENT_TYPES[event.type] || EVENT_TYPES.task;
  return (
    <div
      className="cal-event"
      onClick={(e) => { e.stopPropagation(); onClick(event); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: compact ? '1px 5px' : '2px 7px',
        borderRadius: 5,
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        fontSize: compact ? 10.5 : 11.5,
        fontWeight: 550, color: cfg.color,
        overflow: 'hidden', whiteSpace: 'nowrap',
        lineHeight: 1.5, userSelect: 'none',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{event.title}</span>
    </div>
  );
});

// ─── Day Cell ─────────────────────────────────────────────────────────────────
const DayCell = memo(({ cell, events, selected, onClick, onEventClick }) => {
  const today      = isToday(cell.year, cell.month, cell.day);
  const isSelected = selected && isSameDay(new Date(cell.year, cell.month, cell.day), selected);
  const visible    = events.slice(0, 3);
  const overflow   = events.length - 3;

  return (
    <div
      className="cal-day"
      onClick={() => onClick(cell)}
      style={{
        minHeight: 90, padding: 0, cursor: 'pointer', position: 'relative',
        borderRight: '1px solid #1e1e28', borderBottom: '1px solid #1e1e28',
      }}
    >
      <div
        className="cal-day-inner"
        style={{
          height: '100%', padding: '7px 7px 6px',
          background: isSelected ? '#1a1a2e' : 'transparent',
          transition: 'background 0.13s ease',
          display: 'flex', flexDirection: 'column', gap: 3,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <span
            className={today ? 'cal-today-ring' : ''}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: today ? 26 : 22, height: today ? 26 : 22, borderRadius: '50%',
              background: today ? '#6c6af6' : 'transparent',
              color: today ? '#fff' : isSelected ? '#9d9cf8' : cell.overflow ? '#35354a' : '#9090a0',
              fontSize: 12.5, fontWeight: today ? 700 : 500, lineHeight: 1, flexShrink: 0,
            }}
          >
            {cell.day}
          </span>
          <button
            className="cal-add-btn"
            onClick={(e) => { e.stopPropagation(); onClick(cell, true); }}
            title="Etkinlik ekle"
            style={{
              opacity: 0, width: 20, height: 20, borderRadius: 5,
              border: 'none', background: 'rgba(108,106,246,0.15)',
              color: '#6c6af6', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'opacity 0.12s ease',
            }}
          >
            <IC.Plus />
          </button>
        </div>
        {visible.map(ev => (
          <EventPill key={ev.id} event={ev} onClick={onEventClick} compact />
        ))}
        {overflow > 0 && (
          <span style={{ fontSize: 10.5, color: '#45455a', fontWeight: 600, paddingLeft: 5 }}>
            +{overflow} daha
          </span>
        )}
      </div>
      {isSelected && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          boxShadow: 'inset 0 0 0 1.5px rgba(108,106,246,0.4)', borderRadius: 1,
        }} />
      )}
    </div>
  );
});

// ─── Day Detail Panel ─────────────────────────────────────────────────────────
const DayPanel = memo(({ date, events, onClose, onAdd, onDelete }) => {
  const today   = date && isSameDay(date, new Date());
  const dayName = date ? DAYS_LONG[(date.getDay() + 6) % 7] : '';

  return (
    <aside style={{
      width: 280, flexShrink: 0,
      background: '#13131a', borderLeft: '1px solid #1e1e28',
      display: 'flex', flexDirection: 'column',
      animation: 'calFadeIn 0.18s ease',
    }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1e1e28', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          {date ? (
            <>
              <p style={{ margin: 0, fontSize: 11, color: '#45455a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {dayName}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 32, fontWeight: 300, lineHeight: 1, color: today ? '#9d9cf8' : '#d0d0e0', letterSpacing: '-0.03em' }}>
                  {date.getDate()}
                </span>
                <span style={{ fontSize: 13, color: '#45455a', fontWeight: 500 }}>
                  {MONTHS[date.getMonth()]} {date.getFullYear()}
                </span>
              </div>
              {today && (
                <span style={{ display: 'inline-block', marginTop: 6, fontSize: 10.5, background: 'rgba(108,106,246,0.15)', border: '1px solid rgba(108,106,246,0.3)', color: '#9d9cf8', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                  Bugün
                </span>
              )}
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: '#45455a' }}>Gün seç</p>
          )}
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer', background: 'transparent', color: '#45455a', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s ease' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1e1e28'; e.currentTarget.style.color = '#c0c0d0'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#45455a'; }}>
          <IC.X />
        </button>
      </div>

      {date && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #1e1e28' }}>
          <button onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 12px', borderRadius: 9, border: '1px dashed #2e2e3e', background: 'transparent', cursor: 'pointer', color: '#6c6af6', fontSize: 12.5, fontWeight: 550, fontFamily: FONT, transition: 'all 0.12s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,106,246,0.07)'; e.currentTarget.style.borderColor = 'rgba(108,106,246,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#2e2e3e'; }}>
            <IC.Plus /> Etkinlik ekle
          </button>
        </div>
      )}

      <div className="cal-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {!date ? (
          <PanelEmpty message="Takvimde bir güne tıklayarak etkinlikleri görüntüleyin." />
        ) : events.length === 0 ? (
          <PanelEmpty message="Bu gün için etkinlik bulunmuyor." />
        ) : (
          events.map((ev, i) => (
            <PanelEventCard key={ev.id} event={ev} delay={i * 35} onDelete={onDelete} />
          ))
        )}
      </div>
    </aside>
  );
});

const PanelEmpty = ({ message }) => (
  <div style={{ padding: '32px 8px', textAlign: 'center' }}>
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1a1a22', border: '1px solid #252530', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#35354a' }}>
      <IC.Calendar />
    </div>
    <p style={{ margin: 0, fontSize: 12.5, color: '#35354a', lineHeight: 1.6 }}>{message}</p>
  </div>
);

const PanelEventCard = memo(({ event, delay, onDelete }) => {
  const cfg      = EVENT_TYPES[event.type] || EVENT_TYPES.task;
  const isManual = String(event.id).startsWith('ev_') || event.isManual;

  return (
    <div className="cal-sidebar-item" style={{
      background: '#19191f', border: '1px solid #232330',
      borderRadius: 10, padding: '10px 12px',
      animation: `calSlideUp 0.2s ease ${delay}ms both`,
      borderLeft: `3px solid ${cfg.color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 650, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '1px 6px', borderRadius: 4 }}>
            {(event.type === 'task') && <IC.Flag />}
            {(event.type === 'subscription' || event.type === 'payment') && <IC.CreditCard />}
            {cfg.label}
          </span>
          {event.priority && (
            <span style={{ fontSize: 10.5, fontWeight: 600, color: PRIORITY_COLORS[event.priority] || '#9090a0' }}>
              ● {event.priority === 'urgent' ? 'Acil' : event.priority === 'high' ? 'Yüksek' : event.priority === 'medium' ? 'Orta' : 'Düşük'}
            </span>
          )}
        </div>
        {isManual && onDelete && (
          <button onClick={() => onDelete(event.id)} style={{ width: 22, height: 22, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', color: '#35354a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.12s ease', padding: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#35354a'; }}>
            <IC.Trash />
          </button>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#c8c8d8', lineHeight: 1.4 }}>{event.title}</p>
      {event.subtitle && <p style={{ margin: '3px 0 0', fontSize: 11.5, color: '#45455a' }}>{event.subtitle}</p>}
      {event.amount && <p style={{ margin: '5px 0 0', fontSize: 13, fontWeight: 700, color: '#10b981' }}>₺{parseFloat(event.amount).toFixed(0)}</p>}
    </div>
  );
});

// ─── Event Modal ──────────────────────────────────────────────────────────────
const EventModal = ({ date, onClose, onSave }) => {
  const [form, setForm] = useState({ title: '', type: 'task', priority: 'medium', note: '' });
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({ id: generateId(), ...form, date: toLocalDateStr(date), isManual: true });
    onClose();
  };

  const LabelS = ({ children }) => (
    <span style={{ display: 'block', fontSize: 11, fontWeight: 650, color: '#45455a', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
      {children}
    </span>
  );

  const inputS = {
    width: '100%', padding: '8px 11px', borderRadius: 8,
    border: '1px solid #252530', background: '#0e0e14',
    color: '#d0d0e0', fontSize: 13, fontFamily: FONT,
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.12s ease',
  };

  return (
    <div className="cal-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cal-modal-box" style={{ width: '100%', maxWidth: 440, background: '#16161e', border: '1px solid #252530', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #1e1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: '#45455a', fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Yeni Etkinlik</p>
            <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 650, color: '#d0d0e0' }}>
              {date ? `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}` : ''}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#45455a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IC.X />
          </button>
        </div>

        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div>
            <LabelS>Başlık *</LabelS>
            <input autoFocus value={form.title} onChange={e => up('title', e.target.value)} placeholder="Etkinlik başlığı…" style={inputS}
              onFocus={e => e.target.style.borderColor = 'rgba(108,106,246,0.5)'}
              onBlur={e => e.target.style.borderColor = '#252530'}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <LabelS>Tür</LabelS>
              <select value={form.type} onChange={e => up('type', e.target.value)} style={{ ...inputS, cursor: 'pointer' }}>
                {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <LabelS>Öncelik</LabelS>
              <select value={form.priority} onChange={e => up('priority', e.target.value)} style={{ ...inputS, cursor: 'pointer' }}>
                <option value="urgent">Acil</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>
          </div>
          <div>
            <LabelS>Not</LabelS>
            <textarea value={form.note} onChange={e => up('note', e.target.value)} placeholder="İsteğe bağlı not…" rows={2}
              style={{ ...inputS, resize: 'vertical', lineHeight: 1.55 }}
              onFocus={e => e.target.style.borderColor = 'rgba(108,106,246,0.5)'}
              onBlur={e => e.target.style.borderColor = '#252530'}
            />
          </div>
        </div>

        <div style={{ padding: '10px 20px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #252530', background: 'transparent', color: '#9090a0', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: FONT }}>
            İptal
          </button>
          <button onClick={handleSave} disabled={!form.title.trim()} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: form.title.trim() ? '#6c6af6' : '#252530', color: form.title.trim() ? '#fff' : '#45455a', cursor: form.title.trim() ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600, fontFamily: FONT }}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Calendar ────────────────────────────────────────────────────────────
export default function Calendar() {
  useEffect(() => { injectStyles(); }, []);

  const today = new Date();

  const [curYear,       setCurYear]    = useState(today.getFullYear());
  const [curMonth,      setCurMonth]   = useState(today.getMonth());
  const [loading,       setLoading]    = useState(true);
  const [apiEvents,     setApiEvents]  = useState([]);
  // ÖNEMLİ: useState başlatıcısı component mount'ta bir kez çalışır.
  // Kullanıcıya özgü key ile localStorage'dan yükle.
  const [manualEvents,  setManualEvents] = useState(() => loadManualEvents());
  const [selectedDate,  setSelected]   = useState(today);
  const [showModal,     setShowModal]  = useState(false);
  const [modalDate,     setModalDate]  = useState(null);
  const [activeFilter,  setFilter]     = useState('all');
  const [panelOpen,     setPanelOpen]  = useState(true);
  const [transitioning, setTrans]      = useState(false);

  // manualEvents her değiştiğinde kullanıcıya özgü key ile kaydet
  useEffect(() => {
    saveManualEvents(manualEvents);
  }, [manualEvents]);

  // ── API fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tRes, sRes] = await Promise.allSettled([
          api.get('/api/tasks'),
          api.get('/api/subscriptions'),
        ]);
        const ev = [];

        if (tRes.status === 'fulfilled') {
          const tasksData = tRes.value.data?.data || tRes.value.data || [];
          tasksData.forEach(t => {
            if (t.dueDate) {
              ev.push({
                id:       `task_${t.id}`,
                title:    t.title,
                type:     'task',
                date:     t.dueDate.split('T')[0],
                priority: t.priority?.toLowerCase() || 'medium',
                subtitle: t.status || '',
                isManual: false,
              });
            }
          });
        }

        if (sRes.status === 'fulfilled') {
          const subsData = sRes.value.data?.data || sRes.value.data || [];
          subsData.forEach(s => {
            if (s.renewalDay) {
              const d = new Date(curYear, curMonth, s.renewalDay);
              ev.push({
                id:       `sub_${s.id}`,
                title:    s.platformName,
                type:     'subscription',
                date:     toLocalDateStr(d),
                subtitle: `Her ayın ${s.renewalDay}. günü`,
                amount:   s.amount,
                isManual: false,
              });
            }
          });
        }

        setApiEvents(ev);
      } catch (error) {
        console.error('Takvim verileri çekilirken hata:', error);
        setApiEvents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [curMonth, curYear]);

  const events = [...apiEvents, ...manualEvents];

  const navigate = useCallback((dir) => {
    setTrans(true);
    setTimeout(() => {
      setCurMonth(m => {
        const next = m + dir;
        if (next < 0)  { setCurYear(y => y - 1); return 11; }
        if (next > 11) { setCurYear(y => y + 1); return 0;  }
        return next;
      });
      setTrans(false);
    }, 120);
  }, []);

  const goToday = useCallback(() => {
    setTrans(true);
    setTimeout(() => {
      setCurYear(today.getFullYear());
      setCurMonth(today.getMonth());
      setSelected(today);
      setTrans(false);
    }, 120);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredEvents = events.filter(ev =>
    activeFilter === 'all' || ev.type === activeFilter
  );

  const getEventsForCell = useCallback((cell) => {
    const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
    return filteredEvents.filter(ev => ev.date === dateStr);
  }, [filteredEvents]);

  const selectedEvents = selectedDate
    ? filteredEvents.filter(ev => ev.date === toLocalDateStr(selectedDate))
    : [];

  const handleDayClick = useCallback((cell, openModal = false) => {
    const d = new Date(cell.year, cell.month, cell.day);
    setSelected(d);
    if (!panelOpen) setPanelOpen(true);
    if (openModal) { setModalDate(d); setShowModal(true); }
  }, [panelOpen]);

  const handleAddEvent = useCallback((eventData) => {
    const newEvent = {
      id:       eventData.id || generateId(),
      title:    eventData.title,
      type:     eventData.type,
      date:     eventData.date,
      priority: eventData.priority,
      note:     eventData.note || '',
      subtitle: 'Manuel Etkinlik',
      isManual: true,
    };
    setManualEvents(prev => [...prev, newEvent]);
  }, []);

  const handleDeleteEvent = useCallback((eventId) => {
    setManualEvents(prev => prev.filter(ev => ev.id !== eventId));
  }, []);

  const cells = getMonthGrid(curYear, curMonth);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: FONT, WebkitFontSmoothing: 'antialiased', color: '#d0d0e0', background: '#0e0e14', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px 12px', borderBottom: '1px solid #1e1e28', flexShrink: 0, flexWrap: 'wrap', rowGap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#e0e0ee', letterSpacing: '-0.025em', lineHeight: 1 }}>
              {MONTHS[curMonth]}
            </h1>
            <span style={{ fontSize: 18, fontWeight: 300, color: '#35354a' }}>{curYear}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { label: <IC.ChevLeft />,  fn: () => navigate(-1) },
              { label: 'Bugün',           fn: goToday },
              { label: <IC.ChevRight />, fn: () => navigate(1) },
            ].map((b, i) => (
              <button key={i} className="cal-nav-btn" onClick={b.fn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: typeof b.label === 'string' ? '5px 12px' : '5px 8px', borderRadius: 8, border: '1px solid #252530', background: 'transparent', color: '#9090a0', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, fontFamily: FONT, whiteSpace: 'nowrap' }}>
                {b.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[{ id: 'all', label: 'Tümü' }, ...Object.entries(EVENT_TYPES).map(([k, v]) => ({ id: k, label: v.label }))].map(f => (
              <button key={f.id} className={`cal-pill-btn ${activeFilter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}
                style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${activeFilter === f.id ? 'rgba(108,106,246,0.35)' : '#252530'}`, background: activeFilter === f.id ? '#252535' : 'transparent', color: activeFilter === f.id ? '#9d9cf8' : '#55556a', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: FONT }}>
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => setPanelOpen(v => !v)} className="cal-nav-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: `1px solid ${panelOpen ? 'rgba(108,106,246,0.3)' : '#252530'}`, background: panelOpen ? 'rgba(108,106,246,0.08)' : 'transparent', color: panelOpen ? '#9d9cf8' : '#9090a0', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: FONT }}>
              <IC.Calendar /> Panel
            </button>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, opacity: transitioning ? 0 : 1, transition: 'opacity 0.12s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid #1e1e28', flexShrink: 0 }}>
              {DAYS_SHORT.map((d, i) => (
                <div key={i} style={{ padding: '9px 10px', fontSize: 11.5, fontWeight: 650, color: i >= 5 ? '#3a3a4a' : '#45455a', textAlign: 'center', borderRight: i < 6 ? '1px solid #1e1e28' : 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {d}
                </div>
              ))}
            </div>

            <div className="cal-scroll" style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div key={i} style={{ minHeight: 90, padding: 8, borderRight: '1px solid #1e1e28', borderBottom: '1px solid #1e1e28' }}>
                      <Skeleton w={24} h={24} r={12} />
                      <div style={{ marginTop: 6 }}><Skeleton h={14} r={5} /></div>
                    </div>
                  ))}
                </div>
              ) : (
                weeks.map((week, wi) => (
                  <div key={wi} className="cal-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', animationDelay: `${wi * 28}ms` }}>
                    {week.map((cell) => (
                      <DayCell
                        key={`${cell.year}-${cell.month}-${cell.day}`}
                        cell={cell}
                        events={getEventsForCell(cell)}
                        selected={selectedDate}
                        onClick={handleDayClick}
                        onEventClick={(ev) => {
                          setSelected(parseDateStr(ev.date));
                          setPanelOpen(true);
                        }}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>

          {panelOpen && (
            <DayPanel
              date={selectedDate}
              events={selectedEvents}
              onClose={() => setPanelOpen(false)}
              onAdd={() => { setModalDate(selectedDate); setShowModal(true); }}
              onDelete={handleDeleteEvent}
            />
          )}
        </div>
      </div>

      {showModal && (
        <EventModal
          date={modalDate}
          onClose={() => setShowModal(false)}
          onSave={handleAddEvent}
        />
      )}
    </div>
  );
}
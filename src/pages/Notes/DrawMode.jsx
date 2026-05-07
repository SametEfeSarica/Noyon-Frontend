import { useState, useRef, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────
// SABITLER
// ─────────────────────────────────────────────────────────────
const COLORS = [
  '#ffffff', '#ff4d4d', '#ff9f43', '#ffeb3b',
  '#4ade80', '#4da3ff', '#a78bfa', '#f472b6', '#94a3b8',
];

const TOOLS = {
  pen: {
    label: 'Tükenmez Kalem',
    icon: '✏️',
    cursor: 'crosshair',
    setup: (ctx, color, size) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    },
  },
  brush: {
    label: 'Fırça',
    icon: '🖌️',
    cursor: 'crosshair',
    setup: (ctx, color, size) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    },
  },
  highlight: {
    label: 'Fosforlu Kalem',
    icon: '🖊️',
    cursor: 'crosshair',
    setup: (ctx, color, size, opacity) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 5;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'bevel';
    },
  },
  calligraphy: {
    label: 'Kaligrafik Kalem',
    icon: '🪶',
    cursor: 'crosshair',
    setup: (ctx, color, size) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';
    },
  },
  eraser: {
    label: 'Silgi',
    icon: '⬜',
    cursor: 'cell',
    setup: (ctx, _color, size) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = size * 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    },
  },
};

const MAX_HISTORY = 40;

// ─────────────────────────────────────────────────────────────
// YARDIMCI FONKSİYONLAR
// ─────────────────────────────────────────────────────────────
function getPointerPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const src = e.touches ? e.touches[0] : e;
  return { x: src.clientX - rect.left, y: src.clientY - rect.top };
}

// ─────────────────────────────────────────────────────────────
// ARAÇ ÇUBUĞU ALT BİLEŞENLERİ
// ─────────────────────────────────────────────────────────────
function ToolBtn({ toolKey, currentTool, onClick }) {
  const t = TOOLS[toolKey];
  const isActive = currentTool === toolKey;
  const activeColor =
    toolKey === 'eraser' ? '#6b7280' :
    toolKey === 'highlight' ? '#f59e0b' : '#3b82f6';

  return (
    <button
      title={t.label}
      onClick={() => onClick(toolKey)}
      style={{
        width: 36, height: 36, border: 'none', borderRadius: 8,
        background: isActive ? activeColor : 'transparent',
        color: isActive ? '#fff' : '#888',
        cursor: 'pointer', fontSize: 16,
        transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {t.icon}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// ANA BİLEŞEN
// ─────────────────────────────────────────────────────────────
export default function DrawMode({ initialData, onDrawingChange }) {
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  const isDrawing = useRef(false);
  const lastPts   = useRef([]);
  const historyRef   = useRef([]);
  const redoRef      = useRef([]);
  const initialLoaded = useRef(false);

  // Aktif ctx ayarlarını sakla — continueDraw'da tekrar setup çağırmamak için
  const activeCtxSettings = useRef(null);

  const [tool,        setToolState]   = useState('pen');
  const [color,       setColor]       = useState('#ffffff');
  const [strokeSize,  setStrokeSize]  = useState(5);
  const [hlOpacity,   setHlOpacity]   = useState(0.4);
  const [customColor, setCustomColor] = useState('#4da3ff');
  const [canUndo,     setCanUndo]     = useState(false);
  const [canRedo,     setCanRedo]     = useState(false);
  const [cursorPos,   setCursorPos]   = useState({ x: -999, y: -999 });

  // ── Canvas boyutlandırma
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const wrap = wrapRef.current;
      const { width, height } = wrap.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const tmp = document.createElement('canvas');
      tmp.width  = canvas.width;
      tmp.height = canvas.height;
      tmp.getContext('2d').drawImage(canvas, 0, 0);
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(tmp, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // ── initialData gelirse canvas'a yükle (sadece bir kez)
  useEffect(() => {
    if (!initialData || initialLoaded.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.onload = () => {
      canvas.getContext('2d').drawImage(img, 0, 0);
      initialLoaded.current = true;
    };
    img.src = initialData;
  }, [initialData]);

  // ── Çizim bittikten sonra üste ilet
  const notifyChange = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onDrawingChange) return;
    onDrawingChange(canvas.toDataURL('image/png'));
  }, [onDrawingChange]);

  // ── History yardımcıları
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    historyRef.current.push(canvas.toDataURL());
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    redoRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const restoreSnapshot = useCallback((dataUrl) => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const img    = new Image();
    img.onload   = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  }, []);

  const handleUndo = useCallback(() => {
    if (!historyRef.current.length) return;
    redoRef.current.push(canvasRef.current.toDataURL());
    restoreSnapshot(historyRef.current.pop());
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
    setTimeout(notifyChange, 50);
  }, [restoreSnapshot, notifyChange]);

  const handleRedo = useCallback(() => {
    if (!redoRef.current.length) return;
    historyRef.current.push(canvasRef.current.toDataURL());
    restoreSnapshot(redoRef.current.pop());
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);
    setTimeout(notifyChange, 50);
  }, [restoreSnapshot, notifyChange]);

  const handleClear = useCallback(() => {
    saveSnapshot();
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    notifyChange();
  }, [saveSnapshot, notifyChange]);

  const handleExport = useCallback(() => {
    const canvas  = canvasRef.current;
    const offscreen = document.createElement('canvas');
    offscreen.width  = canvas.width;
    offscreen.height = canvas.height;
    const octx = offscreen.getContext('2d');
    octx.fillStyle = '#121212';
    octx.fillRect(0, 0, offscreen.width, offscreen.height);
    octx.drawImage(canvas, 0, 0);
    const link = document.createElement('a');
    link.download = `cizim_${Date.now()}.png`;
    link.href = offscreen.toDataURL('image/png');
    link.click();
  }, []);

  const setTool = useCallback((t) => { setToolState(t); }, []);

  // ── Çizim başlangıcı
  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    saveSnapshot();

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPointerPos(e, canvas);
    lastPts.current = [pos];

    // Setup SADECE burada çağrılır — ctx ayarları aktif çizim boyunca sabit kalır
    TOOLS[tool].setup(ctx, color, strokeSize, hlOpacity);
    activeCtxSettings.current = { tool, color, strokeSize, hlOpacity };

    // Başlangıç noktası
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [tool, color, strokeSize, hlOpacity, saveSnapshot]);

  const continueDraw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPointerPos(e, canvas);
    lastPts.current.push(pos);

    // ctx ayarlarını tekrar setup etme — başlangıçta zaten ayarlandı
    const pts = lastPts.current;
    ctx.beginPath();

    if (pts.length >= 3) {
      const p0 = pts[pts.length - 3];
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];
      const mx1 = (p0.x + p1.x) / 2;
      const my1 = (p0.y + p1.y) / 2;
      const mx2 = (p1.x + p2.x) / 2;
      const my2 = (p1.y + p2.y) / 2;
      ctx.moveTo(mx1, my1);
      ctx.quadraticCurveTo(p1.x, p1.y, mx2, my2);
    } else {
      const prev = pts[pts.length - 2] || pos;
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(pos.x, pos.y);
    }
    ctx.stroke();

    setCursorPos(pos);
  }, []);

  // ── Çizim bitince üste ilet
  const endDraw = useCallback((e) => {
    if (e) e.preventDefault();
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPts.current   = [];
    activeCtxSettings.current = null;

    const ctx = canvasRef.current.getContext('2d');
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    notifyChange();
  }, [notifyChange]);

  // ── Klavye kısayolları
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); handleRedo(); }
      if (e.key === 'p') setTool('pen');
      if (e.key === 'b') setTool('brush');
      if (e.key === 'h') setTool('highlight');
      if (e.key === 'e') setTool('eraser');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo, setTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('touchstart',  startDraw,    { passive: false });
    canvas.addEventListener('touchmove',   continueDraw, { passive: false });
    canvas.addEventListener('touchend',    endDraw,      { passive: false });
    return () => {
      canvas.removeEventListener('touchstart',  startDraw);
      canvas.removeEventListener('touchmove',   continueDraw);
      canvas.removeEventListener('touchend',    endDraw);
    };
  }, [startDraw, continueDraw, endDraw]);

  const cursorSize = tool === 'highlight' ? strokeSize * 5 : tool === 'eraser' ? strokeSize * 2.5 : strokeSize;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#1a1a1a', borderRadius: 12,
      border: '1px solid #333', overflow: 'hidden',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* ── ARAÇ ÇUBUĞU ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', background: '#242424',
        borderBottom: '1px solid #333', flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        {/* Çizim Araçları */}
        <ToolGroup>
          {Object.keys(TOOLS).map(k => (
            <ToolBtn key={k} toolKey={k} currentTool={tool} onClick={setTool} />
          ))}
        </ToolGroup>

        <Divider />

        {/* Renk Paleti */}
        <ToolGroup style={{ padding: '6px 10px', gap: 6 }}>
          {COLORS.map(c => (
            <button
              key={c}
              title={c}
              onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }}
              style={{
                width: 22, height: 22, borderRadius: '50%', border: 'none',
                background: c, cursor: 'pointer', flexShrink: 0,
                outline: color === c && tool !== 'eraser' ? '3px solid #fff' : '2px solid transparent',
                outlineOffset: 2,
                transform: color === c && tool !== 'eraser' ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.15s',
              }}
            />
          ))}
          <input
            type="color"
            value={customColor}
            title="Özel renk seç"
            onChange={e => {
              setCustomColor(e.target.value);
              setColor(e.target.value);
              if (tool === 'eraser') setTool('pen');
            }}
            style={{
              width: 22, height: 22, borderRadius: '50%',
              border: 'none', padding: 0, cursor: 'pointer', background: 'none',
            }}
          />
        </ToolGroup>

        <Divider />

        {/* Kalınlık */}
        <ToolGroup style={{ padding: '6px 12px', gap: 8 }}>
          <span style={{ fontSize: 9, color: '#555' }}>●</span>
          <input
            type="range" min={1} max={40} value={strokeSize}
            onChange={e => setStrokeSize(Number(e.target.value))}
            style={{ width: 80, accentColor: '#3b82f6', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 14, color: '#555' }}>●</span>
          <span style={{ fontSize: 11, color: '#666', minWidth: 28 }}>{strokeSize}px</span>
        </ToolGroup>

        {tool === 'highlight' && (
          <>
            <Divider />
            <ToolGroup style={{ padding: '6px 12px', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#888' }}>Opaklık</span>
              <input
                type="range" min={10} max={80} value={Math.round(hlOpacity * 100)}
                onChange={e => setHlOpacity(Number(e.target.value) / 100)}
                style={{ width: 70, accentColor: '#f59e0b', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 11, color: '#666', minWidth: 28 }}>
                {Math.round(hlOpacity * 100)}%
              </span>
            </ToolGroup>
          </>
        )}

        <Divider />

        {/* Eylemler */}
        <div style={{ display: 'flex', gap: 6 }}>
          <ActionBtn disabled={!canUndo} onClick={handleUndo} color="#3b82f6">↩ Geri</ActionBtn>
          <ActionBtn disabled={!canRedo} onClick={handleRedo} color="#8b5cf6">↪ İleri</ActionBtn>
          <ActionBtn onClick={handleClear} color="#ef4444">🗑 Temizle</ActionBtn>
          <ActionBtn onClick={handleExport} color="#22c55e">⬇ İndir</ActionBtn>
        </div>

        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#555' }}>
          Ctrl+Z · Ctrl+Y · P/B/H/E
        </span>
      </div>

      {/* ── TUVAL ALANI ── */}
      <div
        ref={wrapRef}
        style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          background: '#121212',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          cursor: 'none',
        }}
        onMouseMove={e => {
          const rect = wrapRef.current.getBoundingClientRect();
          setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setCursorPos({ x: -999, y: -999 })}
      >
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={continueDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
        />

        {/* Özel imleç */}
        <div
          style={{
            position: 'absolute',
            left: cursorPos.x,
            top: cursorPos.y,
            width: Math.max(cursorSize, 6),
            height: Math.max(cursorSize, 6),
            borderRadius: tool === 'highlight' ? 2 : '50%',
            transform: 'translate(-50%, -50%)',
            border: tool === 'eraser'
              ? '2px dashed #aaa'
              : `2px solid ${color}`,
            background: tool === 'eraser'
              ? 'transparent'
              : color + '33',
            pointerEvents: 'none',
            transition: 'width 0.08s, height 0.08s',
            zIndex: 10,
          }}
        />

        {/* Alt durum çubuğu */}
        <div style={{
          position: 'absolute', bottom: 16, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.55)',
          color: '#aaa', fontSize: 11, padding: '4px 14px',
          borderRadius: 20, backdropFilter: 'blur(6px)',
          pointerEvents: 'none', letterSpacing: 0.5,
          border: '1px solid #333',
        }}>
          {TOOLS[tool].icon} {TOOLS[tool].label} · {strokeSize}px
          {tool === 'highlight' && ` · Opaklık %${Math.round(hlOpacity * 100)}`}
        </div>
      </div>
    </div>
  );
}

// ─── Küçük yardımcı bileşenler ───
function ToolGroup({ children, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: '#1a1a1a', borderRadius: 10, padding: 4,
      border: '1px solid #2e2e2e', ...style,
    }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 28, background: '#2e2e2e', margin: '0 4px' }} />;
}

function ActionBtn({ children, onClick, color, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '5px 11px', border: 'none', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 12, fontWeight: 600, background: disabled ? '#1e1e1e' : color + '22',
        color: disabled ? '#444' : color,
        border: `1px solid ${disabled ? '#2a2a2a' : color + '44'}`,
        transition: 'all 0.15s', opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = color; e.currentTarget.style.color = '#fff'; }}}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = color + '22'; e.currentTarget.style.color = color; }}}
    >
      {children}
    </button>
  );
}

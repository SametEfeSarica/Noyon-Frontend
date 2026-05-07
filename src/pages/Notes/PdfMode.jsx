import { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// react-pdf worker kurulumu (Vite Uyumlu)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs', // Güncel react-pdf sürümlerinde .mjs uzantısı kullanılır
  import.meta.url,
).toString();

// ─────────────────────────────────────────────────────────────
// SABİTLER
// ─────────────────────────────────────────────────────────────
const PDF_WIDTH = 794; // A4 - 96 dpi karşılığı

const COLORS = [
  '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
];

const TOOLS = {
  pen: {
    label: 'Kalem', icon: '✏️',
    setup: (ctx, color, size) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    },
  },
  highlight: {
    label: 'Fosforlu', icon: '🖊️',
    setup: (ctx, color, size, opacity) => {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 6;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'bevel';
    },
  },
  arrow: {
    label: 'Ok', icon: '➡️',
    // Ok için çizim farklı — bkz drawArrow()
  },
  text: {
    label: 'Metin', icon: '🔤',
  },
  eraser: {
    label: 'Silgi', icon: '⬜',
    setup: (ctx, _c, size) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = size * 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    },
  },
};

const MAX_HISTORY = 30;

// ─────────────────────────────────────────────────────────────
// YARDIMCI FONKSİYONLAR
// ─────────────────────────────────────────────────────────────
function getPointerPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const src  = e.touches ? e.touches[0] : e;
  return { x: src.clientX - rect.left, y: src.clientY - rect.top };
}

function drawArrow(ctx, x1, y1, x2, y2, color, size) {
  const headLen = Math.max(16, size * 4);
  const angle   = Math.atan2(y2 - y1, x2 - x1);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = size;
  ctx.lineCap     = 'round';
  // Gövde
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // Ok ucu
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * Math.cos(angle - Math.PI / 6),
    y2 - headLen * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    x2 - headLen * Math.cos(angle + Math.PI / 6),
    y2 - headLen * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────
// ANA BİLEŞEN
// ─────────────────────────────────────────────────────────────
export default function PdfMode() {
  // PDF state
  const [file,       setFile]       = useState(null);
  const [fileName,   setFileName]   = useState('');
  const [numPages,   setNumPages]   = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfReady,   setPdfReady]   = useState(false);
  const [pageHeight, setPageHeight] = useState(1123); // A4 tahmini

  // Her sayfa için ayrı canvas verisi
  const pageAnnotations = useRef({}); // { [page]: dataUrl }

  // Çizim state
  const [tool,       setTool]      = useState('pen');
  const [color,      setColor]     = useState('#ef4444');
  const [strokeSize, setSize]      = useState(3);
  const [hlOpacity,  setHlOpacity] = useState(0.4);
  const [canUndo,    setCanUndo]   = useState(false);
  const [canRedo,    setCanRedo]   = useState(false);

  // Text annotation state
  const [textMode,   setTextMode]  = useState(false);
  const [textInput,  setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' });

  // Arrow çizimi için geçici
  const arrowStart = useRef(null);
  const arrowTmp   = useRef(null); // overlay canvas

  const canvasRef   = useRef(null);
  const historyRef  = useRef({});  // { [page]: string[] }
  const redoRef     = useRef({});
  const isDrawing   = useRef(false);
  const lastPts     = useRef([]);

  // ─── Sayfa Yükleme & Canvas Ayarı ───────────────────────────
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setPdfReady(true);
  };

  const onPageRenderSuccess = ({ height }) => {
    setPageHeight(height);
    // Bir önceki sayfa çizimini geri yükle
    restorePageAnnotations(pageNumber);
  };

  // Sayfa değişince canvas'ı kaydet / geri yükle
  useEffect(() => {
    if (!pdfReady) return;
    // Yeni sayfaya geçince: önceki sayfanın son halini kaydet
    // (startDraw her çizimde saveSnapshot yaptığı için burada sadece geri yükle)
    restorePageAnnotations(pageNumber);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pdfReady]);

  // ─── Canvas boyutlandırma ─────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Boyut doğruysa resetleme
    if (canvas.width === PDF_WIDTH && canvas.height === pageHeight) return;
    // Sayfanın eski çizimini geçici sakla
    const saved = pageAnnotations.current[pageNumber];
    canvas.width  = PDF_WIDTH;
    canvas.height = pageHeight;
    if (saved) {
      const img = new Image();
      img.onload = () => canvas.getContext('2d').drawImage(img, 0, 0);
      img.src = saved;
    }
  }, [pageHeight, pageNumber]);

  // ─── History Yardımcıları ────────────────────────────────
  function getPageHistory()   { return historyRef.current[pageNumber] ?? (historyRef.current[pageNumber] = []); }
  function getPageRedo()      { return redoRef.current[pageNumber]    ?? (redoRef.current[pageNumber]    = []); }

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hist = getPageHistory();
    hist.push(canvas.toDataURL());
    if (hist.length > MAX_HISTORY) hist.shift();
    redoRef.current[pageNumber] = [];
    setCanUndo(true);
    setCanRedo(false);
    // Güncel çizimi pageAnnotations'a da yaz
    pageAnnotations.current[pageNumber] = canvas.toDataURL();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  const restorePageAnnotations = useCallback((page) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const saved  = pageAnnotations.current[page];
    if (saved) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = saved;
    }
    const hist = historyRef.current[page] ?? [];
    const redo = redoRef.current[page]    ?? [];
    setCanUndo(hist.length > 0);
    setCanRedo(redo.length > 0);
  }, []);

  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hist = getPageHistory();
    const redo = getPageRedo();
    if (!hist.length) return;
    redo.push(canvas.toDataURL());
    const prev = hist.pop();
    const ctx  = canvas.getContext('2d');
    const img  = new Image();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
    img.src    = prev;
    pageAnnotations.current[pageNumber] = prev;
    setCanUndo(hist.length > 0);
    setCanRedo(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  const handleRedo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hist = getPageHistory();
    const redo = getPageRedo();
    if (!redo.length) return;
    hist.push(canvas.toDataURL());
    const next = redo.pop();
    const ctx  = canvas.getContext('2d');
    const img  = new Image();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
    img.src    = next;
    pageAnnotations.current[pageNumber] = next;
    setCanUndo(true);
    setCanRedo(redo.length > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  const handleClearPage = useCallback(() => {
    saveSnapshot();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    pageAnnotations.current[pageNumber] = null;
  }, [saveSnapshot, pageNumber]);

  // ─── PDF + Çizim katmanı indirme ────────────────────────
  const handleExport = useCallback(() => {
    alert('Dışa aktarma için react-pdf ile pdfjs katmanlarını birleştirmeniz gerekir. Bu proje react-pdf-viewer gibi kütüphanelerle kolayca entegre edilebilir.');
  }, []);

  // ─── Çizim Olayları ──────────────────────────────────────
  const startDraw = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPointerPos(e, canvas);

    // Metin modu
    if (tool === 'text') {
      setTextInput({ visible: true, x: pos.x, y: pos.y, value: '' });
      return;
    }
    // Ok modu — sadece başlangıcı kaydet
    if (tool === 'arrow') {
      arrowStart.current = pos;
      saveSnapshot();
      return;
    }

    isDrawing.current = true;
    saveSnapshot();
    lastPts.current   = [pos];

    const ctx = canvas.getContext('2d');
    TOOLS[tool].setup(ctx, color, strokeSize, hlOpacity);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }, [tool, color, strokeSize, hlOpacity, saveSnapshot]);

  const continueDraw = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPointerPos(e, canvas);

    // Ok — sadece önizleme (son restorasyon + ok çiz)
    if (tool === 'arrow' && arrowStart.current) {
      const ctx = canvas.getContext('2d');
      // Önceki snapshot'u geri yükle (iz bırakmasın)
      const hist = getPageHistory();
      if (hist.length) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          drawArrow(ctx, arrowStart.current.x, arrowStart.current.y, pos.x, pos.y, color, strokeSize);
        };
        img.src = hist[hist.length - 1];
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawArrow(ctx, arrowStart.current.x, arrowStart.current.y, pos.x, pos.y, color, strokeSize);
      }
      return;
    }

    if (!isDrawing.current) return;

    const ctx = canvas.getContext('2d');
    lastPts.current.push(pos);
    TOOLS[tool].setup(ctx, color, strokeSize, hlOpacity);
    ctx.beginPath();
    const pts = lastPts.current;
    if (pts.length >= 3) {
      const p0  = pts[pts.length - 3];
      const p1  = pts[pts.length - 2];
      const p2  = pts[pts.length - 1];
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
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }, [tool, color, strokeSize, hlOpacity]);

  const endDraw = useCallback((e) => {
    if (e) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (tool === 'arrow' && arrowStart.current) {
      arrowStart.current = null;
      pageAnnotations.current[pageNumber] = canvas.toDataURL();
    }

    isDrawing.current = false;
    lastPts.current   = [];
    const ctx = canvas.getContext('2d');
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    pageAnnotations.current[pageNumber] = canvas.toDataURL();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, pageNumber]);

  // Metin ekleme
  const commitText = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !textInput.value.trim()) {
      setTextInput(t => ({ ...t, visible: false }));
      return;
    }
    saveSnapshot();
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle   = color;
    ctx.font        = `${strokeSize * 4 + 10}px 'Segoe UI', sans-serif`;
    ctx.fillText(textInput.value, textInput.x, textInput.y);
    setTextInput(t => ({ ...t, visible: false, value: '' }));
    pageAnnotations.current[pageNumber] = canvas.toDataURL();
  }, [textInput, color, strokeSize, saveSnapshot, pageNumber]);

  // ─── Dosya Seçimi ─────────────────────────────────────────
  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
    setPageNumber(1);
    setPdfReady(false);
    pageAnnotations.current = {};
    historyRef.current      = {};
    redoRef.current         = {};
  };

  // ─── RENDER ──────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#1a1a1a', borderRadius: 12, border: '1px solid #333',
      overflow: 'hidden', fontFamily: "'Segoe UI', sans-serif",
    }}>

      {/* ── ARAÇ ÇUBUĞU ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', background: '#242424',
        borderBottom: '1px solid #333', flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        {/* PDF Yükle */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
          background: '#1d4ed8', color: '#fff',
          fontSize: 13, fontWeight: 600,
          border: '1px solid #2563eb',
          transition: 'background 0.15s',
        }}>
          📄 PDF Yükle
          <input
            type="file" accept="application/pdf"
            onChange={onFileChange}
            style={{ display: 'none' }}
          />
        </label>

        {/* Dosya adı */}
        {fileName && (
          <span style={{
            fontSize: 12, color: '#888', maxWidth: 180,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }} title={fileName}>
            {fileName}
          </span>
        )}

        {/* Sayfa Kontrolü */}
        {pdfReady && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#1a1a1a', border: '1px solid #333',
            borderRadius: 8, padding: '4px 10px',
          }}>
            <NavBtn
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(p => p - 1)}
            >‹</NavBtn>
            <span style={{ fontSize: 12, color: '#ccc', minWidth: 60, textAlign: 'center' }}>
              {pageNumber} / {numPages}
            </span>
            <NavBtn
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(p => p + 1)}
            >›</NavBtn>
          </div>
        )}

        <div style={{ width: 1, height: 28, background: '#333', margin: '0 4px' }} />

        {/* Araçlar */}
        <div style={{
          display: 'flex', gap: 4, background: '#1a1a1a',
          border: '1px solid #2e2e2e', borderRadius: 10, padding: 4,
        }}>
          {Object.entries(TOOLS).map(([key, t]) => {
            const active = tool === key;
            const bg = active
              ? key === 'eraser' ? '#6b7280'
              : key === 'highlight' ? '#f59e0b'
              : '#3b82f6'
              : 'transparent';
            return (
              <button
                key={key}
                title={t.label}
                onClick={() => setTool(key)}
                style={{
                  width: 34, height: 34, border: 'none', borderRadius: 7,
                  background: bg, color: active ? '#fff' : '#888',
                  cursor: 'pointer', fontSize: 16,
                  transition: 'all 0.15s',
                }}
              >{t.icon}</button>
            );
          })}
        </div>

        <div style={{ width: 1, height: 28, background: '#333', margin: '0 4px' }} />

        {/* Renkler */}
        <div style={{
          display: 'flex', gap: 6, alignItems: 'center',
          background: '#1a1a1a', border: '1px solid #2e2e2e',
          borderRadius: 10, padding: '6px 10px',
        }}>
          {COLORS.map(c => (
            <button
              key={c}
              title={c}
              onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }}
              style={{
                width: 20, height: 20, borderRadius: '50%',
                border: 'none', background: c, cursor: 'pointer',
                outline: color === c && tool !== 'eraser' ? '3px solid #fff' : '2px solid transparent',
                outlineOffset: 2,
                transform: color === c && tool !== 'eraser' ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.15s',
              }}
            />
          ))}
        </div>

        {/* Kalınlık */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#1a1a1a', border: '1px solid #2e2e2e',
          borderRadius: 10, padding: '6px 12px',
        }}>
          <input
            type="range" min={1} max={20} value={strokeSize}
            onChange={e => setSize(Number(e.target.value))}
            style={{ width: 70, accentColor: '#3b82f6', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 11, color: '#666', minWidth: 24 }}>{strokeSize}px</span>
        </div>

        {tool === 'highlight' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#1a1a1a', border: '1px solid #2e2e2e',
            borderRadius: 10, padding: '6px 12px',
          }}>
            <span style={{ fontSize: 11, color: '#888' }}>Opaklık</span>
            <input
              type="range" min={10} max={80} value={Math.round(hlOpacity * 100)}
              onChange={e => setHlOpacity(Number(e.target.value) / 100)}
              style={{ width: 60, accentColor: '#f59e0b', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 11, color: '#666' }}>{Math.round(hlOpacity * 100)}%</span>
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <PdfActionBtn disabled={!canUndo} onClick={handleUndo} color="#3b82f6">↩ Geri</PdfActionBtn>
          <PdfActionBtn disabled={!canRedo} onClick={handleRedo} color="#8b5cf6">↪ İleri</PdfActionBtn>
          <PdfActionBtn onClick={handleClearPage} color="#ef4444">🗑 Sayfayı Temizle</PdfActionBtn>
        </div>
      </div>

      {/* ── PDF + CANVAS ALANI ── */}
      <div style={{
        flex: 1, overflowY: 'auto', background: '#111',
        display: 'flex', justifyContent: 'center',
        padding: '32px 0',
      }}>
        {!file ? (
          /* Boş ekran */
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: '#555', userSelect: 'none',
          }}>
            <div style={{ fontSize: 72, marginBottom: 16, opacity: 0.25 }}>📄</div>
            <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8, color: '#666' }}>
              PDF Yüklenmedi
            </h2>
            <p style={{ fontSize: 13, color: '#444', textAlign: 'center', maxWidth: 280 }}>
              Yukarıdaki "PDF Yükle" butonuna tıklayarak bir dosya seçin ve üzerine çizim yapmaya başlayın.
            </p>
          </div>
        ) : (
          /* PDF + Overlay */
          <div style={{
            position: 'relative',
            width: PDF_WIDTH,
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            {/* 1. KATMAN — PDF */}
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div style={{
                  width: PDF_WIDTH, height: 500, background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#999', fontSize: 14,
                }}>
                  PDF yükleniyor…
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                width={PDF_WIDTH}
                onRenderSuccess={onPageRenderSuccess}
                renderTextLayer={true}
                renderAnnotationLayer={false}
              />
            </Document>

            {/* 2. KATMAN — Çizim Canvas'ı (şeffaf) */}
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute', top: 0, left: 0,
                touchAction: 'none',
                cursor: tool === 'text' ? 'text' : 'crosshair',
                zIndex: 10,
              }}
              width={PDF_WIDTH}
              height={pageHeight}
              onMouseDown={startDraw}
              onMouseMove={continueDraw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={continueDraw}
              onTouchEnd={endDraw}
            />

            {/* Metin girdi kutusu */}
            {textInput.visible && (
              <input
                autoFocus
                value={textInput.value}
                onChange={e => setTextInput(t => ({ ...t, value: e.target.value }))}
                onBlur={commitText}
                onKeyDown={e => { if (e.key === 'Enter') commitText(); if (e.key === 'Escape') setTextInput(t => ({ ...t, visible: false })); }}
                style={{
                  position: 'absolute',
                  left: textInput.x, top: textInput.y - 24,
                  zIndex: 20, background: 'rgba(0,0,0,0.75)',
                  border: `1px solid ${color}`,
                  color, borderRadius: 4, padding: '2px 8px',
                  fontSize: strokeSize * 4 + 10,
                  outline: 'none', minWidth: 80,
                }}
                placeholder="Metin gir…"
              />
            )}

            {/* Aktif araç etiket (sol alt) */}
            <div style={{
              position: 'absolute', bottom: 12, left: 12, zIndex: 15,
              background: 'rgba(0,0,0,0.55)', color: '#aaa',
              fontSize: 11, padding: '3px 10px', borderRadius: 20,
              backdropFilter: 'blur(4px)', border: '1px solid #333',
              pointerEvents: 'none',
            }}>
              {TOOLS[tool].icon} {TOOLS[tool].label} · {strokeSize}px
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Küçük yardımcı bileşenler ───────────────────────────────
function NavBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        width: 24, height: 24, border: 'none', borderRadius: 6,
        background: 'transparent', color: disabled ? '#444' : '#aaa',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 18, lineHeight: 1, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        transition: 'color 0.15s',
      }}
    >{children}</button>
  );
}

function PdfActionBtn({ children, onClick, color, disabled }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        padding: '5px 10px', border: 'none', borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 12, fontWeight: 600,
        background: disabled ? '#1e1e1e' : color + '22',
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
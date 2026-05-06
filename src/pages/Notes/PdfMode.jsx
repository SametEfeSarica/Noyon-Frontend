import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Stage, Layer, Line } from 'react-konva';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Çok Kritik: react-pdf'in çalışması için "worker" ayarı (Tarayıcıyı çökertmemek için)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PdfMode() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  
  // Çizim State'leri
  const [lines, setLines] = useState([]);
  const [tool, setTool] = useState('pen'); // 'pen' veya 'highlighter' veya 'eraser'
  const [color, setColor] = useState('#ff4d4d');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const isDrawing = useRef(false);

  // PDF Yükleme
  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  // --- ÇİZİM FONKSİYONLARI ---
  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    // Kalem türüne göre şeffaflık (Fosforlu kalem efekti için opacity ekliyoruz)
    setLines([...lines, { tool, color, strokeWidth, points: [pos.x, pos.y], page: pageNumber }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const colors = ['#ff4d4d', '#4da3ff', '#1db954', '#ffb84d', '#ffeb3b'];

  return (
    <div className="flex flex-col h-full bg-[#191919] rounded-lg border border-[#3f3f3f] overflow-hidden">
      
      {/* Üst Araç Çubuğu */}
      <div className="flex items-center justify-between bg-[#202020] p-4 border-b border-[#3f3f3f] flex-wrap gap-4">
        
        {/* Dosya Yükleme ve Sayfa Kontrolü */}
        <div className="flex items-center gap-4">
          <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-bold text-sm transition-colors cursor-pointer flex items-center gap-2">
            <i className="fa-solid fa-file-arrow-up"></i> PDF Yükle
            <input type="file" accept="application/pdf" onChange={onFileChange} className="hidden" />
          </label>

          {file && (
            <div className="flex items-center gap-3 bg-[#121212] px-3 py-1.5 rounded-md border border-[#333]">
              <button 
                disabled={pageNumber <= 1} 
                onClick={() => setPageNumber(p => p - 1)}
                className="text-[#888] hover:text-white disabled:opacity-30"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <span className="text-sm font-medium text-[#D4D4D4]">
                {pageNumber} / {numPages || '-'}
              </span>
              <button 
                disabled={pageNumber >= numPages} 
                onClick={() => setPageNumber(p => p + 1)}
                className="text-[#888] hover:text-white disabled:opacity-30"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>

        {/* Kalem, Fosforlu Kalem, Silgi ve Renkler */}
        <div className="flex items-center gap-3 bg-[#121212] px-3 py-1.5 rounded-md border border-[#333]">
          <button onClick={() => setTool('pen')} className={`p-1.5 rounded-md ${tool === 'pen' ? 'bg-[#3f3f3f] text-white' : 'text-[#888]'}`} title="Tükenmez Kalem"><i className="fa-solid fa-pen"></i></button>
          <button onClick={() => setTool('highlighter')} className={`p-1.5 rounded-md ${tool === 'highlighter' ? 'bg-[#3f3f3f] text-white' : 'text-[#888]'}`} title="Fosforlu Kalem"><i className="fa-solid fa-highlighter"></i></button>
          <button onClick={() => setTool('eraser')} className={`p-1.5 rounded-md ${tool === 'eraser' ? 'bg-[#3f3f3f] text-white' : 'text-[#888]'}`} title="Silgi"><i className="fa-solid fa-eraser"></i></button>
          
          <div className="w-px h-5 bg-[#3f3f3f] mx-1"></div>
          
          {colors.map(c => (
            <button 
              key={c} 
              onClick={() => { setColor(c); if(tool==='eraser') setTool('pen'); }}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${color === c && tool !== 'eraser' ? 'scale-125 border-white' : 'border-transparent hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* PDF ve Çizim Alanı (Üst Üste Bindirme Tekniği) */}
      <div className="flex-1 overflow-y-auto bg-[#121212] flex justify-center p-8 custom-scrollbar">
        {!file ? (
          <div className="flex flex-col items-center justify-center text-[#555] h-full">
            <i className="fa-solid fa-file-pdf text-7xl mb-4 opacity-30"></i>
            <h2 className="text-xl font-medium mb-2">Henüz Bir PDF Yüklenmedi</h2>
            <p className="text-sm">Yukarıdaki butondan bir PDF seçerek üzerine çizim yapmaya başlayın.</p>
          </div>
        ) : (
          <div className="relative shadow-2xl bg-white" style={{ width: '800px' }}>
            {/* 1. KATMAN: PDF'in Kendisi */}
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="absolute top-0 left-0">
              <Page pageNumber={pageNumber} width={800} renderTextLayer={false} renderAnnotationLayer={false} />
            </Document>

            {/* 2. KATMAN: Çizim Tahtası (Şeffaf) */}
            <div className="absolute top-0 left-0 z-10 cursor-crosshair">
              <Stage
                width={800}
                height={1131} // A4 Formatı tahmini yüksekliği (800 x 1.414)
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
              >
                <Layer>
                  {lines.filter(line => line.page === pageNumber).map((line, i) => (
                    <Line
                      key={i}
                      points={line.points}
                      stroke={line.tool === 'eraser' ? '#ffffff' : line.color}
                      strokeWidth={line.tool === 'highlighter' ? 20 : line.strokeWidth}
                      opacity={line.tool === 'highlighter' ? 0.4 : 1} // Fosforlu kalem için şeffaflık
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
                    />
                  ))}
                </Layer>
              </Stage>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
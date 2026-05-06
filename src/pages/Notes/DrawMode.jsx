import { useState, useRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';

export default function DrawMode() {
  const [lines, setLines] = useState([]);
  const [tool, setTool] = useState('pen'); // 'pen' veya 'eraser'
  const [color, setColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const isDrawing = useRef(false);

  // Fareye / Ekrana dokunulduğunda
  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, color, strokeWidth, points: [pos.x, pos.y] }]);
  };

  // Çizim yaparken (Fare hareket ettiğinde)
  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    
    // Yeni noktaları mevcut çizgiye ekle
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    
    // Çizgi dizisini güncelle
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  // Çizim bittiğinde (Fare bırakıldığında)
  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleClear = () => {
    setLines([]);
  };

  // Renk Paleti Seçenekleri
  const colors = ['#ffffff', '#ff4d4d', '#4da3ff', '#1db954', '#ffb84d', '#ff66b2'];

  return (
    <div className="flex flex-col h-full bg-[#191919] rounded-lg border border-[#3f3f3f] overflow-hidden">
      
      {/* Çizim Araç Çubuğu */}
      <div className="flex items-center justify-between bg-[#202020] p-4 border-b border-[#3f3f3f]">
        
        {/* Kalem ve Silgi Seçimi */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setTool('pen')} 
            className={`p-2 rounded-md transition-colors ${tool === 'pen' ? 'bg-[#3f3f3f] text-white' : 'text-[#888] hover:text-[#D4D4D4]'}`}
          >
            <i className="fa-solid fa-pen"></i> Kalem
          </button>
          <button 
            onClick={() => setTool('eraser')} 
            className={`p-2 rounded-md transition-colors ${tool === 'eraser' ? 'bg-[#3f3f3f] text-white' : 'text-[#888] hover:text-[#D4D4D4]'}`}
          >
            <i className="fa-solid fa-eraser"></i> Silgi
          </button>
        </div>

        {/* Renk Paleti */}
        <div className="flex items-center gap-3">
          {colors.map(c => (
            <button 
              key={c} 
              onClick={() => { setColor(c); setTool('pen'); }}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c && tool === 'pen' ? 'scale-125 border-white' : 'border-transparent hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Kalınlık ve Temizle */}
        <div className="flex items-center gap-4">
          <input 
            type="range" 
            min="1" max="20" 
            value={strokeWidth} 
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            className="w-24 cursor-pointer accent-[#4da3ff]"
          />
          <button onClick={handleClear} className="text-[#ff4d4d] hover:text-white text-sm font-bold ml-4 transition-colors">
            Temizle
          </button>
        </div>
      </div>

      {/* Tuval (Canvas) Alanı */}
      <div className="flex-1 cursor-crosshair bg-[#121212]">
        <Stage
          width={1000} // Şimdilik sabit, gerekirse dinamik yapılabilir
          height={600}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.tool === 'eraser' ? '#121212' : line.color}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
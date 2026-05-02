import { useState, useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';
import DrawMode from './DrawMode';
import PdfMode from './PdfMode';

export default function SamsungEditor({ note, onClose, onSave }) {
  const editor = useRef(null);
  const [activeMode, setActiveMode] = useState('text'); // text, draw, pdf
  const [content, setContent] = useState(note?.content || '');
  const [title, setTitle] = useState(note?.title || '');

  // Jodit (Yeni Editör) Ayarları - Özel Koyu Tema ve Devasa Araç Çubuğu
  const config = useMemo(() => ({
    readonly: false,
    theme: 'dark',
    height: 600,
    placeholder: 'Notunuzu buraya yazın veya resim ekleyin...',
    toolbarSticky: false,
    style: {
      background: '#191919',
      color: '#ffffff',
      border: 'none'
    },
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'table', 'link', '|',
      'align', 'ul', 'ol', '|',
      'undo', 'redo', 'eraser', 'fullsize'
    ]
  }), []);

  return (
    <div className="fixed inset-0 bg-[#121212] z-50 flex flex-col font-sans">
      
      {/* Üst Araç Çubuğu (Samsung Notes Tarzı) */}
      <div className="h-16 bg-[#1e1e1e] border-b border-[#2f2f2f] flex items-center justify-between px-6 shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-[#888] hover:text-white transition-colors">
            <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Başlıksız Not" 
            className="bg-transparent text-white text-2xl font-bold outline-none placeholder-[#555] w-96"
          />
        </div>

        {/* Mod Değiştiriciler (Metin, Kalem, PDF) */}
        <div className="flex bg-[#252525] p-1 rounded-lg border border-[#3f3f3f]">
          <button 
            onClick={() => setActiveMode('text')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeMode === 'text' ? 'bg-[#3f3f3f] text-white shadow' : 'text-[#888] hover:text-[#D4D4D4]'}`}
          >
            <i className="fa-solid fa-keyboard mr-2"></i> Klavye
          </button>
          <button 
            onClick={() => setActiveMode('draw')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeMode === 'draw' ? 'bg-[#3f3f3f] text-white shadow' : 'text-[#888] hover:text-[#D4D4D4]'}`}
          >
            <i className="fa-solid fa-pen mr-2"></i> Çizim
          </button>
          <button 
            onClick={() => setActiveMode('pdf')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeMode === 'pdf' ? 'bg-[#3f3f3f] text-white shadow' : 'text-[#888] hover:text-[#D4D4D4]'}`}
          >
            <i className="fa-solid fa-file-pdf mr-2"></i> PDF Oku/Çiz
          </button>
        </div>

        <button onClick={() => onSave({title, content})} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold text-sm transition-colors">
          Kaydet
        </button>
      </div>

      {/* Çalışma Alanı */}
      <div className="flex-1 overflow-y-auto bg-[#191919] p-8 flex justify-center custom-scrollbar">
        <div className="w-full max-w-5xl bg-[#191919] min-h-screen rounded-sm shadow-2xl overflow-hidden relative border border-[#3f3f3f]">
          
          {/* 1. MOD: Zengin Metin (Jodit) */}
          {activeMode === 'text' && (
            <div className="h-full w-full custom-jodit-wrapper">
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onBlur={newContent => setContent(newContent)}
                onChange={() => {}}
              />
            </div>
          )}

          {/* 2. MOD: Serbest Çizim */}
          {activeMode === 'draw' && (
            <div className="h-full bg-[#121212]">
              <DrawMode />
            </div>
          )}

          {/* 3. MOD: PDF Üzerine Çizim */}
          {activeMode === 'pdf' && (
            <div className="h-full bg-[#121212]">
              <PdfMode />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
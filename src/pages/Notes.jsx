import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, MoreVertical, ChevronLeft } from 'lucide-react';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '', color: '#FFFFFF' });

  // Notları yerel depolamadan yükle
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('noyon_notes')) || [];
    setNotes(savedNotes);
  }, []);

  // Notlar her değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem('noyon_notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const noteToAdd = {
        ...newNote,
        id: Date.now(),
        date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
      };
      setNotes([noteToAdd, ...notes]);
      setNewNote({ title: '', content: '', color: '#FFFFFF' });
      setIsAdding(false);
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Üst Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Notlar</h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Ara..."
                className="pl-10 pr-4 py-2 bg-white rounded-full border-none shadow-sm focus:ring-2 focus:ring-yellow-500 outline-none w-40 md:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full shadow-lg transition-transform active:scale-95"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* Not Ekleme Modalı (Samsung Style) */}
        {isAdding && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <button onClick={() => setIsAdding(false)} className="text-gray-500"><ChevronLeft size={24} /></button>
                <button 
                  onClick={handleAddNote} 
                  className="text-yellow-600 font-bold text-lg"
                >
                  Kaydet
                </button>
              </div>
              <div className="p-6">
                <input 
                  type="text"
                  placeholder="Başlık"
                  className="w-full text-2xl font-bold mb-4 outline-none placeholder:text-gray-300"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                />
                <textarea 
                  placeholder="Not yazmaya başlayın..."
                  className="w-full h-64 text-lg outline-none resize-none placeholder:text-gray-300"
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {/* Not Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredNotes.map(note => (
            <div 
              key={note.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-yellow-200 transition-all cursor-pointer group relative h-48 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-gray-800 line-clamp-2 mb-2">{note.title || 'Başlıksız Not'}</h3>
                <p className="text-sm text-gray-500 line-clamp-4 leading-snug">{note.content}</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{note.date}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">Henüz not eklenmemiş. Sağ üstten hemen başla!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
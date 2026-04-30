import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: '#fff4d3' });

  // Notları localStorage'dan çek (Sayfa yenilense de gitmez)
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('noyon-notes')) || [];
    setNotes(savedNotes);
  }, []);

  // Notları kaydet
  useEffect(() => {
    localStorage.setItem('noyon-notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      setNotes([{ ...newNote, id: Date.now() }, ...notes]);
      setNewNote({ title: '', content: '', color: '#fff4d3' });
      setIsAdding(false);
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Notlarım</h1>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-all"
          >
            <Plus size={20} /> Yeni Not Ekle
          </button>
        </div>

        {/* Not Ekleme Alanı */}
        {isAdding && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-md border-t-4 border-yellow-400">
            <input
              type="text"
              placeholder="Not Başlığı..."
              className="w-full text-xl font-semibold mb-3 outline-none"
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
            />
            <textarea
              placeholder="Notunuzu buraya yazın..."
              className="w-full h-32 text-gray-600 outline-none resize-none"
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setIsAdding(false)} className="text-gray-500 px-4 py-2">İptal</button>
              <button onClick={handleAddNote} className="bg-yellow-500 text-white px-6 py-2 rounded-lg">Kaydet</button>
            </div>
          </div>
        )}

        {/* Not Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div 
              key={note.id} 
              style={{ backgroundColor: note.color }}
              className="p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative border border-gray-100"
            >
              <button 
                onClick={() => deleteNote(note.id)}
                className="absolute top-3 right-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
              <h3 className="text-lg font-bold mb-2 text-gray-800">{note.title}</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{note.content}</p>
              <div className="mt-4 text-xs text-gray-400">
                {new Date(note.id).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notes;
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Library() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', status: 'ELIMDE' });
  const userId = localStorage.getItem('userId') || 1;

  // 📚 Kitapları Getir (Ensar'ın API'si)
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/library_items/user/${userId}`);
      setBooks(response.data);
    } catch (err) {
      console.error("Kitaplar yüklenemedi");
      // Test verisi
      setBooks([
        { id: 1, title: 'Dune', author: 'Frank Herbert', status: 'ELIMDE' },
        { id: 2, title: '1984', author: 'George Orwell', status: 'ALINACAK' }
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, []);

  // ➕ Kitap Ekle
  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/library_items/add/${userId}`, newBook);
      setNewBook({ title: '', author: '', status: 'ELIMDE' });
      fetchBooks();
    } catch (err) { alert("Kitap eklenemedi"); }
  };

  // 🗑️ Kitap Sil
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/library_items/delete/${id}`);
      fetchBooks();
    } catch (err) { alert("Silme başarısız"); }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#191919] p-8 lg:p-12 text-[#D4D4D4]">
      {/* ÜST FORM: KİTAP EKLEME */}
      <div className="mb-12 border-b border-[#2f2f2f] pb-8">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">📚 Kütüphanem</h1>
        <form onSubmit={handleAddBook} className="flex flex-wrap gap-4 bg-[#202020] p-6 rounded-lg border border-[#2f2f2f]">
          <input 
            type="text" placeholder="Kitap Adı" 
            className="flex-1 bg-[#191919] border border-[#3f3f3f] rounded-md px-4 py-2 focus:border-blue-500 outline-none"
            value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})}
          />
          <input 
            type="text" placeholder="Yazar" 
            className="flex-1 bg-[#191919] border border-[#3f3f3f] rounded-md px-4 py-2 focus:border-blue-500 outline-none"
            value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})}
          />
          <select 
            className="bg-[#191919] border border-[#3f3f3f] rounded-md px-4 py-2 outline-none"
            value={newBook.status} onChange={e => setNewBook({...newBook, status: e.target.value})}
          >
            <option value="ELIMDE">Elimde</option>
            <option value="ALINACAK">Alınacak</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-bold transition-all">+ Ekle</button>
        </form>
      </div>

      {/* RAFLAR (GRID) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {books.map(book => (
          <div key={book.id} className="group relative bg-[#202020] aspect-[2/3] rounded-md border-l-4 border-blue-500 shadow-lg hover:translate-y-[-5px] transition-all cursor-pointer flex flex-col justify-between p-4 border border-[#2f2f2f]">
            <div>
              <h4 className="font-bold text-white leading-tight group-hover:text-blue-400">{book.title}</h4>
              <p className="text-xs text-[#737373] mt-2 italic">{book.author}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] px-2 py-0.5 rounded ${book.status === 'ELIMDE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                {book.status}
              </span>
              <button onClick={() => handleDelete(book.id)} className="opacity-0 group-hover:opacity-100 text-red-400 text-xs">Sil</button>
            </div>
            {/* Kitap Sırtı Efekti */}
            <div className="absolute inset-y-0 left-0 w-[1px] bg-white/10"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
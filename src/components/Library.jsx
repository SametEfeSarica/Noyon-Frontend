import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Library() {
  const [books, setBooks] = useState([]);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');

  // 1. KİTAPLARI GETİR
  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/library_items/user/1');
      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Kitaplar çekilemedi:", error);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  // 2. KİTAP EKLE
  const handleAddBook = async () => {
    if (!newBookTitle.trim() || !newBookAuthor.trim()) {
      alert("Lütfen kitap adı ve yazarını eksiksiz girin!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/library_items/add', {
        title: newBookTitle,
        author: newBookAuthor,
        user: { id: 1 }
      });
      
      setBooks([...books, response.data]);
      setNewBookTitle('');
      setNewBookAuthor('');
    } catch (error) {
      alert("Hata: Kitap eklenemedi.");
    }
  };

  // 3. YENİ ÖZELLİK: KİTAP SİLME OPERASYONU
  const handleDeleteBook = async (id) => {
    // Yanlışlıkla basmalara karşı güvenlik sorusu
    const isConfirmed = window.confirm("Bu kitabı kütüphaneden silmek istediğine emin misin Şef?");
    if (!isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8080/api/library_items/delete/${id}`);
      // Başarılı olursa, silinen kitabı ekrandan (state'ten) anında kaldır
      setBooks(books.filter((book) => book.id !== id));
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Kitap silinirken bir hata oluştu!");
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px' }}>
      
      {/* BAŞLIK KISMI - Gece Mavisi ve Altın Sarısı */}
      <h2 style={{ color: '#1a1a2e', borderBottom: '3px solid #f9a826', paddingBottom: '10px' }}>
        NOYON KÜTÜPHANESİ
      </h2>
      
      {/* EKLEME PANELİ */}
      <div style={{ 
        display: 'flex', gap: '15px', marginBottom: '30px', marginTop: '20px', 
        backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <input 
          value={newBookTitle} 
          onChange={(e) => setNewBookTitle(e.target.value)} 
          placeholder="Kitap Adı..." 
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }} 
        />
        <input 
          value={newBookAuthor} 
          onChange={(e) => setNewBookAuthor(e.target.value)} 
          placeholder="Yazar..." 
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }} 
        />
        <button 
          onClick={handleAddBook} 
          style={{ 
            padding: '10px 25px', backgroundColor: '#1a1a2e', color: '#f9a826', 
            fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer',
            transition: '0.3s'
          }}
        >
          EKLE
        </button>
      </div>

      {/* KİTAP LİSTESİ - Kart Tasarımı */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {books?.map((book) => (
          <div key={book.id} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '15px 20px', backgroundColor: '#ffffff', borderLeft: '5px solid #f9a826',
            borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div>
              <strong style={{ fontSize: '18px', color: '#1a1a2e', display: 'block' }}>{book.title}</strong>
              <span style={{ color: '#666', fontSize: '14px' }}>{book.author}</span>
            </div>
            
            <button 
              onClick={() => handleDeleteBook(book.id)}
              style={{
                backgroundColor: '#dc3545', color: 'white', border: 'none',
                padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              Sil
            </button>
          </div>
        ))}

        {/* LİSTE BOŞSA */}
        {books.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888', fontStyle: 'italic' }}>
            Kütüphaneniz şu an boş. Hemen yeni bir kitap ekleyin!
          </div>
        )}
      </div>

    </div>
  );
}
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Library() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState('');

  // Sayfa yüklendiğinde kitapları çeken fonksiyon
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/api/library/books');
        setBooks(response.data); // Dönen diziyi state'e aktarıyoruz
      } catch (error) {
        console.error("Kitaplar çekilirken bir hata oluştu:", error);
      }
    };

    fetchBooks();
  }, []); // Boş bağımlılık dizisi: Sadece ilk render'da çalışır

  // Yeni kitap ekleme fonksiyonu
  const handleAddBook = async () => {
    // Boş veri gönderimini engelle
    if (!newBook.trim()) return; 

    try {
      const response = await axios.post('/api/library/books', {
        title: newBook
      });
      
      // Başarılı olursa dönen yeni kitabı mevcut listeye ekle
      setBooks([...books, response.data]); 
      
      // Input'u temizle
      setNewBook(''); 
    } catch (error) {
      console.error("Kitap eklenirken hata oluştu:", error);
    }
  };

  return (
    <div>
      <h2>Noyon Kütüphanesi</h2>
      
      <div>
        <input 
          type="text" 
          value={newBook}
          onChange={(e) => setNewBook(e.target.value)}
          placeholder="Yeni kitap adı..." 
        />
        <button onClick={handleAddBook}>Kitap Ekle</button>
      </div>

      <ul>
        {books.map((book, index) => (
           // Backend'den id geliyorsa key olarak id kullanmak daha güvenlidir
          <li key={book.id || index}>
            {book.title} 
          </li>
        ))}
      </ul>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';

// --- NATİF SVG İKONLAR (Dışa bağımlılığı bitiren sihir) ---
const Icons = {
  BookOpen: () => <svg viewBox="0 0 512 512" fill="currentColor" className="w-5 h-5"><path d="M256 160c0-17.7-14.3-32-32-32H32C14.3 128 0 142.3 0 160v224c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32V160zm256 0c0-17.7-14.3-32-32-32H288c-17.7 0-32 14.3-32 32v224c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32V160z"/></svg>,
  Heart: ({ solid }) => <svg viewBox="0 0 512 512" fill="currentColor" className="w-3.5 h-3.5"><path d={solid ? "M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" : "M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-3.2 3.6-7.8 5.7-12.7 5.7s-9.5-2.1-12.7-5.7z"}/></svg>,
  Star: ({ solid }) => <svg viewBox="0 0 576 512" fill="currentColor" className="w-4 h-4"><path d={solid ? "M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" : "M288.1 0c12.3 0 23.5 7 28.8 18l64.3 132.3 143.6 21.2c12 1.8 22 10.2 25.7 21.7s.7 24.2-7.9 32.7L438.5 329l24.6 145.7c2 12-3 24.2-12.9 31.3s-23 8-33.8 2.3L288.1 439.8 159.8 508.3c-10.8 5.7-23.9 4.9-33.8-2.3s-14.9-19.3-12.9-31.3L137.8 329 33.6 225.9c-8.6-8.5-11.7-21.2-7.9-32.7s13.7-19.9 25.7-21.7L195 150.3 259.3 18C264.6 7 275.8 0 288.1 0zm0 69.1l-50.6 104c-3.6 7.4-10.6 12.5-18.9 13.7l-112.6 16.6 81.5 81.1c6 6 8.7 14.6 7.3 22.8L175.6 422l100.8-53.9c7.5-4 16.2-4 23.7 0l100.8 53.9-19.2-114.7c-1.4-8.2 1.3-16.8 7.3-22.8l81.5-81.1-112.6-16.6c-8.3-1.2-15.3-6.3-18.9-13.7L288.1 69.1z"}/></svg>,
  Search: () => <svg viewBox="0 0 512 512" fill="currentColor" className="w-3.5 h-3.5"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>,
  Plus: () => <svg viewBox="0 0 448 512" fill="currentColor" className="w-3.5 h-3.5"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>,
  Folder: () => <svg viewBox="0 0 512 512" fill="currentColor" className="w-3.5 h-3.5"><path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z"/></svg>,
  Trash: () => <svg viewBox="0 0 448 512" fill="currentColor" className="w-3.5 h-3.5"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>,
  XMark: () => <svg viewBox="0 0 384 512" fill="currentColor" className="w-4 h-4"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>,
};

export default function Library() {
  // --- STATE YÖNETİMİ ---
  const [books, setBooks] = useState([
    { id: 1, title: 'Clean Code', author: 'Robert C. Martin', genre: 'Eğitim', status: 'Okudum', rating: 5, isFavorite: true, folder: 'Yazılım', coverImage: null, rentDate: '' }
  ]);
  
  // Klasörler artık obje yapısında (Favori özelliği için)
  const [folders, setFolders] = useState([
    { id: 'f1', name: 'Roman', isFavorite: false },
    { id: 'f2', name: 'Yazılım', isFavorite: true },
    { id: 'f3', name: 'Tarih', isFavorite: false }
  ]);

  const [activeFolder, setActiveFolder] = useState('Tüm Kitaplar');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Modal ve Sağ Tık Menüleri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  
  const [bookContextMenu, setBookContextMenu] = useState(null);
  const [folderContextMenu, setFolderContextMenu] = useState(null);
  const coverInputRef = useRef(null);

  // Dışarı tıklanınca menüleri kapat
  useEffect(() => {
    const handleClick = () => { setBookContextMenu(null); setFolderContextMenu(null); setIsAddingFolder(false); };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // --- KLASÖR İŞLEMLERİ ---
  const handleAddFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setFolders([...folders, { id: `f_${Date.now()}`, name: newFolderName, isFavorite: false }]);
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  const handleFolderContextMenu = (e, folder) => {
    e.preventDefault();
    e.stopPropagation();
    setFolderContextMenu({ x: e.pageX, y: e.pageY, folder });
    setBookContextMenu(null);
  };

  const toggleFolderFavorite = (folderId) => {
    setFolders(folders.map(f => f.id === folderId ? { ...f, isFavorite: !f.isFavorite } : f));
    setFolderContextMenu(null);
  };

  const deleteFolder = (folderId) => {
    if(window.confirm("Bu klasörü silmek istediğine emin misin? İçindeki kitaplar 'Tüm Kitaplar' alanına taşınacak.")) {
      const folderToDelete = folders.find(f => f.id === folderId);
      // Kitapları boşa çıkar
      setBooks(books.map(b => b.folder === folderToDelete.name ? { ...b, folder: 'Tüm Kitaplar' } : b));
      // Klasörü sil
      setFolders(folders.filter(f => f.id !== folderId));
      if (activeFolder === folderToDelete.name) setActiveFolder('Tüm Kitaplar');
    }
    setFolderContextMenu(null);
  };

  // --- KİTAP İŞLEMLERİ ---
  const openModal = (book = null) => {
    if (book) {
      setCurrentBook({ ...book });
    } else {
      setCurrentBook({ id: 'new', title: '', author: '', genre: '', folder: 'Tüm Kitaplar', status: 'Okunacak', rating: 0, isFavorite: false, coverImage: null, rentDate: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveBook = (e) => {
    e.preventDefault();
    if (!currentBook.title) return;
    if (currentBook.id === 'new') {
       setBooks([...books, { ...currentBook, id: Date.now() }]);
    } else {
       setBooks(books.map(b => b.id === currentBook.id ? currentBook : b));
    }
    setIsModalOpen(false);
  };

  const handleBookContextMenu = (e, book) => {
    e.preventDefault();
    e.stopPropagation();
    setBookContextMenu({ x: e.pageX, y: e.pageY, book });
    setFolderContextMenu(null);
  };

  const toggleBookFavorite = (bookId) => {
    setBooks(books.map(b => b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b));
    setBookContextMenu(null);
  };

  const deleteBook = (bookId) => {
    if(window.confirm("Bu kitabı kütüphaneden silmek istediğinize emin misiniz?")) {
      setBooks(books.filter(b => b.id !== bookId));
    }
    setBookContextMenu(null);
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCurrentBook({ ...currentBook, coverImage: reader.result });
      reader.readAsDataURL(file);
    }
  };

  // --- FİLTRELEME ---
  const displayedBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolder === 'Tüm Kitaplar' ? true : (activeFolder === 'Favoriler' ? b.isFavorite : b.folder === activeFolder);
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#191919] text-[#D4D4D4] font-sans">
      
      {/* 1. BANNER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 py-6 border-b border-[#2f2f2f] bg-[#191919] gap-4">
        <div className="flex items-center gap-3">
          <div className="text-[#a3a3a3]"><Icons.BookOpen /></div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Kütüphane</h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#737373]"><Icons.Search /></div>
            <input 
              type="text" 
              placeholder="Yazar veya kitap ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border border-transparent hover:border-[#3f3f3f] focus:border-[#4f4f4f] focus:bg-[#202020] rounded text-sm pl-8 pr-3 py-1.5 outline-none transition-all w-full md:w-64 text-[#D4D4D4]"
            />
          </div>
          <button onClick={() => openModal()} className="bg-[#2ea043] hover:bg-[#2c974b] text-white text-sm font-medium px-4 py-1.5 rounded transition-colors flex items-center gap-2 shadow-sm shrink-0">
            <Icons.Plus /> Yeni Kitap Ekle
          </button>
        </div>
      </div>

      {/* 2. KLASÖRLER (HEADER) */}
      <div className="px-8 pt-4 border-b border-[#2f2f2f] flex items-center gap-1 overflow-x-auto custom-scrollbar">
        {/* Sabitler */}
        <button onClick={() => setActiveFolder('Tüm Kitaplar')} className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-2 ${activeFolder === 'Tüm Kitaplar' ? 'border-white text-white bg-[#202020]' : 'border-transparent text-[#a3a3a3] hover:text-[#D4D4D4] hover:bg-[#202020]'}`}>
          <Icons.Folder /> Tüm Kitaplar
        </button>
        <button onClick={() => setActiveFolder('Favoriler')} className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-2 ${activeFolder === 'Favoriler' ? 'border-white text-white bg-[#202020]' : 'border-transparent text-[#a3a3a3] hover:text-[#D4D4D4] hover:bg-[#202020]'}`}>
          <Icons.Heart solid={true} /> Favoriler
        </button>
        
        <div className="w-px h-4 bg-[#3f3f3f] mx-2"></div>

        {/* Dinamik Klasörler */}
        {folders.map(folder => (
          <button 
            key={folder.id}
            onClick={() => setActiveFolder(folder.name)}
            onContextMenu={(e) => handleFolderContextMenu(e, folder)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-2 ${activeFolder === folder.name ? 'border-white text-white bg-[#202020]' : 'border-transparent text-[#a3a3a3] hover:text-[#D4D4D4] hover:bg-[#202020]'}`}
          >
            <Icons.Folder /> {folder.name}
            {folder.isFavorite && <span className="text-red-500 ml-1"><Icons.Heart solid={true} /></span>}
          </button>
        ))}

        {/* Yeni Klasör Ekleme */}
        {isAddingFolder ? (
           <form onSubmit={handleAddFolder} onClick={e => e.stopPropagation()} className="flex items-center ml-2">
             <input autoFocus type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Klasör Adı" className="bg-[#1e1e1e] border border-[#3f3f3f] text-xs px-2 py-1 rounded text-white outline-none focus:border-blue-500 w-24" />
           </form>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); setIsAddingFolder(true); }} className="px-3 py-2 text-sm text-[#737373] hover:text-white transition-colors ml-1" title="Yeni Klasör">
            <Icons.Plus />
          </button>
        )}
      </div>

      {/* 3. KİTAPLAR GÖRÜNÜMÜ */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {displayedBooks.map(book => (
            <div key={book.id} onClick={() => openModal(book)} onContextMenu={(e) => handleBookContextMenu(e, book)} className="group cursor-pointer flex flex-col">
              
              <div className="relative aspect-[2/3] w-full rounded-md shadow-md border border-[#2f2f2f] overflow-hidden bg-[#202020] transition-transform duration-200 group-hover:-translate-y-1">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]">
                    <span className="text-center font-serif text-white/70 leading-snug text-sm">{book.title}</span>
                    <span className="text-center text-[9px] text-[#737373] mt-2">{book.genre}</span>
                  </div>
                )}
                {book.isFavorite && (
                  <div className="absolute top-2 right-2 text-red-500 drop-shadow-md">
                    <Icons.Heart solid={true} />
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-0.5">
                <h3 className="text-sm font-semibold text-[#D4D4D4] truncate group-hover:text-white transition-colors">{book.title}</h3>
                <p className="text-xs text-[#737373] truncate">{book.author}</p>
                <div className="flex items-center gap-1 mt-1 text-yellow-500">
                   {[1,2,3,4,5].map(star => (
                     <div key={star} className={star <= book.rating ? "text-yellow-500" : "text-[#3f3f3f]"}><Icons.Star solid={star <= book.rating} /></div>
                   ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KİTAP SAĞ TIK MENÜSÜ */}
      {bookContextMenu && (
        <div className="fixed bg-[#252525] border border-[#3f3f3f] rounded shadow-2xl py-1 z-50 w-48 text-sm" style={{ top: bookContextMenu.y, left: bookContextMenu.x }}>
          <button onClick={() => toggleBookFavorite(bookContextMenu.book.id)} className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] text-[#D4D4D4] flex items-center gap-3">
            <span className={bookContextMenu.book.isFavorite ? "text-red-500" : "text-[#737373]"}><Icons.Heart solid={bookContextMenu.book.isFavorite} /></span> 
            {bookContextMenu.book.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          </button>
          <div className="h-px bg-[#3f3f3f] my-1"></div>
          <button onClick={() => deleteBook(bookContextMenu.book.id)} className="w-full text-left px-4 py-2 hover:bg-red-900/30 text-red-400 flex items-center gap-3">
            <Icons.Trash /> Sil
          </button>
        </div>
      )}

      {/* KLASÖR SAĞ TIK MENÜSÜ */}
      {folderContextMenu && (
        <div className="fixed bg-[#252525] border border-[#3f3f3f] rounded shadow-2xl py-1 z-50 w-48 text-sm" style={{ top: folderContextMenu.y, left: folderContextMenu.x }}>
          <button onClick={() => toggleFolderFavorite(folderContextMenu.folder.id)} className="w-full text-left px-4 py-2 hover:bg-[#3f3f3f] text-[#D4D4D4] flex items-center gap-3">
            <span className={folderContextMenu.folder.isFavorite ? "text-red-500" : "text-[#737373]"}><Icons.Heart solid={folderContextMenu.folder.isFavorite} /></span> 
            {folderContextMenu.folder.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          </button>
          <div className="h-px bg-[#3f3f3f] my-1"></div>
          <button onClick={() => deleteFolder(folderContextMenu.folder.id)} className="w-full text-left px-4 py-2 hover:bg-red-900/30 text-red-400 flex items-center gap-3">
            <Icons.Trash /> Klasörü Sil
          </button>
        </div>
      )}

      {/* KİTAP EKLEME / DÜZENLEME MODALI */}
      {isModalOpen && currentBook && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#191919] border border-[#2f2f2f] w-full max-w-2xl rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-[#2f2f2f] flex justify-between items-center bg-[#202020]">
              <h2 className="text-lg font-semibold text-white">{currentBook.id === 'new' ? 'Yeni Kitap Ekle' : 'Kitabı Düzenle'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#737373] hover:text-white"><Icons.XMark /></button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto flex flex-col md:flex-row gap-8">
              
              {/* Kapak Yükleme */}
              <div className="w-full md:w-1/3 flex flex-col gap-3">
                <p className="text-xs font-semibold text-[#737373] uppercase tracking-wider">Kapak</p>
                <div onClick={() => coverInputRef.current.click()} className="aspect-[2/3] w-full border border-dashed border-[#3f3f3f] rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-[#D4D4D4] transition-colors relative overflow-hidden group bg-[#1e1e1e]">
                  {currentBook.coverImage ? (
                    <img src={currentBook.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-[#737373] group-hover:text-white">Görsel Seç</span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-bold">Değiştir</span>
                  </div>
                </div>
                <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverUpload} className="hidden" />
              </div>

              {/* Form Bilgileri */}
              <form id="bookForm" onSubmit={handleSaveBook} className="w-full md:w-2/3 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1 block">Kitap Adı</label>
                  <input type="text" required value={currentBook.title} onChange={e => setCurrentBook({...currentBook, title: e.target.value})} className="w-full bg-[#202020] border border-[#3f3f3f] rounded px-3 py-2 text-sm text-white focus:border-[#D4D4D4] outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1 block">Yazar</label>
                    <input type="text" required value={currentBook.author} onChange={e => setCurrentBook({...currentBook, author: e.target.value})} className="w-full bg-[#202020] border border-[#3f3f3f] rounded px-3 py-2 text-sm text-white focus:border-[#D4D4D4] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1 block">Türü (Genre)</label>
                    <input type="text" placeholder="Örn: Bilimkurgu" value={currentBook.genre} onChange={e => setCurrentBook({...currentBook, genre: e.target.value})} className="w-full bg-[#202020] border border-[#3f3f3f] rounded px-3 py-2 text-sm text-white focus:border-[#D4D4D4] outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1 block">Durum</label>
                    <select value={currentBook.status} onChange={e => setCurrentBook({...currentBook, status: e.target.value})} className="w-full bg-[#202020] border border-[#3f3f3f] rounded px-3 py-2 text-sm text-white outline-none">
                      <option value="Okunacak">Okunacak</option>
                      <option value="Okunuyor">Okunuyor</option>
                      <option value="Okudum">Okudum</option>
                      <option value="Kiralandı">Kiralandı</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1 block">Klasör</label>
                    <select value={currentBook.folder} onChange={e => setCurrentBook({...currentBook, folder: e.target.value})} className="w-full bg-[#202020] border border-[#3f3f3f] rounded px-3 py-2 text-sm text-white outline-none">
                      <option value="Tüm Kitaplar">Tüm Kitaplar</option>
                      {folders.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                    </select>
                  </div>
                </div>

                {currentBook.status === 'Kiralandı' && (
                  <div>
                    <label className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1 block">Kira / Teslim Tarihi</label>
                    <input type="date" value={currentBook.rentDate} onChange={e => setCurrentBook({...currentBook, rentDate: e.target.value})} className="w-full bg-[#202020] border border-[#3f3f3f] rounded px-3 py-2 text-sm text-white outline-none [color-scheme:dark]" />
                  </div>
                )}

                {/* YILDIZ PUANLAMA */}
                <div>
                  <label className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-2 block">Puan (Yıldız)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <div 
                        key={star} 
                        onClick={() => setCurrentBook({...currentBook, rating: star})}
                        className={`cursor-pointer transition-colors ${star <= currentBook.rating ? "text-yellow-500" : "text-[#3f3f3f] hover:text-yellow-500/50"}`}
                      >
                        <Icons.Star solid={star <= currentBook.rating} />
                      </div>
                    ))}
                  </div>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-[#2f2f2f] bg-[#202020] flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded text-sm font-medium text-[#D4D4D4] hover:bg-[#2f2f2f] transition-colors">İptal</button>
              <button type="submit" form="bookForm" className="px-4 py-2 rounded text-sm font-medium bg-[#2ea043] hover:bg-[#2c974b] text-white transition-colors">Kaydet</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
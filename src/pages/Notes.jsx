import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { noteApi } from '../api/noteApi'; 
import NoteEditor from '../components/notes/NoteEditor';
import { useAuth } from '../context/AuthContext';
import NotesToolbar from '../components/notes/NotesToolbar';
import NoteCard from '../components/notes/NoteCard';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = ({ variant = 'grid' }) => {
  if (variant === 'list') {
    return (
      <div className="flex items-center gap-3.5 rounded-xl px-4 py-3 border border-[#1c1c28] bg-[#111119] animate-pulse">
        <div className="h-8 w-8 rounded-lg bg-[#1e1e2a] flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3 w-2/5 rounded bg-[#1e1e2a]" />
          <div className="h-2.5 w-3/5 rounded bg-[#181826]" />
        </div>
        <div className="hidden sm:flex gap-1.5">
          <div className="h-4 w-14 rounded-full bg-[#1e1e2a]" />
          <div className="h-4 w-10 rounded-full bg-[#1e1e2a]" />
        </div>
        <div className="h-3 w-16 rounded bg-[#181826] hidden md:block" />
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-[#1c1c28] bg-[#111119] p-4 flex flex-col gap-3 animate-pulse h-[200px]">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-[#1e1e2a]" />
        <div className="h-3.5 w-2/5 rounded bg-[#1e1e2a]" />
      </div>
      <div className="space-y-2 flex-1">
        <div className="h-2.5 w-full rounded bg-[#181826]" />
        <div className="h-2.5 w-4/5 rounded bg-[#181826]" />
        <div className="h-2.5 w-3/5 rounded bg-[#181826]" />
      </div>
      <div className="flex gap-1.5 pt-2 border-t border-[#191926]">
        <div className="h-4 w-14 rounded-full bg-[#1e1e2a]" />
        <div className="h-4 w-10 rounded-full bg-[#1e1e2a]" />
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ hasSearch, onNewNote }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="flex flex-col items-center justify-center py-24 px-6 rounded-2xl border border-dashed border-[#1e1e2c] bg-[#0e0e16] mx-1"
  >
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#141420] border border-[#1e1e2c]">
      <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="#303048" strokeWidth="1.3" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    </div>
    <h3 className="text-[15px] font-[600] text-[#808098] tracking-[-0.02em] mb-1.5">
      {hasSearch ? 'Sonuç bulunamadı' : 'Henüz not yok'}
    </h3>
    <p className="text-[12.5px] text-[#35354a] text-center max-w-[280px] leading-relaxed mb-6">
      {hasSearch
        ? 'Arama kriterlerine uyan bir not bulunamadı. Farklı bir kelime deneyin.'
        : 'Bu klasörde henüz bir not yok. İlk notunu oluştur.'}
    </p>
    {!hasSearch && (
      <button
        onClick={onNewNote}
        className="flex items-center gap-2 rounded-xl bg-[#6c6af6] px-4 py-2 text-[12.5px] font-[540] text-white transition-all duration-150 hover:bg-[#7a78f8] shadow-[0_2px_12px_rgba(108,106,246,0.3)]"
      >
        <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Yeni Not Oluştur
      </button>
    )}
  </motion.div>
);

// ─── FOLDER → NoteCard folder prop mapper ─────────────────────────────────────
const FOLDER_META = {
  'Yazılım':   { name: 'Yazılım',  emoji: '💻', color: '#6c6af6' },
  'Toplantı':  { name: 'Toplantı', emoji: '📋', color: '#34d399' },
  'Kişisel':   { name: 'Kişisel',  emoji: '🌿', color: '#fb923c' },
  'Genel':     { name: 'Genel',    emoji: '📝', color: '#9090a0' },
};

function folderMeta(category) {
  return FOLDER_META[category] ?? { name: category || 'Genel', emoji: '📁', color: '#505070' };
}

// ─── Notes Page ───────────────────────────────────────────────────────────────
export default function Notes() {
  const { user } = useAuth();

  const [notes, setNotes]           = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);

  const [searchQuery, setSearchQuery]   = useState('');
  const [view, setView]                 = useState('grid');
  const [sortBy, setSortBy]             = useState('modified');
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeFolder, setActiveFolder] = useState('Tüm Notlar');

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await noteApi.getAll(0, 100); 
      setNotes(data || []);
    } catch (err) {
      console.error("Notlar çekilirken hata:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { if (user) fetchNotes(); }, [user, fetchNotes]);

  // ── Etiketleri Dinamik Olarak Toplama (YENİ EKLENDİ) ──────────────────────
  const availableTags = useMemo(() => {
    const tags = new Set();
    notes.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => tags.add(tag));
      }
    });
    // Alfabetik olarak sıralayıp diziye çeviriyoruz
    return Array.from(tags).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [notes]);

  // ── Filtre Açma/Kapama İşlevi (YENİ EKLENDİ) ──────────────────────────────
  const handleFilterToggle = useCallback((tag) => {
    setActiveFilters(prev => {
      const isSelected = prev.some(f => f.label === tag);
      if (isSelected) {
        // Zaten seçiliyse listeden çıkar
        return prev.filter(f => f.label !== tag);
      } else {
        // Seçili değilse listeye ekle (renk olarak varsayılan bir renk atıyoruz)
        return [...prev, { label: tag, color: '#6c6af6' }];
      }
    });
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleCreateNewNote = useCallback(() => {
    setSelectedNote({
      id: 'new',
      title: '',
      content: '',
      folderId: null, 
      folderName: ['Tüm Notlar', 'Favoriler'].includes(activeFolder) ? 'Kişisel' : activeFolder,
      favorite: false,
    });
  }, [activeFolder]);

const handleSaveNote = useCallback(async (updatedNoteData) => {
  try {
    const payload = {
      title:             updatedNoteData.title || 'İsimsiz Not',
      content:           updatedNoteData.content || '',
      tags:              updatedNoteData.tags || [],
      favorite:          updatedNoteData.favorite || false,
      pinned:            updatedNoteData.pinned || false,
      color:             updatedNoteData.color || null,
      folderId:          updatedNoteData.folderId || null,
      imageUrl:          updatedNoteData.imageUrl || null,
      pdfUrl:            updatedNoteData.pdfUrl || null,
      handwritingBase64: updatedNoteData.handwritingBase64 || null,
      pdfAnnotations:    updatedNoteData.pdfAnnotations || null,
    };

    if (selectedNote.id === 'new') {
      const createdNote = await noteApi.create(payload);
      // ✅ selectedNote'u güncelle ki bir sonraki kayıtta ID doğru gitsin
      setSelectedNote(createdNote);
    } else {
      const updatedNote = await noteApi.update(selectedNote.id, payload);
      // ✅ selectedNote'u güncel veriyle güncelle
      setSelectedNote(updatedNote);
    }
    fetchNotes();
  } catch (err) {
    console.error("Kaydetme hatası", err);
  }
}, [selectedNote, fetchNotes]);

  const handleFavoriteToggle = useCallback(async (id, next) => {
    const noteToUpdate = notes.find(n => n.id === id);
    if (!noteToUpdate) return;

    setNotes(prev => prev.map(n => n.id === id ? { ...n, favorite: next } : n));
    
    try {
      const updatePayload = {
        title: noteToUpdate.title || 'İsimsiz Not',
        content: noteToUpdate.content,
        color: noteToUpdate.color || null,
        folderId: noteToUpdate.folderId || null, 
        imageUrl: noteToUpdate.imageUrl || null,
        pdfUrl: noteToUpdate.pdfUrl || null,
        handwritingBase64: noteToUpdate.handwritingBase64 || null,
        pinned: noteToUpdate.pinned || false,
        favorite: next
      };

      await noteApi.update(id, updatePayload);
    } catch {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, favorite: !next } : n));
    }
  }, [notes]);

  const handleDeleteNote = useCallback(async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    try {
      await noteApi.softDelete(id);
    } catch {
      fetchNotes();
    }
  }, [fetchNotes]);

  // ── Filter / Sort (GÜNCELLENDİ) ────────────────────────────────────────────
  const filteredNotes = notes
    .filter(note => {
      if (activeFolder === 'Favoriler') return note.favorite;
      if (activeFolder !== 'Tüm Notlar') return note.folderName === activeFolder; 
      return true;
    })
    .filter(note => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        note.title?.toLowerCase().includes(q) ||
        note.content?.replace(/<[^>]+>/g, '').toLowerCase().includes(q)
      );
    })
    // YENİ EKLENDİ: Etiket Filtresi
    .filter(note => {
      // Eğer hiç filtre seçilmemişse tüm notları göster
      if (activeFilters.length === 0) return true;
      const noteTags = note.tags || [];
      // Seçili etiketlerden EN AZ BİRİNİ içeren notları göster
      return activeFilters.some(filter => noteTags.includes(filter.label));
    })
    .sort((a, b) => {
      if (sortBy === 'modified')    return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === 'created')     return b.id - a.id;
      if (sortBy === 'alpha')       return (a.title || '').localeCompare(b.title || '', 'tr');
      if (sortBy === 'alpha-desc')  return (b.title || '').localeCompare(a.title || '', 'tr');
      return 0;
    });

  // ── Editor overlay ─────────────────────────────────────────────────────────
  if (selectedNote) {
    return (
      <NoteEditor
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onSave={handleSaveNote}
      />
    );
  }

  const gridClass = view === 'list'
    ? 'flex flex-col gap-1.5'
    : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4';

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex flex-1 min-w-0 flex-col h-full overflow-hidden">
        <NotesToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          view={view}
          onViewChange={setView}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filters={activeFilters}
          onFilterRemove={(f) => setActiveFilters(prev => prev.filter(x => x.label !== f.label))}
          // BÜYÜK DÜZELTME BURASI: Yeni eklediğimiz propsları Toolbar'a gönderiyoruz
          availableTags={availableTags}
          onFilterToggle={handleFilterToggle}
          onNewNote={handleCreateNewNote}
          totalNotes={filteredNotes.length}
          activeFolder={activeFolder}
        />

        <main
          className={[
            'flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-5 py-5',
            '[&::-webkit-scrollbar]:w-[3px]',
            '[&::-webkit-scrollbar-track]:bg-transparent',
            '[&::-webkit-scrollbar-thumb]:rounded-full',
            '[&::-webkit-scrollbar-thumb]:bg-[#2a2a36]',
          ].join(' ')}
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a36 transparent' }}
          aria-label="Notlar listesi"
        >
          {isLoading ? (
            <div className={gridClass}>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} variant={view} />
              ))}
            </div>
          ) : filteredNotes.length > 0 ? (
            <motion.div
              key={`${view}-${activeFolder}-${sortBy}`}
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show:   { opacity: 1, transition: { staggerChildren: 0.04 } },
              }}
              className={gridClass}
            >
              <AnimatePresence mode="popLayout">
                {filteredNotes.map(note => (
                  <motion.div
                    key={note.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 340, damping: 26 } },
                    }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  >
                    <NoteCard
                      note={note}
                      handwritingBase64={note.handwritingBase64}
                      pdfUrl={note.pdfUrl}
                      noteType={note.noteType}
                      
                      id={note.id}
                      title={note.title}
                      content={note.content?.replace(/<[^>]+>/g, '') ?? ''}
                      emoji={note.emoji ?? undefined}
                      tags={note.tags ?? []}
                      folder={folderMeta(note.folderName)} 
                      isFavorited={note.favorite}
                      updatedAt={note.updatedAt}
                      accentColor={folderMeta(note.folderName).color}
                      variant={view}
                      onFavoriteToggle={handleFavoriteToggle}
                      onDelete={() => handleDeleteNote(note.id)}
                      onClick={() => setSelectedNote(note)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <EmptyState
              hasSearch={!!searchQuery || activeFilters.length > 0}
              onNewNote={handleCreateNewNote}
            />
          )}
        </main>
      </div>
    </div>
  );
}
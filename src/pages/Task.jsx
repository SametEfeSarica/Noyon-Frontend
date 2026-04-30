import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Tasks() {
  // --- TEMEL STATE'LER ---
  const [tasks, setTasks] = useState([]);
  const [activeFolder, setActiveFolder] = useState('Noyon Projesi'); // Klasör Mantığı
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const userId = localStorage.getItem('userId') || 1;

  // --- MODAL (DETAY PANELİ) STATE'LERİ ---
  const [selectedTask, setSelectedTask] = useState(null); // Tıklanan görevi tutar
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Sahte Klasörler ve Kullanıcılar (Grupça kullanım için)
  const folders = ['Noyon Projesi', 'Pazarlama', 'Kişisel Görevler'];
  const teamMembers = [
    { id: 1, name: 'Efe Y.', avatar: 'E' },
    { id: 2, name: 'Talha B.', avatar: 'T' },
    { id: 3, name: 'Ensar K.', avatar: 'EN' },
  ];

  // API'den Görevleri Çekme
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/tasks/active/${userId}`);
      // Backend'den gelen verilere UI için sahte yorum, checklist ve kullanıcı ekliyoruz (Talha bunları yazana kadar)
      const enrichedTasks = response.data.map(task => ({
        ...task,
        folder: 'Noyon Projesi',
        assignees: [teamMembers[0]], // Varsayılan atanan kişi
        checklist: [
          { id: 1, text: 'Tasarım onayı alınacak', isCompleted: true },
          { id: 2, text: 'API bağlantıları test edilecek', isCompleted: false }
        ],
        comments: [
          { id: 1, user: 'Talha B.', text: 'Backend uçları hazır, test edebilirsin.', time: '2 saat önce' }
        ]
      }));
      setTasks(enrichedTasks);
    } catch (err) {
      console.error("Görevler çekilemedi");
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // --- TEMEL KANBAN İŞLEMLERİ ---
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await axios.post(`http://localhost:8080/api/tasks/add`, {
        title: newTaskTitle, description: '', status: 'TODO', priority: 'MEDIUM', dueDate: new Date().toISOString().split('T')[0], user: { id: userId }
      });
      setNewTaskTitle(''); fetchTasks();
    } catch (err) { alert("Görev eklenemedi."); }
  };

  const handleDragStart = (e, taskId) => e.dataTransfer.setData("taskId", taskId);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    setTasks(prev => prev.map(t => t.id.toString() === taskId ? { ...t, status: newStatus } : t));
    try { await axios.put(`http://localhost:8080/api/tasks/update-status/${taskId}?status=${newStatus}`); } 
    catch (err) { console.error("Durum güncellenemedi"); }
  };

  const openTaskModal = (task) => setSelectedTask(task);
  const closeTaskModal = () => setSelectedTask(null);

  // Klasöre göre filtreleme
  const filteredTasks = tasks.filter(task => task.folder === activeFolder);

  // Kanban Sütunları
  const columns = [
    { id: 'TODO', title: '📋 Yapılacaklar', borderColor: 'border-gray-600' },
    { id: 'IN_PROGRESS', title: '⏳ Devam Edenler', borderColor: 'border-blue-500' },
    { id: 'DONE', title: '✅ Bitenler', borderColor: 'border-emerald-500' }
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#191919] p-8 lg:p-12 text-[#D4D4D4] font-sans relative">
      
      {/* 1. ÜST BÖLÜM: BAŞLIK, KLASÖRLER VE KULLANICI EKLEME */}
      <div className="flex flex-col mb-8 border-b border-[#2f2f2f] pb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">Görev Yönetimi</h1>
            <p className="text-[#737373] mt-2 text-sm">Grup projelerini ve kişisel görevlerini klasörler halinde yönet.</p>
          </div>
          {/* GRUPÇA KULLANIM: Kullanıcı Ekleme Butonu */}
          <button className="bg-[#202020] hover:bg-[#2a2a2a] border border-[#3f3f3f] text-white px-4 py-2 rounded-md transition-all text-sm font-bold flex items-center gap-2">
            <span>👥</span> Takıma Kişi Ekle
          </button>
        </div>

        {/* KLASÖR MANTIĞI VE YENİ GÖREV FORMU */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex space-x-2 overflow-x-auto w-full md:w-auto custom-scrollbar">
            {folders.map(folder => (
              <button 
                key={folder} onClick={() => setActiveFolder(folder)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeFolder === folder ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-[#202020] text-[#a3a3a3] border border-[#2f2f2f] hover:bg-[#2a2a2a]'}`}
              >
                📁 {folder}
              </button>
            ))}
          </div>

          <form onSubmit={handleAddTask} className="flex w-full md:w-auto gap-2">
            <input 
              type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Yeni görev başlığı..." 
              className="bg-[#202020] text-white border border-[#3f3f3f] rounded-md px-4 py-1.5 focus:outline-none focus:border-blue-500 text-sm w-full md:w-64"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-md text-sm transition-colors">+ Ekle</button>
          </form>
        </div>
      </div>

      {/* 2. KANBAN TAHTASI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
        {columns.map(col => (
          <div key={col.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)} className="bg-[#1e1e1e] rounded-xl border border-[#2f2f2f] p-4 min-h-[500px] flex flex-col">
            <h2 className={`text-sm font-bold text-white uppercase tracking-widest mb-4 border-b-2 pb-2 ${col.borderColor}`}>
              {col.title} <span className="text-[#737373] ml-2">({filteredTasks.filter(t => t.status === col.id).length})</span>
            </h2>
            
            <div className="flex-1 flex flex-col gap-3">
              {filteredTasks.filter(t => t.status === col.id).map(task => (
                <div 
                  key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => openTaskModal(task)} // TIKLAYINCA PANEL AÇILIR
                  className="bg-[#252525] p-4 rounded-lg border border-[#3f3f3f] shadow-sm cursor-pointer hover:border-[#60a5fa] transition-all group"
                >
                  <h4 className="text-sm font-semibold text-[#D4D4D4] group-hover:text-white leading-tight">{task.title}</h4>
                  
                  {/* Görev Kartı Alt Bilgileri (Checklist özeti ve Atananlar) */}
                  <div className="mt-4 flex items-center justify-between border-t border-[#3f3f3f] pt-2">
                    <div className="flex items-center gap-3 text-xs text-[#737373]">
                       <span title="Açıklama">📝</span>
                       <span title="Checklist" className={task.checklist?.filter(c => c.isCompleted).length === task.checklist?.length ? 'text-emerald-500' : ''}>
                         ☑️ {task.checklist?.filter(c => c.isCompleted).length}/{task.checklist?.length}
                       </span>
                       <span title="Yorumlar">💬 {task.comments?.length}</span>
                    </div>
                    {/* Göreve Atanan Kullanıcı Avatarları */}
                    <div className="flex -space-x-2">
                      {task.assignees?.map(user => (
                        <div key={user.id} className="w-6 h-6 rounded-full bg-blue-600 border-2 border-[#252525] flex items-center justify-center text-[10px] font-bold text-white" title={user.name}>
                          {user.avatar}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ========================================= */}
      {/* 3. GÖREV DETAY PANELİ (MODAL) - İSTEDİĞİN ÖZELLİKLER */}
      {/* ========================================= */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-[#3f3f3f] w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Başlık (Title Block) */}
            <div className="px-6 py-4 border-b border-[#2f2f2f] flex justify-between items-start bg-[#252525]">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedTask.title}</h2>
                <p className="text-xs text-[#737373]">Şu klasörde: <span className="underline">{selectedTask.folder}</span></p>
              </div>
              <button onClick={closeTaskModal} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            {/* Modal İçerik (İki Sütunlu) */}
            <div className="flex flex-col md:flex-row flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Sol Taraf: Açıklama, Checklist, Yorumlar */}
              <div className="flex-1 p-6 space-y-8 border-r border-[#2f2f2f]">
                
                {/* AÇIKLAMA METNİ PANELİ */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">📝 Açıklama</h3>
                  <textarea 
                    className="w-full bg-[#191919] border border-[#3f3f3f] rounded-md p-3 text-sm text-[#D4D4D4] focus:border-blue-500 focus:outline-none min-h-[100px]"
                    placeholder="Görev hakkında daha detaylı bilgi ekle..."
                    defaultValue={selectedTask.description}
                  ></textarea>
                </div>

                {/* CHECKOUT (CHECKLIST) PANELİ */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">☑️ Yapılacaklar (Checklist)</h3>
                  {/* İlerleme Çubuğu */}
                  <div className="w-full bg-[#191919] rounded-full h-2 mb-4 border border-[#2f2f2f]">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(selectedTask.checklist?.filter(c => c.isCompleted).length / selectedTask.checklist?.length) * 100}%` }}></div>
                  </div>
                  <div className="space-y-2 mb-3">
                    {selectedTask.checklist?.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked={item.isCompleted} className="w-4 h-4 accent-blue-500 cursor-pointer" />
                        <span className={`text-sm ${item.isCompleted ? 'text-[#737373] line-through' : 'text-[#D4D4D4]'}`}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Yeni alt görev ekle..." className="flex-1 bg-[#191919] border border-[#3f3f3f] rounded-md px-3 py-1.5 text-sm" />
                    <button className="bg-[#2f2f2f] hover:bg-[#3f3f3f] px-3 py-1.5 rounded-md text-sm transition-colors border border-[#4f4f4f]">Ekle</button>
                  </div>
                </div>

                {/* YORUM PANELİ */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">💬 Yorumlar / Aktiviteler</h3>
                  <div className="space-y-4 mb-4">
                    {selectedTask.comments?.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-xs shrink-0">{comment.user.charAt(0)}</div>
                        <div className="bg-[#191919] p-3 rounded-md border border-[#2f2f2f] flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-xs text-white">{comment.user}</span>
                            <span className="text-[10px] text-[#737373]">{comment.time}</span>
                          </div>
                          <p className="text-sm text-[#a3a3a3]">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs shrink-0 text-white">E</div>
                    <div className="flex-1">
                      <textarea placeholder="Bir yorum yaz..." className="w-full bg-[#191919] border border-[#3f3f3f] rounded-md p-3 text-sm focus:border-blue-500 outline-none h-20"></textarea>
                      <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-bold transition-colors">Gönder</button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sağ Taraf: Görev Bilgileri ve Atamalar */}
              <div className="w-full md:w-64 bg-[#202020] p-6 space-y-6">
                
                {/* Göreve Özel Kullanıcı Ekleme */}
                <div>
                  <h4 className="text-xs font-bold text-[#737373] uppercase mb-3">Göreve Atananlar</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTask.assignees?.map(user => (
                      <div key={user.id} className="flex items-center gap-2 bg-[#191919] border border-[#3f3f3f] pr-3 rounded-full">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">{user.avatar}</div>
                        <span className="text-xs font-semibold">{user.name}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-[#2a2a2a] hover:bg-[#3f3f3f] border border-[#3f3f3f] text-[#D4D4D4] py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2">
                    <span>+</span> Kullanıcı Ata
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#737373] uppercase mb-2">Durum</h4>
                  <select className="w-full bg-[#191919] border border-[#3f3f3f] rounded-md p-2 text-sm text-white outline-none">
                    <option value="TODO">Yapılacaklar</option>
                    <option value="IN_PROGRESS">Devam Edenler</option>
                    <option value="DONE">Bitenler</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#737373] uppercase mb-2">Son Tarih</h4>
                  <input type="date" defaultValue={selectedTask.dueDate} className="w-full bg-[#191919] border border-[#3f3f3f] rounded-md p-2 text-sm text-white outline-none [color-scheme:dark]" />
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
"use client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Newspaper, Megaphone, Pin, Plus, Calendar, Edit, 
  Trash2, X, Check, AlertTriangle, UserCircle, Clock, 
  Info, ChevronRight
} from "lucide-react";

export default function NewsPage() {
  const { data: session } = useSession();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit State
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editIsPinned, setEditIsPinned] = useState(false);

  // Delete State
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Nie udało się załadować ogłoszeń.");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, isPinned })
      });
      if (res.ok) {
        toast.success("Ogłoszenie zostało dodane!");
        setShowForm(false);
        setTitle("");
        setContent("");
        setIsPinned(false);
        fetchNews();
      } else {
        toast.error("Błąd podczas dodawania ogłoszenia.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Wystąpił błąd.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/news/${editingAnnouncement.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent, isPinned: editIsPinned })
      });
      if (res.ok) {
        toast.success("Ogłoszenie zostało zaktualizowane!");
        setEditingAnnouncement(null);
        fetchNews();
      } else {
        toast.error("Błąd podczas aktualizacji ogłoszenia.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Wystąpił błąd.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAnnouncement) return;
    try {
      const res = await fetch(`/api/news/${deletingAnnouncement.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Ogłoszenie zostało usunięte.");
        setDeletingAnnouncement(null);
        fetchNews();
      } else {
        toast.error("Błąd podczas usuwania ogłoszenia.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Wystąpił błąd.");
    }
  };

  const openEditModal = (item) => {
    setEditingAnnouncement(item);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditIsPinned(item.isPinned);
  };

  const isAdmin = session?.user?.role === "BOARD" || session?.user?.role === "OWNER";

  const renderRoleBadge = (role) => {
    switch (role) {
      case "OWNER":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            WŁAŚCICIEL
          </span>
        );
      case "BOARD":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
            ZARZĄD
          </span>
        );
      case "DISPATCHER":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            DYSPOZYTOR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            KIEROWCA
          </span>
        );
    }
  };

  // Get statistics
  const totalCount = news.length;
  const pinnedCount = news.filter(item => item.isPinned).length;
  const latestDate = news.length > 0 ? new Date(news[0].createdAt) : null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* 👑 CZYSZCZONA NAGŁÓWEK (CZYSTY ZINC HEADER) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 tracking-tight text-white">
            <Megaphone className="w-8 h-8 text-amber-400" />
            Tablica Ogłoszeń
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Oficjalne komunikaty zarządu, aktualności oraz ważne informacje firmy Bojar Logistic.
          </p>
        </div>
        {isAdmin && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Dodaj Ogłoszenie
          </button>
        )}
      </div>

      {/* 📊 MINI WIDŻETY STATYSTYK */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl">
            <Newspaper className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Wszystkie ogłoszenia</p>
            <h3 className="text-xl font-black text-white mt-0.5">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl">
            <Pin className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Przypięte komunikaty</p>
            <h3 className="text-xl font-black text-white mt-0.5">{pinnedCount}</h3>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ostatni wpis</p>
            <h3 className="text-sm font-bold text-white mt-0.5 truncate max-w-[200px]">
              {latestDate ? latestDate.toLocaleDateString("pl-PL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Brak wpisów"}
            </h3>
          </div>
        </div>
      </div>

      {/* 📝 FORMULARZ DODAWANIA OGŁOSZENIA */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-md space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" /> Nowe Ogłoszenie
                </h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePost} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Tytuł ogłoszenia</label>
                    <input 
                      type="text" 
                      required 
                      value={title} 
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 outline-none focus:border-zinc-600 text-white transition-all text-sm"
                      placeholder="Np. Zebranie kierowców, zmiana w logach..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Treść ogłoszenia</label>
                    <textarea 
                      required 
                      value={content} 
                      onChange={e => setContent(e.target.value)} 
                      rows={6}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 outline-none focus:border-zinc-600 text-white transition-all text-sm resize-none"
                      placeholder="Wpisz szczegółową treść ogłoszenia..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="pinned" 
                    checked={isPinned} 
                    onChange={e => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="pinned" className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 cursor-pointer select-none">
                    <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Przypnij to ogłoszenie na samej górze tablicy
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold transition-all text-xs border border-zinc-800"
                  >
                    Anuluj
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all disabled:opacity-50 text-xs"
                  >
                    {submitting ? "Publikowanie..." : "Opublikuj Ogłoszenie"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📌 LISTA OGŁOSZEŃ */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-zinc-700 border-t-amber-400 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-zinc-500">Pobieranie ogłoszeń...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center">
            <div className="p-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl mb-4">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-lg text-white">Brak ogłoszeń na tablicy</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-sm">
              Obecnie nie ma żadnych opublikowanych komunikatów.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {news.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                key={item.id} 
                className={`relative group p-6 rounded-3xl border transition-all duration-200 ${
                  item.isPinned 
                    ? 'bg-zinc-950 border-amber-500/40 shadow-sm' 
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                
                {/* Oznaczenie Przypięcia */}
                {item.isPinned && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-500/30 tracking-wider">
                    <Pin className="w-3 h-3 fill-amber-400" />
                    PRZYPIĘTE
                  </span>
                )}

                {/* Top card block: Author info and actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    
                    {/* Author Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 p-0.5 overflow-hidden">
                      {item.author?.image ? (
                        <img 
                          src={item.author.image} 
                          alt={item.author.firstName || item.author.name} 
                          className="w-full h-full object-cover rounded-[8px]" 
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 rounded-[8px] flex items-center justify-center text-zinc-300 font-bold text-xs">
                          {(item.author?.firstName || item.author?.name || "Z").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Author Text Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {item.author?.firstName || item.author?.name || "BMS Zarząd"}
                        </span>
                        {item.author?.role && renderRoleBadge(item.author.role)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString("pl-PL", { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {item.updatedAt !== item.createdAt && (
                          <>
                            <span>•</span>
                            <span className="italic text-zinc-500">(edytowano)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions buttons */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 self-end sm:self-center pr-12 sm:pr-0">
                      <button 
                        onClick={() => openEditModal(item)}
                        title="Edytuj ogłoszenie"
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 transition-all cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeletingAnnouncement(item)}
                        title="Usuń ogłoszenie"
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-red-500/20 text-red-400 border border-zinc-800 hover:border-red-500/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Announcement Title & Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <div className="whitespace-pre-wrap text-zinc-300 leading-relaxed text-sm">
                    {item.content}
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 📝 OKNO MODALNE EDYCJI (EDIT MODAL) */}
      <AnimatePresence>
        {editingAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingAnnouncement(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-amber-400" /> Edytuj Ogłoszenie
                </h3>
                <button 
                  onClick={() => setEditingAnnouncement(null)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Tytuł</label>
                  <input 
                    type="text" 
                    required 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 outline-none focus:border-zinc-600 text-white transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Treść</label>
                  <textarea 
                    required 
                    value={editContent} 
                    onChange={e => setEditContent(e.target.value)} 
                    rows={6}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 outline-none focus:border-zinc-600 text-white transition-all text-sm resize-none"
                  />
                </div>

                <div className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="edit-pinned" 
                    checked={editIsPinned} 
                    onChange={e => setEditIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="edit-pinned" className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 cursor-pointer select-none">
                    <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Przypnij to ogłoszenie na samej górze
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setEditingAnnouncement(null)} 
                    className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 font-bold transition-all text-xs border border-zinc-800"
                  >
                    Anuluj
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all disabled:opacity-50 text-xs"
                  >
                    {submitting ? "Zapisywanie..." : "Zapisz Zmiany"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚠️ DIALOG POTWIERDZENIA USUNIĘCIA (DELETE CONFIRMATION MODAL) */}
      <AnimatePresence>
        {deletingAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingAnnouncement(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Usuwanie ogłoszenia</h3>
                  <p className="text-xs text-zinc-400">Ta operacja jest nieodwracalna</p>
                </div>
              </div>

              <div className="text-sm text-zinc-300 leading-relaxed bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                Czy na pewno chcesz usunąć ogłoszenie o tytule <strong className="text-white font-bold">"{deletingAnnouncement.title}"</strong>? 
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setDeletingAnnouncement(null)} 
                  className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 font-bold transition-all text-xs border border-zinc-800"
                >
                  Anuluj
                </button>
                <button 
                  type="button" 
                  onClick={handleDelete}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all text-xs"
                >
                  Usuń ogłoszenie
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

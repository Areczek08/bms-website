"use client";
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle, XCircle, Clock, Wrench, Calendar, Truck, AlertTriangle, Plus, User, DollarSign, PenTool } from "lucide-react";
import { ConfirmModal } from "../../components/ConfirmModal";
import { CreateRequestModal } from "./CreateRequestModal";

export default function RequestsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "BOARD" || session?.user?.role === "OWNER";
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [promptConfig, setPromptConfig] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [session]);

  const executeAction = async (id, action, comment = "") => {
    try {
      const res = await fetch(`/api/requests/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment })
      });
      if (res.ok) fetchRequests();
      else toast.error("Wystąpił błąd");
    } catch (e) {
      toast.error("Błąd połączenia");
    }
  };

  const handleActionClick = (id, action) => {
    setCommentInput("");
    setPromptConfig({ id, action });
  };

  const parseDocument = (content, createdAt) => {
    let docNumber = "WN/--/--";
    const numMatch = content.match(/DOKUMENT NR: (.*?)\n/);
    if (numMatch) docNumber = numMatch[1];

    let dateStr = new Date(createdAt).toLocaleDateString('pl-PL');
    const dateMatch = content.match(/DATA ZŁOŻENIA: (.*?)\n/);
    if (dateMatch) dateStr = dateMatch[1];

    let signature = "";
    const sigMatch = content.match(/PODPIS CYFROWY: \/s\/ (.*?)(?:\n|$)/);
    if (sigMatch) signature = sigMatch[1];

    let boardComment = null;
    const decisionParts = content.split(/=================================================\nDECYZJA ZARZĄDU.*?\n/);
    if (decisionParts.length > 1) {
      boardComment = decisionParts[1].trim();
    }

    let body = content;
    const bodyParts = content.split('=================================================');
    if (bodyParts.length > 1) {
      body = bodyParts[1].trim();
      if (body.includes('PODPIS CYFROWY')) {
        body = body.split('PODPIS CYFROWY')[0].trim();
      }
    } else {
      // Przypadek starszych wniosków bez =======
      if (body.includes('PODPIS CYFROWY')) {
        body = body.split('PODPIS CYFROWY')[0].trim();
      }
    }

    return { docNumber, dateStr, signature, boardComment, body };
  };

  const getIcon = (type) => {
    switch(type) {
      case "SERVICE": return <Wrench className="w-5 h-5 text-indigo-400" />;
      case "VACATION":
      case "VACATION_EXTENSION": return <Calendar className="w-5 h-5 text-emerald-400" />;
      case "TRUCK_CHANGE":
      case "TRAILER_CHANGE": return <Truck className="w-5 h-5 text-amber-400" />;
      case "PROMOTION": return <User className="w-5 h-5 text-purple-400" />;
      case "RAISE": return <DollarSign className="w-5 h-5 text-green-400" />;
      case "FEATURE_PROPOSAL": return <PenTool className="w-5 h-5 text-blue-400" />;
      case "PENALTY_APPEAL": return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "COMPLAINT": return <FileText className="w-5 h-5 text-orange-400" />;
      default: return <FileText className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap');
      `}</style>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Centrum Wniosków</h1>
            <p className="text-zinc-400">Petycje, zgłoszenia napraw i sprawy pracownicze.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <Plus className="w-5 h-5" /> Złóż Wniosek
        </button>
      </div>

      <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-zinc-500 animate-pulse">Ładowanie wniosków...</div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
            <CheckCircle className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Brak wniosków w systemie.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const { docNumber, dateStr, signature, boardComment, body } = parseDocument(req.content, req.createdAt);
              return (
              <motion.div 
                key={req.id} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`p-6 border rounded-2xl transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between ${
                  req.status === 'PENDING' ? 'bg-zinc-900/80 border-amber-500/30' : 
                  req.status === 'APPROVED' ? 'bg-zinc-900/30 border-emerald-500/20 opacity-70' : 
                  'bg-zinc-900/30 border-red-500/20 opacity-50'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 bg-black/50 p-3 rounded-xl border border-white/5">
                    {getIcon(req.type)}
                  </div>
                  <div className="w-full">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white">{req.title}</h3>
                      {req.status === 'PENDING' && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/20 uppercase tracking-wider"><Clock className="w-3 h-3"/> Oczekuje</span>}
                      {req.status === 'APPROVED' && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20 uppercase tracking-wider"><CheckCircle className="w-3 h-3"/> Zatwierdzony</span>}
                      {req.status === 'REJECTED' && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/20 uppercase tracking-wider"><XCircle className="w-3 h-3"/> Odrzucony</span>}
                    </div>
                    
                    <div className="bg-[#f4f4f5] text-zinc-900 p-6 md:p-8 rounded-xl shadow-inner relative overflow-hidden my-4 max-w-full" style={{ fontFamily: "Arial, sans-serif" }}>
                      <div className="absolute top-0 left-0 w-full h-2 bg-emerald-700"></div>
                      
                      <div className="flex justify-between items-start mb-8 border-b border-zinc-300 pb-4">
                        <div className="flex items-center gap-3">
                          <img src="/logo-doc.png" alt="Bojar Logistic" className="w-12 object-contain" />
                          <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Proxima Nova', sans-serif" }}>BOJAR LOGISTIC</h1>
                            <p className="text-xs text-zinc-500 font-sans tracking-widest uppercase mt-1">Dokumentacja Wewnętrzna</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-zinc-700">{docNumber}</p>
                          <p className="text-xs text-zinc-500 font-sans mt-1">Wydano: {dateStr}</p>
                        </div>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-relaxed mb-12">{body}</p>

                      {signature && (
                        <div className="mt-8 border-t border-zinc-300 pt-6">
                          <div className="space-y-2 max-w-xs ml-auto">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-sans block text-center">Własnoręczny Podpis Cyfrowy</label>
                            <div className="w-full bg-transparent px-2 py-2 text-zinc-900 text-4xl text-center" style={{ fontFamily: "'Alex Brush', cursive" }}>
                              {signature}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {boardComment && (
                      <div className="bg-zinc-900 border border-white/10 p-4 rounded-xl mb-4 font-sans flex items-start gap-3">
                        <div className="bg-white/10 p-2 rounded-lg flex-shrink-0"><User className="w-4 h-4 text-white" /></div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Odpowiedź Zarządu</p>
                          <p className="text-sm text-zinc-200 whitespace-pre-wrap">{boardComment}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
                      <span>Wysłał: {req.user?.name}</span>
                      {req.cost > 0 && <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Faktura: {req.cost} zł</span>}
                      <span>Data w systemie: {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {isAdmin && req.status === 'PENDING' && (
                  <div className="flex flex-col gap-3 w-full md:w-48 shrink-0 md:pl-6 md:border-l border-white/5 mt-4 md:mt-0">
                    <button onClick={() => handleActionClick(req.id, 'APPROVE')} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      <CheckCircle className="w-4 h-4" /> Akceptuj
                    </button>
                    <button onClick={() => handleActionClick(req.id, 'REJECT')} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      <XCircle className="w-4 h-4" /> Odrzuć
                    </button>
                  </div>
                )}
              </motion.div>
            )})}
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmConfig && (
          <ConfirmModal
            isOpen={true}
            onClose={() => setConfirmConfig(null)}
            onConfirm={confirmConfig.onConfirm}
            title={confirmConfig.title}
            message={confirmConfig.message}
            confirmText="Zatwierdź"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {promptConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-2xl max-w-md w-full text-center">
              {promptConfig.action === 'APPROVE' ? (
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-bold text-white mb-2">{promptConfig.action === 'APPROVE' ? "Zatwierdzenie Wniosku" : "Odrzucenie Wniosku"}</h3>
              <p className="text-zinc-400 text-sm mb-4">Dodaj oficjalne uzasadnienie Zarządu (opcjonalnie), które pokaże się na dokumencie:</p>
              
              <textarea 
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                placeholder="Wpisz uzasadnienie..."
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white mb-6 focus:outline-none focus:border-indigo-500 resize-none h-24"
              />

              <div className="flex gap-3">
                <button onClick={() => setPromptConfig(null)} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-bold transition-colors">Anuluj</button>
                <button onClick={() => {
                  const { id, action } = promptConfig;
                  setPromptConfig(null);
                  executeAction(id, action, commentInput);
                }} className={`flex-1 py-2 text-white font-bold rounded-xl transition-colors shadow-lg ${promptConfig.action === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-red-600 hover:bg-red-500 shadow-red-500/20'}`}>Potwierdź</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <CreateRequestModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchRequests}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

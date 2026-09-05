"use client";
import { toast } from "sonner";

import { useState } from "react";
import { Bug, AlertTriangle } from "lucide-react";

export function BugReportButton() {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [bugTitle, setBugTitle] = useState("");
  const [bugDesc, setBugDesc] = useState("");
  const [bugImage, setBugImage] = useState("");
  const [bugSubmitting, setBugSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Plik jest za duży. Maksymalny rozmiar to 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBugImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBugSubmit = async (e) => {
    e.preventDefault();
    setBugSubmitting(true);
    try {
      const res = await fetch("/api/bugs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: bugTitle, description: bugDesc, imageUrl: bugImage })
      });
      if (res.ok) {
        setIsBugModalOpen(false);
        setBugTitle("");
        setBugDesc("");
        setBugImage("");
        toast.info("Zgłoszenie zostało wysłane. Dziękujemy!");
      } else {
        toast.error("Wystąpił błąd podczas wysyłania zgłoszenia.");
      }
    } catch (error) {
      toast.error("Błąd połączenia z serwerem.");
    } finally {
      setBugSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsBugModalOpen(true)}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center transition-transform hover:scale-110 z-[100] group"
        title="Zgłoś błąd"
      >
        <AlertTriangle className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-800 shadow-lg font-medium">
          Zgłoś błąd w systemie
        </span>
      </button>

      {isBugModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Zgłoś Błąd / Problem
            </h3>
            <form onSubmit={handleBugSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tytuł problemu</label>
                <input 
                  type="text"
                  required
                  value={bugTitle}
                  onChange={e => setBugTitle(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
                  placeholder="Krótki opis..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Szczegóły</label>
                <textarea 
                  required
                  value={bugDesc}
                  onChange={e => setBugDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-500 transition-shadow resize-none"
                  placeholder="Opisz, gdzie występuje problem i co nie działa..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  <span>Zrzut ekranu (opcjonalnie)</span>
                  {bugImage && <span className="text-green-500 text-xs font-bold">Załączono!</span>}
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-zinc-800 dark:file:text-zinc-300"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsBugModalOpen(false)}
                  className="flex-1 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg font-medium transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  type="submit"
                  disabled={bugSubmitting}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {bugSubmitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

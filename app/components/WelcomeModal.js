"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Truck, CreditCard, Award, AlertCircle, Check, X, Wrench } from "lucide-react";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bms_v4_welcome_count");
      const count = stored ? parseInt(stored, 10) : 0;

      if (count < 3) {
        setDisplayCount(count + 1);
        setIsOpen(true);
      }
    } catch (e) {
      console.error("LocalStorage error:", e);
    }
  }, []);

  const handleClose = () => {
    try {
      const stored = localStorage.getItem("bms_v4_welcome_count");
      const count = stored ? parseInt(stored, 10) : 0;
      localStorage.setItem("bms_v4_welcome_count", (count + 1).toString());
    } catch (e) {
      console.error("LocalStorage save error:", e);
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-zinc-950 border border-zinc-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-zinc-100 overflow-hidden"
        >
          {/* Subtle White-Gray Ambient Accent */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-zinc-400/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          {/* Nagłówek Modal w Odcieniach Szarości i Bieli */}
          <div className="flex justify-between items-start mb-6 relative z-10 border-b border-zinc-800 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles className="w-6 h-6 text-zinc-200" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-black tracking-tight text-white">Witamy w BMS wersja 4.0!</h2>
                  <span className="bg-zinc-100 text-zinc-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-widest">
                    v4.0
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">Oficjalne ogłoszenie dla całego zespołu VTC</p>
              </div>
            </div>

            <button 
              onClick={handleClose}
              className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Główna Treść Ogłoszenia */}
          <div className="space-y-5 text-xs text-zinc-300 relative z-10 max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-sm font-medium text-zinc-200 leading-relaxed">
              Bardzo się cieszę, że po intensywnej pracy mogę oficjalnie wydać nową wersję systemu. <strong className="text-white">BMS 4.0</strong> to kluczowy krok w rozwoju naszej wirtualnej firmy!
            </p>

            {/* Kluczowe Punkty */}
            <div className="space-y-2.5 pt-1">
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">Najważniejsze Zmiany i Nowości:</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-3 items-start">
                  <Sparkles className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white mb-0.5">Zupełnie Nowy Widok Systemu</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">Przebudowany, odświeżony i nowoczesny interfejs w ciemnej kolorystyce.</p>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-3 items-start">
                  <ShieldCheck className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white mb-0.5">Rozbudowane Profile</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">Integracja z social mediami (TrucksBook, Steam, Discord, Facebook).</p>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-3 items-start">
                  <Award className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white mb-0.5">Skrócone Egzaminy</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">Dopracowane i zoptymalizowane testy teoretyczne C+E oraz lekarskie.</p>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-3 items-start">
                  <Wrench className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white mb-0.5">Naprawione Błędy</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">Usunięte dotychczasowe usterki oraz usprawniona płynność działania.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informacja o zgłaszaniu błędów */}
            <div className="bg-zinc-900/90 border border-zinc-700/60 p-4 rounded-2xl flex items-start gap-3 text-zinc-300">
              <AlertCircle className="w-5 h-5 text-zinc-200 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold mb-0.5 text-xs text-white uppercase tracking-wider">Zgłaszanie Ewentualnych Błędów</h4>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  Ze względu na potężny zakres zmian w wersji 4.0 mogą sporadycznie wystąpić drobne błędy. Bardzo proszę o ich natychmiastowe zgłaszanie do Zarządu – będziemy je na bieżąco usuwać.
                </p>
              </div>
            </div>

            {/* Podpis Właściciela */}
            <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-xs">
              <div>
                <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Życzę udanej pracy w nowym panelu!</p>
                <p className="font-extrabold text-white text-sm mt-0.5">Właściciel firmy Arkadiusz</p>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">BMS v4.0</span>
            </div>
          </div>

          {/* Dół Modal - Przycisk Zrozumiałem w kolorystyce Biało-Szarej */}
          <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3 relative z-10">
            <span className="text-[11px] text-zinc-500 font-semibold">
              Komunikat wyświetla się przez 3 pierwsze zalogowania (<strong className="text-white">{displayCount}</strong> z <strong className="text-zinc-400">3</strong>).
            </span>

            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Zrozumiałem</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

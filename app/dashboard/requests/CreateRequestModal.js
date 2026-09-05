"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, CheckCircle, AlertTriangle, Calendar, Truck, User, DollarSign, PenTool, Hash } from "lucide-react";
import { useSession } from "next-auth/react";

const REQUEST_TYPES = [
  { id: "VACATION", label: "Wniosek urlopowy", icon: Calendar },
  { id: "VACATION_EXTENSION", label: "Przedłużenie urlopu", icon: Calendar },
  { id: "TRUCK_CHANGE", label: "Zmiana ciągnika siodłowego", icon: Truck },
  { id: "TRAILER_CHANGE", label: "Zmiana naczepy", icon: Truck },
  { id: "PROMOTION", label: "Wniosek o awans", icon: User },
  { id: "RAISE", label: "Wniosek o podwyżkę", icon: DollarSign },
  { id: "FEATURE_PROPOSAL", label: "Propozycja nowej funkcji/zmian", icon: PenTool },
  { id: "PENALTY_APPEAL", label: "Odwołanie od kary", icon: AlertTriangle },
  { id: "COMPLAINT", label: "Skarga / Zgłoszenie na współpracownika", icon: FileText },
];

export function CreateRequestModal({ isOpen, onClose, onSuccess }) {
  const { data: session } = useSession();
  const user = session?.user;

  const [step, setStep] = useState(1);
  const [type, setType] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [fleetInfo, setFleetInfo] = useState(null);
  const [fleetLoading, setFleetLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    if (type === "TRUCK_CHANGE") {
      setFleetLoading(true);
      fetch("/api/requests/fleet-info")
        .then(res => res.json())
        .then(data => {
          setFleetInfo(data);
          setFleetLoading(false);
        });
    }
  }, [type]);

  useEffect(() => {
    if (isOpen) {
      const randomNum = Math.floor(Math.random() * 900) + 100;
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      setDocNumber(`WN/${month.toString().padStart(2, '0')}/${year}/${randomNum}`);
      setStep(1);
      setType("");
      setFormData({});
      setError("");
    }
  }, [isOpen]);

  const handleNext = () => {
    if (step === 1 && !type) {
      setError("Wybierz typ wniosku!");
      return;
    }
    
    // Walidacja URLOPU
    if (step === 2 && (type === "VACATION" || type === "VACATION_EXTENSION")) {
      const { startDate, endDate } = formData;
      if (!startDate || !endDate) {
        setError("Wypełnij daty urlopu.");
        return;
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      
      const diffTime = Math.abs(start - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 3) {
        setError("Zgodnie z §5.7, wniosek urlopowy należy złożyć z min. 3-dniowym wyprzedzeniem.");
        return;
      }
      
      const lastDayOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      const daysToMonthEnd = Math.ceil(Math.abs(lastDayOfMonth - start) / (1000 * 60 * 60 * 24));
      
      if (daysToMonthEnd <= 7) {
        setError("Zgodnie z §5.4, zakazuje się wypisywania urlopu na kilka dni przed końcem miesiąca w celu uniknięcia limitu km.");
        return;
      }
      
      const duration = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
      if (duration < 16) {
        setConfirmDialog({
          message: "Twój urlop trwa krócej niż 16 dni. Zgodnie z §5.3, masz obowiązek wyrobienia limitu km. Akceptujesz?",
          onConfirm: () => {
            setConfirmDialog(null);
            setError("");
            setStep(step + 1);
          }
        });
        return;
      }
    }

    if (step === 2 && type === "TRUCK_CHANGE") {
      if (!formData.requestedTruckName) {
        setError("Musisz wybrać pojazd z floty lub wpisać własną propozycję.");
        return;
      }

      if (fleetInfo?.currentTruck?.assignedAt) {
        const isScaniaRekrutowa = fleetInfo.currentTruck.brand.toLowerCase().includes("scania");
        const requiredDays = isScaniaRekrutowa ? 30 : 90;
        const daysPassed = Math.floor((new Date() - new Date(fleetInfo.currentTruck.assignedAt)) / (1000 * 60 * 60 * 24));
        if (daysPassed < requiredDays) {
          setConfirmDialog({
            message: `Posiadasz ten zestaw dopiero ${daysPassed} dni. Wymagany czas to min. ${requiredDays} dni. Czy na pewno chcesz wysłać wniosek?`,
            onConfirm: () => {
              setConfirmDialog(null);
              setError("");
              setStep(step + 1);
            }
          });
          return;
        }
      }
    }
    
    if (step === 2 && (!formData.reason && type !== "VACATION" && type !== "VACATION_EXTENSION")) {
       setError("Proszę wypełnić wymagane pola.");
       return;
    }

    if (step === 3 && !formData.signature) {
       setError("Musisz podpisać wniosek!");
       return;
    }

    setError("");
    setStep(step + 1);
  };

  const generateDocumentText = () => {
    const dateStr = new Date().toLocaleDateString('pl-PL');
    let content = `DOKUMENT NR: ${docNumber}\nDATA ZŁOŻENIA: ${dateStr}\nWNIOSKODAWCA: ${user?.name || "Nieznany"} (Ranga: ${user?.rank || "Kierowca"})\n\n`;
    
    const typeLabel = REQUEST_TYPES.find(t => t.id === type)?.label.toUpperCase();
    content += `TYP PISMA: ${typeLabel}\n`;
    content += `=================================================\n\n`;
    
    content += `Ja, niżej podpisany ${user?.name || "Kierowca"}, wnoszę o rozpatrzenie poniższego wniosku.\n\n`;

    if (type === "VACATION" || type === "VACATION_EXTENSION") {
      content += `TERMIN URLOPU: od ${formData.startDate} do ${formData.endDate}\n`;
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const duration = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
      content += `CZAS TRWANIA: ${duration} dni\n`;
      content += `UZASADNIENIE: ${formData.reason || "Brak dodatkowego uzasadnienia"}\n\n`;
      content += `Oświadczam, że zapoznałem się z Regulaminem §5 (Urlopy), w szczególności z obowiązkiem wyrobienia limitów kilometrów.\n\n`;
    } 
    else if (type === "COMPLAINT") {
      content += `Zgłaszam uchybienia/naruszenia regulaminu przez pracownika: ${formData.targetUser}\n`;
      content += `Data zdarzenia: ${formData.incidentDate}\n\n`;
      content += `OPIS ZDARZENIA (SZCZEGÓŁOWY):\n${formData.reason}\n\n`;
      content += `Świadomy odpowiedzialności za składanie fałszywych doniesień, poświadczam prawdziwość powyższych informacji.\n\n`;
    }
    else if (type === "TRUCK_CHANGE") {
      content += `OBECNY ZESTAW:\n`;
      if (fleetInfo?.currentTruck) {
        const assignedAt = fleetInfo.currentTruck.assignedAt;
        const daysPassed = assignedAt ? Math.floor((new Date() - new Date(assignedAt)) / (1000 * 60 * 60 * 24)) : 0;
        content += `${fleetInfo.currentTruck.brand} ${fleetInfo.currentTruck.model} (${fleetInfo.currentTruck.plate})\n`;
        content += `Czas posiadania: ${assignedAt ? `${daysPassed} dni` : "Brak danych"}\n\n`;
      } else {
        content += `Brak przypisanego ciągnika.\n\n`;
      }
      content += `OCZEKIWANY ZESTAW:\n${formData.requestedTruckName || "Brak"}\n\n`;
      content += `UZASADNIENIE ZMIANY:\n${formData.reason || "Brak uzasadnienia"}\n\n`;
    }
    else if (type === "PROMOTION" || type === "RAISE") {
      content += `Oczekiwana zmiana: ${formData.expectedValue}\n\n`;
      content += `UZASADNIENIE (osiągnięcia, zaangażowanie):\n${formData.reason}\n\n`;
    }
    else {
      content += `SZCZEGÓŁY WNIOSKU:\n${formData.reason}\n\n`;
    }

    content += `=================================================\n`;
    content += `PODPIS CYFROWY: /s/ ${formData.signature}\n`;
    
    return content;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const documentContent = generateDocumentText();
      const title = `${docNumber} - ${REQUEST_TYPES.find(t => t.id === type)?.label}`;

      const res = await fetch("/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, content: documentContent }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Wystąpił błąd");
      }
    } catch (e) {
      setError("Błąd połączenia z serwerem.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap');
      `}</style>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Złóż Wniosek</h2>
              <p className="text-xs text-zinc-400">Centrum Dokumentacji Formalnej</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {confirmDialog && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm rounded-2xl">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl shadow-2xl max-w-sm text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Potrzebne Potwierdzenie</h3>
                <p className="text-zinc-400 text-sm mb-6">{confirmDialog.message}</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmDialog(null)} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-bold transition-colors">Anuluj</button>
                  <button onClick={confirmDialog.onConfirm} className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl text-white font-bold transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">Zgadzam się</button>
                </div>
              </motion.div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">1. Wybierz rodzaj dokumentu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {REQUEST_TYPES.map((req) => {
                  const Icon = req.icon;
                  return (
                    <button
                      key={req.id}
                      onClick={() => { setType(req.id); setError(""); }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        type === req.id
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                          : "bg-zinc-900/50 border-white/5 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-sm">{req.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">2. Wypełnij szczegóły wniosku</h3>
              
              <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-xl space-y-5">
                {(type === "VACATION" || type === "VACATION_EXTENSION") && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Data rozpoczęcia</label>
                        <input
                          type="date"
                          value={formData.startDate || ""}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Data zakończenia</label>
                        <input
                          type="date"
                          value={formData.endDate || ""}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <h4 className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Przypomnienie z Regulaminu (§5)</h4>
                      <ul className="text-xs text-amber-500/80 list-disc list-inside space-y-1">
                        <li>Wniosek należy złożyć z min. 3-dniowym wyprzedzeniem.</li>
                        <li>Zakaz urlopów pod koniec miesiąca dla uniknięcia limitu.</li>
                        <li>Jeśli urlop trwa krócej niż 16 dni - limit km wciąż obowiązuje!</li>
                      </ul>
                    </div>
                  </>
                )}

                {type === "COMPLAINT" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Kogo dotyczy zgłoszenie?</label>
                        <input
                          type="text"
                          placeholder="Imię/Nick kierowcy"
                          value={formData.targetUser || ""}
                          onChange={(e) => setFormData({ ...formData, targetUser: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Data zdarzenia</label>
                        <input
                          type="date"
                          value={formData.incidentDate || ""}
                          onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </>
                )}

                {(type === "PROMOTION" || type === "RAISE") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Oczekiwana kwota / stanowisko</label>
                    <input
                      type="text"
                      placeholder={type === "RAISE" ? "np. 0.50 zł/km" : "np. Doświadczony Kierowca"}
                      value={formData.expectedValue || ""}
                      onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                )}

                {type === "TRUCK_CHANGE" && fleetLoading && <p className="text-zinc-400 text-sm">Ładowanie floty...</p>}
                {type === "TRUCK_CHANGE" && !fleetLoading && fleetInfo && (
                  <>
                    <div className="bg-black/50 border border-white/10 p-4 rounded-xl">
                      <h4 className="text-sm font-bold text-white mb-2">Twój obecny zestaw</h4>
                      {fleetInfo.currentTruck ? (
                        <div className="text-sm text-zinc-400">
                          <p>Pojazd: {fleetInfo.currentTruck.brand} {fleetInfo.currentTruck.model} ({fleetInfo.currentTruck.plate})</p>
                          {(() => {
                            const assignedAt = fleetInfo.currentTruck.assignedAt;
                            const isScania = fleetInfo.currentTruck.brand.toLowerCase().includes("scania");
                            const requiredDays = isScania ? 30 : 90;
                            const daysPassed = assignedAt ? Math.floor((new Date() - new Date(assignedAt)) / (1000 * 60 * 60 * 24)) : 0;
                            const canChange = assignedAt ? daysPassed >= requiredDays : true;
                            
                            return (
                              <>
                                <p>Data przypisania: {assignedAt ? new Date(assignedAt).toLocaleDateString() : "Brak danych"}</p>
                                <p>Czas posiadania: <span className={canChange ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{assignedAt ? `${daysPassed} dni` : "N/A"}</span> (Wymagane: {requiredDays} dni)</p>
                                {!canChange && (
                                  <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2 text-amber-400 text-xs">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    <p>Czas minimalny jeszcze nie minął! Twój wniosek może zostać odrzucony.</p>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-400">Brak przypisanego ciągnika.</p>
                      )}
                    </div>
              
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Wybierz ciągnik z wolnej floty</label>
                        <select
                          value={formData.requestedTruckId || ""}
                          onChange={(e) => setFormData({ ...formData, requestedTruckId: e.target.value, requestedTruckName: e.target.options[e.target.selectedIndex].text })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition-colors"
                        >
                          <option value="">-- Wybierz (lub wpisz propozycję poniżej) --</option>
                          {fleetInfo.availableTrucks?.map(t => (
                            <option key={t.id} value={t.id}>{t.brand} {t.model} ({t.plate}) - {t.power}KM</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Lub podaj własną propozycję nowego zestawu</label>
                        <input
                          type="text"
                          placeholder="np. Scania S500, rocznik 2023..."
                          value={formData.requestedTruckName || ""}
                          onChange={(e) => setFormData({ ...formData, requestedTruckName: e.target.value, requestedTruckId: "" })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    {type === "COMPLAINT" ? "Szczegółowy opis zdarzenia" : 
                     (type === "PROMOTION" || type === "RAISE") ? "Solidne uzasadnienie wniosku" : 
                     "Dodatkowe informacje / Uzasadnienie"}
                  </label>
                  <textarea
                    rows={6}
                    value={formData.reason || ""}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors resize-none font-mono text-sm"
                    placeholder="Wprowadź treść..."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">3. Weryfikacja i Podpis</h3>
              
              <div className="bg-[#f4f4f5] text-zinc-900 p-8 rounded-xl shadow-inner relative overflow-hidden" style={{ fontFamily: "Arial, sans-serif" }}>
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
                    <p className="text-xs text-zinc-500 font-sans mt-1">Wydano: {new Date().toLocaleDateString('pl-PL')}</p>
                  </div>
                </div>

                <div className="whitespace-pre-wrap text-sm leading-relaxed mb-12">
                  {generateDocumentText().split('=================================================')[1]?.trim() || "Błąd podglądu."}
                </div>

                <div className="mt-8 border-t border-zinc-300 pt-6">
                  <div className="space-y-2 max-w-xs ml-auto">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-sans">Własnoręczny Podpis Cyfrowy</label>
                    <input
                      type="text"
                      placeholder="Wpisz swoje Imię i Nazwisko"
                      value={formData.signature || ""}
                      onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-zinc-400 border-dashed px-2 py-2 text-zinc-900 focus:border-emerald-600 outline-none text-4xl text-center placeholder:text-zinc-300 placeholder:text-lg placeholder:font-sans"
                      style={{ fontFamily: "'Alex Brush', cursive" }}
                    />
                    <p className="text-[10px] text-zinc-400 font-sans">Złożenie podpisu jest równoznaczne z poświadczeniem prawdy.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-zinc-900/50 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2.5 text-zinc-400 hover:text-white font-medium transition-colors"
            >
              Wróć
            </button>
          ) : <div></div>}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-8 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Dalej
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Przesyłanie..." : "Złóż Wniosek"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

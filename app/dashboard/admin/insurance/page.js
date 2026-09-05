"use client";
import { toast } from "sonner";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Plus, Car, Truck, CreditCard, CheckCircle, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "../../../components/ConfirmModal";

export default function InsurancePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState({ insurances: [], trucks: [], trailers: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: "OC/AC/Assistance", yearlyCost: "", validUntil: "", targetType: "truck", targetId: "" });
  const [payingId, setPayingId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  useEffect(() => {
    if (session?.user?.role && !["OWNER", "BOARD"].includes(session.user.role)) {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [session, router]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/finance/insurance");
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: formData.type,
        yearlyCost: parseFloat(formData.yearlyCost),
        validUntil: formData.validUntil,
        truckId: formData.targetType === "truck" ? formData.targetId : null,
        trailerId: formData.targetType === "trailer" ? formData.targetId : null,
      };

      const res = await fetch("/api/finance/insurance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error("Błąd: " + d.error);
      }
    } catch (err) {
      toast.error("Błąd zapisu.");
    }
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const handlePay = (ins) => {
    setConfirmConfig({
      title: "Opłać Składkę Miesięczną",
      message: `Czy opłacić składkę za bieżący miesiąc (${currentMonth}/${currentYear}) w kwocie ${ins.monthlyRate.toLocaleString()} zł?`,
      onConfirm: async () => {
        setPayingId(ins.id);
        try {
          const res = await fetch(`/api/finance/insurance/${ins.id}/pay`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ month: currentMonth, year: currentYear })
          });
          const d = await res.json();
          if (d.success) {
            toast.success("Składka opłacona pomyślnie.");
            fetchData();
          } else {
            toast.error(d.error);
          }
        } catch(e) {
          toast.error("Błąd serwera.");
        } finally {
          setPayingId(null);
        }
      }
    });
  };

  if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse">Ładowanie ubezpieczeń...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ubezpieczenia Floty</h1>
          <p className="text-zinc-500 mt-1">Zarządzanie polisami i opłacanie miesięcznych składek zestawów.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-white/5 transition-colors"
        >
          <Plus className="w-5 h-5" /> Dodaj Polisę
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.insurances.map((ins) => {
          const target = ins.truck || ins.trailer;
          const isTruck = !!ins.truck;
          const isPaidThisMonth = ins.payments.some(p => p.month === currentMonth && p.year === currentYear);

          return (
            <div key={ins.id} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                    {isTruck ? <Truck className="w-6 h-6 text-zinc-400" /> : <Car className="w-6 h-6 text-zinc-400" />}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">{target?.plate || "Nieznany"}</p>
                    <p className="text-xs text-zinc-500 uppercase">{isTruck ? "Ciągnik" : "Naczepa"}</p>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg mb-1">{ins.type}</h3>
                <p className="text-zinc-400 text-sm mb-4">Ważne do: <span className="text-white font-medium">{new Date(ins.validUntil).toLocaleDateString("pl-PL")}</span></p>

                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Składka miesięczna</p>
                    <p className="font-bold text-red-400">{ins.monthlyRate.toLocaleString()} zł</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 mb-1">Koszt roczny</p>
                    <p className="font-bold text-zinc-300">{ins.yearlyCost.toLocaleString()} zł</p>
                  </div>
                </div>
              </div>

              <div>
                {isPaidThisMonth ? (
                  <div className="w-full flex items-center justify-center gap-2 py-3 bg-green-500/10 text-green-500 rounded-xl font-bold text-sm">
                    <CheckCircle className="w-4 h-4" /> Opłacono w tym miesiącu
                  </div>
                ) : (
                  <button 
                    onClick={() => handlePay(ins)}
                    disabled={payingId === ins.id}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20"
                  >
                    {payingId === ins.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Opłać {currentMonth}/{currentYear}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {data.insurances.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-500 bg-zinc-950 border border-zinc-800 rounded-3xl">
            Brak ubezpieczeń. Kliknij "Dodaj Polisę", aby rozpocząć rejestrowanie kosztów.
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-6">Dodaj Polisę</h2>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Pojazd</label>
                  <div className="flex gap-2 mb-2">
                    <button type="button" onClick={() => setFormData({...formData, targetType: "truck", targetId: ""})} className={`flex-1 py-2 text-sm rounded-lg border font-medium ${formData.targetType === "truck" ? "bg-zinc-800 border-zinc-600 text-white" : "bg-transparent border-zinc-800 text-zinc-500"}`}>Ciągnik</button>
                    <button type="button" onClick={() => setFormData({...formData, targetType: "trailer", targetId: ""})} className={`flex-1 py-2 text-sm rounded-lg border font-medium ${formData.targetType === "trailer" ? "bg-zinc-800 border-zinc-600 text-white" : "bg-transparent border-zinc-800 text-zinc-500"}`}>Naczepa</button>
                  </div>
                  <select required value={formData.targetId} onChange={e => setFormData({...formData, targetId: e.target.value})} className="w-full p-4 bg-black/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-500">
                    <option value="">Wybierz...</option>
                    {formData.targetType === "truck" 
                      ? data.trucks.map(t => <option key={t.id} value={t.id}>{t.brand} {t.model} ({t.plate})</option>)
                      : data.trailers.map(t => <option key={t.id} value={t.id}>{t.brand} {t.type} ({t.plate})</option>)
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Typ Ubezpieczenia</label>
                  <input required type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-4 bg-black/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-500" placeholder="Np. OC/AC/Assistance" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Koszt Roczny (PLN)</label>
                  <input required type="number" step="0.01" value={formData.yearlyCost} onChange={e => setFormData({...formData, yearlyCost: e.target.value})} className="w-full p-4 bg-black/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-500" placeholder="Np. 24000" />
                  <p className="text-xs text-zinc-500 mt-1">Składka miesięczna obliczy się automatycznie (/{12})</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Ważne do</label>
                  <input required type="date" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} className="w-full p-4 bg-black/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-500" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 font-bold rounded-xl text-white transition-colors">Anuluj</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-white transition-colors">Zapisz</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmConfig && (
          <ConfirmModal
            isOpen={true}
            onClose={() => setConfirmConfig(null)}
            onConfirm={confirmConfig.onConfirm}
            title={confirmConfig.title}
            message={confirmConfig.message}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

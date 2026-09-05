"use client";
import { toast } from "sonner";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, ChevronDown, ChevronUp, CheckCircle, XCircle, CreditCard, RefreshCw, Plus, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "../../../components/ConfirmModal";

export default function LeasingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [leasings, setLeasings] = useState([]);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [payingMonth, setPayingMonth] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    truckId: "",
    totalValue: "",
    monthlyRate: "",
    buyoutPrice: "",
    totalCost: "",
    installmentsTotal: 24,
    startDate: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    if (session?.user?.role && !["OWNER", "BOARD"].includes(session.user.role)) {
      router.push("/dashboard");
      return;
    }
    fetchLeasings();
    fetchAvailableTrucks();
  }, [session, router]);

  const fetchLeasings = async () => {
    try {
      const res = await fetch("/api/finance/leasing");
      const data = await res.json();
      if (data.leasings) setLeasings(data.leasings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTrucks = async () => {
    try {
      const res = await fetch("/api/fleet");
      const data = await res.json();
      // Filtruj ciężarówki które nie mają jeszcze leasingu
      if (data.trucks) {
        setAvailableTrucks(data.trucks);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateLeasing = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/finance/leasing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalValue: Number(formData.totalValue),
          monthlyRate: Number(formData.monthlyRate),
          buyoutPrice: Number(formData.buyoutPrice),
          totalCost: Number(formData.totalCost),
          installmentsTotal: Number(formData.installmentsTotal)
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Leasing dodany pomyślnie!");
        setIsAddModalOpen(false);
        setFormData({
          truckId: "", totalValue: "", monthlyRate: "", buyoutPrice: "", totalCost: "", installmentsTotal: 24, startDate: new Date().toISOString().split("T")[0]
        });
        fetchLeasings();
      } else {
        toast.error("Błąd: " + data.error);
      }
    } catch (e) {
      toast.error("Wystąpił błąd");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDeleteLeasing = async (leasingId) => {
    try {
      const res = await fetch(`/api/finance/leasing/${leasingId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchLeasings();
      } else {
        toast.error("Błąd: " + data.error);
      }
    } catch (e) {
      toast.error("Wystąpił błąd");
    }
  };

  const handleDeleteLeasing = (leasingId) => {
    setConfirmConfig({
      title: "Usuń leasing",
      message: "Czy na pewno chcesz usunąć ten leasing? Zostaną usunięte również historie jego wpłat! (Kwoty na saldzie firmy NIE zostaną cofnięte).",
      onConfirm: () => executeDeleteLeasing(leasingId)
    });
  };

  const executePay = async (leasingId, month, year) => {
    setPayingMonth(`${leasingId}-${month}-${year}`);
    try {
      const res = await fetch("/api/finance/leasing/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leasingId, month, year })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Rata opłacona pomyślnie!");
        fetchLeasings();
      } else {
        toast.error("Błąd: " + data.error);
      }
    } catch (e) {
      toast.error("Wystąpił błąd");
    } finally {
      setPayingMonth(null);
    }
  };

  const handlePay = (leasingId, month, year) => {
    setConfirmConfig({
      title: "Opłać ratę",
      message: `Czy na pewno chcesz opłacić ratę za ${month}/${year}? Środki zostaną pobrane z konta firmowego.`,
      onConfirm: () => executePay(leasingId, month, year)
    });
  };

  const generateInstallments = (leasing) => {
    const installments = [];
    const start = new Date(leasing.startDate);
    
    for (let i = 0; i < leasing.installmentsTotal; i++) {
      const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const isPaid = leasing.payments.some(p => p.month === date.getMonth() + 1 && p.year === date.getFullYear());
      installments.push({
        index: i + 1,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        dateLabel: date.toLocaleDateString("pl-PL", { month: "long", year: "numeric" }),
        isPaid
      });
    }
    return installments;
  };

  if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse">Ładowanie zarządzania leasingami...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zarządzanie Leasingami</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Pełna kontrola nad kredytowaniem pojazdów floty BMS.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Dodaj Leasing
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-zinc-800">Model</th>
                <th className="p-4 font-semibold border-b border-zinc-800">Rejestracja</th>
                <th className="p-4 font-semibold border-b border-zinc-800 text-right">Wartość Auta</th>
                <th className="p-4 font-semibold border-b border-zinc-800 text-right">Rata Mies.</th>
                <th className="p-4 font-semibold border-b border-zinc-800 text-right">Wykup</th>
                <th className="p-4 font-semibold border-b border-zinc-800 text-right">Łączny Koszt</th>
                <th className="p-4 font-semibold border-b border-zinc-800 text-center">Raty</th>
                <th className="p-4 font-semibold border-b border-zinc-800 text-center">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {leasings.map((leasing) => {
                const installments = generateInstallments(leasing);
                const isExpanded = expandedId === leasing.id;
                
                return (
                  <React.Fragment key={leasing.id}>
                    <tr className="hover:bg-zinc-900/50 transition-colors text-zinc-300">
                      <td className="p-4 font-medium text-white">{leasing.truck.brand} {leasing.truck.model}</td>
                      <td className="p-4">{leasing.truck.plate}</td>
                      <td className="p-4 text-right">{leasing.totalValue.toLocaleString()} zł</td>
                      <td className="p-4 text-right text-red-400 font-semibold">{leasing.monthlyRate.toLocaleString()} zł</td>
                      <td className="p-4 text-right">{leasing.buyoutPrice.toLocaleString()} zł</td>
                      <td className="p-4 text-right text-zinc-400">{leasing.totalCost.toLocaleString()} zł</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => setExpandedId(isExpanded ? null : leasing.id)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1"
                        >
                          {leasing.payments.length} / {leasing.installmentsTotal} 
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDeleteLeasing(leasing.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Usuń Leasing">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-zinc-900/30">
                        <td colSpan="8" className="p-0">
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: "auto" }} 
                            className="p-6 border-b border-zinc-800"
                          >
                            <h4 className="font-bold text-white mb-4">Harmonogram spłat:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                              {installments.map((inst, idx) => {
                                const isNextToPay = !inst.isPaid && (idx === 0 || installments[idx - 1].isPaid);
                                const isPayingThis = payingMonth === `${leasing.id}-${inst.month}-${inst.year}`;

                                return (
                                  <div key={idx} className={`p-3 rounded-xl border flex justify-between items-center ${inst.isPaid ? 'bg-green-950/20 border-green-900/30' : (isNextToPay ? 'bg-blue-950/20 border-blue-900/50' : 'bg-zinc-900 border-zinc-800')}`}>
                                    <div>
                                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Rata {inst.index}</span>
                                      <p className={`font-medium capitalize text-sm ${inst.isPaid ? 'text-green-500' : 'text-zinc-300'}`}>
                                        {inst.dateLabel}
                                      </p>
                                    </div>
                                    
                                    {inst.isPaid ? (
                                      <div className="bg-green-900/30 text-green-500 p-1.5 rounded-lg" title="Opłacone">
                                        <CheckCircle className="w-4 h-4" />
                                      </div>
                                    ) : isNextToPay ? (
                                      <button 
                                        onClick={() => handlePay(leasing.id, inst.month, inst.year)}
                                        disabled={isPayingThis}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
                                      >
                                        {isPayingThis ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                                        Opłać
                                      </button>
                                    ) : (
                                      <div className="bg-zinc-800 text-zinc-500 p-1.5 rounded-lg" title="Nieopłacone">
                                        <XCircle className="w-4 h-4" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {leasings.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-zinc-500">Brak aktywnych leasingów.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dodawania Leasingu */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6">Dodaj Nowy Leasing</h2>
              
              <form onSubmit={handleCreateLeasing} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Ciężarówka (Musi być zapisana w flocie)</label>
                  <select required value={formData.truckId} onChange={(e) => setFormData({...formData, truckId: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white">
                    <option value="">Wybierz ciągnik...</option>
                    {availableTrucks.filter(t => !leasings.find(l => l.truckId === t.id)).map(truck => (
                      <option key={truck.id} value={truck.id}>{truck.brand} {truck.model} ({truck.plate})</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Wartość Auta (PLN)</label>
                    <input required type="number" step="0.01" value={formData.totalValue} onChange={(e) => setFormData({...formData, totalValue: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Rata Miesięczna (PLN)</label>
                    <input required type="number" step="0.01" value={formData.monthlyRate} onChange={(e) => setFormData({...formData, monthlyRate: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Wykup (PLN)</label>
                    <input required type="number" step="0.01" value={formData.buyoutPrice} onChange={(e) => setFormData({...formData, buyoutPrice: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Łączny Koszt (PLN)</label>
                    <input required type="number" step="0.01" value={formData.totalCost} onChange={(e) => setFormData({...formData, totalCost: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Liczba Rat</label>
                    <input required type="number" value={formData.installmentsTotal} onChange={(e) => setFormData({...formData, installmentsTotal: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Miesiąc Startu (Data)</label>
                    <input required type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
                  </div>
                </div>

                <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg mt-4 disabled:opacity-50 transition-colors">
                  {isSubmitting ? "Zapisywanie..." : "Dodaj Leasing"}
                </button>
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

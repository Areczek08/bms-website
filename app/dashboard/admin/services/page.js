"use client";
import { toast } from "sonner";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, CheckCircle, CreditCard, RefreshCw, AlertTriangle, Disc } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "../../../components/ConfirmModal";

export default function ServicesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  useEffect(() => {
    if (session?.user?.role && !["OWNER", "BOARD"].includes(session.user.role)) {
      router.push("/dashboard");
      return;
    }
    fetchInvoices();
  }, [session, router]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/finance/services");
      const data = await res.json();
      if (data.invoices) setInvoices(data.invoices);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const executePay = async (id) => {
    setPayingId(id);
    try {
      const res = await fetch(`/api/finance/services/${id}/pay`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Faktura opłacona pomyślnie!");
        fetchInvoices();
      } else {
        toast.error("Błąd: " + data.error);
      }
    } catch (e) {
      toast.error("Wystąpił błąd połączenia");
    } finally {
      setPayingId(null);
    }
  };

  const handlePay = (invoice) => {
    setConfirmConfig({
      title: "Opłać Fakturę Serwisową",
      message: `Czy na pewno chcesz opłacić fakturę za ${invoice.title} w kwocie ${invoice.amount.toLocaleString()} zł? Środki zostaną pobrane z konta firmowego.`,
      onConfirm: () => executePay(invoice.id)
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case "TIRES": return <Disc className="w-5 h-5 text-blue-500" />;
      case "BREAKDOWN": return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "SERVICE": return <Wrench className="w-5 h-5 text-amber-500" />;
      default: return <Wrench className="w-5 h-5 text-zinc-500" />;
    }
  };

  if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse">Ładowanie rachunków...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Akceptacja Kosztów (Eksploatacja)</h1>
          <p className="text-zinc-500 mt-1">Opłacaj awarie, serwisy okresowe i zużycie opon zgłaszane przez system.</p>
        </div>
        <button 
          onClick={fetchInvoices}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors border border-white/5"
        >
          <RefreshCw className="w-5 h-5" /> Odśwież
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-zinc-800">Tytuł</th>
                <th className="p-4 font-semibold border-b border-zinc-800">Pojazd</th>
                <th className="p-4 font-semibold border-b border-zinc-800 text-right">Kwota</th>
                <th className="p-4 font-semibold border-b border-zinc-800 text-center">Data Zgłoszenia</th>
                <th className="p-4 font-semibold border-b border-zinc-800 text-center">Status / Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-900/50 transition-colors text-zinc-300">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-900 rounded-lg border border-white/5">
                        {getIcon(inv.type)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{inv.title}</p>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1 max-w-sm">{inv.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {inv.truck ? (
                      <div>
                        <p className="text-sm font-bold text-zinc-300">{inv.truck.brand} {inv.truck.model}</p>
                        <p className="text-xs text-zinc-500">{inv.truck.plate}</p>
                      </div>
                    ) : (
                      <span className="text-zinc-500">Brak powiązania</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-bold text-red-400">{inv.amount.toLocaleString()} zł</span>
                  </td>
                  <td className="p-4 text-center text-sm text-zinc-400">
                    {new Date(inv.date).toLocaleDateString("pl-PL")}
                  </td>
                  <td className="p-4 text-center">
                    {inv.status === "PAID" ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/10 text-green-500">
                        <CheckCircle className="w-4 h-4" /> Opłacono
                      </div>
                    ) : (
                      <button 
                        onClick={() => handlePay(inv)}
                        disabled={payingId === inv.id}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-2 shadow-lg shadow-blue-500/20"
                      >
                        {payingId === inv.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Opłać
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-zinc-500">Brak faktur serwisowych.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

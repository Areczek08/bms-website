"use client";
import { toast } from "sonner";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, UserX, Clock, Truck, ShieldCheck, Mail, Calendar } from "lucide-react";

export default function ApprovalsClient({ pendingUsers, availableTrucks }) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formularz akceptacji
  const [rank, setRank] = useState("Praktykant");
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [initialDeliveries, setInitialDeliveries] = useState(0);
  const [initialMileage, setInitialMileage] = useState(0);
  const [truckId, setTruckId] = useState("");
  
  // Formularz odrzucenia
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: "APPROVE",
          rank,
          monthlyLimitKm: monthlyLimit,
          initialDeliveries,
          initialMileage,
          truckId: truckId === "" ? null : truckId
        })
      });
      
      if (res.ok) {
        setIsApproveModalOpen(false);
        router.refresh();
      } else {
        toast.error("Wystąpił błąd");
      }
    } catch (err) {
      toast.error("Błąd połączenia");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: "REJECT",
          rejectionReason
        })
      });
      
      if (res.ok) {
        setIsRejectModalOpen(false);
        router.refresh();
      } else {
        toast.error("Wystąpił błąd");
      }
    } catch (err) {
      toast.error("Błąd połączenia");
    } finally {
      setLoading(false);
    }
  };

  if (pendingUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <ShieldCheck className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-xl font-bold">Wszystko gotowe!</h3>
        <p className="text-zinc-500 mt-2">Brak nowych kont do weryfikacji.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingUsers.map(user => (
        <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex flex-wrap items-baseline gap-2">
                  <span className="text-xl font-extrabold">{user.firstName || "Brak imienia"}</span>
                  <span className="text-sm font-normal text-zinc-500">(Login: <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-xs">{user.name || "brak"}</code>)</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-indigo-500 font-bold text-[10px] tracking-wider uppercase border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                    Discord
                  </span>
                  <span className="font-medium truncate">{user.discordNick || "Nie podano"}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="truncate">Rejestracja: {new Date(user.createdAt).toLocaleDateString("pl-PL")}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 shrink-0 self-end sm:self-center">
            <button
              onClick={() => {
                setSelectedUser(user);
                setIsRejectModalOpen(true);
                setRejectionReason("");
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg font-medium transition-colors"
            >
              <UserX className="w-4 h-4" />
              Odrzuć
            </button>
            <button
              onClick={() => {
                setSelectedUser(user);
                setIsApproveModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Zatwierdź Profil
            </button>
          </div>
        </div>
      ))}

      {/* Modal Akceptacji */}
      {isApproveModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold mb-2">Akceptuj konto: {selectedUser.name}</h3>
            <p className="text-sm text-zinc-500 mb-6">Uzupełnij początkowe informacje profilowe, aby kierowca mógł rozpocząć pracę.</p>
            
            <form onSubmit={handleApprove} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ranga / Stanowisko</label>
                  <select 
                    value={rank} 
                    onChange={e => setRank(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <optgroup label="Pracownicy">
                      <option value="Praktykant">Praktykant</option>
                      <option value="Nowy Kierowca">Nowy Kierowca</option>
                      <option value="Początkujący Kierowca">Początkujący Kierowca</option>
                      <option value="Kierowca">Kierowca</option>
                      <option value="Starszy Kierowca">Starszy Kierowca</option>
                      <option value="Doświadczony Kierowca">Doświadczony Kierowca</option>
                      <option value="Kierowca Emeryt">Kierowca Emeryt</option>
                    </optgroup>
                    <optgroup label="Kierownictwo">
                      <option value="Księgowy">Księgowy</option>
                      <option value="Osoba ds. Social Media">Osoba ds. Social Media</option>
                      <option value="Próbny rekrutant firmowy">Próbny rekrutant firmowy</option>
                      <option value="Rekrutant firmowy">Rekrutant firmowy</option>
                      <option value="Opiekun ds. Marketingu">Opiekun ds. Marketingu</option>
                    </optgroup>
                    <optgroup label="Zarząd">
                      <option value="Opiekun ds. Rekrutacji">Opiekun ds. Rekrutacji</option>
                      <option value="Technik ds. IT">Technik ds. IT</option>
                      <option value="Menadżer">Menadżer</option>
                      <option value="Przedstawiciel">Przedstawiciel</option>
                      <option value="Prezes">Prezes</option>
                      <option value="Właściciel">Właściciel</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Limit miesięczny (km)</label>
                  <input 
                    type="number" 
                    value={monthlyLimit} 
                    onChange={e => setMonthlyLimit(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Początkowe dostawy</label>
                  <input 
                    type="number" 
                    value={initialDeliveries} 
                    onChange={e => setInitialDeliveries(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Początkowy przebieg</label>
                  <input 
                    type="number" 
                    value={initialMileage} 
                    onChange={e => setInitialMileage(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-zinc-500" />
                  Przypisz Ciągnik (Opcjonalnie)
                </label>
                <select 
                  value={truckId} 
                  onChange={e => setTruckId(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Brak (Pozostaw bez pojazdu)</option>
                  {availableTrucks.map(truck => (
                    <option key={truck.id} value={truck.id}>
                      {truck.brand} {truck.model} ({truck.plate})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsApproveModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg font-medium transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center"
                >
                  {loading ? "Zapisywanie..." : "Zatwierdź i Wyślij Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Odrzucenia */}
      {isRejectModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold mb-2 text-red-600">Odrzuć konto</h3>
            <p className="text-sm text-zinc-500 mb-4">Użytkownik {selectedUser.name} otrzyma powiadomienie e-mail o odrzuceniu jego wniosku.</p>
            
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Powód odrzucenia (Opcjonalny)</label>
                <textarea 
                  value={rejectionReason} 
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Np. Brak podanego linku do profilu na TruckersMP..."
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsRejectModalOpen(false)}
                  className="flex-1 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg font-medium transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center"
                >
                  {loading ? "Przetwarzanie..." : "Odrzuć Zgłoszenie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

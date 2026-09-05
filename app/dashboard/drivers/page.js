"use client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, Map, Truck, Activity, Settings, Filter, GripVertical, Trash2 } from "lucide-react";
import { ConfirmModal } from "../../components/ConfirmModal";

export default function DriversPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const { data: session } = useSession();
  
  const userRole = session?.user?.role;
  const canManage = userRole === "DISPATCHER" || userRole === "BOARD" || userRole === "OWNER";

  useEffect(() => {
    fetch("/api/drivers")
      .then(res => res.json())
      .then(data => {
        if(data.drivers) setDrivers(data.drivers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredDrivers = drivers.filter(d => {
    const matchSearch = d.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const isFiltering = search !== "" || statusFilter !== "ALL";

  const handleReorder = (newOrder) => {
    if (isFiltering) return;
    setDrivers(newOrder);
    
    if (canManage) {
      const orderedIds = newOrder.map(d => d.id);
      fetch("/api/drivers/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds })
      }).catch(console.error);
    }
  };

  const executeDelete = async (id) => {
    try {
      const res = await fetch(`/api/drivers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDrivers(drivers.filter(d => d.id !== id));
      } else {
        toast.error("Błąd podczas usuwania kierowcy.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmConfig(null);
    }
  };

  const handleDelete = (id, name) => {
    setConfirmConfig({
      title: "Usuń Profil",
      message: `Czy na pewno chcesz bezpowrotnie usunąć profil kierowcy: ${name}?`,
      onConfirm: () => executeDelete(id)
    });
  };


  const getStatusText = (status) => {
    switch(status) {
      case "ACTIVE": return "Aktywny";
      case "ON_LEAVE": return "Urlop";
      case "ON_ROUTE": return "W trasie";
      case "OFFLINE": return "Offline";
      case "SUSPENDED": return "Zawieszony";
      default: return "Offline";
    }
  };

  const getStatusDot = (status) => {
    switch(status) {
      case "ON_ROUTE": return <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" title="W trasie"></span>;
      case "ACTIVE": return <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" title="Aktywny"></span>;
      case "ON_LEAVE": return <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" title="Urlop"></span>;
      case "SUSPENDED": return <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" title="Zawieszony"></span>;
      default: return <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" title="Offline"></span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Brak danych";
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const getEcoColor = (score) => {
    if (score >= 95) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (score >= 80) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (score >= 60) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Nigdy";
    return new Date(dateString).toLocaleString("pl-PL", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kierowcy</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Przeglądaj statystyki kierowców i ich statusy w firmie.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 appearance-none rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <option value="ALL">Wszystkie statusy</option>
              <option value="ACTIVE">Aktywny</option>
              <option value="ON_ROUTE">W trasie</option>
              <option value="ON_LEAVE">Urlop</option>
              <option value="OFFLINE">Offline</option>
              <option value="SUSPENDED">Zawieszony</option>
            </select>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Szukaj kierowcy..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-4 font-medium w-16 text-center">Lp.</th>
                <th className="px-6 py-4 font-medium">Kierowca</th>
                <th className="px-6 py-4 font-medium">Ciągnik</th>
                <th className="px-6 py-4 font-medium">Naczepa</th>
                <th className="px-6 py-4 font-medium text-center">Limit</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
                <th className="px-6 py-4 font-medium text-right">Akcje</th>
              </tr>
            </thead>
            <Reorder.Group as="tbody" axis="y" values={isFiltering ? drivers : filteredDrivers} onReorder={handleReorder}>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-zinc-500">
                    Ładowanie statystyk kierowców...
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-zinc-500">
                    Brak kierowców do wyświetlenia.
                  </td>
                </tr>
              ) : filteredDrivers.map((driver, index) => {
                
                return (
                  <Reorder.Item 
                    as="tr"
                    key={driver.id} 
                    value={driver}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={(e) => {
                      const target = e.target;
                      if (target.closest("button") || target.closest("a") || target.closest(".cursor-grab")) {
                        return;
                      }
                      router.push(`/dashboard/drivers/${driver.id}`);
                    }}
                    className="border-b border-zinc-200 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors bg-white dark:bg-zinc-900 cursor-pointer"
                  >
                    <td className="px-4 py-4 text-center font-medium text-zinc-500 select-none">
                      <div className="flex items-center justify-center gap-2">
                        {canManage && !isFiltering && (
                          <GripVertical className="w-4 h-4 text-zinc-400 cursor-grab active:cursor-grabbing hover:text-zinc-600" />
                        )}
                        <span>{index + 1}.</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {driver.image ? (
                            <img src={driver.image} alt={driver.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                              {driver.name ? driver.name.charAt(0) : "?"}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 border-2 border-white dark:border-zinc-900 rounded-full">
                            {getStatusDot(driver.status)}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-base">{driver.discordNick || driver.name || driver.firstName || "Nieznany"}</p>
                          <p className="text-xs text-zinc-500">{driver.rank}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {driver.truck ? (
                        <div className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
                          <span className="font-medium whitespace-nowrap">{driver.truck}</span>
                          <span className="text-xs text-zinc-500 font-mono uppercase">{driver.truckPlate}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs italic">- Brak -</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {driver.trailer ? (
                        <div className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
                          <span className="font-medium whitespace-nowrap">{driver.trailer}</span>
                          <span className="text-xs text-zinc-500 font-mono uppercase">{driver.trailerPlate}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs italic">- Brak -</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{(driver.currentMonthKm || 0).toLocaleString("pl-PL")} km</span>
                        <span className="text-xs text-zinc-500">z {(driver.limitKm || 10000).toLocaleString("pl-PL")} km</span>
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${Math.min(((driver.currentMonthKm || 0) / (driver.limitKm || 10000)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        {getStatusText(driver.status)}
                      </span>
                    </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/drivers/${driver.id}`}>
                            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                              <Settings className="w-4 h-4" />
                              Profil
                            </button>
                          </Link>
                          {canManage && (
                            <button 
                              onClick={() => handleDelete(driver.id, driver.discordNick || driver.name || driver.firstName)}
                              className="flex items-center justify-center p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Usuń profil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
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

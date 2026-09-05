"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, Truck, Landmark, Fuel, Loader2, User, Trophy, 
  Map, Package, Weight, Users, Medal, ChevronLeft, ChevronRight,
  Sparkles, Award, TrendingUp, Calendar, Zap
} from "lucide-react";

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState("company"); // "company" or "drivers"
  const [rankingCategory, setRankingCategory] = useState("distance"); // "distance" or "eco"
  
  const [period, setPeriod] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [companyStats, setCompanyStats] = useState(null);
  const [employeesStats, setEmployeesStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formattedDate = period === "month" 
    ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    : `${currentDate.getFullYear()}-01`;

  useEffect(() => {
    fetchStats();
  }, [period, formattedDate, activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === "company") {
        const res = await fetch(`/api/statistics/company?period=${period}&date=${formattedDate}`);
        const data = await res.json();
        if (res.ok) setCompanyStats(data);
        else setError(data.error);
      } else {
        const res = await fetch(`/api/statistics/employees?period=${period}&date=${formattedDate}`);
        const data = await res.json();
        if (res.ok) {
          let empList = data.employees || [];
          setEmployeesStats(empList);
        }
        else setError(data.error);
      }
    } catch (err) {
      setError("Nie udało się pobrać statystyk z serwera.");
    } finally {
      setLoading(false);
    }
  };

  let displayedEmployees = [];
  if (employeesStats.length > 0) {
    if (rankingCategory === "distance") {
      displayedEmployees = [...employeesStats].sort((a, b) => b.totalDistance - a.totalDistance);
    } else {
      displayedEmployees = employeesStats
        .filter(e => e.totalDistance > 0 && e.averageFuel > 0)
        .sort((a, b) => a.averageFuel - b.averageFuel);
    }
  }

  const handlePrevDate = () => {
    const newDate = new Date(currentDate);
    if (period === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(currentDate);
    if (period === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const getMonthName = (date) => {
    const months = [
      "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
      "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
    ];
    return months[date.getMonth()];
  };

  const getPodiumCardStyle = (index) => {
    if (index === 0) {
      return "bg-gradient-to-b from-amber-500/15 via-zinc-950 to-zinc-950 border-amber-500/40 text-amber-300 shadow-xl shadow-amber-500/5";
    }
    if (index === 1) {
      return "bg-gradient-to-b from-slate-400/15 via-zinc-950 to-zinc-950 border-slate-500/30 text-slate-200 shadow-lg";
    }
    if (index === 2) {
      return "bg-gradient-to-b from-amber-800/20 via-zinc-950 to-zinc-950 border-amber-800/40 text-amber-400 shadow-lg";
    }
    return "bg-zinc-950 border-zinc-800 text-zinc-400";
  };
  
  const getMedalBadge = (index) => {
    if (index === 0) return <Medal className="w-6 h-6 text-amber-400 drop-shadow-md" />;
    if (index === 1) return <Medal className="w-6 h-6 text-slate-300 drop-shadow-md" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600 drop-shadow-md" />;
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Nagłówek i Kontrolki Filtrowania */}
      <div className="bg-zinc-950 rounded-3xl border border-zinc-800 shadow-sm p-6 space-y-6">
        
        {/* Górny Rząd: Tytuł oraz Przełącznik Zakładek */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-900 border border-zinc-800 text-amber-400 rounded-2xl shrink-0">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Centrum Statystyk Firmy
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Przegląd najważniejszych wskaźników operacyjnych i ranking wyników kierowców VTC.
              </p>
            </div>
          </div>

          <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("company")}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                activeTab === "company" 
                  ? "bg-amber-400 text-zinc-950 shadow-md" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Statystyki Firmy
            </button>
            <button
              onClick={() => setActiveTab("drivers")}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                activeTab === "drivers" 
                  ? "bg-amber-400 text-zinc-950 shadow-md" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Ranking Kierowców
            </button>
          </div>
        </div>

        {/* Dolny Rząd: Filtry i Okres Czasu */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
          
          {activeTab === "drivers" ? (
            <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 w-full sm:w-auto">
              <button 
                onClick={() => setRankingCategory("distance")} 
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                  rankingCategory === "distance" 
                  ? "bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm" 
                  : "text-zinc-400 hover:text-white"
                }`}
              >
                Przejechany Dystans (KM)
              </button>
              <button 
                onClick={() => setRankingCategory("eco")} 
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                  rankingCategory === "eco" 
                  ? "bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm" 
                  : "text-zinc-400 hover:text-white"
                }`}
              >
                Eco-Driving (l/100km)
              </button>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Podsumowanie wyników z wybranych tras
            </div>
          )}

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
              <button 
                onClick={() => setPeriod("month")} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                  period === "month" ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Miesiąc
              </button>
              <button 
                onClick={() => setPeriod("year")} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                  period === "year" ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Rok
              </button>
              <button 
                onClick={() => setPeriod("all")} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                  period === "all" ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Całość
              </button>
            </div>

            {period !== "all" && (
              <div className="flex items-center gap-1 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 text-xs">
                <button onClick={handlePrevDate} className="p-1.5 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="w-28 text-center font-bold text-zinc-200">
                  {period === "month" ? `${getMonthName(currentDate)} ${currentDate.getFullYear()}` : currentDate.getFullYear()}
                </div>
                <button onClick={handleNextDate} className="p-1.5 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Obszar zawartości */}
      {error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-3xl text-center text-xs font-semibold">
          {error}
        </div>
      ) : loading ? (
        <div className="flex flex-col justify-center items-center py-28 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Pobieranie statystyk firmowych...</p>
        </div>
      ) : (
        <>
          {/* STATYSTYKI FIRMY */}
          {activeTab === "company" && companyStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Przejechane KM */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }} className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-2xl flex items-center justify-center shrink-0">
                    <Map className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Przejechany Dystans</h3>
                    <p className="text-[10px] text-zinc-600">Suma kilometrów z tras</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                  {companyStats.totalDistance.toLocaleString('pl-PL')} <span className="text-sm text-zinc-500 font-bold uppercase">km</span>
                </div>
              </motion.div>

              {/* Przychód Firmy */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Łączny Przychód</h3>
                    <p className="text-[10px] text-zinc-600">Zarobek netto z frachtów</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-400 tracking-tight">
                  {companyStats.totalRevenue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-bold">PLN</span>
                </div>
              </motion.div>

              {/* Spalone Paliwo */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center shrink-0">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Zużycie Paliwa</h3>
                    <p className="text-[10px] text-zinc-600">Łączny pobór oleju napędowego</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                  {companyStats.totalFuel.toLocaleString('pl-PL', { maximumFractionDigits: 1 })} <span className="text-sm text-zinc-500 font-bold uppercase">LITRÓW</span>
                </div>
              </motion.div>

              {/* Liczba Dostaw */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Zrealizowane Dostawy</h3>
                    <p className="text-[10px] text-zinc-600">Zamknięte zlecenia transportowe</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                  {companyStats.totalJobs.toLocaleString('pl-PL')} <span className="text-sm text-zinc-500 font-bold uppercase">TRAS</span>
                </div>
              </motion.div>

              {/* Przewieziona Waga */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center shrink-0">
                    <Weight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tonaż Ładunków</h3>
                    <p className="text-[10px] text-zinc-600">Łączna masa przewiezionego towaru</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                  {companyStats.totalWeight.toLocaleString('pl-PL')} <span className="text-sm text-zinc-500 font-bold uppercase">TON</span>
                </div>
              </motion.div>

              {/* Aktywni Kierowcy */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Aktywność Zespołu</h3>
                    <p className="text-[10px] text-zinc-600">Kierowcy z trasami w okresie</p>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-black text-white tracking-tight">
                    {companyStats.activeDrivers} <span className="text-sm text-zinc-500 font-bold uppercase">OSÓB</span>
                  </div>
                  <div className="text-xs font-bold text-zinc-300 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                    Śr. spalanie: <span className="text-amber-400">{companyStats.fleetAverageFuel.toFixed(1)} l</span>
                  </div>
                </div>
              </motion.div>

            </div>
          )}

          {/* RANKING KIEROWCÓW */}
          {activeTab === "drivers" && (
            <div className="space-y-8">
              {displayedEmployees.length === 0 ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
                  <Trophy className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-zinc-300 mb-1">Brak wyników w rankingu</h3>
                  <p className="text-xs text-zinc-500">Żaden kierowca nie zarejestrował tras w tym przedziale czasowym.</p>
                </div>
              ) : (
                <>
                  {/* TOP 3 PODIUM */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {displayedEmployees.slice(0, 3).map((emp, index) => (
                      <motion.div
                        key={emp.id}
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative rounded-3xl p-7 flex flex-col items-center text-center border overflow-hidden ${getPodiumCardStyle(index)}`}
                      >
                        <div className="absolute top-4 right-4 bg-zinc-900/80 p-2 rounded-2xl border border-zinc-800/80">
                          {getMedalBadge(index)}
                        </div>
                        
                        {/* Awatar z odznaką miejsca */}
                        <div className="relative mb-5 mt-2">
                          {emp.image ? (
                            <img src={emp.image} alt={emp.name} className="w-24 h-24 rounded-full object-cover border-4 border-zinc-800 shadow-2xl" />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-zinc-900 border-4 border-zinc-800 flex items-center justify-center shadow-2xl">
                              <User className="w-10 h-10 text-zinc-600" />
                            </div>
                          )}
                          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full border-2 border-zinc-950 flex items-center justify-center text-sm font-black shadow-lg ${
                            index === 0 ? "bg-amber-400 text-zinc-950" : 
                            index === 1 ? "bg-slate-300 text-zinc-950" : 
                            "bg-amber-700 text-white"
                          }`}>
                            #{index + 1}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-black mb-1 truncate w-full text-white">{emp.name}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-5">
                          {rankingCategory === "distance" ? "Przejechany Dystans" : "Mistrz Eko-Jazdy"}
                        </p>
                        
                        <div className="text-3xl font-black tracking-tight text-white">
                          {rankingCategory === "distance" 
                            ? `${emp.totalDistance.toLocaleString('pl-PL')} km`
                            : `${emp.averageFuel.toFixed(1)} l/100km`}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* POZOSTAŁE MIEJSCA W RANKINGU (Od 4 miejsca) */}
                  {displayedEmployees.length > 3 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                      {displayedEmployees.slice(3).map((emp, index) => {
                        const actualRank = index + 3;
                        return (
                          <motion.div
                            key={emp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.04 }}
                            className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 shadow-sm flex items-center gap-3.5 hover:border-zinc-700 transition-all group"
                          >
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-xs text-zinc-400 group-hover:text-amber-400 transition-colors">
                              #{actualRank + 1}
                            </div>
                            
                            {emp.image ? (
                              <img src={emp.image} alt={emp.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-800" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-zinc-600" />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs text-white truncate group-hover:text-amber-400 transition-colors">{emp.name}</h4>
                              <div className="text-[11px] font-semibold text-zinc-500 mt-0.5">
                                {rankingCategory === "distance" 
                                  ? `${emp.totalDistance.toLocaleString('pl-PL')} km`
                                  : `${emp.averageFuel.toFixed(1)} l/100km`}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

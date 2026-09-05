"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, Fuel, Users, Wallet, Car, AlertTriangle, 
  Briefcase, RefreshCw, Star, Leaf, Medal, ShieldAlert,
  Route, Package, Truck, Megaphone, Pin, Award, Sparkles, UserCircle,
  CheckCircle, Clock, XCircle, Rocket, ArrowRight, ShieldCheck,
  MapPin, TrendingUp, Activity, ExternalLink, ChevronRight, Gauge,
  Wrench, Radio, Layers, DollarSign
} from "lucide-react";
import { useRouter } from "next/navigation";
import LicensePlate from "../components/LicensePlate";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [showBirthdayCelebration, setShowBirthdayCelebration] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (data?.user?.birthDate) {
      const birth = new Date(data.user.birthDate);
      const today = new Date();
      if (birth.getDate() === today.getDate() && birth.getMonth() === today.getMonth()) {
        setShowBirthdayCelebration(true);
      }
    }
  }, [data]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/user/dashboard");
      const json = await res.json();
      if (json.user) setData(json);

      const newsRes = await fetch("/api/news");
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNews(newsData.slice(0, 3));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionName) => {
    setActionLoading(actionName);
    try {
      const res = await fetch("/api/user/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionName })
      });
      if (res.ok) await fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusMenuOpen(false);
    setActionLoading("STATUS");
    try {
      const res = await fetch("/api/user/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_STATUS", status: newStatus })
      });
      if (res.ok) await fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <Truck className="w-6 h-6 text-indigo-500 absolute animate-pulse" />
        </div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Ładowanie Centrum Dowodzenia BMS...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center text-zinc-500">
        Brak danych. Wyloguj i zaloguj się ponownie.
      </div>
    );
  }

  const monthlyProgress = Math.min(100, Math.round((data.user.monthlyDistance / (data.user.monthlyLimit || 10000)) * 100));

  const getCleanlinessLabel = (val) => {
    if (val >= 90) return "Czysty";
    if (val >= 70) return "Lekko zakurzony";
    if (val >= 50) return "Lekko brudny";
    if (val >= 30) return "Brudny";
    if (val >= 10) return "Bardzo brudny";
    return "Wymaga mycia";
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "ON_LEAVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            NA URLOPIE
          </span>
        );
      case "OFFLINE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
            NIEAKTYWNY
          </span>
        );
      case "ACTIVE":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            AKTYWNY
          </span>
        );
    }
  };

  const renderProbationBadge = (probationStr) => {
    if (!probationStr || probationStr === "Brak") {
      return (
        <span className="font-medium bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-600 dark:text-zinc-400 text-xs">
          Brak
        </span>
      );
    }
    
    const str = probationStr.toUpperCase();
    if (str.includes("SKOŃCZONY") || str.includes("UKOŃCZONY") || str.includes("ZAKOŃCZONY")) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-lg border border-green-500/20">
          <CheckCircle className="w-3.5 h-3.5" /> {probationStr}
        </span>
      );
    }
    
    if (str.includes("NIEUKOŃCZONY") || str.includes("ODRZUCONY")) {
       return (
        <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-lg border border-red-500/20">
          <XCircle className="w-3.5 h-3.5" /> {probationStr}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20">
        <Clock className="w-3.5 h-3.5" /> {probationStr}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* 🎂 KOMUNIKAT O URODZINACH KIEROWCY */}
      <AnimatePresence>
        {showBirthdayCelebration && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent)] pointer-events-none animate-pulse"></div>
            <div className="flex items-center gap-4 z-10">
              <span className="text-4xl animate-bounce text-zinc-100">🎉</span>
              <div>
                <h2 className="text-xl font-black tracking-tight text-zinc-100">Wszystkiego Najlepszego z okazji Urodzin! 🎂</h2>
                <p className="text-xs text-white/90 font-medium mt-0.5">Zarząd i cała społeczność BMS życzy Ci szerokiej drogi, bezpiecznych powrotów i samych sukcesów!</p>
              </div>
            </div>
            <button 
              onClick={() => setShowBirthdayCelebration(false)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all border border-white/10 shrink-0 z-10 text-zinc-100"
            >
              Dziękuję!
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 GLÓWNY HEADER - CENTRUM DOWODZENIA (HERO BANNER) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-zinc-900 border border-zinc-800 text-white shadow-lg"
      >
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-zinc-800/40 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Background Decorative Truck Graphic */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-8 opacity-10 pointer-events-none hidden md:block">
          <Truck className="w-80 h-80 -rotate-6 transform" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Lewa część - Profil Kierowcy */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">


            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {data.user.name}
                </h1>
                {renderStatusBadge(data.user.driverStatus)}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200">
                  {data.user.rank}
                </span>
                {data.user.discordNick && (
                  <>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">DC: <strong className="text-zinc-200">{data.user.discordNick}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dolny Pasek Celu Miesięcznego */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Postęp Miesięczny Kierowcy</p>
              <p className="text-sm font-bold text-white">
                {Number(data.user.monthlyDistance).toLocaleString()} km / {Number(data.user.monthlyLimit || 10000).toLocaleString()} km
              </p>
            </div>
          </div>

          <div className="sm:col-span-8 space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span>Limit: {monthlyProgress}% ukończono</span>
              <span>Do celu: {Math.max(0, (data.user.monthlyLimit || 10000) - data.user.monthlyDistance).toLocaleString()} km</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${monthlyProgress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 📊 GŁÓWNE KARTY STATYSTYK (KPIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { 
            label: "Dystans Miesięczny", 
            value: `${Number(data.user.monthlyDistance).toLocaleString()} km`, 
            sub: `Całkowity: ${Number(data.user.totalDrivenKm || 0).toLocaleString()} km`, 
            icon: Route, 
            color: "text-blue-400", 
            bg: "bg-blue-500/10 border-blue-500/20" 
          },
          { 
            label: "Średnie Spalanie", 
            value: "--", 
            sub: "Funkcja w trakcie tworzenia, wkrótce dostępna.", 
            icon: Fuel, 
            color: "text-emerald-500", 
            bg: "bg-emerald-500/10 border-emerald-500/20" 
          },
          { 
            label: "Oddane Frachty", 
            value: Number(data.user.totalJobsCount).toLocaleString(), 
            sub: "Zatwierdzone ładunki", 
            icon: Package, 
            color: "text-amber-500", 
            bg: "bg-amber-500/10 border-amber-500/20" 
          },
          { 
            label: "Stan Konta", 
            value: `${Number(data.user.balance).toLocaleString()} zł`, 
            sub: `Wynagrodzenie firmowe`, 
            icon: Wallet, 
            color: "text-emerald-400", 
            bg: "bg-emerald-500/10 border-emerald-500/20" 
          }
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.08 }} 
            className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-white/20 transition-all group overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white transition-colors">{stat.value}</h3>
                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{stat.sub}</p>
              </div>
              <div className={`p-3.5 rounded-2xl border ${stat.bg} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🚚 ZESTAW TRANSPORTOWY + RANKING & SZYBKIE MODUŁY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEWA I ŚRODKOWA KOLUMNA: POJAZD I OSTATNIE TRASY */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* PANEL ZESTAWU TRANSPORTOWEGO */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">Twój Zestaw</h3>
                  <p className="text-xs text-zinc-500">Telemetria i stan techniczny ciągnika</p>
                </div>
              </div>

              {data.truck && (
                <button 
                  onClick={() => router.push('/dashboard/fleet')}
                  className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-xl transition-all"
                >
                  Karta Floty <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {data.truck ? (
              <div className="relative w-full min-h-[460px] flex flex-col justify-between overflow-hidden">
                {data.truck.imageUrl ? (
                  <img 
                    src={data.truck.imageUrl} 
                    alt={data.truck.fullName} 
                    className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 hover:scale-105" 
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-zinc-900 flex items-center justify-center z-0">
                    <Truck className="w-28 h-28 text-zinc-700" />
                  </div>
                )}

                {/* Dark Neutral Grey Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-zinc-950/80 z-0"></div>

                {/* Top Info Header Bar */}
                <div className="relative z-10 p-6 flex flex-wrap justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest bg-zinc-950/80 px-2.5 py-1 rounded-md border border-zinc-800 backdrop-blur-md">
                      Pojazd Przypisany
                    </span>
                    <h4 className="font-black text-2xl sm:text-3xl text-white drop-shadow-md tracking-tight">
                      {data.truck.brand} {data.truck.model}
                    </h4>
                    <p className="text-zinc-300 font-mono text-xs bg-zinc-900/80 px-2.5 py-1 rounded-md inline-block backdrop-blur-sm border border-zinc-800">
                      Nr Flotowy: <strong className="text-white">#{data.truck.fleetNumber}</strong>
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block drop-shadow-md">Numer Rejestracyjny</span>
                    <div className="pt-0.5">
                      <LicensePlate plate={data.truck.plate} scale={0.32} />
                    </div>
                  </div>
                </div>

                {/* Bottom Telemetry Metrics Bar */}
                <div className="relative z-10 p-4 space-y-3">
                  <div className="inline-block bg-zinc-950/90 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800">
                    <div className="flex flex-wrap items-center gap-1.5">
                      
                      {/* Fuel Indicator */}
                      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-1.5 px-2.5 flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold"><Fuel className="w-3 h-3"/> Paliwo:</span>
                        <span className="font-extrabold text-white font-mono text-[11px]">{data.truck.fuelLevel.toFixed(0)}%</span>
                      </div>

                      {/* Cleanliness Indicator */}
                      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-1.5 px-2.5 flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] text-zinc-300 font-semibold"><Droplets className="w-3 h-3 text-zinc-400"/> Czystość:</span>
                        <span className="font-extrabold text-white text-[11px]">{getCleanlinessLabel(data.truck.cleanliness)}</span>
                      </div>

                      {/* Mileage */}
                      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-1.5 px-2.5 flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1"><Gauge className="w-3 h-3 text-zinc-400"/> Przebieg:</span>
                        <span className="font-mono font-extrabold text-[11px] text-white">{Number(data.truck.mileage || 0).toLocaleString()} km</span>
                      </div>

                      {/* Technical Condition */}
                      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-1.5 px-2.5 flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1"><Wrench className="w-3 h-3 text-emerald-400"/> Stan:</span>
                        <span className="font-mono font-extrabold text-[11px] text-emerald-400">Sprawny</span>
                      </div>

                    </div>
                  </div>

                  {/* Interactive Quick RPG Actions & Trailer Info */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={() => router.push('/dashboard/fuel')}
                        className="px-3.5 py-2 bg-zinc-800/90 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all"
                      >
                        <Fuel className="w-3.5 h-3.5" />
                        Zatankuj (Firmowa Karta)
                      </button>

                      <button 
                        onClick={() => router.push(`/dashboard/fleet/${data.truck.id}`)}
                        className="px-3.5 py-2 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all"
                      >
                        <Droplets className="w-3.5 h-3.5 text-zinc-400" />
                        Umyj Ciężarówkę
                      </button>
                    </div>

                    {data.truck.attachedTrailer && (
                      <div className="inline-flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-200">
                        <Layers className="w-4 h-4 text-zinc-300" />
                        <span>Naczepa: <strong>{data.truck.attachedTrailer.brand} {data.truck.attachedTrailer.model}</strong></span>
                        <LicensePlate plate={data.truck.attachedTrailer.plate} scale={0.22} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center flex flex-col items-center bg-zinc-50 dark:bg-zinc-950/50">
                <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl mb-3">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h4 className="font-bold text-lg text-zinc-900 dark:text-white">Brak przypisanego pojazdu w systemie</h4>
                <p className="text-zinc-500 text-sm mt-1 max-w-md">
                  Wybierz i zgłoś prośbę o ciągnik z floty firmowej lub zgłoś się do dyspozytora.
                </p>
                <button 
                  onClick={() => router.push('/dashboard/fleet')}
                  className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Przeglądaj Flotę Firmową
                </button>
              </div>
            )}
          </div>

          {/* OSTATNIE TRASY KIEROWCY */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
                  <Route className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">OSTATNIE TRASY</h3>
                  <p className="text-xs text-zinc-500">Twój dziennik oddanych frachtów</p>
                </div>
              </div>

              <button 
                onClick={() => router.push('/dashboard/jobs')}
                className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1"
              >
                Wszystkie trasy <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {data.recentJobs && data.recentJobs.length > 0 ? (
              <div className="space-y-3">
                {data.recentJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-300">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-white">
                          <span>{job.startCity}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{job.endCity}</span>
                        </div>
                        <p className="text-xs text-zinc-500">
                          Ładunek: <span className="font-medium text-zinc-700 dark:text-zinc-300">{job.cargo}</span> ({job.distance} km)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-200 dark:border-zinc-800">
                      <div className="text-right">
                        <span className="text-xs font-bold text-white block">
                          +{Number(job.distance || 0).toLocaleString()} km
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(job.createdAt || job.date).toLocaleDateString("pl-PL")}
                        </span>
                      </div>

                      {job.status === "APPROVED" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                          Zatwierdzona
                        </span>
                      )}
                      {job.status === "PENDING" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Oczekuje
                        </span>
                      )}
                      {job.status === "REJECTED" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                          Odrzucona
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500 text-sm">
                Brak zarejestrowanych tras w tym miesiącu. Kliknij "Rozlicz Trasę", aby dodać pierwszy fracht!
              </div>
            )}
          </div>

        </div>

        {/* PRAWA KOLUMNA: RANKING, TABLICA OGŁOSZEŃ, UMOWA & CHANGELOG */}
        <div className="space-y-8">

          {/* TOP KIEROWCY MIESIĄCA (LEADERBOARD) */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Medal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg tracking-tight">KIEROWCY MIESIĄCA</h3>
                <p className="text-xs text-zinc-500">Najlepsze wyniki w firmie BMS</p>
              </div>
            </div>

            {data.topDrivers && data.topDrivers.length > 0 ? (
              <div className="space-y-3">
                {data.topDrivers.map((driver, index) => {
                  const medalIcons = ["🥇", "🥈", "🥉"];
                  const medalBgs = [
                    "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30",
                    "bg-gradient-to-r from-slate-300/10 to-slate-400/10 border-slate-400/30",
                    "bg-gradient-to-r from-amber-700/10 to-orange-700/10 border-amber-700/30"
                  ];

                  return (
                    <div 
                      key={driver.id} 
                      className={`p-3.5 rounded-2xl border ${medalBgs[index] || "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"} flex items-center justify-between gap-3`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{medalIcons[index] || `#${index + 1}`}</span>
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                            {driver.name}
                          </h4>
                          <p className="text-[11px] text-zinc-500">{driver.rank}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-sm text-zinc-900 dark:text-white block">
                          {Number(driver.distance).toLocaleString()} km
                        </span>
                        <span className="text-[10px] text-zinc-400">{driver.jobsCount} tras</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500">
                Brak wyliczonego rankingu kierowców.
              </div>
            )}
          </div>

          {/* TABLICA OGŁOSZEŃ FIRMOWYCH */}
          {news.length > 0 && (
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg tracking-tight">OGŁOSZENIA FIRMOWE</h3>
                    <p className="text-xs text-zinc-500">Komunikaty Zarządu i Dyspozytorni</p>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/dashboard/news')} 
                  className="text-xs font-bold text-indigo-500 hover:underline"
                >
                  Zobacz wszystkie
                </button>
              </div>

              <div className="space-y-3">
                {news.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => router.push('/dashboard/news')}
                    className="group p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl hover:border-indigo-500/40 transition-all cursor-pointer"
                  >
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 mb-1 group-hover:text-indigo-500 transition-colors">
                      {item.isPinned && <Pin className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />} 
                      <span className="line-clamp-1">{item.title}</span>
                    </h4>
                    <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{item.content}</p>
                    <div className="text-[10px] font-medium text-zinc-400 mt-2.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString("pl-PL")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATUS UMOWY I STATYSTYKI FIRMY */}
          <div className="bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg tracking-tight flex items-center gap-2 text-zinc-900 dark:text-white">
              <Briefcase className="w-5 h-5 text-indigo-500" /> Umowa i Bilans Kierowcy
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-zinc-500 font-medium">Okres Próbny</span>
                {renderProbationBadge(data.user.probationPeriod)}
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-zinc-500 font-medium">Pochwały / Nagany</span>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md">+{data.user.praises}</span>
                  <span className="text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md">-{data.user.reprimands}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-zinc-500 font-medium">Dni Urlopowe</span>
                <span className="font-bold text-zinc-900 dark:text-white">{data.user.vacationDays} dni</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-zinc-500 font-medium">Przejechane km (Całkowity staż)</span>
                <span className="font-black text-white text-sm">
                  {Number(data.user.totalDrivenKm || 0).toLocaleString()} km
                </span>
              </div>
            </div>
          </div>

          {/* WIDGET DZIENNIKA ZMIAN */}
          <div 
            onClick={() => router.push('/dashboard/changelog')}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-sm cursor-pointer hover:border-zinc-700 transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
                <Rocket className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" /> Dziennik Zmian
              </h3>
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">v4.0.0</span>
            </div>
            <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
              Wielka Aktualizacja BMS 4.0: Nowy panel kierowcy i system kart paliwowych, dane kadrowe w profilu, aplikacja mobilna oraz stabilność.
            </p>
            <div className="text-indigo-400 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
              Zobacz pełną historię wersji <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}


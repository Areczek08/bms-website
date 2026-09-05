"use client";

import { useState, useEffect } from "react";
import { Building2, Trophy, Navigation, Target } from "lucide-react";
import Link from "next/link";

export default function CompaniesStatsPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/statistics/companies");
      if (res.ok) {
        const json = await res.json();
        setCompanies(json.stats || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-zinc-500">Wczytywanie statystyk międzyfirmowych...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Statystyki Międzyfirmowe</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Ranking i podsumowanie wyników wszystkich oddziałów Bojar Logistic.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((c, idx) => (
          <Link href={`/dashboard/companies/${c.id}`} key={c.id}>
            <div className="bg-white dark:bg-zinc-800/50 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 dark:opacity-5 group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity">
                <Building2 className="w-24 h-24" />
              </div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-zinc-400' : idx === 2 ? 'bg-amber-700' : 'bg-blue-600'}`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight text-zinc-900 dark:text-zinc-100">{c.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.isMain ? "Oddział Główny" : "Firma Partnerska"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    Suma Dystansu
                  </div>
                  <span className="font-bold text-blue-700 dark:text-blue-400">{c.totalDistance.toLocaleString()} km</span>
                </div>
                
                <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                    <Target className="w-4 h-4 text-green-500" />
                    Kierowców
                  </div>
                  <span className="font-bold text-green-700 dark:text-green-400">{c.driverCount}</span>
                </div>

                <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Budżet
                  </div>
                  <span className="font-bold text-amber-700 dark:text-amber-500">{c.balance.toLocaleString()} PLN</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

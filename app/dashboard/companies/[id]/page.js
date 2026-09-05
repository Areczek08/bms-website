"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Building2, User, Truck, Clock } from "lucide-react";
import { useParams } from "next/navigation";

export default function CompanyProfilePage() {
  const params = useParams();
  const companyId = params.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    try {
      const res = await fetch(`/api/companies/${companyId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.company);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-zinc-500">Wczytywanie profilu firmy...</div>;
  if (!data) return <div className="p-12 text-center text-red-500">Nie znaleziono firmy.</div>;

  const boardMembers = data.users.filter(u => u.role === "BOARD" || u.role === "OWNER");
  const dispatchers = data.users.filter(u => u.role === "DISPATCHER");
  const drivers = data.users.filter(u => u.role === "DRIVER");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Nagłówek Firmy */}
      <div className="bg-white dark:bg-zinc-800/50 rounded-2xl shadow-sm border dark:border-zinc-800 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-zinc-800 to-zinc-900"></div>
        <div className="px-8 pb-8">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-2xl shadow-md flex items-center justify-center border border-zinc-100 dark:border-zinc-700 overflow-hidden">
              {data.logoUrl ? (
                <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-zinc-400" />
              )}
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${data.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'}`}>
              {data.status === "ACTIVE" ? "Współpraca Aktywna" : "Współpraca Zawieszona"}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{data.name}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">{data.description || "Brak opisu firmy."}</p>
          </div>

          <div className="flex gap-8 mt-6 pt-6 border-t dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-700/50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">ZAŁOŻENIE</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-200">{new Date(data.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">FLOTA</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{data.trucks.length} Zestawów</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchia */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Struktura Oddziału</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Zarząd */}
          <div className="bg-white dark:bg-zinc-800/50 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              Zarząd & Właściciele
            </h3>
            <div className="space-y-3">
              {boardMembers.length > 0 ? boardMembers.map(u => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-700/50 rounded-full flex items-center justify-center text-xs font-bold text-zinc-900 dark:text-zinc-200">{u.name?.charAt(0) || '?'}</div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-200">{u.name}</span>
                </div>
              )) : <p className="text-sm text-zinc-500 dark:text-zinc-400">Brak członków zarządu.</p>}
            </div>
          </div>

          {/* Kierownicy */}
          <div className="bg-white dark:bg-zinc-800/50 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Kierownicy / Dyspozytorzy
            </h3>
            <div className="space-y-3">
              {dispatchers.length > 0 ? dispatchers.map(u => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-700/50 rounded-full flex items-center justify-center text-xs font-bold text-zinc-900 dark:text-zinc-200">{u.name?.charAt(0) || '?'}</div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-200">{u.name}</span>
                </div>
              )) : <p className="text-sm text-zinc-500 dark:text-zinc-400">Brak kierowników.</p>}
            </div>
          </div>

          {/* Kierowcy */}
          <div className="bg-white dark:bg-zinc-800/50 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-green-500" />
              Kierowcy
            </h3>
            <div className="space-y-3">
              {drivers.length > 0 ? drivers.map(u => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-700/50 rounded-full flex items-center justify-center text-xs font-bold text-zinc-900 dark:text-zinc-200">{u.name?.charAt(0) || '?'}</div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-200">{u.name}</span>
                </div>
              )) : <p className="text-sm text-zinc-500 dark:text-zinc-400">Brak kierowców.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

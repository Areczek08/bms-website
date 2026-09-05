"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Clock, Trash2 } from "lucide-react";

export default function AdminPage() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      const res = await fetch("/api/bugs");
      const data = await res.json();
      if (data.bugs) {
        setBugs(data.bugs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch("/api/bugs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchBugs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-zinc-500">Wczytywanie panelu...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administracja Systemem</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Zarządzaj zgłoszeniami błędów i problemami technicznymi.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Zgłoszone Błędy ({bugs.length})
          </h3>
        </div>
        
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {bugs.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">Brak zgłoszonych błędów.</div>
          ) : (
            bugs.map((bug) => (
              <div key={bug.id} className="p-6 flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-lg">{bug.title}</h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        Zgłaszający: <span className="font-medium text-zinc-900 dark:text-zinc-300">{bug.user?.name || bug.user?.firstName || "Nieznany"}</span>
                        {" "}• Data: {new Date(bug.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      bug.status === "NEW" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      bug.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      bug.status === "RESOLVED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {bug.status === "NEW" ? "Nowy" : bug.status === "IN_PROGRESS" ? "W Trakcie" : bug.status === "RESOLVED" ? "Rozwiązany" : "Odrzucony"}
                    </span>
                  </div>
                  
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/50 text-sm">
                    {bug.description}
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-48 shrink-0">
                  <button 
                    onClick={() => updateStatus(bug.id, "IN_PROGRESS")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Clock className="w-4 h-4" /> W Trakcie
                  </button>
                  <button 
                    onClick={() => updateStatus(bug.id, "RESOLVED")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Rozwiązany
                  </button>
                  <button 
                    onClick={() => updateStatus(bug.id, "REJECTED")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Odrzuć
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

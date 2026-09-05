"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle, CheckCircle, Bug, Loader2 } from "lucide-react";

export default function BugsAdminPage() {
  const { data: session } = useSession();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      const res = await fetch("/api/bugs");
      if (res.ok) {
        const data = await res.json();
        setBugs(data.bugs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/bugs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      fetchBugs();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500"/></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Bug className="w-8 h-8 text-red-500" />
        Zgłoszone Błędy
      </h1>
      
      <div className="space-y-6">
        {bugs.length === 0 ? (
          <p className="text-zinc-500">Brak zgłoszonych błędów.</p>
        ) : (
          bugs.map(bug => (
            <div key={bug.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{bug.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Zgłoszone przez: {bug.user?.name || "Anonim"} • {new Date(bug.createdAt).toLocaleString("pl-PL")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${bug.status === 'NEW' ? 'bg-red-100 text-red-700' : bug.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {bug.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap border border-zinc-200 dark:border-zinc-800 mb-4">
                {bug.description}
              </div>

              {bug.imageUrl && (
                <div className="mb-4">
                  <p className="text-sm font-bold mb-2">Załączony zrzut ekranu:</p>
                  <img src={bug.imageUrl} alt="Bug screenshot" className="max-w-full h-auto rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-sm" />
                </div>
              )}

              <div className="flex gap-2">
                {bug.status !== 'IN_PROGRESS' && (
                  <button onClick={() => updateStatus(bug.id, 'IN_PROGRESS')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors">
                    Oznacz jako W Trakcie
                  </button>
                )}
                {bug.status !== 'RESOLVED' && (
                  <button onClick={() => updateStatus(bug.id, 'RESOLVED')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
                    Oznacz jako Rozwiązane
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

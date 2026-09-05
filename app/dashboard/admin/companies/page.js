"use client";
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminCompaniesPage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("1.20");
  const [newLogoFile, setNewLogoFile] = useState(null);
  const [newDesc, setNewDesc] = useState("");
  const [newBalance, setNewBalance] = useState("0");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/admin/companies");
      const json = await res.json();
      setCompanies(json.companies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName) return;
    
    setIsSubmitting(true);
    
    try {
      let finalLogoUrl = "";
      
      // Upload logo jeśli wybrano plik
      if (newLogoFile) {
        const formData = new FormData();
        formData.append("file", newLogoFile);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadJson = await uploadRes.json();
        if (uploadJson.success) {
          finalLogoUrl = uploadJson.url;
        }
      }

      await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newName, 
          revenuePerKmEur: parseFloat(newRate),
          logoUrl: finalLogoUrl,
          description: newDesc,
          balance: parseFloat(newBalance) || 0
        })
      });
      
      setShowModal(false);
      setNewName("");
      setNewRate("1.20");
      setNewLogoFile(null);
      setNewDesc("");
      setNewBalance("0");
      fetchCompanies();
    } catch (err) {
      toast.error("Błąd podczas tworzenia firmy.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session?.user?.role !== "OWNER") {
    return <div className="p-12 text-center text-red-500">Brak uprawnień. Tylko OWNER może zarządzać podfirmami.</div>;
  }

  if (loading) return <div className="p-12 text-center text-zinc-500">Wczytywanie...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Zarządzanie Podfirmami</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Twórz oddziały i przypisuj stawki.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Dodaj Firmę
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-800/50 border dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800 border-b dark:border-zinc-700">
            <tr>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm">NAZWA</th>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm">STATUS</th>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm">STAWKA / KM</th>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm">BUDŻET</th>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm text-right">AKCJE</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            {companies.map(c => (
              <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors">
                <td className="px-6 py-4 font-medium flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-700/50 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <div className="text-zinc-900 dark:text-zinc-200">
                    {c.name}
                    {c.isMain && <span className="ml-2 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">Główna</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{c.revenuePerKmEur.toFixed(2)} EUR</td>
                <td className="px-6 py-4 font-medium text-amber-600 dark:text-amber-500">{c.balance.toLocaleString()} PLN</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!c.isMain && (
                    <button className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Dodaj Nową Firmę</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nazwa Firmy *</label>
                  <input 
                    type="text" 
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="np. Bojar Trans"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Stawka za km (EUR) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={newRate}
                    onChange={e => setNewRate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Logo firmy (opcjonalnie)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setNewLogoFile(e.target.files[0])}
                    className="w-full text-sm text-zinc-500 dark:text-zinc-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      dark:file:bg-blue-900/30 dark:file:text-blue-400
                      hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                      cursor-pointer"
                  />
                  {newLogoFile && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium shrink-0">
                      Plik wybrany
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Budżet startowy (PLN)</label>
                <input 
                  type="number" 
                  value={newBalance}
                  onChange={e => setNewBalance(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Opis oddziału</label>
                <textarea 
                  rows="3"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Krótki opis specjalizacji..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t dark:border-zinc-800 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Anuluj
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Wgrywanie..." : "Utwórz Firmę"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Activity, HeartPulse, ShieldAlert, RefreshCw } from "lucide-react";

export default function DocumentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/user/dashboard");
      const json = await res.json();
      if (json.user) {
        setData(json);
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
      if (res.ok) {
        await fetchDashboardData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Wystąpił błąd podczas akcji.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const calculateDaysLeft = (expiryDate) => {
    if (!expiryDate) return "Brak / Wygasło";
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days < 0) return "Wygasło";
    return `${days} dni`;
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return true;
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return diff < (1000 * 3600 * 24 * 7); // Mniej niż 7 dni
  };

  if (loading) {
    return <div className="p-12 text-center text-zinc-500">Wczytywanie dokumentów...</div>;
  }

  if (!data) {
    return <div className="p-12 text-center text-zinc-500">Brak danych. Wyloguj i zaloguj się ponownie.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dokumenty i Uprawnienia</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Zarządzaj swoimi uprawnieniami oraz badaniami.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-zinc-500" />
            <h3 className="font-semibold text-lg">Twoje Uprawnienia</h3>
          </div>
          <div className="text-sm font-medium">
            Stan Konta: <span className="text-amber-600 dark:text-amber-500">zł {Number(data.user?.balance || 0).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-lg">Prawo jazdy (Kategoria CE)</h4>
                <p className="text-sm text-zinc-500 mt-1">Wymagane do prowadzenia zestawów ciężarowych. Koszt odnowienia: 250 zł.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end">
              <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${isExpiringSoon(data.user.drivingLicenseExpiry) ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                {calculateDaysLeft(data.user.drivingLicenseExpiry)}
              </span>
              <button 
                onClick={() => {
                  if ((data.user?.balance || 0) < 250) {
                    toast.error("Niewystarczające środki na koncie. Wymagane: 250 zł.");
                  } else {
                    router.push("/dashboard/exam?type=license");
                  }
                }} 
                className="text-sm font-bold px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                ODNÓW (250zł)
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-lg">Badania lekarskie i psychologiczne</h4>
                <p className="text-sm text-zinc-500 mt-1">Niezbędne do zachowania zdolności do pracy. Koszt: 150 zł.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end">
              <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${isExpiringSoon(data.user.medicalExamExpiry) ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                {calculateDaysLeft(data.user.medicalExamExpiry)}
              </span>
              <button 
                onClick={() => {
                  if ((data.user?.balance || 0) < 150) {
                    toast.error("Niewystarczające środki na koncie. Wymagane: 150 zł.");
                  } else {
                    router.push("/dashboard/exam?type=medical");
                  }
                }} 
                className="text-sm font-bold px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                ZRÓB BADANIA (150zł)
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors opacity-60">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-lg">Uprawnienia ADR (Towary niebezpieczne)</h4>
                <p className="text-sm text-zinc-500 mt-1">Kurs planowany wkrótce.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end">
              <span className="text-sm font-bold px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                NIEDOSTĘPNE
              </span>
              <button disabled className="text-sm font-bold px-4 py-2 bg-zinc-300 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-600 rounded-lg cursor-not-allowed">
                ZAPISZ SIĘ NA KURS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


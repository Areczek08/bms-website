"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Save, ArrowLeft, Truck as TruckIcon, MapPin, Map, Package, Activity, Clock, ShieldAlert, Euro } from "lucide-react";
import Link from "next/link";

export default function AddJobPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState(false);
  const [fleet, setFleet] = useState({ trucks: [], trailers: [] });
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    startCity: "",
    endCity: "",
    sourceCompany: "",
    destinationCompany: "",
    cargo: "",
    weight: "",
    distance: "",
    plannedDistance: "",
    breakdowns: "Brak",
    averageFuel: "",
    summaryScreenshot: "",
    truckScreenshot: "",
    truckId: "",
    trailerId: ""
  });
  
  const [summaryFile, setSummaryFile] = useState(null);
  const [truckFile, setTruckFile] = useState(null);

  useEffect(() => {
    // Pobranie floty
    fetch("/api/fleet")
      .then(res => res.json())
      .then(data => {
        if(data.trucks && data.trailers) {
          setFleet({ trucks: data.trucks, trailers: data.trailers });
          
          // Automatyczne dopasowanie zestawu gracza
          if (session?.user?.id) {
            const myTruck = data.trucks.find(t => t.assignedDriver?.id === session.user.id);
            if (myTruck) {
              setFormData(prev => ({
                ...prev,
                truckId: myTruck.id,
                trailerId: myTruck.attachedTrailer?.id || ""
              }));
            }
          }
        }
      })
      .catch(err => console.error(err));
  }, [session]);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalSummaryUrl = formData.summaryScreenshot;
      let finalTruckUrl = formData.truckScreenshot;

      if (summaryFile) {
        if (summaryFile.size > 5 * 1024 * 1024) throw new Error("Plik podsumowania jest za duży (max 5MB przed kompresją).");
        finalSummaryUrl = await compressImage(summaryFile);
      }

      if (truckFile) {
        if (truckFile.size > 5 * 1024 * 1024) throw new Error("Zdjęcie ciężarówki jest za duże (max 5MB przed kompresją).");
        finalTruckUrl = await compressImage(truckFile);
      }

      const res = await fetch("/api/user/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          summaryScreenshot: finalSummaryUrl,
          truckScreenshot: finalTruckUrl
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Wystąpił błąd");
      }

      router.push("/dashboard/jobs");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/jobs" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dodaj Nową Trasę</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Uzupełnij szczegóły zlecenia z podsumowania Trucksbook.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* INFORMACJE O DOSTAWIE */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold">Informacje o dostawie</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Z (Miejscowość)</label>
              <input required name="startCity" value={formData.startCity} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="np. Gdańsk" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Do (Miejscowość)</label>
              <input required name="endCity" value={formData.endCity} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="np. Szczecin" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Firma załadunkowa</label>
              <input required name="sourceCompany" value={formData.sourceCompany} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="np. BCP" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Firma rozładunkowa</label>
              <input required name="destinationCompany" value={formData.destinationCompany} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="np. EuroGoodies" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Towar</label>
              <input required name="cargo" value={formData.cargo} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="np. Arbuzy" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Waga (kg)</label>
              <input required type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="np. 20170" />
            </div>
          </div>
        </div>

        {/* LOGISTYKA I STATYSTYKI */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold">Logistyka i Statystyki</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-zinc-500">Zaplanowany dystans (km)</label>
              <input required type="number" name="plannedDistance" value={formData.plannedDistance} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5" placeholder="np. 361" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-blue-500 font-semibold">Przebyty dystans (km)</label>
              <input required type="number" name="distance" value={formData.distance} onChange={handleChange} className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg px-4 py-2.5" placeholder="np. 374" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-red-500">Awarie / Usterki</label>
              <input name="breakdowns" value={formData.breakdowns} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5" placeholder="np. Brak" />
            </div>
          </div>
        </div>

        {/* POJAZD I PALIWO */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center gap-2">
            <TruckIcon className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold">Pojazd i Zestaw</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Ciągnik (Zestaw)</label>
              <select name="truckId" value={formData.truckId} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5 font-medium">
                <option value="">-- Brak / Nie dotyczy --</option>
                {fleet.trucks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.brand} {t.model} ({t.plate}) {t.assignedDriver?.id === session?.user?.id ? " - Mój przypisany" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Naczepa</label>
              <select name="trailerId" value={formData.trailerId} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5 font-medium">
                <option value="">-- Brak / Nie dotyczy --</option>
                {fleet.trailers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.brand} {t.type} ({t.plate})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <label className="block text-sm font-medium mb-1">Średnie spalanie (l/100km)</label>
              <input type="number" step="0.01" name="averageFuel" value={formData.averageFuel} onChange={handleChange} className="w-full max-w-sm bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5" placeholder="np. 34.1" />
            </div>
          </div>
        </div>

        {/* SCREENSHOTS */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <label className="block text-sm font-medium">Podsumowanie trasy (Trucksbook)</label>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Wybierz plik z dysku...</label>
                  <input type="file" accept="image/*" onChange={(e) => setSummaryFile(e.target.files[0])} className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                  <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs uppercase">lub</span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Wklej link (https://...)</label>
                  <input name="summaryScreenshot" value={formData.summaryScreenshot} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5" placeholder="https://..." required={!summaryFile} />
                </div>
             </div>

             <div className="space-y-4">
                <label className="block text-sm font-medium">Zdjęcie ciężarówki z ładunkiem (opcjonalnie)</label>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Wybierz plik z dysku...</label>
                  <input type="file" accept="image/*" onChange={(e) => setTruckFile(e.target.files[0])} className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                  <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs uppercase">lub</span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Wklej link (https://...)</label>
                  <input name="truckScreenshot" value={formData.truckScreenshot} onChange={handleChange} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2.5" placeholder="https://..." />
                </div>
             </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/jobs">
            <button type="button" className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl font-medium transition-colors">
              Anuluj
            </button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Zatwierdź i Wyślij Trasę
          </motion.button>
        </div>

      </form>
    </div>
  );
}

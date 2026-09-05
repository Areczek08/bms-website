"use client";
import { toast } from "sonner";
import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Truck as TruckIcon, 
  Activity, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  User, 
  ChevronRight, 
  ArrowRight,
  Package
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("../../components/RouteMap"), { ssr: false });

export default function JobDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  const { data: session } = useSession();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = session?.user?.role === "BOARD" || session?.user?.role === "OWNER" || session?.user?.role === "DISPATCHER";

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = () => {
    setLoading(true);
    fetch(`/api/dispatcher/jobs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.job) {
          setJob(data.job);
        } else {
          router.push("/dashboard/dispatcher");
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Nie udało się pobrać szczegółów trasy.");
        setLoading(false);
        router.push("/dashboard/dispatcher");
      });
  };

  const handleDecision = async (status) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/dispatcher/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comment })
      });
      if (res.ok) {
        toast.success(status === "APPROVED" ? "Trasa zatwierdzona pomyślnie!" : "Trasa odrzucona.");
        fetchJob();
      } else {
        const d = await res.json();
        toast.error(d.error || "Wystąpił błąd podczas rozpatrywania zlecenia.");
      }
    } catch (err) {
      toast.error("Błąd połączenia.");
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) return null;

  const getDriverDisplayName = (user) => {
    if (!user) return "Nieznany kierowca";
    return user.discordNick || user.firstName || user.name || "Nieznany kierowca";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5"/> Zatwierdzona</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20"><XCircle className="w-3.5 h-3.5"/> Odrzucona</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20"><Activity className="w-3.5 h-3.5"/> Oczekuje</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/dispatcher" className="p-3 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">Szczegóły Trasy</h1>
              {getStatusBadge(job.status)}
            </div>
            <p className="text-zinc-500 mt-1">Zlecenia transportowe Bojar Manager System</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Map & Transport Details */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Map Section */}
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" /> Wizualizacja Trasy
            </h3>
            <div className="h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-inner relative">
              <RouteMap startCity={job.startCity} endCity={job.endCity} />
            </div>
          </div>

          {/* transport Details spec-card like the vehicle detail view */}
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> Karta przewozowa trasy
            </h3>
            
            <div className="divide-y divide-white/5">
              <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium" style={{ color: '#d4d4d8' }}>Skąd → Dokąd</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#ffffff' }}>
                  {job.startCity} → {job.endCity}
                </span>
              </div>

              <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-pink-400" />
                  <span className="text-sm font-medium" style={{ color: '#d4d4d8' }}>Ładunek i waga</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#ffffff' }}>
                  {job.cargo} {job.weight ? `(${job.weight.toLocaleString()} kg)` : '(Brak wagi)'}
                </span>
              </div>

              <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium" style={{ color: '#d4d4d8' }}>Dystans rzeczywisty</span>
                </div>
                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {job.distance} km
                </span>
              </div>

              <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium" style={{ color: '#d4d4d8' }}>Średnie spalanie</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#ffffff' }}>
                  {job.averageFuel ? `${job.averageFuel} l/100km` : 'Brak danych'}
                </span>
              </div>

              <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium" style={{ color: '#d4d4d8' }}>Data rejestracji trasy</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#ffffff' }}>
                  {new Date(job.createdAt).toLocaleString("pl-PL")}
                </span>
              </div>

              {(job.sourceCompany || job.destinationCompany) && (
                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium" style={{ color: '#d4d4d8' }}>Logistyka firmowa</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#ffffff' }}>
                    {job.sourceCompany || "-"} do {job.destinationCompany || "-"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Awarie / Usterki section if any */}
          {job.breakdowns && job.breakdowns !== "Brak" && (
            <div className="bg-red-950/20 border border-red-500/30 p-6 rounded-3xl flex gap-4 text-red-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="font-bold text-base">Zgłoszone awarie / usterki</h4>
                <p className="text-sm mt-2 font-medium" style={{ color: '#fca5a5' }}>{job.breakdowns}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Driver, Set & Actions */}
        <div className="space-y-8">
          
          {/* Driver Card */}
          <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-6">Kierowca</h3>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center overflow-hidden border border-white/10 shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                {job.user?.image ? (
                  <img src={job.user.image} alt="Driver" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Dane kierowcy</p>
                <p className="font-bold text-lg text-white">{getDriverDisplayName(job.user)}</p>
              </div>
            </div>
          </div>

          {/* Set / Zestaw drogowy section */}
          <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Zestaw Drogowy</h3>
            <div className="space-y-4">
              {/* Truck Card */}
              {job.truck && (
                <div 
                  onClick={() => router.push(`/dashboard/fleet/${job.truck.id}`)}
                  className="p-4 rounded-2xl border bg-zinc-900/40 border-white/5 hover:bg-zinc-800/60 hover:border-blue-500/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:text-blue-400 transition-colors">
                      <TruckIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Ciągnik siodłowy</span>
                      <span className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                        {job.truck.plate} - {job.truck.brand} {job.truck.model}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
              )}

              {/* Trailer Card */}
              {job.trailer && (
                <div 
                  onClick={() => router.push(`/dashboard/fleet/${job.trailer.id}`)}
                  className="p-4 rounded-2xl border bg-zinc-900/40 border-white/5 hover:bg-zinc-800/60 hover:border-pink-500/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 group-hover:text-pink-450 transition-colors">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Naczepa firmowa</span>
                      <span className="font-bold text-white text-sm group-hover:text-pink-400 transition-colors">
                        {job.trailer.plate} - {job.trailer.brand} {job.trailer.type}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
              )}
            </div>
          </div>

          {/* Dispatcher Actions Panel */}
          {job.status === "PENDING" && isAdmin && (
            <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
              <h3 className="text-xl font-bold text-white">Rozpatrz Zgłoszenie</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase mb-1.5 block">Komentarz dyspozytora</label>
                  <textarea 
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Wpisz ewentualne uwagi lub komentarz..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-24 text-sm"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => handleDecision("REJECTED")}
                    disabled={actionLoading}
                    className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Odrzuć
                  </button>
                  <button 
                    onClick={() => handleDecision("APPROVED")}
                    disabled={actionLoading}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Zatwierdź
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dispatcher Comment display if already processed */}
          {job.status !== "PENDING" && job.dispatcherComment && (
            <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Uwagi dyspozytora</h3>
              <div className="bg-black/30 border border-white/5 p-4 rounded-xl text-sm font-medium text-zinc-300">
                {job.dispatcherComment}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

"use client";
import { toast } from "sonner";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Truck, Calendar, PenTool as Tool, Wrench, AlertTriangle, Settings, Fuel, ChevronRight, CheckCircle2, Package, History, Droplets, CreditCard, Activity, User, Edit2, X, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LicensePlate from "../../../components/LicensePlate";

export default function VehicleDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(null); // 'REFUEL', 'WASH', 'SERVICE', 'ASSIGN_DRIVER'
  const [actionInput, setActionInput] = useState({ amount: "", cost: "", description: "", driverId: "", assignedAt: "" });
  const [availableDrivers, setAvailableDrivers] = useState([]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "BOARD" || session?.user?.role === "OWNER" || session?.user?.role === "DISPATCHER";
  
  const fetchVehicle = () => {
    fetch(`/api/fleet/${id}`)
      .then(res => res.json())
      .then(data => {
        if(data.vehicle) {
          setData(data);
        } else {
          router.push("/dashboard/fleet");
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.push("/dashboard/fleet");
      });
  };

  useEffect(() => {
    fetchVehicle();
    if (isAdmin) {
      fetch("/api/drivers")
        .then(res => res.json())
        .then(data => {
          if (data.drivers) setAvailableDrivers(data.drivers);
        })
        .catch(console.error);
    }
  }, [id, router, isAdmin]);

  const handleAction = async (actionType) => {
    if (actionType === 'ASSIGN_DRIVER') {
      setActionLoading(true);
      try {
        const res = await fetch(`/api/fleet/set`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            truckId: id,
            driverId: actionInput.driverId,
            trailerId: data.vehicle.attachedTrailer?.id || "",
            assignedAt: actionInput.assignedAt || undefined
          })
        });
        if (res.ok) {
          setShowModal(null);
          fetchVehicle();
        } else {
          toast.error("Błąd podczas przypisywania kierowcy.");
        }
      } catch (err) {
        toast.error("Błąd połączenia.");
      }
      setActionLoading(false);
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/fleet/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          amount: parseFloat(actionInput.amount) || 0,
          cost: parseFloat(actionInput.cost) || 0,
          description: actionInput.description
        })
      });

      if(res.ok) {
        setShowModal(null);
        setActionInput({ amount: "", cost: "", description: "" });
        fetchVehicle(); // Refresh data
      } else {
        toast.error("Wystąpił błąd podczas akcji.");
      }
    } catch(e) {
      console.error(e);
      toast.error("Wystąpił błąd.");
    }
    setActionLoading(false);
  };

  const handleEditClick = () => {
    setFormData({
      category: data.vehicleType === "truck" ? "Ciągnik" : "Naczepa",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      plate: vehicle.plate || "",
      fleetNumber: vehicle.fleetNumber || "",
      productionYear: vehicle.productionYear || "",
      power: vehicle.power || "",
      type: vehicle.type || "",
      imageUrl: vehicle.imageUrl || "",
      mileage: vehicle.mileage || "",
      status: vehicle.status || "AVAILABLE",
      ownershipStatus: vehicle.ownershipStatus || "Własność",
      inCompanySince: vehicle.inCompanySince ? new Date(vehicle.inCompanySince).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      vin: vehicle.vin || "",
      location: vehicle.location || "",
      averageFuel: vehicle.averageFuel || ""
    });
    setIsEditModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/fleet/${id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if(res.ok) {
        setIsEditModalOpen(false);
        fetchVehicle();
      } else {
        const d = await res.json();
        toast.error(d.error || "Wystąpił błąd");
      }
    } catch (err) {
      toast.error("Wystąpił błąd");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (res.ok && d.success) {
        setFormData({ ...formData, imageUrl: d.url });
      } else {
        toast.error(d.error || "Błąd podczas wgrywania pliku");
      }
    } catch (err) {
      toast.error("Błąd połączenia podczas wgrywania pliku");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { vehicle, vehicleType } = data;
  const isTruck = vehicleType === "truck";

  const getCleanlinessLabel = (val) => {
    if (val >= 90) return "Idealnie czysty";
    if (val >= 70) return "Lekko zakurzony";
    if (val >= 50) return "Lekko brudny";
    if (val >= 30) return "Brudny";
    if (val >= 10) return "Bardzo brudny";
    return "Ujebany błotem";
  };

  const getConditionLabel = (val) => {
    if (val >= 90) return "W pełni sprawny";
    if (val >= 70) return "Drobne usterki";
    if (val >= 40) return "Wymaga serwisu";
    return "Niesprawny";
  };

  const lastLocation = isTruck 
    ? (vehicle.assignedDriver?.jobs?.[0]?.endCity 
        ? `${vehicle.assignedDriver.jobs[0].endCity}${vehicle.assignedDriver.jobs[0].endCountry ? `, ${vehicle.assignedDriver.jobs[0].endCountry}` : ""}` 
        : (vehicle.location || "-"))
    : (vehicle.attachedTruck?.assignedDriver?.jobs?.[0]?.endCity 
        ? `${vehicle.attachedTruck.assignedDriver.jobs[0].endCity}${vehicle.attachedTruck.assignedDriver.jobs[0].endCountry ? `, ${vehicle.attachedTruck.assignedDriver.jobs[0].endCountry}` : ""}` 
        : (vehicle.location || "-"));

  const getStatusBadge = (status) => {
    switch(status) {
      case "AVAILABLE": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5"/> Dostępny</span>;
      case "MAINTENANCE": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20"><Wrench className="w-3.5 h-3.5"/> Serwis</span>;
      case "IN_USE": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20"><Truck className="w-3.5 h-3.5"/> Zajęty</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">{status}</span>;
    }
  };

  const getHistoryIcon = (type) => {
    switch(type) {
      case "REPAIR": return <Tool className="w-4 h-4 text-orange-400" />;
      case "SERVICE": return <Wrench className="w-4 h-4 text-red-400" />;
      case "REFUEL": return <Fuel className="w-4 h-4 text-amber-400" />;
      case "WASH": return <Droplets className="w-4 h-4 text-blue-400" />;
      case "DRIVER_CHANGE": return <User className="w-4 h-4 text-indigo-400" />;
      case "FAILURE": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <History className="w-4 h-4 text-zinc-400" />;
    }
  };

  const isAssignedToCurrentUser = session?.user?.id === vehicle.assignedDriverId;
  const canPerformActions = isTruck && (isAdmin || isAssignedToCurrentUser);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/fleet" className="p-3 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">Profil Pojazdu</h1>
              {getStatusBadge(vehicle.status)}
            </div>
            <p className="text-zinc-500 mt-1">Zarządzanie, statystyki i historia operacji</p>
          </div>
        </div>
        {isAdmin && (
          <button 
            onClick={handleEditClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white rounded-xl font-semibold transition-colors"
          >
            <Edit2 className="w-4 h-4 text-blue-400" /> Edytuj Dane Pojazdu
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Visuals & RPG */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Hero Banner */}
          <div className="relative rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10 pointer-events-none" />
            <div className="flex aspect-[16/9] w-full relative">
              <div className="flex-1 relative">
                {vehicle.imageUrl ? (
                  <img src={vehicle.imageUrl} alt={vehicle.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950">
                    <Truck className="w-24 h-24 text-zinc-800 mb-4" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <div className="inline-flex px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-zinc-300 text-xs font-bold mb-3 border border-white/10 uppercase tracking-widest">
                    {vehicle.type}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{vehicle.brand} {vehicle.model}</h2>
                  <div className="flex items-center gap-4 text-zinc-400">
                    <span>Rok: {vehicle.productionYear}</span>
                    {isTruck && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                        <span>Przebieg: {vehicle.mileage.toLocaleString()} km</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-left md:text-right flex flex-col items-start md:items-end">
                  <p className="text-sm text-zinc-500 font-medium mb-1.5 uppercase tracking-wider">Rejestracja</p>
                  <LicensePlate plate={vehicle.plate} scale={0.45} className="shadow-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Info o Naczepie (nad systemami pojazdu) */}
          {isTruck && vehicle.attachedTrailer && (
            <div className="bg-zinc-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-500/10 text-pink-500 rounded-xl shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-sm">
                  <span className="text-zinc-500 font-medium">Przypięta naczepa: </span>
                  <span className="text-white font-bold">{vehicle.attachedTrailer.brand} {vehicle.attachedTrailer.model} </span>
                  <span className="text-zinc-500 font-medium">({vehicle.attachedTrailer.type})</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Rejestracja naczepy</span>
                <LicensePlate plate={vehicle.attachedTrailer.plate} scale={0.32} className="shadow-md" />
              </div>
            </div>
          )}

          {/* Info o Ciągniku dla naczepy */}
          {!isTruck && vehicle.attachedTruck && (
            <div className="bg-zinc-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="text-sm">
                  <span className="text-zinc-500 font-medium">Podpięty ciągnik: </span>
                  <span className="text-white font-bold">{vehicle.attachedTruck.brand} {vehicle.attachedTruck.model} </span>
                  <span className="text-zinc-500 font-medium">(#{vehicle.attachedTruck.fleetNumber})</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Rejestracja ciągnika</span>
                <LicensePlate plate={vehicle.attachedTruck.plate} scale={0.32} className="shadow-md" />
              </div>
            </div>
          )}

          {/* Info o Bazie Logistycznej (Depot Info) */}
          {isTruck && (
            <div className="bg-zinc-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl shrink-0 border border-amber-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-sm">
                  <span className="text-zinc-500 font-medium">Przypisana Baza Logistyczna: </span>
                  {vehicle.companyBase ? (
                    <span className="text-white font-bold">{vehicle.companyBase.name} ({vehicle.companyBase.city})</span>
                  ) : (
                    <span className="text-zinc-400 italic">Brak przypisanej bazy</span>
                  )}
                </div>
              </div>

              {vehicle.companyBase ? (
                <Link 
                  href="/dashboard/admin/bases"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-amber-400 rounded-xl transition-colors shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5" /> Zobacz Bazę i Udogodnienia
                </Link>
              ) : (
                isAdmin && (
                  <Link 
                    href="/dashboard/admin/bases"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 rounded-xl transition-colors shrink-0"
                  >
                    + Przypisz do Bazy
                  </Link>
                )
              )}
            </div>
          )}

          {/* RPG HUD (Actions & Vitals) */}
          {isTruck && (
            <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" /> Systemy Pojazdu
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">Status operacyjny i zarządzanie zasobami</p>
                </div>

                {canPerformActions && (
                  <div className="flex gap-3 mt-4 md:mt-0">
                    <button onClick={() => setShowModal('WASH')} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-blue-500/30 text-blue-400 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      <Droplets className="w-4 h-4" /> Umyj
                    </button>
                    <button onClick={() => setShowModal('SERVICE')} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-red-500/30 text-red-400 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      <Wrench className="w-4 h-4" /> Serwis
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* Fuel Meter */}
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group flex flex-col justify-between items-center text-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full group-hover:bg-amber-500/20 transition-colors pointer-events-none" />
                  <div className="flex flex-col items-center gap-2 mb-6 relative z-10 w-full">
                    <div className="flex items-center gap-3 text-zinc-300 font-semibold text-sm">
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20"><Fuel className="w-4 h-4 text-amber-500"/></div>
                      Paliwo
                    </div>
                    <span className="text-base sm:text-lg font-bold text-white tracking-tight text-center w-full block mt-1">{vehicle.fuelLevel}%</span>
                  </div>
                  <div className="w-full bg-zinc-900/80 h-4 rounded-full overflow-hidden shadow-inner relative z-10 border border-white/5 mt-auto">
                    <div className={`h-full rounded-full ${vehicle.fuelLevel < 20 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]'}`} style={{ width: `${Math.min(vehicle.fuelLevel, 100)}%` }} />
                  </div>
                </div>

                {/* Cleanliness Meter */}
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group flex flex-col justify-between items-center text-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-colors pointer-events-none" />
                  <div className="flex flex-col items-center gap-2 mb-6 relative z-10 w-full">
                    <div className="flex items-center gap-3 text-zinc-300 font-semibold text-sm">
                      <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20"><Droplets className="w-4 h-4 text-blue-400"/></div>
                      Czystość
                    </div>
                    <span className="text-base sm:text-lg font-bold text-white tracking-tight text-center w-full block mt-1" title={getCleanlinessLabel(vehicle.cleanliness)}>
                      {getCleanlinessLabel(vehicle.cleanliness)}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900/80 h-4 rounded-full overflow-hidden shadow-inner relative z-10 border border-white/5 mt-auto">
                    <div className={`h-full rounded-full ${vehicle.cleanliness < 40 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]' : 'bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)]'}`} style={{ width: `${Math.min(vehicle.cleanliness, 100)}%` }} />
                  </div>
                </div>

                {/* Condition Meter */}
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group flex flex-col justify-between items-center text-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />
                  <div className="flex flex-col items-center gap-2 mb-6 relative z-10 w-full">
                    <div className="flex items-center gap-3 text-zinc-300 font-semibold text-sm">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20"><Settings className="w-4 h-4 text-emerald-400"/></div>
                      Stan Tech.
                    </div>
                    <span className="text-base sm:text-lg font-bold text-white tracking-tight text-center w-full block mt-1" title={getConditionLabel(vehicle.condition)}>
                      {getConditionLabel(vehicle.condition)}
                    </span>
                    <p className="text-[11px] text-zinc-400 text-center font-medium mt-1">Do przeglądu: <span className="text-emerald-400 font-bold">{(vehicle.serviceLimitKm - vehicle.mileage).toLocaleString()} km</span></p>
                  </div>
                  <div className="w-full bg-zinc-900/80 h-4 rounded-full overflow-hidden shadow-inner relative z-10 border border-white/5 mt-auto">
                    <div className={`h-full rounded-full ${vehicle.condition < 50 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]'}`} style={{ width: `${Math.min(vehicle.condition, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dane Techniczne i Status Pojazdu */}
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" /> Dane Techniczne i Status Pojazdu
            </h3>
            
            <div className="divide-y divide-white/5">
              {/* Ostatnia lokalizacja */}
              <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium" style={{ color: '#d4d4d8' }}>Ostatnia lokalizacja (TrucksBook)</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#ffffff' }}>{lastLocation}</span>
              </div>

              {/* VIN */}
              <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium" style={{ color: '#d4d4d8' }}>Numer VIN</span>
                </div>
                <span className="text-sm font-bold font-mono" style={{ color: '#ffffff' }}>{vehicle.vin || "-"}</span>
              </div>

              {/* Status Własności */}
              <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium" style={{ color: '#d4d4d8' }}>Status własności</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#ffffff' }}>{vehicle.ownershipStatus || "Własność"}</span>
              </div>

              {/* W firmie od */}
              <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium" style={{ color: '#d4d4d8' }}>W firmie od</span>
                </div>
                <span className="text-sm font-bold font-medium" style={{ color: '#ffffff' }}>
                  {vehicle.inCompanySince ? new Date(vehicle.inCompanySince).toLocaleDateString("pl-PL") : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Driver & Timeline */}
        <div className="space-y-8">
          
          {/* Driver Card */}
          <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-6">Przypisanie</h3>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center overflow-hidden border border-white/10 shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                {vehicle.assignedDriver?.image ? (
                  <img src={vehicle.assignedDriver.image} alt="Driver" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Kierowca</p>
                {isTruck ? (
                  <p className="font-bold text-lg text-white">{vehicle.assignedDriver ? vehicle.assignedDriver.name : "Wolny pojazd"}</p>
                ) : (
                  <p className="font-bold text-sm text-zinc-400">Podlega pod ciągnik</p>
                )}
              </div>
            </div>
            {isAdmin && isTruck && (
              <button 
                onClick={() => {
                  setActionInput({
                    ...actionInput, 
                    driverId: vehicle.assignedDriverId || "", 
                    assignedAt: vehicle.assignedAt ? new Date(vehicle.assignedAt).toISOString().split('T')[0] : ""
                  });
                  setShowModal('ASSIGN_DRIVER');
                }}
                className="w-full mt-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl text-sm font-semibold text-zinc-300 transition-colors"
              >
                Zmień przypisanie
              </button>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Oś Czasu (Logi)
            </h3>
            
            <div className="relative border-l border-white/10 ml-4 space-y-8 pb-4">
              {vehicle.history && vehicle.history.length > 0 ? (
                vehicle.history.map((event, idx) => (
                  <div key={idx} className="relative pl-8 group">
                    <span className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform">
                      {getHistoryIcon(event.type)}
                    </span>
                    <div className="bg-black/30 border border-white/5 rounded-xl p-4 group-hover:border-white/10 transition-colors">
                      <p className="text-sm font-medium text-white mb-2">{event.description}</p>
                      
                      {/* Driver info if exists */}
                      {event.user && (
                        <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1.5">
                          <User className="w-3 h-3"/> Wykonał: <span className="text-zinc-300">{event.user.name}</span>
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {new Date(event.date).toLocaleDateString("pl-PL")} {new Date(event.date).toLocaleTimeString("pl-PL", {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        {event.cost > 0 && (
                          <p className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                            -{event.cost.toLocaleString('pl-PL')} zł
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-8 text-sm text-zinc-500 py-4">
                  Brak zdarzeń w historii tego pojazdu.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Action Modals */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowModal(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl p-8 relative z-10 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                {showModal === 'WASH' && "Myjnia Firmowa"}
                {showModal === 'SERVICE' && "Wniosek Serwisowy"}
                {showModal === 'ASSIGN_DRIVER' && "Przypisz Kierowcę"}
              </h3>
              <p className="text-zinc-400 text-sm mb-6">
                {showModal === 'WASH' && "Koszt myjni z karty firmowej wynosi stałe 200 zł. Czy na pewno chcesz umyć pojazd?"}
                {showModal === 'SERVICE' && "Wpisz szczegóły naprawy i opcjonalny przewidywany koszt. Zarząd rozpatrzy Twój wniosek."}
                {showModal === 'ASSIGN_DRIVER' && "Wybierz kierowcę z listy, aby przypisać go do tego pojazdu."}
              </p>

              <div className="space-y-4">
                {showModal === 'ASSIGN_DRIVER' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase mb-1 block">Wybierz Kierowcę</label>
                      <select 
                        value={actionInput.driverId} 
                        onChange={e => setActionInput({...actionInput, driverId: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Brak przypisanego kierowcy --</option>
                        {availableDrivers.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.discordNick || d.name || d.firstName || "Kierowca"}{d.email ? ` (${d.email})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-4">
                      <label className="text-xs font-semibold text-zinc-500 uppercase mb-1 block">Data przypisania (Opcjonalnie)</label>
                      <input 
                        type="date" 
                        value={actionInput.assignedAt || ""} 
                        onChange={e => setActionInput({...actionInput, assignedAt: e.target.value})} 
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" 
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">Zostaw puste aby ustawić dzisiejszą. Potrzebne do wyliczenia dni do wymiany zestawu.</p>
                    </div>
                  </>
                )}
                {showModal === 'SERVICE' && (
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase mb-1 block">Szacowany koszt (zł)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input 
                        type="number" value={actionInput.cost} onChange={e => setActionInput({...actionInput, cost: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Np. 1500"
                      />
                    </div>
                  </div>
                )}

                {showModal === 'SERVICE' && (
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase mb-1 block">Opis Usterki (Wymagany)</label>
                    <textarea 
                      value={actionInput.description} onChange={e => setActionInput({...actionInput, description: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-24" placeholder="Szczegóły operacji..."
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowModal(null)} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold transition-colors">
                  Anuluj
                </button>
                <button 
                  onClick={() => handleAction(showModal)} 
                  disabled={actionLoading || (showModal === 'SERVICE' && !actionInput.description)}
                  className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${actionLoading || (showModal === 'SERVICE' && !actionInput.description) ? 'opacity-50 cursor-not-allowed' : ''} ${
                    showModal === 'WASH' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 
                    showModal === 'ASSIGN_DRIVER' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' :
                    'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                  }`}
                >
                  {actionLoading ? "Przetwarzanie..." : (showModal === 'WASH' ? "Potwierdź (200 zł)" : showModal === 'ASSIGN_DRIVER' ? "Przypisz" : "Wyślij Wniosek")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Edycji */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Edytuj Pojazd</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
              </div>
              
              <form onSubmit={handleModalSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-zinc-400 mb-2 block">Marka</label>
                    <select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" required>
                      <option value="" disabled>Wybierz markę</option>
                      <option value="Scania">Scania</option><option value="Volvo">Volvo</option><option value="MAN">MAN</option>
                      <option value="DAF">DAF</option><option value="Mercedes-Benz">Mercedes-Benz</option><option value="Renault">Renault</option>
                      <option value="Iveco">Iveco</option><option value="Wielton">Wielton</option><option value="Schmitz">Schmitz</option>
                      <option value="Krone">Krone</option><option value="Kögel">Kögel</option><option value="Kässbohrer">Kässbohrer</option>
                      <option value="D-tec">D-tec</option>
                      <option value="Inna">Inna</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-zinc-400 mb-2 block">Model</label>
                    <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" required />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-zinc-400 mb-2 block">Rejestracja</label>
                    <input type="text" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" required />
                  </div>
                  {formData.category !== "Naczepa" && (
                    <div>
                      <label className="text-sm font-semibold text-zinc-400 mb-2 block">Nr Flotowy</label>
                      <input type="text" value={formData.fleetNumber} onChange={e => setFormData({...formData, fleetNumber: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-zinc-400 mb-2 block">Rok Produkcji</label>
                    <input type="number" value={formData.productionYear} onChange={e => setFormData({...formData, productionYear: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" />
                  </div>

                  {formData.category !== "Naczepa" && (
                    <div>
                      <label className="text-sm font-semibold text-zinc-400 mb-2 block">Moc (KM)</label>
                      <input type="number" value={formData.power} onChange={e => setFormData({...formData, power: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" />
                    </div>
                  )}

                  {formData.category === "Naczepa" && (
                    <div>
                      <label className="text-sm font-semibold text-zinc-400 mb-2 block">Typ Naczepy</label>
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none">
                        <option value="Plandeka">Plandeka</option>
                        <option value="Chłodnia">Chłodnia</option>
                        <option value="Izoterma">Izoterma</option>
                        <option value="Wywrotka">Wywrotka</option>
                      </select>
                    </div>
                  )}

                  {formData.category !== "Naczepa" && (
                    <div>
                      <label className="text-sm font-semibold text-zinc-400 mb-2 block">Przebieg</label>
                      <input type="number" value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-zinc-400 mb-2 block">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none">
                      <option value="AVAILABLE">Dostępny</option><option value="MAINTENANCE">W Serwisie</option>
                      <option value="IN_USE">Zajęty</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-zinc-400 mb-2 block">Forma Finansowania</label>
                    <select value={formData.ownershipStatus} onChange={e => setFormData({...formData, ownershipStatus: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none">
                      <option value="Własność">Własność</option><option value="Leasing">Leasing</option><option value="Wynajem">Wynajem</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-zinc-400 mb-2 block">Od kiedy w firmie</label>
                    <input type="date" value={formData.inCompanySince} onChange={e => setFormData({...formData, inCompanySince: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" />
                  </div>

                  {formData.category !== "Naczepa" && (
                    <>
                      <div>
                        <label className="text-sm font-semibold text-zinc-400 mb-2 block">VIN</label>
                        <input type="text" value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" placeholder="Opcjonalnie..." />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-zinc-400 mb-2 block">Średnie spalanie (l/100km)</label>
                        <input type="number" step="0.1" value={formData.averageFuel} onChange={e => setFormData({...formData, averageFuel: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" placeholder="Np. 28.5" />
                      </div>
                    </>
                  )}
                  
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-zinc-400 mb-2 block">Adres URL Zdjęcia lub Wgraj Plik</label>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="flex-1 w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" placeholder="https://..." />
                      <span className="text-xs font-bold text-zinc-500">LUB</span>
                      <label className="cursor-pointer text-center px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold text-white rounded-xl border border-white/10 transition-colors">
                        Wybierz Plik<input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/10 mt-6">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors">Anuluj</button>
                  <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20">Zapisz</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

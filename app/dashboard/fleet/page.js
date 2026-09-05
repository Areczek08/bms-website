"use client";
import { toast } from "sonner";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Wrench, AlertTriangle, CheckCircle2, User, Plus, Search, Filter, Fuel, Bolt, Settings, ChevronRight, Droplets, MapPin, XCircle, Edit2, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CustomSelect = ({ value, onChange, options, placeholder, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt.value === "");

  return (
    <div className="relative" ref={ref}>
      <label className="text-xs text-zinc-500 font-semibold mb-1.5 block">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-black/40 hover:bg-black/60 border border-white/10 rounded-xl text-sm text-zinc-300 cursor-pointer flex justify-between items-center transition-colors select-none"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[100] w-full mt-2 py-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${value === opt.value ? 'bg-blue-500/20 text-blue-400 font-bold' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FleetPage() {
  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Ciągnik"); // Ciągnik, Naczepa, Bus
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ 
    brand: "", 
    status: "",
    minPower: "",
    maxMileage: "",
    trailerType: "", // new filter for trailers
    showRecruits: "yes" // domyślnie pokazujemy rekrutówki zgodnie z nowym życzeniem
  });

  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [zestawFormData, setZestawFormData] = useState({ truckId: "", driverId: "", trailerId: "", imageUrl: "" });

  const router = useRouter();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    category: "Ciągnik",
    brand: "",
    model: "",
    plate: "",
    fleetNumber: "",
    productionYear: "",
    power: "",
    type: "", // specific type like plandeka, chłodnia
    imageUrl: "",
    mileage: "",
    status: "AVAILABLE",
    ownershipStatus: "Własność",
    inCompanySince: new Date().toISOString().split('T')[0],
    vin: "",
    location: "",
    averageFuel: ""
  });

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "BOARD" || session?.user?.role === "OWNER" || session?.user?.role === "DISPATCHER";

  const fetchFleet = () => {
    setError(null);
    fetch("/api/fleet")
      .then(res => res.json())
      .then(data => {
        if(data.error) {
          setError(data.error);
        } else {
          if(data.trucks) setTrucks(data.trucks);
          if(data.trailers) setTrailers(data.trailers);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Błąd połączenia z serwerem. Odśwież stronę.");
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFleet();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status, category = activeTab) => {
    const isFemale = category === "Naczepa";
    switch(status) {
      case "AVAILABLE": return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"><CheckCircle2 className="w-3.5 h-3.5"/> {isFemale ? "Dostępna" : "Dostępny"}</span>;
      case "MAINTENANCE": return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]"><Wrench className="w-3.5 h-3.5"/> Serwis</span>;
      case "IN_USE": return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]"><XCircle className="w-3.5 h-3.5"/> {isFemale ? "Zajęta" : "Zajęty"}</span>;
      default: return <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">{status}</span>;
    }
  };

  const applyFilters = (items) => {
    return items.filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.fleetNumber && item.fleetNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesBrand = filters.brand === "" || item.brand === filters.brand;
      const matchesStatus = filters.status === "" || item.status === filters.status;
      const matchesMinPower = filters.minPower === "" || (item.power && item.power >= parseInt(filters.minPower));
      const matchesMaxMileage = filters.maxMileage === "" || (item.mileage && item.mileage <= parseInt(filters.maxMileage));
      const matchesTrailerType = filters.trailerType === "" || item.type === filters.trailerType;

      const plateLower = item.plate ? item.plate.toLowerCase().replace(/[\s-]/g, '') : "";
      const isRecruit = plateLower.startsWith("gda") || 
                        plateLower.startsWith("ga") || 
                        plateLower.startsWith("wgm") ||
                        (item.model && item.model.toLowerCase().includes("rekrut"));
      
      const matchesRecruits = filters.showRecruits === "yes" || !isRecruit;

      return matchesSearch && matchesBrand && matchesStatus && matchesMinPower && matchesMaxMileage && matchesTrailerType && matchesRecruits;
    });
  };

  const filteredTrucks = applyFilters(trucks.filter(t => t.type === activeTab));
  const filteredTrailers = applyFilters(trailers.filter(t => activeTab === "Naczepa"));
  const displayedItems = activeTab === "Naczepa" ? filteredTrailers : filteredTrucks;
  const uniqueBrands = Array.from(new Set([...trucks, ...trailers].map(item => item.brand))).sort();

  const trailerTypes = [
    "Plandeka", "Chłodnia", "Izoterma", "Wywrotka", "Cysterna", 
    "Platforma", "Niskopodwoziowa", "Podkontenerowa", "Laweta", 
    "Tandem", "Do zwierząt", "BDF", "Kłodnicowa"
  ];

  const totalFleet = trucks.length;
  const availableCount = trucks.filter(t => t.status === "AVAILABLE").length;
  const maintenanceCount = trucks.filter(t => t.status === "MAINTENANCE").length;

  const handleAdd = () => {
    setModalMode("add");
    setEditingVehicle(null);
    setFormData({
      category: activeTab,
      brand: "",
      model: "",
      plate: "",
      fleetNumber: "",
      productionYear: "",
      power: "",
      type: "",
      imageUrl: "",
      mileage: "",
      status: "AVAILABLE",
      ownershipStatus: "Własność",
      inCompanySince: new Date().toISOString().split('T')[0],
      vin: "",
      location: "",
      averageFuel: ""
    });
    setIsModalOpen(true);
  };

  const handleEdit = (e, vehicle) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeTab === "Zestawy") {
      // Otwórz modal zarządzania zestawem
      fetch("/api/drivers")
        .then(res => res.json())
        .then(data => {
          if (data.drivers) setAvailableDrivers(data.drivers);
          setEditingVehicle(vehicle);
          setZestawFormData({
            truckId: vehicle.id,
            driverId: vehicle.assignedDriver?.id || "",
            trailerId: vehicle.attachedTrailer?.id || "",
            imageUrl: vehicle.imageUrl || "",
            assignedAt: vehicle.assignedAt ? new Date(vehicle.assignedAt).toISOString().split('T')[0] : ""
          });
          setIsSetModalOpen(true);
        })
        .catch(() => toast.error("Błąd pobierania kierowców"));
      return;
    }
    setModalMode("edit");
    setEditingVehicle(vehicle);
    setFormData({
      category: activeTab,
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
    setIsModalOpen(true);
  };

  const handleSetModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/fleet/set`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zestawFormData)
      });
      if (res.ok) {
        setIsSetModalOpen(false);
        fetchFleet();
      } else {
        const data = await res.json();
        toast.error(data.error || "Wystąpił błąd podczas zapisywania zestawu");
      }
    } catch (err) {
      toast.error("Wystąpił błąd połączenia");
    }
  };

  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setVehicleToDelete(id);
  };

  const executeDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      const res = await fetch(`/api/fleet/${vehicleToDelete}/delete`, { method: "DELETE" });
      if(res.ok) {
        setVehicleToDelete(null);
        fetchFleet();
      } else {
        const errData = await res.json().catch(()=>({}));
        toast.error("Błąd podczas usuwania: " + (errData.error || res.statusText));
      }
    } catch (err) {
      toast.error("Błąd połączenia");
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const endpoint = modalMode === "add" ? "/api/fleet/create" : `/api/fleet/${editingVehicle.id}/edit`;
    const method = modalMode === "add" ? "POST" : "PUT";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if(res.ok) {
        setIsModalOpen(false);
        fetchFleet();
      } else {
        const data = await res.json();
        toast.error(data.error || "Wystąpił błąd");
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
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFormData({ ...formData, imageUrl: data.url });
      } else {
        toast.error(data.error || "Błąd podczas wgrywania pliku");
      }
    } catch (err) {
      toast.error("Błąd połączenia podczas wgrywania pliku");
    }
  };

  const handleZestawFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setZestawFormData({ ...zestawFormData, imageUrl: data.url });
      } else {
        toast.error(data.error || "Błąd podczas wgrywania pliku");
      }
    } catch (err) {
      toast.error("Błąd połączenia podczas wgrywania pliku");
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-950/40 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2"
          >
            Flota
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg"
          >
            Przeglądaj i zarządzaj swoimi pojazdami.
          </motion.p>
        </div>

        {isAdmin && (
          <motion.button
            onClick={handleAdd}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="relative z-10 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all"
          >
            <Plus className="w-5 h-5" /> Nowy Pojazd
          </motion.button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 bg-red-900/10 border border-red-500/20 rounded-3xl">
          <AlertTriangle className="w-20 h-20 text-red-500 mb-6" />
          <h3 className="text-2xl font-bold text-red-400">Błąd systemu</h3>
          <p className="text-red-400/80 mt-2 text-lg">{error}</p>
          <button onClick={fetchFleet} className="mt-6 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors">Spróbuj ponownie</button>
        </div>
      ) : (
        <>
          {/* Main Tabs Navigation */}
          <div className="flex gap-4 p-2 bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto">
            {["Ciągnik", "Naczepa", "Bus"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setFilters({ brand: "", status: "", minPower: "", maxMileage: "", trailerType: "", showRecruits: "no" });
                }}
                className={`flex-1 md:flex-none px-8 py-4 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? "bg-gradient-to-br from-zinc-800 to-zinc-700 text-white shadow-lg border border-white/10" 
                    : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {tab === "Ciągnik" && "Ciągniki Siodłowe"}
                {tab === "Naczepa" && "Naczepy"}
                {tab === "Bus" && "Busy / Dostawcze"}
              </button>
            ))}
          </div>

          {/* Quick Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={<Truck className="w-6 h-6 text-indigo-400"/>} title="Wielkość Floty" value={totalFleet} subtitle="Bez naczep" />
            <StatCard icon={<CheckCircle2 className="w-6 h-6 text-emerald-400"/>} title="Dostępne Pojazdy" value={availableCount} subtitle="Gotowe do jazdy" />
            <StatCard icon={<Wrench className="w-6 h-6 text-red-400"/>} title="W Serwisie" value={maintenanceCount} subtitle="Pojazdy niesprawne" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Sidebar (Filters) */}
            <div className="xl:col-span-1 space-y-6">
              <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-blue-400" /> Filtry
                </h3>
                
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Szukaj (nr, marka)..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder-zinc-600"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <CustomSelect 
                    label="Marka pojazdu"
                    value={filters.brand}
                    onChange={(val) => setFilters({...filters, brand: val})}
                    placeholder="Wszystkie marki"
                    options={[
                      { value: "", label: "Wszystkie marki" },
                      ...uniqueBrands.map(b => ({ value: b, label: b }))
                    ]}
                  />

                  <CustomSelect 
                    label="Status"
                    value={filters.status}
                    onChange={(val) => setFilters({...filters, status: val})}
                    placeholder="Wszystkie statusy"
                    options={[
                      { value: "", label: "Wszystkie statusy" },
                      { value: "AVAILABLE", label: "Dostępny" },
                      { value: "IN_USE", label: "Zajęty" },
                      { value: "MAINTENANCE", label: "W serwisie" }
                    ]}
                  />

                  {activeTab === "Naczepa" && (
                    <CustomSelect 
                      label="Typ Naczepy"
                      value={filters.trailerType}
                      onChange={(val) => setFilters({...filters, trailerType: val})}
                      placeholder="Wszystkie typy"
                      options={[
                        { value: "", label: "Wszystkie typy" },
                        ...trailerTypes.map(t => ({ value: t, label: t }))
                      ]}
                    />
                  )}

                  {activeTab !== "Naczepa" && (
                    <>
                      <div>
                        <label className="text-xs text-zinc-500 font-semibold mb-1.5 block">Min. Moc (KM)</label>
                        <input 
                          type="number"
                          placeholder="Np. 450"
                          value={filters.minPower}
                          onChange={(e) => setFilters({...filters, minPower: e.target.value})}
                          className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none text-zinc-300"
                        />
                      </div>
                      <CustomSelect 
                        label="Pokaż zestawy rekrutowe"
                        value={filters.showRecruits}
                        onChange={(val) => setFilters({...filters, showRecruits: val})}
                        placeholder="Tak"
                        options={[
                          { value: "yes", label: "Tak" },
                          { value: "no", label: "Nie" }
                        ]}
                      />
                    </>
                  )}

                  <div>
                    <label className="text-xs text-zinc-500 font-semibold mb-1.5 block">Maks. Przebieg (km)</label>
                    <input 
                      type="number"
                      placeholder="Np. 200000"
                      value={filters.maxMileage}
                      onChange={(e) => setFilters({...filters, maxMileage: e.target.value})}
                      className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none text-zinc-300"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({ brand: "", status: "", minPower: "", maxMileage: "", trailerType: "", showRecruits: "no" });
                  }}
                  className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-400 transition-colors uppercase tracking-wider"
                >
                  Zresetuj filtry
                </button>
              </div>
            </div>

            {/* Main Content (1 Column List) */}
            <div className="xl:col-span-3">
              {displayedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-zinc-900/20 border border-white/5 rounded-3xl border-dashed">
                  <Truck className="w-20 h-20 text-zinc-800 mb-6" />
                  <h3 className="text-2xl font-bold text-zinc-400">Brak pojazdów</h3>
                  <p className="text-zinc-600 mt-2 text-lg">Zmień filtry lub wybierz inną zakładkę.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  <AnimatePresence mode="popLayout">
                    {displayedItems.map((item) => {
                      // Formatting title to prevent duplicates (e.g. DAF DAF XG -> DAF XG)
                      let displayModel = item.model;
                      if (displayModel.toLowerCase().startsWith(item.brand.toLowerCase())) {
                        displayModel = displayModel.substring(item.brand.length).trim();
                      }

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.98, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.35 }}
                        >
                          <div 
                            onClick={() => router.push(`/dashboard/fleet/${item.id}`)}
                            className="group cursor-pointer flex flex-col bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/40 transition-all duration-350 hover:shadow-[0_0_50px_rgba(59,130,246,0.12)] hover:-translate-y-1 w-full"
                          >
                            {/* ZDJĘCIE W PROPORCJI 16:9 */}
                            <div className="w-full aspect-[16/9] relative bg-black/60 overflow-hidden border-b border-white/5">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.model} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                  <Truck className="w-24 h-24 text-zinc-800 mb-4" />
                                </div>
                              )}
                              
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                              
                              <div className="absolute top-6 left-6 z-10 flex gap-3">
                                {getStatusBadge(item.status)}
                                <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-sm text-xs font-mono text-white flex items-center gap-2">
                                  <span className="opacity-70">REJ:</span> <span className="font-bold">{item.plate}</span>
                                </div>
                                {item.fleetNumber && (
                                  <div className="px-4 py-1.5 bg-indigo-500/20 text-indigo-200 rounded-xl border border-indigo-500/30 shadow-sm text-xs font-mono font-bold flex items-center gap-2">
                                    <span className="opacity-70">NR:</span> <span>{item.fleetNumber}</span>
                                  </div>
                                )}
                              </div>

                              <div className="absolute bottom-6 left-6 z-10">
                                <span className="text-[11px] uppercase tracking-[0.2em] text-blue-400 font-extrabold block mb-1">PROFIL POJAZDU</span>
                                <h3 className="text-4xl md:text-5xl font-black text-white group-hover:text-blue-400 transition-colors drop-shadow-md">
                                  {item.brand} {displayModel}
                                </h3>
                              </div>
                            </div>

                            {/* DOLNA SEKCJA - SZCZEGÓŁY I STATYSTYKI */}
                            <div className="p-8 flex flex-col gap-6">
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                  {activeTab !== "Naczepa" && (
                                    <div className="bg-black/30 rounded-2xl p-5 border border-white/5 hover:bg-black/40 transition-colors">
                                      <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1.5">Moc silnika</p>
                                      <p className="text-base font-bold text-zinc-200 flex items-center gap-2"><Bolt className="w-5 h-5 text-amber-500"/> {item.power} KM</p>
                                    </div>
                                  )}
                                  {activeTab === "Naczepa" && item.type && (
                                    <div className="bg-black/30 rounded-2xl p-5 border border-white/5 hover:bg-black/40 transition-colors">
                                      <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1.5">Typ naczepy</p>
                                      <p className="text-base font-bold text-zinc-200 flex items-center gap-2"><Truck className="w-5 h-5 text-amber-500"/> {item.type}</p>
                                    </div>
                                  )}
                                  {activeTab !== "Naczepa" && (
                                    <div className="bg-black/30 rounded-2xl p-5 border border-white/5 hover:bg-black/40 transition-colors">
                                      <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1.5">Przebieg</p>
                                      <p className="text-base font-bold text-zinc-200 flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-500"/> {item.mileage?.toLocaleString('pl-PL') || 0} km</p>
                                    </div>
                                  )}
                                  
                                  {activeTab === "Naczepa" && (
                                    <div className="bg-black/30 rounded-2xl p-5 border border-white/5 hover:bg-black/40 transition-colors flex flex-col justify-center">
                                      <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-2">Dostępność</p>
                                      <div>
                                        {item.status === "AVAILABLE" && (
                                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">Wolna</span>
                                        )}
                                        {item.status === "MAINTENANCE" && (
                                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">Serwis</span>
                                        )}
                                        {item.status === "IN_USE" && (
                                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">Zajęta</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {activeTab !== "Naczepa" && (
                                    <>
                                      <div className="bg-black/30 rounded-2xl p-5 border border-white/5 hover:bg-black/40 transition-colors flex flex-col justify-center">
                                        <div className="flex justify-between items-center mb-2">
                                          <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Paliwo</p>
                                          <span className="text-xs font-bold text-zinc-400">{item.fuelLevel?.toFixed(0) || 0}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full ${item.fuelLevel < 20 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} style={{width: `${item.fuelLevel || 0}%`}} />
                                        </div>
                                      </div>
                                      
                                      <div className="bg-black/30 rounded-2xl p-5 border border-white/5 hover:bg-black/40 transition-colors flex flex-col justify-center">
                                        <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-2">Dostępność</p>
                                        <div>
                                          {item.status === "AVAILABLE" && (
                                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">Wolny</span>
                                          )}
                                          {item.status === "MAINTENANCE" && (
                                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">Serwis</span>
                                          )}
                                          {item.status === "IN_USE" && (
                                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">Zajęty</span>
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}
                               </div>

                               <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden shrink-0 shadow-lg">
                                      {activeTab !== "Naczepa" && item.assignedDriver?.image ? (
                                        <img src={item.assignedDriver.image} alt={item.assignedDriver.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <User className="w-7 h-7 text-zinc-400" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">{activeTab === "Naczepa" ? "Podpięty Ciągnik" : "Przypisany Kierowca"}</p>
                                      <p className="text-lg text-white font-black truncate max-w-[250px]">
                                        {activeTab === "Naczepa" 
                                          ? (item.attachedTruck ? item.attachedTruck.plate : "Brak (Wolna)")
                                          : (item.assignedDriver ? item.assignedDriver.name : "Brak kierowcy")}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    {isAdmin && (
                                      <div className="flex items-center gap-2">
                                        <button 
                                          onClick={(e) => handleEdit(e, item)}
                                          className="p-3 rounded-xl bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white transition-all border border-white/5 hover:border-blue-500 shadow-sm"
                                          title={activeTab === 'Zestawy' ? "Zarządzaj Zestawem" : "Edytuj pojazd"}
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        {activeTab !== "Zestawy" && (
                                          <button 
                                            onClick={(e) => handleDelete(e, item.id)}
                                            className="p-3 rounded-xl bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white transition-all border border-white/5 hover:border-red-500 shadow-sm"
                                            title="Usuń pojazd"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    <div className="p-4 bg-white/5 group-hover:bg-blue-600 rounded-2xl transition-colors shadow-lg">
                                      <ChevronRight className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                                    </div>
                                  </div>
                               </div>

                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {vehicleToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setVehicleToDelete(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-zinc-900 border border-red-500/20 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Usuń Pojazd</h2>
              <p className="text-zinc-400 mb-8">Czy na pewno chcesz trwale usunąć ten pojazd? Tej operacji nie można cofnąć, a wszelkie przypisane trasy mogą utracić powiązanie.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setVehicleToDelete(null)}
                  className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  onClick={executeDelete}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all"
                >
                  Tak, usuń
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {modalMode === "add" ? "Dodaj Nowy Pojazd" : "Edytuj Pojazd"}
              </h2>
              
              <form onSubmit={handleModalSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {modalMode === "add" && (
                    <div className="col-span-2">
                      <label className="text-sm font-semibold text-zinc-400 mb-2 block">Kategoria</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
                        required
                      >
                        <option value="Ciągnik">Ciągnik Siodłowy</option>
                        <option value="Naczepa">Naczepa</option>
                        <option value="Bus">Bus</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-zinc-400 mb-2 block">Marka</label>
                    <select 
                      value={formData.brand} 
                      onChange={e => setFormData({...formData, brand: e.target.value})} 
                      className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" 
                      required
                    >
                      <option value="" disabled>Wybierz markę</option>
                      <option value="Scania">Scania</option>
                      <option value="Volvo">Volvo</option>
                      <option value="MAN">MAN</option>
                      <option value="DAF">DAF</option>
                      <option value="Mercedes-Benz">Mercedes-Benz</option>
                      <option value="Renault">Renault</option>
                      <option value="Iveco">Iveco</option>
                      <option value="Wielton">Wielton</option>
                      <option value="Schmitz">Schmitz</option>
                      <option value="Krone">Krone</option>
                      <option value="Kögel">Kögel</option>
                      <option value="Kässbohrer">Kässbohrer</option>
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
                      <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
                      >
                        <option value="">Wybierz...</option>
                        {trailerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  )}

                  {modalMode === "edit" && (
                    <>
                      {formData.category !== "Naczepa" && (
                        <div>
                          <label className="text-sm font-semibold text-zinc-400 mb-2 block">Przebieg</label>
                          <input type="number" value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" />
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-semibold text-zinc-400 mb-2 block">Status</label>
                        <select 
                          value={formData.status}
                          onChange={e => setFormData({...formData, status: e.target.value})}
                          className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
                        >
                          <option value="AVAILABLE">Dostępny</option>
                          <option value="ON_ROUTE">W Trasie / Pracuje</option>
                          <option value="MAINTENANCE">W Serwisie</option>
                          <option value="UNAVAILABLE">Zajęty</option>
                          <option value="DAMAGED">Uszkodzony</option>
                          <option value="STORED">Odstawiony</option>
                          <option value="SOLD">Sprzedany</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="text-sm font-semibold text-zinc-400 mb-2 block">Forma Finansowania / Własność</label>
                    <select 
                      value={formData.ownershipStatus}
                      onChange={e => setFormData({...formData, ownershipStatus: e.target.value})}
                      className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
                    >
                      <option value="Własność">Własność Firmowa</option>
                      <option value="Leasing">Leasing</option>
                      <option value="Wynajem">Wynajem / Najem</option>
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
                        <label className="text-sm font-semibold text-zinc-400 mb-2 block">Lokalizacja (po trasie)</label>
                        <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" placeholder="Opcjonalnie..." />
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
                      <input 
                        type="text" 
                        value={formData.imageUrl} 
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                        className="flex-1 w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none" 
                        placeholder="https://i.imgur.com/... lub wgraj z dysku" 
                      />
                      <span className="text-xs font-bold text-zinc-500">LUB</span>
                      <label className="cursor-pointer w-full md:w-auto text-center px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold text-white rounded-xl border border-white/10 transition-colors">
                        Wybierz Plik
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                </div>

                  <div className="flex gap-4 pt-4 border-t border-white/10 mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors">
                      Anuluj
                    </button>
                    <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                      Zapisz
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {isSetModalOpen && editingVehicle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setIsSetModalOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white leading-tight">Zarządzaj Zestawem</h2>
                    <p className="text-zinc-400 text-sm">{editingVehicle.brand} {editingVehicle.model} ({editingVehicle.plate})</p>
                  </div>
                </div>
                
                <form onSubmit={handleSetModalSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-zinc-400 mb-2 block">Przypisany Kierowca</label>
                      <select 
                        value={zestawFormData.driverId}
                        onChange={e => setZestawFormData({...zestawFormData, driverId: e.target.value})}
                        className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none"
                      >
                        <option value="">-- Brak przypisanego kierowcy --</option>
                        {availableDrivers.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.discordNick || d.name || d.firstName || "Kierowca"}{d.email ? ` (${d.email})` : ''}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-zinc-500 mt-2">Wybór nadpisze poprzednie przypisanie kierowcy do innych pojazdów.</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-zinc-400 mb-2 block">Data przypisania kierowcy (Zostaw puste aby ustawić dzisiejszą)</label>
                      <input 
                        type="date" 
                        value={zestawFormData.assignedAt || ""} 
                        onChange={e => setZestawFormData({...zestawFormData, assignedAt: e.target.value})} 
                        className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none" 
                      />
                      <p className="text-xs text-zinc-500 mt-2">Dzięki temu system poprawnie obliczy, czy minęło np. 30/90 dni do wymiany sprzętu.</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-zinc-400 mb-2 block">Podpięta Naczepa</label>
                      <select 
                        value={zestawFormData.trailerId}
                        onChange={e => setZestawFormData({...zestawFormData, trailerId: e.target.value})}
                        className="w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none"
                      >
                        <option value="">-- Brak naczepy --</option>
                        {trailers.map(t => (
                          <option key={t.id} value={t.id}>{t.brand} {t.type} ({t.plate})</option>
                        ))}
                      </select>
                      <p className="text-xs text-zinc-500 mt-2">Wybór odepnie naczepę z innego ciągnika, jeśli była przypięta.</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-zinc-400 mb-2 block">Adres URL Zdjęcia Zestawu (Ciągnika) lub Wgraj Plik</label>
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <input 
                          type="text" 
                          value={zestawFormData.imageUrl} 
                          onChange={e => setZestawFormData({...zestawFormData, imageUrl: e.target.value})} 
                          className="flex-1 w-full p-4 bg-black/50 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none" 
                          placeholder="https://i.imgur.com/... lub wgraj z dysku" 
                        />
                        <span className="text-xs font-bold text-zinc-500">LUB</span>
                        <label className="cursor-pointer w-full md:w-auto text-center px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold text-white rounded-xl border border-white/10 transition-colors">
                          Wybierz Plik
                          <input type="file" accept="image/*" className="hidden" onChange={handleZestawFileUpload} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-white/10 mt-6">
                    <button type="button" onClick={() => setIsSetModalOpen(false)} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors">
                      Anuluj
                    </button>
                    <button type="submit" className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
                      Zapisz Zestaw
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors shadow-sm"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
        {icon}
      </div>
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-black/40 rounded-xl border border-white/5 shadow-inner">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-zinc-400 tracking-wide uppercase">{title}</h3>
      </div>
      <p className="text-4xl font-extrabold text-white mt-1 tracking-tight">{value}</p>
      <p className="text-sm text-zinc-500 mt-2 font-medium">{subtitle}</p>
    </motion.div>
  );
}

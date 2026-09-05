"use client";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Plus, Truck, CreditCard, CheckCircle, RefreshCw, 
  Edit, X, Check
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "../../../components/ConfirmModal";

const AMENITIES_CONFIG = [
  { key: "fuelStation", label: "Dystrybutor Paliwa" },
  { key: "adBlue", label: "Dystrybutor AdBlue" },
  { key: "carWash", label: "Myjnia Ciężarowa" },
  { key: "workshop", label: "Serwis i Warsztat" },
  { key: "parking", label: "Parking Ciężarowy 24/7" },
  { key: "driverRestArea", label: "Strefa Kierowcy / Pokoje" },
  { key: "security", label: "Ochrona i Monitoring 24/7" },
];

export default function BasesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [data, setData] = useState({ bases: [], trucks: [] });
  const [loading, setLoading] = useState(true);
  
  // New / Add Base Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    city: "", 
    monthlyCost: "", 
    capacity: "", 
    imageUrl: "", 
    description: "",
    amenities: {
      fuelStation: true,
      adBlue: true,
      carWash: true,
      workshop: true,
      parking: true,
      driverRestArea: true,
      security: true
    }
  });

  // Multi-Truck Assign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBaseForAssign, setSelectedBaseForAssign] = useState(null);
  const [selectedTruckIds, setSelectedTruckIds] = useState([]);

  // Detail / Edit Base Modal
  const [editingBase, setEditingBase] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [payingId, setPayingId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  useEffect(() => {
    if (session?.user?.role && !["OWNER", "BOARD"].includes(session.user.role)) {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [session, router]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/finance/bases");
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e) {
      console.error(e);
      toast.error("Błąd podczas ładowania baz.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        city: formData.city,
        monthlyCost: parseFloat(formData.monthlyCost),
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        imageUrl: formData.imageUrl || undefined,
        description: formData.description || undefined,
        amenities: formData.amenities
      };

      const res = await fetch("/api/finance/bases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Baza została utworzona!");
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error("Błąd: " + d.error);
      }
    } catch (err) {
      toast.error("Błąd zapisu.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingBase) return;
    try {
      const payload = {
        action: "UPDATE_BASE",
        baseId: editingBase.id,
        name: editFormData.name,
        city: editFormData.city,
        monthlyCost: parseFloat(editFormData.monthlyCost),
        capacity: editFormData.capacity ? parseInt(editFormData.capacity) : null,
        imageUrl: editFormData.imageUrl,
        description: editFormData.description,
        amenities: editFormData.amenities
      };

      const res = await fetch("/api/finance/bases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Informacje o bazie zostały zaktualizowane!");
        setEditingBase(null);
        fetchData();
      } else {
        toast.error("Błąd: " + d.error);
      }
    } catch (err) {
      toast.error("Błąd zapisywania bazy.");
    }
  };

  const openMultiAssignModal = (base) => {
    setSelectedBaseForAssign(base);
    const currentTruckIds = base.trucks ? base.trucks.map(t => t.id) : [];
    setSelectedTruckIds(currentTruckIds);
    setIsAssignModalOpen(true);
  };

  const handleBatchAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBaseForAssign) return;

    try {
      const res = await fetch("/api/finance/bases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseId: selectedBaseForAssign.id,
          truckIds: selectedTruckIds
        })
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Pojazdy zostały pomyślnie przypisane do bazy!");
        setIsAssignModalOpen(false);
        fetchData();
      } else {
        toast.error("Błąd: " + d.error);
      }
    } catch (err) {
      toast.error("Błąd przypisywania pojazdów.");
    }
  };

  const toggleSelectAllTrucks = () => {
    if (!data.trucks) return;
    if (selectedTruckIds.length === data.trucks.length) {
      setSelectedTruckIds([]);
    } else {
      setSelectedTruckIds(data.trucks.map(t => t.id));
    }
  };

  const toggleTruckSelection = (truckId) => {
    if (selectedTruckIds.includes(truckId)) {
      setSelectedTruckIds(selectedTruckIds.filter(id => id !== truckId));
    } else {
      setSelectedTruckIds([...selectedTruckIds, truckId]);
    }
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const handlePay = (base) => {
    setConfirmConfig({
      title: "Opłać Czynsz za Bazę",
      message: `Czy opłacić miesięczny czynsz za bazę ${base.name} (${currentMonth}/${currentYear}) w kwocie ${base.monthlyCost.toLocaleString()} zł?`,
      onConfirm: async () => {
        setPayingId(base.id);
        try {
          const res = await fetch(`/api/finance/bases/${base.id}/pay`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ month: currentMonth, year: currentYear })
          });
          const d = await res.json();
          if (d.success) {
            toast.success("Czynsz opłacony pomyślnie.");
            fetchData();
          } else {
            toast.error(d.error);
          }
        } catch(e) {
          toast.error("Błąd serwera.");
        } finally {
          setPayingId(null);
        }
      }
    });
  };

  const openEditBaseModal = (base) => {
    setEditingBase(base);
    setEditFormData({
      name: base.name,
      city: base.city,
      monthlyCost: base.monthlyCost,
      capacity: base.capacity || "",
      imageUrl: base.imageUrl || "",
      description: base.description || "",
      amenities: base.amenities || {
        fuelStation: true,
        adBlue: true,
        carWash: true,
        workshop: true,
        parking: true,
        driverRestArea: true,
        security: true
      }
    });
  };

  if (loading) return <div className="p-12 text-center text-zinc-500 animate-pulse">Ładowanie baz logistycznych...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <MapPin className="w-8 h-8 text-amber-400" /> Bazy Logistyczne
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Zarządzanie oddziałami firmy, przypisywanie pojazdów oraz edycja udogodnień i infrastruktury.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-zinc-800 transition-colors text-sm"
        >
          <Plus className="w-4 h-4 text-amber-400" /> Kup / Wynajmij Bazę
        </button>
      </div>

      {/* Grid List of Bases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.bases.map((base) => {
          const isPaidThisMonth = base.payments.some(p => p.month === currentMonth && p.year === currentYear);

          return (
            <div key={base.id} className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group">
              <div>
                
                {/* Depot Image / Banner Header */}
                <div className="relative h-44 w-full bg-zinc-900 overflow-hidden">
                  <img 
                    src={base.imageUrl || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"} 
                    alt={base.name}
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button 
                      onClick={() => openEditBaseModal(base)}
                      className="px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-400" /> Edytuj Bazę
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                    <div>
                      <span className="inline-flex px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700 uppercase tracking-widest mb-1">
                        ODDZIAŁ FIRMOWY
                      </span>
                      <h2 className="text-2xl font-bold text-white">{base.name}</h2>
                      <p className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" /> {base.city}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  
                  {/* Description */}
                  <p className="text-xs text-zinc-400 leading-relaxed italic border-l-2 border-zinc-700 pl-3">
                    "{base.description || "Główna baza transportowa posiadająca pełne zaplecze techniczne."}"
                  </p>

                  {/* Rent Summary */}
                  <div className="grid grid-cols-2 gap-3 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Czynsz miesięczny</p>
                      <p className="font-extrabold text-amber-400 text-base mt-0.5">{base.monthlyCost.toLocaleString()} zł</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Pojemność / Flota</p>
                      <p className="font-bold text-zinc-200 text-base mt-0.5">
                        {base.trucks.length} / {base.capacity || "∞"} <span className="text-xs text-zinc-500 font-normal">aut</span>
                      </p>
                    </div>
                  </div>

                  {/* Clean Hyphenated Amenities List */}
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Udogodnienia i Infrastruktura Bazy:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/60">
                      {AMENITIES_CONFIG.map(item => {
                        const isAvailable = base.amenities ? base.amenities[item.key] !== false : true;
                        if (!isAvailable) return null;
                        return (
                          <div key={item.key} className="flex items-center gap-2 text-xs text-zinc-300">
                            <span className="text-amber-400 font-bold">-</span>
                            <span>{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assigned Trucks Section */}
                  <div className="pt-2 border-t border-zinc-800">
                    <div className="flex justify-between items-center mb-2.5">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Przypisane Pojazdy ({base.trucks.length}):
                      </p>
                      <button 
                        onClick={() => openMultiAssignModal(base)}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800 flex items-center gap-1"
                      >
                        + Przypisz Pojazdy
                      </button>
                    </div>

                    {base.trucks.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {base.trucks.map(t => (
                          <span key={t.id} className="text-xs font-medium px-2.5 py-1 bg-zinc-900 rounded-xl text-zinc-300 border border-zinc-800 flex items-center gap-1">
                            <span className="font-bold text-white">- {t.plate}</span>
                            <span className="text-zinc-500">({t.brand} {t.model})</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500 italic py-2 text-center bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                        Brak przypisanych ciągników do tej bazy.
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Payment Action Footer */}
              <div className="p-6 pt-0">
                {isPaidThisMonth ? (
                  <div className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-bold text-xs">
                    <CheckCircle className="w-4 h-4" /> Czynsz opłacony w tym miesiącu
                  </div>
                ) : (
                  <button 
                    onClick={() => handlePay(base)}
                    disabled={payingId === base.id}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all text-xs border border-zinc-700 shadow-md"
                  >
                    {payingId === base.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4 text-amber-400" />}
                    Opłać Czynsz ({currentMonth}/{currentYear})
                  </button>
                )}
              </div>

            </div>
          );
        })}

        {data.bases.length === 0 && (
          <div className="col-span-full text-center py-16 text-zinc-500 bg-zinc-950 border border-zinc-800 rounded-3xl">
            Brak przypisanych baz logistycznych. Kliknij "Kup / Wynajmij Bazę", aby utworzyć pierwszy oddział.
          </div>
        )}
      </div>

      {/* ➕ MODAL TWORZENIA BAZY */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl z-10">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" /> Nowa Baza Logistyczna
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Nazwa Bazy</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600" placeholder="Np. Baza Główna, Oddział Hamburg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Lokalizacja (Miasto)</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600" placeholder="Np. Gdynia, Poznań, Hamburg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Czynsz miesięczny (PLN)</label>
                    <input required type="number" step="0.01" value={formData.monthlyCost} onChange={e => setFormData({...formData, monthlyCost: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600" placeholder="15000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Pojemność aut (puste = bez limitu)</label>
                    <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600" placeholder="20" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Adres URL Zdęcia Bazy</label>
                  <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Opis Bazy</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600 resize-none" placeholder="Opis bazy i specyfikacji..." />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 font-bold rounded-xl text-zinc-300 transition-colors text-xs">Anuluj</button>
                  <button type="submit" className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 font-bold rounded-xl text-white transition-colors text-xs border border-zinc-700">Utwórz Bazę</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚚 MODAL WIELOKROTNEGO PRZYPISYWANIA AUT (+ Przypisz Pojazd) */}
      <AnimatePresence>
        {isAssignModalOpen && selectedBaseForAssign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl z-10">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-400" /> Przypisz Pojazdy do Bazy
                  </h2>
                  <p className="text-xs text-zinc-400">Baza: <span className="text-white font-bold">{selectedBaseForAssign.name} ({selectedBaseForAssign.city})</span></p>
                </div>
                <button onClick={() => setIsAssignModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBatchAssignSubmit} className="space-y-4">
                <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs">
                  <span className="text-zinc-400 font-medium">Wybierz ciągniki z listy poniżej:</span>
                  <button 
                    type="button" 
                    onClick={toggleSelectAllTrucks}
                    className="font-bold text-amber-400 hover:underline"
                  >
                    {selectedTruckIds.length === (data.trucks?.length || 0) ? "Odznacz wszystkie" : "Zaznacz wszystkie"}
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {data.trucks && data.trucks.map(t => {
                    const isSelected = selectedTruckIds.includes(t.id);
                    const isAssignedHere = t.baseId === selectedBaseForAssign.id;
                    return (
                      <div 
                        key={t.id}
                        onClick={() => toggleTruckSelection(t.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                          isSelected 
                            ? 'bg-zinc-800 border-zinc-700 text-white' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 accent-amber-500"
                          />
                          <div>
                            <p className="font-bold text-white text-sm">- {t.brand} {t.model} ({t.plate})</p>
                            <p className="text-[11px] text-zinc-500">Numer flotowy: #{t.fleetNumber}</p>
                          </div>
                        </div>

                        {isAssignedHere && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                            Obecnie w tej bazie
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                  <span>Wybrano: <strong className="text-white">{selectedTruckIds.length}</strong> pojazdów</span>
                  {selectedBaseForAssign.capacity && (
                    <span>Limit bazy: <strong className="text-amber-400">{selectedBaseForAssign.capacity}</strong></span>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 font-bold rounded-xl text-zinc-300 transition-colors text-xs">Anuluj</button>
                  <button type="submit" className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-bold rounded-xl text-white transition-colors text-xs">Zapisz Przypisania ({selectedTruckIds.length})</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚙️ MODAL EDYCJI DANYCH I UDOGODNIEŃ BAZY */}
      <AnimatePresence>
        {editingBase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingBase(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl z-10">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-amber-400" /> Edytuj Informacje i Udogodnienia Bazy
                </h2>
                <button onClick={() => setEditingBase(null)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
                
                {/* Main attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Nazwa Bazy</label>
                    <input required type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Lokalizacja (Miasto)</label>
                    <input required type="text" value={editFormData.city} onChange={e => setEditFormData({...editFormData, city: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Czynsz miesięczny (PLN)</label>
                    <input required type="number" step="0.01" value={editFormData.monthlyCost} onChange={e => setEditFormData({...editFormData, monthlyCost: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Pojemność Ciągników</label>
                    <input type="number" value={editFormData.capacity} onChange={e => setEditFormData({...editFormData, capacity: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600" placeholder="Puste = brak limitu" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">URL Zdjęcia Bazy</label>
                  <input type="text" value={editFormData.imageUrl} onChange={e => setEditFormData({...editFormData, imageUrl: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600" placeholder="https://..." />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Opis Bazy</label>
                  <textarea rows={3} value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-zinc-600 resize-none" />
                </div>

                {/* Clean Hyphenated Amenities Toggles */}
                <div className="pt-2 border-t border-zinc-800">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">Udogodnienia na Terenie Bazy:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AMENITIES_CONFIG.map(item => {
                      const isChecked = editFormData.amenities ? editFormData.amenities[item.key] !== false : true;
                      return (
                        <div 
                          key={item.key}
                          onClick={() => {
                            setEditFormData({
                              ...editFormData,
                              amenities: {
                                ...editFormData.amenities,
                                [item.key]: !isChecked
                              }
                            });
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-zinc-950 border-zinc-700 text-white' 
                              : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-500 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold">-</span>
                            <span className="text-xs font-semibold">{item.label}</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 accent-amber-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                  <button type="button" onClick={() => setEditingBase(null)} className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 font-bold rounded-xl text-zinc-300 transition-colors text-xs">Anuluj</button>
                  <button type="submit" className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-bold rounded-xl text-white transition-colors text-xs">Zapisz Zmiany</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmConfig && (
          <ConfirmModal
            isOpen={true}
            onClose={() => setConfirmConfig(null)}
            onConfirm={confirmConfig.onConfirm}
            title={confirmConfig.title}
            message={confirmConfig.message}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

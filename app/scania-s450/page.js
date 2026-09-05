"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, Shield, Lock, User, Check, X, Truck, Home, 
  Settings, Gauge, Armchair, Lightbulb, Star, MapPin, Phone, Mail
} from "lucide-react";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

const IMAGES = [
  "/images/scania-front.jpg",
  "/images/scania-side.jpg",
  "/images/scania-back.jpg",
  "/images/scania-interior.jpg"
];

const SPECS = [
  {
    icon: Truck,
    title: "Podwozie i układ napędowy",
    items: [
      { label: "Typ podwozia", value: "4x2 type 2" },
      { label: "Rozstaw osi", value: "3 950 mm" },
      { label: "Dopuszczalna masa całkowita", value: "18 000 kg" },
      { label: "Zawieszenie przednie", value: "Sprężynowe" },
      { label: "Zawieszenie tylne", value: "Pneumatyczne" },
    ]
  },
  {
    icon: Home,
    title: "Kabina",
    items: [
      { label: "Typ kabiny", value: "Highline" },
      { label: "Długość kabiny", value: "2 200 mm" },
      { label: "Wyposażenie standardowe", value: "Klimatyzacja, elektryczne szyby" },
      { label: "Łóżko", value: "800 mm szerokości" },
      { label: "Kolor", value: "Biały perłowy" },
    ]
  },
  {
    icon: Settings,
    title: "Silnik",
    items: [
      { label: "Model", value: "DC13 450 Euro 6" },
      { label: "Moc maksymalna", value: "450 KM (331 kW) przy 1 900 obr./min" },
      { label: "Moment obrotowy", value: "2 350 Nm przy 1 000-1 300 obr./min" },
      { label: "Pojemność skokowa", value: "12 742 cm³" },
      { label: "Układ cylindrów", value: "R6" },
    ]
  },
  {
    icon: Gauge,
    title: "Skrzynia biegów i układ jezdny",
    items: [
      { label: "Skrzynia biegów", value: "Automatyczna GRS905R" },
      { label: "Liczba biegów", value: "12 + 2" },
      { label: "Przełożenie główne", value: "2.71" },
      { label: "Hamulce", value: "Tarczowe z ABS" },
      { label: "Zbiorniki paliwa", value: "2 x 400 l" },
    ]
  },
  {
    icon: Armchair,
    title: "Wnętrze i wyposażenie",
    items: [
      { label: "Fotele", value: "Komfortowe z podgrzewaniem" },
      { label: "Deska rozdzielcza", value: "Cyfrowy wyświetlacz" },
      { label: "System multimedialny", value: '7" dotyk, Bluetooth' },
      { label: "Kierownica", value: "Skórzana, wielofunkcyjna" },
      { label: "Wykończenie", value: "Standardowe dark" },
    ]
  },
  {
    icon: Lightbulb,
    title: "Wyposażenie dodatkowe",
    items: [
      { label: "Oświetlenie", value: "Światła Sky Light, LED mijania" },
      { label: "Zderzak", value: "Malowany zderzak przedni" },
      { label: "Aerodynamika", value: "Owiewka boczna L=45, dachowa H=5 L=45" },
      { label: "Zabezpieczenia", value: "System ESP, tempomat" },
      { label: "Inne", value: "Czujniki cofania, podgrzewane lusterka" },
    ]
  }
];

const MODS = [
  {
    title: "Scania S Malowanie",
    desc: "Unikalne malowanie Scanii S w barwach Bojar Logistic.",
    img: "/images/mod-sound.jpg",
    downloads: "1.4 tys.",
    rating: "4.9/5",
    file: "Bojar_logistic_Malowanie_ScaniaS_Podstawowa_3.0.scs"
  },
  {
    title: "Tablice Rejestracyjne",
    desc: "Zestaw firmowych tablic rejestracyjnych z oznaczeniami Bojar Logistic.",
    img: "/images/mod-paint.jpg",
    downloads: "1.4 tys.",
    rating: "4.8/5",
    file: "Bojar_Logistic_Rekrut_Tablice_Rejestracyjne_3.0.scs"
  },
  {
    title: "Krone Coolliner Malowanie 1.57+",
    desc: "Malowanie naczepy Krone Coolliner dopasowane do ciągnika.",
    img: "/images/mod-wheels.jpg",
    downloads: "1.4 tys.",
    rating: "4.7/5",
    file: "Bojar_Logistic_KroneCoolliner_Podstawowa 1.57.scs"
  },
  {
    title: "Texture Fix Scania PGRS 1.57+",
    desc: "Poprawka tekstur dla Scanii PGRS eliminująca błędy graficzne w ETS2.",
    img: "/images/mod-lights.jpg",
    downloads: "1.4 tys.",
    rating: "4.6/5",
    file: "WYPAKUJ_TO_Scania_PGRS_Texture_Fix_1.57.zip"
  }
];

export default function ScaniaS450Page() {
  const { data: session } = useSession();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % IMAGES.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);

  useEffect(() => {
    const timer = setInterval(nextImage, 5000);
    return () => clearInterval(timer);
  }, []);

  const triggerDownload = (fileName) => {
    const link = document.createElement('a');
    link.href = `/downloads/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openModal = (file) => {
    if (session?.user) {
      triggerDownload(file);
      return;
    }
    setCurrentFile(file);
    setEmail("");
    setPassword("");
    setStatus(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (loading) return;
    setModalOpen(false);
  };

  const verifyAccess = async () => {
    if (!email.trim() || !password.trim()) {
      setStatus({ message: "Proszę wprowadzić e-mail i hasło.", type: "error" });
      return;
    }

    setLoading(true);
    setStatus({ message: "Weryfikacja tożsamości z bazą BMS...", type: "info" });

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.ok && !res?.error) {
        setStatus({ message: "Zalogowano pomyślnie. Pobieranie rozpoczęte!", type: "success" });
        triggerDownload(currentFile);
        setTimeout(() => closeModal(), 1800);
      } else {
        setStatus({ message: "Nieprawidłowy e-mail lub hasło do systemu BMS.", type: "error" });
      }
    } catch (error) {
      setStatus({ message: `Błąd autoryzacji: ${error.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-8 -mb-8 overflow-x-hidden min-h-screen bg-[#050505] text-white selection:bg-white/20 pb-0">
      
      {/* HERO SECTION */}
      <section className="relative pt-16 pb-16 px-4 w-full overflow-hidden">
        {/* Neutral Gray Blur Glow behind title */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[350px] bg-zinc-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm text-zinc-300 mb-6 backdrop-blur-md">
              <Truck size={16} className="text-zinc-400" />
              Pojazd Rekrutowy
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white">
              Scania S450
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light mb-10">
              Pobierz wymagane modyfikacje i przygotuj się do dołączenia do naszego zespołu na najlepszym sprzęcie.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#mods" className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 text-sm">
                <Download size={18} /> Pobierz Modyfikacje
              </a>
              <a href="#specs" className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
                <Gauge size={18} /> Specyfikacja Techniczna
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* GALLERY SECTION - NARROWER MAX-W-4XL */}
      <section className="relative px-4 z-10 mb-20 w-full">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Galeria</h2>
            <p className="text-zinc-400 text-sm">Zobacz nasz pojazd rekrutowy z każdej strony</p>
          </div>
          
          <div className="relative aspect-video max-w-4xl mx-auto rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl group">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={IMAGES[currentImageIndex]}
                alt={`Scania S450 - ujęcie ${currentImageIndex + 1}`}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/1200x675/121215/ffffff?text=Scania+S450';
                }}
              />
            </AnimatePresence>

            {/* Gallery Controls */}
            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={prevImage} className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/15 hover:bg-white/20 transition-all">
                &#10094;
              </button>
              <button onClick={nextImage} className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/15 hover:bg-white/20 transition-all">
                &#10095;
              </button>
            </div>
            
            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SPECS SECTION - FULL VISIBLE IN NARROWER MAX-W-4XL CONTAINER */}
      <section id="specs" className="relative px-4 z-10 mb-20 pt-4 w-full">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Specyfikacja Techniczna</h2>
            <p className="text-zinc-400 text-sm">Szczegółowe dane techniczne pojazdu rekrutowego</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SPECS.map((category, idx) => (
              <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20">
                <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-white/10">
                  <div className="p-2.5 rounded-xl bg-white/10 text-white border border-white/10">
                    <category.icon size={20} />
                  </div>
                  <h3 className="font-bold text-base text-white">{category.title}</h3>
                </div>
                
                <div className="space-y-3">
                  {category.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/[0.04] last:border-0 text-sm">
                      <span className="text-zinc-400 text-xs md:text-sm">{item.label}</span>
                      <span className="text-white font-semibold text-right ml-4 text-xs md:text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODS SECTION - NARROWER MAX-W-5XL CONTAINER */}
      <section id="mods" className="relative px-4 z-10 mb-20 pt-4 w-full">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Modyfikacje Rekrutacyjne</h2>
            <p className="text-zinc-400 text-sm">Pobierz wymagane modyfikacje dla Scania S450</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MODS.map((mod, idx) => (
              <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden group hover:border-white/25 hover:bg-white/[0.04] transition-all duration-300 flex flex-col shadow-xl">
                <div className="h-40 overflow-hidden relative">
                  <img 
                    src={mod.img} 
                    alt={mod.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x300/15151a/ffffff?text=Mod';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-white mb-2">{mod.title}</h3>
                  <p className="text-zinc-400 text-xs mb-5 flex-1 leading-relaxed">{mod.desc}</p>
                  
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-5">
                    <span className="flex items-center gap-1.5"><Download size={13} /> {mod.downloads}</span>
                    <span className="flex items-center gap-1.5 text-amber-400"><Star size={13} className="fill-amber-400" /> {mod.rating}</span>
                  </div>
                  
                  <button 
                    onClick={() => openModal(mod.file)}
                    className="w-full py-3 px-4 rounded-xl bg-white/10 border border-white/15 hover:bg-white hover:text-black font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-xs"
                  >
                    <Download size={16} /> Pobierz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER - NARROWER MAX-W-5XL CONTAINER */}
      <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 w-full">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            {/* O Firmie & Sociale */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <span className="text-2xl font-bold text-white tracking-wider">BOJAR LOGISTIC</span>
              </Link>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
                Bojar Logistic to firma transportowa z wieloletnim doświadczeniem w przewozach międzynarodowych.
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="https://www.facebook.com/BojarLogistic" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="https://discord.gg/N2udG4vYuW" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@bojar_logistic" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                </a>
              </div>
            </div>

            {/* Szybkie Linki */}
            <div>
              <h3 className="text-white font-semibold mb-6">Szybkie linki</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-zinc-400 hover:text-white transition-colors text-sm">Strona Główna</Link></li>
                <li><Link href="/o-nas" className="text-zinc-400 hover:text-white transition-colors text-sm">O Nas</Link></li>
                <li><Link href="/flota" className="text-zinc-400 hover:text-white transition-colors text-sm">Flota</Link></li>
                <li><Link href="/faq" className="text-zinc-400 hover:text-white transition-colors text-sm">FAQ</Link></li>
                <li><Link href="/kontakt" className="text-zinc-400 hover:text-white transition-colors text-sm">Kontakt</Link></li>
              </ul>
            </div>

            {/* Kontakt */}
            <div>
              <h3 className="text-white font-semibold mb-6">Kontakt</h3>
              <ul className="space-y-4">
                <li className="flex items-start text-zinc-400 text-sm">
                  <MapPin size={18} className="mr-3 text-zinc-500 mt-0.5" />
                  <span>ul. J. Wiśniewskiego 23<br />81-335 Gdynia</span>
                </li>
                <li className="flex items-center text-zinc-400 text-sm">
                  <Phone size={18} className="mr-3 text-zinc-500" />
                  <span>+48 609 203 250</span>
                </li>
                <li className="flex items-center text-zinc-400 text-sm">
                  <Mail size={18} className="mr-3 text-zinc-500" />
                  <span>biuro@vsbojarlogistic.pl</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-zinc-900 text-center md:flex md:justify-between md:text-left">
            <p className="text-zinc-500 text-sm">
              &copy; {new Date().getFullYear()} Bojar Logistic. Wszelkie prawa zastrzeżone.
            </p>
            <div className="mt-4 md:mt-0">
              <Link href="/dashboard" className="text-zinc-500 hover:text-white text-sm transition-colors">
                Bojar Manager System
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* BMS ACCESS MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={closeModal}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-950 border border-white/20 rounded-3xl overflow-hidden shadow-2xl z-10"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <Shield size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Autoryzacja BMS</h3>
                      <p className="text-xs text-zinc-400">Pobieranie plików firmowych</p>
                    </div>
                  </div>
                  <button onClick={closeModal} disabled={loading} className="p-2 text-zinc-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <p className="text-zinc-400 text-sm mb-6">
                  Zaloguj się kontem z systemu Bojar Manager System, aby potwierdzić tożsamość i rozpocząć pobieranie modyfikacji.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 font-semibold mb-2">
                      <User size={14} /> Adres E-mail BMS
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="kierowca@firma.pl"
                      className="w-full bg-black border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 font-semibold mb-2">
                      <Lock size={14} /> Hasło BMS
                    </label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && verifyAccess()}
                      placeholder="••••••••"
                      className="w-full bg-black border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-all"
                    />
                  </div>
                </div>

                {status && (
                  <div className={`p-4 rounded-xl mb-6 text-xs flex items-start gap-3 ${
                    status.type === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
                    status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                    'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                  }`}>
                    {status.type === 'success' ? <Check size={16} className="shrink-0 mt-0.5" /> : <Shield size={16} className="shrink-0 mt-0.5" />}
                    <span>{status.message}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={closeModal}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                  >
                    Anuluj
                  </button>
                  <button 
                    onClick={verifyAccess}
                    disabled={loading}
                    className="flex-[2] py-3 px-4 rounded-xl bg-white text-zinc-950 font-extrabold text-sm hover:bg-zinc-200 transition-all flex justify-center items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Shield size={16} /> Zaloguj i Pobierz
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

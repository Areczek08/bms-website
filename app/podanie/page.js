"use client";

import { motion } from "framer-motion";
import { Copy, Edit, Send, User, Book, Briefcase, Star, Link as LinkIcon, Image as ImageIcon, GraduationCap, AlertTriangle, Clock, UserCheck, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function PodaniePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `PODANIE O DOŁĄCZENIE DO BOJAR LOGISTIC

INFORMACJE OGÓLNE:
Imię: 
Wiek: 
E-mail: 
Kilka zdań o sobie: 
Ilość tygodniowa godzin w ETS2: 
Skąd się o nas dowiedziałeś? 

ZNAJOMOŚĆ REGULAMINU:
Przeczytałeś regulamin (Tak/Nie): 
Przytocz co znaczy §2.2 regulaminu: 
Przytocz co znaczy §4.2 regulaminu: 

DOŚWIADCZENIE:
Wymień swoje ostatnie firmy + powód odejścia lub wyrzucenia: 
Czy znasz dobrze grę, umiesz podmieniać DDS'a? 
Czy posiadasz dlc krone pack?: 

MOTYWACJA:
Dlaczego akurat nasza firma, a nie inna? (Min. 2 zdania): 
Co wniesiesz sobą do firmy? 
Dlaczego mamy cię przyjąć? (Min. 2 zdania): 
Skąd zainteresowanie ciężarówkami?: 
Ulubiona marka ciężarówki: 

LINKI DO PROFILI:
Profil Steam: 
Profil TrucksBook: 
Profil Facebook: 

ZDJĘCIA Z GRY:
Dołącz DWA zdjęcia z gry (minimum średniej jakości: pokazujące twój zestaw + dowolne).`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const sections = [
    {
      title: "Informacje Ogólne",
      icon: User,
      fields: ["Imię", "Wiek", "E-mail", "Kilka zdań o sobie", "Ilość tygodniowa godzin w ETS2", "Skąd się o nas dowiedziałeś?"]
    },
    {
      title: "Regulamin",
      icon: Book,
      fields: ["Przeczytałeś regulamin (Tak/Nie)", "Przytocz co znaczy §2.2", "Przytocz co znaczy §4.2"]
    },
    {
      title: "Doświadczenie",
      icon: Briefcase,
      fields: ["Ostatnie firmy i powód odejścia", "Czy znasz grę i umiesz podmieniać DDS?", "Czy posiadasz DLC Krone Pack?"]
    },
    {
      title: "Motywacja",
      icon: Star,
      fields: ["Dlaczego nasza firma? (Min. 2 zdania)", "Co wniesiesz do firmy?", "Dlaczego mamy cię przyjąć?", "Skąd zainteresowanie ciężarówkami?", "Ulubiona marka"]
    },
    {
      title: "Linki do Profili",
      icon: LinkIcon,
      fields: ["Profil Steam", "Profil TrucksBook", "Profil Facebook"]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050505] text-white selection:bg-white/20 pb-24 overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-white/[0.03] blur-[150px] rounded-full pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
              Rekrutacja Otwarta
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white">
              Dołącz do Zespołu
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-16 leading-relaxed">
              Skopiuj przygotowany przez nas szablon, uzupełnij go swoimi danymi i wyślij na dedykowanym kanale Discord.
            </p>
          </motion.div>

          {/* Action Steps */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: Copy, title: "1. Skopiuj", desc: "Pobierz wzór do schowka" },
              { icon: Edit, title: "2. Wypełnij", desc: "Uzupełnij swoje dane" },
              { icon: Send, title: "3. Wyślij", desc: "Przekaż na Discordzie" }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(255,255,255,0.02)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-white/5">
                    <step.icon size={26} className="text-white/80 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2 text-white/90 group-hover:text-white transition-colors">{step.title}</h3>
                  <p className="text-zinc-500 text-sm group-hover:text-zinc-400 transition-colors">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative px-4 z-10 mt-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Template Preview (Left side, takes 8 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="lg:col-span-8 flex flex-col"
          >
            <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-50" />
              
              {/* Header */}
              <div className="relative p-6 md:p-8 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-white">
                    <div className="p-2.5 rounded-xl bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                      <Copy className="text-white" size={22} />
                    </div>
                    Szablon Podania
                  </h2>
                  <p className="text-zinc-500 mt-2 text-sm ml-14">Gotowy do skopiowania jednym kliknięciem.</p>
                </div>
                <button 
                  onClick={handleCopy}
                  className="hidden md:flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-zinc-200 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  {copied ? "Skopiowano!" : "Kopiuj Szablon"}
                </button>
              </div>
              
              {/* Content */}
              <div className="relative p-6 md:p-8 space-y-10 h-[650px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                {sections.map((section, idx) => (
                  <div key={idx} className="relative group/section">
                    <div className="absolute -inset-6 bg-white/[0.02] rounded-2xl opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="relative">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-5 flex items-center gap-3">
                        <section.icon size={20} className="text-zinc-400" />
                        {section.title}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.fields.map((field, fIdx) => (
                          <div key={fIdx} className="px-5 py-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm text-zinc-400 group-hover/section:border-white/[0.1] transition-colors">
                            {field}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="relative group/section">
                  <div className="absolute -inset-6 bg-white/[0.02] rounded-2xl opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="relative">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-5 flex items-center gap-3">
                      <ImageIcon size={20} className="text-zinc-400" />
                      Zdjęcia z gry
                    </h3>
                    <div className="px-5 py-5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm text-zinc-400 leading-relaxed group-hover/section:border-white/[0.1] transition-colors">
                      <strong className="text-white font-medium">Wymagane 2 zdjęcia z gry (minimum średnia jakość).</strong><br/>
                      Jedno przedstawiające Twój zestaw, drugie to dowolne ujęcie z trasy.
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Copy Button */}
              <div className="relative p-6 border-t border-white/5 bg-black/50 md:hidden backdrop-blur-md">
                <button 
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95"
                >
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  {copied ? "Skopiowano!" : "Kopiuj Szablon"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Info Sidebar (Right side, takes 4 columns) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="lg:col-span-4 flex flex-col gap-6"
          >
            {/* Guidelines Card */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 relative overflow-hidden group hover:border-white/[0.15] hover:bg-white/[0.03] transition-all duration-500 shadow-lg">
              <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 rotate-12">
                <GraduationCap size={180} />
              </div>
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10 text-white">
                Jak to działa?
              </h3>
              <div className="space-y-7 relative z-10">
                {[
                  { title: "Skopiuj szablon", desc: "Użyj przycisku w panelu obok." },
                  { title: "Dołącz na Discord", desc: "Wejdź na serwer i zweryfikuj się." },
                  { title: "Otwórz ticket", desc: "Na kanale #podanie stwórz zgłoszenie." },
                  { title: "Wyślij", desc: "Wklej tekst, uzupełnij go i załącz zdjęcia." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 group/step">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-zinc-300 flex items-center justify-center font-bold text-sm shrink-0 group-hover/step:bg-white/20 group-hover/step:text-white transition-colors shadow-[0_0_15px_rgba(255,255,255,0.0)] group-hover/step:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white/90 group-hover/step:text-white transition-colors">{step.title}</h4>
                      <p className="text-sm text-zinc-500 mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings Card */}
            <div className="p-8 rounded-3xl bg-black border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700 transition-colors duration-500 shadow-xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 blur-[80px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-white relative z-10">
                <AlertTriangle className="text-white/80" size={22} /> 
                Wymagania
              </h3>
              
              <ul className="space-y-6 relative z-10">
                <li className="flex gap-4 items-start">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <UserCheck className="text-zinc-400" size={18} />
                  </div>
                  <div>
                    <span className="block text-white font-medium mb-1">Wiek i Doświadczenie</span>
                    <span className="text-sm text-zinc-500">Minimum 16 lat oraz przynajmniej 300 godzin w ETS2.</span>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Book className="text-zinc-400" size={18} />
                  </div>
                  <div>
                    <span className="block text-white font-medium mb-1">Regulamin</span>
                    <span className="text-sm text-zinc-500">Znajomość i akceptacja regulaminu na Discordzie.</span>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Clock className="text-zinc-400" size={18} />
                  </div>
                  <div>
                    <span className="block text-white font-medium mb-1">Czas operacyjny</span>
                    <span className="text-sm text-zinc-500">Odpowiedź następuje w przeciągu 96 godzin.</span>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}

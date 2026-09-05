"use client";

import { motion } from "framer-motion";
import { Info, Truck, Award, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const milestones = [
    { year: "2021", title: "Początki", desc: "Założenie firmy Bojar Logistic. Rozpoczęliśmy z 3 zestawami i małym zespołem pasjonatów." },
    { year: "2022", title: "Rozwój", desc: "Dynamiczny rozwój floty do 15 zestawów. Pierwsze międzynarodowe kontrakty." },
    { year: "2023", title: "Ekspansja", desc: "Wdrożenie systemu BMS. Rozszerzenie działalności na całą Europę. Flota powiększa się do 30 zestawów." },
    { year: "2024", title: "Innowacje", desc: "Modernizacja floty i wprowadzenie nowoczesnych rozwiązań telematycznych. Rozwój działu transportu specjalistycznego." },
    { year: "2025", title: "Nowe Horyzonty", desc: "Budowa terminalu przeładunkowego w Gdyni, strategiczna współpraca z firmą Oblaz Logistica." },
    { year: "Obecnie", title: "Lider rynku", desc: "Ponad 40 zestawów, zgrany zespół specjalistów i kompleksowe usługi logistyczne. Ciągły rozwój." },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pb-20">
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">O Nas</h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Jesteśmy wirtualną firmą transportową tworzoną przez prawdziwych pasjonatów symulatora Euro Truck Simulator 2 oraz profesjonalistów z branży TSL.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Nasza Misja</h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              Dążymy do tego, aby Bojar Logistic było miejscem, gdzie pasja do wirtualnego transportu spotyka się z pełnym profesjonalizmem. Zapewniamy naszym kierowcom najlepsze warunki, nowoczesny tabor oraz autorski system BMS.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Nasz cel to ciągły rozwój technologiczny i tworzenie zgranej społeczności, która na pierwszym miejscu stawia jakość i realizm rozgrywki.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <Truck className="text-zinc-300 mb-4" size={32} />
              <h3 className="text-white font-bold mb-2">Nowoczesna Flota</h3>
              <p className="text-sm text-zinc-500">Pojazdy spełniające wymogi normy emisji spalin E6.</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mt-8">
              <ShieldCheck className="text-zinc-300 mb-4" size={32} />
              <h3 className="text-white font-bold mb-2">Niezawodność</h3>
              <p className="text-sm text-zinc-500">Profesjonalne podejście do każdego zlecenia.</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 -mt-8">
              <Info className="text-zinc-300 mb-4" size={32} />
              <h3 className="text-white font-bold mb-2">Wsparcie</h3>
              <p className="text-sm text-zinc-500">Dedykowana pomoc dla każdego kierowcy 24/7.</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <Award className="text-zinc-300 mb-4" size={32} />
              <h3 className="text-white font-bold mb-2">Doświadczenie</h3>
              <p className="text-sm text-zinc-500">Lata doświadczenia na rynku wirtualnym.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-24 bg-zinc-900/30 mt-12 border-y border-zinc-900">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-zinc-800 hidden md:block"></div>
          <h2 className="text-3xl font-bold text-white mb-16 text-center">Nasza Historia</h2>
          
          <div className="space-y-12">
            {milestones.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col md:flex-row gap-6 relative z-10"
              >
                <div className="flex flex-col items-center md:items-start shrink-0">
                  <div className="w-16 h-16 rounded-full bg-zinc-950 border-4 border-zinc-800 flex items-center justify-center font-bold text-white text-sm shadow-xl relative z-10">
                    {item.year}
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-8 rounded-2xl border border-zinc-800 w-full hover:border-zinc-700 transition-colors">
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ZARZĄD I REKRUTERZY */}
      <section className="px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">ZARZĄD FIRMY</h2>
            <p className="text-zinc-400 text-lg">Poznaj ludzi, którzy stoją za sukcesem Bojar Logistic</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
              { name: "Arkadiusz", role: "CEO | Prezes Zarządu", desc: "Zajmuję się strategicznym zarządzaniem, rozwojem operacyjnym oraz konfiguracją floty.", img: "/images/ceo.jpg" },
              { name: "Filip", role: "Przedstawiciel ds. relacji biznesowych", desc: "Zajmuję się reprezentowaniem firmy na zewnątrz oraz wspieram procesy rekrutacyjne.", img: "/images/operations.jpg" },
              { name: "Kacper", role: "Menadżer ds. Transportu i Logistyki", desc: "Odpowiadam za zarządzanie systemem HRM, sprawy kadrowe i szeroko pojęte zasoby ludzkie.", img: "/images/finance.jpg" }
            ].map((person, i) => (
              <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors group">
                <div className="h-72 bg-zinc-800 relative">
                  <Image src={person.img} alt={person.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-8 text-center bg-zinc-900/50">
                  <h3 className="text-2xl font-bold text-white mb-2">{person.name}</h3>
                  <p className="text-zinc-300 font-medium text-sm mb-4 uppercase tracking-wider">{person.role}</p>
                  <p className="text-zinc-500 text-sm leading-relaxed">{person.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">NASZ ZESPÓŁ REKRUTACYJNY</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Patryk", role: "Opiekun zespołu ds. HRM", desc: "Odpowiadam za obsługę kadr oraz wsparcie pracowników i kadry zarządzającej.", img: "/images/recruiter1.jpg" },
              { name: "Grzegorz", role: "Specjalista ds. rekrutacji i techniki", desc: "Pracuję jako rekruter wspierając dział techniczny. Łączę znajomość kadr z wiedzą techniczną.", img: "/images/recruiter2.jpg" },
              { name: "Jakub", role: "Kierownik ds. Kadr i Zasobów", desc: "Zarządzam sprawami kadrowymi, dokumentacją i wspieram organizację zespołu.", img: "/images/recruiter3.jpg" }
            ].map((person, i) => (
              <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors group">
                <div className="h-72 bg-zinc-800 relative">
                  <Image src={person.img} alt={person.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-8 text-center bg-zinc-900/50">
                  <h3 className="text-2xl font-bold text-white mb-2">{person.name}</h3>
                  <p className="text-zinc-300 font-medium text-sm mb-4 uppercase tracking-wider">{person.role}</p>
                  <p className="text-zinc-500 text-sm leading-relaxed">{person.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTYFIKATY */}
      <section className="px-4 py-20 bg-zinc-900/30 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">CERTYFIKATY I LICENCJE</h2>
          <p className="text-zinc-400 text-lg mb-12">Potwierdzenie naszych kompetencji i standardów</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "ISO 9001:2015", desc: "Certyfikat Systemu Zarządzania Jakością", img: "/images/iso-cert.png" },
              { title: "ISO 28000", desc: "System Zarządzania Bezpieczeństwem Ruchu Drogowego", img: "/images/transport-cert.jpg" },
              { title: "Eco Care", desc: "Certyfikat zaangażowania w ochronę środowiska", img: "/images/eco-cert.png" }
            ].map((cert, i) => (
              <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center">
                <div className="w-32 h-32 relative mb-6 rounded-xl overflow-hidden bg-white/5 p-2">
                  <Image src={cert.img} alt={cert.title} fill className="object-contain" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{cert.title}</h3>
                <p className="text-zinc-500 text-sm">{cert.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-zinc-400 mt-12 max-w-3xl mx-auto">Posiadamy wszystkie niezbędne licencje i certyfikaty, w tym międzynarodową licencję transportową, certyfikat kompetencji zawodowych, certyfikat ISO 9001, ISO 39001 oraz szereg certyfikatów branżowych potwierdzających wysoką jakość naszych usług.</p>
        </div>
      </section>
    </div>
  );
}

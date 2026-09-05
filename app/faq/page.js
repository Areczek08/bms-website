"use client";

import { motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: "Czy rekrutacja jest otwarta?", a: "Rekrutacja do naszej firmy jest stale otwarta, ze względu na rozwój naszej firmy i poszerzanie naszego taboru poszukujemy kierowców na nowe zestawy." },
  { q: "Ile lat muszę mieć by dołączyć do firmy?", a: "W przypadku chęci dołączenia do naszej firmy od kandydata wymagamy ukończonego 16 roku życia, w przypadku wątpliwości i podejrzeń co do wieku egzaminator ma prawo poprosić o podanie zdjęcia legitymacji / pierwszych 6 cyfr peselu." },
  { q: "Złożyłem podanie, co dalej?", a: "Pozostaje Ci cierpliwie czekać, na sprawdzenie go przez zarząd firmy, mamy na to 96h na wyniki należy oczekiwać na discordzie naszej firmy, tam po sprawdzeniu podań wstawiamy wyniki." },
  { q: "Czy mogę wysłać podanie ponownie?", a: "Jeśli twoje podanie z jakiejkolwiek przyczyny zostało odrzucone, a spełniasz wszystkie wymogi możesz zgłosić chęć dołączenia do firmy wysyłając je ponownie po upłynięciu 24h od sprawdzenia wcześniejszego." },
  { q: "Gdzie znajduje się baza firmowa?", a: "Główne centrum logistyczne Niemieckiego oddziału firmy znajduje się w miejscowości Soltau pod Hamburgiem, natomiast mniejsza baza przeładunkowa oraz siedziba podwykonawcy Oblaz Logistica znajduje się w gdyni niedaleko portu BCT." },
  { q: "Czy firma Bojar Logistic istnieje w realu?", a: "Nie, nasz projekt nie jest odwzorowaniem realnej firmy na licencji, cała firma została wymyślona przez szefa, a malowania i logo są chronione własnością intelektualną." },
  { q: "Czy firma posiada autorskie modyfikacje?", a: "Tak, jako jedna z nielicznych firm w polsce posiadamy rozległą scenę autorskich modyfikacji które pomagają w lepszych odczuciach z gry, czy samym wyglądzie." },
  { q: "Jak działa autorski system Bojar Manager?", a: "Nasz system BMS w wersji 2.7.7 umożliwia kompleksowe zarządzanie flotą: monitorowanie tras w czasie rzeczywistym, zarządzanie HR (kierowcami), integrację z flotą pojazdów i generowanie raportów efektywności." },
  { q: "Ile zestawów i pojazdów znajduje się obecnie w firmie?", a: "Dysponujemy ponad 40 nowoczesnymi zestawami, dedykowanymi do transportu chłodniczego oraz kontenerowego, w tym marki takie jak Scania, Volvo, Daf, Renault." },
  { q: "Jak wygląda proces rekrutacji i szkolenia nowych kierowców?", a: "Rekrutacja trwa przez cały czas. Po złożeniu podania w ciągu 96 godzin zapraszamy Cię na rozmowę głosową, a następnie przechodzisz egzamin praktyczny — jazdę próbną ~250 km z naszym egzaminatorem." },
  { q: "Jak często aktualizowane są malowania floty?", a: "Regularnie modernizujemy nasze autorskie malowania — nowe wzory i zestawy pojazdów, zgodne z normą Euro 6, trafiają do floty w miarę możliwości i potrzeb firmy." },
  { q: "Jakie typy transportu realizujemy?", a: "Specjalizujemy się w transporcie chłodniczym oraz przewozach kontenerów morskich zarówno w kraju, jak i za granicą, oprócz tego posiadamy 6 tandemów z zabudową kurtynową i 4 cysterny paliwowe." },
  { q: "Czy współpracujemy z zewnętrznymi przewoźnikami?", a: "Tak — oferujemy stałe zlecenia, terminowe płatności, karty paliwowe oraz ubezpieczenia, a także możliwość integracji z naszą flotą premium." },
  { q: "Jak często wysyłane są zlecenia do przewoźników?", a: "Tygodniowo udostępniamy ponad 100 ładunków, co świadczy o stabilności i aktywności firmy." },
  { q: "Jakie modele i specyfikacje pojazdów posiadamy?", a: "W flocie dominują pojazdy normy Euro 6: Scania S, R, Volvo FH4, FH5, Renault T-Range, Daf XG — wszystkie przystosowane do różnych rodzajów ładunków." }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pb-20">
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle size={32} className="text-blue-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Często zadawane pytania</h1>
          <p className="text-xl text-zinc-400">
            Odpowiedzi na najczęściej zadawane pytania dotyczące rekrutacji i działania firmy.
          </p>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
              >
                <span className="font-semibold text-white text-lg pr-8">{faq.q}</span>
                <ChevronDown 
                  className={`text-zinc-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4">
                  {faq.a}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      <div className="max-w-3xl mx-auto text-center mt-12 px-4">
        <p className="text-zinc-500">Masz inne pytanie? Wejdź na naszego Discorda.</p>
        <a href="https://discord.gg/N2udG4vYuW" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors text-sm font-medium">
          Dołącz do Discorda
        </a>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pb-20">
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Kontakt</h1>
          <p className="text-xl text-zinc-400">
            Masz pytania? Chcesz nawiązać współpracę? Skontaktuj się z nami.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-8">Informacje kontaktowe</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Adres</h3>
                    <p className="text-zinc-400">ul. J. Wiśniewskiego 23<br />81-335 Gdynia</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Telefon</h3>
                    <p className="text-zinc-400">+48 609 203 250</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-2">E-mail</h3>
                    <p className="text-zinc-400 text-sm mb-1"><strong className="text-zinc-300 font-medium">Biuro:</strong> biuro@vsbojarlogistic.pl</p>
                    <p className="text-zinc-400 text-sm mb-1"><strong className="text-zinc-300 font-medium">Pomoc:</strong> pomoc@vsbojarlogistic.pl</p>
                    <p className="text-zinc-400 text-sm mb-1"><strong className="text-zinc-300 font-medium">Rekrutacja:</strong> rekrutacja@vsbojarlogistic.pl</p>
                    <p className="text-zinc-400 text-sm"><strong className="text-zinc-300 font-medium">System:</strong> system@vsbojarlogistic.pl</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#5865F2]/20 rounded-xl flex items-center justify-center text-[#5865F2] shrink-0">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Discord</h3>
                    <p className="text-zinc-400">Najszybsza forma kontaktu. Wejdź na nasz serwer i otwórz ticket w dziale pomocy.</p>
                    <a href="https://discord.gg/N2udG4vYuW" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[#5865F2] hover:text-white transition-colors text-sm font-medium">
                      Dołącz teraz &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col justify-center"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Formularz Kontaktowy</h2>
            <p className="text-zinc-400 mb-8">Wypełnij poniższy formularz, a odpowiemy w ciągu 24 godzin.</p>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Imię i nazwisko</label>
                <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Jan Kowalski" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Adres Email</label>
                <input type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="jan@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Wiadomość</label>
                <textarea rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none" placeholder="W czym możemy pomóc?"></textarea>
              </div>
              <button className="w-full py-4 bg-white text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-colors mt-2">
                Wyślij wiadomość
              </button>
            </form>
          </motion.div>
          
        </div>
      </section>

      {/* ZESPÓŁ KONTAKTOWY */}
      <section className="px-4 py-20 bg-zinc-900/30 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">ZESPÓŁ KONTAKTOWY</h2>
            <p className="text-zinc-400 text-lg">Poznaj nasz zespół, który czeka na Twoją wiadomość</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Patryk", role: "Kierownik ds. HR i Zatrudnienia", img: "/images/recruiter1.jpg" },
              { name: "Grzegorz", role: "Specjalista ds. rekrutacji i techniki", img: "/images/recruiter2.jpg" },
              { name: "Jakub", role: "Kierownik ds. Kadr i Zasobów Ludzkich", img: "/images/recruiter3.jpg" }
            ].map((person, i) => (
              <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors group p-6 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 relative">
                  <img src={person.img} alt={person.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{person.name}</h3>
                <p className="text-blue-500 font-medium text-sm">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

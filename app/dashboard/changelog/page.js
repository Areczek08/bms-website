"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Rocket, Wrench, Shield, Zap, Sparkles, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { changelogData } from "./data";

export default function ChangelogPage() {
  const router = useRouter();

  const getIcon = (type) => {
    switch (type) {
      case 'feature': return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case 'fix': return <Wrench className="w-4 h-4 text-amber-500" />;
      case 'security': return <Shield className="w-4 h-4 text-rose-500" />;
      case 'update': return <Zap className="w-4 h-4 text-blue-500" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getBadge = (type) => {
    switch (type) {
      case 'feature': return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Nowość</span>;
      case 'fix': return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Poprawka</span>;
      case 'security': return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">Zabezpieczenie</span>;
      case 'update': return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Aktualizacja</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Dziennik Zmian <Rocket className="w-6 h-6 text-indigo-500" />
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">Śledź na bieżąco rozwój systemu Bojar Manager System.</p>
        </div>
      </div>

      <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 md:ml-8 space-y-12 pb-8">
        {changelogData.map((release, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8 md:pl-12"
          >
            {/* Oś czasu - kropka */}
            <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-zinc-50 dark:ring-zinc-950"></div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                      {release.version}
                    </span>
                    <span className="text-sm text-zinc-500">{new Date(release.date).toLocaleDateString("pl-PL", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <h2 className="text-xl font-bold">{release.title}</h2>
                  <p className="text-zinc-500 text-sm mt-1">{release.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {release.changes.map((change, cIndex) => (
                  <div key={cIndex} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {getIcon(change.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        {getBadge(change.type)}
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                        {change.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

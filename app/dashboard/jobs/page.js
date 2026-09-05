"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Zamiast fetch, na razie mockujemy lub pobieramy z prawdziwego API
  // W docelowej wersji użyjemy SWR lub server components
  useEffect(() => {
    fetch("/api/user/jobs") // To będzie endpoint do pobierania tras usera
      .then(res => res.json())
      .then(data => {
        if(data.jobs) setJobs(data.jobs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case "APPROVED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3"/> Zaakceptowana</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3 h-3"/> Odrzucona</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400"><Clock className="w-3 h-3"/> Oczekująca</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moje Trasy</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Zarządzaj swoimi zleceniami i sprawdzaj ich status.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Ładowanie tras...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🚛</span>
            </div>
            <h3 className="text-lg font-medium">Brak zrealizowanych tras</h3>
            <p className="text-zinc-500 max-w-sm mt-1">Twoje trasy są automatycznie synchronizowane z systemem TrucksBook. Zrealizuj kurs, a pojawi się tutaj w ciągu kilku minut.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Trasa</th>
                  <th className="px-6 py-4 font-medium">Dystans</th>
                  <th className="px-6 py-4 font-medium">Ładunek</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-zinc-200 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-zinc-500">{new Date(job.date).toLocaleDateString("pl-PL")}</td>
                    <td className="px-6 py-4 font-medium">
                      {job.startCity} <span className="text-zinc-400 mx-1">→</span> {job.endCity}
                    </td>
                    <td className="px-6 py-4">{job.distance} km</td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{job.cargo}</td>
                    <td className="px-6 py-4">{getStatusBadge(job.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

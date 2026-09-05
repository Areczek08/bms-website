"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

// Dynamiczny import mapy, aby wyłączyć Server-Side Rendering (wymóg Leaflet)
const MapComponent = dynamic(() => import("../../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-pulse">
      <MapPin className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4 animate-bounce" />
      <p className="text-zinc-500 font-medium">Ładowanie mapy satelitarnej...</p>
    </div>
  )
});

export default function MapPage() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetch('/api/map')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          setDrivers(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mapa Dyspozytorni</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Lokalizacja floty na podstawie ostatnich zrealizowanych tras.</p>
      </div>

      <div className="flex-1 w-full min-h-[600px] rounded-2xl shadow-sm relative">
        <MapComponent drivers={drivers} />
      </div>
    </div>
  );
}

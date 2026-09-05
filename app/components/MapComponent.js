"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const personSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

const createIcon = (driver) => {
  const avatarHtml = driver.image 
    ? `<img src="${driver.image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
    : personSvg;

  return L.divIcon({
    html: `<div style="background-color: white; border-radius: 50%; padding: 0px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid #3b82f6; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; overflow: hidden;">${avatarHtml}</div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

export default function MapComponent({ drivers }) {
  useEffect(() => {
    // Rozwiązanie problemu ze znikającymi tilesami po załadowaniu
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 500);
  }, []);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-0">
      <MapContainer 
        center={[52.237049, 21.017532]} // Domyślnie Warszawa
        zoom={5} 
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {drivers.map((driver) => (
          driver.lastCoords ? (
            <Marker key={driver.id} position={driver.lastCoords} icon={createIcon(driver)}>
              <Popup className="dark-popup" closeButton={false}>
                <div className="font-sans min-w-[240px] popup-content-animated p-1">
                  <div className="flex items-center gap-3 border-b border-zinc-800 pb-3 mb-3">
                    {driver.image ? (
                      <img src={driver.image} alt="avatar" className="w-11 h-11 rounded-full object-cover border border-zinc-700" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-lg border border-zinc-700">
                        {driver.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-[16px] text-zinc-100 m-0 leading-tight drop-shadow-md">{driver.name}</h3>
                      <p className="text-xs text-blue-400 font-semibold m-0 flex items-center gap-1 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {driver.lastCity}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[13px] text-zinc-300 m-0 flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Ostatnia znana lokalizacja</span>
                      {driver.lastJobDate ? new Date(driver.lastJobDate).toLocaleString('pl-PL', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }) : "Brak danych"}
                    </p>
                    <div className="border-t border-zinc-800/80 my-2"></div>
                    <p className="text-xs text-zinc-300 m-0 truncate" title={driver.truck}>
                      <span className="text-zinc-500 font-medium mr-1">Ciągnik:</span> {driver.truck || "Brak"}
                    </p>
                    <p className="text-xs text-zinc-300 m-0 truncate" title={driver.trailer}>
                      <span className="text-zinc-500 font-medium mr-1">Naczepa:</span> {driver.trailer || "Brak"}
                    </p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-800/80">
                      <p className="text-xs text-zinc-300 m-0">
                        <span className="text-zinc-500 font-medium">Przebieg:</span> {driver.truckMileage != null ? `${driver.truckMileage} km` : "-"}
                      </p>
                      {driver.fuelLevel != null && (
                        <p className="text-xs text-zinc-300 m-0">
                          <span className="text-zinc-500 font-medium">Poziom paliwa:</span> {driver.fuelLevel.toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
      <style jsx global>{`
        .dark-popup .leaflet-popup-content-wrapper, 
        .dark-popup .leaflet-popup-tip {
          background-color: #09090b !important; /* zinc-950 */
          color: #e4e4e7;
          border: 1px solid #27272a;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7);
        }
        .dark-popup .leaflet-popup-content {
          margin: 12px;
        }
        .popup-content-animated {
          animation: popupFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes popupFadeIn {
          0% { opacity: 0; transform: translateY(6px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

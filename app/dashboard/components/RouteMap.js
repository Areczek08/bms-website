"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Niestandardowe ikony dla Start i Koniec (Pinezki GPS)
const startIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png", 
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png", 
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function RouteMap({ startCity, endCity }) {
  const [routeCoords, setRouteCoords] = useState([]);
  const [startPos, setStartPos] = useState(null);
  const [endPos, setEndPos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!startCity || !endCity) return;

    let isMounted = true;
    setLoading(true);

    const fetchRoute = async () => {
      try {
        // 1. Geocoding Start City
        const startRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startCity)}`);
        const startData = await startRes.json();
        
        // 2. Geocoding End City
        const endRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endCity)}`);
        const endData = await endRes.json();

        if (startData.length > 0 && endData.length > 0) {
          const sLat = parseFloat(startData[0].lat);
          const sLon = parseFloat(startData[0].lon);
          const eLat = parseFloat(endData[0].lat);
          const eLon = parseFloat(endData[0].lon);

          if(isMounted) {
            setStartPos([sLat, sLon]);
            setEndPos([eLat, eLon]);
          }

          // 3. Routing from OSRM
          const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${sLon},${sLat};${eLon},${eLat}?overview=full&geometries=geojson`);
          const osrmData = await osrmRes.json();

          if (osrmData.routes && osrmData.routes.length > 0 && isMounted) {
            // GeoJSON returns [lon, lat], Leaflet Polyline needs [lat, lon]
            const coords = osrmData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            setRouteCoords(coords);
          } else {
            // Fallback to straight line if OSRM fails to route
            if(isMounted) setRouteCoords([[sLat, sLon], [eLat, eLon]]);
          }
        }
      } catch (error) {
        console.error("Map route fetch error:", error);
      } finally {
        if(isMounted) setLoading(false);
      }
    };

    fetchRoute();

    return () => { isMounted = false; };
  }, [startCity, endCity]);

  if (!startCity || !endCity) {
    return <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 rounded-xl">Wybierz trasę, aby zobaczyć mapę</div>;
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center text-zinc-500 rounded-xl animate-pulse">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        Ładowanie mapy i trasy...
      </div>
    );
  }

  const mapCenter = startPos || [52.0, 19.0]; // Default Poland center
  const bounds = routeCoords.length > 0 ? routeCoords : (startPos && endPos ? [startPos, endPos] : null);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative z-0 border border-zinc-200 dark:border-zinc-800 shadow-inner">
      <MapContainer center={mapCenter} zoom={5} style={{ width: "100%", height: "100%" }}>
        {/* CartoDB Dark Matter tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {startPos && (
          <Marker position={startPos} icon={startIcon}>
            <Popup>Załadunek: {startCity}</Popup>
          </Marker>
        )}
        
        {endPos && (
          <Marker position={endPos} icon={endIcon}>
            <Popup>Rozładunek: {endCity}</Popup>
          </Marker>
        )}

        {routeCoords.length > 0 && (
          <Polyline 
            positions={routeCoords} 
            color="#3b82f6" // blue-500
            weight={5}
            opacity={0.8}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {bounds && <MapBounds bounds={bounds} />}
      </MapContainer>
    </div>
  );
}

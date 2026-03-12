import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { Navigation, Trash2, Loader2 } from "lucide-react";
import L from "leaflet";
import toast, { Toaster } from "react-hot-toast";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ path }) {
  const map = useMap();
  useEffect(() => {
    if (path.length > 0) {
      const bounds = L.latLngBounds(path);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [path, map]);
  return null;
}

function MapEvents({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

export default function App() {
  const [points, setPoints] = useState({ start: null, end: null });
  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false); // New state for cold start

  useEffect(() => {
    if (points.start && points.end) fetchPath();
  }, [points]);

  const fetchPath = async () => {
    setLoading(true);
    // Timer to detect if server is sleeping (Render free tier)
    const wakeUpTimer = setTimeout(() => setIsWakingUp(true), 3000);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId: 1,
          start: { lat: points.start.lat, lon: points.start.lng },
          end: { lat: points.end.lat, lon: points.end.lng },
        }),
      });

      clearTimeout(wakeUpTimer);
      setIsWakingUp(false);

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error fetching path");

      setPath(data.path.map((p) => [p.lat, p.lon]));
      setDistance((data.distance / 1000).toFixed(2));
      toast.success("Path found!");
    } catch (err) {
      clearTimeout(wakeUpTimer);
      setIsWakingUp(false);
      toast.error(err.message);
      setPath([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans text-slate-900 overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      <header className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Navigation className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              RouteGraph <span className="text-blue-600">Pro</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Bangalore Intelligent Routing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {distance && (
            <div className="text-right">
              <p className="text-xl font-black text-blue-600">{distance} km</p>
            </div>
          )}
          <button
            onClick={() => {
              setPoints({ start: null, end: null });
              setPath([]);
              setDistance(null);
            }}
            className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full font-semibold text-sm hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} /> Reset
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 bg-slate-50 flex flex-col gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between">
          <p className="text-sm font-medium">
            {loading
              ? isWakingUp
                ? "Server is waking up (Render Free Tier)..."
                : "Calculating A* Path..."
              : !points.start
                ? "Select start"
                : !points.end
                  ? "Select destination"
                  : "Route Optimized!"}
          </p>
          {loading && (
            <Loader2 className="animate-spin text-blue-600" size={18} />
          )}
        </div>
        <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative">
          <MapContainer
            center={[12.9716, 77.5946]}
            zoom={13}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <MapController path={path} />
            <MapEvents
              onMapClick={(l) =>
                setPoints((p) =>
                  !p.start || (p.start && p.end)
                    ? { start: l, end: null }
                    : { ...p, end: l },
                )
              }
            />
            {points.start && <Marker position={points.start} />}
            {points.end && <Marker position={points.end} />}
            {path.length > 0 && (
              <Polyline
                positions={path}
                color="#2563eb"
                weight={6}
                opacity={0.8}
              />
            )}
          </MapContainer>
        </div>
      </main>
    </div>
  );
}

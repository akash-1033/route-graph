import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  useMap, // 1. Added useMap
} from "react-leaflet";
import { Navigation, MapPin, Trash2, Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Marker Icon Fix
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// 2. Minimal Helper Component for Auto-Zoom
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

  const bangaloreCenter = [12.9716, 77.5946];

  const handleMapClick = (latlng) => {
    if (!points.start || (points.start && points.end)) {
      setPoints({ start: latlng, end: null });
      setPath([]);
      setDistance(null);
    } else {
      setPoints((prev) => ({ ...prev, end: latlng }));
    }
  };

  useEffect(() => {
    if (points.start && points.end) fetchPath();
  }, [points]);

  const fetchPath = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId: 1,
          start: { lat: points.start.lat, lon: points.start.lng },
          end: { lat: points.end.lat, lon: points.end.lng },
        }),
      });
      const data = await response.json();
      if (data.path) {
        setPath(data.path.map((p) => [p.lat, p.lon]));
        setDistance((data.distance / 1000).toFixed(2));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetMap = () => {
    setPoints({ start: null, end: null });
    setPath([]);
    setDistance(null);
  };

  return (
    <div className="flex flex-col h-screen font-sans text-slate-900">
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
              Bangalore Intelligent Routing Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {distance && (
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                Total Distance
              </p>
              <p className="text-xl font-black text-blue-600">{distance} km</p>
            </div>
          )}
          <button
            onClick={resetMap}
            className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-full transition-all font-semibold text-sm"
          >
            <Trash2 size={16} /> Reset
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 bg-slate-50 flex flex-col gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-3 h-3 rounded-full ${points.start ? "bg-green-500" : "bg-slate-300 animate-pulse"}`}
            />
            <p className="text-sm font-medium">
              {!points.start
                ? "Select starting point on map"
                : !points.end
                  ? "Select destination"
                  : "Route Optimized!"}
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Loader2 className="animate-spin" size={18} /> Calculating A*
              Path...
            </div>
          )}
        </div>

        <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative">
          <MapContainer
            center={bangaloreCenter}
            zoom={13}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* 3. Added the Controller and MapEvents inside */}
            <MapController path={path} />
            <MapEvents onMapClick={handleMapClick} />

            {points.start && <Marker position={points.start} />}
            {points.end && <Marker position={points.end} />}
            {path.length > 0 && (
              <Polyline
                positions={path}
                color="#2563eb"
                weight={6}
                opacity={0.8}
                lineCap="round"
              />
            )}
          </MapContainer>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ESTADO_COLOR = {
  recibido:   "#2563eb",
  en_proceso: "#d97706",
  resuelto:   "#16a34a",
  rechazado:  "#dc2626",
};

function colorIcon(estado) {
  const color = ESTADO_COLOR[estado] || "#2563eb";
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path fill="${color}" stroke="white" stroke-width="1.5"
        d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  `);
  return L.icon({
    iconUrl:    `data:image/svg+xml,${svg}`,
    iconSize:   [24, 36],
    iconAnchor: [12, 36],
    popupAnchor:[0, -36],
  });
}

function AutoCenter({ reclamos, defaultCenter }) {
  const map = useMap();
  useEffect(() => {
    if (reclamos.length === 0) return;
    const bounds = reclamos.map(r => [r.latitud, r.longitud]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [reclamos, map]);
  return null;
}

const ESTADO_LABEL = {
  recibido:   "Recibido",
  en_proceso: "En proceso",
  resuelto:   "Resuelto",
  rechazado:  "Rechazado",
};

export default function MapaReclamos({ reclamos = [], height = "100%", defaultCenter = [-34.6037, -58.3816] }) {
  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ height, width: "100%", borderRadius: "inherit" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AutoCenter reclamos={reclamos} defaultCenter={defaultCenter} />
      {reclamos.map(r => (
        <Marker key={r.id} position={[r.latitud, r.longitud]} icon={colorIcon(r.estado)}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13 }}>{r.titulo}</p>
              {r.categoriaNombre && (
                <p style={{ margin: "0 0 4px", fontSize: 11, color: "#666" }}>{r.categoriaNombre}</p>
              )}
              {r.direccion && (
                <p style={{ margin: "0 0 4px", fontSize: 11, color: "#666" }}>{r.direccion}</p>
              )}
              <span style={{
                display: "inline-block", fontSize: 10, fontWeight: 700,
                padding: "2px 8px", borderRadius: 20,
                background: ESTADO_COLOR[r.estado] + "22",
                color: ESTADO_COLOR[r.estado],
              }}>
                {ESTADO_LABEL[r.estado]}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";

const MapaReclamos = dynamic(
  () => import("@/components/home/MapaReclamos"),
  { ssr: false, loading: () => <div className="mapa-loading"><Loader2 size={24} className="spin" /> Cargando mapa…</div> }
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const ESTADO_LABEL = {
  recibido:   "Recibido",
  en_proceso: "En proceso",
  resuelto:   "Resuelto",
  rechazado:  "Rechazado",
};

const FILTROS = [
  { key: "",           label: "Todos"       },
  { key: "recibido",   label: "Recibido"    },
  { key: "en_proceso", label: "En proceso"  },
  { key: "resuelto",   label: "Resuelto"    },
  { key: "rechazado",  label: "Rechazado"   },
];

export default function MapaPage() {
  const router = useRouter();
  const [reclamos,     setReclamos]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filtro,       setFiltro]       = useState("");
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/reclamos/mapa`)
      .then(r => r.json())
      .then(d => { if (d.ok) setReclamos(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visibles = filtro ? reclamos.filter(r => r.estado === filtro) : reclamos;

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--home-primary)", display: "flex", alignItems: "center", gap: 4, fontWeight: 600, fontSize: 14 }}
        >
          <ArrowLeft size={18} /> Volver
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>
          Mapa de Reclamos
        </h1>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {FILTROS.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`mapa-filtro-btn${filtro === f.key ? " active" : ""}`}
          >
            {f.label}
            <span className="mapa-count">
              {f.key === "" ? reclamos.length : reclamos.filter(r => r.estado === f.key).length}
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: seleccionado ? "1fr 300px" : "1fr", gap: 16 }}>
        <div style={{ borderRadius: 14, overflow: "hidden", height: 500, boxShadow: "0 2px 12px #0001", position: "relative" }}>
          {loading ? (
            <div className="mapa-loading"><Loader2 size={24} className="spin" /> Cargando datos…</div>
          ) : (
            <>
              <MapaReclamos reclamos={visibles} height="500px" onMarkerClick={setSeleccionado} />
              {visibles.length === 0 && (
                <div style={{
                  position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
                  background: "rgba(255,255,255,0.92)", borderRadius: 10, padding: "10px 18px",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 13,
                  color: "var(--home-muted)", boxShadow: "0 2px 8px #0002", whiteSpace: "nowrap",
                }}>
                  <MapPin size={15} />
                  No hay reclamos con ubicación para este filtro
                </div>
              )}
            </>
          )}
        </div>

        {seleccionado && (
          <div className="card" style={{ padding: 18, height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, color: "var(--home-muted)", fontWeight: 600 }}>
                RECLAMO #{String(seleccionado.id).padStart(4, "0")}
              </span>
              <button
                onClick={() => setSeleccionado(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--home-muted)" }}
              >x</button>
            </div>
            <p style={{ margin: "8px 0 4px", fontWeight: 700, fontSize: 15 }}>{seleccionado.titulo}</p>
            {seleccionado.categoriaNombre && (
              <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--home-muted)" }}>{seleccionado.categoriaNombre}</p>
            )}
            {seleccionado.direccion && (
              <div style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 12, color: "var(--home-muted)", marginBottom: 10 }}>
                <MapPin size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{seleccionado.direccion}</span>
              </div>
            )}
            <span className={"estado-badge estado-" + seleccionado.estado.replace("_", "-")}>
              {ESTADO_LABEL[seleccionado.estado]}
            </span>
          </div>
        )}
      </div>

      {!loading && reclamos.length > 0 && (
        <p style={{ fontSize: 12, color: "var(--home-muted)", marginTop: 8, textAlign: "right" }}>
          {visibles.length} de {reclamos.length} reclamo{reclamos.length !== 1 ? "s" : ""} con ubicación registrada
        </p>
      )}
    </div>
  );
}

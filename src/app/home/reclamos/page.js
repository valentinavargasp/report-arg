"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FilePlus2, MapPin, Clock, Tag, ChevronRight } from "lucide-react";
import apiClient from "@/services/apiClient";

const ESTADO_LABELS = {
  recibido: "Recibido",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  rechazado: "Rechazado",
};

const PASOS = ["recibido", "en_proceso", "resuelto"];

function tiempoRelativo(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  const hs = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  if (hs < 24) return `Hace ${hs}h`;
  return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
}

function ProgressBar({ estado }) {
  if (estado === "rechazado") return (
    <div className="reclamo-progress-row">
      <span className="reclamo-rechazado-badge">Reclamo rechazado</span>
    </div>
  );
  const idx = PASOS.indexOf(estado);
  const labels = ["Recibido", "En proceso", "Resuelto"];
  return (
    <div className="reclamo-progress-track">
      {PASOS.map((paso, i) => (
        <div
          key={paso}
          className={[
            "reclamo-step-item",
            i <= idx ? "done" : "",
            i === idx ? "current" : "",
          ].filter(Boolean).join(" ")}
        >
          <div className="reclamo-step-dot" />
          <span className="reclamo-step-label">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function MisReclamosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading" || !session?.user?.id) return;
    apiClient.get(`/reclamos/mis-reclamos?usuario=${session.user.id}`)
      .then(r => r.data)
      .then(d => { if (d.ok) setReclamos(d.data); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [session, status]);

  return (
    <div className="home-feed-wrapper">

      <div className="mr-header">
        <div className="mr-header-text">
          <h2 className="mr-title">Mis Reclamos</h2>
          <p className="mr-sub">Seguí el estado de tus reportes enviados</p>
        </div>
        <button className="mr-nuevo-btn" onClick={() => router.push("/home/reclamos/nuevo")}>
          <FilePlus2 size={15} />
          Nuevo reclamo
        </button>
      </div>

      {loading && <p className="feed-loading">Cargando...</p>}

      {!loading && reclamos.length === 0 && (
        <div className="feed-empty">
          <p style={{ fontSize: 14, fontWeight: 600 }}>Todavía no hiciste ningún reclamo.</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            Cuando reportes un problema, vas a poder seguir su estado desde acá.
          </p>
        </div>
      )}

      {!loading && reclamos.map(r => {
        return (
          <div key={r.id} className="mis-reclamos-card">
            <div className="mis-reclamos-card-top">
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="mis-reclamos-card-title">{r.titulo}</p>
                <div className="mis-reclamos-meta">
                  {r.categoriaNombre && (
                    <span className="mis-reclamos-meta-item">
                      <Tag size={12} /> {r.categoriaNombre}
                    </span>
                  )}
                  {r.direccion && (
                    <span className="mis-reclamos-meta-item">
                      <MapPin size={12} /> {r.direccion}
                    </span>
                  )}
                  <span className="mis-reclamos-meta-item">
                    <Clock size={12} /> {tiempoRelativo(r.fecha_creacion)}
                  </span>
                </div>
              </div>
              <span
                className={`mis-reclamos-badge estado-${r.estado.replace("_", "-")}`}
              >
                {ESTADO_LABELS[r.estado]}
              </span>
            </div>

            <ProgressBar estado={r.estado} />
          </div>
        );
      })}
    </div>
  );
}

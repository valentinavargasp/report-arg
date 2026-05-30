"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const MapaReclamos = dynamic(
  () => import("@/components/home/MapaReclamos"),
  { ssr: false, loading: () => <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#888" }}>Cargando mapa…</div> }
);

export default function TrendingSidebar() {
  const router = useRouter();
  const [tendencias, setTendencias] = useState([]);
  const [reclamos,   setReclamos]   = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/feed/tendencias`)
      .then(r => r.json())
      .then(d => { if (d.ok) setTendencias(d.data); })
      .catch(() => {});

    fetch(`${API_URL}/api/reclamos/mapa`)
      .then(r => r.json())
      .then(d => { if (d.ok) setReclamos(d.data.slice(0, 50)); })
      .catch(() => {});
  }, []);

  return (
    <aside className="home-right-sidebar">

      <div>
        <p className="home-sidebar-section-title">Tendencias en tu zona</p>
        {tendencias.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--home-muted)" }}>Sin datos aún.</p>
        )}
        {tendencias.map((t, i) => {
          const partes = [];
          if (t.reclamos   > 0) partes.push(`${t.reclamos} reclamo${t.reclamos   !== 1 ? "s" : ""}`);
          if (t.comunicados > 0) partes.push(`${t.comunicados} comunicado${t.comunicados !== 1 ? "s" : ""}`);
          return (
            <div key={t.id} className="trending-item">
              <div>
                <div className="trending-tag">#{t.nombre.replace(/\s+/g, "")}</div>
                <div className="trending-count">{partes.join(" · ")}</div>
              </div>
              <span style={{ fontSize: 13, color: "var(--home-muted)", fontWeight: 700 }}>
                {i + 1}
              </span>
            </div>
          );
        })}
      </div>

      <div>
        <p className="home-sidebar-section-title">Actividad en vivo</p>
        <div
          className="live-map-placeholder"
          onClick={() => router.push("/home/mapa")}
          style={{ cursor: "pointer", padding: 0, overflow: "hidden" }}
          title="Ver mapa completo"
        >
          <MapaReclamos reclamos={reclamos} height="140px" />
        </div>
        <p style={{ fontSize: 11, color: "var(--home-muted)", marginTop: 5, textAlign: "center" }}>
          Hacé clic para ver el mapa completo
        </p>
      </div>

    </aside>
  );
}

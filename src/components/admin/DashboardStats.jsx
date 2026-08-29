"use client";

import { useState, useEffect, useRef } from "react";
import apiClient from "@/services/apiClient";

const estadoConfig = {
  recibido:   { label: "Abierto",    color: "#E6F1FB", textColor: "#0C447C" },
  en_proceso: { label: "En proceso", color: "#FAEEDA", textColor: "#633806" },
  resuelto:   { label: "Resuelto",   color: "#EAF3DE", textColor: "#27500A" },
  rechazado:  { label: "Rechazado",  color: "#F1EFE8", textColor: "#444441" },
};

function tiempoRelativo(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const min  = Math.floor(diff / 60000);
  const hs   = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  if (min < 60) return `Hace ${min} min`;
  if (hs  < 24) return `Hace ${hs}h`;
  return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
}

export default function DashboardStats() {
  const chartRef      = useRef(null);
  const chartInstance = useRef(null);

  const [statsUsuarios, setStatsUsuarios] = useState({ total: 0, activos: 0, inactivos: 0, admins: 0 });
  const [statsReclamos, setStatsReclamos] = useState({ total: 0, recibidos: 0, enProceso: 0, resueltos: 0 });
  const [ultimos,       setUltimos]       = useState([]);
  const [porCategoria,  setPorCategoria]  = useState([]);
  const [actividad,     setActividad]     = useState([]);

  useEffect(() => {
    Promise.all([
      apiClient.get(`/admin/usuarios/stats`).then(r => r.data),
      apiClient.get(`/admin/reclamos/stats`).then(r => r.data),
      apiClient.get(`/admin/reclamos/ultimos`).then(r => r.data),
      apiClient.get(`/admin/reclamos/por-categoria`).then(r => r.data),
      apiClient.get(`/admin/reclamos/actividad-mensual`).then(r => r.data),
    ]).then(([uStats, rStats, ult, porCat, act]) => {
      if (uStats.ok) setStatsUsuarios(uStats.data);
      if (rStats.ok) setStatsReclamos(rStats.data);
      if (ult.ok)    setUltimos(ult.data);
      if (porCat.ok) setPorCategoria(porCat.data);
      if (act.ok)    setActividad(act.data);
    }).catch(console.error);
  }, []);

  const meses     = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const chartLabels = actividad.map(a => meses[a.mes - 1]);
  const chartData   = actividad.map(a => a.total);
  const maxCat      = porCategoria.length > 0 ? Math.max(...porCategoria.map(c => c.cantidad)) : 1;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = () => {
      if (!window.Chart || !chartRef.current) return;
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new window.Chart(chartRef.current, {
        type: "line",
        data: {
          labels: chartLabels.length > 0 ? chartLabels : ["Ene","Feb","Mar","Abr","May","Jun"],
          datasets: [{
            label: "Reportes",
            data: chartData.length > 0 ? chartData : [0,0,0,0,0,0],
            borderColor: "#378ADD",
            backgroundColor: "rgba(55,138,221,0.08)",
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: "#378ADD",
            fill: true,
            tension: 0.35,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { size: 11 } } },
          },
        },
      });
    };

    if (window.Chart) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
      script.onload = init;
      document.head.appendChild(script);
    }

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [actividad]);

  const statsCards = [
    { label: "TOTAL REPORTES",   value: statsReclamos.total.toLocaleString(),    sub: "",          subColor: "var(--color-success)" },
    { label: "RECIBIDOS",        value: statsReclamos.recibidos.toLocaleString(), sub: "En espera", subColor: "var(--color-primary)" },
    { label: "EN PROCESO",       value: statsReclamos.enProceso.toLocaleString(), sub: "Asignados", subColor: "var(--color-warning)" },
    { label: "RESUELTOS",        value: statsReclamos.resueltos.toLocaleString(), sub: "",          subColor: "var(--color-success)" },
    { label: "USUARIOS ACTIVOS", value: statsUsuarios.activos.toLocaleString(),   sub: "",          subColor: "var(--color-primary)" },
    { label: "ADMINISTRADORES",  value: statsUsuarios.admins.toLocaleString(),    sub: "",          subColor: "var(--color-warning)" },
  ];

  return (
    <div>

      {/* Stats grid */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {statsCards.map((s) => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: 10,
            border: "1px solid var(--color-border)", padding: "16px 20px",
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "var(--color-muted)", fontWeight: 600, letterSpacing: 1 }}>{s.label}</p>
            <p style={{ margin: "6px 0 2px", fontSize: 26, fontWeight: "bold", color: "var(--color-primary)" }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 12, color: s.subColor, fontWeight: "bold" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Dos columnas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>

        {/* Categorías */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--color-border)", padding: "20px 24px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "var(--color-muted)", fontWeight: 600, letterSpacing: 1 }}>REPORTES POR CATEGORÍA</p>
          {porCategoria.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--color-muted)" }}>Sin datos disponibles.</p>
          )}
          {porCategoria.map((c) => (
            <div key={c.categoria} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "#444", width: 150, flexShrink: 0 }}>{c.categoria || "Sin categoría"}</span>
              <div style={{ flex: 1, height: 8, background: "var(--color-border)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${Math.round((c.cantidad / maxCat) * 100)}%`, height: "100%", background: "#378ADD", borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--color-muted)", width: 36, textAlign: "right", flexShrink: 0 }}>{c.cantidad}</span>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--color-border)", padding: "20px 24px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "var(--color-muted)", fontWeight: 600, letterSpacing: 1 }}>ACTIVIDAD MENSUAL</p>
          <div style={{ position: "relative", width: "100%", height: 200 }}>
            <canvas ref={chartRef} role="img" aria-label="Gráfico de reportes por mes" />
          </div>
        </div>

      </div>

      {/* Últimos reportes */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--color-border)", padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 11, color: "var(--color-muted)", fontWeight: 600, letterSpacing: 1 }}>ÚLTIMOS REPORTES</p>
          <a href="/admin/reclamos" style={{ fontSize: 12, color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
            Ver todos →
          </a>
        </div>
        {ultimos.length === 0 && (
          <p style={{ fontSize: 13, color: "#aaa" }}>Sin reportes recientes.</p>
        )}
        {ultimos.map((r, i) => {
          const cfg = estadoConfig[r.estado] || estadoConfig.recibido;
          return (
            <div key={r.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: i < ultimos.length - 1 ? "1px solid var(--color-border)" : "none",
              gap: 8,
            }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 13, color: "#333" }}>{r.titulo}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>
                  {tiempoRelativo(r.fecha_creacion)} · {r.direccion || r.categoria || ""}
                </p>
              </div>
              <span style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                background: cfg.color, color: cfg.textColor, whiteSpace: "nowrap",
              }}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import Breadcrumb from "@/components/admin/Breadcrumb";
import { MapPin, Clock, Tag, ChevronLeft, ChevronRight, User } from "lucide-react";
import apiClient from "@/services/apiClient";

const ESTADOS = [
  { key: "", label: "Todos" },
  { key: "recibido", label: "Recibido" },
  { key: "en_proceso", label: "En proceso" },
  { key: "resuelto", label: "Resuelto" },
  { key: "rechazado", label: "Rechazado" },
];

const ESTADO_LABELS = {
  recibido: "Recibido",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  rechazado: "Rechazado",
};

function estadoClass(estado) {
  return `estado-${estado.replace("_", "-")}`;
}

function tiempoRelativo(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  const hs = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  if (min < 60) return `Hace ${min} min`;
  if (hs < 24) return `Hace ${hs}h`;
  return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
}

export default function AdminReclamosPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPag, setTotalPag] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReclamos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pagina, limite: 15 });
      if (filtroEstado) params.set("estado", filtroEstado);
      const res = await apiClient.get(`/admin/reclamos/lista?${params}`);
      const data = res.data;
      if (data.ok) {
        setReclamos(data.data);
        setTotal(data.total);
        setTotalPag(data.totalPaginas);
      }
    } catch { }
    finally { setLoading(false); }
  }, [pagina, filtroEstado]);

  useEffect(() => { fetchReclamos(); }, [fetchReclamos]);

  async function cargarDetalle(id) {
    try {
      const res = await apiClient.get(`/admin/reclamos/${id}`);
      const data = res.data;
      if (data.ok) setDetalle(data.data);
    } catch { }
  }

  async function cambiarEstado(id, estado) {
    setUpdatingId(id);
    try {
      const res = await apiClient.patch(`/admin/reclamos/${id}/estado`, { estado });
      const data = res.data;
      if (data.ok) {
        setReclamos(prev => prev.map(r => r.id === id ? { ...r, estado } : r));
        if (detalle?.id === id) setDetalle(prev => ({ ...prev, estado }));
      }
    } catch { }
    finally { setUpdatingId(null); }
  }

  function filtrar(estado) {
    setFiltroEstado(estado);
    setPagina(1);
  }

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Reportes" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">

          <div style={{ marginBottom: 20 }}>
            <Breadcrumb items={[{ label: "ADMIN PANEL", href: "/admin" }, { label: "REPORTES" }]} />
            <h1 style={{ margin: "6px 0 2px", fontSize: 26, fontWeight: "bold", color: "var(--color-primary)" }}>
              Reportes
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
              {total} reporte{total !== 1 ? "s" : ""} en total
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {ESTADOS.map(e => (
              <button key={e.key} onClick={() => filtrar(e.key)} className={`ar-filter-btn${filtroEstado === e.key ? " active" : ""}`}>
                {e.label}
              </button>
            ))}
          </div>

          <div className={`ar-grid${detalle ? " with-detail" : ""}`}>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {loading && <p style={{ padding: 24, color: "var(--color-muted)", fontSize: 13 }}>Cargando...</p>}
              {!loading && reclamos.length === 0 && (
                <p style={{ padding: 24, color: "var(--color-muted)", fontSize: 13 }}>No hay reportes con estos filtros.</p>
              )}


              {!loading && reclamos.length > 0 && (
                <div className="table-wrapper">
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 640 }}>
                    <thead>
                      <tr style={{ background: "var(--color-bg)" }}>
                        {["ID", "Título", "Categoría", "Autor", "Fecha", "Estado", ""].map(h => (
                          <th key={h} style={{
                            padding: "10px 14px", textAlign: "left", fontSize: 11,
                            color: "var(--color-muted)", fontWeight: 600, letterSpacing: 0.5,
                            borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap"
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reclamos.map((r, i) => {
                        const isActive = detalle?.id === r.id;
                        return (
                          <tr key={r.id} style={{
                            borderBottom: i < reclamos.length - 1 ? "1px solid var(--color-border)" : "none",
                            background: isActive ? "#f0f4ff" : "transparent",
                          }}>
                            <td style={{ padding: "10px 14px", color: "var(--color-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
                              #{String(r.id).padStart(4, "0")}
                            </td>
                            <td style={{
                              padding: "10px 14px", maxWidth: 200, overflow: "hidden",
                              textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#333"
                            }}>
                              {r.titulo}
                            </td>
                            <td style={{ padding: "10px 14px", color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                              {r.categoriaNombre || "—"}
                            </td>
                            <td style={{ padding: "10px 14px", color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                              {r.autorNombre || "—"}
                            </td>
                            <td style={{ padding: "10px 14px", color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                              {tiempoRelativo(r.fecha_creacion)}
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <span className={`estado-badge ${estadoClass(r.estado)}`}>
                                {ESTADO_LABELS[r.estado]}
                              </span>
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <button onClick={() => detalle?.id === r.id ? setDetalle(null) : cargarDetalle(r.id)}
                                className={`ar-ver-btn${isActive ? " active" : ""}`}>
                                {isActive ? "Cerrar" : "Ver"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}


              {!loading && reclamos.length > 0 && (
                <div className="ar-mobile-cards">
                  {reclamos.map(r => {
                    const isActive = detalle?.id === r.id;
                    return (
                      <div key={r.id} className={`ar-mobile-card${isActive ? " active" : ""}`}
                        onClick={() => detalle?.id === r.id ? setDetalle(null) : cargarDetalle(r.id)}>
                        <div className="ar-mc-row">
                          <span className="ar-mc-id">#{String(r.id).padStart(4, "0")}</span>
                          <span className={`ar-mc-badge ${estadoClass(r.estado)}`}>{ESTADO_LABELS[r.estado]}</span>
                        </div>
                        <p className="ar-mc-title">{r.titulo}</p>
                        <div className="ar-mc-meta">
                          {r.categoriaNombre && <span><Tag size={11} /> {r.categoriaNombre}</span>}
                          {r.autorNombre && <span><User size={11} /> {r.autorNombre}</span>}
                          <span><Clock size={11} /> {tiempoRelativo(r.fecha_creacion)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && totalPag > 1 && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "flex-end",
                  gap: 10, padding: "12px 16px", borderTop: "1px solid var(--color-border)"
                }}>
                  <button onClick={() => setPagina(p => Math.max(p - 1, 1))} disabled={pagina === 1}
                    className="ar-page-btn" style={{ opacity: pagina === 1 ? 0.4 : 1 }}>
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{pagina} / {totalPag}</span>
                  <button onClick={() => setPagina(p => Math.min(p + 1, totalPag))} disabled={pagina === totalPag}
                    className="ar-page-btn" style={{ opacity: pagina === totalPag ? 0.4 : 1 }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {detalle && (
              <div className="card ar-detail-panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 600, letterSpacing: 0.5 }}>
                    DETALLE #{String(detalle.id).padStart(4, "0")}
                  </span>
                  <button onClick={() => setDetalle(null)}
                    style={{
                      background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)",
                      fontSize: 18, lineHeight: 1, padding: "2px 6px"
                    }}>
                    ✕
                  </button>
                </div>

                <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#333" }}>{detalle.titulo}</h3>

                {detalle.descripcion && (
                  <p style={{ margin: "0 0 14px", fontSize: 13, color: "#555", lineHeight: 1.5 }}>
                    {detalle.descripcion}
                  </p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {detalle.categoriaNombre && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--color-muted)" }}>
                      <Tag size={13} style={{ flexShrink: 0 }} /><span>{detalle.categoriaNombre}</span>
                    </div>
                  )}
                  {detalle.direccion && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--color-muted)" }}>
                      <MapPin size={13} style={{ flexShrink: 0 }} /><span>{detalle.direccion}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--color-muted)" }}>
                    <Clock size={13} style={{ flexShrink: 0 }} />
                    <span>{new Date(detalle.fecha_creacion).toLocaleString("es-AR")}</span>
                  </div>
                  {detalle.autorNombre && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--color-muted)" }}>
                      <User size={13} style={{ flexShrink: 0 }} /><span>{detalle.autorNombre}</span>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 14 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, color: "var(--color-muted)", fontWeight: 600, letterSpacing: 0.5 }}>
                    CAMBIAR ESTADO
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {["recibido", "en_proceso", "resuelto", "rechazado"].map(est => {
                      const active = detalle.estado === est;
                      return (
                        <button
                          key={est}
                          disabled={active || updatingId === detalle.id}
                          onClick={() => cambiarEstado(detalle.id, est)}
                          className={`estado-btn ${estadoClass(est)}${active ? " active" : ""}`}
                          style={{ opacity: updatingId === detalle.id && !active ? 0.6 : 1 }}
                        >
                          {active ? `✓ ${ESTADO_LABELS[est]}` : ESTADO_LABELS[est]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";

const estadoConfig = {
  verificada: { label: "Verificada", bg: "#EAF3DE", color: "#27500A" },
  pendiente: { label: "Pendiente", bg: "#FFF8E1", color: "#7a6000" },
};

export default function InstitutionTable() {
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modalAprobar, setModalAprobar] = useState(null);
  const [modalRechazar, setModalRechazar] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [motivoError, setMotivoError] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    fetchInstituciones();
  }, [filtro]);

  async function fetchInstituciones() {
    setLoading(true);
    setError("");
    try {
      const params = filtro !== "todos" ? `?estado=${filtro}` : "";
      const res = await apiClient.get(`/admin/instituciones${params}`);
      const data = res.data;
      if (data.ok) setInstituciones(data.data);
      else setError("Error al cargar instituciones");
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function aprobar(id) {
    setProcesando(true);
    try {
      const res = await apiClient.put(`/admin/instituciones/${id}/verificar`);
      const data = res.data;
      if (data.ok) {
        await fetchInstituciones();
        setModalAprobar(null);
      } else {
        setError(data.mensaje);
      }
    } catch (err) {
      setError("Error al verificar institución");
    } finally {
      setProcesando(false);
    }
  }

  async function rechazar(id) {
    if (!motivo.trim()) { setMotivoError("El motivo es obligatorio"); return; }
    setProcesando(true);
    try {
      const res = await apiClient.put(`/admin/instituciones/${id}/rechazar`, { motivo });
      const data = res.data;
      if (data.ok) {
        await fetchInstituciones();
        setModalRechazar(null);
        setMotivo("");
        setMotivoError("");
      } else {
        setError(data.mensaje);
      }
    } catch (err) {
      setError("Error al rechazar institución");
    } finally {
      setProcesando(false);
    }
  }

  const filtradas = instituciones.filter(i => {
    if (filtro === "todos") return true;
    if (filtro === "pendiente") return !i.verificada;
    if (filtro === "verificada") return i.verificada;
    return true;
  });

  return (
    <div className="card">

      {/* Modal aprobar */}
      {modalAprobar && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 28,
            maxWidth: 400, width: "90%", border: "1px solid var(--color-border)",
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#333" }}>¿Verificar institución?</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
              Se verificará <strong>{modalAprobar.nombre}</strong> y se le enviará un email de confirmación.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setModalAprobar(null)}
                style={{
                  padding: "8px 18px", border: "1px solid var(--color-border)",
                  borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer",
                }}
              >Cancelar</button>
              <button
                onClick={() => aprobar(modalAprobar.id)}
                disabled={procesando}
                style={{
                  padding: "8px 18px", background: "#639922",
                  color: "#fff", border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: "bold",
                  cursor: procesando ? "not-allowed" : "pointer",
                  opacity: procesando ? 0.7 : 1,
                }}
              >{procesando ? "Verificando..." : "Verificar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal rechazar */}
      {modalRechazar && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 28,
            maxWidth: 420, width: "90%", border: "1px solid var(--color-border)",
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#333" }}>Rechazar institución</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#666" }}>
              Ingresá el motivo del rechazo para <strong>{modalRechazar.nombre}</strong>. Se le enviará un email con esta información.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>MOTIVO DEL RECHAZO</label>
              <textarea
                rows={3}
                value={motivo}
                onChange={e => { setMotivo(e.target.value); setMotivoError(""); }}
                placeholder="Ej: La documentación presentada es insuficiente..."
                style={{
                  width: "100%", marginTop: 6, padding: "8px 12px", fontSize: 13,
                  border: `1px solid ${motivoError ? "var(--color-danger)" : "var(--color-border)"}`,
                  borderRadius: 8, resize: "none", boxSizing: "border-box",
                }}
              />
              {motivoError && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: "4px 0 0" }}>{motivoError}</p>}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setModalRechazar(null); setMotivo(""); setMotivoError(""); }}
                style={{
                  padding: "8px 18px", border: "1px solid var(--color-border)",
                  borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer",
                }}
              >Cancelar</button>
              <button
                onClick={() => rechazar(modalRechazar.id)}
                disabled={procesando}
                style={{
                  padding: "8px 18px", background: "var(--color-danger)",
                  color: "#fff", border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: "bold",
                  cursor: procesando ? "not-allowed" : "pointer",
                  opacity: procesando ? 0.7 : 1,
                }}
              >{procesando ? "Rechazando..." : "Rechazar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="table-filters">
        <select
          className="select"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        >
          <option value="todos">Estado: Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="verificada">Verificadas</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <p style={{ textAlign: "center", color: "var(--color-danger)", padding: "16px 0", fontSize: 13 }}>
          {error}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <p style={{ textAlign: "center", color: "#aaa", padding: "32px 0", fontSize: 14 }}>
          Cargando instituciones...
        </p>
      )}

      {/* Sin resultados */}
      {!loading && !error && filtradas.length === 0 && (
        <p style={{ textAlign: "center", color: "#aaa", padding: "32px 0", fontSize: 14 }}>
          No hay instituciones {filtro !== "todos" ? `en estado "${filtro}"` : ""}.
        </p>
      )}

      {/* Tabla desktop */}
      {!loading && filtradas.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Institución</th>
                <th>Tipo</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((inst, i) => (
                <tr key={inst.id} className={i % 2 === 0 ? "row" : "row alt"}>
                  <td>
                    <div>
                      <p className="name">{inst.nombre}</p>
                      <p className="email">{inst.email}</p>
                    </div>
                  </td>
                  <td className="muted">{inst.tipo || "—"}</td>
                  <td className="muted">{inst.direccion || "—"}</td>
                  <td>
                    <span style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                      background: inst.verificada ? "#EAF3DE" : "#FFF8E1",
                      color: inst.verificada ? "#27500A" : "#7a6000",
                    }}>
                      {inst.verificada ? "Verificada" : "Pendiente"}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      {!inst.verificada && (
                        <button
                          className="btn-edit"
                          onClick={() => setModalAprobar(inst)}
                          style={{ background: "#639922", color: "#fff", border: "none" }}
                        >Verificar</button>
                      )}
                      <button
                        className="btn-danger"
                        onClick={() => setModalRechazar(inst)}
                      >Rechazar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards mobile */}
      {!loading && filtradas.length > 0 && (
        <div className="cards">
          {filtradas.map(inst => (
            <div key={inst.id} className="card-user">
              <div className="row-top">
                <div>
                  <p className="name">{inst.nombre}</p>
                  <p className="email">{inst.email}</p>
                </div>
                <span style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                  background: inst.verificada ? "#EAF3DE" : "#FFF8E1",
                  color: inst.verificada ? "#27500A" : "#7a6000",
                }}>
                  {inst.verificada ? "Verificada" : "Pendiente"}
                </span>
              </div>
              <div className="row-bottom">
                <span className="muted">{inst.tipo || "—"}</span>
                <div className="actions">
                  {!inst.verificada && (
                    <button
                      className="btn-edit"
                      onClick={() => setModalAprobar(inst)}
                      style={{ background: "#639922", color: "#fff", border: "none" }}
                    >Verificar</button>
                  )}
                  <button
                    className="btn-danger"
                    onClick={() => setModalRechazar(inst)}
                  >Rechazar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
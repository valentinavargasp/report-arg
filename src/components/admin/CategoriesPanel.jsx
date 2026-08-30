"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, MinusCircle, AlertTriangle } from "lucide-react";
import apiClient from "@/services/apiClient";

const tipoBadge = {
  reclamo: { label: "Reclamo", bg: "#dbeafe", color: "#1e40af" },
  comunicado: { label: "Comunicado", bg: "#fef9c3", color: "#854d0e" },
  ambos: { label: "Ambos", bg: "#dcfce7", color: "#166534" },
};

export default function CategoriesPanel() {
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmBaja, setConfirmBaja] = useState(null);
  const [bajando, setBajando] = useState(false);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  // Paginación
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(5);

  useEffect(() => { fetchCategorias(); }, []);

  // Volver a página 1 al cambiar filtros
  useEffect(() => { setPagina(1); }, [filtroTipo, filtroEstado]);

  async function fetchCategorias() {
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/categorias`);
      const data = res.data;
      if (data.ok) setCategorias(data.data);
    } catch {
      setError("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  }

  async function confirmarBaja() {
    if (!confirmBaja) return;
    setBajando(true);
    try {
      const res = await apiClient.patch(`/admin/categorias/${confirmBaja.id}/baja`);
      const data = res.data;
      if (!data.ok) { setError(data.mensaje); return; }
      await fetchCategorias();
      setSuccessMsg("Categoría desactivada correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Error al desactivar categoría");
    } finally {
      setBajando(false);
      setConfirmBaja(null);
    }
  }

  // Filtrado local
  const categoriasFiltradas = categorias.filter(c => {
    if (filtroTipo && c.tipo !== filtroTipo) return false;
    if (filtroEstado && c.estado !== filtroEstado) return false;
    return true;
  });

  const filtrosActivos = [
    filtroTipo && { label: `Tipo: ${filtroTipo}`, onRemove: () => setFiltroTipo("") },
    filtroEstado && { label: `Estado: ${filtroEstado}`, onRemove: () => setFiltroEstado("") },
  ].filter(Boolean);

  // Paginación
  const totalFiltradas = categoriasFiltradas.length;
  const totalPaginas = porPagina === 0 ? 1 : Math.ceil(totalFiltradas / porPagina);
  const categoriasVisibles = porPagina === 0
    ? categoriasFiltradas
    : categoriasFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div>

      {/* Modal baja lógica */}
      {confirmBaja && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 28,
            maxWidth: 400, width: "90%", border: "1px solid var(--color-border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={20} color="#F5C842" />
              <h3 style={{ margin: 0, fontSize: 16, color: "#333" }}>Desactivar categoría</h3>
            </div>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
              ¿Estás seguro de que deseas desactivar la categoría <strong>"{confirmBaja.nombre}"</strong>?
              Los usuarios no podrán generar nuevos reportes bajo esta clasificación.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmBaja(null)} style={{
                padding: "9px 20px", border: "1px solid var(--color-primary)",
                borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer",
                fontWeight: 600,
              }}>Cancelar</button>
              <button onClick={confirmarBaja} disabled={bajando} style={{
                padding: "9px 20px", background: "var(--color-danger)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: "bold", cursor: bajando ? "not-allowed" : "pointer",
              }}>{bajando ? "Desactivando..." : "Confirmar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes */}
      {error && (
        <div className="cat-msg-error" style={{ marginBottom: 16 }}>{error}</div>
      )}
      {successMsg && (
        <div className="cat-msg-success" style={{ marginBottom: 16 }}>✓ {successMsg}</div>
      )}

      {/* Filtros */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label" style={{ display: "block", marginBottom: 6 }}>Tipo de Reporte</label>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
              className="select" style={{ width: "100%", boxSizing: "border-box" }}>
              <option value="">Todos los tipos</option>
              <option value="reclamo">Reclamo</option>
              <option value="comunicado">Comunicado</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label" style={{ display: "block", marginBottom: 6 }}>Estado</label>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
              className="select" style={{ width: "100%", boxSizing: "border-box" }}>
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          {(filtroTipo || filtroEstado) && (
            <button onClick={() => { setFiltroTipo(""); setFiltroEstado(""); }}
              style={{ padding: "8px 14px", border: "1px solid var(--color-border)", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "#555", alignSelf: "flex-end" }}>
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        {/* Filtros activos */}
        {filtrosActivos.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Filtros activos:</span>
            {filtrosActivos.map(f => (
              <span key={f.label} style={{
                padding: "2px 6px 2px 10px", borderRadius: 99, fontSize: 12,
                background: "var(--color-primary-light)", color: "var(--color-primary)",
                fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                {f.label}
                <button onClick={f.onRemove} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--color-primary)", fontSize: 13, lineHeight: 1, padding: "0 2px",
                }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="card" style={{ overflow: "hidden" }}>

        {/* Desktop */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr style={{ background: "var(--color-bg)" }}>
                <th>CÓDIGO</th>
                <th>NOMBRE</th>
                <th>TIPO</th>
                <th>ESTADO</th>
                <th>ORDEN</th>
                <th style={{ textAlign: "center" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--color-muted)" }}>Cargando categorías...</td></tr>
              )}
              {!loading && categoriasFiltradas.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--color-muted)" }}>No hay categorías para mostrar.</td></tr>
              )}
              {!loading && categoriasVisibles.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? "row" : "row alt"}>
                  <td style={{ fontWeight: 600, color: "var(--color-primary)", fontSize: 13 }}>{c.codigo}</td>
                  <td style={{ color: "#333" }}>{c.nombre}</td>
                  <td>
                    <span style={{
                      padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                      background: tipoBadge[c.tipo]?.bg ?? "#eee",
                      color: tipoBadge[c.tipo]?.color ?? "#555",
                    }}>
                      {tipoBadge[c.tipo]?.label ?? c.tipo}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 12,
                      padding: "3px 10px", borderRadius: 99,
                      background: c.estado === "activo" ? "#dcfce7" : "#f3f4f6",
                      color: c.estado === "activo" ? "var(--color-success)" : "var(--color-muted)"
                    }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: c.estado === "activo" ? "var(--color-success)" : "#9ca3af", display: "inline-block"
                      }} />
                      {c.estado === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ color: "#555", fontSize: 13 }}>{c.orden}</td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      {c.estado === "activo" && (
                        <button onClick={() => setConfirmBaja(c)}
                          title="Desactivar" style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--color-muted)", padding: 4,
                          }}>
                          <MinusCircle size={18} />
                        </button>
                      )}
                      <button onClick={() => router.push(`/admin/categories/editar/${c.id}`)}
                        title="Editar" style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "var(--color-primary)", padding: 4,
                        }}>
                        <Pencil size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && (
            <div style={{
              padding: "12px 20px", display: "flex", justifyContent: "space-between",
              alignItems: "center", borderTop: "1px solid var(--color-border)", flexWrap: "wrap", gap: 10
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: "var(--color-muted)" }}>
                  {porPagina === 0 || totalFiltradas === 0
                    ? `Mostrando ${totalFiltradas} de ${categorias.length} categorías`
                    : `Mostrando ${Math.min((pagina - 1) * porPagina + 1, totalFiltradas)} a ${Math.min(pagina * porPagina, totalFiltradas)} de ${totalFiltradas} categorías`}
                </span>
                <select value={porPagina} onChange={e => { setPorPagina(Number(e.target.value)); setPagina(1); }}
                  style={{
                    padding: "4px 8px", fontSize: 12, border: "1px solid var(--color-border)",
                    borderRadius: 6, background: "#fff", cursor: "pointer", color: "var(--color-text)"
                  }}>
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={0}>Todas</option>
                </select>
              </div>
              {porPagina > 0 && totalPaginas > 1 && (
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <button onClick={() => setPagina(p => Math.max(p - 1, 1))} disabled={pagina === 1}
                    style={{
                      padding: "5px 14px", border: "1px solid var(--color-border)", borderRadius: 6,
                      background: "#fff", cursor: pagina === 1 ? "not-allowed" : "pointer",
                      color: pagina === 1 ? "#bbb" : "var(--color-text)", fontSize: 13
                    }}>
                    Anterior
                  </button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPagina(n)}
                      style={{
                        padding: "5px 12px", border: "1px solid var(--color-border)", borderRadius: 6,
                        background: n === pagina ? "var(--color-primary)" : "#fff",
                        color: n === pagina ? "#fff" : "var(--color-text)",
                        cursor: "pointer", fontSize: 13, fontWeight: n === pagina ? 700 : 400
                      }}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))} disabled={pagina === totalPaginas}
                    style={{
                      padding: "5px 14px", border: "1px solid var(--color-border)", borderRadius: 6,
                      background: "#fff", cursor: pagina === totalPaginas ? "not-allowed" : "pointer",
                      color: pagina === totalPaginas ? "#bbb" : "var(--color-text)", fontSize: 13
                    }}>
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="cards">
          {loading && <p style={{ padding: 24, textAlign: "center", color: "var(--color-muted)" }}>Cargando...</p>}
          {!loading && categoriasVisibles.map(c => (
            <div key={c.id} className="card-user">
              <div className="row-top">
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)" }}>{c.codigo}</span>
                  <p style={{ margin: "2px 0 0", fontWeight: 700, color: "#333", fontSize: 14 }}>{c.nombre}</p>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700, fontSize: 12,
                  padding: "2px 8px", borderRadius: 99,
                  background: c.estado === "activo" ? "#dcfce7" : "#f3f4f6",
                  color: c.estado === "activo" ? "var(--color-success)" : "var(--color-muted)"
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: c.estado === "activo" ? "var(--color-success)" : "#9ca3af", display: "inline-block"
                  }} />
                  {c.estado === "activo" ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="row-bottom">
                <span style={{
                  padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                  background: tipoBadge[c.tipo]?.bg ?? "#eee",
                  color: tipoBadge[c.tipo]?.color ?? "#555",
                }}>
                  {tipoBadge[c.tipo]?.label ?? c.tipo}
                </span>
                <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Orden: {c.orden}</span>
                <div className="actions">
                  {c.estado === "activo" && (
                    <button onClick={() => setConfirmBaja(c)} style={{
                      background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", padding: 4,
                    }}>
                      <MinusCircle size={18} />
                    </button>
                  )}
                  <button onClick={() => router.push(`/admin/categories/editar/${c.id}`)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--color-primary)", padding: 4,
                  }}>
                    <Pencil size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Paginación mobile */}
          {!loading && (
            <div style={{
              padding: "12px 4px", display: "flex", flexDirection: "column",
              gap: 10, borderTop: "1px solid var(--color-border)", marginTop: 4
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
                  {porPagina === 0 || totalFiltradas === 0
                    ? `${totalFiltradas} de ${categorias.length} categorías`
                    : `${Math.min((pagina - 1) * porPagina + 1, totalFiltradas)}–${Math.min(pagina * porPagina, totalFiltradas)} de ${totalFiltradas}`}
                </span>
                <select value={porPagina} onChange={e => { setPorPagina(Number(e.target.value)); setPagina(1); }}
                  style={{
                    padding: "4px 8px", fontSize: 12, border: "1px solid var(--color-border)",
                    borderRadius: 6, background: "#fff", cursor: "pointer", color: "var(--color-text)"
                  }}>
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={0}>Todas</option>
                </select>
              </div>
              {porPagina > 0 && totalPaginas > 1 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                  <button onClick={() => setPagina(p => Math.max(p - 1, 1))} disabled={pagina === 1}
                    style={{
                      flex: 1, padding: "8px 0", border: "1px solid var(--color-border)", borderRadius: 6,
                      background: "#fff", cursor: pagina === 1 ? "not-allowed" : "pointer",
                      color: pagina === 1 ? "#bbb" : "var(--color-text)", fontSize: 13
                    }}>
                    ← Anterior
                  </button>
                  <span style={{ fontSize: 13, color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                    {pagina} / {totalPaginas}
                  </span>
                  <button onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))} disabled={pagina === totalPaginas}
                    style={{
                      flex: 1, padding: "8px 0", border: "1px solid var(--color-border)", borderRadius: 6,
                      background: "#fff", cursor: pagina === totalPaginas ? "not-allowed" : "pointer",
                      color: pagina === totalPaginas ? "#bbb" : "var(--color-text)", fontSize: 13
                    }}>
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
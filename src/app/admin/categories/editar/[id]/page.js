"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import Breadcrumb from "@/components/admin/Breadcrumb";
import apiClient from "@/services/apiClient";


export default function EditarCategoriaPage() {
  const router = useRouter();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    tipo: "",
    orden: 0,
    estado: "activo",
  });

  useEffect(() => {
    async function fetchCategoria() {
      try {
        const res = await apiClient.get(`/admin/categorias/${id}`);
        const data = res.data;
        if (data.ok) setForm(data.data);
      } catch {
        setError("Error al cargar la categoría");
      } finally {
        setLoading(false);
      }
    }
    fetchCategoria();
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "activo" : "inactivo") : value,
    }));
  }

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!form.nombre.trim()) return setError("El nombre es obligatorio");
    if (!form.tipo) return setError("El tipo es obligatorio");

    setSaving(true);
    try {
      const res = await apiClient.put(`/admin/categorias/${id}`, {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion?.trim() || null,
        tipo: form.tipo,
        estado: form.estado,
        orden: Number(form.orden),
      });
      const data = res.data;
      if (!data.ok) return setError(data.mensaje);
      setSuccess("La categoría se ha actualizado correctamente.");
      setTimeout(() => router.push("/admin/categories"), 1500);
    } catch {
      setError("Error al conectar con el servidor");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Categorías" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">
          <p style={{ color: "var(--color-muted)", fontSize: 14 }}>Cargando categoría...</p>
        </main>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Categorías" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">

          <div style={{ marginBottom: 28 }}>
            <Breadcrumb items={[{ label: "ADMIN PANEL", href: "/admin" }, { label: "CATEGORÍAS", href: "/admin/categories" }, { label: "EDITAR" }]} />
            <h1 style={{ margin: "6px 0 4px", fontSize: 26, fontWeight: "bold", color: "var(--color-primary)" }}>
              Editar Categoría
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color-muted)" }}>
              Modificá los detalles de la categoría existente.
            </p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <p style={{ margin: "0 0 20px", fontSize: 11, color: "var(--color-muted)", fontWeight: 600, letterSpacing: 1 }}>
              EDITAR CATEGORÍA — {form.codigo}
            </p>

            {/* Código (no editable) y Nombre */}
            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="form-label">CÓDIGO</label>
                <input value={form.codigo} disabled
                  className="input"
                  style={{ display: "block", width: "100%", marginTop: 6, boxSizing: "border-box", background: "#f0f0f0", color: "#888", cursor: "not-allowed" }} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="form-label">NOMBRE</label>
                <input name="nombre" value={form.nombre} onChange={handleChange}
                  className="input" style={{ display: "block", width: "100%", marginTop: 6, boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">DESCRIPCIÓN</label>
              <textarea name="descripcion" value={form.descripcion || ""} onChange={handleChange}
                rows={3} className="input"
                style={{ display: "block", width: "100%", marginTop: 6, resize: "none", boxSizing: "border-box" }} />
            </div>

            {/* Tipo, Orden y Estado */}
            <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label className="form-label">TIPO</label>
                <select name="tipo" value={form.tipo} onChange={handleChange}
                  className="select" style={{ display: "block", width: "100%", marginTop: 6, boxSizing: "border-box" }}>
                  <option value="reclamo">Reclamo</option>
                  <option value="comunicado">Comunicado</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
              <div style={{ minWidth: 100 }}>
                <label className="form-label">ORDEN</label>
                <input name="orden" type="number" value={form.orden} onChange={handleChange}
                  className="input" style={{ display: "block", width: "100%", marginTop: 6, boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 4 }}>
                <label className="cat-toggle">
                  <input type="checkbox" name="estado" checked={form.estado === "activo"} onChange={handleChange} />
                  <span className="cat-toggle-slider" />
                </label>
                <span style={{ fontSize: 13, fontWeight: 600, color: form.estado === "activo" ? "var(--color-success)" : "var(--color-muted)" }}>
                  {form.estado === "activo" ? "ACTIVO" : "INACTIVO"}
                </span>
              </div>
            </div>

            {/* Mensajes */}
            {success && (
              <div className="cat-msg-success" style={{ marginTop: 20 }}>
                ✓ {success}
              </div>
            )}
            {error && (
              <div className="cat-msg-error" style={{ marginTop: 20 }}>
                ⚠ {error}
              </div>
            )}

            {/* Botones */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button onClick={() => router.push("/admin/categories")}
                style={{
                  padding: "10px 24px", background: "#fff",
                  color: "#555", border: "1px solid var(--color-border)",
                  borderRadius: 8, fontSize: 14, cursor: "pointer",
                }}>
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={saving}
                style={{
                  padding: "10px 24px", background: saving ? "var(--color-muted)" : "var(--color-primary)",
                  color: "#fff", border: "none", borderRadius: 8,
                  fontSize: 14, fontWeight: "bold", cursor: saving ? "not-allowed" : "pointer",
                }}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
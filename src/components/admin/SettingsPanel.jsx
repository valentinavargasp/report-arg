"use client";

import { useState, useRef, useEffect } from "react";

const estadosIniciales = [
  { nombre: "Abierto", desc: "Estado inicial al crear un reporte", color: "#378ADD", bg: "#E6F1FB", text: "#0C447C", tipo: "Inicial" },
  { nombre: "En proceso", desc: "Asignado a un área responsable", color: "#EF9F27", bg: "#FAEEDA", text: "#633806", tipo: "Intermedio" },
  { nombre: "Resuelto", desc: "Incidencia resuelta y cerrada", color: "#639922", bg: "#EAF3DE", text: "#27500A", tipo: "Final" },
  { nombre: "Rechazado", desc: "Reporte inválido o duplicado", color: "#888780", bg: "#F1EFE8", text: "#444441", tipo: "Final" },
];

const zonasHorarias = [
  "America/Argentina/Buenos_Aires",
  "America/Argentina/Cordoba",
  "America/Argentina/Mendoza",
  "America/Argentina/Rosario",
  "America/Argentina/Salta",
];

const tabs = ["Parámetros generales", "Estados del flujo", "Notificaciones"];

export default function SettingsPanel() {
  const [tabActivo, setTabActivo] = useState(0);
  const fileRef = useRef(null);

  // Parámetros generales
  const [general, setGeneral] = useState({
    nombre: "ReportARG",
    zona: "America/Argentina/Buenos_Aires",
    email: "admin@reportarg.gob.ar",
    idioma: "Español (Argentina)",
    logo: null,
  });
  const [generalGuardado, setGeneralGuardado] = useState({ ...general });
  const [logoPreview, setLogoPreview] = useState(null);
  const [generalCambios, setGeneralCambios] = useState(false);
  const [generalGuardadoOk, setGeneralGuardadoOk] = useState(false);

  // Notificaciones
  const [notifs, setNotifs] = useState({
    emailCrear: true,
    emailEstado: true,
    resumenDiario: false,
    alertasUrgentes: true,
    push: false,
  });
  const [notifsCambios, setNotifsCambios] = useState(false);
  const [notifsGuardadoOk, setNotifsGuardadoOk] = useState(false);

  // --- Handlers generales ---
  function handleGeneralChange(e) {
    setGeneral(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setGeneralCambios(true);
    setGeneralGuardadoOk(false);
  }

  function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    setGeneral(prev => ({ ...prev, logo: url }));
    setGeneralCambios(true);
    setGeneralGuardadoOk(false);
  }

  function guardarGeneral() {
    setGeneralGuardado({ ...general });
    setGeneralCambios(false);
    setGeneralGuardadoOk(true);
    setTimeout(() => setGeneralGuardadoOk(false), 3000);
  }

  function descartarGeneral() {
    setGeneral({ ...generalGuardado });
    setLogoPreview(generalGuardado.logo);
    setGeneralCambios(false);
    setGeneralGuardadoOk(false);
  }

  // --- Handlers notificaciones ---
  function toggleNotif(key) {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
    setNotifsCambios(true);
    setNotifsGuardadoOk(false);
  }

  function guardarNotifs() {
    setNotifsCambios(false);
    setNotifsGuardadoOk(true);
    setTimeout(() => setNotifsGuardadoOk(false), 3000);
  }

  function descartarNotifs() {
    setNotifsCambios(false);
  }

  const inputStyle = {
    width: "100%", padding: "8px 12px", fontSize: 13,
    border: "1px solid var(--color-border)", borderRadius: 8,
    background: "#fff", color: "#333", boxSizing: "border-box",
  };

  const labelStyle = {
    margin: "0 0 6px", fontSize: 11, color: "var(--color-label)",
    fontWeight: 600, letterSpacing: 1, display: "block",
  };

  // Determinar cambios y handlers del tab activo
  const hayCambios = [generalCambios, false, notifsCambios][tabActivo];
  const guardadoOk = [generalGuardadoOk, false, notifsGuardadoOk][tabActivo];
  const onGuardar = [guardarGeneral, null, guardarNotifs][tabActivo];
  const onDescartar = [descartarGeneral, null, descartarNotifs][tabActivo];

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", padding: "0 8px", overflowX: "auto" }}>
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setTabActivo(i)} style={{
            padding: "12px 16px", fontSize: 13, border: "none", background: "none",
            cursor: "pointer", whiteSpace: "nowrap",
            color: tabActivo === i ? "var(--color-primary)" : "#aaa",
            borderBottom: tabActivo === i ? "2px solid var(--color-primary)" : "2px solid transparent",
            fontWeight: tabActivo === i ? "bold" : "normal",
          }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>

        {/* Parámetros generales */}
        {tabActivo === 0 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>NOMBRE DEL SISTEMA</label>
                <input name="nombre" value={general.nombre} onChange={handleGeneralChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>ZONA HORARIA</label>
                <select name="zona" value={general.zona} onChange={handleGeneralChange} style={inputStyle}>
                  {zonasHorarias.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>EMAIL DE CONTACTO</label>
                <input name="email" value={general.email} onChange={handleGeneralChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>IDIOMA</label>
                <select name="idioma" value={general.idioma} onChange={handleGeneralChange} style={inputStyle}>
                  <option>Español (Argentina)</option>
                  <option>Español (México)</option>
                  <option>English</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>LOGO DEL SISTEMA</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 8, overflow: "hidden",
                  border: "1px solid var(--color-border)", background: "#f5f5f5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {logoPreview
                    ? <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    : <span style={{ fontSize: 11, color: "#aaa" }}>logo</span>
                  }
                </div>
                <div>
                  <button
                    onClick={() => fileRef.current.click()}
                    style={{
                      padding: "8px 16px", border: "1px solid var(--color-border)",
                      borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", display: "block",
                    }}
                  >
                    {logoPreview ? "Cambiar imagen" : "Subir imagen"}
                  </button>
                  {logoPreview && (
                    <button
                      onClick={() => { setLogoPreview(null); setGeneral(p => ({ ...p, logo: null })); setGeneralCambios(true); }}
                      style={{ marginTop: 6, padding: "4px 12px", border: "none", background: "none", fontSize: 12, color: "var(--color-danger)", cursor: "pointer" }}
                    >
                      Eliminar imagen
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estados del flujo */}
        {tabActivo === 1 && (
          <div>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#666" }}>
              Estados disponibles en el flujo de resolución de reportes.
            </p>
            {estadosIniciales.map((e, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: i < estadosIniciales.length - 1 ? "1px solid var(--color-border)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: "#333", fontWeight: 600 }}>{e.nombre}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{e.desc}</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: e.bg, color: e.text, fontWeight: 600 }}>{e.tipo}</span>
              </div>
            ))}
          </div>
        )}

        {/* Notificaciones */}
        {tabActivo === 2 && (
          <div>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#666" }}>
              Controlá qué eventos generan notificaciones en el sistema.
            </p>
            {[
              { key: "emailCrear", label: "Email al crear reporte", desc: "Notificar al ciudadano cuando su reporte es registrado" },
              { key: "emailEstado", label: "Email al cambiar estado", desc: "Notificar al ciudadano ante cada cambio de estado" },
              { key: "resumenDiario", label: "Resumen diario al admin", desc: "Enviar resumen de actividad cada día a las 8:00 AM" },
              { key: "alertasUrgentes", label: "Alertas de reportes urgentes", desc: "Notificar si se reciben 10+ reportes en 1 hora" },
              { key: "push", label: "Notificaciones push", desc: "Activar notificaciones push en el panel administrativo" },
            ].map((n, i, arr) => (
              <div key={n.key} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none",
                gap: 16,
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: "#333", fontWeight: 600 }}>{n.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>{n.desc}</p>
                </div>
                <div onClick={() => toggleNotif(n.key)} style={{
                  width: 36, height: 20, borderRadius: 20, cursor: "pointer", flexShrink: 0,
                  background: notifs[n.key] ? "var(--color-primary)" : "#ddd",
                  position: "relative", transition: "background 0.2s",
                }}>
                  <div style={{
                    position: "absolute", top: 3, left: notifs[n.key] ? 19 : 3,
                    width: 14, height: 14, borderRadius: "50%", background: "#fff",
                    transition: "left 0.2s",
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botones — no mostrar en Estados (tab 1) */}
        {tabActivo !== 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
            <div>
              {guardadoOk && (
                <span style={{ fontSize: 13, color: "var(--color-success)", fontWeight: 600 }}>
                  ✓ Cambios guardados correctamente
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onDescartar}
                disabled={!hayCambios}
                style={{
                  padding: "9px 22px", border: "1px solid var(--color-border)",
                  borderRadius: 8, background: "#fff", fontSize: 13,
                  cursor: hayCambios ? "pointer" : "not-allowed", color: hayCambios ? "#555" : "#ccc",
                }}>Descartar</button>
              <button
                onClick={onGuardar}
                disabled={!hayCambios}
                style={{
                  padding: "9px 22px", background: hayCambios ? "var(--color-primary)" : "#ccc",
                  color: "#fff", border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: "bold", cursor: hayCambios ? "pointer" : "not-allowed",
                }}>Guardar cambios</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
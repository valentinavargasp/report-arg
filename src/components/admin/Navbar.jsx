"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, HelpCircle, Menu, User, LogOut, ChevronDown, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import apiClient from "@/services/apiClient";

function FaqItem({ item, last }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div
      onClick={() => setAbierto(prev => !prev)}
      style={{
        padding: "10px 16px", cursor: "pointer",
        borderBottom: last ? "none" : "1px solid var(--color-border)",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#f9f9f9"}
      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#333", fontWeight: 500 }}>{item.pregunta}</p>
        <span style={{ color: "#aaa", fontSize: 16, flexShrink: 0 }}>{abierto ? "−" : "+"}</span>
      </div>
      {abierto && (
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#666", lineHeight: 1.5 }}>{item.resp}</p>
      )}
    </div>
  );
}

export default function Navbar({ section = "Dashboard", onMenuClick }) {
  const router = useRouter();
  const { data: session } = useSession();

  // Notificaciones
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef(null);
  const noLeidas = notifs.filter(n => !n.leida).length;

  // Ayuda
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef(null);

  // Perfil usuario
  const [profileOpen, setProfileOpen] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const profileRef = useRef(null);

  // Cargar notificaciones al abrir panel
  useEffect(() => {
    if (notifOpen) fetchNotifs();
  }, [notifOpen]);

  // Cargar perfil cuando hay sesión
  useEffect(() => {
    if (!session?.user?.id) return;
    apiClient.get(`/admin/usuarios/${session.user.id}`)
      .then(r => { if (r.data?.ok) setPerfil(r.data?.data); })
      .catch(() => { });
  }, [session?.user?.id]);

  // Cerrar paneles al click afuera
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchNotifs() {
    setLoadingNotifs(true);
    try {
      const res = await apiClient.get(`/admin/notificaciones`);
      const data = res.data;
      if (data.ok) setNotifs(data.data);
    } catch (err) {
      console.error('Error notificaciones:', err);
    } finally {
      setLoadingNotifs(false);
    }
  }

  async function marcarLeida(id) {
    try {
      await apiClient.put(`/admin/notificaciones/${id}/leer`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    } catch (err) {
      console.error('Error marcar leída:', err);
    }
  }

  async function marcarTodasLeidas() {
    try {
      await apiClient.put(`/admin/notificaciones/leer-todas`);
      setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
    } catch (err) {
      console.error('Error marcar todas leídas:', err);
    }
  }

  return (
    <header className="navbar">

      {/* Izquierda */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="navbar-hamburger" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
      </div>

      {/* Derecha */}
      <div className="navbar-right">

        {/* Campanita */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <div onClick={() => setNotifOpen(prev => !prev)} style={{ position: "relative", cursor: "pointer" }}>
            <Bell size={18} style={{ color: noLeidas > 0 ? "var(--color-primary)" : "#aaa" }} />
            {noLeidas > 0 && (
              <span style={{
                position: "absolute", top: -5, right: -5,
                background: "var(--color-danger)", color: "#fff",
                fontSize: 9, fontWeight: "bold", borderRadius: "50%",
                width: 14, height: 14, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>{noLeidas}</span>
            )}
          </div>

          {notifOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 12px)", right: 0,
              width: 320, background: "#fff",
              border: "1px solid var(--color-border)", borderRadius: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)", zIndex: 999,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", borderBottom: "1px solid var(--color-border)",
              }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: "bold", color: "#333" }}>
                  Notificaciones {noLeidas > 0 && <span style={{ color: "var(--color-danger)" }}>({noLeidas})</span>}
                </p>
                {noLeidas > 0 && (
                  <button
                    onClick={marcarTodasLeidas}
                    style={{ fontSize: 11, color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {loadingNotifs ? (
                  <p style={{ padding: "20px 16px", fontSize: 13, color: "#aaa", margin: 0, textAlign: "center" }}>
                    Cargando...
                  </p>
                ) : notifs.length === 0 ? (
                  <p style={{ padding: "20px 16px", fontSize: 13, color: "#aaa", margin: 0, textAlign: "center" }}>
                    Sin notificaciones
                  </p>
                ) : (
                  notifs.map((n, i) => (
                    <div
                      key={n.id}
                      onClick={() => marcarLeida(n.id)}
                      style={{
                        display: "flex", gap: 10, padding: "12px 16px", cursor: "pointer",
                        background: n.leida ? "#fff" : "#f0f4ff",
                        borderBottom: i < notifs.length - 1 ? "1px solid var(--color-border)" : "none",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f9f9f9"}
                      onMouseLeave={e => e.currentTarget.style.background = n.leida ? "#fff" : "#f0f4ff"}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                        background: n.leida ? "transparent" : "var(--color-primary)",
                      }} />
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: 13, color: "#333", fontWeight: n.leida ? 400 : 600 }}>{n.titulo}</p>
                        <p style={{ margin: "0 0 2px", fontSize: 12, color: "#666" }}>{n.sub}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{n.tiempo}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ayuda */}
        <div ref={helpRef} style={{ position: "relative" }} className="hide-mobile">
          <HelpCircle
            size={18}
            style={{ cursor: "pointer", color: helpOpen ? "var(--color-primary)" : "#aaa" }}
            onClick={() => setHelpOpen(prev => !prev)}
          />
          {helpOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 12px)", right: 0,
              width: 340, background: "#fff",
              border: "1px solid var(--color-border)", borderRadius: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)", zIndex: 999,
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: "bold", color: "#333" }}>Centro de Ayuda</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#aaa" }}>Preguntas frecuentes y soporte</p>
              </div>
              <div style={{ padding: "8px 0" }}>
                {[
                  { pregunta: "¿Cómo creo un nuevo usuario?", resp: "Ir a Usuarios › + Crear Usuario y completar el formulario." },
                  { pregunta: "¿Cómo cambio los permisos de un rol?", resp: "Ir a Roles y Permisos, seleccionar el rol y modificar la matriz de permisos." },
                  { pregunta: "¿Cómo resuelvo un reporte?", resp: "Desde el Dashboard, hacer click en el reporte y cambiar su estado a Resuelto." },
                  { pregunta: "¿Cómo configuro notificaciones?", resp: "Ir a Configuración › Notificaciones y activar las que necesitás." },
                  { pregunta: "¿Cómo cambio el logo del sistema?", resp: "Ir a Configuración › Parámetros generales y subir una nueva imagen." },
                ].map((item, i, arr) => (
                  <FaqItem key={i} item={item} last={i === arr.length - 1} />
                ))}
              </div>
              <div style={{
                padding: "12px 16px", borderTop: "1px solid var(--color-border)",
                display: "flex", justifyContent: "center",
              }}>
                <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>
                  ¿Necesitás más ayuda? Escribinos a{" "}
                  <span
                    style={{ color: "var(--color-primary)", cursor: "pointer" }}
                    onClick={() => window.open("https://mail.google.com/mail/?view=cm&to=soporte@reportarg.gob.ar", "_blank")}
                  >
                    soporte@reportarg.gob.ar
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Usuario */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <div
            className="navbar-user"
            onClick={() => setProfileOpen(prev => !prev)}
            style={{ cursor: "pointer" }}
          >
            <div className="navbar-user-info hide-mobile">
              <p className="navbar-user-name">
                {perfil?.nombre || session?.user?.name || "Usuario"}
              </p>
              <p className="navbar-user-role">
                {(() => {
                  const rol = perfil?.rol || session?.user?.role;
                  if (rol === "admin") return "Administrador";
                  if (rol === "institucion") return "Institución";
                  if (rol === "ciudadano") return "Ciudadano";
                  return rol ?? "—";
                })()}
              </p>
            </div>
            {(perfil?.foto || session?.user?.foto) ? (
              <img
                src={perfil?.foto || session?.user?.foto}
                alt="avatar"
                className="navbar-avatar"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="navbar-avatar">
                {(perfil?.nombre || session?.user?.name || "?")
                  .split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
            )}
            <ChevronDown
              size={14}
              style={{
                color: "#aaa",
                transition: "transform 0.2s",
                transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>

          {profileOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: 220, background: "#fff",
              border: "1px solid var(--color-border)", borderRadius: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)", zIndex: 999,
              overflow: "hidden",
            }}>
              {/* Header del dropdown */}
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)", background: "#fafbff" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#333" }}>
                  {perfil?.nombre || session?.user?.name || "Usuario"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#aaa" }}>
                  {session?.user?.email}
                </p>
              </div>

              {/* Opciones */}
              <div style={{ padding: "6px 0" }}>
                <button
                  onClick={() => { setProfileOpen(false); router.push("/profile"); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "10px 16px",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: "#333", textAlign: "left",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f5f7ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <User size={15} style={{ color: "var(--color-primary)" }} />
                  Mi Perfil
                </button>

                <button
                  onClick={() => { setProfileOpen(false); router.push("/home"); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "10px 16px",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: "#333", textAlign: "left",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f5f7ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <Home size={15} style={{ color: "var(--color-primary)" }} />
                  Ir al Home
                </button>

                <div style={{ height: 1, background: "var(--color-border)", margin: "4px 0" }} />

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "10px 16px",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: "var(--color-danger)", textAlign: "left",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <LogOut size={15} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
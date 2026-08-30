"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, MapPin, ChevronDown, User, LogOut, Menu, Shield } from "lucide-react";
import apiClient from "@/services/apiClient";
import Image from "next/image";

const ROL_LABEL = {
  admin:      "Administrador",
  ciudadano:  "Ciudadano",
  institucion: "Institución",
};

export default function HomeNavbar({ onMenuClick = () => {} }) {
  const router = useRouter();
  const { data: session } = useSession();
  const profileRef = useRef(null);

  const [busqueda,     setBusqueda]     = useState("");
  const [perfil,       setPerfil]       = useState(null);
  const [profileOpen,  setProfileOpen]  = useState(false);

  // Cargar datos del perfil cuando hay sesión
  useEffect(() => {
    if (!session?.user?.id) return;
    apiClient.get(`/admin/usuarios/${session.user.id}`)
      .then(r => r.data)
      .then(d => { if (d.ok) setPerfil(d.data); })
      .catch(() => {});
  }, [session?.user?.id]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const nombreMostrado = perfil?.nombre || session?.user?.name || "Usuario";
  const rolMostrado    = ROL_LABEL[perfil?.rol ?? session?.user?.role] ?? "—";
  const fotoUrl        = perfil?.foto || session?.user?.foto || null;
  const iniciales      = nombreMostrado
    .split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const esAdmin = (perfil?.rol ?? session?.user?.role) === "admin";

  return (
    <header className="home-navbar">
      {/* Hamburger — solo mobile */}
      <button className="home-hamburger" onClick={onMenuClick}>
        <Menu size={22} />
      </button>

      <div className="home-navbar-search">
        <Search size={14} className="home-navbar-search-icon" />
        <input
          type="text"
          placeholder="Buscar reclamos, comunicados, zonas..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      <div className="home-navbar-right">
        <div className="home-location-badge">
          <MapPin size={12} />
          {perfil?.ciudad && perfil?.provincia
            ? `${perfil.ciudad}, ${perfil.provincia}`
            : "Argentina"}
        </div>

        <button className="home-icon-btn" title="Notificaciones">
          <Bell size={18} />
        </button>

        {/* Dropdown de perfil */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            onClick={() => setProfileOpen(prev => !prev)}
          >
            <div className="home-profile-text" style={{ textAlign: "right", lineHeight: 1.3 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--home-text)" }}>
                {nombreMostrado}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--home-muted)" }}>
                {rolMostrado}
              </p>
            </div>

            <div className="home-avatar" style={{ position: "relative" }}>
              {fotoUrl
                ? <Image src={fotoUrl} alt="avatar" fill unoptimized style={{ objectFit: "cover" }} />
                : iniciales}
            </div>

            <ChevronDown
              size={14}
              style={{
                color: "var(--home-muted)",
                transition: "transform 0.2s",
                transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>

          {profileOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: 220, background: "#fff",
              border: "1px solid var(--home-border)", borderRadius: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)", zIndex: 999,
              overflow: "hidden",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--home-border)", background: "#fafbff" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#333" }}>
                  {nombreMostrado}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--home-muted)" }}>
                  {session?.user?.email}
                </p>
              </div>

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
                  <User size={15} style={{ color: "var(--home-primary)" }} />
                  Mi Perfil
                </button>

                {esAdmin && (
                  <button
                    onClick={() => { setProfileOpen(false); router.push("/admin"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "10px 16px",
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 13, color: "#333", textAlign: "left",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f7ff"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <Shield size={15} style={{ color: "var(--home-primary)" }} />
                    Panel Admin
                  </button>
                )}

                <div style={{ height: 1, background: "var(--home-border)", margin: "4px 0" }} />

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "10px 16px",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: "#ef4444", textAlign: "left",
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

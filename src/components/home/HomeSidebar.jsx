"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home, Search, FileText, BarChart2, Map,
  Settings, HelpCircle, LogOut, X, Megaphone,
  Shield, PlusSquare,
} from "lucide-react";

const BASE_LINKS = [
  { href: "/home",          label: "Inicio",          icon: Home      },
  { href: "/home/explorar", label: "Explorar",         icon: Search    },
  { href: "/home/reclamos", label: "Mis Reclamos",     icon: FileText  },
  { href: "/home/mapa",     label: "Mapa",             icon: Map       },
  { href: "/home/estadisticas", label: "Estadísticas", icon: BarChart2 },
];

const INST_EXTRA = [
  { href: "/home/institucion/comunicados",       label: "Mis Comunicados", icon: Megaphone  },
  { href: "/home/institucion/comunicados/nuevo", label: "Nuevo Comunicado",icon: PlusSquare },
];

const ADMIN_EXTRA = [
  { href: "/admin", label: "Panel Admin", icon: Shield },
];

export default function HomeSidebar({ open = false, onClose = () => {}, role = "ciudadano" }) {
  const pathname = usePathname();
  const router   = useRouter();

  const extraLinks =
    role === "admin"      ? ADMIN_EXTRA :
    role === "institucion"? INST_EXTRA  : [];

  const allLinks = [...BASE_LINKS, ...extraLinks];

  const subtitleMap = {
    admin:       "ADMINISTRADOR",
    institucion: "GESTIÓN INSTITUCIONAL",
    ciudadano:   "GESTIÓN CIUDADANA",
  };
  const subtitle = subtitleMap[role] ?? "GESTIÓN CIUDADANA";

  return (
    <>
      <div
        className={`home-sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`home-sidebar ${open ? "open" : ""}`}>
        <div className="home-sidebar-logo">
          <Link href="/home" onClick={onClose} style={{ textDecoration: "none" }}>
            <Image src="/logo.png" alt="ReportARG" width={110} height={38} style={{ objectFit: "contain" }} />
            <p className="home-sidebar-logo-sub">{subtitle}</p>
          </Link>
          <button className="home-sidebar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* CTA contextual */}
        {role === "institucion" && (
          <div style={{ padding: "10px 16px 4px" }}>
            <button
              className="hs-cta-btn"
              onClick={() => { router.push("/home/institucion/comunicados/nuevo"); onClose(); }}
            >
              <Megaphone size={16} />
              Nuevo Comunicado
            </button>
          </div>
        )}

        <nav className="home-sidebar-nav">
          {allLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`home-nav-item ${pathname === href ? "active" : ""}`}
              onClick={onClose}
            >
              <Icon size={18} className="home-nav-icon" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="home-sidebar-footer">
          <Link href="/home/perfil" className="home-nav-item" onClick={onClose}>
            <Settings size={18} className="home-nav-icon" />
            Configuración
          </Link>
          <Link href="/home/ayuda" className="home-nav-item" onClick={onClose}>
            <HelpCircle size={18} className="home-nav-icon" />
            Ayuda
          </Link>
          <button
            className="home-nav-item"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={18} className="home-nav-icon" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}

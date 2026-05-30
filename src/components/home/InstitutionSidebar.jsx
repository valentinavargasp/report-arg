"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home, Megaphone, FileText, BarChart2, Map,
  Settings, HelpCircle, LogOut, X, PlusCircle,
} from "lucide-react";

const navLinks = [
  { href: "/home/institucion",              label: "Inicio",        icon: Home      },
  { href: "/home/institucion/comunicados",  label: "Comunicados",   icon: Megaphone },
  { href: "/home/institucion/reclamos",     label: "Reclamos",      icon: FileText  },
  { href: "/home/institucion/estadisticas", label: "Estadísticas",  icon: BarChart2 },
  { href: "/home/institucion/mapa",         label: "Mapa",          icon: Map       },
];

export default function InstitutionSidebar({ open = false, onClose = () => {} }) {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <>
      <div
        className={`home-sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`home-sidebar ${open ? "open" : ""}`}>
        <div className="home-sidebar-logo">
          <Link href="/home/institucion" onClick={onClose} style={{ textDecoration: "none" }}>
            <Image src="/logo.png" alt="ReportARG" width={110} height={38} style={{ objectFit: "contain" }} />
            <p className="home-sidebar-logo-sub">GESTIÓN INSTITUCIONAL</p>
          </Link>
          <button className="home-sidebar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="inst-sidebar-new-btn-wrap">
          <button
            className="inst-sidebar-new-btn"
            onClick={() => { router.push("/home/institucion/comunicados/nuevo"); onClose(); }}
          >
            <PlusCircle size={18} />
            Nuevo Comunicado
          </button>
        </div>

        <nav className="home-sidebar-nav">
          {navLinks.map(({ href, label, icon: Icon }) => (
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
          <Link href="/home/configuracion" className="home-nav-item" onClick={onClose}>
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

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, FilePlus2, Bell, Megaphone, Shield } from "lucide-react";

export default function BottomNav({ role = "ciudadano" }) {
  const pathname = usePathname();
  const router   = useRouter();

  // Botón central diferente por rol
  const ctaHref =
    role === "admin"       ? "/admin"                                :
    role === "institucion" ? "/home/institucion/comunicados/nuevo"   :
                             "/home/reclamos/nuevo";
  const CtaIcon =
    role === "admin"       ? Shield    :
    role === "institucion" ? Megaphone :
                             FilePlus2;
  const ctaLabel =
    role === "admin"       ? "Admin"       :
    role === "institucion" ? "Comunicado"  :
                             "Reclamo";

  const tabs = [
    { href: "/home",          label: "Inicio",   icon: Home   },
    { href: "/home/explorar", label: "Explorar", icon: Search },
    null, // hueco para el CTA central
    { href: "/home/reclamos", label: "Reclamos", icon: Bell   },
    { href: "/home/mapa",     label: "Mapa",     icon: Search },
  ];

  return (
    <nav className="home-bottom-nav">
      <div className="home-bottom-nav-items">
        {tabs.map((tab, i) =>
          tab === null ? (
            <button
              key="cta"
              className="home-bottom-cta"
              onClick={() => router.push(ctaHref)}
            >
              <CtaIcon size={22} />
              <span>{ctaLabel}</span>
            </button>
          ) : (
            <Link
              key={tab.href}
              href={tab.href}
              className={`home-bottom-nav-item ${pathname === tab.href ? "active" : ""}`}
            >
              <tab.icon size={20} />
              {tab.label}
            </Link>
          )
        )}
      </div>
    </nav>
  );
}

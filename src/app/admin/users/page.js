"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import UserTable from "@/components/admin/UserTable";
import Breadcrumb from "@/components/admin/Breadcrumb";
import { useRouter } from "next/navigation";
import apiClient from "@/services/apiClient";

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0, admins: 0 });
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/admin/usuarios/stats');
        const data = response.data;
        if (data?.ok && data?.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("No se pudieron cargar las estadísticas de usuarios", error);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    { label: "TOTAL USUARIOS", value: stats.total, sub: "——", subColor: "var(--color-success)" },
    { label: "ACTIVOS", value: stats.activos, sub: "——", subColor: "var(--color-primary)" },
    { label: "INACTIVOS", value: stats.inactivos, sub: "——", subColor: "var(--color-danger)" },
    { label: "ADMINISTRADORES", value: stats.admins, sub: "——", subColor: "var(--color-warning)" },
  ];

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Usuarios" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">

          {/* Encabezado */}
          <div className="page-header users-page-header">
            <div>
              <Breadcrumb items={[{ label: "ADMIN PANEL", href: "/admin" }, { label: "USUARIOS" }]} />
              <h1 className="users-title">
                Gestión de Usuarios
              </h1>
              <p className="users-description">
                Administrá las credenciales de acceso, roles y estados de los ciudadanos y personal administrativo del sistema ReportARG.
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/users/new")}
              className="users-create-btn"
            >
              + Crear Usuario
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {statsCards.map((stat) => (
              <div key={stat.label} className="users-stat-card">
                <p className="users-stat-label">{stat.label}</p>
                <p className="users-stat-value">{Number(stat.value || 0).toLocaleString("es-AR")}</p>
                <p className="users-stat-sub" style={{ color: stat.subColor }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <UserTable />

        </main>
      </div>
    </div>
  );
}
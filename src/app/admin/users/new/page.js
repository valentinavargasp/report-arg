"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import UserForm from "@/components/admin/UserForm";
import Breadcrumb from "@/components/admin/Breadcrumb";
import apiClient from "@/services/apiClient";

export default function NewUserPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0, admins: 0 });

  useEffect(() => {
    apiClient.get(`/admin/usuarios/stats`)
      .then(r => r.data)
      .then(data => { if (data.ok) setStats(data.data); })
      .catch(console.error);
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <Navbar section="Usuarios" onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-main">
          <div className="users-page-header users-page-header-single">
            <Breadcrumb items={[{ label: "ADMIN PANEL", href: "/admin" }, { label: "USUARIOS", href: "/admin/users" }, { label: "NUEVO" }]} />
            <h1 className="users-title">
              Crear Usuario
            </h1>
            <p className="users-description users-description-wide">
              Completá los datos para registrar un nuevo usuario en el sistema.
            </p>
          </div>
          <UserForm />
        </main>
      </div>
    </div>
  );
}
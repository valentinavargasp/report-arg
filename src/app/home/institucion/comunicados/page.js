"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PlusCircle, CheckCircle, Clock, Eye, EyeOff } from "lucide-react";
import apiClient from "@/services/apiClient";

const ESTADO_CONFIG = {
  // 'recibido' = comunicado publicado
  recibido: { label: "Publicado", cls: "inst-com-badge-publicado", icon: Eye },
  en_proceso: { label: "Publicado", cls: "inst-com-badge-publicado", icon: Eye },
  resuelto: { label: "Publicado", cls: "inst-com-badge-publicado", icon: Eye },
  // 'rechazado' = borrador (mapeado desde el frontend)
  rechazado: { label: "Borrador", cls: "inst-com-badge-borrador", icon: EyeOff },
};

function tiempoRelativo(fechaStr) {
  const diff = Date.now() - new Date(fechaStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs < 24) return `Hace ${hs}h`;
  const dias = Math.floor(hs / 24);
  return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
}

export default function ComunicadosInstitucionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [comunicados, setComunicados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTab, setFiltroTab] = useState("todos");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) return;

    Promise.all([
      apiClient.get(`/comunicados/mis-comunicados?usuario=${session.user.id}`)
        .then(r => r.data),
      apiClient.get(`/comunicados/categorias`)
        .then(r => r.data),
    ]).then(([comData, catData]) => {
      if (comData.ok) setComunicados(comData.data);
      if (catData.ok) setCategorias(catData.data);
    }).catch(() => { })
      .finally(() => setLoading(false));
  }, [session?.user?.id, status]);

  const tabs = [
    { id: "todos", label: "Todos" },
    ...categorias.map(c => ({ id: String(c.id), label: c.nombre })),
  ];

  const filtrados = filtroTab === "todos"
    ? comunicados
    : comunicados.filter(c => String(c.categoriaId) === filtroTab);

  return (
    <div className="inst-comunicados-page">
      <div className="inst-page-header">
        <div>
          <h1 className="inst-page-title">Comunicados</h1>
          <p className="inst-page-sub">Información oficial de la institución</p>
        </div>
        <button
          className="inst-btn-primary"
          onClick={() => router.push("/home/institucion/comunicados/nuevo")}
        >
          <PlusCircle size={18} />
          Nuevo Comunicado
        </button>
      </div>

      {/* Tabs de categoría */}
      <div className="inst-tabs-row">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`inst-tab ${filtroTab === tab.id ? "active" : ""}`}
            onClick={() => setFiltroTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="inst-loading">Cargando comunicados...</div>
      ) : filtrados.length === 0 ? (
        <div className="inst-empty">
          <p>No hay comunicados{filtroTab !== "todos" ? " en esta categoría" : ""}.</p>
          <button
            className="inst-btn-primary"
            onClick={() => router.push("/home/institucion/comunicados/nuevo")}
          >
            Crear primer comunicado
          </button>
        </div>
      ) : (
        <div className="inst-comunicados-list">
          {filtrados.map(com => {
            const estadoConf = ESTADO_CONFIG[com.estado] ?? ESTADO_CONFIG.publicado;
            const Icon = estadoConf.icon;
            return (
              <article key={com.id} className="inst-com-card">
                <div className="inst-com-card-top">
                  <span className={`inst-com-badge ${estadoConf.cls}`}>
                    <Icon size={12} /> {estadoConf.label}
                  </span>
                  {com.categoriaNombre && (
                    <span className="inst-com-categoria">{com.categoriaNombre}</span>
                  )}
                </div>
                <h3 className="inst-com-title">{com.titulo}</h3>
                {com.descripcion && (
                  <p className="inst-com-desc">{com.descripcion}</p>
                )}
                <div className="inst-com-footer">
                  <Clock size={12} />
                  <span>{tiempoRelativo(com.fecha_creacion)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FilePlus2, Megaphone, LayoutGrid, Map, Shield,
  ChevronLeft, ChevronRight, SlidersHorizontal, X,
} from "lucide-react";
import FeedCard from "@/components/home/FeedCard";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";

// acciones por rol: 
function QuickActions({ role, router }) {
  const isInst = role === "institucion";
  const isAdmin = role === "admin";

  return (
    <div className="hf-quick-actions">
      <button className="hf-qa-btn primary" onClick={() => router.push("/home/reclamos/nuevo")}>
        <FilePlus2 size={20} />
        <span>Crear Reclamo</span>
      </button>

      {(isInst || isAdmin) && (
        <button
          className="hf-qa-btn inst"
          onClick={() => router.push("/home/institucion/comunicados/nuevo")}
        >
          <Megaphone size={20} />
          <span>Nuevo Comunicado</span>
        </button>
      )}

      <button className="hf-qa-btn secondary" onClick={() => router.push("/home/explorar")}>
        <LayoutGrid size={20} />
        <span>Explorar</span>
      </button>

      <button className="hf-qa-btn secondary" onClick={() => router.push("/home/mapa")}>
        <Map size={20} />
        <span>Mapa</span>
      </button>

      {isAdmin && (
        <button className="hf-qa-btn admin" onClick={() => router.push("/admin")}>
          <Shield size={20} />
          <span>Panel Admin</span>
        </button>
      )}
    </div>
  );
}

// pag principal: 
export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "ciudadano";

  const [categorias, setCategorias] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);

  // filtros
  const [tipo, setTipo] = useState("todos");   // todos | comunicado | reclamo
  const [categoriaId, setCategoriaId] = useState(null);
  const [mostrarFil, setMostrarFil] = useState(false);

  useEffect(() => {
    apiClient.get(`/feed/categorias`)
      .then(r => r.data)
      .then(d => { if (d.ok) setCategorias(d.data); })
      .catch(() => { toast.error("No se pudieron cargar las categorías"); });
  }, []);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pagina, limite: 10 });
      if (tipo !== "todos") params.set("tipo", tipo);
      if (categoriaId) params.set("categoria", categoriaId);

      const res = await apiClient.get(`/feed?${params}`);
      const data = res.data;
      if (data.ok) {
        setFeed(data.data);
        setTotal(data.total ?? 0);
        setTotalPaginas(data.totalPaginas ?? 1);
      } else {
        toast.error(data.error || "Ocurrió un error al cargar las publicaciones");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al cargar el feed");
    }
    finally { setLoading(false); }
  }, [tipo, categoriaId, pagina]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  function cambiarTipo(t) { setTipo(t); setPagina(1); }
  function cambiarCat(id) { setCategoriaId(id); setPagina(1); }
  function limpiar() { setTipo("todos"); setCategoriaId(null); setPagina(1); }

  const hayFiltros = tipo !== "todos" || categoriaId !== null;
  const catActiva = categorias.find(c => c.id === categoriaId);

  return (
    <div className="hf-wrapper">

      {/* acciones rápidas */}
      <QuickActions role={role} router={router} />

      {/* barra de filtros */}
      <div className="hf-filter-bar">
        {/* tabs tipo */}
        <div className="hf-tipo-tabs">
          {["todos", "comunicado", "reclamo"].map(t => (
            <button
              key={t}
              className={`hf-tipo-tab ${tipo === t ? "active" : ""}`}
              onClick={() => cambiarTipo(t)}
            >
              {t === "todos" ? "Todo" : t === "comunicado" ? "Comunicados" : "Reclamos"}
            </button>
          ))}
        </div>

        {/* botón filtrar por categoría */}
        <button
          className={`hf-filter-toggle ${mostrarFil ? "active" : ""}`}
          onClick={() => setMostrarFil(v => !v)}
        >
          <SlidersHorizontal size={14} />
          Categoría
          {catActiva && <span className="hf-filter-dot" />}
        </button>

        {/* limpiar */}
        {hayFiltros && (
          <button className="hf-clear-btn" onClick={limpiar}>
            <X size={13} /> Limpiar
          </button>
        )}
      </div>

      {/* chips de categoría (desplegable) */}
      {mostrarFil && (
        <div className="hf-cat-chips">
          <button
            className={`hf-chip ${categoriaId === null ? "active" : ""}`}
            onClick={() => cambiarCat(null)}
          >
            Todas
          </button>
          {categorias.map(c => (
            <button
              key={c.id}
              className={`hf-chip ${categoriaId === c.id ? "active" : ""}`}
              onClick={() => cambiarCat(c.id)}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      )}

      {/* resumen resultados */}
      <div className="hf-results-row">
        <span className="hf-results-text">
          {loading ? "Buscando…" : (
            <>
              <strong>{total}</strong> publicación{total !== 1 ? "es" : ""}
              {catActiva && <> · <em>{catActiva.nombre}</em></>}
            </>
          )}
        </span>
      </div>

      {/* feed */}
      {loading && (
        <div className="hf-skeleton-list">
          {[1, 2, 3].map(i => <div key={i} className="hf-skeleton-card" />)}
        </div>
      )}

      {!loading && feed.length === 0 && (
        <div className="hf-empty">
          <p>No hay publicaciones{catActiva ? ` en "${catActiva.nombre}"` : ""}.</p>
          {hayFiltros && (
            <button className="hf-clear-btn" onClick={limpiar}>Limpiar filtros</button>
          )}
        </div>
      )}

      {!loading && feed.map(item => (
        <FeedCard
          key={item.id}
          item={item}
          onEliminado={(id) => setFeed(prev => prev.filter(x => x.id !== id))}
        />
      ))}

      {/* paginación */}
      {!loading && totalPaginas > 1 && (
        <div className="hf-pagination">
          <button
            className="hf-page-btn"
            onClick={() => setPagina(p => Math.max(p - 1, 1))}
            disabled={pagina === 1}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="hf-page-info">{pagina} / {totalPaginas}</span>
          <button
            className="hf-page-btn"
            onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))}
            disabled={pagina === totalPaginas}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

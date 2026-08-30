"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle, MapPin, MessageCircle, Share2, Send, Trash2,
  ChevronDown, ChevronUp,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import Image from "next/image";

const ESTADO_LABELS = {
  recibido:   { label: "Recibido",   cls: "pendiente"  },
  en_proceso: { label: "En proceso", cls: "en_proceso" },
  resuelto:   { label: "Resuelto",   cls: "resuelto"   },
};

function tiempoRelativo(fechaStr) {
  const diff = Date.now() - new Date(fechaStr).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs < 24)  return `Hace ${hs} h`;
  const dias = Math.floor(hs / 24);
  if (dias < 7) return `Hace ${dias} d`;
  return new Date(fechaStr).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function fechaExacta(fechaStr) {
  return new Date(fechaStr).toLocaleString("es-AR", {
    day:    "numeric",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

async function compartir({ titulo, descripcion, id }) {
  const url  = `${window.location.origin}/home?post=${id}`;
  const text = descripcion ? descripcion.slice(0, 100) : titulo;

  if (navigator.share) {
    try { await navigator.share({ title: titulo, text, url }); } catch { /* cancelado */ }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    alert("¡Enlace copiado al portapapeles!");
  } catch {
    prompt("Copiá el enlace:", url);
  }
}

function ConfirmModal({ mensaje, onConfirmar, onCancelar, cargando }) {
  return (
    <div className="fc-modal-overlay" onClick={onCancelar}>
      <div className="fc-modal" onClick={e => e.stopPropagation()}>
        <p className="fc-modal-mensaje">{mensaje}</p>
        <div className="fc-modal-acciones">
          <button className="fc-modal-btn cancel" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </button>
          <button className="fc-modal-btn confirm" onClick={onConfirmar} disabled={cargando}>
            {cargando ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ComentariosSection({ idReclamo, onNuevoComentario }) {
  const { data: session } = useSession();

  const [comentarios,       setComentarios]       = useState([]);
  const [cargados,          setCargados]          = useState(false);
  const [cargando,          setCargando]          = useState(false);
  const [texto,             setTexto]             = useState("");
  const [enviando,          setEnviando]          = useState(false);
  const [error,             setError]             = useState("");
  const [confirmComentario, setConfirmComentario] = useState(null);
  const [eliminandoCom,     setEliminandoCom]     = useState(false);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      try {
        const res  = await apiClient.get(`/comentarios/${idReclamo}`);
        const data = res.data;
        if (data.ok) setComentarios(data.data);
      } catch {
        // sin conexión: no mostramos error, la lista queda vacía
      } finally {
        setCargando(false);
        setCargados(true);
      }
    }
    cargar();
  }, [idReclamo]);

  async function enviarComentario(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    if (!session?.user?.id) {
      setError("Debés iniciar sesión para comentar.");
      return;
    }

    setError("");
    setEnviando(true);
    try {
      const res  = await apiClient.post(`/comentarios`, {
          id_reclamo: idReclamo,
          id_usuario: session.user.id,
          texto:      texto.trim(),
      });
      const data = res.data;
      if (data.ok) {
        setComentarios(prev => [
          ...prev,
          {
            id:             data.id,
            texto:          texto.trim(),
            fecha_creacion: new Date().toISOString(),
            autorNombre:    session.user.name || session.user.email,
            autorFoto:      session.user.foto || null,
          },
        ]);
        onNuevoComentario?.();
        setTexto("");
      } else {
        setError(data.mensaje || "No se pudo enviar el comentario.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setEnviando(false);
    }
  }

  async function eliminarComentario() {
    setEliminandoCom(true);
    try {
      const res  = await apiClient.delete(`/comentarios/${confirmComentario.id}`, {
        data: { id_usuario: session.user.id }
      });
      const data = res.data;
      if (data.ok) setComentarios(prev => prev.filter(x => x.id !== confirmComentario.id));
    } finally {
      setEliminandoCom(false);
      setConfirmComentario(null);
    }
  }

  return (
    <div className="fc-comments">
      {cargando && <p className="fc-comments-loading">Cargando comentarios…</p>}

      {!cargando && cargados && comentarios.length === 0 && (
        <p className="fc-comments-empty">Sé el primero en comentar.</p>
      )}

      <ul className="fc-comments-list">
        {comentarios.map(c => (
          <li key={c.id} className="fc-comment-item">
            <div className="fc-comment-avatar" style={{ position: "relative" }}>
              {c.autorFoto
                ? <Image src={c.autorFoto} alt={c.autorNombre} fill unoptimized style={{ objectFit: "cover" }} />
                : iniciales(c.autorNombre)}
            </div>
            <div className="fc-comment-body">
              <span className="fc-comment-author">{c.autorNombre || "Usuario"}</span>
              <span className="fc-comment-time">{tiempoRelativo(c.fecha_creacion)}</span>
              <p className="fc-comment-text">{c.texto}</p>
            </div>
            {session?.user?.id && Number(session.user.id) === Number(c.id_usuario) && (
              <button
                className="fc-comment-delete"
                title="Eliminar comentario"
                onClick={() => setConfirmComentario({ id: c.id })}
              >
                <Trash2 size={13} />
              </button>
            )}
          </li>
        ))}
      </ul>

      {session?.user ? (
        <form className="fc-comment-form" onSubmit={enviarComentario}>
          <div className="fc-comment-avatar small" style={{ position: "relative" }}>
            {session.user.foto
              ? <Image src={session.user.foto} alt="" fill unoptimized style={{ objectFit: "cover" }} />
              : iniciales(session.user.name || session.user.email)}
          </div>
          <input
            className="fc-comment-input"
            type="text"
            placeholder="Escribí un comentario…"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            maxLength={500}
            disabled={enviando}
          />
          <button
            className="fc-comment-send"
            type="submit"
            disabled={enviando || !texto.trim()}
            title="Enviar"
          >
            <Send size={15} />
          </button>
        </form>
      ) : (
        <p className="fc-comments-login">Iniciá sesión para comentar.</p>
      )}

      {error && <p className="fc-comments-error">{error}</p>}

      {confirmComentario && (
        <ConfirmModal
          mensaje="¿Deseás eliminar este comentario? Esta acción no se puede deshacer."
          cargando={eliminandoCom}
          onConfirmar={eliminarComentario}
          onCancelar={() => setConfirmComentario(null)}
        />
      )}
    </div>
  );
}

function ComunicadoCard({ item, onEliminado }) {
  const { data: session } = useSession();
  const [expandido,           setExpandido]           = useState(false);
  const [comentariosAbiertos, setComentariosAbiertos] = useState(false);
  const [totalComentarios,    setTotalComentarios]    = useState(Number(item.cantidadComentarios) || 0);
  const [eliminando,          setEliminando]          = useState(false);
  const [modalAbierto,        setModalAbierto]        = useState(false);

  const esPropietario = session?.user?.id && Number(session.user.id) === Number(item.id_usuario);
  const fechaCompleta = fechaExacta(item.fecha_creacion);

  async function eliminarComunicado() {
    setEliminando(true);
    try {
      const res  = await apiClient.delete(`/reclamos/comunicado/${item.id}`, {
        data: { id_usuario: session.user.id }
      });
      const data = res.data;
      if (data.ok) onEliminado?.(item.id);
    } finally {
      setEliminando(false);
      setModalAbierto(false);
    }
  }

  return (
    <article className="feed-card feed-card--inst">
      <div className="feed-card-header">
        <div className="feed-card-author">
          <div className="feed-card-avatar" style={{ background: "#1e40af" }}>
            {iniciales(item.autorNombre)}
          </div>
          <div>
            <div className="feed-card-author-name">
              {item.autorNombre}
              {item.verificada === 1 && (
                <CheckCircle size={14} color="#2D3A8C" fill="#dbeafe" style={{ marginLeft: 4 }} />
              )}
            </div>
            <div className="feed-card-author-meta" title={fechaCompleta}>{fechaCompleta}</div>
          </div>
        </div>
        <span className="feed-card-badge oficial">Oficial</span>
        {esPropietario && (
          <button
            className="feed-card-action-delete"
            title="Eliminar comunicado"
            disabled={eliminando}
            onClick={() => setModalAbierto(true)}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {modalAbierto && (
        <ConfirmModal
          mensaje="¿Deseás eliminar este comunicado? Esta acción no se puede deshacer."
          onConfirmar={eliminarComunicado}
          onCancelar={() => setModalAbierto(false)}
          cargando={eliminando}
        />
      )}

      <div className="feed-card-body">
        <h3 className="feed-card-title">{item.titulo}</h3>

        {item.categoriaNombre && (
          <span className="feed-card-category">{item.categoriaNombre}</span>
        )}

        {item.descripcion && (
          <>
            <p className={`feed-card-desc${expandido ? " feed-card-desc--full" : ""}`}>
              {item.descripcion}
            </p>
            {item.descripcion.length > 200 && (
              <button
                className="feed-card-leer-mas"
                onClick={() => setExpandido(v => !v)}
              >
                {expandido
                  ? <><ChevronUp size={14} /> Leer menos</>
                  : <><ChevronDown size={14} /> Leer más</>}
              </button>
            )}
          </>
        )}

        {item.imagen && (
          <div className="feed-card-img-wrap" style={{ position: "relative" }}>
            <Image
              className="feed-card-img"
              src={item.imagen}
              alt={item.titulo}
              fill
              unoptimized
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
      </div>

      <div className="feed-card-footer">
        <button
          className="feed-card-action"
          onClick={() => setComentariosAbiertos(v => !v)}
        >
          <MessageCircle size={15} />
          {comentariosAbiertos ? "Ocultar" : `Comentarios (${totalComentarios})`}
        </button>
        <button
          className="feed-card-action"
          onClick={() => compartir({ titulo: item.titulo, descripcion: item.descripcion, id: item.id })}
        >
          <Share2 size={15} /> Compartir
        </button>
      </div>

      {comentariosAbiertos && (
        <ComentariosSection
          idReclamo={item.id}
          onNuevoComentario={() => setTotalComentarios(n => n + 1)}
        />
      )}
    </article>
  );
}

export default function FeedCard({ item, onEliminado }) {
  const estado = ESTADO_LABELS[item.estado] ?? { label: item.estado, cls: "pendiente" };
  const tiempo = tiempoRelativo(item.fecha_creacion);

  const [comentariosAbiertos, setComentariosAbiertos] = useState(false);

  if (item.esInstitucion) {
    return <ComunicadoCard item={item} onEliminado={onEliminado} />;
  }

  return (
    <article className="feed-card">
      <div className="feed-card-header">
        <div className="feed-card-author">
          <div className="feed-card-avatar" style={{ position: "relative" }}>
            {item.autorFoto
              ? <Image src={item.autorFoto} alt={item.autorNombre} fill unoptimized style={{ objectFit: "cover" }} />
              : iniciales(item.autorNombre)}
          </div>
          <div>
            <div className="feed-card-author-name">{item.autorNombre || "Ciudadano"}</div>
            <div className="feed-card-author-meta">
              {item.direccion && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <MapPin size={11} /> {item.direccion} ·{" "}
                </span>
              )}
              {tiempo}
            </div>
          </div>
        </div>
        <span className={`feed-card-badge ${estado.cls}`}>{estado.label}</span>
      </div>

      <div className="feed-card-body">
        <h3 className="feed-card-title">{item.titulo}</h3>
        {item.categoriaNombre && (
          <span className="feed-card-category">{item.categoriaNombre}</span>
        )}
        {item.descripcion && (
          <p className="feed-card-desc">{item.descripcion}</p>
        )}
      </div>

      <div className="feed-card-footer">
        <button
          className="feed-card-action"
          onClick={() => setComentariosAbiertos(v => !v)}
        >
          <MessageCircle size={15} />
          {comentariosAbiertos ? "Ocultar" : "Comentar"}
        </button>
        <button
          className="feed-card-action"
          onClick={() => compartir({ titulo: item.titulo, descripcion: item.descripcion, id: item.id })}
        >
          <Share2 size={15} /> Compartir
        </button>
      </div>

      {comentariosAbiertos && <ComentariosSection idReclamo={item.id} />}
    </article>
  );
}


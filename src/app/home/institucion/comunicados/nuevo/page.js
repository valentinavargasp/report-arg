"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bold, Italic, Underline, Link2,
  ImageIcon, X, CheckCircle,
  Zap, Droplets, ShieldAlert, HeartPulse, HardHat,
  Megaphone, Trash2, AlertTriangle, Bus, Info, Volume2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const CATEGORIA_ICON_MAP = [
  { keys: ["luz", "electric", "corte"],       Icon: Zap          },
  { keys: ["agua", "water", "cañería"],        Icon: Droplets     },
  { keys: ["seguridad", "robo", "crimen"],     Icon: ShieldAlert  },
  { keys: ["salud", "médico", "hospital"],     Icon: HeartPulse   },
  { keys: ["obra", "construcción", "vial"],    Icon: HardHat      },
  { keys: ["residuo", "basura", "limpieza"],   Icon: Trash2       },
  { keys: ["alerta", "peligro", "urgente"],    Icon: AlertTriangle },
  { keys: ["transporte", "colectivo", "bus"],  Icon: Bus          },
  { keys: ["ruido", "sonido"],                 Icon: Volume2      },
  { keys: ["info", "aviso", "general"],        Icon: Info         },
];

function CatIcon({ nombre }) {
  const lower = nombre?.toLowerCase() ?? "";
  const match = CATEGORIA_ICON_MAP.find(({ keys }) => keys.some(k => lower.includes(k)));
  const Icon  = match?.Icon ?? Megaphone;
  return <Icon size={20} />;
}

export default function NuevoComunicadoPage() {
  const { data: session, status } = useSession();
  const router                    = useRouter();

  const [categorias,    setCategorias]    = useState([]);
  const [titulo,        setTitulo]        = useState("");
  const [descripcion,   setDescripcion]   = useState("");
  const [categoriaId,   setCategoriaId]   = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile,    setImagenFile]    = useState(null);
  const [enviando,      setEnviando]      = useState(false);
  const [error,         setError]         = useState("");
  const [exito,         setExito]         = useState(false);
  const [errorCats,     setErrorCats]     = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/comunicados/categorias`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        if (d.ok && d.data.length > 0) {
          setCategorias(d.data);
        } else {
          setErrorCats(true);
        }
      })
      .catch(() => setErrorCats(true));
  }, []);

  if (status === "loading") return null;

  function handleImagen(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagenFile(file);
    setImagenPreview(URL.createObjectURL(file));
  }

  function quitarImagen() {
    setImagenFile(null);
    if (imagenPreview) URL.revokeObjectURL(imagenPreview);
    setImagenPreview(null);
  }

  async function publicar(estadoFinal) {
    setError("");

    if (!titulo.trim()) {
      setError("El título del comunicado es obligatorio.");
      return;
    }
    if (!categoriaId) {
      setError("Debes seleccionar una categoría.");
      return;
    }

    setEnviando(true);
    try {
      // Subir imagen si existe
      let imagenUrl = null;
      if (imagenFile) {
        const fd = new FormData();
        fd.append("foto", imagenFile);
        const upRes  = await fetch(`${API_URL}/api/admin/upload/foto`, { method: "POST", body: fd });
        const upData = await upRes.json();
        if (upData.ok) imagenUrl = upData.url;
      }

      const payload = {
        titulo:       titulo.trim(),
        descripcion:  descripcion.trim() || null,
        id_categoria: categoriaId,
        id_usuario:   session.user.id,
        imagen:       imagenUrl,
        estado:       estadoFinal,
      };

      const res  = await fetch(`${API_URL}/api/comunicados`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.mensaje || "No se pudo guardar el comunicado.");
        return;
      }

      setExito(true);
      setTimeout(() => router.push("/home/institucion/comunicados"), 1500);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (exito) {
    return (
      <div className="inst-nuevo-page">
        <div className="inst-exito-card">
          <CheckCircle size={48} color="#16a34a" />
          <h2>¡Comunicado guardado!</h2>
          <p>Redirigiendo a tus comunicados…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inst-nuevo-page">
      <div className="inst-nuevo-header">
        <button className="inst-back-btn" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="inst-page-title">Nuevo Comunicado</h1>
          <p className="inst-page-sub">Informa a la comunidad de manera oficial y transparente</p>
        </div>
      </div>

      <div className="inst-form-card">
        {/* Título */}
        <div className="inst-form-group">
          <label className="inst-form-label">
            Título del comunicado <span className="inst-required">*</span>
          </label>
          <input
            className="inst-form-input"
            type="text"
            placeholder="Ej. Nuevo plan de asfalto en zona centro…"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            maxLength={200}
          />
          <span className="inst-char-count">{titulo.length}/200</span>
        </div>

        {/* Contenido */}
        <div className="inst-form-group">
          <label className="inst-form-label">
            Contenido <span className="inst-required">*</span>
          </label>
          <div className="inst-editor-toolbar">
            <button type="button" className="inst-toolbar-btn" title="Negrita"><Bold size={14} /></button>
            <button type="button" className="inst-toolbar-btn" title="Cursiva"><Italic size={14} /></button>
            <button type="button" className="inst-toolbar-btn" title="Subrayado"><Underline size={14} /></button>
            <button type="button" className="inst-toolbar-btn" title="Enlace"><Link2 size={14} /></button>
          </div>
          <textarea
            className="inst-form-textarea"
            placeholder="Detalla la información aquí…"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={6}
          />
        </div>

        {/* Categoría */}
        <div className="inst-form-group">
          <label className="inst-form-label">
            Categoría <span className="inst-required">*</span>
          </label>
          {errorCats ? (
            <p className="inst-form-error">No se pudieron cargar las categorías. Verificá la conexión con el servidor.</p>
          ) : categorias.length === 0 ? (
            <p className="inst-form-hint">Cargando categorías…</p>
          ) : (
            <div className="inst-categoria-grid">
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`inst-categoria-card ${categoriaId === cat.id ? "selected" : ""}`}
                  onClick={() => setCategoriaId(cat.id)}
                >
                  <span className="inst-cat-icon"><CatIcon nombre={cat.nombre} /></span>
                  <span className="inst-cat-label">{cat.nombre}</span>
                  {categoriaId === cat.id && (
                    <CheckCircle size={16} className="inst-cat-check" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Imagen (opcional) */}
        <div className="inst-form-group">
          <label className="inst-form-label">
            Imagen o Banner <span className="inst-form-hint-inline">(Opcional)</span>
          </label>
          {imagenPreview ? (
            <div className="inst-img-preview-wrap">
              <img src={imagenPreview} alt="Preview" className="inst-img-preview" />
              <button className="inst-img-remove-btn" onClick={quitarImagen} type="button">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="inst-img-drop-zone">
              <ImageIcon size={32} color="#9ca3af" />
              <p>Haga clic o arrastre un archivo aquí</p>
              <span className="inst-img-hint">JPG, PNG, GIF hasta 5MB</span>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImagen}
              />
            </label>
          )}
        </div>

        {/* Error */}
        {error && <p className="inst-form-error">{error}</p>}

        {/* Acciones */}
        <div className="inst-form-actions">
          <button
            className="inst-btn-secondary"
            type="button"
            disabled={enviando}
            onClick={() => publicar("borrador")}
          >
            Guardar borrador
          </button>
          <button
            className="inst-btn-primary"
            type="button"
            disabled={enviando}
            onClick={() => publicar("publicado")}
          >
            {enviando ? "Publicando…" : "Publicar comunicado"}
          </button>
        </div>
      </div>
    </div>
  );
}

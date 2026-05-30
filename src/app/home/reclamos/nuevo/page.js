"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Camera, X, Check,
  Loader2, Send, Lightbulb, ShieldCheck, Droplets,
  Bus, Trash2, Trees, Building2, Wifi, Wrench,
  Heart, AlertCircle, Sparkles, Waves,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const ICON_RULES = [
  { keys: ["luz", "alumbrado", "iluminac", "luminaria"],     Icon: Lightbulb   },
  { keys: ["seguridad", "prevenci", "delito", "violencia"],  Icon: ShieldCheck },
  { keys: ["agua", "cloaca", "cloacal", "hidráulic", "inundac"], Icon: Droplets },
  { keys: ["transporte", "tránsito", "colectivo", "parada", "vial"], Icon: Bus },
  { keys: ["residuo", "basura", "higiene", "limpieza"],      Icon: Trash2      },
  { keys: ["verde", "espacio", "jardín", "parque", "arbol"], Icon: Trees       },
  { keys: ["infraestructura", "obra", "pavimento", "veredas"], Icon: Building2 },
  { keys: ["conectiv", "wifi", "internet"],                  Icon: Wifi        },
  { keys: ["mantenim", "reparaci"],                          Icon: Wrench      },
  { keys: ["salud", "hospital", "sanitario"],                Icon: Heart       },
  { keys: ["contaminac", "ambiental"],                       Icon: Waves       },
  { keys: ["social", "comunitario", "barrio"],               Icon: Sparkles    },
];

function getIcono(nombre = "", desc = "") {
  const texto = (nombre + " " + desc).toLowerCase();
  for (const { keys, Icon } of ICON_RULES) {
    if (keys.some(k => texto.includes(k))) return Icon;
  }
  return AlertCircle;
}

export default function NuevoReclamoPage() {
  const { data: session, status } = useSession();
  const router      = useRouter();
  const inputRef    = useRef(null);
  const dropRef     = useRef(null);

  const [categorias,  setCategorias]  = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [form, setForm] = useState({ titulo: "", descripcion: "", id_categoria: null, direccion: "" });
  const [coords,      setCoords]      = useState({ latitud: null, longitud: null });
  const [fotos,       setFotos]       = useState([]);
  const [geoLoading,  setGeoLoading]  = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/api/reclamos/categorias`)
      .then(r => r.json())
      .then(d => { if (d.ok) setCategorias(d.data); })
      .catch(() => {})
      .finally(() => setLoadingCats(false));
  }, []);

  async function subirFotos(files) {
    const disponibles = 5 - fotos.length;
    if (disponibles <= 0) return;
    const lista = Array.from(files).slice(0, disponibles);

    const entradas = lista.map(f => ({
      preview: URL.createObjectURL(f),
      url: null,
      uploading: true,
      file: f,
    }));
    setFotos(prev => [...prev, ...entradas]);

    for (const entrada of entradas) {
      try {
        const fd = new FormData();
        fd.append("foto", entrada.file);
        const res  = await fetch(`${API_URL}/api/admin/upload/foto`, { method: "POST", body: fd });
        const data = await res.json();
        setFotos(prev => prev.map(f =>
          f.preview === entrada.preview
            ? { ...f, url: data.ok ? data.url : null, uploading: false }
            : f
        ));
      } catch {
        setFotos(prev => prev.map(f =>
          f.preview === entrada.preview ? { ...f, uploading: false } : f
        ));
      }
    }
  }

  function eliminarFoto(preview) {
    setFotos(prev => prev.filter(f => f.preview !== preview));
  }

  function handleDrop(e) {
    e.preventDefault();
    subirFotos(e.dataTransfer.files);
  }

  function handleGeo() {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "es" } }
          );
          const data = await res.json();
          const addr = data.display_name || `${latitude}, ${longitude}`;
          setForm(p => ({ ...p, direccion: addr }));
          setCoords({ latitud: latitude, longitud: longitude });
        } catch {
          setForm(p => ({ ...p, direccion: "" }));
        } finally {
          setGeoLoading(false);
        }
      },
      () => setGeoLoading(false)
    );
  }

  function validar() {
    const errs = {};
    if (!form.titulo.trim())               errs.titulo      = "El título es obligatorio.";
    else if (form.titulo.trim().length < 5) errs.titulo      = "El título debe tener al menos 5 caracteres.";
    if (!form.descripcion.trim())          errs.descripcion = "La descripción es obligatoria.";
    else if (form.descripcion.trim().length < 10) errs.descripcion = "Describí el problema con más detalle (mínimo 10 caracteres).";
    if (!form.id_categoria)               errs.categoria   = "Seleccioná una categoría.";
    if (!form.direccion.trim())            errs.direccion   = "Ingresá la ubicación del problema.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    if (!session?.user?.id) return setError("Tu sesión expiró, volvé a iniciar sesión.");

    setSubmitting(true);
    try {
      const res  = await fetch(`${API_URL}/api/reclamos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo:       form.titulo.trim(),
          descripcion:  form.descripcion.trim(),
          id_categoria: form.id_categoria,
          id_usuario:   session.user.id,
          direccion:    form.direccion.trim(),
          latitud:      coords.latitud,
          longitud:     coords.longitud,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push("/home");
      } else {
        setError(data.mensaje || "Error al publicar el reclamo.");
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="nr-page">
      <div className="nr-header">
        <button type="button" className="nr-back" onClick={() => router.back()}>
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 className="nr-title">Nuevo Reclamo</h1>
        <div className="nr-header-spacer" />
      </div>

      <div className="nr-scroll">
        <form className="nr-card" onSubmit={handleSubmit} noValidate>

          <div className="nr-field">
            <label className="nr-label">Título del reclamo</label>
            <input
              className={`nr-input${fieldErrors.titulo ? " nr-input-error" : ""}`}
              placeholder="Ej. Luminaria rota en la esquina"
              value={form.titulo}
              onChange={e => { setForm(p => ({ ...p, titulo: e.target.value })); setFieldErrors(p => ({ ...p, titulo: "" })); }}
              maxLength={120}
            />
            {fieldErrors.titulo && <p className="nr-field-error">{fieldErrors.titulo}</p>}
          </div>

          <div className="nr-field">
            <label className="nr-label">Descripción detallada</label>
            <textarea
              className={`nr-textarea${fieldErrors.descripcion ? " nr-input-error" : ""}`}
              placeholder="Describí el problema con la mayor cantidad de detalles posible..."
              value={form.descripcion}
              onChange={e => { setForm(p => ({ ...p, descripcion: e.target.value })); setFieldErrors(p => ({ ...p, descripcion: "" })); }}
              rows={4}
            />
            {fieldErrors.descripcion && <p className="nr-field-error">{fieldErrors.descripcion}</p>}
          </div>

          <div className="nr-field">
            <label className="nr-label">Categoría</label>
            {loadingCats ? (
              <p className="nr-muted">Cargando categorías...</p>
            ) : (
              <div className={`nr-cat-grid${fieldErrors.categoria ? " nr-cat-grid-error" : ""}`}>
                {categorias.map(cat => {
                  const Icon = getIcono(cat.nombre, cat.descripcion);
                  const sel  = form.id_categoria === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`nr-cat-card${sel ? " selected" : ""}`}
                      onClick={() => { setForm(p => ({ ...p, id_categoria: cat.id })); setFieldErrors(p => ({ ...p, categoria: "" })); }}
                    >
                      {sel && (
                        <span className="nr-cat-check">
                          <Check size={10} />
                        </span>
                      )}
                      <Icon size={26} strokeWidth={1.5} />
                      <span className="nr-cat-name">{cat.nombre}</span>
                      <span className="nr-cat-desc">{cat.descripcion}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {fieldErrors.categoria && <p className="nr-field-error">{fieldErrors.categoria}</p>}
          </div>

          <div className="nr-field">
            <label className="nr-label">Ubicación</label>
            <div className="nr-location-row">
              <span className="nr-location-icon"><MapPin size={15} /></span>
              <input
                className={`nr-input nr-input-loc${fieldErrors.direccion ? " nr-input-error" : ""}`}
                placeholder="Dirección exacta o intersección"
                value={form.direccion}
                onChange={e => { setForm(p => ({ ...p, direccion: e.target.value })); setFieldErrors(p => ({ ...p, direccion: "" })); }}
              />
              <button
                type="button"
                className="nr-geo-btn"
                onClick={handleGeo}
                disabled={geoLoading}
                title="Usar mi ubicación"
              >
                {geoLoading
                  ? <Loader2 size={16} className="nr-spin" />
                  : <MapPin size={16} />
                }
              </button>
            </div>
            {fieldErrors.direccion && <p className="nr-field-error">{fieldErrors.direccion}</p>}
          </div>

          <div className="nr-field">
            <label className="nr-label">Evidencia fotográfica <span className="nr-optional">(opcional)</span></label>
            <div
              ref={dropRef}
              className={`nr-dropzone${fotos.length > 0 ? " has-files" : ""}`}
              onClick={() => fotos.length < 5 && inputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              {fotos.length === 0 ? (
                <>
                  <Camera size={30} strokeWidth={1.3} className="nr-drop-icon" />
                  <p className="nr-drop-text">Arrastrá tus fotos aquí o hacé clic para subir</p>
                  <p className="nr-drop-sub">Formatos soportados: JPG, PNG. Máximo 5MB.</p>
                </>
              ) : (
                <div className="nr-fotos-grid" onClick={e => e.stopPropagation()}>
                  {fotos.map(f => (
                    <div key={f.preview} className="nr-foto-thumb">
                      <img src={f.preview} alt="evidencia" />
                      {f.uploading && (
                        <div className="nr-foto-overlay">
                          <Loader2 size={16} className="nr-spin" />
                        </div>
                      )}
                      <button
                        type="button"
                        className="nr-foto-del"
                        onClick={() => eliminarFoto(f.preview)}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  {fotos.length < 5 && (
                    <button
                      type="button"
                      className="nr-foto-add"
                      onClick={() => inputRef.current?.click()}
                    >
                      <Camera size={20} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={e => subirFotos(e.target.files)}
            />
          </div>

          {error && <p className="nr-error">{error}</p>}

          {/* Submit */}
          <div className="nr-actions">
            <button type="submit" disabled={submitting} className="nr-submit">
              {submitting
                ? <><Loader2 size={15} className="nr-spin" /> Publicando...</>
                : <><Send size={15} /> Publicar reclamo</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

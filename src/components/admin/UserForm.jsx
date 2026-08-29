"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/services/apiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const rolesOpciones   = ["ciudadano", "admin", "institucion"];
const estadosOpciones = ["activo", "inactivo"];

export default function UserForm({ usuarioId = null }) {
  const router  = useRouter();
  const isEdit  = !!usuarioId;
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    nombre:   "",
    email:    "",
    password: "",
    rol:      "ciudadano",
    estado:   "activo",
    foto:     null,
  });
  const [errors, setErrors]   = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [apiError, setApiError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [uploadingFoto, setUploadingFoto] = useState(false);

  // Si es edición cargamos los datos del usuario
  useEffect(() => {
    if (!isEdit) return;
    async function cargarUsuario() {
      try {
        const res  = await apiClient.get(`/admin/usuarios/${usuarioId}`);
        const data = res.data;
        if (data.ok) {
          setForm(prev => ({
            ...prev,
            nombre: data.data.nombre || "",
            email:  data.data.email  || "",
            rol:    data.data.rol    || "ciudadano",
            estado: data.data.estado || "activo",
            foto:   data.data.foto   || null,
          }));
          if (data.data.foto) setPreview(data.data.foto);
        }
      } catch (err) {
        setApiError('Error al cargar datos del usuario');
      } finally {
        setLoadingData(false);
      }
    }
    cargarUsuario();
  }, [usuarioId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
    setApiError("");
    setInfoMessage("");
  }

  async function submitUser(payload, { redirect = true, successMessage = "" } = {}) {
    const errs = validate(payload);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return false;
    }

    setLoading(true);
    setApiError("");

    try {
      const body = {
        email: payload.email,
        nombre: payload.nombre,
        rol: payload.rol,
        estado: payload.estado,
        foto: payload.foto,
      };

      if (!isEdit) {
        body.password = payload.password;
      }

      const res = await (isEdit ? apiClient.put : apiClient.post)(isEdit ? `/admin/usuarios/${usuarioId}` : `/admin/usuarios`, body);
      const data = res.data;

      if (!data.ok) {
        setApiError(data.mensaje || 'No se pudo guardar el usuario');
        return false;
      }

      if (successMessage) {
        setInfoMessage(successMessage);
      }

      if (redirect) {
        router.push('/admin/users');
      }

      return true;
    } catch (err) {
      setApiError('Error al conectar con el servidor');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleFoto(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Preview inmediato
  const url = URL.createObjectURL(file);
  setPreview(url);

  // Subir a Cloudinary
  setUploadingFoto(true);
  setApiError("");
  setInfoMessage("");
  try {
    const formData = new FormData();
    formData.append('foto', file);

    const res  = await apiClient.post(`/admin/upload/foto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const data = res.data || {};

    if (data.ok) {
      const nextForm = { ...form, foto: data.url };
      setForm(nextForm);

      if (isEdit) {
        const saved = await submitUser(nextForm, {
          redirect: false,
          successMessage: 'Foto de perfil actualizada correctamente',
        });
        if (!saved) {
          setApiError('La imagen se subió, pero no se pudo guardar en el perfil. Intentá guardar cambios nuevamente.');
        }
      } else {
        setInfoMessage('Imagen subida. Para guardarla en el perfil, hacé clic en Crear usuario.');
      }
    } else {
      setApiError(data.mensaje || data.error || 'Error al subir la imagen');
    }
  } catch (err) {
    setApiError(err.message || 'Error al subir la imagen');
  } finally {
    setUploadingFoto(false);
  }
}

  function validate(values = form) {
    const errs = {};
    if (!values.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!values.email.trim())  errs.email  = "El email es obligatorio.";
    else if (!/\S+@\S+\.\S+/.test(values.email)) errs.email = "El email no es válido.";
    if (!isEdit && !values.password) errs.password = "La contraseña es obligatoria.";
    if (!isEdit && values.password && values.password.length < 6)
      errs.password = "Mínimo 6 caracteres.";
    return errs;
  }

  async function handleSubmit() {
    await submitUser(form, {
      redirect: true,
      successMessage: isEdit ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente',
    });
  }

  const inputStyle = {
    width: "100%", padding: "9px 12px", fontSize: 13,
    border: "1px solid var(--color-border)", borderRadius: 8,
    background: "#fff", color: "var(--color-text)", boxSizing: "border-box", marginTop: 6,
  };
  const labelStyle = { fontSize: 11, color: "var(--color-muted)", fontWeight: 600, letterSpacing: 1 };
  const errorStyle = { fontSize: 12, color: "var(--color-danger)", marginTop: 4 };

  if (loadingData) {
    return <p className="users-empty-state">Cargando datos del usuario...</p>;
  }

  return (
    <div className="card users-form-card">

      {/* Error general API */}
      {apiError && (
        <div style={{
          background: "#FEE2E2", border: "1px solid #FCA5A5",
          borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: "#991B1B",
        }}>
          {apiError}
        </div>
      )}

      {infoMessage && (
        <div style={{
          background: "#DCFCE7", border: "1px solid #86EFAC",
          borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: "#166534",
        }}>
          {infoMessage}
        </div>
      )}

      {/* Foto de perfil */}
      <div className="users-photo-block">
        <div
          onClick={() => fileRef.current.click()}
          style={{
            width: 72, height: 72, borderRadius: "50%", cursor: "pointer",
            background: preview ? "transparent" : "#e8eaf6",
            border: "2px dashed var(--color-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
          }}
        >
          {preview
            ? <img src={preview} alt="foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 11, color: "var(--color-muted)", textAlign: "center", padding: 4 }}>Subir foto</span>
          }
        </div>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--color-text)", fontWeight: 600 }}>Foto de perfil</p>
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploadingFoto}
            style={{
              padding: "6px 14px", border: "1px solid var(--color-border)",
              borderRadius: 8, background: "#fff", fontSize: 12,
              cursor: uploadingFoto ? "not-allowed" : "pointer",
              color: "var(--color-text)",
              opacity: uploadingFoto ? 0.7 : 1,
            }}
          >
          {uploadingFoto ? "Subiendo..." : preview ? "Cambiar foto" : "Seleccionar imagen"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFoto} />
        </div>
      </div>

      {/* Nombre */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>NOMBRE COMPLETO</label>
        <input
          name="nombre" value={form.nombre} onChange={handleChange}
          placeholder="Ej: Mateo Sánchez"
          style={{ ...inputStyle, borderColor: errors.nombre ? "var(--color-danger)" : "" }}
        />
        {errors.nombre && <p style={errorStyle}>{errors.nombre}</p>}
      </div>

      {/* Email */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>EMAIL</label>
        <input
          name="email" value={form.email} onChange={handleChange}
          placeholder="Ej: usuario@reportarg.gob.ar"
          style={{ ...inputStyle, borderColor: errors.email ? "var(--color-danger)" : "" }}
        />
        {errors.email && <p style={errorStyle}>{errors.email}</p>}
      </div>

      {/* Password — solo al crear */}
      {!isEdit && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>CONTRASEÑA</label>
          <input
            name="password" type="password" value={form.password} onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            style={{ ...inputStyle, borderColor: errors.password ? "var(--color-danger)" : "" }}
          />
          {errors.password && <p style={errorStyle}>{errors.password}</p>}
        </div>
      )}

      {/* Rol y Estado */}
      <div className="users-form-grid">
        <div>
          <label style={labelStyle}>ROL</label>
          <select name="rol" value={form.rol} onChange={handleChange} style={inputStyle}>
            {rolesOpciones.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>ESTADO</label>
          <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle}>
            {estadosOpciones.map(e => <option key={e} value={e}>{e.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* Botones */}
      <div className="users-form-actions">
        <button
          onClick={() => router.push("/admin/users")}
          style={{
            padding: "10px 22px", border: "1px solid var(--color-border)",
            borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "var(--color-text)",
          }}
        >Cancelar</button>
        <button
          onClick={handleSubmit}
          disabled={loading || uploadingFoto}
          style={{
            padding: "10px 22px", background: (loading || uploadingFoto) ? "#ccc" : "var(--color-primary)",
            color: "#fff", border: "none", borderRadius: 8,
            fontSize: 13, fontWeight: "bold",
            cursor: (loading || uploadingFoto) ? "not-allowed" : "pointer",
          }}
        >
          {uploadingFoto ? "Subiendo imagen..." : loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
        </button>
      </div>

    </div>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BuildingOffice2Icon,
  ChevronDownIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  IdentificationIcon,
  LockClosedIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import { hasValidationErrors, validateInstitutionRegister } from '@/utils/schemas';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import StepIndicator from '@/components/ui/StepIndicator';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PROVINCIAS_AR = [
  'Buenos Aires','Catamarca','Chaco','Chubut','Ciudad Autónoma de Buenos Aires',
  'Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja',
  'Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis',
  'Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán',
];

const CIUDADES_AR = {
  'Buenos Aires': ['La Plata','Mar del Plata','Quilmes','Lanús','Lomas de Zamora','Morón','Tres de Febrero','San Martín','Tigre','Bahía Blanca','Tandil','Pergamino','Otra'],
  'Catamarca': ['San Fernando del Valle de Catamarca','Santa Rosa','Tinogasta','Otra'],
  'Chaco': ['Resistencia','Barranqueras','Presidencia Roque Sáenz Peña','Otra'],
  'Chubut': ['Rawson','Comodoro Rivadavia','Puerto Madryn','Trelew','Otra'],
  'Ciudad Autónoma de Buenos Aires': ['CABA'],
  'Córdoba': ['Córdoba','Villa María','San Francisco','Río Cuarto','Alta Gracia','Villa Carlos Paz','Otra'],
  'Corrientes': ['Corrientes','Goya','Curuzú Cuatiá','Otra'],
  'Entre Ríos': ['Paraná','Concordia','Gualeguaychú','Otra'],
  'Formosa': ['Formosa','Clorinda','Otra'],
  'Jujuy': ['San Salvador de Jujuy','Palpalá','San Pedro','Otra'],
  'La Pampa': ['Santa Rosa','General Pico','Otra'],
  'La Rioja': ['La Rioja','Chilecito','Otra'],
  'Mendoza': ['Mendoza','San Rafael','Godoy Cruz','Luján de Cuyo','Otra'],
  'Misiones': ['Posadas','Oberá','Eldorado','Puerto Iguazú','Otra'],
  'Neuquén': ['Neuquén','San Martín de los Andes','Zapala','Otra'],
  'Río Negro': ['Viedma','Bariloche','Cipolletti','Otra'],
  'Salta': ['Salta','San Ramón de la Nueva Orán','Tartagal','Otra'],
  'San Juan': ['San Juan','Rawson','Rivadavia','Otra'],
  'San Luis': ['San Luis','Villa Mercedes','Otra'],
  'Santa Cruz': ['Río Gallegos','Caleta Olivia','Otra'],
  'Santa Fe': ['Santa Fe','Rosario','Rafaela','Reconquista','Venado Tuerto','Otra'],
  'Santiago del Estero': ['Santiago del Estero','La Banda','Otra'],
  'Tierra del Fuego': ['Ushuaia','Río Grande','Otra'],
  'Tucumán': ['San Miguel de Tucumán','Concepción','Banda del Río Salí','Otra'],
};

const institutionTypes = [
  { key: 'municipio', label: 'Municipio' },
  { key: 'hospital', label: 'Hospital / Centro de salud' },
  { key: 'escuela', label: 'Escuela / Institución educativa' },
  { key: 'ong', label: 'ONG / Fundación' },
  { key: 'seguridad', label: 'Fuerza de seguridad' },
  { key: 'otra', label: 'Otra institución' },
];

const initialForm = {
  contactName: '',
  email: '',
  password: '',
  confirmPassword: '',
  institutionName: '',
  cuit: '',
  institutionType: '',
  phone: '',
  provincia: '',
  ciudad: '',
  zona: '',
  address: '',
  termsAccepted: false,
};

export default function InstitutionRegister() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step] = useState(1);
  const router = useRouter();

  const formatCuit = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 10) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
  };

  const syncFieldErrors = (nextData, nextTouched, fields) => {
    const validationErrors = validateInstitutionRegister(nextData);

    setErrors((prev) => {
      const nextErrors = { ...prev };

      fields.forEach((field) => {
        const shouldShow = nextTouched[field] || field === 'password' || field === 'confirmPassword' || field === 'cuit';
        if (shouldShow && validationErrors[field]) {
          nextErrors[field] = validationErrors[field];
        } else {
          delete nextErrors[field];
        }
      });

      return nextErrors;
    });
  };

  const handleChange = (name, value) => {
    const normalizedValue = name === 'cuit' ? formatCuit(value) : value;
    let nextData = { ...formData, [name]: normalizedValue };
    if (name === 'provincia') nextData = { ...nextData, ciudad: '' };
    const nextTouched = { ...touched, [name]: true };
    const fieldsToSync = name === 'password' || name === 'confirmPassword'
      ? ['password', 'confirmPassword']
      : [name];

    setFormData(nextData);
    setTouched(nextTouched);
    syncFieldErrors(nextData, nextTouched, fieldsToSync);
  };

  const handleBlur = (name) => {
    const nextTouched = { ...touched, [name]: true };
    const fieldsToSync = name === 'password' || name === 'confirmPassword'
      ? ['password', 'confirmPassword']
      : [name];

    setTouched(nextTouched);
    syncFieldErrors(formData, nextTouched, fieldsToSync);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateInstitutionRegister(formData);
    setErrors(validationErrors);
    setTouched({
      contactName: true,
      email: true,
      password: true,
      confirmPassword: true,
      institutionName: true,
      cuit: true,
      institutionType: true,
      phone: true,
      provincia: true,
      ciudad: true,
      zona: true,
      address: true,
      termsAccepted: true,
    });

    if (hasValidationErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register-institution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error en el registro');
      }

      toast.success('Registro exitoso. Te enviamos un código de verificación.');
      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(formData.email)}&type=institution`);
      }, 1500);
    } catch (submitError) {
      setServerError(submitError.message || 'Ocurrió un error en el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      title={
        <>
          Gestiona trámites
          <br />
          para tu Institución
        </>
      }
      description="Plataforma avanzada para empresas, ONGs y entidades públicas."
      mobileSubtitle="Registro institucional"
      formClassName="login-form login-form-register"
    >
      <StepIndicator currentStep={step} />

      <div className="login-form-header text-center">
        <h2 className="login-form-title">Registro Institucional</h2>
        <p className="login-form-subtitle">
          {step === 2 ? 'Datos del responsable e institución.' : '¿Dónde está ubicada físicamente?'}
        </p>
      </div>

      <div className="login-right">
        <div className="login-form login-form-register">
          <div className="login-logo-mobile">
            <img src="/logo.png" alt="logo-reportarg" className="login-logo-mobile-img" />
            <p className="login-logo-mobile-subtitle">Registro institucional</p>
          </div>

          <div className="register-form-brand" aria-hidden>
            <div className="register-form-brand-badge">
              <BuildingOffice2Icon className="register-form-brand-icon" />
            </div>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Crear cuenta institucional</h2>
            <p className="login-form-subtitle">
              Datos del responsable y datos formales de la institución.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="contactName">NOMBRE COMPLETO DEL RESPONSABLE <span className="form-required">*</span></label>
              <div className="form-input-wrapper">
                <input type="text" id="contactName" className="form-input" placeholder="Ej. Juan Perez" value={formData.contactName} onChange={(e) => handleChange('contactName', e.target.value)} onBlur={() => handleBlur('contactName')} />
                <div className="form-input-icon"><UserIcon aria-hidden /></div>
              </div>
              {errors.contactName && <p className="register-error">{errors.contactName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">CORREO ELECTRÓNICO INSTITUCIONAL <span className="form-required">*</span></label>
              <div className="form-input-wrapper">
                <input type="email" id="email" className="form-input" placeholder="institucion@dominio.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} />
                <div className="form-input-icon"><EnvelopeIcon aria-hidden /></div>
              </div>
              {errors.email && <p className="register-error">{errors.email}</p>}
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="password">CONTRASEÑA <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon form-input-icon-left"><LockClosedIcon aria-hidden /></div>
                  <input type={showPassword ? 'text' : 'password'} id="password" className="form-input has-left-icon" placeholder="••••••••" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} onBlur={() => handleBlur('password')} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  </button>
                </div>
                {errors.password && <p className="register-error">{errors.password}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">CONFIRMAR CONTRASEÑA <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon form-input-icon-left"><LockClosedIcon aria-hidden /></div>
                  <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" className="form-input has-left-icon" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} onBlur={() => handleBlur('confirmPassword')} />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}>
                    {showConfirmPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="register-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="institutionName">NOMBRE O RAZÓN SOCIAL <span className="form-required">*</span></label>
              <div className="form-input-wrapper">
                <input type="text" id="institutionName" className="form-input" placeholder="Ej. Hospital Municipal San Martin" value={formData.institutionName} onChange={(e) => handleChange('institutionName', e.target.value)} onBlur={() => handleBlur('institutionName')} />
                <div className="form-input-icon"><BuildingOffice2Icon aria-hidden /></div>
              </div>
              {errors.institutionName && <p className="register-error">{errors.institutionName}</p>}
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="cuit">CUIT <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <input type="text" id="cuit" className="form-input" placeholder="30-12345678-9" value={formData.cuit} onChange={(e) => handleChange('cuit', e.target.value)} onBlur={() => handleBlur('cuit')} />
                  <div className="form-input-icon"><IdentificationIcon aria-hidden /></div>
                </div>
                {errors.cuit && <p className="register-error">{errors.cuit}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="institutionType">TIPO DE INSTITUCIÓN <span className="form-required">*</span></label>
                <div className="form-input-wrapper form-select-wrapper">
                  <select id="institutionType" className="form-input form-select" value={formData.institutionType} onChange={(e) => handleChange('institutionType', e.target.value)} onBlur={() => handleBlur('institutionType')}>
                    <option value="">Selecciona una opción</option>
                    {institutionTypes.map((type) => (
                      <option key={type.key} value={type.key}>{type.label}</option>
                    ))}
                  </select>
                  <div className="form-input-icon"><ChevronDownIcon aria-hidden /></div>
                </div>
                {errors.institutionType && <p className="register-error">{errors.institutionType}</p>}
              </div>
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="phone">TELÉFONO DE CONTACTO <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <input type="text" id="phone" className="form-input" placeholder="221 555 1234" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} onBlur={() => handleBlur('phone')} />
                  <div className="form-input-icon"><PhoneIcon aria-hidden /></div>
                </div>
                {errors.phone && <p className="register-error">{errors.phone}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">DIRECCIÓN <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <input type="text" id="address" className="form-input" placeholder="Calle 123, número, barrio" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} onBlur={() => handleBlur('address')} />
                  <div className="form-input-icon"><MapPinIcon aria-hidden /></div>
                </div>
                {errors.address && <p className="register-error">{errors.address}</p>}
              </div>
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="provincia">PROVINCIA <span className="form-required">*</span></label>
                <div className="form-input-wrapper form-select-wrapper">
                  <select
                    id="provincia"
                    className="form-input form-select"
                    value={formData.provincia}
                    onChange={(e) => handleChange('provincia', e.target.value)}
                    onBlur={() => handleBlur('provincia')}
                  >
                    <option value="">Seleccioná una provincia</option>
                    {PROVINCIAS_AR.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="form-input-icon"><ChevronDownIcon aria-hidden /></div>
                </div>
                {errors.provincia && <p className="register-error">{errors.provincia}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ciudad">CIUDAD <span className="form-required">*</span></label>
                <div className="form-input-wrapper form-select-wrapper">
                  <select
                    id="ciudad"
                    className="form-input form-select"
                    value={formData.ciudad}
                    onChange={(e) => handleChange('ciudad', e.target.value)}
                    onBlur={() => handleBlur('ciudad')}
                    disabled={!formData.provincia}
                  >
                    <option value="">{formData.provincia ? 'Seleccioná una ciudad' : 'Primero elegí provincia'}</option>
                    {(CIUDADES_AR[formData.provincia] || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="form-input-icon"><ChevronDownIcon aria-hidden /></div>
                </div>
                {errors.ciudad && <p className="register-error">{errors.ciudad}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="zona">ZONA <span className="form-required">*</span></label>
              <input type="text" id="zona" className="form-input" placeholder="Centro" value={formData.zona} onChange={(e) => handleChange('zona', e.target.value)} onBlur={() => handleBlur('zona')} />
              {errors.zona && <p className="register-error">{errors.zona}</p>}
            </div>

            <label className="register-checkbox">
              <input type="checkbox" checked={formData.termsAccepted} onChange={(e) => handleChange('termsAccepted', e.target.checked)} onBlur={() => handleBlur('termsAccepted')} />
              <span>Acepto los términos y condiciones <span className="form-required">*</span></span>
            </label>
            {errors.termsAccepted && <p className="register-error">{errors.termsAccepted}</p>}

            {serverError && <p className="register-error">{serverError}</p>}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrarme'}
            </button>

            <p className="login-footer">
              ¿Querés registrarte como ciudadano? <Link href="/register/citizen">Ir al registro ciudadano</Link>
            </p>
            <p className="login-footer">
              ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </AuthSplitLayout>
  );
}

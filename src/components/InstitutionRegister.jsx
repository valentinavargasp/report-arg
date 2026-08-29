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
import { institutionRegisterSchema } from '@/utils/schemas';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import StepIndicator from '@/components/ui/StepIndicator';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/authService';
import Image from 'next/image';

import { PROVINCIAS_AR, CIUDADES_AR } from '@/utils/constants';

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
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(institutionRegisterSchema),
    mode: 'onTouched',
    defaultValues: initialForm,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [step] = useState(1);
  const router = useRouter();
  
  const provinciaSeleccionada = watch('provincia');

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

  const onSubmit = async (data) => {
    setServerError('');

    try {
      await authService.registerInstitution(data);

      toast.success('Registro exitoso. Te enviamos un código de verificación.');
      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(data.email)}&type=institution`);
      }, 1500);
    } catch (submitError) {
      setServerError(submitError.response?.data?.error || submitError.message || 'Ocurrió un error en el registro');
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
            <Image src="/logo.png" alt="logo-reportarg" className="login-logo-mobile-img" width={180} height={40} unoptimized />
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

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="contactName">NOMBRE COMPLETO DEL RESPONSABLE <span className="form-required">*</span></label>
              <div className="form-input-wrapper">
                <input type="text" id="contactName" className="form-input" placeholder="Ej. Juan Perez" {...register('contactName')} />
                <div className="form-input-icon"><UserIcon aria-hidden /></div>
              </div>
              {errors.contactName && <p className="register-error">{errors.contactName.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">CORREO ELECTRÓNICO INSTITUCIONAL <span className="form-required">*</span></label>
              <div className="form-input-wrapper">
                <input type="email" id="email" className="form-input" placeholder="institucion@dominio.com" {...register('email')} />
                <div className="form-input-icon"><EnvelopeIcon aria-hidden /></div>
              </div>
              {errors.email && <p className="register-error">{errors.email.message}</p>}
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="password">CONTRASEÑA <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon form-input-icon-left"><LockClosedIcon aria-hidden /></div>
                  <input type={showPassword ? 'text' : 'password'} id="password" className="form-input has-left-icon" placeholder="••••••••" {...register('password')} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  </button>
                </div>
                {errors.password && <p className="register-error">{errors.password.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">CONFIRMAR CONTRASEÑA <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon form-input-icon-left"><LockClosedIcon aria-hidden /></div>
                  <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" className="form-input has-left-icon" placeholder="••••••••" {...register('confirmPassword')} />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}>
                    {showConfirmPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="register-error">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="institutionName">NOMBRE O RAZÓN SOCIAL <span className="form-required">*</span></label>
              <div className="form-input-wrapper">
                <input type="text" id="institutionName" className="form-input" placeholder="Ej. Hospital Municipal San Martin" {...register('institutionName')} />
                <div className="form-input-icon"><BuildingOffice2Icon aria-hidden /></div>
              </div>
              {errors.institutionName && <p className="register-error">{errors.institutionName.message}</p>}
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="cuit">CUIT <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <input
                    type="text"
                    id="cuit"
                    className="form-input"
                    placeholder="30-12345678-9"
                    {...register('cuit', {
                      onChange: (e) => {
                        e.target.value = formatCuit(e.target.value);
                        setValue('cuit', e.target.value, { shouldValidate: true });
                      }
                    })}
                  />
                  <div className="form-input-icon"><IdentificationIcon aria-hidden /></div>
                </div>
                {errors.cuit && <p className="register-error">{errors.cuit.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="institutionType">TIPO DE INSTITUCIÓN <span className="form-required">*</span></label>
                <div className="form-input-wrapper form-select-wrapper">
                  <select id="institutionType" className="form-input form-select" {...register('institutionType')}>
                    <option value="">Selecciona una opción</option>
                    {institutionTypes.map((type) => (
                      <option key={type.key} value={type.key}>{type.label}</option>
                    ))}
                  </select>
                  <div className="form-input-icon"><ChevronDownIcon aria-hidden /></div>
                </div>
                {errors.institutionType && <p className="register-error">{errors.institutionType.message}</p>}
              </div>
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="phone">TELÉFONO DE CONTACTO <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <input type="text" id="phone" className="form-input" placeholder="221 555 1234" {...register('phone')} />
                  <div className="form-input-icon"><PhoneIcon aria-hidden /></div>
                </div>
                {errors.phone && <p className="register-error">{errors.phone.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">DIRECCIÓN <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <input type="text" id="address" className="form-input" placeholder="Calle 123, número, barrio" {...register('address')} />
                  <div className="form-input-icon"><MapPinIcon aria-hidden /></div>
                </div>
                {errors.address && <p className="register-error">{errors.address.message}</p>}
              </div>
            </div>

            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="provincia">PROVINCIA <span className="form-required">*</span></label>
                <div className="form-input-wrapper form-select-wrapper">
                  <select
                    id="provincia"
                    className="form-input form-select"
                    {...register('provincia')}
                  >
                    <option value="">Seleccioná una provincia</option>
                    {PROVINCIAS_AR.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="form-input-icon"><ChevronDownIcon aria-hidden /></div>
                </div>
                {errors.provincia && <p className="register-error">{errors.provincia.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ciudad">CIUDAD <span className="form-required">*</span></label>
                <div className="form-input-wrapper form-select-wrapper">
                  <select
                    id="ciudad"
                    className="form-input form-select"
                    {...register('ciudad')}
                    disabled={!provinciaSeleccionada}
                  >
                    <option value="">{provinciaSeleccionada ? 'Seleccioná una ciudad' : 'Primero elegí provincia'}</option>
                    {(CIUDADES_AR[provinciaSeleccionada] || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="form-input-icon"><ChevronDownIcon aria-hidden /></div>
                </div>
                {errors.ciudad && <p className="register-error">{errors.ciudad.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="zona">ZONA <span className="form-required">*</span></label>
              <input type="text" id="zona" className="form-input" placeholder="Centro" {...register('zona')} />
              {errors.zona && <p className="register-error">{errors.zona.message}</p>}
            </div>

            <label className="register-checkbox">
              <input type="checkbox" {...register('termsAccepted')} />
              <span>Acepto los términos y condiciones <span className="form-required">*</span></span>
            </label>
            {errors.termsAccepted && <p className="register-error">{errors.termsAccepted.message}</p>}

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

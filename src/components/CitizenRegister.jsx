'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  MapPinIcon,
  UserIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';

import { PROVINCIAS_AR, CIUDADES_AR } from '@/utils/constants';
import { citizenRegisterSchema } from '@/utils/schemas';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/authService';
import Image from 'next/image';

const initialForm = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmPassword: '',
  provincia: '',
  ciudad: '',
  zona: '',
  acceptTerms: false,
};

export default function CitizenRegister() {
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(citizenRegisterSchema),
    mode: 'onTouched',
    defaultValues: initialForm,
  });

  const provinciaSeleccionada = watch('provincia');

  const onSubmit = async (data) => {
    setServerError('');

    try {
      await authService.registerCitizen(data);

      toast.success('Registro exitoso. Te enviamos un código de verificación.');
      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(data.email)}&type=citizen`);
      }, 1500);
    } catch (error) {
      setServerError(error.response?.data?.error || error.message || 'Ocurrió un error al registrar ciudadano');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <Image src="/logo.png" alt="logo-reportarg" className="login-logo-img" width={250} height={60} unoptimized />
        <div className="login-left-content">
          <h1 className="login-title">
            Construyendo una
            <br />
            comunidad más
            <br />
            segura.
          </h1>
          <p className="login-description">
            Registrate como ciudadano para reportar incidentes y dar seguimiento a tus alertas.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form login-form-register">
          <div className="login-logo-mobile">
            <Image src="/logo.png" alt="logo-reportarg" className="login-logo-mobile-img" width={180} height={40} unoptimized />
            <p className="login-logo-mobile-subtitle">Registro ciudadano</p>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Crear cuenta ciudadana</h2>
            <p className="login-form-subtitle">Completa tus datos personales y ubicación.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="register-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="nombre">NOMBRE <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <input type="text" id="nombre" className="form-input" placeholder="Ej. Ana" {...register('nombre')} />
                  <div className="form-input-icon"><UserIcon aria-hidden /></div>
                </div>
                {errors.nombre && <p className="register-error">{errors.nombre.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="apellido">APELLIDO <span className="form-required">*</span></label>
                <div className="form-input-wrapper">
                  <input type="text" id="apellido" className="form-input" placeholder="Ej. García" {...register('apellido')} />
                  <div className="form-input-icon"><UserIcon aria-hidden /></div>
                </div>
                {errors.apellido && <p className="register-error">{errors.apellido.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">CORREO ELECTRÓNICO <span className="form-required">*</span></label>
              <div className="form-input-wrapper">
                <input type="email" id="email" className="form-input" placeholder="ejemplo@correo.com" {...register('email')} />
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
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
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
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((prev) => !prev)} aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}>
                    {showConfirmPassword ? <EyeSlashIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="register-error">{errors.confirmPassword.message}</p>}
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
              <div className="form-input-wrapper">
                <input type="text" id="zona" className="form-input" placeholder="Centro" {...register('zona')} />
                <div className="form-input-icon"><MapPinIcon aria-hidden /></div>
              </div>
              {errors.zona && <p className="register-error">{errors.zona.message}</p>}
            </div>

            <label className="register-checkbox">
              <input type="checkbox" {...register('acceptTerms')} />
              <span>Acepto los términos y condiciones <span className="form-required">*</span></span>
            </label>
            {errors.acceptTerms && <p className="register-error">{errors.acceptTerms.message}</p>}

            {serverError && <p className="register-error">{serverError}</p>}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrarme'}
            </button>

            <p className="login-footer">
              ¿Representás una organización? <Link href="/register/institution">Registrate como institución</Link>
            </p>
            <p className="login-footer">
              ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
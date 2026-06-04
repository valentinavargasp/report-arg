'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function VerifyEmail() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputsRef = useRef([]);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get('email') || '');
    setType(params.get('type') || '');
  }, []);

  const handleChange = (event, index) => {
    const value = event.target.value;
    if (/[^0-9]/.test(value)) return;

    const nextCode = [...code];
    nextCode[index] = value;
    setCode(nextCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const finalCode = code.join('');
    if (finalCode.length < 6) {
      setError('Ingresa los 6 dígitos completos.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: finalCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'El código ingresado no es válido.');
      }

      toast.success('¡Cuenta verificada! Ya podés iniciar sesión.');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (submitError) {
      setError(submitError.message || 'El código ingresado no es válido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo reenviar el código');
      }
    } catch (resendError) {
      setError(resendError.message || 'No se pudo reenviar el código');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/logo.png" alt="logo-reportarg" className="login-logo-img" />
        <div className="login-left-content">
          <h1 className="login-title">Construyendo una<br />comunidad más<br />segura.</h1>
          <p className="login-description">Únete al portal institucional para la gestión y reporte inteligente de incidentes. Tecnología al servicio del ciudadano.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form login-form-register">
          <div className="login-logo-mobile">
            <img src="/logo.png" alt="ReportARG" className="login-logo-mobile-img" />
            <p className="login-logo-mobile-subtitle">Verificación de cuenta</p>
          </div>

          <div className="login-form-header text-center">
            <h2 className="login-form-title">Código de verificación</h2>
            <p className="login-form-subtitle">Enviamos un código de 6 dígitos a <strong>{email || 'tu correo'}</strong></p>
            {type === 'institution' && <p className="login-form-subtitle">Completa la verificación para continuar con el alta institucional.</p>}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '32px 0' }}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { inputsRef.current[index] = element; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleChange(event, index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  style={{
                    width: 48,
                    height: 56,
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 600,
                    border: '2px solid #e5e7eb',
                    borderRadius: 12,
                    outline: 'none',
                    color: 'rgb(var(--azul))',
                  }}
                />
              ))}
            </div>

            {error && <p className="register-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Verificando...' : 'Verificar correo y registrarme'}
            </button>

            <div className="text-center mt-6 text-sm text-gray-600" style={{ marginTop: 20, textAlign: 'center' }}>
              ¿No recibiste el código?{' '}
              <button type="button" onClick={handleResend} className="form-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Reenviar código
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

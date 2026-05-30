import { Fragment } from 'react';
import Link from 'next/link';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import { STEPS, CATEGORIES, BENEFITS, INST_FEATURES } from '@/utils/landingData';

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }} aria-hidden>
      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="landing">
      <LandingNav />

      <section className="lnd-hero">
        <div className="lnd-hero-inner">

          <h1 className="lnd-hero-title">
            Reportá problemas.<br />
            Informate.<br />
            <em>Mejorá tu comunidad.</em>
          </h1>

          <p className="lnd-hero-sub">
            La plataforma que conecta a ciudadanos e instituciones para mejorar
            la calidad de vida en Argentina. Rápido, transparente y gratuito.
          </p>

          <div className="lnd-hero-actions">
            <Link href="/auth" className="lnd-hero-cta primary">
              Registrarse gratis <ArrowIcon />
            </Link>
            <Link href="/login" className="lnd-hero-cta secondary">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      <section className="lnd-section lnd-section-alt" id="proceso">
        <h2 className="lnd-section-title">Un proceso simple y transparente</h2>
        <p className="lnd-section-sub">
          Tres pasos para que tu reclamo llegue a quien corresponde y puedas seguirlo en tiempo real.
        </p>
        <div className="lnd-steps">
          {STEPS.map((s) => (
            <div key={s.num} className="lnd-step-card">
              <span className="lnd-step-num">{s.num}</span>
              <div className={`lnd-step-icon ${s.color}`}>
                <Icon d={s.d} />
              </div>
              <h3 className="lnd-step-title">{s.title}</h3>
              <p className="lnd-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lnd-section" id="categorias">
        <h2 className="lnd-section-title">Categorías principales</h2>
        <p className="lnd-section-sub">
          Reportá cualquier tipo de incidente urbano. Las instituciones responsables lo reciben automáticamente.
        </p>
        <div className="lnd-cats">
          {CATEGORIES.map((c) => (
            <div key={c.label} className="lnd-cat-pill">
              <Icon d={c.d} />
              {c.label}
            </div>
          ))}
        </div>
      </section>

      <section className="lnd-inst" id="instituciones">
        <div className="lnd-inst-inner">
          <span className="lnd-inst-badge">PARA INSTITUCIONES</span>
          <h2 className="lnd-inst-title">Las instituciones también forman parte</h2>
          <p className="lnd-inst-desc">
            Municipios, hospitales, escuelas y ONGs pueden registrarse para recibir y gestionar
            los reclamos de su comunidad desde un panel centralizado.
          </p>

          <div className="lnd-inst-features">
            {INST_FEATURES.map((f) => (
              <div key={f} className="lnd-inst-feature">
                <span className="lnd-inst-feature-icon"><CheckIcon /></span>
                {f}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2.25rem' }}>
            <Link href="/auth" className="lnd-inst-cta">
              Registrar mi institución <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <section className="lnd-section lnd-section-alt">
        <h2 className="lnd-section-title">Beneficios compartidos</h2>
        <p className="lnd-section-sub">
          Una sola plataforma que beneficia tanto a ciudadanos como a instituciones públicas.
        </p>
        <div className="lnd-benefits-grid">
          {BENEFITS.map((b) => (
            <div key={b.title} className="lnd-benefit-card">
              <div className="lnd-benefit-icon">
                <Icon d={b.d} />
              </div>
              <h3 className="lnd-benefit-title">{b.title}</h3>
              <p className="lnd-benefit-desc">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}


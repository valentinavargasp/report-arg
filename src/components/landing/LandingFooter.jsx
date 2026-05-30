import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="lnd-footer">
      <div className="lnd-footer-inner">
        <div className="lnd-footer-brand">
          <div className="lnd-footer-brand-logo">
            <img src="/logo.png" alt="ReportARG" />
            <span>ReportARG</span>
          </div>
          <p>Plataforma ciudadana para reportar y gestionar incidentes urbanos en Argentina.</p>
        </div>

        <div className="lnd-footer-col">
          <h4>Plataforma</h4>
          <ul>
            <li><a href="#proceso">Cómo funciona</a></li>
            <li><a href="#categorias">Categorías</a></li>
            <li><a href="#instituciones">Instituciones</a></li>
          </ul>
        </div>

        <div className="lnd-footer-col">
          <h4>Cuenta</h4>
          <ul>
            <li><Link href="/login">Iniciar sesión</Link></li>
            <li><Link href="/auth">Registrarse</Link></li>
          </ul>
        </div>

        <div className="lnd-footer-col">
          <h4>Soporte</h4>
          <ul>
            <li><a href="#">Preguntas frecuentes</a></li>
            <li><a href="#">Términos de uso</a></li>
            <li><a href="#">Privacidad</a></li>
          </ul>
        </div>
      </div>

      <div className="lnd-footer-bottom">
        <span>© 2026 ReportARG. Todos los derechos reservados.</span>
        <span>Hecho en Argentina 🇦🇷</span>
      </div>
    </footer>
  );
}

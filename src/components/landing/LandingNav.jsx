import Link from 'next/link';

export default function LandingNav() {
  return (
    <nav className="lnd-nav">
      <Link href="/" className="lnd-nav-logo">
        <img src="/logo.png" alt="ReportARG" />
      </Link>

      <ul className="lnd-nav-links">
        <li><a href="#proceso">Cómo funciona</a></li>
        <li><a href="#categorias">Categorías</a></li>
        <li><a href="#instituciones">Instituciones</a></li>
      </ul>

      <div className="lnd-nav-actions">
        <Link href="/login" className="lnd-btn-ghost">Iniciar sesión</Link>
        <Link href="/auth" className="lnd-btn-primary">Registrarse</Link>
      </div>
    </nav>
  );
}

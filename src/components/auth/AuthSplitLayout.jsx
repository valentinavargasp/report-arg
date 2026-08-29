'use client';
import Image from 'next/image';

export default function AuthSplitLayout({
  title,
  description,
  mobileSubtitle,
  children,
  formClassName = 'login-form',
}) {
  return (
    <div className="login-container" suppressHydrationWarning>
      
      {/* Panel izquierdo */}
      <div className="login-left" aria-hidden="true">
        <Image src="/logo.png" alt="" className="login-logo-img" width={250} height={60} unoptimized />
        <div className="login-left-content">
          <h1 className="login-title">{title}</h1>
          <p className="login-description">{description}</p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="login-right">
        <div className={formClassName}>
          <div className="login-logo-mobile">
            <Image src="/logo.png" alt="ReportARG" className="login-logo-mobile-img" width={180} height={40} unoptimized />
            {mobileSubtitle && (
              <p className="login-logo-mobile-subtitle">{mobileSubtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>

    </div>
  );
}
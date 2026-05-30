'use client';

import { useState } from 'react';
import { Card } from '@heroui/react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { UserIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

const accountTypes = [
  {
    id: 'citizen',
    label: 'Ciudadano',
    description:
      'Accede a servicios municipales, realiza reportes y mantenete informado sobre tu barrio.',
    Icon: UserIcon,
  },
  {
    id: 'institution',
    label: 'Institución',
    description:
      'Gestiona trámites para tu empresa, ONG o entidad pública con herramientas avanzadas.',
    Icon: BuildingOffice2Icon,
  },
];

function AccountTypeCard({ label, description, Icon, isSelected, onSelect }) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
      animate={{ scale: isSelected ? 1.01 : 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="w-full cursor-pointer text-left"
    >
      <Card
        radius="lg"
        shadow="none"
        className={`
          relative rounded-[2rem] border-2
          px-5 py-6 min-h-[178px]
          transition-all duration-200
          ${
            isSelected
              ? 'border-[rgb(var(--azul))] bg-[#e8ebf8] shadow-[0_2px_8px_rgba(30,58,138,0.12)]'
              : 'border-transparent bg-[#e9e9f2] hover:border-[#c6d2ff]'
          }
        `}
      >
          {/* Indicador de selección */}
          <div
            className={`
              absolute top-4 right-4 w-5 h-5 rounded-full border-2
              flex items-center justify-center transition-all duration-200
              ${
                isSelected
                  ? 'bg-[rgb(var(--azul))] border-[rgb(var(--azul))]'
                  : 'bg-transparent border-[#b6b9ca]'
              }
            `}
          >
            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>

          {/* Ícono */}
          <div className="w-11 h-11 rounded-full bg-[#c9d7ff] text-[rgb(var(--azul))] flex items-center justify-center mb-4">
            <Icon className="w-6 h-6" aria-hidden />
          </div>

          <h3 className="font-semibold text-[#1f232b] text-2xl mb-2 leading-tight">
            {label}
          </h3>
          <p className="text-sm text-[#4f5663] leading-relaxed">
            {description}
          </p>
      </Card>
    </motion.button>
  );
}

function AccountTypeOptions({ options, onContinue }) {
  const [selected, setSelected] = useState(null);
  const [showSelectionWarning, setShowSelectionWarning] = useState(false);

  const handleContinue = () => {
    if (!selected) {
      setShowSelectionWarning(true);
      return;
    }
    setShowSelectionWarning(false);
    onContinue?.(selected);
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
      >
        {options.map((type) => (
          <AccountTypeCard
            key={type.id}
            {...type}
            isSelected={selected === type.id}
            onSelect={() => {
              setSelected(type.id);
              setShowSelectionWarning(false);
            }}
          />
        ))}
      </motion.div>

      <button
        type="button"
        onClick={handleContinue}
        className="btn-primary mt-10"
        style={{ maxWidth: '280px' }}
      >
        Continuar →
      </button>

      {showSelectionWarning && (
        <p className="text-red-500 text-sm mt-4 font-medium">
          Antes de continuar, elegí un tipo de cuenta.
        </p>
      )}
    </div>
  );
}

import StepIndicator from '@/components/ui/StepIndicator';

export default function AccountTypeSelector() {
  const router = useRouter();

  const handleContinue = (selectedType) => {
    if (selectedType === 'citizen') router.push('/register/citizen');
    if (selectedType === 'institution') router.push('/register/institution');
  };

  return (
    <div className="auth-page min-h-screen">

      {/* Navbar */}
      <nav className="auth-navbar h-16 sm:h-20 w-full px-6 sm:px-10 flex items-center justify-between">
        <img src="/logo.png" alt="ReportARG" className="login-logo-img" />
        <div className="auth-link-muted text-sm">
          <span>¿Ya tenés cuenta? </span>
          <a href="/login" className="brand-text font-semibold hover:underline">
            Iniciar Sesión
          </a>
        </div>
      </nav>

      <main
        className="
          min-h-screen flex flex-col items-center justify-center
          px-6 sm:px-10
          pt-20 pb-24
        "
      >
        <div className="w-full max-w-[860px]">

          <div className="mb-8 scale-110">
            <StepIndicator currentStep={1} />
          </div>

          {/* Encabezado */}
          <div className="text-center mb-2">
            <h1 className="auth-heading text-4xl sm:text-5xl font-semibold tracking-tight">
              Elegí tu tipo de cuenta
            </h1>
            <p className="auth-copy mt-4 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Seleccioná el perfil que mejor se adapte a tus necesidades
              para comenzar a usar la plataforma.
            </p>
          </div>

          {/* Cards + botón */}
          <AccountTypeOptions options={accountTypes} onContinue={handleContinue} />

        </div>
      </main>

      {/* Footer */}
      <footer className="auth-footer-text fixed bottom-0 left-0 right-0 px-6 sm:px-10 py-3 text-xs uppercase tracking-widest flex items-center justify-between">
        <div className="flex gap-4 sm:gap-6">
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="#">Ayuda</a>
        </div>
        <span>© 2026 REPORTARG</span>
      </footer>

    </div>
  );
}
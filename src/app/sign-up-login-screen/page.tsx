import React from 'react';
import LoginForm from './components/LoginForm';

export default function SignUpLoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-primary p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a5 5 0 1 0 5 5" />
              <path d="M9 9c0 1.5.8 2.8 2 3.5" />
              <path d="M11 13c0 1 .3 2 1 2.7" />
              <path d="M12 16a1 1 0 0 1 0 2" />
              <path d="M8 7c0 2.2 1.8 4 4 4" />
            </svg>
          </div>
          <div>
            <p className="text-white font-800 text-lg tracking-tight">SCBARH</p>
            <p className="text-white/60 text-xs">Sistema Biométrico de RH</p>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative">
          {/* Fingerprint illustration */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-40 h-40">
              {[0, 1, 2, 3, 4, 5]?.map((i) => (
                <div
                  key={`ring-${i}`}
                  className="absolute inset-0 rounded-full border-2 border-white/20"
                  style={{
                    transform: `scale(${0.3 + i * 0.13})`,
                    borderWidth: i === 2 ? '3px' : '2px',
                    borderColor: i === 2 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
                    <path d="M5 19.5C5.5 18 6 15 6 12c0-3 2-5.5 6-5.5 3.5 0 5.5 2.5 5.5 5.5 0 1.5-.5 3-1 4" />
                    <path d="M9 12c0 1.5.5 3 1.5 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-white text-hero-xl font-800 leading-tight mb-4">
            Controlo Biométrico<br />de Assiduidade
          </h1>
          <p className="text-white/70 text-sm leading-relaxed mb-6">
            Automatize o registo de presença, controlo de assiduidade e processamento salarial
            com autenticação biométrica de alta precisão.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Leitura biométrica', value: '< 3 seg' },
              { label: 'Disponibilidade', value: '99%' },
              { label: 'Funcionários suportados', value: '5.000+' },
              { label: 'Precisão biométrica', value: '99.8%' },
            ]?.map((stat) => (
              <div key={`stat-${stat?.label}`} className="bg-white/10 rounded-lg p-3">
                <p className="text-white font-700 text-base font-tabular">{stat?.value}</p>
                <p className="text-white/60 text-[11px] mt-0.5">{stat?.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-white/40 text-[11px]">
            © 2026 SCBARH — Grupo 01 · Estágio Profissional
          </p>
        </div>
      </div>
      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 lg:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a5 5 0 1 0 5 5" />
                <path d="M9 9c0 1.5.8 2.8 2 3.5" />
              </svg>
            </div>
            <div>
              <p className="font-800 text-base text-primary">SCBARH</p>
              <p className="text-xs text-muted-foreground">Sistema Biométrico de RH</p>
            </div>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
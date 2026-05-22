'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

const demoCredentials = [
  { role: 'Super Administrador', email: 'superadmin@scbarh.ao', password: 'ScbAdmin@2026' },
  { role: 'Administrador', email: 'admin@scbarh.ao', password: 'Admin@2026' },
  { role: 'RH', email: 'rh@scbarh.ao', password: 'RhScb@2026' },
  { role: 'Supervisor', email: 'supervisor@scbarh.ao', password: 'Supv@2026' },
];

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError('');
    setIsLoading(true);

    // Backend integration point — replace with actual auth API call
    await new Promise((res) => setTimeout(res, 1200));

    const valid = demoCredentials.find(
      (c) => c.email === data.email && c.password === data.password,
    );

    if (valid) {
      // Redirect to dashboard on success
      window.location.href = '/administrative-dashboard';
    } else {
      setLoginError('Credenciais inválidas — utilize as contas de demonstração abaixo para iniciar sessão.');
    }
    setIsLoading(false);
  };

  const autofill = (cred: typeof demoCredentials[0]) => {
    setValue('email', cred.email);
    setValue('password', cred.password);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="slide-up">
      <div className="mb-7">
        <h2 className="text-2xl font-700 text-foreground mb-1.5">Iniciar Sessão</h2>
        <p className="text-sm text-muted-foreground">
          Aceda ao painel de gestão biométrica e recursos humanos.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-500 text-foreground mb-1.5">
            Endereço de E-mail
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon name="EnvelopeIcon" size={16} className="text-muted-foreground" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="utilizador@scbarh.ao"
              {...register('email', {
                required: 'O e-mail é obrigatório.',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato de e-mail inválido.' },
              })}
              className={[
                'w-full pl-9 pr-4 py-2.5 text-sm bg-input border rounded-lg outline-none transition-all',
                'placeholder:text-muted-foreground text-foreground',
                errors.email
                  ? 'border-danger focus:ring-2 focus:ring-danger/30' :'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
              ].join(' ')}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-danger flex items-center gap-1">
              <Icon name="ExclamationCircleIcon" size={12} />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="text-sm font-500 text-foreground">
              Palavra-passe
            </label>
            <button type="button" className="text-xs text-primary hover:underline font-500">
              Recuperar acesso
            </button>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon name="LockClosedIcon" size={16} className="text-muted-foreground" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password', {
                required: 'A palavra-passe é obrigatória.',
                minLength: { value: 6, message: 'Mínimo de 6 caracteres.' },
              })}
              className={[
                'w-full pl-9 pr-10 py-2.5 text-sm bg-input border rounded-lg outline-none transition-all',
                'placeholder:text-muted-foreground text-foreground',
                errors.password
                  ? 'border-danger focus:ring-2 focus:ring-danger/30' :'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
              ].join(' ')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
            >
              <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-danger flex items-center gap-1">
              <Icon name="ExclamationCircleIcon" size={12} />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            {...register('remember')}
            className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
          />
          <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
            Manter sessão iniciada
          </label>
        </div>

        {/* Login error */}
        {loginError && (
          <div className="flex items-start gap-2.5 bg-danger-bg border border-danger/20 rounded-lg px-4 py-3">
            <Icon name="ExclamationTriangleIcon" size={16} className="text-danger flex-shrink-0 mt-0.5" />
            <p className="text-xs text-danger leading-relaxed">{loginError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={[
            'w-full py-2.5 rounded-lg text-sm font-600 text-primary-foreground bg-primary',
            'hover:bg-primary/90 active:scale-[0.98] transition-all duration-150',
            'flex items-center justify-center gap-2',
            isLoading ? 'opacity-80 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {isLoading ? (
            <>
              <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
              <span>A autenticar...</span>
            </>
          ) : (
            <>
              <Icon name="ArrowRightOnRectangleIcon" size={16} />
              <span>Iniciar Sessão</span>
            </>
          )}
        </button>
      </form>

      {/* Demo credentials table */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted-foreground font-500 uppercase tracking-wider px-2">Contas de Demonstração</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-3 py-2 font-600 text-muted-foreground">Perfil</th>
                <th className="text-left px-3 py-2 font-600 text-muted-foreground hidden sm:table-cell">E-mail</th>
                <th className="text-center px-3 py-2 font-600 text-muted-foreground">Usar</th>
              </tr>
            </thead>
            <tbody>
              {demoCredentials.map((cred, idx) => (
                <tr
                  key={`cred-${cred.role}`}
                  className={['border-b border-border last:border-0 hover:bg-primary/5 transition-colors', idx % 2 === 0 ? '' : 'bg-muted/20'].join(' ')}
                >
                  <td className="px-3 py-2">
                    <span className="font-500 text-foreground">{cred.role}</span>
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground font-tabular truncate max-w-[160px]">{cred.email}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(cred.email, `email-${idx}`)}
                        className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                        title="Copiar e-mail"
                      >
                        <Icon name={copiedField === `email-${idx}` ? 'CheckIcon' : 'ClipboardIcon'} size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => autofill(cred)}
                      className="inline-flex items-center gap-1 text-primary font-600 hover:bg-primary/10 px-2 py-0.5 rounded transition-colors"
                    >
                      <Icon name="ArrowUpTrayIcon" size={11} />
                      Preencher
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Clique em &quot;Preencher&quot; para pré-carregar as credenciais no formulário
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Problemas de acesso?{' '}
        <Link href="/administrative-dashboard" className="text-primary font-500 hover:underline">
          Contacte o administrador
        </Link>
      </p>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

const demoCredentials = [
  { role: 'Super Administrador (Real BD)', email: 'admin@scbarh.ao', password: 'admin123' },
  { role: 'Administrador (Demo)', email: 'admin_demo@scbarh.ao', password: 'Admin@2026' },
  { role: 'RH (Demo)', email: 'rh@scbarh.ao', password: 'RhScb@2026' },
  { role: 'Supervisor (Demo)', email: 'supervisor@scbarh.ao', password: 'Supv@2026' },
];

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { login } = useAuth();

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

    try {
      // Tentar autenticar com a API real
      await login(data.email, data.password);
      window.location.href = '/administrative-dashboard';
    } catch (err) {
      console.warn('Falha na autenticação via API backend:', err);

      if (err instanceof ApiError && err.status !== 0) {
        // Erro retornado pela própria API (ex: 401 Credenciais inválidas, ou 403 Inativo)
        setLoginError(err.message);
        setIsLoading(false);
        return;
      }

      // Se a API estiver offline (status === 0), fazemos fallback elegante para Modo Demo Offline
      const offlineValid = demoCredentials.find(
        (c) => c.email === data.email && c.password === data.password,
      );

      if (offlineValid) {
        // Simular login offline guardando informações fictícias
        localStorage.setItem('scbarh_token', 'offline-demo-token');
        localStorage.setItem(
          'scbarh_demo_user',
          JSON.stringify({
            id: 9999,
            nome: offlineValid.role.includes('Super')
              ? 'Super Administrador (Offline)'
              : offlineValid.role.includes('RH')
                ? 'Responsável de Recursos Humanos'
                : 'Supervisor de Secção',
            email: offlineValid.email,
            role: offlineValid.role.includes('Super')
              ? 'SUPER_ADMIN'
              : offlineValid.role.includes('RH')
                ? 'ADMIN_RH'
                : 'GESTOR',
            ativo: true,
          }),
        );

        // Pequeno feedback visual para o utilizador saber que entrou em modo offline
        setLoginError('Servidor offline — Iniciando sessão em Modo de Demonstração...');
        setTimeout(() => {
          window.location.href = '/administrative-dashboard';
        }, 1200);
      } else {
        setLoginError(
          'Não foi possível estabelecer ligação com a API do servidor e estas credenciais não correspondem a nenhuma conta demo local offline. ' +
          'Por favor utilize o botão "Preencher" abaixo para testar as credenciais padrão.'
        );
        setIsLoading(false);
      }
    }
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

      <p className="text-center text-xs text-muted-foreground mt-6">
        Problemas de acesso?{' '}
        <Link href="/administrative-dashboard" className="text-primary font-500 hover:underline">
          Contacte o administrador
        </Link>
      </p>
    </div>
  );
}
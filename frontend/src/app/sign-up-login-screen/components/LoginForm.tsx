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

      {/* Secção de Credenciais de Demonstração / Teste */}
      <div className="mt-8 pt-6 border-t border-border/80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-700 text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="SparklesIcon" size={13} className="text-primary animate-pulse" />
            Acesso de Teste & Demo
          </h3>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-500">
            Clique para Preencher
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {demoCredentials.map((cred) => {
            const isCopiedEmail = copiedField === `${cred.email}-email`;
            const isCopiedPass = copiedField === `${cred.email}-pass`;
            const isRealBD = cred.role.includes('Real BD');
            
            return (
              <div
                key={cred.email}
                onClick={() => autofill(cred)}
                className={[
                  'group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none text-left',
                  isRealBD 
                    ? 'bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/40' 
                    : 'bg-card hover:bg-muted/50 border-border hover:border-border-hover'
                ].join(' ')}
              >
                {/* Role badge */}
                <div className="flex justify-between items-start gap-1 mb-1">
                  <span className={[
                    'text-[10px] font-700 px-1.5 py-0.5 rounded',
                    isRealBD ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  ].join(' ')}>
                    {cred.role}
                  </span>
                  
                  {/* Clipboard copy actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      title="Copiar E-mail"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(cred.email, `${cred.email}-email`);
                      }}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background transition-all"
                    >
                      <Icon name={isCopiedEmail ? 'CheckIcon' : 'EnvelopeIcon'} size={11} className={isCopiedEmail ? 'text-success' : ''} />
                    </button>
                    <button
                      type="button"
                      title="Copiar Palavra-passe"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(cred.password, `${cred.email}-pass`);
                      }}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background transition-all"
                    >
                      <Icon name={isCopiedPass ? 'CheckIcon' : 'KeyIcon'} size={11} className={isCopiedPass ? 'text-success' : ''} />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-600 text-foreground truncate">{cred.email}</p>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground font-mono">
                  <span>Senha:</span>
                  <span className="bg-background px-1.5 py-0.5 rounded border border-border/40 group-hover:border-border transition-colors">
                    {cred.password}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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
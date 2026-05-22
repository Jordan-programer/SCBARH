'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN_RH' | 'GESTOR' | 'PORTEIRO' | 'FUNCIONARIO';

export interface User {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
  funcionario_id?: number | null;
  morador_id?: number | null;
}

export function getRoleLabel(role?: UserRole): string {
  if (!role) return 'Utilizador';
  const labels: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Administrador',
    ADMIN_RH: 'Administrador de RH',
    GESTOR: 'Gestor / Diretor',
    PORTEIRO: 'Porteiro / Segurança',
    FUNCIONARIO: 'Funcionário',
  };
  return labels[role] || role;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha_hash: string) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserProfile = useCallback(async (authToken: string) => {
    try {
      const profile = await api.get<User>('/usuarios/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUser(profile);
    } catch (err) {
      console.error('Falha ao carregar perfil do utilizador:', err);
      // Se der erro de autenticação (ex: token expirado), faz logout
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        localStorage.removeItem('scbarh_token');
        localStorage.removeItem('scbarh_refresh_token');
        setUser(null);
        setToken(null);
      }
    }
  }, []);

  // Restaurar sessão na montagem
  useEffect(() => {
    async function restoreSession() {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('scbarh_token');
        if (storedToken) {
          setToken(storedToken);
          if (storedToken === 'offline-demo-token') {
            const demoUserJson = localStorage.getItem('scbarh_demo_user');
            if (demoUserJson) {
              setUser(JSON.parse(demoUserJson));
            }
          } else {
            await fetchUserProfile(storedToken);
          }
        }
      }
      setLoading(false);
    }
    restoreSession();
  }, [fetchUserProfile]);

  const login = async (email: string, senha_hash: string): Promise<User> => {
    setLoading(true);
    try {
      // Backend expects LoginRequest: { email: string, senha: string }
      const data = await api.post<TokenResponse>('/auth/login', {
        email,
        senha: senha_hash,
      });

      localStorage.setItem('scbarh_token', data.access_token);
      localStorage.setItem('scbarh_refresh_token', data.refresh_token);
      setToken(data.access_token);

      // Carregar os dados reais do utilizador recém-logado
      const profile = await api.get<User>('/usuarios/me', {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      setUser(profile);
      setLoading(false);
      return profile;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('scbarh_token');
    localStorage.removeItem('scbarh_refresh_token');
    localStorage.removeItem('scbarh_demo_user');
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const refreshProfile = async () => {
    const currentToken = token || localStorage.getItem('scbarh_token');
    if (currentToken) {
      await fetchUserProfile(currentToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

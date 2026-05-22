'use client';

import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useAuth, getRoleLabel } from '@/context/AuthContext';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
  group: string;
}

const navItems: NavItem[] = [
  { key: 'nav-dashboard', label: 'Dashboard', href: '/administrative-dashboard', icon: 'ChartBarSquareIcon', group: 'Principal' },
  { key: 'nav-employees', label: 'Funcionários', href: '/employee-management', icon: 'UsersIcon', group: 'Recursos Humanos' },
  { key: 'nav-rh', label: 'Recursos Humanos', href: '/recursos-humanos', icon: 'UserGroupIcon', group: 'Recursos Humanos' },
  { key: 'nav-attendance', label: 'Assiduidade', href: '/assiduidade', icon: 'ClipboardDocumentCheckIcon', badge: 3, group: 'Recursos Humanos' },
  { key: 'nav-schedules', label: 'Horários', href: '/horarios', icon: 'CalendarDaysIcon', group: 'Recursos Humanos' },
  { key: 'nav-payroll', label: 'Processamento Salarial', href: '/processamento-salarial', icon: 'BanknotesIcon', group: 'Financeiro' },
  { key: 'nav-biometric', label: 'Dispositivos Biométricos', href: '/dispositivos-biometricos', icon: 'FingerPrintIcon', badge: 1, group: 'Biométrico' },
  { key: 'nav-reports', label: 'Relatórios', href: '/relatorios', icon: 'DocumentChartBarIcon', group: 'Análise' },
  { key: 'nav-notifications', label: 'Notificações', href: '/notificacoes', icon: 'BellAlertIcon', badge: 5, group: 'Análise' },
  { key: 'nav-audit', label: 'Logs de Auditoria', href: '/auditoria', icon: 'ShieldCheckIcon', group: 'Segurança' },
  { key: 'nav-settings', label: 'Configurações', href: '/configuracoes', icon: 'Cog6ToothIcon', group: 'Sistema' },
];

const groupOrder = ['Principal', 'Recursos Humanos', 'Financeiro', 'Biométrico', 'Análise', 'Segurança', 'Sistema'];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  currentPath: string;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, currentPath, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const initials = user?.nome
    ? user.nome.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const isGestor = user?.role === 'GESTOR';

  const filteredNavItems = navItems
    .filter((item) => {
      if (isGestor) {
        // Excluir menus de administração sensíveis
        if (
          item.group === 'Financeiro' ||
          item.group === 'Biométrico' ||
          item.group === 'Segurança' ||
          item.group === 'Sistema'
        ) {
          return false;
        }
      }
      return true;
    })
    .map((item) => {
      if (isGestor) {
        if (item.key === 'nav-dashboard') {
          return { ...item, label: 'Dashboard da Equipa' };
        }
        if (item.key === 'nav-employees') {
          return { ...item, label: 'Minha Equipa' };
        }
        if (item.key === 'nav-rh') {
          return { ...item, label: 'Férias da Equipa' };
        }
        if (item.key === 'nav-attendance') {
          return { ...item, label: 'Assiduidade da Equipa' };
        }
        if (item.key === 'nav-schedules') {
          return { ...item, label: 'Escalas de Trabalho' };
        }
      }
      return item;
    });

  const grouped = groupOrder.map((group) => ({
    group,
    items: filteredNavItems.filter((item) => item.group === group),
  })).filter((g) => g.items.length > 0);

  const isActive = (item: NavItem) => currentPath === item.href;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 h-full z-40 bg-card border-r border-border shadow-sidebar sidebar-transition flex-col hidden lg:flex',
          collapsed ? 'w-16' : 'w-60',
        ].join(' ')}
      >
        {/* Logo area */}
        <div className={['flex items-center border-b border-border', collapsed ? 'justify-center px-3 py-4' : 'px-4 py-4 gap-3'].join(' ')}>
          <AppLogo size={32} />
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-bold text-sm text-primary tracking-tight block">SCBARH</span>
              <span className="text-[10px] text-muted-foreground leading-tight block truncate">Controlo Biométrico RH</span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
          {grouped.map(({ group, items }) => (
            <div key={`group-${group}`} className="mb-1">
              {!collapsed && (
                <p className="px-4 py-1.5 text-[10px] font-600 uppercase tracking-widest text-muted-foreground">
                  {group}
                </p>
              )}
              {collapsed && <div className="mx-2 my-1 border-t border-border" />}
              {items.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={[
                    'flex items-center gap-3 mx-2 px-2 py-2 rounded-md text-sm font-500 transition-all duration-150 group relative',
                    isActive(item)
                      ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    collapsed ? 'justify-center' : '',
                  ].join(' ')}
                >
                  <Icon
                    name={item.icon as Parameters<typeof Icon>[0]['name']}
                    size={18}
                    variant={isActive(item) ? 'solid' : 'outline'}
                    className="flex-shrink-0"
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="ml-auto bg-danger text-white text-[10px] font-700 rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.badge !== undefined && (
                    <span className="absolute top-0.5 right-0.5 bg-danger text-white text-[9px] font-700 rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className={['border-t border-border p-3 flex items-center gap-3', collapsed ? 'justify-center' : ''].join(' ')}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-700">{initials}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-600 text-foreground truncate">{user?.nome || 'Utilizador'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{getRoleLabel(user?.role)}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} title="Terminar Sessão" className="flex items-center justify-center focus:outline-none">
              <Icon name="ArrowRightOnRectangleIcon" size={16} className="text-muted-foreground hover:text-danger transition-colors" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 h-full z-40 bg-card border-r border-border shadow-sidebar flex flex-col lg:hidden w-60 sidebar-transition',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <AppLogo size={32} />
            <div>
              <span className="font-bold text-sm text-primary tracking-tight block">SCBARH</span>
              <span className="text-[10px] text-muted-foreground block">Controlo Biométrico RH</span>
            </div>
          </div>
          <button onClick={onMobileClose} className="p-1 rounded hover:bg-muted transition-colors">
            <Icon name="XMarkIcon" size={18} className="text-muted-foreground" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
          {grouped.map(({ group, items }) => (
            <div key={`mobile-group-${group}`} className="mb-1">
              <p className="px-4 py-1.5 text-[10px] font-600 uppercase tracking-widest text-muted-foreground">{group}</p>
              {items.map((item) => (
                <Link
                  key={`mobile-${item.key}`}
                  href={item.href}
                  onClick={onMobileClose}
                  className={[
                    'flex items-center gap-3 mx-2 px-2 py-2 rounded-md text-sm font-500 transition-all duration-150',
                    isActive(item)
                      ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  ].join(' ')}
                >
                  <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={18} variant={isActive(item) ? 'solid' : 'outline'} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="bg-danger text-white text-[10px] font-700 rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-700">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-600 text-foreground truncate">{user?.nome || 'Utilizador'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{getRoleLabel(user?.role)}</p>
          </div>
          <button onClick={logout} title="Terminar Sessão" className="flex items-center justify-center focus:outline-none">
            <Icon name="ArrowRightOnRectangleIcon" size={16} className="text-muted-foreground hover:text-danger transition-colors" />
          </button>
        </div>
      </aside>
    </>
  );
}
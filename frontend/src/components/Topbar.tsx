'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth, getRoleLabel } from '@/context/AuthContext';

interface TopbarProps {
  onMenuClick: () => void;
  collapsed: boolean;
}

const notifications = [
  { id: 'notif-001', type: 'absence', message: 'Carlos Teixeira ausente sem justificação', time: '08:32', unread: true },
  { id: 'notif-002', type: 'biometric', message: 'Falha biométrica no dispositivo BIO-03', time: '08:15', unread: true },
  { id: 'notif-003', type: 'late', message: '4 funcionários com atraso superior a 30min', time: '08:05', unread: true },
  { id: 'notif-004', type: 'sync', message: 'Sincronização concluída — 48 registos', time: '07:58', unread: false },
  { id: 'notif-005', type: 'payroll', message: 'Folha salarial de Maio pronta para aprovação', time: '07:30', unread: false },
];

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const { user } = useAuth();

  const initials = user?.nome
    ? user.nome.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';
  const unreadCount = notifications.filter((n) => n.unread).length;

  const notifIcon = (type: string) => {
    switch (type) {
      case 'absence': return 'UserMinusIcon';
      case 'biometric': return 'FingerPrintIcon';
      case 'late': return 'ClockIcon';
      case 'sync': return 'ArrowPathIcon';
      case 'payroll': return 'BanknotesIcon';
      default: return 'BellIcon';
    }
  };

  const notifColor = (type: string) => {
    switch (type) {
      case 'absence': return 'text-danger';
      case 'biometric': return 'text-warning';
      case 'late': return 'text-accent';
      case 'sync': return 'text-info';
      case 'payroll': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-4 gap-4 flex-shrink-0 relative z-20">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-md hover:bg-muted transition-colors active:scale-95"
        aria-label="Alternar menu lateral"
      >
        <Icon name="Bars3Icon" size={20} className="text-muted-foreground" />
      </button>

      {/* Breadcrumb / page context */}
      <div className="hidden sm:flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">SCBARH</span>
        <Icon name="ChevronRightIcon" size={14} className="text-muted-foreground" />
        <span className="font-600 text-foreground">Painel Administrativo</span>
      </div>

      <div className="flex-1" />

      {/* Last sync indicator */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-success-bg px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
        <span>Sincronizado às 08:45</span>
      </div>

      {/* Date */}
      <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon name="CalendarDaysIcon" size={14} />
        <span>21/05/2026</span>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 rounded-md hover:bg-muted transition-colors active:scale-95"
          aria-label="Notificações"
        >
          <Icon name="BellIcon" size={20} className="text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[9px] font-700 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-modal z-20 scale-in overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-600 text-foreground">Notificações</span>
                <span className="text-xs text-primary font-500 cursor-pointer hover:underline">Marcar todas como lidas</span>
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={['flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer', n.unread ? 'bg-primary/5' : ''].join(' ')}
                  >
                    <div className={['mt-0.5 flex-shrink-0', notifColor(n.type)].join(' ')}>
                      <Icon name={notifIcon(n.type) as Parameters<typeof Icon>[0]['name']} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-500 text-foreground leading-tight">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                    {n.unread && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <button className="text-xs text-primary font-500 hover:underline w-full text-center">Ver todas as notificações</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User avatar */}
      <div className="flex items-center gap-2 pl-2 border-l border-border">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-xs font-700">{initials}</span>
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-600 text-foreground leading-tight">{user?.nome || 'Utilizador'}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{getRoleLabel(user?.role)}</p>
        </div>
      </div>
    </header>
  );
}
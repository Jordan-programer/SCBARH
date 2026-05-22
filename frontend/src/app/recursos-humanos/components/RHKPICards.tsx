'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface KPICard {
  label: string;
  value: string;
  sub: string;
  icon: string;
  color: string;
  bgColor: string;
  trend?: { value: string; up: boolean };
}

const kpis: KPICard[] = [
  {
    label: 'Total de Funcionários',
    value: '127',
    sub: '112 activos · 15 inativos',
    icon: 'UsersIcon',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    trend: { value: '+3 este mês', up: true },
  },
  {
    label: 'Contratos Activos',
    value: '112',
    sub: '8 a expirar em 30 dias',
    icon: 'DocumentTextIcon',
    color: 'text-success',
    bgColor: 'bg-success/10',
    trend: { value: '8 a renovar', up: false },
  },
  {
    label: 'Pedidos de Férias',
    value: '4',
    sub: 'Aguardam aprovação',
    icon: 'CalendarDaysIcon',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    trend: { value: '2 urgentes', up: false },
  },
  {
    label: 'Novos Admitidos',
    value: '3',
    sub: 'Nos últimos 30 dias',
    icon: 'UserPlusIcon',
    color: 'text-info',
    bgColor: 'bg-info/10',
    trend: { value: 'Este mês', up: true },
  },
  {
    label: 'Taxa de Retenção',
    value: '94,5%',
    sub: 'Últimos 12 meses',
    icon: 'ArrowTrendingUpIcon',
    color: 'text-success',
    bgColor: 'bg-success/10',
    trend: { value: '+1,2% vs ano anterior', up: true },
  },
  {
    label: 'Média Salarial',
    value: '412.500 Kz',
    sub: 'Todos os departamentos',
    icon: 'BanknotesIcon',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    trend: { value: '+5% vs 2025', up: true },
  },
];

const departmentStats = [
  { nome: 'TI', total: 24, ativos: 22, ferias: 1, cor: 'bg-primary' },
  { nome: 'Financeiro', total: 18, ativos: 17, ferias: 0, cor: 'bg-success' },
  { nome: 'Operações', total: 35, ativos: 31, ferias: 2, cor: 'bg-warning' },
  { nome: 'RH', total: 8, ativos: 8, ferias: 1, cor: 'bg-info' },
  { nome: 'Comercial', total: 22, ativos: 20, ferias: 0, cor: 'bg-primary' },
  { nome: 'Logística', total: 14, ativos: 12, ferias: 0, cor: 'bg-danger' },
  { nome: 'Suporte', total: 6, ativos: 6, ferias: 0, cor: 'bg-success' },
];

const recentActivities = [
  { tipo: 'admissao', desc: 'Novo funcionário admitido: Sónia Pereira (TI)', hora: 'Hoje, 09:14', icon: 'UserPlusIcon', cor: 'text-success' },
  { tipo: 'contrato', desc: 'Contrato renovado: Domingos Ferreira Lopes', hora: 'Hoje, 08:30', icon: 'DocumentCheckIcon', cor: 'text-primary' },
  { tipo: 'ferias', desc: 'Pedido de férias aprovado: Carlos Teixeira (Jul 14–28)', hora: 'Ontem, 16:45', icon: 'CalendarDaysIcon', cor: 'text-info' },
  { tipo: 'saida', desc: 'Funcionário desligado: Rui Mendes (Logística)', hora: 'Ontem, 14:20', icon: 'UserMinusIcon', cor: 'text-danger' },
  { tipo: 'promocao', desc: 'Promoção registada: Beatriz Matos → Gestora de RH', hora: '20 Mai, 11:00', icon: 'ArrowTrendingUpIcon', cor: 'text-warning' },
  { tipo: 'contrato', desc: 'Contrato a expirar em 15 dias: Pedro Alves', hora: '19 Mai, 09:00', icon: 'ExclamationTriangleIcon', cor: 'text-warning' },
];

export default function RHKPICards() {
  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={['w-10 h-10 rounded-lg flex items-center justify-center', kpi.bgColor].join(' ')}>
                <Icon name={kpi.icon as Parameters<typeof Icon>[0]['name']} size={20} className={kpi.color} />
              </div>
              {kpi.trend && (
                <span className={[
                  'text-xs font-500 px-2 py-0.5 rounded-full',
                  kpi.trend.up ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
                ].join(' ')}>
                  {kpi.trend.up ? '↑' : '↓'} {kpi.trend.value}
                </span>
              )}
            </div>
            <p className="text-2xl font-700 text-foreground font-tabular">{kpi.value}</p>
            <p className="text-sm font-500 text-foreground mt-0.5">{kpi.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Bottom row: Department stats + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Department breakdown */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-600 text-foreground">Distribuição por Departamento</h3>
            <span className="text-xs text-muted-foreground">127 funcionários</span>
          </div>
          <div className="space-y-3">
            {departmentStats.map((dept) => {
              const pct = Math.round((dept.ativos / 127) * 100);
              return (
                <div key={dept.nome}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={['w-2 h-2 rounded-full', dept.cor].join(' ')} />
                      <span className="text-sm text-foreground font-500">{dept.nome}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {dept.ferias > 0 && (
                        <span className="bg-warning/10 text-warning px-1.5 py-0.5 rounded font-500">
                          {dept.ferias} férias
                        </span>
                      )}
                      <span className="font-tabular">{dept.ativos}/{dept.total}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={['h-full rounded-full transition-all', dept.cor].join(' ')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-600 text-foreground">Actividade Recente</h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">Ver tudo</span>
          </div>
          <div className="space-y-3">
            {recentActivities.map((act, i) => (
              <div key={`act-${i}`} className="flex items-start gap-3">
                <div className={['w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5', act.cor].join(' ')}>
                  <Icon name={act.icon as Parameters<typeof Icon>[0]['name']} size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground leading-snug">{act.desc}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{act.hora}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

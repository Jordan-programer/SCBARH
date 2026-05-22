'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/context/AuthContext';

// Grid plan: 8 cards → grid-cols-4
// Row 1: Hero (taxa assiduidade, spans 2 cols) + 2 regular cards
// Row 2: 4 regular cards
// Total: 2 + 4 = 6 cells but hero spans 2, so: [hero(2) + card + card] + [4 cards] = 8 logical cards ✓

interface KPICardData {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  trend?: number;
  trendLabel?: string;
  icon: string;
  variant: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'hero';
  hero?: boolean;
}

const kpiCards: KPICardData[] = [
  {
    id: 'kpi-attendance',
    label: 'Taxa de Assiduidade',
    value: '92.4%',
    subValue: 'Meta: 95%',
    trend: -1.2,
    trendLabel: 'vs. ontem',
    icon: 'ChartBarSquareIcon',
    variant: 'hero',
    hero: true,
  },
  {
    id: 'kpi-absences',
    label: 'Faltas Hoje',
    value: '7',
    subValue: '3 sem justificação',
    trend: 3,
    trendLabel: 'vs. ontem',
    icon: 'UserMinusIcon',
    variant: 'danger',
  },
  {
    id: 'kpi-late',
    label: 'Atrasos Este Mês',
    value: '34',
    subValue: 'Média: 18 min',
    trend: 8,
    trendLabel: 'vs. mês anterior',
    icon: 'ClockIcon',
    variant: 'warning',
  },
  {
    id: 'kpi-overtime',
    label: 'Horas Extras Acumuladas',
    value: '186h',
    subValue: 'Kz 2.232.000 estimado',
    trend: 12,
    trendLabel: 'vs. mês anterior',
    icon: 'BoltIcon',
    variant: 'info',
  },
  {
    id: 'kpi-active',
    label: 'Funcionários Ativos',
    value: '124',
    subValue: '3 em licença',
    trend: 0,
    trendLabel: 'sem alteração',
    icon: 'UsersIcon',
    variant: 'default',
  },
  {
    id: 'kpi-biometric',
    label: 'Falhas Biométricas',
    value: '4',
    subValue: 'Dispositivo BIO-03',
    trend: 4,
    trendLabel: 'hoje',
    icon: 'FingerPrintIcon',
    variant: 'danger',
  },
  {
    id: 'kpi-payroll',
    label: 'Folha Salarial Estimada',
    value: 'Kz 58.4M',
    subValue: 'Inclui horas extras',
    trend: 2.1,
    trendLabel: 'vs. mês anterior',
    icon: 'BanknotesIcon',
    variant: 'success',
  },
  {
    id: 'kpi-early',
    label: 'Saídas Antecipadas',
    value: '11',
    subValue: 'Média: 22 min cedo',
    trend: -3,
    trendLabel: 'vs. semana passada',
    icon: 'ArrowLeftOnRectangleIcon',
    variant: 'warning',
  },
];

const variantConfig = {
  hero: {
    card: 'bg-primary text-primary-foreground border-primary/20',
    icon: 'bg-white/20 text-white',
    label: 'text-white/70',
    value: 'text-white',
    sub: 'text-white/60',
    trend: { positive: 'text-emerald-300 bg-emerald-900/30', negative: 'text-red-300 bg-red-900/30', neutral: 'text-white/60 bg-white/10' },
  },
  success: {
    card: 'bg-card border-border',
    icon: 'bg-success-bg text-success',
    label: 'text-muted-foreground',
    value: 'text-foreground',
    sub: 'text-muted-foreground',
    trend: { positive: 'text-success bg-success-bg', negative: 'text-danger bg-danger-bg', neutral: 'text-muted-foreground bg-muted' },
  },
  danger: {
    card: 'bg-danger-bg/40 border-danger/20',
    icon: 'bg-danger-bg text-danger',
    label: 'text-danger/70',
    value: 'text-danger',
    sub: 'text-danger/60',
    trend: { positive: 'text-success bg-success-bg', negative: 'text-danger bg-danger-bg', neutral: 'text-muted-foreground bg-muted' },
  },
  warning: {
    card: 'bg-card border-border',
    icon: 'bg-warning-bg text-warning',
    label: 'text-muted-foreground',
    value: 'text-foreground',
    sub: 'text-muted-foreground',
    trend: { positive: 'text-success bg-success-bg', negative: 'text-danger bg-danger-bg', neutral: 'text-muted-foreground bg-muted' },
  },
  info: {
    card: 'bg-card border-border',
    icon: 'bg-info-bg text-info',
    label: 'text-muted-foreground',
    value: 'text-foreground',
    sub: 'text-muted-foreground',
    trend: { positive: 'text-success bg-success-bg', negative: 'text-danger bg-danger-bg', neutral: 'text-muted-foreground bg-muted' },
  },
  default: {
    card: 'bg-card border-border',
    icon: 'bg-secondary text-primary',
    label: 'text-muted-foreground',
    value: 'text-foreground',
    sub: 'text-muted-foreground',
    trend: { positive: 'text-success bg-success-bg', negative: 'text-danger bg-danger-bg', neutral: 'text-muted-foreground bg-muted' },
  },
};

function TrendBadge({ trend, label, config }: { trend: number; label: string; config: typeof variantConfig['default']['trend'] }) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  const cls = isNeutral ? config.neutral : isPositive ? config.negative : config.positive;
  const arrow = isNeutral ? '→' : isPositive ? '↑' : '↓';
  return (
    <span className={['inline-flex items-center gap-1 text-[11px] font-500 px-1.5 py-0.5 rounded-full', cls].join(' ')}>
      {arrow} {Math.abs(trend)}{typeof trend === 'number' && !Number.isInteger(trend) ? '' : ''} {label}
    </span>
  );
}

export default function KPIBentoGrid() {
  const { user } = useAuth();
  const isGestor = user?.role === 'GESTOR';

  const cards: KPICardData[] = isGestor ? [
    {
      id: 'kpi-attendance',
      label: 'Taxa de Assiduidade da Equipa',
      value: '95.8%',
      subValue: 'Meta: 95%',
      trend: 1.2,
      trendLabel: 'vs. ontem',
      icon: 'ChartBarSquareIcon',
      variant: 'hero',
      hero: true,
    },
    {
      id: 'kpi-absences',
      label: 'Faltas Hoje (Equipa)',
      value: '0',
      subValue: 'Nenhuma falta hoje',
      trend: 0,
      trendLabel: 'sem faltas',
      icon: 'UserMinusIcon',
      variant: 'success',
    },
    {
      id: 'kpi-late',
      label: 'Atrasos da Equipa (Mês)',
      value: '2',
      subValue: 'Média: 5 min',
      trend: -1,
      trendLabel: 'vs. semana passada',
      icon: 'ClockIcon',
      variant: 'warning',
    },
    {
      id: 'kpi-overtime',
      label: 'Horas Extras da Equipa',
      value: '12h',
      subValue: 'Autorizadas esta semana',
      trend: 2,
      trendLabel: 'vs. semana anterior',
      icon: 'BoltIcon',
      variant: 'info',
    },
    {
      id: 'kpi-active',
      label: 'Membros na Equipa',
      value: '2',
      subValue: 'Operações (Ativos)',
      trend: 0,
      trendLabel: 'sem alteração',
      icon: 'UsersIcon',
      variant: 'default',
    },
    {
      id: 'kpi-ferias-pendentes',
      label: 'Férias Pendentes da Equipa',
      value: '1',
      subValue: 'Aguardando aprovação',
      trend: 1,
      trendLabel: 'esta semana',
      icon: 'CalendarDaysIcon',
      variant: 'warning',
    },
    {
      id: 'kpi-notificacoes-equipa',
      label: 'Alertas de Escala',
      value: '0',
      subValue: 'Escalas atualizadas',
      trend: 0,
      trendLabel: 'sem pendências',
      icon: 'BellAlertIcon',
      variant: 'success',
    },
    {
      id: 'kpi-early',
      label: 'Saídas Antecipadas',
      value: '0',
      subValue: 'Média da equipa',
      trend: 0,
      trendLabel: 'ótimo desempenho',
      icon: 'ArrowLeftOnRectangleIcon',
      variant: 'default',
    },
  ] : kpiCards;

  const heroCard = cards.find((c) => c.hero)!;
  const regularCards = cards.filter((c) => !c.hero);

  const renderCard = (card: KPICardData, extraClass = '') => {
    const cfg = variantConfig[card.variant];
    return (
      <div
        key={card.id}
        className={['rounded-xl border p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col gap-3', cfg.card, extraClass].join(' ')}
      >
        <div className="flex items-start justify-between">
          <div className={['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', cfg.icon].join(' ')}>
            <Icon name={card.icon as Parameters<typeof Icon>[0]['name']} size={18} variant="solid" />
          </div>
          {card.trend !== undefined && (
            <TrendBadge trend={card.trend} label={card.trendLabel || ''} config={cfg.trend} />
          )}
        </div>
        <div>
          <p className={['text-3xl font-700 font-tabular leading-none', cfg.value].join(' ')}>{card.value}</p>
          <p className={['text-[11px] font-500 uppercase tracking-wide mt-2', cfg.label].join(' ')}>{card.label}</p>
          {card.subValue && <p className={['text-xs mt-0.5', cfg.sub].join(' ')}>{card.subValue}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Row 1: Hero (2 cols) + 2 regular */}
      {renderCard(heroCard, 'sm:col-span-2 lg:col-span-2')}
      {regularCards.slice(0, 2).map((c) => renderCard(c))}
      {/* Row 2: 4 regular */}
      {regularCards.slice(2).map((c) => renderCard(c))}
    </div>
  );
}
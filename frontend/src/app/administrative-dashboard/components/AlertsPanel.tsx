import React from 'react';
import Icon from '@/components/ui/AppIcon';

// Backend integration point — replace with alerts API endpoint
const alerts = [
  {
    id: 'alert-001',
    severity: 'critical',
    title: 'Funcionários ausentes sem justificação',
    desc: 'Carlos Teixeira, Beatriz Matos, Pedro Alves — 3 faltas injustificadas hoje',
    time: '08:32',
    action: 'Ver funcionários',
  },
  {
    id: 'alert-002',
    severity: 'critical',
    title: 'Falha no dispositivo biométrico',
    desc: 'BIO-03 (Portaria Principal) — 4 falhas de leitura nas últimas 2 horas',
    time: '08:15',
    action: 'Ver dispositivo',
  },
  {
    id: 'alert-003',
    severity: 'warning',
    title: 'Excesso de atrasos — Dep. Operações',
    desc: '12 funcionários com atraso acumulado acima de 3h este mês',
    time: '08:00',
    action: 'Gerar relatório',
  },
  {
    id: 'alert-004',
    severity: 'warning',
    title: 'Folha salarial pendente de aprovação',
    desc: 'Processamento de Maio 2026 aguarda aprovação do Director de RH',
    time: '07:30',
    action: 'Aprovar folha',
  },
  {
    id: 'alert-005',
    severity: 'info',
    title: 'Sincronização biométrica concluída',
    desc: '124 funcionários sincronizados com sucesso — 0 erros',
    time: '07:00',
    action: 'Ver log',
  },
];

const severityConfig = {
  critical: {
    card: 'border-l-4 border-l-danger bg-danger-bg/30',
    icon: 'ExclamationCircleIcon',
    iconColor: 'text-danger',
    badge: 'bg-danger-bg text-danger',
    badgeLabel: 'Crítico',
  },
  warning: {
    card: 'border-l-4 border-l-warning bg-warning-bg/30',
    icon: 'ExclamationTriangleIcon',
    iconColor: 'text-warning',
    badge: 'bg-warning-bg text-warning',
    badgeLabel: 'Aviso',
  },
  info: {
    card: 'border-l-4 border-l-info bg-info-bg/30',
    icon: 'InformationCircleIcon',
    iconColor: 'text-info',
    badge: 'bg-info-bg text-info',
    badgeLabel: 'Info',
  },
};

export default function AlertsPanel() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-600 text-foreground">Alertas do Sistema</h3>
          <p className="text-xs text-muted-foreground mt-0.5">2 críticos · 2 avisos · 1 info</p>
        </div>
        <button className="text-xs text-primary font-500 hover:bg-primary/5 px-2 py-1 rounded transition-colors">
          Gerir alertas
        </button>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => {
          const cfg = severityConfig[alert.severity as keyof typeof severityConfig];
          return (
            <div key={alert.id} className={['rounded-lg p-3 transition-all hover:shadow-sm cursor-pointer', cfg.card].join(' ')}>
              <div className="flex items-start gap-2.5">
                <Icon name={cfg.icon as Parameters<typeof Icon>[0]['name']} size={15} className={['flex-shrink-0 mt-0.5', cfg.iconColor].join(' ')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-xs font-600 text-foreground">{alert.title}</p>
                    <span className={['text-[10px] font-500 px-1.5 py-0.5 rounded-full', cfg.badge].join(' ')}>
                      {cfg.badgeLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.desc}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-muted-foreground font-tabular">{alert.time}</span>
                    <button className="text-[11px] text-primary font-500 hover:underline">{alert.action} →</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
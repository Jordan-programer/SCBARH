import React from 'react';
import Icon from '@/components/ui/AppIcon';

// Backend integration point — replace with real-time biometric event stream (WebSocket or polling)
const biometricEvents = [
  { id: 'bio-evt-001', type: 'entrada', name: 'Amélia Rodrigues', dept: 'Financeiro', time: '08:47', status: 'ok' },
  { id: 'bio-evt-002', type: 'falha', name: 'Dispositivo BIO-03', dept: 'Operações', time: '08:43', status: 'error' },
  { id: 'bio-evt-003', type: 'entrada', name: 'Domingos Lopes', dept: 'TI', time: '08:41', status: 'late' },
  { id: 'bio-evt-004', type: 'saida', name: 'Filomena Neto', dept: 'RH', time: '08:38', status: 'ok' },
  { id: 'bio-evt-005', type: 'entrada', name: 'Hélder Cardoso', dept: 'Comercial', time: '08:35', status: 'ok' },
  { id: 'bio-evt-006', type: 'invalido', name: 'Tentativa não identificada', dept: 'Portaria', time: '08:31', status: 'error' },
  { id: 'bio-evt-007', type: 'entrada', name: 'Ivone Ferreira', dept: 'Logística', time: '08:28', status: 'ok' },
  { id: 'bio-evt-008', type: 'entrada', name: 'Jorge Sebastião', dept: 'Operações', time: '08:22', status: 'late' },
];

const eventConfig = {
  entrada: { icon: 'ArrowRightOnRectangleIcon', label: 'Entrada', color: 'text-success' },
  saida: { icon: 'ArrowLeftOnRectangleIcon', label: 'Saída', color: 'text-info' },
  falha: { icon: 'ExclamationTriangleIcon', label: 'Falha', color: 'text-danger' },
  invalido: { icon: 'ShieldExclamationIcon', label: 'Inválido', color: 'text-danger' },
};

const statusDot = {
  ok: 'bg-success',
  error: 'bg-danger',
  late: 'bg-warning',
};

export default function BiometricEventFeed() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-600 text-foreground">Eventos Biométricos</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Tempo real — hoje</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-success bg-success-bg px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
          Ao vivo
        </div>
      </div>

      <div className="space-y-1">
        {biometricEvents.map((evt) => {
          const cfg = eventConfig[evt.type as keyof typeof eventConfig];
          return (
            <div
              key={evt.id}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/40 transition-colors group"
            >
              <div className={['flex-shrink-0', cfg.color].join(' ')}>
                <Icon name={cfg.icon as Parameters<typeof Icon>[0]['name']} size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-500 text-foreground truncate">{evt.name}</p>
                  <span className={['w-1.5 h-1.5 rounded-full flex-shrink-0', statusDot[evt.status as keyof typeof statusDot]].join(' ')} />
                </div>
                <p className="text-[10px] text-muted-foreground">{evt.dept} · {cfg.label}</p>
              </div>
              <span className="text-[10px] font-tabular text-muted-foreground flex-shrink-0">{evt.time}</span>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-3 text-xs text-primary font-500 hover:bg-primary/5 py-2 rounded-lg transition-colors text-center">
        Ver todos os eventos →
      </button>
    </div>
  );
}
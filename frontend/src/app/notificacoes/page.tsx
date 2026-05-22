'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast, Toaster } from 'sonner';

interface AlertaNotificacao {
  id: string;
  titulo: string;
  mensagem: string;
  dataHora: string;
  severidade: 'critico' | 'alerta' | 'info';
  lido: boolean;
  categoria: 'biometria' | 'sistema' | 'rh';
  resolvido?: boolean;
}

const alertasIniciais: AlertaNotificacao[] = [
  { id: 'not-001', titulo: 'Terminal Portaria A Desconectado', mensagem: 'O leitor biométrico da Portaria Principal A perdeu a ligação IP. Verifique cabos de rede ou fornecimento de energia.', dataHora: '22 Mai 2026, 09:12', severidade: 'critico', lido: false, categoria: 'biometria', resolvido: false },
  { id: 'not-002', titulo: 'Duplo registo detetado', mensagem: 'O colaborador Hélder António Cardoso efetuou duas batidas consecutivas com intervalo inferior a 15 segundos na Portaria Principal A.', dataHora: '22 Mai 2026, 08:44', severidade: 'alerta', lido: false, categoria: 'biometria', resolvido: false },
  { id: 'not-003', titulo: 'Novo funcionário sem dados biométricos', mensagem: 'António Agostinho Neto (TI) foi inserido no sistema de Recursos Humanos, mas não possui nenhuma impressão digital ou cartão RFID configurado.', dataHora: '21 Mai 2026, 17:30', severidade: 'info', lido: true, categoria: 'rh', resolvido: true },
  { id: 'not-004', titulo: 'Sincronização de relógio falhou', mensagem: 'O terminal Acesso Refeitório não conseguiu sincronizar o relógio interno via servidor NTP da rede local.', dataHora: '21 Mai 2026, 12:00', severidade: 'critico', lido: false, categoria: 'sistema', resolvido: false },
  { id: 'not-005', titulo: 'Exclusão de registo de ponto solicitada', mensagem: 'Supervisor solicitou a retificação manual do registo de saída do dia 19 Mai de Carlos Eduardo Teixeira.', dataHora: '20 Mai 2026, 15:22', severidade: 'alerta', lido: true, categoria: 'rh', resolvido: false },
];

export default function NotificacoesPage() {
  const [alertas, setAlertas] = useState<AlertaNotificacao[]>(alertasIniciais);
  const [filtroSeveridade, setFiltroSeveridade] = useState<'todos' | 'critico' | 'alerta' | 'info'>('todos');
  const [alertaExpandido, setAlertaExpandido] = useState<string | null>(null);

  const handleMarcarTodosLidos = () => {
    setAlertas(prev => prev.map(a => ({ ...a, lido: true })));
    toast.success('Todas as notificações foram marcadas como lidas.');
  };

  const handleMarcarLido = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a));
    toast.success('Notificação marcada como lida.');
  };

  const handleResolverAnomalia = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, resolvido: true, lido: true } : a));
    toast.success('Incidente resolvido!', {
      description: 'Estado da anomalia alterado para corrigido nos registos de auditoria.',
    });
  };

  const alertasFiltrados = filtroSeveridade === 'todos' 
    ? alertas 
    : alertas.filter(a => a.severidade === filtroSeveridade);

  const porLeler = alertas.filter(a => !a.lido).length;

  return (
    <AppLayout currentPath="/notificacoes">
      <Toaster position="bottom-right" richColors />

      <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-6 xl:px-8 2xl:px-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="BellAlertIcon" size={18} className="text-primary" />
              </div>
              <h1 className="text-2xl font-700 text-foreground">Caixa de Alertas & Notificações</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Acompanhe falhas de terminais físicos, incoerências de escalas de colaboradores e logs críticos de auditoria.
            </p>
          </div>
          {porLeler > 0 && (
            <button 
              onClick={handleMarcarTodosLidos}
              className="flex items-center justify-center gap-2 border border-border hover:bg-muted text-foreground font-600 rounded-lg px-4 py-2.5 text-sm active:scale-[0.98] transition-all"
            >
              <Icon name="CheckIcon" size={15} />
              <span>Marcar tudo como lido</span>
            </button>
          )}
        </div>

        {/* Filters and Unread Alert */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['todos', 'critico', 'alerta', 'info'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFiltroSeveridade(sev)}
                className={[
                  'px-3 py-1.5 text-xs font-600 rounded-lg capitalize transition-all',
                  filtroSeveridade === sev 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                ].join(' ')}
              >
                {sev === 'todos' ? 'Ver Todos' : sev}
              </button>
            ))}
          </div>
          
          {porLeler > 0 && (
            <span className="text-xs font-700 bg-danger/10 text-danger px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-danger" />
              {porLeler} {porLeler === 1 ? 'notificação não lida' : 'notificações não lidas'}
            </span>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="divide-y divide-border">
            {alertasFiltrados.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm font-500">
                Nenhuma notificação encontrada com o filtro selecionado.
              </div>
            ) : (
              alertasFiltrados.map((not) => {
                const isExpanded = alertaExpandido === not.id;

                const getSeverityIcon = () => {
                  switch (not.severidade) {
                    case 'critico': return { icon: 'XCircleIcon', color: 'text-danger bg-danger/10' };
                    case 'alerta': return { icon: 'ExclamationTriangleIcon', color: 'text-warning bg-warning/10' };
                    case 'info': return { icon: 'InformationCircleIcon', color: 'text-info bg-info/10' };
                  }
                };
                const sevMeta = getSeverityIcon();

                return (
                  <div 
                    key={not.id}
                    onClick={() => setAlertaExpandido(isExpanded ? null : not.id)}
                    className={[
                      'p-4 transition-all hover:bg-muted/10 cursor-pointer flex flex-col gap-3',
                      not.lido ? 'opacity-75' : 'bg-primary/[0.02] border-l-2 border-l-primary'
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex items-start gap-3">
                        <div className={['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', sevMeta?.color].join(' ')}>
                          <Icon name={sevMeta?.icon as Parameters<typeof Icon>[0]['name']} size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-700 text-foreground flex items-center gap-1.5">
                              {not.titulo}
                              {!not.lido && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />}
                            </h3>
                            <span className="text-[9px] font-700 uppercase tracking-widest text-muted-foreground font-tabular bg-muted px-2 py-0.5 rounded border border-border">
                              {not.categoria}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 font-tabular">{not.dataHora}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {!not.lido && (
                          <button 
                            onClick={(e) => handleMarcarLido(not.id, e)}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-all"
                            title="Marcar como lido"
                          >
                            <Icon name="CheckIcon" size={15} />
                          </button>
                        )}
                        <Icon 
                          name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} 
                          size={15} 
                          className="text-muted-foreground"
                        />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pl-11 pr-4 py-2 border-t border-border mt-1 space-y-4 text-xs font-500 animate-slide-down">
                        <p className="text-foreground leading-relaxed text-sm font-sans">{not.mensagem}</p>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          {not.resolvido ? (
                            <span className="text-[10px] font-700 text-success bg-success/10 px-3 py-1 rounded-full flex items-center gap-1">
                              <Icon name="CheckCircleIcon" size={12} />
                              Incidente Resolvido
                            </span>
                          ) : (
                            <button
                              onClick={(e) => handleResolverAnomalia(not.id, e)}
                              className="text-[10px] font-700 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/95 transition-all active:scale-[0.98]"
                            >
                              Resolver Anomalia
                            </button>
                          )}
                          {!not.lido && (
                            <button
                              onClick={(e) => handleMarcarLido(not.id, e)}
                              className="text-[10px] font-600 border border-border hover:bg-muted text-foreground px-3 py-1.5 rounded-lg transition-all"
                            >
                              Ignorar Alerta
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast, Toaster } from 'sonner';

interface Anomalia {
  id: string;
  funcionario: string;
  departamento: string;
  data: string;
  tipo: 'atraso' | 'falta_registo' | 'ausencia';
  descricao: string;
  justificada: boolean;
}

const anomaliasIniciais: Anomalia[] = [
  { id: 'anom-001', funcionario: 'Carlos Eduardo Teixeira', departamento: 'Operações', data: '21 Mai 2026', tipo: 'falta_registo', descricao: 'Esqueceu o registo de saída (Turno Tarde)', justificada: false },
  { id: 'anom-002', funcionario: 'Hélder António Cardoso', departamento: 'Logística', data: '20 Mai 2026', tipo: 'atraso', descricao: 'Entrada com 45 minutos de atraso (Turno Manhã)', justificada: true },
  { id: 'anom-003', funcionario: 'Jorge Manuel Sebastião', departamento: 'Operações', data: '19 Mai 2026', tipo: 'ausencia', descricao: 'Ausência sem justificação ou dispensa', justificada: false },
  { id: 'anom-004', funcionario: 'Amélia Rodrigues Santos', departamento: 'Financeiro', data: '18 Mai 2026', tipo: 'atraso', descricao: 'Entrada com 18 minutos de atraso', justificada: true },
];

export default function AssiduidadePage() {
  const [anomalias, setAnomalias] = useState<Anomalia[]>(anomaliasIniciais);
  const [simulandoPonto, setSimulandoPonto] = useState(false);
  const [selectedDia, setSelectedDia] = useState<number | null>(null);

  // Generate calendar days for mock (May 2026)
  const calendarDays = Array.from({ length: 31 }).map((_, idx) => {
    const dia = idx + 1;
    // Mocking statuses
    let status: 'presente' | 'atrasado' | 'falta' | 'fim_semana' | 'ferias' = 'presente';
    if ([2, 3, 9, 10, 16, 17, 23, 24, 30, 31].includes(dia)) {
      status = 'fim_semana';
    } else if ([4, 18].includes(dia)) {
      status = 'atrasado';
    } else if ([12].includes(dia)) {
      status = 'falta';
    } else if ([25, 26, 27, 28].includes(dia)) {
      status = 'ferias';
    }
    return { dia, status };
  });

  const handleSimulateClockIn = async () => {
    setSimulandoPonto(true);
    await new Promise((res) => setTimeout(res, 1500));
    toast.success('Ponto registado com sucesso!', {
      description: 'Leitura biométrica efetuada às ' + new Date().toLocaleTimeString('pt-AO'),
      duration: 3500,
    });
    setSimulandoPonto(false);
  };

  const handleJustificar = (id: string) => {
    setAnomalias(prev => prev.map(a => a.id === id ? { ...a, justificada: true } : a));
    toast.success('Incidente justificado com sucesso!');
  };

  return (
    <AppLayout currentPath="/assiduidade">
      <Toaster position="bottom-right" richColors />
      
      <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-6 xl:px-8 2xl:px-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="ClipboardDocumentCheckIcon" size={18} className="text-primary" />
              </div>
              <h1 className="text-2xl font-700 text-foreground">Controlo de Assiduidade</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Monitorização em tempo real de assiduidade, turnos, atrasos e registos biométricos.
            </p>
          </div>
          <button 
            onClick={handleSimulateClockIn}
            disabled={simulandoPonto}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 rounded-lg px-4 py-2.5 text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-85"
          >
            {simulandoPonto ? (
              <>
                <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                <span>A ler biometria...</span>
              </>
            ) : (
              <>
                <Icon name="FingerPrintIcon" size={16} className="animate-pulse" />
                <span>Simular Registo Biométrico</span>
              </>
            )}
          </button>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Taxa de Presença (Hoje)', value: '94.8%', sub: '120 presentes · 7 ausentes', icon: 'CheckCircleIcon', color: 'text-success', bg: 'bg-success/10' },
            { label: 'Atrasos Registados (Este Mês)', value: '14 incidentes', sub: 'Média de 12 min por atraso', icon: 'ClockIcon', color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Horas Extras Acumuladas', value: '48.5 horas', sub: 'Aprovadas pelo supervisor', icon: 'ArrowTrendingUpIcon', color: 'text-info', bg: 'bg-info/10' },
            { label: 'Faltas Por Justificar', value: '2 ativas', sub: 'Requerem atenção imediata', icon: 'ExclamationTriangleIcon', color: 'text-danger', bg: 'bg-danger/10' },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={['w-9 h-9 rounded-lg flex items-center justify-center', kpi.bg].join(' ')}>
                  <Icon name={kpi.icon as Parameters<typeof Icon>[0]['name']} size={18} className={kpi.color} />
                </div>
              </div>
              <p className="text-2xl font-700 text-foreground font-tabular">{kpi.value}</p>
              <p className="text-xs font-500 text-foreground mt-0.5">{kpi.label}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Area */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-600 text-foreground">Registo Mensal (Maio 2026)</h2>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"><Icon name="ChevronLeftIcon" size={14} /></button>
                <span className="text-xs font-600 text-foreground">Maio 2026</span>
                <button className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"><Icon name="ChevronRightIcon" size={14} /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-600 text-muted-foreground py-1 border-b border-border">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => <span key={d}>{d}</span>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Offset days (May 1 2026 is Friday, so Friday is 5th col - offset 4 empty divs) */}
              {Array.from({ length: 4 }).map((_, i) => <div key={`offset-${i}`} className="h-10" />)}
              
              {calendarDays.map(({ dia, status }) => {
                const getStatusStyle = () => {
                  switch (status) {
                    case 'presente': return 'bg-success/5 border-success/30 hover:bg-success/10 text-success';
                    case 'atrasado': return 'bg-warning/5 border-warning/30 hover:bg-warning/10 text-warning';
                    case 'falta': return 'bg-danger/5 border-danger/30 hover:bg-danger/10 text-danger';
                    case 'ferias': return 'bg-info/5 border-info/30 hover:bg-info/10 text-info';
                    case 'fim_semana': return 'bg-muted/10 border-border text-muted-foreground';
                  }
                };

                return (
                  <button 
                    key={`dia-${dia}`}
                    onClick={() => setSelectedDia(dia)}
                    className={[
                      'h-10 border rounded-lg flex flex-col items-center justify-center text-xs font-600 transition-all relative',
                      getStatusStyle()
                    ].join(' ')}
                  >
                    <span>{dia}</span>
                    {status !== 'fim_semana' && (
                      <span className={[
                        'absolute bottom-1 w-1 h-1 rounded-full',
                        status === 'presente' ? 'bg-success' : status === 'atrasado' ? 'bg-warning' : status === 'falta' ? 'bg-danger' : 'bg-info'
                      ].join(' ')} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="pt-4 border-t border-border flex flex-wrap gap-4 justify-center text-[10px] text-muted-foreground font-500">
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-success/20 border border-success/30 inline-block" /><span>Presente</span></div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-warning/20 border border-warning/30 inline-block" /><span>Atrasado</span></div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-danger/20 border border-danger/30 inline-block" /><span>Falta</span></div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-info/20 border border-info/30 inline-block" /><span>Férias</span></div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-muted/20 border border-border inline-block" /><span>Fim de Semana</span></div>
            </div>
          </div>

          {/* Quick Simulator Clock */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-600 text-foreground mb-1">Terminal Biométrico Virtual</h2>
              <p className="text-xs text-muted-foreground mb-4">Simule a batida de ponto do colaborador atual.</p>
            </div>
            
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-32 h-32 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <div className="absolute inset-2 rounded-full bg-primary/5 flex flex-col items-center justify-center">
                  <Icon name="FingerPrintIcon" size={40} className="text-primary animate-pulse" />
                </div>
              </div>
              <p className="text-lg font-700 text-foreground mt-4 font-tabular">{new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-[10px] text-muted-foreground">Hora Local · Angola</p>
            </div>

            <button 
              onClick={handleSimulateClockIn}
              disabled={simulandoPonto}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-xs font-600 hover:bg-primary/95 transition-all active:scale-[0.98]"
            >
              Registar Entrada / Saída
            </button>
          </div>
        </div>

        {/* Anomalies / Incidents List */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-600 text-foreground">Anomalias de Registo Pendentes</h2>
              <p className="text-xs text-muted-foreground">Inconsistências de biometria que requerem justificação.</p>
            </div>
            <span className="text-xs font-700 bg-danger/10 text-danger px-2.5 py-0.5 rounded-full">
              {anomalias.filter(a => !a.justificada).length} Críticas
            </span>
          </div>

          <div className="space-y-3">
            {anomalias.map((anom) => (
              <div key={anom.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-border rounded-xl p-4 gap-3 bg-muted/10 hover:bg-muted/20 transition-all">
                <div className="flex items-start gap-3">
                  <div className={['w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', anom.justificada ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'].join(' ')}>
                    <Icon name={anom.justificada ? 'CheckCircleIcon' : 'ExclamationCircleIcon'} size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-600 text-foreground">{anom.funcionario} · <span className="text-muted-foreground">{anom.departamento}</span></h3>
                    <p className="text-xs text-foreground font-500 mt-0.5">{anom.descricao}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Ocorrência em: {anom.data}</p>
                  </div>
                </div>
                <div>
                  {anom.justificada ? (
                    <span className="text-[10px] font-600 text-success bg-success/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Icon name="CheckIcon" size={11} />
                      Justificada
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleJustificar(anom.id)}
                      className="text-[10px] font-600 text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Aprovar Justificação
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

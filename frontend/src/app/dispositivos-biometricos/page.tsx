'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast, Toaster } from 'sonner';

interface TerminalBiometrico {
  id: string;
  nome: string;
  localizacao: string;
  ip: string;
  estado: 'Online' | 'Offline' | 'A reiniciar';
  versaoFirmware: string;
  ultimaSincronizacao: string;
  temperatura: number; // Celsius
}

interface BiometricLog {
  id: string;
  terminal: string;
  funcionario: string;
  dataHora: string;
  resultado: 'Sucesso' | 'Falha';
  motivoFalha?: string;
}

const terminaisIniciais: TerminalBiometrico[] = [
  { id: 'term-001', nome: 'ZKTeco ProFace A', localizacao: 'Portaria Principal A', ip: '192.168.10.45', estado: 'Online', versaoFirmware: 'v4.12-Z', ultimaSincronizacao: '22 Mai 2026, 08:30', temperatura: 36.8 },
  { id: 'term-002', nome: 'ZKTeco ProFace B', localizacao: 'Entrada Administrativa B', ip: '192.168.10.46', estado: 'Online', versaoFirmware: 'v4.12-Z', ultimaSincronizacao: '22 Mai 2026, 08:31', temperatura: 35.4 },
  { id: 'term-003', nome: 'SpeedFace V5L', localizacao: 'Acesso Refeitório', ip: '192.168.10.50', estado: 'Online', versaoFirmware: 'v3.8-S', ultimaSincronizacao: '22 Mai 2026, 08:00', temperatura: 38.1 },
  { id: 'term-004', nome: 'Terminal Biométrico Servidores', localizacao: 'Sala de Servidores TI', ip: '192.168.20.12', estado: 'Offline', versaoFirmware: 'v2.1-SRV', ultimaSincronizacao: '21 Mai 2026, 18:45', temperatura: 0 },
];

const logsIniciais: BiometricLog[] = [
  { id: 'blog-001', terminal: 'Portaria Principal A', funcionario: 'Amélia Rodrigues Santos', dataHora: '22 Mai 2026, 08:58:12', resultado: 'Sucesso' },
  { id: 'blog-002', terminal: 'Acesso Refeitório', funcionario: 'Carlos Eduardo Teixeira', dataHora: '22 Mai 2026, 08:57:44', resultado: 'Sucesso' },
  { id: 'blog-003', terminal: 'Entrada Administrativa B', funcionario: 'Hélder António Cardoso', dataHora: '22 Mai 2026, 08:56:02', resultado: 'Falha', motivoFalha: 'Impressão digital pouco visível' },
  { id: 'blog-004', terminal: 'Portaria Principal A', funcionario: 'Domingos Ferreira Lopes', dataHora: '22 Mai 2026, 08:54:19', resultado: 'Sucesso' },
  { id: 'blog-005', terminal: 'Entrada Administrativa B', funcionario: 'Desconhecido / Não Registado', dataHora: '22 Mai 2026, 08:50:30', resultado: 'Falha', motivoFalha: 'Cartão RFID não reconhecido' },
];

export default function DispositivosBiometricosPage() {
  const [terminais, setTerminais] = useState<TerminalBiometrico[]>(terminaisIniciais);
  const [logs, setLogs] = useState<BiometricLog[]>(logsIniciais);
  const [sincronizando, setSincronizando] = useState(false);

  const handleReboot = async (id: string, nome: string) => {
    setTerminais(prev =>
      prev.map(t => (t.id === id ? { ...t, estado: 'A reiniciar' } : t))
    );
    toast.success(`Comando de reinicialização enviado para ${nome}.`);

    await new Promise(resolve => setTimeout(resolve, 3000));

    setTerminais(prev =>
      prev.map(t => (t.id === id ? { ...t, estado: 'Online', temperatura: 34.5 } : t))
    );
    toast.success(`${nome} reiniciado com sucesso e online!`);
  };

  const handleSyncAll = async () => {
    setSincronizando(true);
    toast.loading('Sincronizando dados dos funcionários com todos os leitores...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    setTerminais(prev =>
      prev.map(t =>
        t.estado === 'Online'
          ? { ...t, ultimaSincronizacao: '22 Mai 2026, ' + new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }) }
          : t
      )
    );
    setSincronizando(false);
    toast.dismiss();
    toast.success('Sincronização completa de impressões digitais e cartões RFID concluída!');
  };

  const activeCount = terminais.filter(t => t.estado === 'Online').length;

  return (
    <AppLayout currentPath="/dispositivos-biometricos">
      <Toaster position="bottom-right" richColors />

      <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-6 xl:px-8 2xl:px-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="FingerPrintIcon" size={18} className="text-primary" />
              </div>
              <h1 className="text-2xl font-700 text-foreground">Dispositivos Biométricos</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Monitorize, reinicie e sincronize utilizadores com os leitores biométricos físicos e terminais RFID da empresa.
            </p>
          </div>
          <button 
            onClick={handleSyncAll}
            disabled={sincronizando}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 rounded-lg px-4 py-2.5 text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-80"
          >
            {sincronizando ? (
              <>
                <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                <span>A sincronizar...</span>
              </>
            ) : (
              <>
                <Icon name="ArrowPathIcon" size={16} />
                <span>Sincronizar Todos os Leitores</span>
              </>
            )}
          </button>
        </div>

        {/* Dashboard Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Terminais Conectados', value: `${activeCount} / ${terminais.length}`, sub: 'Online em tempo real', icon: 'CpuChipIcon', color: 'text-success', bg: 'bg-success/10' },
            { label: 'Utilizadores Sincronizados', value: '184 ativos', sub: 'Impressões digitais e RFID no terminal', icon: 'UserGroupIcon', color: 'text-info', bg: 'bg-info/10' },
            { label: 'Erros de Leitura (Hoje)', value: '3 rejeições', sub: 'Média de 1.6% taxa de rejeição', icon: 'ExclamationTriangleIcon', color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Integridade da Rede Biométrica', value: '98.7%', sub: 'Ping médio de 14ms nos leitores', icon: 'ShieldCheckIcon', color: 'text-success', bg: 'bg-success/10' },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={['w-9 h-9 rounded-lg flex items-center justify-center', kpi.bg].join(' ')}>
                  <Icon name={kpi.icon as Parameters<typeof Icon>[0]['name']} size={18} className={kpi.color} />
                </div>
              </div>
              <p className="text-xl font-700 text-foreground font-tabular">{kpi.value}</p>
              <p className="text-xs font-500 text-foreground mt-0.5">{kpi.label}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Terminals list and access log simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List of biometric readers */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-600 text-foreground">Terminais Biométricos Activos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {terminais.map((t) => (
                <div key={t.id} className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4 relative overflow-hidden">
                  
                  {/* Status Indicator Glow */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-700 text-foreground mb-0.5">{t.nome}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Icon name="MapPinIcon" size={12} />
                        {t.localizacao}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={[
                        'w-2 h-2 rounded-full inline-block',
                        t.estado === 'Online' ? 'bg-success animate-pulse' : t.estado === 'A reiniciar' ? 'bg-warning animate-spin' : 'bg-danger'
                      ].join(' ')} />
                      <span className="text-[10px] font-700 uppercase text-muted-foreground">{t.estado}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                    <div>
                      <p className="text-muted-foreground font-500">Endereço IP</p>
                      <p className="font-600 text-foreground font-tabular mt-0.5">{t.ip}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-500">Firmware</p>
                      <p className="font-600 text-foreground mt-0.5">{t.versaoFirmware}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-muted-foreground font-500">Última Sincronização</p>
                      <p className="font-600 text-foreground mt-0.5 font-tabular text-[10px]">{t.ultimaSincronizacao}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-muted-foreground font-500">Temp. Interna</p>
                      <p className="font-600 text-foreground mt-0.5 font-tabular">
                        {t.estado === 'Online' ? `${t.temperatura}°C` : 'N/D'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 flex gap-2">
                    <button 
                      onClick={() => handleReboot(t.id, t.nome)}
                      disabled={t.estado === 'Offline' || t.estado === 'A reiniciar'}
                      className="flex-1 text-[11px] font-600 bg-primary/10 hover:bg-primary/20 text-primary py-2 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 text-center"
                    >
                      Reiniciar Terminal
                    </button>
                    <button 
                      onClick={() => toast.info(`A puxar logs detalhados para o terminal ${t.nome}...`)}
                      disabled={t.estado === 'Offline'}
                      className="text-[11px] font-600 border border-border hover:bg-muted text-foreground px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                    >
                      Testar Conexão
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Biometric Access Logs in real time */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            <div>
              <h2 className="text-sm font-600 text-foreground">Registo de Batidas Biométricas</h2>
              <p className="text-xs text-muted-foreground">Monitorização instantânea de entradas e saídas físicas.</p>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {logs.map((l) => (
                <div key={l.id} className="border border-border bg-muted/10 rounded-xl p-3 space-y-1.5 hover:bg-muted/20 transition-all text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-700 text-foreground">{l.funcionario}</span>
                    <span className={[
                      'text-[9px] font-700 px-1.5 py-0.5 rounded-full',
                      l.resultado === 'Sucesso' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    ].join(' ')}>
                      {l.resultado}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">Terminal: <strong className="text-foreground">{l.terminal}</strong></p>
                  {l.motivoFalha && <p className="text-danger text-[10px] font-500">Erro: {l.motivoFalha}</p>}
                  <p className="text-[9px] text-muted-foreground text-right font-tabular">{l.dataHora}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                const randomUser = ['Ivone Maria Ferreira', 'Domingos Ferreira Lopes', 'Adilson Santos', 'Cláudia Semedo'][Math.floor(Math.random() * 4)];
                const randomReader = ['Portaria Principal A', 'Entrada Administrativa B', 'Acesso Refeitório'][Math.floor(Math.random() * 3)];
                const newLog: BiometricLog = {
                  id: `blog-${Date.now()}`,
                  terminal: randomReader,
                  funcionario: randomUser,
                  dataHora: '22 Mai 2026, ' + new Date().toLocaleTimeString('pt-AO'),
                  resultado: 'Sucesso',
                };
                setLogs(prev => [newLog, ...prev]);
                toast.success(`Nova batida biométrica registada por ${randomUser}!`);
              }}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-xs font-600 hover:bg-primary/95 transition-all active:scale-[0.98]"
            >
              Simular Leitura Biométrica Física
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

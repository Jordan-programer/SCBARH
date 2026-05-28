'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';

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
  { id: 'term-005', nome: 'Realand A-C121', localizacao: 'Entrada Recepção', ip: '192.168.10.225', estado: 'Online', versaoFirmware: 'v1.2-R', ultimaSincronizacao: '22 Mai 2026, 08:35', temperatura: 34.8 },
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

  // Estados específicos para integração Realand A-C121
  const [isRealandModalOpen, setIsRealandModalOpen] = useState(false);
  const [realandIp, setRealandIp] = useState('192.168.10.225');
  const [realandPort, setRealandPort] = useState(5500);
  const [realandDeviceId, setRealandDeviceId] = useState(3);
  const [realandCommKey, setRealandCommKey] = useState('12345');
  const [isPinging, setIsPinging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pingResult, setPingResult] = useState<any>(null);

  const handleRealandPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res: any = await api.post('/biometria/ping', {
        ip: realandIp,
        port: realandPort,
        device_id: realandDeviceId,
        comm_key: realandCommKey
      });
      setPingResult(res);
      if (res.status === 'success') {
        toast.success(`Ligação estabelecida! (${res.mode === 'emulated' ? 'Modo Emulação' : 'Socket Real'})`);
      } else {
        toast.error('Erro na ligação.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setIsPinging(false);
    }
  };

  const handleRealandSync = async () => {
    setIsSyncing(true);
    try {
      const res: any = await api.post('/biometria/sincronizar-usuarios', {
        ip: realandIp,
        port: realandPort,
        device_id: realandDeviceId,
        comm_key: realandCommKey
      });
      if (res.status === 'success') {
        toast.success(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao sincronizar.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRealandPullLogs = async () => {
    setIsPulling(true);
    try {
      const res: any = await api.post('/biometria/puxar-logs', {
        ip: realandIp,
        port: realandPort,
        device_id: realandDeviceId,
        comm_key: realandCommKey
      });
      if (res.status === 'success') {
        // Adicionar novos logs puxados à lista
        const newLogs = res.logs.map((l: any) => ({
          id: l.id,
          terminal: l.terminal,
          funcionario: l.funcionario,
          dataHora: l.dataHora,
          resultado: l.resultado
        }));
        setLogs(prev => [...newLogs, ...prev]);
        toast.success(`${res.pulled_count} novas batidas biométricas importadas com sucesso!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao puxar logs.');
    } finally {
      setIsPulling(false);
    }
  };

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
                      onClick={() => t.nome === 'Realand A-C121' ? setIsRealandModalOpen(true) : toast.info(`A puxar logs detalhados para o terminal ${t.nome}...`)}
                      disabled={t.estado === 'Offline'}
                      className={[
                        'text-[11px] font-600 px-3 py-2 rounded-lg transition-all disabled:opacity-50 border border-border hover:bg-muted text-foreground',
                        t.nome === 'Realand A-C121' ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' : ''
                      ].join(' ')}
                    >
                      {t.nome === 'Realand A-C121' ? 'Configurar TCP/IP' : 'Testar Conexão'}
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

      {/* Modal Realand A-C121 TCP/IP Connection */}
      {isRealandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsRealandModalOpen(false)}
          />
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-primary/5 px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Icon name="FingerPrintIcon" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-700 text-foreground">Terminal Realand A-C121</h3>
                  <p className="text-[10px] text-muted-foreground">Painel de Ligação de Hardware Sockets TCP/IP</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRealandModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-all"
              >
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Photo representation */}
              <div className="flex items-center gap-4 bg-muted/10 border border-border rounded-xl p-4">
                <div className="bg-muted border border-border w-24 h-16 rounded-lg flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
                  <Icon name="CpuChipIcon" size={24} className="text-primary/70 animate-pulse" />
                  <span className="absolute bottom-1 right-1.5 text-[8px] font-800 text-muted-foreground uppercase">Realand</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-700 uppercase bg-success/15 text-success px-1.5 py-0.5 rounded">A-C121 Online</span>
                  <h4 className="text-xs font-700 text-foreground">Realand Attendance Terminal</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Ligação TCP/IP direta ao terminal. IP: <strong className="text-foreground font-tabular">192.168.10.225</strong> · Porta: <strong className="text-foreground font-tabular">5500</strong> · Device ID: <strong className="text-foreground">3</strong>
                  </p>
                </div>
              </div>

              {/* Form Settings */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-600 text-muted-foreground mb-1">Endereço IP (Leitor Físico)</label>
                  <input 
                    type="text" 
                    value={realandIp}
                    onChange={(e) => setRealandIp(e.target.value)}
                    className="w-full text-xs font-tabular font-600 bg-input border border-border rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-foreground animate-none"
                    placeholder="192.168.10.225"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-600 text-muted-foreground mb-1">Porta TCP</label>
                  <input 
                    type="number" 
                    value={realandPort}
                    onChange={(e) => setRealandPort(parseInt(e.target.value) || 5500)}
                    className="w-full text-xs font-tabular font-600 bg-input border border-border rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-foreground animate-none"
                    placeholder="5500"
                  />
                </div>
              </div>

              {/* Advanced settings row */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-600 text-muted-foreground mb-1">ID do Equipamento (Device ID)</label>
                  <input 
                    type="number" 
                    value={realandDeviceId}
                    onChange={(e) => setRealandDeviceId(parseInt(e.target.value) || 3)}
                    className="w-full text-xs font-tabular bg-input border border-border rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-600 text-muted-foreground mb-1">Comm Key (Senha de Rede)</label>
                  <input 
                    type="text"
                    value={realandCommKey}
                    onChange={(e) => setRealandCommKey(e.target.value)}
                    className="w-full text-xs font-tabular bg-input border border-border rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-foreground"
                    placeholder="12345"
                  />
                </div>
              </div>

              {/* Connection test result panel */}
              {pingResult && (
                <div className={['border rounded-xl p-4 space-y-2 text-xs', pingResult.mode === 'emulated' ? 'bg-info/5 border-info/20' : 'bg-success/5 border-success/20'].join(' ')}>
                  <div className="flex items-center justify-between font-700">
                    <span className="flex items-center gap-1.5">
                      <span className={['w-1.5 h-1.5 rounded-full inline-block animate-pulse', pingResult.mode === 'emulated' ? 'bg-info' : 'bg-success'].join(' ')} />
                      Estado: Conectado ({pingResult.mode === 'emulated' ? 'Modo Emulação' : 'Socket Real'})
                    </span>
                    <span className="text-[10px] text-muted-foreground">SN: {pingResult.device.serial_number}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                    <div>Funcionários na memória: <strong className="text-foreground">{pingResult.device.users_count}</strong></div>
                    <div>Biometrias registadas: <strong className="text-foreground">{pingResult.device.fingerprints_count}</strong></div>
                    <div>Registos de ponto pendentes: <strong className="text-foreground">{pingResult.device.logs_count}</strong></div>
                    <div>Temp. CPU: <strong className="text-foreground">{pingResult.device.temperature}°C</strong></div>
                  </div>
                </div>
              )}

              {/* Actions row */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleRealandPing}
                  disabled={isPinging || isSyncing || isPulling}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-border bg-card font-600 hover:bg-muted text-foreground py-2.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 text-xs"
                >
                  {isPinging ? (
                    <>
                      <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                      <span>A testar...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="ShieldCheckIcon" size={14} />
                      <span>Testar Conexão</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRealandSync}
                  disabled={isPinging || isSyncing || isPulling}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-border bg-card font-600 hover:bg-muted text-foreground py-2.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 text-xs"
                >
                  {isSyncing ? (
                    <>
                      <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                      <span>A sincronizar...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="UserPlusIcon" size={14} />
                      <span>Sincronizar Utilizadores</span>
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-border/60 pt-4">
                <button
                  type="button"
                  onClick={handleRealandPullLogs}
                  disabled={isPinging || isSyncing || isPulling}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 hover:bg-primary/90 py-2.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 text-xs shadow-sm"
                >
                  {isPulling ? (
                    <>
                      <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                      <span>A descarregar registos...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="ArrowDownTrayIcon" size={14} />
                      <span>Importar Batidas de Ponto Pendentes (Pull)</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Diagnostic instructions footer */}
            <div className="bg-muted/30 px-6 py-4 border-t border-border text-[10px] text-muted-foreground leading-relaxed space-y-1">
              <p><strong className="text-foreground">Configuração actual do dispositivo físico:</strong></p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 font-tabular mt-1">
                <span>IP: <strong className="text-foreground">192.168.10.225</strong></span>
                <span>Porta: <strong className="text-foreground">5500</strong></span>
                <span>Device ID: <strong className="text-foreground">3</strong></span>
                <span>Comm Key: <strong className="text-foreground">12345</strong></span>
                <span>Gateway: <strong className="text-foreground">192.168.10.0</strong></span>
                <span>Máscara: <strong className="text-foreground">255.255.252.0</strong></span>
              </div>
              <p className="pt-1">No terminal físico: <span className="font-600 text-foreground">Menu → Comm. → Network</span></p>
            </div>

          </div>
        </div>
      )}
    </AppLayout>
  );
}

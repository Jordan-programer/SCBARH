'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast, Toaster } from 'sonner';

type TabName = 'geral' | 'tolerancias' | 'seguranca' | 'alertas';

export default function ConfiguracoesPage() {
  const [tabAtiva, setTabAtiva] = useState<TabName>('geral');
  const [salvando, setSalvando] = useState(false);

  // Settings states
  const [settings, setSettings] = useState({
    empresaNome: 'SCB Angola Lda',
    fusoHorario: 'Africa/Luanda',
    idioma: 'pt',
    toleranciaMinutos: 15,
    duploIntervaloSegundos: 15,
    minExtraMinutos: 30,
    bloqueioTentativas: 5,
    comprimentoSenha: 8,
    autenticacaoDoisFatores: true,
    alertaEmail: true,
    alertaSMS: false,
    alertasCriticosAdmin: true
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    
    // Simulate API saving settings
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSalvando(false);
    toast.success('Configurações atualizadas com sucesso!', {
      description: 'As alterações foram propagadas para todos os terminais biométricos.',
      duration: 4000,
    });
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AppLayout currentPath="/configuracoes">
      <Toaster position="bottom-right" richColors />

      <div className="px-6 py-6 max-w-screen-3xl mx-auto space-y-6 xl:px-8 2xl:px-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="Cog6ToothIcon" size={18} className="text-primary" />
              </div>
              <h1 className="text-2xl font-700 text-foreground">Definições do Sistema</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Ajuste as tolerâncias de atraso da biometria, políticas de segurança de rede e alertas globais.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Settings Tabs Sidebar */}
          <div className="bg-card border border-border rounded-xl shadow-card p-3 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {[
              { id: 'geral', label: 'Geral', icon: 'CpuChipIcon' },
              { id: 'tolerancias', label: 'Tolerâncias Biométricas', icon: 'FingerPrintIcon' },
              { id: 'seguranca', label: 'Segurança & Rede', icon: 'ShieldCheckIcon' },
              { id: 'alertas', label: 'Notificações & Alertas', icon: 'BellAlertIcon' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabAtiva(tab.id as TabName)}
                className={[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-600 transition-all text-left flex-shrink-0 lg:flex-shrink',
                  tabAtiva === tab.id 
                    ? 'bg-primary/10 text-primary shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                ].join(' ')}
              >
                <Icon name={tab.icon as Parameters<typeof Icon>[0]['name']} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Tab Form Area */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSave} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
              <div className="p-6 space-y-6 text-xs font-500">
                
                {/* 1. GERAL TAB */}
                {tabAtiva === 'geral' && (
                  <div className="space-y-4 animate-slide-down">
                    <h2 className="text-sm font-700 text-foreground border-b border-border pb-2">Configurações Gerais</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-600 text-foreground uppercase tracking-wide">Nome da Instituição</label>
                        <input
                          type="text"
                          value={settings.empresaNome}
                          onChange={(e) => handleInputChange('empresaNome', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-primary text-foreground font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-600 text-foreground uppercase tracking-wide">Idioma Principal</label>
                        <select
                          value={settings.idioma}
                          onChange={(e) => handleInputChange('idioma', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-primary text-foreground font-medium"
                        >
                          <option value="pt">Português (AO)</option>
                          <option value="en">English (US)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block font-600 text-foreground uppercase tracking-wide">Fuso Horário Corporativo</label>
                        <select
                          value={settings.fusoHorario}
                          onChange={(e) => handleInputChange('fusoHorario', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-primary text-foreground font-medium"
                        >
                          <option value="Africa/Luanda">GMT+1 — Africa/Luanda (Angola)</option>
                          <option value="Europe/Lisbon">GMT+1 — Europe/Lisbon (Portugal)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TOLERÂNCIAS TAB */}
                {tabAtiva === 'tolerancias' && (
                  <div className="space-y-4 animate-slide-down">
                    <h2 className="text-sm font-700 text-foreground border-b border-border pb-2">Regras de Tolerância & Biometria</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-600 text-foreground uppercase tracking-wide">Tolerância Máxima de Atraso</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.toleranciaMinutos}
                            onChange={(e) => handleInputChange('toleranciaMinutos', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-primary text-foreground font-medium font-tabular"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground font-semibold text-[10px]">MINUTOS</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal">Tempo extra permitido para a entrada diária antes de gerar um incidente de atraso.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-600 text-foreground uppercase tracking-wide">Intervalo Antiduplicado</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.duploIntervaloSegundos}
                            onChange={(e) => handleInputChange('duploIntervaloSegundos', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-primary text-foreground font-medium font-tabular"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground font-semibold text-[10px]">SEGUNDOS</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal">Período de segurança para ignorar registos consecutivos no mesmo terminal.</p>
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block font-600 text-foreground uppercase tracking-wide">Hora Extra Mínima Aprovada</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.minExtraMinutos}
                            onChange={(e) => handleInputChange('minExtraMinutos', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-primary text-foreground font-medium font-tabular"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground font-semibold text-[10px]">MINUTOS</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal">Tempo mínimo de permanência após o expediente para qualificar para horas extraordinárias.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SEGURANÇA TAB */}
                {tabAtiva === 'seguranca' && (
                  <div className="space-y-4 animate-slide-down">
                    <h2 className="text-sm font-700 text-foreground border-b border-border pb-2">Políticas de Segurança do Portal</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-600 text-foreground uppercase tracking-wide">Bloqueio de Tentativas Login</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.bloqueioTentativas}
                            onChange={(e) => handleInputChange('bloqueioTentativas', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-primary text-foreground font-medium font-tabular"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground font-semibold text-[10px]">TENTATIVAS</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block font-600 text-foreground uppercase tracking-wide">Comprimento Mínimo Palavra-Passe</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.comprimentoSenha}
                            onChange={(e) => handleInputChange('comprimentoSenha', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-primary text-foreground font-medium font-tabular"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground font-semibold text-[10px]">CARACTERES</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:col-span-2 border border-border p-3.5 rounded-lg bg-muted/10">
                        <div className="space-y-0.5 pr-4">
                          <p className="font-600 text-foreground">Duplo Factor de Autenticação (2FA) Obrigatório</p>
                          <p className="text-[10px] text-muted-foreground leading-normal">Exige validação por código descartável para todas as contas administrativas.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle('autenticacaoDoisFatores')}
                          className={[
                            'w-11 h-6 rounded-full transition-all relative flex items-center px-1 border',
                            settings.autenticacaoDoisFatores ? 'bg-primary border-primary justify-end' : 'bg-muted border-border justify-start'
                          ].join(' ')}
                        >
                          <span className="w-4.5 h-4.5 rounded-full bg-white shadow-sm inline-block" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ALERTAS TAB */}
                {tabAtiva === 'alertas' && (
                  <div className="space-y-4 animate-slide-down">
                    <h2 className="text-sm font-700 text-foreground border-b border-border pb-2">Destinatários & Canais de Alerta</h2>
                    
                    <div className="space-y-3">
                      {[
                        { key: 'alertaEmail', title: 'Notificar Falhas de Dispositivos por Email', desc: 'Envia correios eletrónicos técnicos instantâneos para o administrador em caso de offline.' },
                        { key: 'alertaSMS', title: 'Notificar Alertas Críticos por SMS', desc: 'Integração direta com o gateway corporativo Twilio/Unitel para avisar supervisores.' },
                        { key: 'alertasCriticosAdmin', title: 'Destacar Apenas Ocorrências Graves na Dashboard', desc: 'Filtra os relatórios de anomalias diárias na Bento Grid inicial para maior visibilidade.' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between border border-border p-3.5 rounded-lg bg-muted/10">
                          <div className="space-y-0.5 pr-4">
                            <p className="font-600 text-foreground">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground leading-normal">{item.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggle(item.key as keyof typeof settings)}
                            className={[
                              'w-11 h-6 rounded-full transition-all relative flex items-center px-1 border',
                              settings[item.key as keyof typeof settings] ? 'bg-primary border-primary justify-end' : 'bg-muted border-border justify-start'
                            ].join(' ')}
                          >
                            <span className="w-4.5 h-4.5 rounded-full bg-white shadow-sm inline-block" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Form Footer */}
              <div className="bg-muted/30 border-t border-border px-6 py-4 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-500">Última modificação global: Há 2 dias por Manuel Afonso</span>
                <button
                  type="submit"
                  disabled={salvando}
                  className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-xs font-600 hover:bg-primary/95 transition-all active:scale-[0.98] disabled:opacity-85 flex items-center gap-2"
                >
                  {salvando ? (
                    <>
                      <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                      <span>A guardar alterações...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="CheckIcon" size={14} />
                      <span>Guardar Configurações</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

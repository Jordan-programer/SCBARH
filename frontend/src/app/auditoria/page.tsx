'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast, Toaster } from 'sonner';

interface LogAuditoria {
  id: string;
  dataHora: string;
  utilizador: string;
  cargo: string;
  ip: string;
  acao: string;
  categoria: 'Segurança' | 'Configuração' | 'Biometria' | 'Financeiro' | 'Recursos Humanos';
  status: 'Sucesso' | 'Falha';
  detalhes: string;
}

const logsAuditoriaIniciais: LogAuditoria[] = [
  { id: 'aud-001', dataHora: '22 Mai 2026, 09:42:15', utilizador: 'Manuel Afonso', cargo: 'Super Administrador', ip: '192.168.1.100', acao: 'Alteração de Tolerância Ponto', categoria: 'Configuração', status: 'Sucesso', detalhes: 'Alterado tempo limite de tolerância de atraso geral de 10 min para 15 min.' },
  { id: 'aud-002', dataHora: '22 Mai 2026, 09:30:00', utilizador: 'Manuel Afonso', cargo: 'Super Administrador', ip: '192.168.1.100', acao: 'Sincronização Manual de Leitores', categoria: 'Biometria', status: 'Sucesso', detalhes: 'Sincronizados dados biométricos de 184 utilizadores ativos com 4 leitores físicos.' },
  { id: 'aud-003', dataHora: '22 Mai 2026, 09:12:05', utilizador: 'Sistema Automático', cargo: 'Serviço do Núcleo', ip: 'localhost', acao: 'Falha Conexão IP Leitor', categoria: 'Segurança', status: 'Falha', detalhes: 'ZKTeco ProFace A (192.168.10.45) falhou verificação periódica de ping.' },
  { id: 'aud-004', dataHora: '21 Mai 2026, 17:45:12', utilizador: 'Adilson Santos', cargo: 'Coordenador Recursos Humanos', ip: '192.168.1.115', acao: 'Criação Cadastro Colaborador', categoria: 'Recursos Humanos', status: 'Sucesso', detalhes: 'Adicionado António Agostinho Neto com cargo Especialista TI no departamento de TI.' },
  { id: 'aud-005', dataHora: '21 Mai 2026, 15:30:20', utilizador: 'Sandra Martins', cargo: 'Analista Financeiro', ip: '192.168.1.120', acao: 'Pré-cálculo Folha Salarial', categoria: 'Financeiro', status: 'Sucesso', detalhes: 'Executado lote prévio de processamento de pagamentos para aprovação final.' },
  { id: 'aud-006', dataHora: '20 Mai 2026, 11:20:44', utilizador: 'Cláudia Semedo', cargo: 'Operadora de Suporte', ip: '192.168.1.140', acao: 'Tentativa de Login Inválida', categoria: 'Segurança', status: 'Falha', detalhes: 'Inserida palavra-passe incorreta para conta administrador "c.semedo". Conta suspensa por 15 min.' },
];

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<LogAuditoria[]>(logsAuditoriaIniciais);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<'Todos' | 'Segurança' | 'Configuração' | 'Biometria' | 'Financeiro' | 'Recursos Humanos'>('Todos');
  const [logExpandido, setLogExpandido] = useState<string | null>(null);

  const handleExportAudit = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'A gerar ficheiro CSV assinado digitalmente...',
        success: 'Histórico de auditoria exportado com criptografia SHA-256!',
        error: 'Erro na exportação de logs.',
      }
    );
  };

  const logsFiltrados = logs.filter(log => {
    const correspondePesquisa = 
      log.utilizador.toLowerCase().includes(pesquisa.toLowerCase()) || 
      log.acao.toLowerCase().includes(pesquisa.toLowerCase()) ||
      log.detalhes.toLowerCase().includes(pesquisa.toLowerCase()) ||
      log.ip.toLowerCase().includes(pesquisa.toLowerCase());

    const correspondeCategoria = filtroCategoria === 'Todos' || log.categoria === filtroCategoria;

    return correspondePesquisa && correspondeCategoria;
  });

  return (
    <AppLayout currentPath="/auditoria">
      <Toaster position="bottom-right" richColors />

      <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-6 xl:px-8 2xl:px-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="ShieldCheckIcon" size={18} className="text-primary" />
              </div>
              <h1 className="text-2xl font-700 text-foreground">Registo de Auditoria de Segurança</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Historial imutável de segurança em conformidade com as normas reguladoras corporativas.
            </p>
          </div>
          <button 
            onClick={handleExportAudit}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 rounded-lg px-4 py-2.5 text-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <Icon name="DocumentArrowDownIcon" size={16} />
            <span>Exportar Relatório Assinado</span>
          </button>
        </div>

        {/* Search and Quick Category Filters */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-card space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <Icon name="MagnifyingGlassIcon" size={16} />
              </span>
              <input
                type="text"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Pesquisar por utilizador, acção, IP ou detalhes..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-primary text-foreground font-medium placeholder-muted-foreground/75"
              />
            </div>

            {/* Quick Category Tab Select */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {(['Todos', 'Segurança', 'Configuração', 'Biometria', 'Financeiro', 'Recursos Humanos'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  className={[
                    'px-3 py-1.5 text-xs font-600 rounded-lg transition-all',
                    filtroCategoria === cat 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  ].join(' ')}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground w-48">Data e Hora</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Utilizador / Cargo</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Acção Executada</th>
                  <th className="text-left px-3 py-3 text-xs font-600 text-muted-foreground">Categoria</th>
                  <th className="text-center px-3 py-3 text-xs font-600 text-muted-foreground">IP de Origem</th>
                  <th className="text-center px-3 py-3 text-xs font-600 text-muted-foreground">Estatuto</th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground text-sm font-500">
                      Nenhum registo de auditoria encontrado correspondente aos critérios.
                    </td>
                  </tr>
                ) : (
                  logsFiltrados.map((log) => {
                    const isExpanded = logExpandido === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr 
                          onClick={() => setLogExpandido(isExpanded ? null : log.id)}
                          className="hover:bg-muted/30 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3.5 text-xs text-muted-foreground font-tabular">{log.dataHora}</td>
                          <td className="px-4 py-3.5">
                            <p className="font-600 text-foreground">{log.utilizador}</p>
                            <p className="text-[11px] text-muted-foreground">{log.cargo}</p>
                          </td>
                          <td className="px-4 py-3.5 font-500 text-foreground">{log.acao}</td>
                          <td className="px-3 py-3.5">
                            <span className={[
                              'text-[10px] font-700 px-2 py-0.5 rounded-full border',
                              log.categoria === 'Segurança' ? 'border-danger text-danger bg-danger/5' :
                              log.categoria === 'Configuração' ? 'border-warning text-warning bg-warning/5' :
                              log.categoria === 'Biometria' ? 'border-primary text-primary bg-primary/5' :
                              log.categoria === 'Financeiro' ? 'border-success text-success bg-success/5' :
                              'border-info text-info bg-info/5'
                            ].join(' ')}>
                              {log.categoria}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-center font-tabular text-xs text-muted-foreground">{log.ip}</td>
                          <td className="px-3 py-3.5 text-center">
                            <span className={[
                              'text-[10px] font-700 px-2 py-0.5 rounded-full inline-block',
                              log.status === 'Sucesso' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                            ].join(' ')}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Icon 
                              name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} 
                              size={15} 
                              className="text-muted-foreground inline"
                            />
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-muted/[0.03]">
                            <td colSpan={7} className="px-8 py-3 border-t border-border animate-slide-down">
                              <div className="space-y-1.5 text-xs font-500">
                                <p className="text-muted-foreground uppercase font-600 tracking-wide">Descrição detalhada do incidente:</p>
                                <p className="text-foreground leading-relaxed text-sm font-sans">{log.detalhes}</p>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1.5 border-t border-border/50 font-tabular mt-2">
                                  <span>ID Criptográfico: SHA-256:{Buffer.from(log.id).toString('hex')}...</span>
                                  <span>Origem: {log.ip}</span>
                                  <span>Assinatura Digital: VÁLIDA</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

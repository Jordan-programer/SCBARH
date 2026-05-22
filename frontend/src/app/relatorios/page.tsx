'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast, Toaster } from 'sonner';

interface RelatorioPredefinido {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'Assiduidade' | 'Financeiro' | 'Recursos Humanos';
  tamanho: string;
  tipoFicheiro: 'PDF' | 'XLSX' | 'CSV';
}

const relatoriosIniciais: RelatorioPredefinido[] = [
  { id: 'rep-001', titulo: 'Mapa Mensal de Horas Extras', descricao: 'Relatório acumulado de horas extraordinárias aprovadas para folha salarial.', categoria: 'Financeiro', tamanho: '2.4 MB', tipoFicheiro: 'XLSX' },
  { id: 'rep-002', titulo: 'Resumo de Assiduidade Geral', descricao: 'Taxa de presença diária, atrasos consolidados e faltas injustificadas.', categoria: 'Assiduidade', tamanho: '1.8 MB', tipoFicheiro: 'PDF' },
  { id: 'rep-003', titulo: 'Cadastro Ativo de Funcionários', descricao: 'Ficha geral de dados contratuais e identificadores biométricos associados.', categoria: 'Recursos Humanos', tamanho: '950 KB', tipoFicheiro: 'PDF' },
  { id: 'rep-004', titulo: 'Auditoria de Anomalias Corrigidas', descricao: 'Histórico de justificações de ponto aprovadas por supervisores.', categoria: 'Assiduidade', tamanho: '1.1 MB', tipoFicheiro: 'CSV' },
  { id: 'rep-005', titulo: 'Custo de Pessoal por Departamento', descricao: 'Distribuição financeira de custos operacionais e encargos sociais do mês.', categoria: 'Financeiro', tamanho: '3.1 MB', tipoFicheiro: 'XLSX' },
];

export default function RelatoriosPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<'Todos' | 'Assiduidade' | 'Financeiro' | 'Recursos Humanos'>('Todos');
  const [gerandoPersonalizado, setGerandoPersonalizado] = useState(false);
  const [formParams, setFormParams] = useState({
    periodo: 'maio-2026',
    departamento: 'todos',
    formato: 'PDF',
    incluirAnomalias: true
  });

  const relatoriosFiltrados = categoriaAtiva === 'Todos' 
    ? relatoriosIniciais 
    : relatoriosIniciais.filter(r => r.categoria === categoriaAtiva);

  const handleDownload = (titulo: string, extensao: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1200)),
      {
        loading: `A preparar exportação de "${titulo}"...`,
        success: () => `Ficheiro ${titulo}.${extensao.toLowerCase()} descarregado com sucesso!`,
        error: 'Erro na exportação.',
      }
    );
  };

  const handleGerarPersonalizado = async (e: React.FormEvent) => {
    e.preventDefault();
    setGerandoPersonalizado(true);
    toast.loading('A analisar base de dados e a desenhar gráficos personalizados...');

    await new Promise(resolve => setTimeout(resolve, 2500));

    setGerandoPersonalizado(false);
    toast.dismiss();
    toast.success('Relatório Personalizado Gerado com Sucesso!', {
      description: `Disponível para download em formato .${formParams.formato.toLowerCase()}`,
      duration: 4000,
    });
  };

  return (
    <AppLayout currentPath="/relatorios">
      <Toaster position="bottom-right" richColors />

      <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-6 xl:px-8 2xl:px-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="DocumentChartBarIcon" size={18} className="text-primary" />
              </div>
              <h1 className="text-2xl font-700 text-foreground">Centro de Relatórios & Análises</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Extraia mapas de pagamento, sumários de assiduidade corporativa e auditorias em múltiplos formatos.
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
          {(['Todos', 'Assiduidade', 'Financeiro', 'Recursos Humanos'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={[
                'px-4 py-2 text-xs font-600 rounded-lg transition-all',
                categoriaAtiva === cat 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ].join(' ')}
            >
              {cat === 'Todos' ? 'Todos os Relatórios' : cat}
            </button>
          ))}
        </div>

        {/* Main Grid: Predefined reports and custom report builder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Predefined Reports List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-600 text-foreground">Relatórios Pré-definidos</h2>
            
            <div className="space-y-3">
              {relatoriosFiltrados.map((rep) => (
                <div key={rep.id} className="bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={[
                        'text-[9px] font-700 px-2 py-0.5 rounded-full border',
                        rep.categoria === 'Financeiro' ? 'border-success text-success bg-success/5' :
                        rep.categoria === 'Assiduidade' ? 'border-primary text-primary bg-primary/5' :
                        'border-info text-info bg-info/5'
                      ].join(' ')}>
                        {rep.categoria}
                      </span>
                      <span className="text-[10px] font-600 text-muted-foreground font-tabular">{rep.tamanho}</span>
                    </div>
                    <h3 className="text-sm font-700 text-foreground">{rep.titulo}</h3>
                    <p className="text-xs text-muted-foreground">{rep.descricao}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-700 text-muted-foreground font-tabular bg-muted px-2 py-1.5 rounded-lg border border-border">
                      .{rep.tipoFicheiro.toLowerCase()}
                    </span>
                    <button
                      onClick={() => handleDownload(rep.titulo, rep.tipoFicheiro)}
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-600 hover:bg-primary/95 transition-all active:scale-[0.98]"
                    >
                      <Icon name="ArrowDownTrayIcon" size={13} />
                      <span>Descarregar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Report Builder */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            <div>
              <h2 className="text-sm font-600 text-foreground">Gerador Personalizado</h2>
              <p className="text-xs text-muted-foreground">Configure parâmetros específicos e compile um relatório consolidado.</p>
            </div>

            <form onSubmit={handleGerarPersonalizado} className="space-y-4 text-xs font-500">
              
              <div className="space-y-1.5">
                <label className="block font-600 text-foreground uppercase tracking-wide">Período de Referência</label>
                <select
                  value={formParams.periodo}
                  onChange={(e) => setFormParams(prev => ({ ...prev, periodo: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-primary text-foreground font-medium"
                >
                  <option value="maio-2026">Maio de 2026 (Mês Corrente)</option>
                  <option value="abril-2026">Abril de 2026</option>
                  <option value="q1-2026">1º Trimestre de 2026</option>
                  <option value="ano-2025">Ano Inteiro 2025</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-600 text-foreground uppercase tracking-wide">Departamento</label>
                <select
                  value={formParams.departamento}
                  onChange={(e) => setFormParams(prev => ({ ...prev, departamento: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-primary text-foreground font-medium"
                >
                  <option value="todos">Todos os Departamentos</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="ti">Tecnologias de Informação</option>
                  <option value="operacoes">Operações</option>
                  <option value="logistica">Logística</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-600 text-foreground uppercase tracking-wide">Formato de Saída</label>
                <div className="grid grid-cols-3 gap-2">
                  {['PDF', 'XLSX', 'CSV'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormParams(prev => ({ ...prev, formato: f }))}
                      className={[
                        'py-2 border rounded-lg font-600 text-center transition-all',
                        formParams.formato === f 
                          ? 'border-primary text-primary bg-primary/5' 
                          : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                      ].join(' ')}
                    >
                      .{f.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-border pt-4">
                <input
                  type="checkbox"
                  id="inc-anomalias"
                  checked={formParams.incluirAnomalias}
                  onChange={(e) => setFormParams(prev => ({ ...prev, incluirAnomalias: e.target.checked }))}
                  className="w-4 h-4 text-primary bg-muted rounded border-border focus:ring-0 cursor-pointer"
                />
                <label htmlFor="inc-anomalias" className="text-muted-foreground cursor-pointer select-none">
                  Incluir histórico de anomalias biométricas
                </label>
              </div>

              <button
                type="submit"
                disabled={gerandoPersonalizado}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-xs font-600 hover:bg-primary/95 transition-all active:scale-[0.98] disabled:opacity-85 flex items-center justify-center gap-2"
              >
                {gerandoPersonalizado ? (
                  <>
                    <Icon name="ArrowPathIcon" size={14} className="animate-spin" />
                    <span>A compilar relatório...</span>
                  </>
                ) : (
                  <>
                    <Icon name="DocumentPlusIcon" size={14} />
                    <span>Compilar & Exportar</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

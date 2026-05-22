'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { toast, Toaster } from 'sonner';

interface ColaboradorSalario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  salarioBase: number;
  horasExtras: number; // in hours
  abonosExtras: number; // in Kz (Kwanza)
  descontoFaltas: number; // in Kz
  status: 'Pendente' | 'Processado';
}

const colaboradoresIniciais: ColaboradorSalario[] = [
  { id: 'sal-001', nome: 'Amélia Rodrigues Santos', cargo: 'Contabilista Sénior', departamento: 'Financeiro', salarioBase: 450000, horasExtras: 8, abonosExtras: 32000, descontoFaltas: 0, status: 'Pendente' },
  { id: 'sal-002', nome: 'Domingos Ferreira Lopes', cargo: 'Engenheiro de Software', departamento: 'TI', salarioBase: 600000, horasExtras: 4, abonosExtras: 20000, descontoFaltas: 0, status: 'Pendente' },
  { id: 'sal-003', nome: 'Carlos Eduardo Teixeira', cargo: 'Supervisor de Linha', departamento: 'Operações', salarioBase: 320000, horasExtras: 15, abonosExtras: 45000, descontoFaltas: 28000, status: 'Pendente' },
  { id: 'sal-004', nome: 'Hélder António Cardoso', cargo: 'Coordenador de Armazém', departamento: 'Logística', salarioBase: 280000, horasExtras: 12, abonosExtras: 31000, descontoFaltas: 12500, status: 'Pendente' },
  { id: 'sal-005', nome: 'Ivone Maria Ferreira', cargo: 'Técnica de Suporte TI', departamento: 'Suporte', salarioBase: 250000, horasExtras: 0, abonosExtras: 0, descontoFaltas: 0, status: 'Pendente' },
];

export default function ProcessamentoSalarialPage() {
  const [colaboradores, setColaboradores] = useState<ColaboradorSalario[]>(colaboradoresIniciais);
  const [processando, setProcessando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  const formatKwanza = (value: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 2 }).format(value);
  };

  const handleProcessarLote = async () => {
    if (colaboradores.every(c => c.status === 'Processado')) {
      toast.info('Todos os salários deste lote já foram processados.');
      return;
    }

    setProcessando(true);
    setProgresso(0);

    // Simulate batch calculation process
    for (let p = 10; p <= 100; p += 15) {
      const currentProg = Math.min(p, 100);
      setProgresso(currentProg);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setColaboradores(prev => prev.map(c => ({ ...c, status: 'Processado' })));
    setProcessando(false);
    toast.success('Processamento salarial concluído!', {
      description: 'Lote de Maio 2026 fechado e pronto para transferência bancária.',
      duration: 4000,
    });
  };

  const handleRecalcular = (id: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 800)),
      {
        loading: 'A recalcular descontos de assiduidade...',
        success: () => {
          setColaboradores(prev =>
            prev.map(c => {
              if (c.id === id) {
                // Update with simulated new calculations
                return { ...c, abonosExtras: c.horasExtras * 4500, status: 'Pendente' };
              }
              return c;
            })
          );
          return 'Cálculos de assiduidade sincronizados!';
        },
        error: 'Erro ao recalcular.',
      }
    );
  };

  const totalBruto = colaboradores.reduce((acc, c) => acc + c.salarioBase + c.abonosExtras, 0);
  const totalDescontos = colaboradores.reduce((acc, c) => acc + c.descontoFaltas, 0);
  const totalLiquido = totalBruto - totalDescontos;
  const pendentesCount = colaboradores.filter(c => c.status === 'Pendente').length;

  return (
    <AppLayout currentPath="/processamento-salarial">
      <Toaster position="bottom-right" richColors />

      <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-6 xl:px-8 2xl:px-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="BanknotesIcon" size={18} className="text-primary" />
              </div>
              <h1 className="text-2xl font-700 text-foreground">Processamento Salarial</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Gere folhas de pagamento, calcule abonos de horas extras e deduza descontos de faltas automaticamente da biometria.
            </p>
          </div>
          <button 
            onClick={handleProcessarLote}
            disabled={processando}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 rounded-lg px-4 py-2.5 text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-80"
          >
            {processando ? (
              <>
                <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                <span>A calcular ({progresso}%)</span>
              </>
            ) : (
              <>
                <Icon name="CpuChipIcon" size={16} />
                <span>Processar Lote Salarial</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar for Batch Simulation */}
        {processando && (
          <div className="bg-card border border-border rounded-xl p-4 shadow-card space-y-2">
            <div className="flex justify-between text-xs font-600 text-foreground">
              <span>Sincronizando registros biométricos e calculando impostos...</span>
              <span className="font-tabular">{progresso}%</span>
            </div>
            <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progresso}%` }} />
            </div>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Líquido Processado', value: formatKwanza(totalLiquido), sub: 'Salário Base + Abonos - Descontos', icon: 'BanknotesIcon', color: 'text-success', bg: 'bg-success/10' },
            { label: 'Abonos & Horas Extras', value: formatKwanza(colaboradores.reduce((acc, c) => acc + c.abonosExtras, 0)), sub: 'Calculado sobre horas extras aprovadas', icon: 'ArrowTrendingUpIcon', color: 'text-info', bg: 'bg-info/10' },
            { label: 'Descontos de Faltas', value: formatKwanza(totalDescontos), sub: 'Deduções por faltas/atrasos injustificados', icon: 'ArrowTrendingDownIcon', color: 'text-danger', bg: 'bg-danger/10' },
            { label: 'Lotes Pendentes', value: `${pendentesCount} colaboradores`, sub: 'Aguardando processamento final', icon: 'ClockIcon', color: 'text-warning', bg: 'bg-warning/10' },
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

        {/* Payroll Calculations Table */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-600 text-foreground">Folha de Cálculo (Maio 2026)</h2>
              <p className="text-xs text-muted-foreground">Detalhamento dos salários calculados a partir dos turnos e presenças biométricas.</p>
            </div>
            <button 
              onClick={() => toast.success('Relatório financeiro exportado com sucesso!')}
              className="text-xs font-600 text-primary border border-primary/20 hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all"
            >
              Exportar para SEPA/Excel
            </button>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Funcionário</th>
                  <th className="text-right px-3 py-3 text-xs font-600 text-muted-foreground">Salário Base</th>
                  <th className="text-center px-3 py-3 text-xs font-600 text-muted-foreground">Horas Extra (Qtd)</th>
                  <th className="text-right px-3 py-3 text-xs font-600 text-muted-foreground">Abonos Extras</th>
                  <th className="text-right px-3 py-3 text-xs font-600 text-muted-foreground">Descontos Faltas</th>
                  <th className="text-right px-3 py-3 text-xs font-600 text-muted-foreground">Líquido a Receber</th>
                  <th className="text-center px-3 py-3 text-xs font-600 text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-tabular">
                {colaboradores.map((col) => {
                  const liquido = col.salarioBase + col.abonosExtras - col.descontoFaltas;
                  return (
                    <tr key={col.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-500 text-foreground font-sans">{col.nome}</p>
                        <p className="text-xs text-muted-foreground font-sans">{col.cargo} · {col.departamento}</p>
                      </td>
                      <td className="px-3 py-3 text-right text-foreground font-medium">{formatKwanza(col.salarioBase)}</td>
                      <td className="px-3 py-3 text-center text-muted-foreground font-medium">{col.horasExtras}h</td>
                      <td className="px-3 py-3 text-right text-success font-medium">+{formatKwanza(col.abonosExtras)}</td>
                      <td className="px-3 py-3 text-right text-danger font-medium">-{formatKwanza(col.descontoFaltas)}</td>
                      <td className="px-3 py-3 text-right text-foreground font-bold">{formatKwanza(liquido)}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={[
                          'text-[10px] font-700 px-2 py-0.5 rounded-full inline-block',
                          col.status === 'Processado' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        ].join(' ')}>
                          {col.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleRecalcular(col.id)}
                          className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                          title="Sincronizar e Recalcular"
                        >
                          <Icon name="ArrowPathIcon" size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

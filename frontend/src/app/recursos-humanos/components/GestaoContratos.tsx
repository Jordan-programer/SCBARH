'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';

type TipoContrato = 'efectivo' | 'prazo_certo' | 'prazo_incerto' | 'prestacao_servicos' | 'estagio';
type EstadoContrato = 'activo' | 'expirado' | 'renovado' | 'rescindido' | 'a_renovar';

interface Contrato {
  id: string;
  funcionario: string;
  departamento: string;
  cargo: string;
  tipo: TipoContrato;
  dataInicio: string;
  dataFim?: string;
  salarioBase: number;
  estado: EstadoContrato;
  clausulas: string[];
  renovacoes: number;
  diasParaExpirar?: number;
}

const contratos: Contrato[] = [
  { id: 'cnt-001', funcionario: 'Manuel António Afonso', departamento: 'TI', cargo: 'Administrador de Sistemas', tipo: 'efectivo', dataInicio: '01/01/2017', salarioBase: 680000, estado: 'activo', clausulas: ['Período de experiência: 90 dias', 'Horário flexível autorizado', 'Subsídio de alimentação incluído'], renovacoes: 0 },
  { id: 'cnt-002', funcionario: 'Beatriz Matos Oliveira', departamento: 'RH', cargo: 'Gestora de RH', tipo: 'efectivo', dataInicio: '22/09/2018', salarioBase: 480000, estado: 'activo', clausulas: ['Subsídio de transporte', 'Seguro de saúde incluído'], renovacoes: 1 },
  { id: 'cnt-003', funcionario: 'Amélia Rodrigues Santos', departamento: 'Financeiro', cargo: 'Contabilista Sénior', tipo: 'efectivo', dataInicio: '15/03/2019', salarioBase: 450000, estado: 'activo', clausulas: ['Bónus anual de desempenho', 'Formação contínua garantida'], renovacoes: 0 },
  { id: 'cnt-004', funcionario: 'Hélder António Cardoso', departamento: 'Logística', cargo: 'Coordenador de Armazém', tipo: 'prazo_certo', dataInicio: '14/11/2020', dataFim: '14/06/2026', salarioBase: 350000, estado: 'a_renovar', clausulas: ['Contrato renovável por igual período'], renovacoes: 2, diasParaExpirar: 24 },
  { id: 'cnt-005', funcionario: 'Pedro Augusto Alves', departamento: 'Operações', cargo: 'Chefe de Turno', tipo: 'prazo_certo', dataInicio: '20/03/2020', dataFim: '20/06/2026', salarioBase: 390000, estado: 'a_renovar', clausulas: ['Sujeito a avaliação de desempenho'], renovacoes: 1, diasParaExpirar: 30 },
  { id: 'cnt-006', funcionario: 'Jorge Manuel Sebastião', departamento: 'Operações', cargo: 'Operador de Produção', tipo: 'prazo_certo', dataInicio: '03/02/2023', dataFim: '03/02/2025', salarioBase: 280000, estado: 'renovado', clausulas: ['Renovado por 2 anos'], renovacoes: 1 },
  { id: 'cnt-007', funcionario: 'Lurdes Conceição Pinto', departamento: 'Financeiro', cargo: 'Assistente Financeira', tipo: 'prazo_incerto', dataInicio: '17/08/2019', salarioBase: 320000, estado: 'rescindido', clausulas: ['Rescisão por mútuo acordo'], renovacoes: 0 },
  { id: 'cnt-008', funcionario: 'Sónia Pereira Costa', departamento: 'TI', cargo: 'Desenvolvedora Frontend', tipo: 'estagio', dataInicio: '01/05/2026', dataFim: '31/10/2026', salarioBase: 180000, estado: 'activo', clausulas: ['Estágio profissional — 6 meses', 'Possibilidade de efectivação'], renovacoes: 0, diasParaExpirar: 163 },
];

const tipoConfig: Record<TipoContrato, { label: string; color: string; bg: string }> = {
  efectivo: { label: 'Efectivo', color: 'text-success', bg: 'bg-success/10' },
  prazo_certo: { label: 'Prazo Certo', color: 'text-info', bg: 'bg-info/10' },
  prazo_incerto: { label: 'Prazo Incerto', color: 'text-warning', bg: 'bg-warning/10' },
  prestacao_servicos: { label: 'Prestação de Serviços', color: 'text-primary', bg: 'bg-primary/10' },
  estagio: { label: 'Estágio', color: 'text-muted-foreground', bg: 'bg-muted' },
};

const estadoConfig: Record<EstadoContrato, { label: string; color: string; bg: string }> = {
  activo: { label: 'Activo', color: 'text-success', bg: 'bg-success/10' },
  expirado: { label: 'Expirado', color: 'text-danger', bg: 'bg-danger/10' },
  renovado: { label: 'Renovado', color: 'text-info', bg: 'bg-info/10' },
  rescindido: { label: 'Rescindido', color: 'text-muted-foreground', bg: 'bg-muted' },
  a_renovar: { label: 'A Renovar', color: 'text-warning', bg: 'bg-warning/10' },
};

export default function GestaoContratos() {
  const [lista] = useState<Contrato[]>(contratos);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Contrato | null>(null);

  const filtered = lista.filter((c) => {
    const q = search.toLowerCase();
    const matchQ = !q || c.funcionario.toLowerCase().includes(q) || c.departamento.toLowerCase().includes(q);
    const matchEstado = !filtroEstado || c.estado === filtroEstado;
    const matchTipo = !filtroTipo || c.tipo === filtroTipo;
    return matchQ && matchEstado && matchTipo;
  });

  const aRenovar = lista.filter((c) => c.estado === 'a_renovar').length;
  const activos = lista.filter((c) => c.estado === 'activo').length;

  return (
    <div>
      {/* Alert banner */}
      {aRenovar > 0 && (
        <div className="flex items-center gap-3 bg-warning/10 border border-warning/20 rounded-xl px-4 py-3 mb-5">
          <Icon name="ExclamationTriangleIcon" size={16} className="text-warning flex-shrink-0" />
          <p className="text-sm text-warning font-500">
            {aRenovar} contrato{aRenovar > 1 ? 's' : ''} a expirar nos próximos 30 dias — acção necessária.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Contratos Activos', value: activos, color: 'text-success', bg: 'bg-success/10', icon: 'DocumentCheckIcon' },
          { label: 'A Renovar', value: aRenovar, color: 'text-warning', bg: 'bg-warning/10', icon: 'ArrowPathIcon' },
          { label: 'Rescindidos', value: lista.filter((c) => c.estado === 'rescindido').length, color: 'text-danger', bg: 'bg-danger/10', icon: 'XCircleIcon' },
          { label: 'Total', value: lista.length, color: 'text-primary', bg: 'bg-primary/10', icon: 'DocumentTextIcon' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-card">
            <div className={['w-8 h-8 rounded-lg flex items-center justify-center mb-2', s.bg].join(' ')}>
              <Icon name={s.icon as Parameters<typeof Icon>[0]['name']} size={16} className={s.color} />
            </div>
            <p className={['text-xl font-700 font-tabular', s.color].join(' ')}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar funcionário ou departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="px-3 py-2.5 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary text-foreground">
          <option value="">Todos os tipos</option>
          <option value="efectivo">Efectivo</option>
          <option value="prazo_certo">Prazo Certo</option>
          <option value="prazo_incerto">Prazo Incerto</option>
          <option value="estagio">Estágio</option>
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="px-3 py-2.5 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary text-foreground">
          <option value="">Todos os estados</option>
          <option value="activo">Activo</option>
          <option value="a_renovar">A Renovar</option>
          <option value="renovado">Renovado</option>
          <option value="rescindido">Rescindido</option>
        </select>
        <button
          onClick={() => toast.info('Criação de contrato disponível em breve.')}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-500 hover:bg-primary/90 transition-colors"
        >
          <Icon name="PlusIcon" size={15} />
          Novo Contrato
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Funcionário</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Vigência</th>
                <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Salário Base</th>
                <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Renovações</th>
                <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((cnt) => {
                const tipo = tipoConfig[cnt.tipo];
                const estado = estadoConfig[cnt.estado];
                return (
                  <tr key={cnt.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-500 text-foreground">{cnt.funcionario}</p>
                      <p className="text-xs text-muted-foreground">{cnt.cargo} · {cnt.departamento}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={['text-xs font-500 px-2 py-0.5 rounded-full', tipo.bg, tipo.color].join(' ')}>
                        {tipo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground font-tabular">{cnt.dataInicio}</p>
                      {cnt.dataFim && (
                        <p className="text-xs text-muted-foreground font-tabular">
                          até {cnt.dataFim}
                          {cnt.diasParaExpirar !== undefined && (
                            <span className={['ml-1 font-500', cnt.diasParaExpirar <= 30 ? 'text-warning' : 'text-muted-foreground'].join(' ')}>
                              ({cnt.diasParaExpirar}d)
                            </span>
                          )}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-600 text-foreground font-tabular">
                      {cnt.salarioBase.toLocaleString('pt-AO')} Kz
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-600 text-foreground font-tabular">{cnt.renovacoes}×</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={['text-xs font-500 px-2 py-0.5 rounded-full', estado.bg, estado.color].join(' ')}>
                        {estado.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {cnt.estado === 'a_renovar' && (
                          <button
                            onClick={() => toast.success(`Processo de renovação iniciado para ${cnt.funcionario}.`)}
                            className="text-xs text-warning font-500 hover:underline"
                          >
                            Renovar
                          </button>
                        )}
                        <button
                          onClick={() => setSelected(cnt)}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                          title="Ver contrato"
                        >
                          <Icon name="EyeIcon" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detalhes do Contrato"
        subtitle={selected?.id}
        size="md"
        footer={
          <>
            <button onClick={() => { toast.success('Contrato exportado em PDF.'); }} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Icon name="ArrowDownTrayIcon" size={14} />
              Exportar PDF
            </button>
            <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-500">
              Fechar
            </button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="DocumentTextIcon" size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-600 text-foreground">{selected.funcionario}</p>
                <p className="text-xs text-muted-foreground">{selected.cargo} · {selected.departamento}</p>
              </div>
              <span className={['text-xs font-500 px-2 py-0.5 rounded-full', estadoConfig[selected.estado].bg, estadoConfig[selected.estado].color].join(' ')}>
                {estadoConfig[selected.estado].label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-1">Tipo de Contrato</p>
                <p className="text-sm font-500 text-foreground">{tipoConfig[selected.tipo].label}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-1">Salário Base</p>
                <p className="text-sm font-700 text-foreground font-tabular">{selected.salarioBase.toLocaleString('pt-AO')} Kz</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-1">Data de Início</p>
                <p className="text-sm font-500 text-foreground font-tabular">{selected.dataInicio}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-1">Data de Fim</p>
                <p className="text-sm font-500 text-foreground font-tabular">{selected.dataFim || 'Indeterminado'}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 col-span-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-1">Renovações</p>
                <p className="text-sm font-500 text-foreground">{selected.renovacoes} renovação{selected.renovacoes !== 1 ? 'ões' : ''} registada{selected.renovacoes !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-2">Cláusulas Especiais</p>
              <ul className="space-y-1.5">
                {selected.clausulas.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Icon name="CheckCircleIcon" size={14} className="text-success mt-0.5 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

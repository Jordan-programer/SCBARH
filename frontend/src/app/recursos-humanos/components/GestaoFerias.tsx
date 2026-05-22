'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';


type EstadoPedido = 'pendente' | 'aprovado' | 'rejeitado' | 'em_curso';
type TipoAusencia = 'ferias' | 'licenca_medica' | 'licenca_maternidade' | 'licenca_paternidade' | 'falta_justificada' | 'falta_injustificada';

interface PedidoAusencia {
  id: string;
  funcionario: string;
  departamento: string;
  tipo: TipoAusencia;
  dataInicio: string;
  dataFim: string;
  diasUteis: number;
  estado: EstadoPedido;
  motivo: string;
  aprovadoPor?: string;
  dataSubmissao: string;
}

const pedidos: PedidoAusencia[] = [
  { id: 'aus-001', funcionario: 'Carlos Eduardo Teixeira', departamento: 'Operações', tipo: 'ferias', dataInicio: '14/07/2026', dataFim: '28/07/2026', diasUteis: 11, estado: 'aprovado', motivo: 'Férias anuais programadas', aprovadoPor: 'Beatriz Matos', dataSubmissao: '20/05/2026' },
  { id: 'aus-002', funcionario: 'Hélder António Cardoso', departamento: 'Logística', tipo: 'licenca_medica', dataInicio: '01/06/2026', dataFim: '30/06/2026', diasUteis: 22, estado: 'aprovado', motivo: 'Recuperação cirúrgica', aprovadoPor: 'Beatriz Matos', dataSubmissao: '28/05/2026' },
  { id: 'aus-003', funcionario: 'Filomena Neto da Silva', departamento: 'Comercial', tipo: 'ferias', dataInicio: '04/08/2026', dataFim: '15/08/2026', diasUteis: 10, estado: 'pendente', motivo: 'Férias anuais', dataSubmissao: '21/05/2026' },
  { id: 'aus-004', funcionario: 'Ivone Maria Ferreira', departamento: 'Suporte', tipo: 'falta_justificada', dataInicio: '22/05/2026', dataFim: '22/05/2026', diasUteis: 1, estado: 'pendente', motivo: 'Consulta médica urgente', dataSubmissao: '21/05/2026' },
  { id: 'aus-005', funcionario: 'Jorge Manuel Sebastião', departamento: 'Operações', tipo: 'falta_injustificada', dataInicio: '19/05/2026', dataFim: '19/05/2026', diasUteis: 1, estado: 'pendente', motivo: 'Sem justificação apresentada', dataSubmissao: '20/05/2026' },
  { id: 'aus-006', funcionario: 'Amélia Rodrigues Santos', departamento: 'Financeiro', tipo: 'ferias', dataInicio: '01/09/2026', dataFim: '12/09/2026', diasUteis: 10, estado: 'pendente', motivo: 'Férias anuais', dataSubmissao: '21/05/2026' },
  { id: 'aus-007', funcionario: 'Domingos Ferreira Lopes', departamento: 'TI', tipo: 'licenca_paternidade', dataInicio: '10/06/2026', dataFim: '17/06/2026', diasUteis: 6, estado: 'aprovado', motivo: 'Nascimento de filho', aprovadoPor: 'Beatriz Matos', dataSubmissao: '15/05/2026' },
  { id: 'aus-008', funcionario: 'Natália Sousa Mendes', departamento: 'Comercial', tipo: 'ferias', dataInicio: '21/07/2026', dataFim: '01/08/2026', diasUteis: 10, estado: 'rejeitado', motivo: 'Férias anuais', aprovadoPor: 'Beatriz Matos', dataSubmissao: '10/05/2026' },
];

const tipoConfig: Record<TipoAusencia, { label: string; color: string; bg: string; icon: string }> = {
  ferias: { label: 'Férias', color: 'text-info', bg: 'bg-info/10', icon: 'SunIcon' },
  licenca_medica: { label: 'Licença Médica', color: 'text-warning', bg: 'bg-warning/10', icon: 'HeartIcon' },
  licenca_maternidade: { label: 'Lic. Maternidade', color: 'text-primary', bg: 'bg-primary/10', icon: 'HeartIcon' },
  licenca_paternidade: { label: 'Lic. Paternidade', color: 'text-primary', bg: 'bg-primary/10', icon: 'HeartIcon' },
  falta_justificada: { label: 'Falta Justificada', color: 'text-muted-foreground', bg: 'bg-muted', icon: 'DocumentCheckIcon' },
  falta_injustificada: { label: 'Falta Injustificada', color: 'text-danger', bg: 'bg-danger/10', icon: 'ExclamationCircleIcon' },
};

const estadoConfig: Record<EstadoPedido, { label: string; color: string; bg: string }> = {
  pendente: { label: 'Pendente', color: 'text-warning', bg: 'bg-warning/10' },
  aprovado: { label: 'Aprovado', color: 'text-success', bg: 'bg-success/10' },
  rejeitado: { label: 'Rejeitado', color: 'text-danger', bg: 'bg-danger/10' },
  em_curso: { label: 'Em Curso', color: 'text-info', bg: 'bg-info/10' },
};

export default function GestaoFerias() {
  const { user } = useAuth();
  const isGestor = user?.role === 'GESTOR';
  const [gestorDeptVal, setGestorDeptVal] = useState<string>('');

  const [lista, setLista] = useState<PedidoAusencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [selected, setSelected] = useState<PedidoAusencia | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ pedido: PedidoAusencia; acao: 'aprovar' | 'rejeitar' } | null>(null);

  useEffect(() => {
    if (user?.funcionario_id) {
      api.get(`/funcionarios/${user.funcionario_id}`)
        .then((emp: any) => {
          if (emp?.departamento) {
            setGestorDeptVal(emp.departamento);
          }
        })
        .catch((err) => {
          console.error('Error fetching gestor department:', err);
        });
    }
  }, [user]);

  const fetchFeriasData = async () => {
    try {
      setIsLoading(true);
      const [backendFerias, backendFuncs] = await Promise.all([
        api.get<any[]>('/ferias'),
        api.get<any[]>('/funcionarios'),
      ]);

      const mapped: PedidoAusencia[] = backendFerias.map((f: any) => {
        const emp = backendFuncs.find((e: any) => e.id === f.funcionario_id);
        
        const formatDate = (dStr: string) => {
          if (!dStr) return '';
          const parts = dStr.split('-');
          return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dStr;
        };

        let estado: EstadoPedido = 'pendente';
        if (f.status === 'Aprovado') estado = 'aprovado';
        else if (f.status === 'Rejeitado') estado = 'rejeitado';
        else if (f.status === 'Pendente') estado = 'pendente';
        else if (f.status === 'Em Curso') estado = 'em_curso';

        return {
          id: `aus-${String(f.id).padStart(3, '0')}`,
          funcionario: emp ? emp.nome : `Funcionário ID ${f.funcionario_id}`,
          departamento: emp ? emp.departamento : 'Geral',
          tipo: 'ferias',
          dataInicio: formatDate(f.data_inicio),
          dataFim: formatDate(f.data_fim),
          diasUteis: f.dias_gozados || 10,
          estado,
          motivo: f.observacoes || 'Férias anuais',
          dataSubmissao: f.created_at ? new Date(f.created_at).toLocaleDateString('pt-AO') : '22/05/2026',
        };
      });

      const nonFeriasMocks = pedidos.filter(p => p.tipo !== 'ferias');
      setLista([...mapped, ...nonFeriasMocks]);
      setIsDemoMode(false);
    } catch (error) {
      console.warn('API error, falling back to offline demo mode:', error);
      setLista(pedidos);
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeriasData();
  }, []);

  const scopedLista = lista.filter((p) => {
    if (isGestor) {
      const deptFilter = gestorDeptVal || 'Operações';
      return p.departamento === deptFilter;
    }
    return true;
  });

  const filtered = scopedLista.filter((p) => {
    const matchEstado = !filtroEstado || p.estado === filtroEstado;
    const matchTipo = !filtroTipo || p.tipo === filtroTipo;
    return matchEstado && matchTipo;
  });

  const pendentes = scopedLista.filter((p) => p.estado === 'pendente').length;
  const aprovados = scopedLista.filter((p) => p.estado === 'aprovado').length;
  const emCurso = scopedLista.filter((p) => p.estado === 'em_curso').length;

  const handleAprovar = async (pedido: PedidoAusencia) => {
    if (isDemoMode || !pedido.id.startsWith('aus-') || parseInt(pedido.id.replace('aus-', ''), 10) > 100) {
      setLista((prev) => prev.map((p) => p.id === pedido.id ? { ...p, estado: 'aprovado', aprovadoPor: 'Beatriz Matos' } : p));
      toast.success(`Pedido de ${pedido.funcionario} aprovado.`);
      setConfirmAction(null);
      setSelected(null);
      return;
    }

    try {
      const backendId = parseInt(pedido.id.replace('aus-', ''), 10);
      await api.put(`/ferias/${backendId}`, {
        status: 'Aprovado'
      });
      toast.success(`Pedido de ${pedido.funcionario} aprovado.`);
      await fetchFeriasData();
    } catch (err: any) {
      console.error('Error approving vacation:', err);
      toast.error(err.message || 'Erro ao aprovar férias.');
    } finally {
      setConfirmAction(null);
      setSelected(null);
    }
  };

  const handleRejeitar = async (pedido: PedidoAusencia) => {
    if (isDemoMode || !pedido.id.startsWith('aus-') || parseInt(pedido.id.replace('aus-', ''), 10) > 100) {
      setLista((prev) => prev.map((p) => p.id === pedido.id ? { ...p, estado: 'rejeitado', aprovadoPor: 'Beatriz Matos' } : p));
      toast.error(`Pedido de ${pedido.funcionario} rejeitado.`);
      setConfirmAction(null);
      setSelected(null);
      return;
    }

    try {
      const backendId = parseInt(pedido.id.replace('aus-', ''), 10);
      await api.put(`/ferias/${backendId}`, {
        status: 'Rejeitado'
      });
      toast.error(`Pedido de ${pedido.funcionario} rejeitado.`);
      await fetchFeriasData();
    } catch (err: any) {
      console.error('Error rejecting vacation:', err);
      toast.error(err.message || 'Erro ao rejeitar férias.');
    } finally {
      setConfirmAction(null);
      setSelected(null);
    }
  };


  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Pendentes', value: pendentes, color: 'text-warning', bg: 'bg-warning/10', icon: 'ClockIcon' },
          { label: 'Aprovados', value: aprovados, color: 'text-success', bg: 'bg-success/10', icon: 'CheckCircleIcon' },
          { label: 'Em Curso', value: emCurso, color: 'text-info', bg: 'bg-info/10', icon: 'ArrowPathIcon' },
          { label: 'Total', value: scopedLista.length, color: 'text-primary', bg: 'bg-primary/10', icon: 'CalendarDaysIcon' },
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
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2.5 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary text-foreground"
        >
          <option value="">Todos os estados</option>
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
          <option value="em_curso">Em Curso</option>
        </select>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-3 py-2.5 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary text-foreground"
        >
          <option value="">Todos os tipos</option>
          <option value="ferias">Férias</option>
          <option value="licenca_medica">Licença Médica</option>
          <option value="licenca_maternidade">Lic. Maternidade</option>
          <option value="licenca_paternidade">Lic. Paternidade</option>
          <option value="falta_justificada">Falta Justificada</option>
          <option value="falta_injustificada">Falta Injustificada</option>
        </select>
        <div className="flex-1" />
        <button
          onClick={() => toast.info('Funcionalidade de novo pedido disponível em breve.')}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-500 hover:bg-primary/90 transition-colors"
        >
          <Icon name="PlusIcon" size={15} />
          Novo Pedido
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
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Período</th>
                <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Dias</th>
                <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Submetido em</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Icon name="ArrowPathIcon" size={24} className="animate-spin text-primary" />
                      <span className="text-sm font-500 text-foreground">A carregar férias e ausências...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Nenhum pedido de férias ou ausência registado.
                  </td>
                </tr>
              ) : filtered.map((pedido) => {
                const tipo = tipoConfig[pedido.tipo];
                const estado = estadoConfig[pedido.estado];
                return (
                  <tr key={pedido.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-500 text-foreground">{pedido.funcionario}</p>
                      <p className="text-xs text-muted-foreground">{pedido.departamento}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={['text-xs font-500 px-2 py-0.5 rounded-full', tipo.bg, tipo.color].join(' ')}>
                        {tipo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-tabular">
                      {pedido.dataInicio} → {pedido.dataFim}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-600 text-foreground font-tabular">{pedido.diasUteis}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={['text-xs font-500 px-2 py-0.5 rounded-full', estado.bg, estado.color].join(' ')}>
                        {estado.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-tabular">{pedido.dataSubmissao}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {pedido.estado === 'pendente' && (
                          <>
                            <button
                              onClick={() => setConfirmAction({ pedido, acao: 'aprovar' })}
                              className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors"
                              title="Aprovar"
                            >
                              <Icon name="CheckIcon" size={13} />
                            </button>
                            <button
                              onClick={() => setConfirmAction({ pedido, acao: 'rejeitar' })}
                              className="p-1.5 rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                              title="Rejeitar"
                            >
                              <Icon name="XMarkIcon" size={13} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelected(pedido)}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                          title="Ver detalhes"
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

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detalhes do Pedido"
        subtitle={selected?.id}
        size="md"
        footer={
          <>
            {selected?.estado === 'pendente' && (
              <>
                <button
                  onClick={() => { if (selected) setConfirmAction({ pedido: selected, acao: 'rejeitar' }); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors font-500"
                >
                  <Icon name="XMarkIcon" size={14} />
                  Rejeitar
                </button>
                <button
                  onClick={() => { if (selected) setConfirmAction({ pedido: selected, acao: 'aprovar' }); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-500"
                >
                  <Icon name="CheckIcon" size={14} />
                  Aprovar
                </button>
              </>
            )}
            {selected?.estado !== 'pendente' && (
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-500">
                Fechar
              </button>
            )}
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name={tipoConfig[selected.tipo].icon as Parameters<typeof Icon>[0]['name']} size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-600 text-foreground">{selected.funcionario}</p>
                <p className="text-xs text-muted-foreground">{selected.departamento}</p>
              </div>
              <span className={['ml-auto text-xs font-500 px-2 py-0.5 rounded-full', estadoConfig[selected.estado].bg, estadoConfig[selected.estado].color].join(' ')}>
                {estadoConfig[selected.estado].label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-1">Tipo</p>
                <p className="text-sm font-500 text-foreground">{tipoConfig[selected.tipo].label}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-1">Dias Úteis</p>
                <p className="text-sm font-700 text-foreground font-tabular">{selected.diasUteis} dias</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-1">Data de Início</p>
                <p className="text-sm font-500 text-foreground font-tabular">{selected.dataInicio}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-1">Data de Fim</p>
                <p className="text-sm font-500 text-foreground font-tabular">{selected.dataFim}</p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-1">Motivo</p>
              <p className="text-sm text-foreground">{selected.motivo}</p>
            </div>
            {selected.aprovadoPor && (
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600 mb-1">
                  {selected.estado === 'aprovado' ? 'Aprovado por' : 'Processado por'}
                </p>
                <p className="text-sm text-foreground">{selected.aprovadoPor}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Action Modal */}
      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.acao === 'aprovar' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirmAction(null)} className="px-3 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button
              onClick={() => {
                if (!confirmAction) return;
                confirmAction.acao === 'aprovar' ? handleAprovar(confirmAction.pedido) : handleRejeitar(confirmAction.pedido);
              }}
              className={['px-4 py-2 text-sm rounded-lg font-500 transition-colors', confirmAction?.acao === 'aprovar' ? 'bg-success text-white hover:bg-success/90' : 'bg-danger text-white hover:bg-danger/90'].join(' ')}
            >
              {confirmAction?.acao === 'aprovar' ? 'Aprovar' : 'Rejeitar'}
            </button>
          </>
        }
      >
        {confirmAction && (
          <p className="text-sm text-muted-foreground">
            Tem a certeza que pretende <strong className="text-foreground">{confirmAction.acao}</strong> o pedido de{' '}
            <strong className="text-foreground">{confirmAction.pedido.funcionario}</strong>?
          </p>
        )}
      </Modal>
    </div>
  );
}

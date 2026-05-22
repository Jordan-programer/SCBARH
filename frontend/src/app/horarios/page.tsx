'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import { toast, Toaster } from 'sonner';

interface Turno {
  id: string;
  nome: string;
  entrada: string;
  saida: string;
  tolerancia: number; // minutes
  diasSemana: string;
  cargaHoraria: number; // hours
  cor: string;
}

interface EscalaFuncionario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  escala: Record<string, string>; // dia -> turnoID
}

const turnosIniciais: Turno[] = [
  { id: 'trn-001', nome: 'Turno Geral', entrada: '08:00', saida: '17:00', tolerancia: 15, diasSemana: 'Segunda a Sexta', cargaHoraria: 8, cor: 'border-primary text-primary bg-primary/5' },
  { id: 'trn-002', nome: 'Turno Manhã Reduzido', entrada: '08:00', saida: '14:00', tolerancia: 10, diasSemana: 'Segunda a Sábado', cargaHoraria: 6, cor: 'border-success text-success bg-success/5' },
  { id: 'trn-003', nome: 'Turno Noite Especial', entrada: '22:00', saida: '06:00', tolerancia: 15, diasSemana: 'Segunda a Sexta', cargaHoraria: 8, cor: 'border-danger text-danger bg-danger/5' },
  { id: 'trn-004', nome: 'Turno de Fim de Semana', entrada: '09:00', saida: '18:00', tolerancia: 20, diasSemana: 'Sábado e Domingo', cargaHoraria: 9, cor: 'border-warning text-warning bg-warning/5' },
];

const escalasIniciais: EscalaFuncionario[] = [
  { id: 'esc-001', nome: 'Amélia Rodrigues Santos', cargo: 'Contabilista Sénior', departamento: 'Financeiro', escala: { 'Seg': 'trn-001', 'Ter': 'trn-001', 'Qua': 'trn-001', 'Qui': 'trn-001', 'Sex': 'trn-001', 'Sáb': 'folga', 'Dom': 'folga' } },
  { id: 'esc-002', nome: 'Domingos Ferreira Lopes', cargo: 'Engenheiro de Software', departamento: 'TI', escala: { 'Seg': 'trn-001', 'Ter': 'trn-001', 'Qua': 'trn-001', 'Qui': 'trn-001', 'Sex': 'trn-001', 'Sáb': 'folga', 'Dom': 'folga' } },
  { id: 'esc-003', nome: 'Carlos Eduardo Teixeira', cargo: 'Supervisor de Linha', departamento: 'Operações', escala: { 'Seg': 'trn-003', 'Ter': 'trn-003', 'Qua': 'trn-003', 'Qui': 'trn-003', 'Sex': 'trn-003', 'Sáb': 'folga', 'Dom': 'folga' } },
  { id: 'esc-004', nome: 'Hélder António Cardoso', cargo: 'Coordenador de Armazém', departamento: 'Logística', escala: { 'Seg': 'trn-001', 'Ter': 'trn-001', 'Qua': 'trn-001', 'Qui': 'trn-001', 'Sex': 'trn-001', 'Sáb': 'trn-004', 'Dom': 'folga' } },
  { id: 'esc-005', nome: 'Ivone Maria Ferreira', cargo: 'Técnica de Suporte TI', departamento: 'Suporte', escala: { 'Seg': 'trn-002', 'Ter': 'trn-002', 'Qua': 'trn-002', 'Qui': 'trn-002', 'Sex': 'trn-002', 'Sáb': 'trn-002', 'Dom': 'folga' } },
];

const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function HorariosPage() {
  const [turnos, setTurnos] = useState<Turno[]>(turnosIniciais);
  const [escalas, setEscalas] = useState<EscalaFuncionario[]>(escalasIniciais);
  const [selectedFunc, setSelectedFunc] = useState<EscalaFuncionario | null>(null);
  const [editTurnoId, setEditTurnoId] = useState<string>('trn-001');

  const handleUpdateShift = (funcId: string) => {
    setEscalas(prev => prev.map(f => {
      if (f.id === funcId) {
        // Update Seg-Sex to new selected shift
        const newEscala = { ...f.escala };
        diasSemana.forEach(d => {
          if (newEscala[d] !== 'folga') {
            newEscala[d] = editTurnoId;
          }
        });
        return { ...f, escala: newEscala };
      }
      return f;
    }));
    toast.success('Horário do colaborador atualizado com sucesso!');
    setSelectedFunc(null);
  };

  return (
    <AppLayout currentPath="/horarios">
      <Toaster position="bottom-right" richColors />
      
      <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-6 xl:px-8 2xl:px-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="CalendarDaysIcon" size={18} className="text-primary" />
              </div>
              <h1 className="text-2xl font-700 text-foreground">Gestão de Horários & Turnos</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure turnos corporativos, atribua escalas de trabalho e determine limites de tolerância de ponto.
            </p>
          </div>
          <button 
            onClick={() => toast.info('Funcionalidade de criação de turnos disponível em breve.')}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-600 rounded-lg px-4 py-2.5 text-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <Icon name="PlusIcon" size={16} />
            <span>Criar Novo Turno</span>
          </button>
        </div>

        {/* Shift Catalog */}
        <div className="space-y-4">
          <h2 className="text-sm font-600 text-foreground">Catálogo de Turnos Ativos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {turnos.map((t) => (
              <div key={t.id} className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-md transition-shadow relative">
                <div className="flex items-start justify-between mb-4">
                  <span className={['text-[10px] font-700 px-2 py-0.5 rounded-full border', t.cor].join(' ')}>
                    {t.nome}
                  </span>
                  <button 
                    onClick={() => toast.info(`Configurar detalhes para ${t.nome}`)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name="Cog6ToothIcon" size={15} />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-600 text-foreground font-tabular">
                    <span>Horário:</span>
                    <span>{t.entrada} — {t.saida}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Tolerância:</span>
                    <span>{t.tolerancia} minutos</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Carga Semanal:</span>
                    <span>{t.cargaHoraria} horas/dia</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-2">
                    <span>Dias:</span>
                    <span className="font-500">{t.diasSemana}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Shifts Grid */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-600 text-foreground">Escala Semanal de Colaboradores</h2>
              <p className="text-xs text-muted-foreground">Monitore e gerencie a atribuição de turnos semanais.</p>
            </div>
            <span className="text-xs font-700 text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              {escalas.length} Colaboradores
            </span>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground w-64">Funcionário</th>
                  {diasSemana.map(d => (
                    <th key={d} className="text-center px-2 py-3 text-xs font-600 text-muted-foreground">{d}</th>
                  ))}
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {escalas.map((esc) => (
                  <tr key={esc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-500 text-foreground">{esc.nome}</p>
                      <p className="text-xs text-muted-foreground">{esc.cargo} · {esc.departamento}</p>
                    </td>
                    {diasSemana.map(d => {
                      const trnId = esc.escala[d];
                      const trn = turnos.find(t => t.id === trnId);

                      if (trnId === 'folga') {
                        return (
                          <td key={d} className="text-center px-1 py-3">
                            <span className="text-[10px] font-600 text-muted-foreground bg-muted border border-border/40 px-2 py-1 rounded">
                              FOLGA
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td key={d} className="text-center px-1 py-3">
                          <span className={['text-[10px] font-700 border px-1.5 py-1 rounded truncate block max-w-[85px] mx-auto', trn?.cor].join(' ')} title={trn?.nome}>
                            {trn?.entrada}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedFunc(esc)}
                        className="text-xs text-primary font-500 hover:underline"
                      >
                        Atribuir Turno
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Edit Scale Modal */}
      <Modal
        open={!!selectedFunc}
        onClose={() => setSelectedFunc(null)}
        title="Atribuir Novo Horário"
        subtitle={selectedFunc?.nome}
        size="md"
        footer={
          <>
            <button 
              onClick={() => setSelectedFunc(null)}
              className="px-3 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => { if (selectedFunc) handleUpdateShift(selectedFunc.id); }}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-500"
            >
              Confirmar Alteração
            </button>
          </>
        }
      >
        {selectedFunc && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Selecione o turno principal que deseja atribuir aos dias úteis (Segunda a Sexta) para o colaborador <strong className="text-foreground">{selectedFunc.nome}</strong>.
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-600 text-foreground uppercase tracking-wide">Seleção do Turno</label>
              <select 
                value={editTurnoId}
                onChange={(e) => setEditTurnoId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary text-foreground"
              >
                {turnos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} ({t.entrada} — {t.saida}) · {t.diasSemana}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="bg-muted/30 border border-border/60 rounded-lg p-3">
              <p className="text-[10px] font-600 text-muted-foreground uppercase tracking-wide mb-1">Resumo de Jornada Semanal</p>
              <p className="text-xs text-foreground font-500 leading-relaxed">
                A atribuição deste turno gera uma carga horária semanal média de 40 horas corporativas ativas. As batidas de ponto efetuadas fora das tolerâncias configuradas de 15 minutos serão notificadas como anomalias.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

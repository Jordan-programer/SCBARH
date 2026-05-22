'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';


interface FichaFuncionario {
  id: string;
  nome: string;
  foto: string;
  cargo: string;
  departamento: string;
  email: string;
  telefone: string;
  nif: string;
  dataAdmissao: string;
  dataFim?: string;
  tipoContrato: string;
  salarioBase: number;
  estado: 'ativo' | 'inativo' | 'ferias' | 'licenca';
  genero: 'M' | 'F';
  dataNascimento: string;
  endereco: string;
  supervisor: string;
  nivelEducacao: string;
  experienciaAnos: number;
  observacoes?: string;
}

const fichas: FichaFuncionario[] = [
  { id: 'func-001', nome: 'Amélia Rodrigues Santos', foto: '', cargo: 'Contabilista Sénior', departamento: 'Financeiro', email: 'a.rodrigues@scbarh.ao', telefone: '+244 923 456 789', nif: '123456789LA', dataAdmissao: '15/03/2019', tipoContrato: 'Efectivo', salarioBase: 450000, estado: 'ativo', genero: 'F', dataNascimento: '12/07/1988', endereco: 'Rua da Missão, 45, Luanda', supervisor: 'Manuel Afonso', nivelEducacao: 'Licenciatura', experienciaAnos: 7 },
  { id: 'func-002', nome: 'Domingos Ferreira Lopes', foto: '', cargo: 'Engenheiro de Software', departamento: 'TI', email: 'd.lopes@scbarh.ao', telefone: '+244 912 345 678', nif: '234567890LA', dataAdmissao: '02/07/2020', tipoContrato: 'Efectivo', salarioBase: 520000, estado: 'ativo', genero: 'M', dataNascimento: '03/11/1992', endereco: 'Av. 4 de Fevereiro, 120, Luanda', supervisor: 'Manuel Afonso', nivelEducacao: 'Mestrado', experienciaAnos: 5 },
  { id: 'func-003', nome: 'Carlos Eduardo Teixeira', foto: '', cargo: 'Supervisor de Linha', departamento: 'Operações', email: 'c.teixeira@scbarh.ao', telefone: '+244 934 567 890', nif: '345678901LA', dataAdmissao: '10/01/2021', tipoContrato: 'Efectivo', salarioBase: 380000, estado: 'ferias', genero: 'M', dataNascimento: '25/04/1985', endereco: 'Bairro Maculusso, Luanda', supervisor: 'Pedro Alves', nivelEducacao: 'Bacharelato', experienciaAnos: 9 },
  { id: 'func-004', nome: 'Beatriz Matos Oliveira', foto: '', cargo: 'Gestora de RH', departamento: 'RH', email: 'b.matos@scbarh.ao', telefone: '+244 945 678 901', nif: '456789012LA', dataAdmissao: '22/09/2018', tipoContrato: 'Efectivo', salarioBase: 480000, estado: 'ativo', genero: 'F', dataNascimento: '18/02/1990', endereco: 'Talatona, Luanda Sul', supervisor: 'Manuel Afonso', nivelEducacao: 'Licenciatura', experienciaAnos: 8 },
  { id: 'func-005', nome: 'Filomena Neto da Silva', foto: '', cargo: 'Gestora de Vendas', departamento: 'Comercial', email: 'f.neto@scbarh.ao', telefone: '+244 956 789 012', nif: '567890123LA', dataAdmissao: '05/04/2022', tipoContrato: 'Efectivo', salarioBase: 490000, estado: 'ativo', genero: 'F', dataNascimento: '30/09/1993', endereco: 'Kilamba, Luanda', supervisor: 'Manuel Afonso', nivelEducacao: 'Licenciatura', experienciaAnos: 4 },
  { id: 'func-006', nome: 'Hélder António Cardoso', foto: '', cargo: 'Coordenador de Armazém', departamento: 'Logística', email: 'h.cardoso@scbarh.ao', telefone: '+244 967 890 123', nif: '678901234LA', dataAdmissao: '14/11/2020', tipoContrato: 'Prazo Certo', salarioBase: 350000, estado: 'licenca', genero: 'M', dataNascimento: '07/06/1987', endereco: 'Viana, Luanda', supervisor: 'Pedro Alves', nivelEducacao: 'Bacharelato', experienciaAnos: 6, observacoes: 'Licença médica até 30/06/2026' },
  { id: 'func-007', nome: 'Ivone Maria Ferreira', foto: '', cargo: 'Técnica de Suporte TI', departamento: 'Suporte', email: 'i.ferreira@scbarh.ao', telefone: '+244 978 901 234', nif: '789012345LA', dataAdmissao: '28/06/2021', tipoContrato: 'Efectivo', salarioBase: 360000, estado: 'ativo', genero: 'F', dataNascimento: '14/12/1994', endereco: 'Benfica, Luanda', supervisor: 'Domingos Lopes', nivelEducacao: 'Licenciatura', experienciaAnos: 3 },
  { id: 'func-008', nome: 'Jorge Manuel Sebastião', foto: '', cargo: 'Operador de Produção', departamento: 'Operações', email: 'j.sebastiao@scbarh.ao', telefone: '+244 989 012 345', nif: '890123456LA', dataAdmissao: '03/02/2023', tipoContrato: 'Prazo Certo', salarioBase: 280000, estado: 'ativo', genero: 'M', dataNascimento: '22/08/1998', endereco: 'Cazenga, Luanda', supervisor: 'Carlos Teixeira', nivelEducacao: 'Ensino Médio', experienciaAnos: 2 },
];

const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
  ativo: { label: 'Activo', color: 'text-success', bg: 'bg-success/10' },
  inativo: { label: 'Inactivo', color: 'text-muted-foreground', bg: 'bg-muted' },
  ferias: { label: 'Férias', color: 'text-info', bg: 'bg-info/10' },
  licenca: { label: 'Licença', color: 'text-warning', bg: 'bg-warning/10' },
};

export default function FichasFuncionarios() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [selected, setSelected] = useState<FichaFuncionario | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'lista'>('cards');

  const filtered = useMemo(() => {
    return fichas.filter((f) => {
      const q = search.toLowerCase();
      const matchQ = !q || f.nome.toLowerCase().includes(q) || f.cargo.toLowerCase().includes(q) || f.departamento.toLowerCase().includes(q);
      const matchDept = !deptFilter || f.departamento === deptFilter;
      const matchEstado = !estadoFilter || f.estado === estadoFilter;
      return matchQ && matchDept && matchEstado;
    });
  }, [search, deptFilter, estadoFilter]);

  const departments = [...new Set(fichas.map((f) => f.departamento))];

  const getInitials = (nome: string) => nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

  const avatarColors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-info', 'bg-danger'];
  const getAvatarColor = (id: string) => avatarColors[parseInt(id.replace('func-', '')) % avatarColors.length];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar por nome, cargo ou departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary text-foreground"
        >
          <option value="">Todos os departamentos</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary text-foreground"
        >
          <option value="">Todos os estados</option>
          <option value="ativo">Activo</option>
          <option value="ferias">Férias</option>
          <option value="licenca">Licença</option>
          <option value="inativo">Inactivo</option>
        </select>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={['p-1.5 rounded transition-colors', viewMode === 'cards' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'].join(' ')}
          >
            <Icon name="Squares2X2Icon" size={15} />
          </button>
          <button
            onClick={() => setViewMode('lista')}
            className={['p-1.5 rounded transition-colors', viewMode === 'lista' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'].join(' ')}
          >
            <Icon name="ListBulletIcon" size={15} />
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} ficha{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</p>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((func) => {
            const est = estadoConfig[func.estado];
            return (
              <div
                key={func.id}
                onClick={() => setSelected(func)}
                className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={['w-12 h-12 rounded-xl flex items-center justify-center text-white font-700 text-sm', getAvatarColor(func.id)].join(' ')}>
                    {getInitials(func.nome)}
                  </div>
                  <span className={['text-xs font-500 px-2 py-0.5 rounded-full', est.bg, est.color].join(' ')}>
                    {est.label}
                  </span>
                </div>
                <h4 className="text-sm font-600 text-foreground leading-snug mb-0.5 group-hover:text-primary transition-colors">{func.nome}</h4>
                <p className="text-xs text-muted-foreground mb-3">{func.cargo}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="BuildingOfficeIcon" size={12} />
                    <span>{func.departamento}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="EnvelopeIcon" size={12} />
                    <span className="truncate">{func.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="CalendarIcon" size={12} />
                    <span>Admissão: {func.dataAdmissao}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{func.tipoContrato}</span>
                  <span className="text-xs font-600 text-foreground font-tabular">{func.salarioBase.toLocaleString('pt-AO')} Kz</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'lista' && (
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Funcionário</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Departamento</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Contrato</th>
                  <th className="text-left px-4 py-3 text-xs font-600 text-muted-foreground">Admissão</th>
                  <th className="text-right px-4 py-3 text-xs font-600 text-muted-foreground">Salário Base</th>
                  <th className="text-center px-4 py-3 text-xs font-600 text-muted-foreground">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((func) => {
                  const est = estadoConfig[func.estado];
                  return (
                    <tr key={func.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={['w-8 h-8 rounded-lg flex items-center justify-center text-white font-700 text-xs flex-shrink-0', getAvatarColor(func.id)].join(' ')}>
                            {getInitials(func.nome)}
                          </div>
                          <div>
                            <p className="font-500 text-foreground text-sm">{func.nome}</p>
                            <p className="text-xs text-muted-foreground">{func.cargo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{func.departamento}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{func.tipoContrato}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-tabular">{func.dataAdmissao}</td>
                      <td className="px-4 py-3 text-sm text-foreground font-600 font-tabular text-right">{func.salarioBase.toLocaleString('pt-AO')} Kz</td>
                      <td className="px-4 py-3 text-center">
                        <span className={['text-xs font-500 px-2 py-0.5 rounded-full', est.bg, est.color].join(' ')}>{est.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelected(func)}
                          className="text-xs text-primary hover:underline font-500"
                        >
                          Ver ficha
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Ficha do Funcionário"
        subtitle={selected?.id}
        size="lg"
        footer={
          <>
            <button
              onClick={() => { toast.success('Ficha exportada em PDF.'); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              <Icon name="ArrowDownTrayIcon" size={14} />
              Exportar PDF
            </button>
            <button
              onClick={() => setSelected(null)}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-500"
            >
              Fechar
            </button>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-border">
              <div className={['w-16 h-16 rounded-xl flex items-center justify-center text-white font-700 text-lg flex-shrink-0', getAvatarColor(selected.id)].join(' ')}>
                {getInitials(selected.nome)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-700 text-foreground">{selected.nome}</h3>
                <p className="text-sm text-muted-foreground">{selected.cargo} · {selected.departamento}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={['text-xs font-500 px-2 py-0.5 rounded-full', estadoConfig[selected.estado].bg, estadoConfig[selected.estado].color].join(' ')}>
                    {estadoConfig[selected.estado].label}
                  </span>
                  <span className="text-xs text-muted-foreground">{selected.tipoContrato}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{selected.experienciaAnos} anos de experiência</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon="IdentificationIcon" label="NIF" value={selected.nif} />
              <InfoRow icon="CalendarIcon" label="Data de Nascimento" value={selected.dataNascimento} />
              <InfoRow icon="EnvelopeIcon" label="E-mail" value={selected.email} />
              <InfoRow icon="PhoneIcon" label="Telefone" value={selected.telefone} />
              <InfoRow icon="MapPinIcon" label="Endereço" value={selected.endereco} />
              <InfoRow icon="AcademicCapIcon" label="Nível de Educação" value={selected.nivelEducacao} />
              <InfoRow icon="CalendarDaysIcon" label="Data de Admissão" value={selected.dataAdmissao} />
              <InfoRow icon="UserIcon" label="Supervisor" value={selected.supervisor} />
              <InfoRow icon="BanknotesIcon" label="Salário Base" value={`${selected.salarioBase.toLocaleString('pt-AO')} Kz`} />
              <InfoRow icon="DocumentTextIcon" label="Tipo de Contrato" value={selected.tipoContrato} />
            </div>

            {selected.observacoes && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Icon name="ExclamationTriangleIcon" size={14} className="text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-warning font-500">{selected.observacoes}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={13} className="text-muted-foreground" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-600">{label}</p>
        <p className="text-sm text-foreground font-500 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

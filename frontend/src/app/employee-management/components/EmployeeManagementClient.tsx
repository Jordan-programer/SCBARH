'use client';

import React, { useState, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';

import Modal from '@/components/ui/Modal';
import EmployeeForm from './EmployeeForm';
import EmployeeFilters from './EmployeeFilters';
import BulkActionBar from './BulkActionBar';
import EmployeeTableRow from './EmployeeTableRow';
import DeleteConfirmModal from './DeleteConfirmModal';

export type EmployeeStatus = 'ativo' | 'inativo' | 'bloqueado';
export type BiometricStatus = 'validado' | 'registado' | 'falha';

export interface Employee {
  id: string;
  nome: string;
  nif: string;
  email: string;
  telefone: string;
  departamento: string;
  cargo: string;
  horario: string;
  estado: EmployeeStatus;
  biometrico: BiometricStatus;
  assiduidade: number;
  salarioBase: number;
  dataAdmissao: string;
  turno: string;
}

// Backend integration point — replace with GET /api/employees
const initialEmployees: Employee[] = [
  { id: 'func-001', nome: 'Amélia Rodrigues Santos', nif: '123456789LA', email: 'a.rodrigues@scbarh.ao', telefone: '+244 923 456 789', departamento: 'Financeiro', cargo: 'Contabilista Sénior', horario: 'Standard (08:00–17:00)', estado: 'ativo', biometrico: 'validado', assiduidade: 97, salarioBase: 450000, dataAdmissao: '15/03/2019', turno: 'Diurno' },
  { id: 'func-002', nome: 'Domingos Ferreira Lopes', nif: '234567890LA', email: 'd.lopes@scbarh.ao', telefone: '+244 912 345 678', departamento: 'TI', cargo: 'Engenheiro de Software', horario: 'Flexível (09:00–18:00)', estado: 'ativo', biometrico: 'validado', assiduidade: 94, salarioBase: 520000, dataAdmissao: '02/07/2020', turno: 'Diurno' },
  { id: 'func-003', nome: 'Carlos Eduardo Teixeira', nif: '345678901LA', email: 'c.teixeira@scbarh.ao', telefone: '+244 934 567 890', departamento: 'Operações', cargo: 'Supervisor de Linha', horario: 'Standard (08:00–17:00)', estado: 'ativo', biometrico: 'validado', assiduidade: 78, salarioBase: 380000, dataAdmissao: '10/01/2021', turno: 'Diurno' },
  { id: 'func-004', nome: 'Beatriz Matos Oliveira', nif: '456789012LA', email: 'b.matos@scbarh.ao', telefone: '+244 945 678 901', departamento: 'RH', cargo: 'Técnica de Recursos Humanos', horario: 'Standard (08:00–17:00)', estado: 'ativo', biometrico: 'validado', assiduidade: 96, salarioBase: 410000, dataAdmissao: '22/09/2018', turno: 'Diurno' },
  { id: 'func-005', nome: 'Filomena Neto da Silva', nif: '567890123LA', email: 'f.neto@scbarh.ao', telefone: '+244 956 789 012', departamento: 'Comercial', cargo: 'Gestora de Vendas', horario: 'Comercial (09:00–18:00)', estado: 'ativo', biometrico: 'validado', assiduidade: 91, salarioBase: 490000, dataAdmissao: '05/04/2022', turno: 'Diurno' },
  { id: 'func-006', nome: 'Hélder António Cardoso', nif: '678901234LA', email: 'h.cardoso@scbarh.ao', telefone: '+244 967 890 123', departamento: 'Logística', cargo: 'Coordenador de Armazém', horario: 'Turnos (06:00–14:00)', estado: 'ativo', biometrico: 'registado', assiduidade: 88, salarioBase: 350000, dataAdmissao: '14/11/2020', turno: 'Manhã' },
  { id: 'func-007', nome: 'Ivone Maria Ferreira', nif: '789012345LA', email: 'i.ferreira@scbarh.ao', telefone: '+244 978 901 234', departamento: 'Suporte', cargo: 'Técnica de Suporte TI', horario: 'Standard (08:00–17:00)', estado: 'ativo', biometrico: 'validado', assiduidade: 93, salarioBase: 360000, dataAdmissao: '28/06/2021', turno: 'Diurno' },
  { id: 'func-008', nome: 'Jorge Manuel Sebastião', nif: '890123456LA', email: 'j.sebastiao@scbarh.ao', telefone: '+244 989 012 345', departamento: 'Operações', cargo: 'Operador de Produção', horario: 'Turnos (14:00–22:00)', estado: 'ativo', biometrico: 'falha', assiduidade: 82, salarioBase: 280000, dataAdmissao: '03/02/2023', turno: 'Tarde' },
  { id: 'func-009', nome: 'Lurdes Conceição Pinto', nif: '901234567LA', email: 'l.pinto@scbarh.ao', telefone: '+244 900 123 456', departamento: 'Financeiro', cargo: 'Assistente Financeira', horario: 'Standard (08:00–17:00)', estado: 'inativo', biometrico: 'validado', assiduidade: 0, salarioBase: 320000, dataAdmissao: '17/08/2019', turno: 'Diurno' },
  { id: 'func-010', nome: 'Manuel António Afonso', nif: '012345678LA', email: 'm.afonso@scbarh.ao', telefone: '+244 911 234 567', departamento: 'TI', cargo: 'Administrador de Sistemas', horario: 'Flexível (09:00–18:00)', estado: 'ativo', biometrico: 'validado', assiduidade: 99, salarioBase: 680000, dataAdmissao: '01/01/2017', turno: 'Diurno' },
  { id: 'func-011', nome: 'Natália Sousa Mendes', nif: '112345678LA', email: 'n.mendes@scbarh.ao', telefone: '+244 922 345 678', departamento: 'Comercial', cargo: 'Representante Comercial', horario: 'Comercial (09:00–18:00)', estado: 'ativo', biometrico: 'validado', assiduidade: 90, salarioBase: 420000, dataAdmissao: '12/05/2022', turno: 'Diurno' },
  { id: 'func-012', nome: 'Pedro Augusto Alves', nif: '212345678LA', email: 'p.alves@scbarh.ao', telefone: '+244 933 456 789', departamento: 'Operações', cargo: 'Chefe de Turno', horario: 'Turnos (22:00–06:00)', estado: 'bloqueado', biometrico: 'falha', assiduidade: 61, salarioBase: 390000, dataAdmissao: '20/03/2020', turno: 'Noite' },
];

export type FilterState = {
  search: string;
  departamento: string;
  estado: string;
  biometrico: string;
};

export default function EmployeeManagementClient() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [filters, setFilters] = useState<FilterState>({ search: '', departamento: '', estado: '', biometrico: '' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortCol, setSortCol] = useState<keyof Employee>('nome');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [visibleCols, setVisibleCols] = useState({
    id: true, nome: true, departamento: true, cargo: true,
    horario: true, estado: true, biometrico: true, assiduidade: true,
    salarioBase: true,
  });
  const [colPickerOpen, setColPickerOpen] = useState(false);

  const filtered = useMemo(() => {
    return employees
      .filter((e) => {
        const q = filters.search.toLowerCase();
        const matchSearch = !q || e.nome.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.cargo.toLowerCase().includes(q);
        const matchDept = !filters.departamento || e.departamento === filters.departamento;
        const matchEstado = !filters.estado || e.estado === filters.estado;
        const matchBio = !filters.biometrico || e.biometrico === filters.biometrico;
        return matchSearch && matchDept && matchEstado && matchBio;
      })
      .sort((a, b) => {
        const av = a[sortCol];
        const bv = b[sortCol];
        if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
        return sortDir === 'asc' ? String(av).localeCompare(String(bv),'pt')
          : String(bv).localeCompare(String(av), 'pt');
      });
  }, [employees, filters, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const toggleSort = (col: keyof Employee) => {
    if (sortCol === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((e) => e.id)));
    }
  };

  const handleSave = (data: Partial<Employee>) => {
    if (editingEmployee) {
      setEmployees((prev) => prev.map((e) => e.id === editingEmployee.id ? { ...e, ...data } : e));
      toast.success('Funcionário actualizado com sucesso.');
    } else {
      const newEmp: Employee = {
        id: `func-${String(employees.length + 1).padStart(3, '0')}`,
        assiduidade: 100,
        dataAdmissao: new Date().toLocaleDateString('pt-AO'),
        ...data,
      } as Employee;
      setEmployees((prev) => [newEmp, ...prev]);
      toast.success('Funcionário registado com sucesso.');
    }
    setModalOpen(false);
    setEditingEmployee(null);
  };

  const handleDelete = (emp: Employee) => {
    setDeleteTarget(emp);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(deleteTarget.id); return n; });
    toast.success(`Funcionário ${deleteTarget.nome} removido do sistema.`);
    setDeleteTarget(null);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setModalOpen(true);
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    setEmployees((prev) => prev.filter((e) => !selectedIds.has(e.id)));
    setSelectedIds(new Set());
    toast.success(`${count} ${count === 1 ? 'funcionário removido' : 'funcionários removidos'} do sistema.`);
  };

  const handleBulkStatusChange = (status: EmployeeStatus) => {
    setEmployees((prev) => prev.map((e) => selectedIds.has(e.id) ? { ...e, estado: status } : e));
    toast.success(`Estado actualizado para ${selectedIds.size} funcionário(s).`);
    setSelectedIds(new Set());
  };

  const colLabels: Record<string, string> = {
    id: 'ID', nome: 'Nome', departamento: 'Departamento', cargo: 'Cargo',
    horario: 'Horário', estado: 'Estado', biometrico: 'Biométrico',
    assiduidade: 'Assiduidade', salarioBase: 'Salário Base',
  };

  const SortIcon = ({ col }: { col: keyof Employee }) => {
    if (sortCol !== col) return <Icon name="ChevronUpDownIcon" size={13} className="text-muted-foreground opacity-50" />;
    return sortDir === 'asc'
      ? <Icon name="ChevronUpIcon" size={13} className="text-primary" />
      : <Icon name="ChevronDownIcon" size={13} className="text-primary" />;
  };

  return (
    <>
      <Toaster position="bottom-right" richColors />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Gestão de Funcionários</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {employees.length} funcionários registados · {employees.filter((e) => e.estado === 'ativo').length} activos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
            <Icon name="ArrowDownTrayIcon" size={15} />
            <span>Exportar</span>
          </button>
          <button
            onClick={() => { setEditingEmployee(null); setModalOpen(true); }}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-500 hover:bg-primary/90 transition-colors active:scale-95"
          >
            <Icon name="UserPlusIcon" size={15} />
            <span>Novo Funcionário</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <EmployeeFilters
        filters={filters}
        onFiltersChange={(f) => { setFilters(f); setCurrentPage(1); }}
        employees={employees}
      />

      {/* Table card */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden mt-4">
        {/* Table toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            {/* Column visibility */}
            <div className="relative">
              <button
                onClick={() => setColPickerOpen(!colPickerOpen)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted transition-colors"
              >
                <Icon name="ViewColumnsIcon" size={14} />
                Colunas
              </button>
              {colPickerOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setColPickerOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-modal z-20 p-2 scale-in">
                    {Object.entries(colLabels).map(([col, label]) => (
                      <label key={`col-toggle-${col}`} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-xs text-foreground">
                        <input
                          type="checkbox"
                          checked={visibleCols[col as keyof typeof visibleCols]}
                          onChange={() => setVisibleCols((prev) => ({ ...prev, [col]: !prev[col as keyof typeof visibleCols] }))}
                          className="accent-primary"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onChange={toggleSelectAll}
                    className="accent-primary cursor-pointer"
                  />
                </th>
                {visibleCols.id && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => toggleSort('id')} className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                      ID <SortIcon col="id" />
                    </button>
                  </th>
                )}
                {visibleCols.nome && (
                  <th className="px-4 py-3 text-left min-w-[200px]">
                    <button onClick={() => toggleSort('nome')} className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                      Nome <SortIcon col="nome" />
                    </button>
                  </th>
                )}
                {visibleCols.departamento && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => toggleSort('departamento')} className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                      Departamento <SortIcon col="departamento" />
                    </button>
                  </th>
                )}
                {visibleCols.cargo && (
                  <th className="px-4 py-3 text-left min-w-[160px]">
                    <button onClick={() => toggleSort('cargo')} className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                      Cargo <SortIcon col="cargo" />
                    </button>
                  </th>
                )}
                {visibleCols.horario && (
                  <th className="px-4 py-3 text-left min-w-[140px]">
                    <span className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Horário</span>
                  </th>
                )}
                {visibleCols.estado && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => toggleSort('estado')} className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                      Estado <SortIcon col="estado" />
                    </button>
                  </th>
                )}
                {visibleCols.biometrico && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => toggleSort('biometrico')} className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                      Biométrico <SortIcon col="biometrico" />
                    </button>
                  </th>
                )}
                {visibleCols.assiduidade && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => toggleSort('assiduidade')} className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                      Assiduidade <SortIcon col="assiduidade" />
                    </button>
                  </th>
                )}
                {visibleCols.salarioBase && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => toggleSort('salarioBase')} className="flex items-center gap-1 text-xs font-600 text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                      Salário Base <SortIcon col="salarioBase" />
                    </button>
                  </th>
                )}
                <th className="px-4 py-3 text-center w-24">
                  <span className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Icon name="UsersIcon" size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm font-500 text-foreground">Nenhum funcionário encontrado</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Ajuste os filtros de pesquisa ou registe um novo funcionário no sistema.
                      </p>
                      <button
                        onClick={() => { setEditingEmployee(null); setModalOpen(true); }}
                        className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-500 hover:bg-primary/90 transition-colors mt-1"
                      >
                        <Icon name="UserPlusIcon" size={14} />
                        Registar Funcionário
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((emp, idx) => (
                  <EmployeeTableRow
                    key={emp.id}
                    employee={emp}
                    selected={selectedIds.has(emp.id)}
                    onSelect={() => toggleSelect(emp.id)}
                    onEdit={() => handleEdit(emp)}
                    onDelete={() => handleDelete(emp)}
                    visibleCols={visibleCols}
                    striped={idx % 2 !== 0}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Mostrar</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-border rounded-md px-2 py-1 text-xs bg-input text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={`perpage-${n}`} value={n}>{n}</option>
                ))}
              </select>
              <span>de {filtered.length} registos</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronDoubleLeftIcon" size={14} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronLeftIcon" size={14} className="text-muted-foreground" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const page = Math.max(1, Math.min(currentPage - 2, totalPages - 2) + i + 1);
                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(page)}
                    className={[
                      'w-7 h-7 rounded-md text-xs font-500 transition-colors',
                      currentPage === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground',
                    ].join(' ')}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronRightIcon" size={14} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronDoubleRightIcon" size={14} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      <BulkActionBar
        count={selectedIds.size}
        onDelete={handleBulkDelete}
        onStatusChange={handleBulkStatusChange}
        onClear={() => setSelectedIds(new Set())}
      />

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEmployee(null); }}
        title={editingEmployee ? 'Editar Funcionário' : 'Registar Novo Funcionário'}
        subtitle={editingEmployee ? `ID: ${editingEmployee.id}` : 'Preencha todos os campos obrigatórios'}
        size="xl"
      >
        <EmployeeForm
          employee={editingEmployee}
          onSave={handleSave}
          onCancel={() => { setModalOpen(false); setEditingEmployee(null); }}
        />
      </Modal>

      {/* Delete confirm modal */}
      <DeleteConfirmModal
        employee={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
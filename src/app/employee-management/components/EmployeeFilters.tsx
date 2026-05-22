'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import type { Employee, FilterState } from './EmployeeManagementClient';

interface EmployeeFiltersProps {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  employees: Employee[];
}

const departments = ['Financeiro', 'TI', 'Operações', 'RH', 'Comercial', 'Logística', 'Suporte'];

export default function EmployeeFilters({ filters, onFiltersChange, employees }: EmployeeFiltersProps) {
  const update = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFilterCount = [filters.departamento, filters.estado, filters.biometrico].filter(Boolean).length;

  const clearAll = () => {
    onFiltersChange({ search: '', departamento: '', estado: '', biometrico: '' });
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name="MagnifyingGlassIcon" size={16} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por nome, e-mail, ID ou cargo..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-input border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground text-foreground transition-all"
          />
          {filters.search && (
            <button
              onClick={() => update('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="XMarkIcon" size={14} />
            </button>
          )}
        </div>

        {/* Department filter */}
        <select
          value={filters.departamento}
          onChange={(e) => update('departamento', e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-input text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[160px]"
        >
          <option value="">Todos os Departamentos</option>
          {departments.map((d) => (
            <option key={`dept-opt-${d}`} value={d}>{d}</option>
          ))}
        </select>

        {/* Estado filter */}
        <select
          value={filters.estado}
          onChange={(e) => update('estado', e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-input text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[140px]"
        >
          <option value="">Todos os Estados</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="bloqueado">Bloqueado</option>
        </select>

        {/* Biometric filter */}
        <select
          value={filters.biometrico}
          onChange={(e) => update('biometrico', e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-input text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[150px]"
        >
          <option value="">Biométrico: Todos</option>
          <option value="validado">Validado</option>
          <option value="registado">Registado</option>
          <option value="falha">Com Falha</option>
        </select>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filtros activos:</span>
          {filters.departamento && (
            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {filters.departamento}
              <button onClick={() => update('departamento', '')} className="hover:opacity-70 transition-opacity">
                <Icon name="XMarkIcon" size={11} />
              </button>
            </span>
          )}
          {filters.estado && (
            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
              {filters.estado}
              <button onClick={() => update('estado', '')} className="hover:opacity-70 transition-opacity">
                <Icon name="XMarkIcon" size={11} />
              </button>
            </span>
          )}
          {filters.biometrico && (
            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
              Bio: {filters.biometrico}
              <button onClick={() => update('biometrico', '')} className="hover:opacity-70 transition-opacity">
                <Icon name="XMarkIcon" size={11} />
              </button>
            </span>
          )}
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-danger transition-colors underline"
          >
            Limpar tudo
          </button>
        </div>
      )}
    </div>
  );
}
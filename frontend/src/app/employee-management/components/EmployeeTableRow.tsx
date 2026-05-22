'use client';

import React from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import Icon from '@/components/ui/AppIcon';
import type { Employee } from './EmployeeManagementClient';

interface EmployeeTableRowProps {
  employee: Employee;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  visibleCols: Record<string, boolean>;
  striped: boolean;
  isReadOnly?: boolean;
}

export default function EmployeeTableRow({
  employee: emp,
  selected,
  onSelect,
  onEdit,
  onDelete,
  visibleCols,
  striped,
  isReadOnly = false,
}: EmployeeTableRowProps) {
  const initials = emp.nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const avatarColors = [
    'bg-primary/20 text-primary',
    'bg-success/20 text-success',
    'bg-warning/20 text-warning',
    'bg-info/20 text-info',
  ];
  const colorIdx = emp.id.charCodeAt(emp.id.length - 1) % avatarColors.length;

  return (
    <tr
      className={[
        'border-b border-border/50 last:border-0 transition-colors group',
        selected ? 'bg-primary/5' : striped ? 'bg-muted/20 hover:bg-muted/40' : 'hover:bg-muted/30',
      ].join(' ')}
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="accent-primary cursor-pointer"
        />
      </td>

      {visibleCols.id && (
        <td className="px-4 py-3">
          <span className="text-xs font-tabular text-muted-foreground font-500">{emp.id}</span>
        </td>
      )}

      {visibleCols.nome && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className={['w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0', avatarColors[colorIdx]].join(' ')}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-500 text-foreground truncate max-w-[180px]">{emp.nome}</p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{emp.email}</p>
            </div>
          </div>
        </td>
      )}

      {visibleCols.departamento && (
        <td className="px-4 py-3">
          <span className="text-sm text-foreground">{emp.departamento}</span>
        </td>
      )}

      {visibleCols.cargo && (
        <td className="px-4 py-3">
          <span className="text-sm text-foreground truncate block max-w-[150px]">{emp.cargo}</span>
        </td>
      )}

      {visibleCols.horario && (
        <td className="px-4 py-3">
          <span className="text-xs text-muted-foreground">{emp.horario}</span>
        </td>
      )}

      {visibleCols.estado && (
        <td className="px-4 py-3">
          <StatusBadge variant={emp.estado} size="sm" />
        </td>
      )}

      {visibleCols.biometrico && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Icon
              name={emp.biometrico === 'validado' ? 'FingerPrintIcon' : emp.biometrico === 'registado' ? 'FingerPrintIcon' : 'ExclamationTriangleIcon'}
              size={14}
              className={emp.biometrico === 'validado' ? 'text-success' : emp.biometrico === 'registado' ? 'text-info' : 'text-danger'}
            />
            <StatusBadge variant={emp.biometrico} size="sm" />
          </div>
        </td>
      )}

      {visibleCols.assiduidade && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 min-w-[80px]">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${emp.assiduidade}%`,
                  backgroundColor:
                    emp.assiduidade >= 95
                      ? 'var(--success)'
                      : emp.assiduidade >= 85
                      ? 'var(--warning)'
                      : 'var(--danger)',
                }}
              />
            </div>
            <span
              className={[
                'text-xs font-600 font-tabular w-9 text-right',
                emp.assiduidade >= 95 ? 'text-success' : emp.assiduidade >= 85 ? 'text-warning' : 'text-danger',
              ].join(' ')}
            >
              {emp.assiduidade}%
            </span>
          </div>
        </td>
      )}

      {visibleCols.salarioBase && (
        <td className="px-4 py-3">
          <span className="text-sm font-tabular font-500 text-foreground">
            Kz {emp.salarioBase.toLocaleString('pt-AO')}
          </span>
        </td>
      )}

      {/* Actions — visible on hover */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isReadOnly && (
            <button
              onClick={onEdit}
              title="Editar funcionário"
              className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90"
            >
              <Icon name="PencilSquareIcon" size={15} />
            </button>
          )}
          <button
            title="Ver histórico de assiduidade"
            className="p-1.5 rounded-md hover:bg-info/10 text-muted-foreground hover:text-info transition-all active:scale-90"
          >
            <Icon name="ClipboardDocumentListIcon" size={15} />
          </button>
          {!isReadOnly && (
            <button
              onClick={onDelete}
              title="Remover funcionário — esta ação não pode ser desfeita"
              className="p-1.5 rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all active:scale-90"
            >
              <Icon name="TrashIcon" size={15} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
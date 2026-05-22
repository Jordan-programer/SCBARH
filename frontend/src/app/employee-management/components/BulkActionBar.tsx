'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import type { EmployeeStatus } from './EmployeeManagementClient';

interface BulkActionBarProps {
  count: number;
  onDelete: () => void;
  onStatusChange: (status: EmployeeStatus) => void;
  onClear: () => void;
}

export default function BulkActionBar({ count, onDelete, onStatusChange, onClear }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 slide-up">
      <div className="flex items-center gap-3 bg-foreground text-primary-foreground rounded-xl px-5 py-3 shadow-modal">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[11px] font-700 text-white">
            {count}
          </span>
          <span className="text-sm font-500">
            {count === 1 ? '1 funcionário seleccionado' : `${count} funcionários seleccionados`}
          </span>
        </div>

        <div className="w-px h-5 bg-white/20" />

        <button
          onClick={() => onStatusChange('ativo')}
          className="flex items-center gap-1.5 text-xs font-500 text-white/80 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
        >
          <Icon name="CheckCircleIcon" size={14} />
          Activar
        </button>
        <button
          onClick={() => onStatusChange('inativo')}
          className="flex items-center gap-1.5 text-xs font-500 text-white/80 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
        >
          <Icon name="PauseCircleIcon" size={14} />
          Desactivar
        </button>
        <button
          onClick={() => onStatusChange('bloqueado')}
          className="flex items-center gap-1.5 text-xs font-500 text-white/80 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
        >
          <Icon name="LockClosedIcon" size={14} />
          Bloquear
        </button>

        <div className="w-px h-5 bg-white/20" />

        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 text-xs font-500 text-red-300 hover:text-red-200 transition-colors px-2 py-1 rounded-md hover:bg-red-900/30"
        >
          <Icon name="TrashIcon" size={14} />
          Remover
        </button>

        <button
          onClick={onClear}
          className="p-1 rounded-md hover:bg-white/10 transition-colors ml-1"
          title="Cancelar selecção"
        >
          <Icon name="XMarkIcon" size={16} className="text-white/60 hover:text-white" />
        </button>
      </div>
    </div>
  );
}
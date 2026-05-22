'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import type { Employee } from './EmployeeManagementClient';

interface DeleteConfirmModalProps {
  employee: Employee | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ employee, onConfirm, onCancel }: DeleteConfirmModalProps) {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 fade-in" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-card rounded-xl shadow-modal scale-in p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-danger-bg flex items-center justify-center">
            <Icon name="ExclamationTriangleIcon" size={28} className="text-danger" />
          </div>
          <div>
            <h3 className="text-lg font-700 text-foreground mb-1">Remover Funcionário</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tem a certeza que pretende remover{' '}
              <span className="font-600 text-foreground">{employee.nome}</span>{' '}
              ({employee.id}) do sistema? Esta acção removerá todos os registos associados e não pode ser desfeita.
            </p>
          </div>

          <div className="w-full bg-muted/50 rounded-lg px-4 py-3 text-left space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Departamento</span>
              <span className="font-500 text-foreground">{employee.departamento}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Cargo</span>
              <span className="font-500 text-foreground">{employee.cargo}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Admissão</span>
              <span className="font-500 text-foreground">{employee.dataAdmissao}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-500 text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-lg bg-danger text-white text-sm font-600 hover:bg-danger/90 transition-colors active:scale-[0.98]"
            >
              Sim, Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
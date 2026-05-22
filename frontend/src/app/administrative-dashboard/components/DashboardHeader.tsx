'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function DashboardHeader() {
    const { user } = useAuth();
    const [department, setDepartment] = useState<string>('Operações');

    useEffect(() => {
        if (user?.funcionario_id) {
            api.get(`/funcionarios/${user.funcionario_id}`)
                .then((emp: any) => {
                    if (emp?.departamento) {
                        setDepartment(emp.departamento);
                    }
                })
                .catch((err) => {
                    console.error('Error fetching employee department:', err);
                });
        }
    }, [user]);

    const isGestor = user?.role === 'GESTOR';

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl font-700 text-foreground">
                    {isGestor ? `Painel do Gestor — ${department}` : 'Painel Administrativo'}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {isGestor
                        ? `Visão geral de assiduidade e férias da equipa de ${department} — 22 de Maio de 2026`
                        : 'Visão geral de assiduidade, biométrico e folha salarial — 22 de Maio de 2026'}
                </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground">
                    <Icon name="CalendarDaysIcon" size={15} />
                    <span>Maio 2026</span>
                    <Icon name="ChevronDownIcon" size={14} />
                </div>
                <button className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
                    <Icon name="ArrowDownTrayIcon" size={15} />
                    <span>Exportar</span>
                </button>
                {!isGestor && (
                    <Link
                        href="/employee-management"
                        className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-500 hover:bg-primary/90 transition-colors active:scale-95"
                    >
                        <Icon name="UserPlusIcon" size={15} />
                        <span>Novo Funcionário</span>
                    </Link>
                )}
            </div>
        </div>
    );
}
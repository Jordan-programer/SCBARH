import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function DashboardHeader() {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl font-700 text-foreground">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Visão geral de assiduidade, biométrico e folha salarial — 21 de Maio de 2026
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
                <Link
                    href="/employee-management"
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-500 hover:bg-primary/90 transition-colors active:scale-95"
                >
                    <Icon name="UserPlusIcon" size={15} />
                    <span>Novo Funcionário</span>
                </Link>
            </div>
        </div>
    );
}
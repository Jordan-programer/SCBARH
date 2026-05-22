'use client';

import React, { useState } from 'react';
import { Toaster } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import RHKPICards from './RHKPICards';
import FichasFuncionarios from './FichasFuncionarios';
import GestaoFerias from './GestaoFerias';
import GestaoContratos from './GestaoContratos';
import OrganigramaDepto from './OrganigramaDepto';

type TabKey = 'visao-geral' | 'fichas' | 'ferias' | 'contratos' | 'organigrama';

interface Tab {
  key: TabKey;
  label: string;
  icon: string;
  badge?: number;
}

const tabs: Tab[] = [
  { key: 'visao-geral', label: 'Visão Geral', icon: 'ChartBarSquareIcon' },
  { key: 'fichas', label: 'Fichas de Funcionários', icon: 'IdentificationIcon' },
  { key: 'ferias', label: 'Férias & Ausências', icon: 'CalendarDaysIcon', badge: 4 },
  { key: 'contratos', label: 'Contratos', icon: 'DocumentTextIcon' },
  { key: 'organigrama', label: 'Organigrama', icon: 'BuildingOffice2Icon' },
];

export default function RHClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('visao-geral');

  return (
    <>
      <Toaster position="bottom-right" richColors />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="UserGroupIcon" size={18} className="text-primary" />
            </div>
            <h1 className="text-2xl font-700 text-foreground">Recursos Humanos</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestão integrada de pessoas, contratos, férias e estrutura organizacional
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
            <Icon name="ArrowDownTrayIcon" size={15} />
            <span>Exportar</span>
          </button>
          <button className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
            <Icon name="PrinterIcon" size={15} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 mb-6 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-500 transition-all whitespace-nowrap flex-shrink-0',
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            ].join(' ')}
          >
            <Icon name={tab.icon as Parameters<typeof Icon>[0]['name']} size={15} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={[
                'text-[10px] font-700 rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none',
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-danger text-white',
              ].join(' ')}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'visao-geral' && <RHKPICards />}
      {activeTab === 'fichas' && <FichasFuncionarios />}
      {activeTab === 'ferias' && <GestaoFerias />}
      {activeTab === 'contratos' && <GestaoContratos />}
      {activeTab === 'organigrama' && <OrganigramaDepto />}
    </>
  );
}

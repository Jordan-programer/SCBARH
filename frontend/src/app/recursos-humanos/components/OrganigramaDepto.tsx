'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Membro {
  id: string;
  nome: string;
  cargo: string;
  nivel: number;
  parentId?: string;
  departamento: string;
  email: string;
  estado: 'ativo' | 'ferias' | 'licenca';
  subordinados: number;
}

const membros: Membro[] = [
  { id: 'm-001', nome: 'Manuel Afonso', cargo: 'Director Geral', nivel: 0, departamento: 'Direcção', email: 'm.afonso@scbarh.ao', estado: 'ativo', subordinados: 5 },
  { id: 'm-002', nome: 'Beatriz Matos', cargo: 'Gestora de RH', nivel: 1, parentId: 'm-001', departamento: 'RH', email: 'b.matos@scbarh.ao', estado: 'ativo', subordinados: 3 },
  { id: 'm-003', nome: 'Amélia Santos', cargo: 'Contabilista Sénior', nivel: 1, parentId: 'm-001', departamento: 'Financeiro', email: 'a.rodrigues@scbarh.ao', estado: 'ativo', subordinados: 2 },
  { id: 'm-004', nome: 'Domingos Lopes', cargo: 'Eng. de Software', nivel: 1, parentId: 'm-001', departamento: 'TI', email: 'd.lopes@scbarh.ao', estado: 'ativo', subordinados: 4 },
  { id: 'm-005', nome: 'Carlos Teixeira', cargo: 'Supervisor de Linha', nivel: 1, parentId: 'm-001', departamento: 'Operações', email: 'c.teixeira@scbarh.ao', estado: 'ferias', subordinados: 8 },
  { id: 'm-006', nome: 'Filomena Silva', cargo: 'Gestora de Vendas', nivel: 1, parentId: 'm-001', departamento: 'Comercial', email: 'f.neto@scbarh.ao', estado: 'ativo', subordinados: 5 },
  { id: 'm-007', nome: 'Ivone Ferreira', cargo: 'Técnica de Suporte', nivel: 2, parentId: 'm-004', departamento: 'TI', email: 'i.ferreira@scbarh.ao', estado: 'ativo', subordinados: 0 },
  { id: 'm-008', nome: 'Sónia Pereira', cargo: 'Desenvolvedora Frontend', nivel: 2, parentId: 'm-004', departamento: 'TI', email: 's.pereira@scbarh.ao', estado: 'ativo', subordinados: 0 },
  { id: 'm-009', nome: 'Jorge Sebastião', cargo: 'Operador de Produção', nivel: 2, parentId: 'm-005', departamento: 'Operações', email: 'j.sebastiao@scbarh.ao', estado: 'ativo', subordinados: 0 },
  { id: 'm-010', nome: 'Hélder Cardoso', cargo: 'Coord. de Armazém', nivel: 2, parentId: 'm-005', departamento: 'Logística', email: 'h.cardoso@scbarh.ao', estado: 'licenca', subordinados: 3 },
  { id: 'm-011', nome: 'Natália Mendes', cargo: 'Representante Comercial', nivel: 2, parentId: 'm-006', departamento: 'Comercial', email: 'n.mendes@scbarh.ao', estado: 'ativo', subordinados: 0 },
];

const deptColors: Record<string, string> = {
  'Direcção': 'bg-primary',
  'RH': 'bg-success',
  'Financeiro': 'bg-warning',
  'TI': 'bg-info',
  'Operações': 'bg-danger',
  'Comercial': 'bg-primary',
  'Logística': 'bg-warning',
};

const estadoBadge: Record<string, { label: string; color: string; bg: string }> = {
  ativo: { label: 'Activo', color: 'text-success', bg: 'bg-success/10' },
  ferias: { label: 'Férias', color: 'text-info', bg: 'bg-info/10' },
  licenca: { label: 'Licença', color: 'text-warning', bg: 'bg-warning/10' },
};

const departments = [
  { nome: 'Direcção', total: 1, cor: 'bg-primary', icon: 'BuildingOffice2Icon' },
  { nome: 'TI', total: 24, cor: 'bg-info', icon: 'ComputerDesktopIcon' },
  { nome: 'Financeiro', total: 18, cor: 'bg-warning', icon: 'BanknotesIcon' },
  { nome: 'Operações', total: 35, cor: 'bg-danger', icon: 'CogIcon' },
  { nome: 'RH', total: 8, cor: 'bg-success', icon: 'UsersIcon' },
  { nome: 'Comercial', total: 22, cor: 'bg-primary', icon: 'ShoppingBagIcon' },
  { nome: 'Logística', total: 14, cor: 'bg-warning', icon: 'TruckIcon' },
  { nome: 'Suporte', total: 6, cor: 'bg-success', icon: 'WrenchScrewdriverIcon' },
];

function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function OrgNode({ membro, allMembros, depth = 0 }: { membro: Membro; allMembros: Membro[]; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const children = allMembros.filter((m) => m.parentId === membro.id);
  const est = estadoBadge[membro.estado];
  const avatarColor = deptColors[membro.departamento] || 'bg-primary';

  return (
    <div className="flex flex-col items-center">
      {/* Node card */}
      <div className="relative group">
        <div className="bg-card border border-border rounded-xl p-3 shadow-card hover:shadow-md hover:border-primary/30 transition-all w-44 text-center">
          <div className={['w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white font-700 text-sm', avatarColor].join(' ')}>
            {getInitials(membro.nome)}
          </div>
          <p className="text-xs font-600 text-foreground leading-snug">{membro.nome}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{membro.cargo}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className={['text-[9px] font-500 px-1.5 py-0.5 rounded-full', est.bg, est.color].join(' ')}>
              {est.label}
            </span>
          </div>
          {membro.subordinados > 0 && (
            <p className="text-[9px] text-muted-foreground mt-1">{membro.subordinados} subordinados</p>
          )}
        </div>
        {children.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors z-10"
          >
            <Icon name={expanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={10} />
          </button>
        )}
      </div>

      {/* Children */}
      {children.length > 0 && expanded && (
        <div className="mt-6 relative">
          {/* Vertical line from parent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-border" />
          {/* Horizontal connector */}
          {children.length > 1 && (
            <div
              className="absolute top-3 bg-border h-px"
              style={{
                left: `calc(50% - ${((children.length - 1) * 192) / 2}px)`,
                width: `${(children.length - 1) * 192}px`,
              }}
            />
          )}
          <div className="flex gap-6 pt-3">
            {children.map((child) => (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* Vertical line to child */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-border" />
                <div className="mt-3">
                  <OrgNode membro={child} allMembros={allMembros} depth={depth + 1} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrganigramaDepto() {
  const [view, setView] = useState<'organigrama' | 'departamentos'>('organigrama');
  const root = membros.find((m) => m.nivel === 0);

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          <button
            onClick={() => setView('organigrama')}
            className={['flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-500 transition-all', view === 'organigrama' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'].join(' ')}
          >
            <Icon name="ShareIcon" size={14} />
            Organigrama
          </button>
          <button
            onClick={() => setView('departamentos')}
            className={['flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-500 transition-all', view === 'departamentos' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'].join(' ')}
          >
            <Icon name="BuildingOffice2Icon" size={14} />
            Departamentos
          </button>
        </div>
      </div>

      {/* Organigrama view */}
      {view === 'organigrama' && (
        <div className="bg-card border border-border rounded-xl shadow-card p-6 overflow-x-auto">
          <div className="min-w-max flex justify-center">
            {root && <OrgNode membro={root} allMembros={membros} />}
          </div>
          <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-3 justify-center">
            {Object.entries(deptColors).map(([dept, color]) => (
              <div key={dept} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={['w-3 h-3 rounded-sm', color].join(' ')} />
                {dept}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Departments view */}
      {view === 'departamentos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept) => {
            const deptMembros = membros.filter((m) => m.departamento === dept.nome);
            return (
              <div key={dept.nome} className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={['w-10 h-10 rounded-xl flex items-center justify-center text-white', dept.cor].join(' ')}>
                    <Icon name={dept.icon as Parameters<typeof Icon>[0]['name']} size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-600 text-foreground">{dept.nome}</h4>
                    <p className="text-xs text-muted-foreground">{dept.total} funcionários</p>
                  </div>
                </div>
                {deptMembros.length > 0 && (
                  <div className="space-y-2">
                    {deptMembros.slice(0, 3).map((m) => {
                      const est = estadoBadge[m.estado];
                      return (
                        <div key={m.id} className="flex items-center gap-2">
                          <div className={['w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-700 flex-shrink-0', dept.cor].join(' ')}>
                            {getInitials(m.nome)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-500 text-foreground truncate">{m.nome}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{m.cargo}</p>
                          </div>
                          <span className={['text-[9px] font-500 px-1 py-0.5 rounded-full flex-shrink-0', est.bg, est.color].join(' ')}>
                            {est.label}
                          </span>
                        </div>
                      );
                    })}
                    {dept.total > 3 && (
                      <p className="text-[10px] text-muted-foreground text-center pt-1">
                        +{dept.total - 3} mais
                      </p>
                    )}
                  </div>
                )}
                {deptMembros.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">Sem membros no organigrama</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

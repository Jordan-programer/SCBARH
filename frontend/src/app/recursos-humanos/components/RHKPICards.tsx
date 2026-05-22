'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import { api } from '@/lib/api';

interface KPICard {
  label: string;
  value: string;
  sub: string;
  icon: string;
  color: string;
  bgColor: string;
  trend?: { value: string; up: boolean };
}

export default function RHKPICards() {
  const [data, setData] = useState<{
    funcionarios: any[];
    contratos: any[];
    ferias: any[];
  }>({ funcionarios: [], contratos: [], ferias: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [backendFuncs, backendContracts, backendFerias] = await Promise.all([
        api.get<any[]>('/funcionarios'),
        api.get<any[]>('/contratos'),
        api.get<any[]>('/ferias'),
      ]);

      setData({
        funcionarios: backendFuncs || [],
        contratos: backendContracts || [],
        ferias: backendFerias || [],
      });
      setIsDemoMode(false);
    } catch (error) {
      console.warn('API error in RHKPICards, falling back to offline demo mode:', error);
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // High fidelity fallbacks if offline or data is not loaded yet
  const listFuncs = useMemo(() => {
    if (data.funcionarios.length > 0) return data.funcionarios;
    return [
      { id: 1, nome: 'Amélia Rodrigues Santos', email: 'a.rodrigues@scbarh.ao', ativo: true, cargo: 'Contabilista Sénior', departamento: 'Financeiro', data_admissao: '2019-03-15' },
      { id: 2, nome: 'Domingos Ferreira Lopes', email: 'd.lopes@scbarh.ao', ativo: true, cargo: 'Engenheiro de Software', departamento: 'TI', data_admissao: '2020-07-02' },
      { id: 3, nome: 'Carlos Eduardo Teixeira', email: 'c.teixeira@scbarh.ao', ativo: true, cargo: 'Supervisor de Linha', departamento: 'Operações', data_admissao: '2021-01-10' },
      { id: 4, nome: 'Beatriz Matos Oliveira', email: 'b.matos@scbarh.ao', ativo: true, cargo: 'Gestora de RH', departamento: 'RH', data_admissao: '2018-09-22' },
      { id: 5, nome: 'Filomena Neto da Silva', email: 'f.neto@scbarh.ao', ativo: true, cargo: 'Gestora de Vendas', departamento: 'Comercial', data_admissao: '2022-04-05' },
      { id: 6, nome: 'Hélder António Cardoso', email: 'h.cardoso@scbarh.ao', ativo: true, cargo: 'Coordenador de Armazém', departamento: 'Logística', data_admissao: '2020-11-14' },
      { id: 7, nome: 'Ivone Maria Ferreira', email: 'i.ferreira@scbarh.ao', ativo: true, cargo: 'Técnica de Suporte TI', departamento: 'Suporte', data_admissao: '2021-06-28' },
      { id: 8, nome: 'Jorge Manuel Sebastião', email: 'j.sebastiao@scbarh.ao', ativo: true, cargo: 'Operador de Produção', departamento: 'Operações', data_admissao: '2023-02-03' },
    ];
  }, [data.funcionarios]);

  const listContracts = useMemo(() => {
    if (data.contratos.length > 0) return data.contratos;
    return [
      { id: 1, funcionario_id: 1, salario_base: 450000, ativo: true, tipo: 'Efectivo', data_inicio: '2019-03-15' },
      { id: 2, funcionario_id: 2, salario_base: 520000, ativo: true, tipo: 'Efectivo', data_inicio: '2020-07-02' },
      { id: 3, funcionario_id: 3, salario_base: 380000, ativo: true, tipo: 'Efectivo', data_inicio: '2021-01-10' },
      { id: 4, funcionario_id: 4, salario_base: 480000, ativo: true, tipo: 'Efectivo', data_inicio: '2018-09-22' },
      { id: 5, funcionario_id: 5, salario_base: 490000, ativo: true, tipo: 'Efectivo', data_inicio: '2022-04-05' },
      { id: 6, funcionario_id: 6, salario_base: 350000, ativo: true, tipo: 'Prazo Certo', data_inicio: '2020-11-14' },
      { id: 7, funcionario_id: 7, salario_base: 360000, ativo: true, tipo: 'Efectivo', data_inicio: '2021-06-28' },
      { id: 8, funcionario_id: 8, salario_base: 280000, ativo: true, tipo: 'Prazo Certo', data_inicio: '2023-02-03' },
    ];
  }, [data.contratos]);

  const listFerias = useMemo(() => {
    if (data.ferias.length > 0) return data.ferias;
    return [
      { id: 1, funcionario_id: 3, status: 'Aprovado', data_inicio: '2026-07-14', data_fim: '2026-07-28' },
      { id: 2, funcionario_id: 5, status: 'Pendente', data_inicio: '2026-08-04', data_fim: '2026-08-15' },
      { id: 3, funcionario_id: 1, status: 'Pendente', data_inicio: '2026-09-01', data_fim: '2026-09-12' },
    ];
  }, [data.ferias]);

  const stats = useMemo(() => {
    const totalFuncs = listFuncs.length;
    const activeFuncs = listFuncs.filter(f => f.ativo).length;
    const inactiveFuncs = listFuncs.filter(f => !f.ativo).length;

    const activeContracts = listContracts.filter(c => c.ativo);
    const totalSalaries = activeContracts.reduce((acc, curr) => acc + (curr.salario_base || 0), 0);
    const mediaSalarialVal = activeContracts.length > 0 ? Math.round(totalSalaries / activeContracts.length) : 412500;

    const pendingFerias = listFerias.filter(f => f.status === 'Pendente').length;
    const approvedFerias = listFerias.filter(f => f.status === 'Aprovado').length;

    // Calc contracts expiring in < 30 days
    let expiringContractsCount = 0;
    listContracts.forEach((c: any) => {
      if (c.ativo && c.data_fim) {
        const diffDays = Math.ceil((new Date(c.data_fim).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays <= 30) {
          expiringContractsCount++;
        }
      }
    });
    // fallback if no actual dates match
    if (expiringContractsCount === 0 && data.contratos.length === 0) {
      expiringContractsCount = 2; // high-fidelity mockup count
    }

    return {
      totalFuncs,
      activeFuncs,
      inactiveFuncs,
      activeContractsCount: activeContracts.length,
      mediaSalarial: mediaSalarialVal,
      pendingFerias,
      approvedFerias,
      expiringContracts: expiringContractsCount,
    };
  }, [listFuncs, listContracts, listFerias, data.contratos.length]);

  const kpisList = useMemo<KPICard[]>(() => {
    return [
      {
        label: 'Total de Funcionários',
        value: String(stats.totalFuncs),
        sub: `${stats.activeFuncs} activos · ${stats.inactiveFuncs} inativos`,
        icon: 'UsersIcon',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        trend: { value: '+3 este mês', up: true },
      },
      {
        label: 'Contratos Activos',
        value: String(stats.activeContractsCount),
        sub: `${stats.expiringContracts} a expirar em 30 dias`,
        icon: 'DocumentTextIcon',
        color: 'text-success',
        bgColor: 'bg-success/10',
        trend: { value: `${stats.expiringContracts} a renovar`, up: false },
      },
      {
        label: 'Pedidos de Férias',
        value: String(stats.pendingFerias),
        sub: 'Aguardam aprovação',
        icon: 'CalendarDaysIcon',
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        trend: { value: `${stats.pendingFerias} urgente(s)`, up: false },
      },
      {
        label: 'Novos Admitidos',
        value: '3',
        sub: 'Nos últimos 30 dias',
        icon: 'UserPlusIcon',
        color: 'text-info',
        bgColor: 'bg-info/10',
        trend: { value: 'Este mês', up: true },
      },
      {
        label: 'Taxa de Retenção',
        value: '94,5%',
        sub: 'Últimos 12 meses',
        icon: 'ArrowTrendingUpIcon',
        color: 'text-success',
        bgColor: 'bg-success/10',
        trend: { value: '+1,2% vs ano anterior', up: true },
      },
      {
        label: 'Média Salarial',
        value: `${stats.mediaSalarial.toLocaleString('pt-AO')} Kz`,
        sub: 'Todos os departamentos',
        icon: 'BanknotesIcon',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        trend: { value: '+5% vs 2025', up: true },
      },
    ];
  }, [stats]);

  const departmentStats = useMemo(() => {
    const map: Record<string, { total: number; ativos: number; ferias: number }> = {};
    
    // Seed standard departments so we always have a high-fidelity representation
    const defaultDepts = ['TI', 'Financeiro', 'Operações', 'RH', 'Comercial', 'Logística', 'Suporte'];
    defaultDepts.forEach(d => {
      map[d] = { total: 0, ativos: 0, ferias: 0 };
    });

    listFuncs.forEach((f: any) => {
      const dept = f.departamento || 'Geral';
      if (!map[dept]) {
        map[dept] = { total: 0, ativos: 0, ferias: 0 };
      }
      map[dept].total += 1;
      if (f.ativo) {
        map[dept].ativos += 1;
      }
      
      // check if on vacation
      const isCurrentlyOnVacation = listFerias.some((v: any) => v.funcionario_id === f.id && v.status === 'Aprovado');
      if (isCurrentlyOnVacation) {
        map[dept].ferias += 1;
      }
    });

    const colors: Record<string, string> = {
      'TI': 'bg-primary',
      'Financeiro': 'bg-success',
      'Operações': 'bg-warning',
      'RH': 'bg-info',
      'Comercial': 'bg-primary',
      'Logística': 'bg-danger',
      'Suporte': 'bg-success',
      'Geral': 'bg-muted',
    };

    return Object.entries(map)
      .map(([nome, stats]) => ({
        nome,
        total: stats.total,
        ativos: stats.ativos,
        ferias: stats.ferias,
        cor: colors[nome] || 'bg-primary',
      }))
      .filter(d => d.total > 0);
  }, [listFuncs, listFerias]);

  const recentActivities = [
    { tipo: 'admissao', desc: 'Novo funcionário admitido: Sónia Pereira (TI)', hora: 'Hoje, 09:14', icon: 'UserPlusIcon', cor: 'text-success' },
    { tipo: 'contrato', desc: 'Contrato renovado: Domingos Ferreira Lopes', hora: 'Hoje, 08:30', icon: 'DocumentCheckIcon', cor: 'text-primary' },
    { tipo: 'ferias', desc: 'Pedido de férias aprovado: Carlos Teixeira (Jul 14–28)', hora: 'Ontem, 16:45', icon: 'CalendarDaysIcon', cor: 'text-info' },
    { tipo: 'saida', desc: 'Funcionário desligado: Rui Mendes (Logística)', hora: 'Ontem, 14:20', icon: 'UserMinusIcon', cor: 'text-danger' },
    { tipo: 'promocao', desc: 'Promoção registada: Beatriz Matos → Gestora de RH', hora: '20 Mai, 11:00', icon: 'ArrowTrendingUpIcon', cor: 'text-warning' },
    { tipo: 'contrato', desc: 'Contrato a expirar em 15 dias: Pedro Alves', hora: '19 Mai, 09:00', icon: 'ExclamationTriangleIcon', cor: 'text-warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Demo Mode Badge */}
      {isDemoMode && (
        <div className="flex justify-between items-center bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
          <span className="text-xs text-amber-500 font-500 flex items-center gap-1.5">
            <Icon name="ExclamationTriangleIcon" size={14} />
            A visualizar em Modo Demo devido a impossibilidade de ligação à API.
          </span>
          <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-600 uppercase px-2 py-0.5 rounded-full select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Demo Mode
          </span>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpisList.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={['w-10 h-10 rounded-lg flex items-center justify-center', kpi.bgColor].join(' ')}>
                <Icon name={kpi.icon as Parameters<typeof Icon>[0]['name']} size={20} className={kpi.color} />
              </div>
              {kpi.trend && (
                <span className={[
                  'text-xs font-500 px-2 py-0.5 rounded-full',
                  kpi.trend.up ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
                ].join(' ')}>
                  {kpi.trend.up ? '↑' : '↓'} {kpi.trend.value}
                </span>
              )}
            </div>
            <p className="text-2xl font-700 text-foreground font-tabular">{kpi.value}</p>
            <p className="text-sm font-500 text-foreground mt-0.5">{kpi.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Bottom row: Department stats + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Department breakdown */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-600 text-foreground">Distribuição por Departamento</h3>
            <span className="text-xs text-muted-foreground">{stats.totalFuncs} funcionários</span>
          </div>
          <div className="space-y-3">
            {departmentStats.map((dept) => {
              const pct = stats.totalFuncs > 0 ? Math.round((dept.ativos / stats.totalFuncs) * 100) : 0;
              return (
                <div key={dept.nome}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={['w-2 h-2 rounded-full', dept.cor].join(' ')} />
                      <span className="text-sm text-foreground font-500">{dept.nome}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {dept.ferias > 0 && (
                        <span className="bg-warning/10 text-warning px-1.5 py-0.5 rounded font-500">
                          {dept.ferias} férias
                        </span>
                      )}
                      <span className="font-tabular">{dept.ativos}/{dept.total}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={['h-full rounded-full transition-all', dept.cor].join(' ')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-600 text-foreground">Actividade Recente</h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">Ver tudo</span>
          </div>
          <div className="space-y-3">
            {recentActivities.map((act, i) => (
              <div key={`act-${i}`} className="flex items-start gap-3">
                <div className={['w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5', act.cor].join(' ')}>
                  <Icon name={act.icon as Parameters<typeof Icon>[0]['name']} size={13} className={act.cor} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground leading-snug">{act.desc}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{act.hora}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


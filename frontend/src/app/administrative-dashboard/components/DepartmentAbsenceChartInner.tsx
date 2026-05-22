'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

// Backend integration point — replace with API call for department-level attendance summary
const deptData = [
    { dept: 'Operações', faltas: 12, atrasos: 8, taxa: 88 },
    { dept: 'Logística', faltas: 7, atrasos: 5, taxa: 92 },
    { dept: 'Financeiro', faltas: 3, atrasos: 2, taxa: 96 },
    { dept: 'TI', faltas: 2, atrasos: 3, taxa: 97 },
    { dept: 'RH', faltas: 1, atrasos: 1, taxa: 98 },
    { dept: 'Comercial', faltas: 9, atrasos: 6, taxa: 90 },
    { dept: 'Suporte', faltas: 5, atrasos: 4, taxa: 94 },
];

const barColors = ['#DC2626', '#DC2626', '#16A34A', '#16A34A', '#16A34A', '#DC2626', '#D97706'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border rounded-lg shadow-modal px-4 py-3 text-xs">
            <p className="font-600 text-foreground mb-2">{label}</p>
            {payload.map((entry) => (
                <div key={`deptip-${entry.name}`} className="flex justify-between gap-6 mb-1">
                    <span className="text-muted-foreground">{entry.name}</span>
                    <span className="font-600 text-foreground font-tabular">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function DepartmentAbsenceChartInner() {
    return (
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h3 className="text-base font-600 text-foreground">Faltas por Departamento</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Acumulado de Maio 2026</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-danger inline-block" />
                        <span className="text-muted-foreground">Crítico (&gt;8)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-success inline-block" />
                        <span className="text-muted-foreground">Normal</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                        dataKey="dept"
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="faltas" name="Faltas" radius={[4, 4, 0, 0]}>
                        {deptData.map((entry, i) => (
                            <Cell key={`cell-dept-${entry.dept}`} fill={barColors[i]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Department summary table */}
            <div className="mt-4 overflow-x-auto scrollbar-thin">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left pb-2 font-500 text-muted-foreground">Departamento</th>
                            <th className="text-right pb-2 font-500 text-muted-foreground">Faltas</th>
                            <th className="text-right pb-2 font-500 text-muted-foreground">Atrasos</th>
                            <th className="text-right pb-2 font-500 text-muted-foreground">Taxa Assiduidade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deptData.map((d) => (
                            <tr key={`dept-row-${d.dept}`} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="py-1.5 font-500 text-foreground">{d.dept}</td>
                                <td className="py-1.5 text-right font-tabular">
                                    <span className={d.faltas > 8 ? 'text-danger font-600' : 'text-foreground'}>{d.faltas}</span>
                                </td>
                                <td className="py-1.5 text-right font-tabular text-muted-foreground">{d.atrasos}</td>
                                <td className="py-1.5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${d.taxa}%`,
                                                    backgroundColor: d.taxa >= 95 ? 'var(--success)' : d.taxa >= 90 ? 'var(--warning)' : 'var(--danger)',
                                                }}
                                            />
                                        </div>
                                        <span className={['font-600 font-tabular', d.taxa >= 95 ? 'text-success' : d.taxa >= 90 ? 'text-warning' : 'text-danger'].join(' ')}>
                                            {d.taxa}%
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
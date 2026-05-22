'use client';
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ChartDataPoint {
  date: string;
  presenca: number;
  atrasos: number;
  faltas: number;
}

const mockData: ChartDataPoint[] = [
  { date: '07 Mai', presenca: 94, atrasos: 4, faltas: 2 },
  { date: '08 Mai', presenca: 96, atrasos: 3, faltas: 1 },
  { date: '09 Mai', presenca: 95, atrasos: 5, faltas: 0 },
  { date: '12 Mai', presenca: 92, atrasos: 7, faltas: 1 },
  { date: '13 Mai', presenca: 97, atrasos: 2, faltas: 1 },
  { date: '14 Mai', presenca: 95, atrasos: 4, faltas: 1 },
  { date: '15 Mai', presenca: 98, atrasos: 1, faltas: 1 },
  { date: '16 Mai', presenca: 93, atrasos: 6, faltas: 1 },
  { date: '19 Mai', presenca: 94, atrasos: 5, faltas: 1 },
  { date: '20 Mai', presenca: 96, atrasos: 3, faltas: 1 },
  { date: '21 Mai', presenca: 97, atrasos: 2, faltas: 1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-md border border-border p-3.5 rounded-lg shadow-modal max-w-[200px]">
        <p className="text-xs font-700 text-foreground mb-2 border-b border-border pb-1">{label}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Presença
            </span>
            <span className="text-xs font-600 text-foreground">{payload[0].value}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning" />
              Atrasos
            </span>
            <span className="text-xs font-600 text-foreground">{payload[1].value} func.</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-danger" />
              Faltas
            </span>
            <span className="text-xs font-600 text-foreground">{payload[0].payload.faltas} func.</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function AttendanceTrendChartInner() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-600 text-foreground">Tendência de Assiduidade</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Últimos 15 dias úteis (Média Geral: 95.2%)</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-500">Média Assiduidade</p>
            <p className="text-base font-700 text-primary">95.2%</p>
          </div>
          <div className="border-l border-border pl-4 text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-500">Total Atrasos</p>
            <p className="text-base font-700 text-warning">42</p>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={mockData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPresenca" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorAtrasos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--warning)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[80, 100]}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              content={({ payload }) => (
                <div className="flex justify-center gap-6 mt-4">
                  <span className="flex items-center gap-2 text-xs font-500 text-muted-foreground">
                    <span className="w-3 h-1.5 rounded-sm bg-primary" />
                    Taxa de Presença (%)
                  </span>
                  <span className="flex items-center gap-2 text-xs font-500 text-muted-foreground">
                    <span className="w-3 h-1.5 rounded-sm bg-warning" />
                    Funcionários com Atraso
                  </span>
                </div>
              )}
            />
            <Area
              type="monotone"
              dataKey="presenca"
              stroke="var(--primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPresenca)"
            />
            <Area
              type="monotone"
              dataKey="atrasos"
              stroke="var(--warning)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAtrasos)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import React from 'react';

type BadgeVariant = 'presente'| 'falta' | 'atraso' | 'saida-antecipada' | 'hora-extra' | 'ativo' | 'inativo' | 'bloqueado' | 'registado' | 'validado' | 'falha' | 'pendente' |
  'processado' | 'aprovado' | 'em-processamento';

const variantStyles: Record<BadgeVariant, string> = {
  'presente': 'bg-success-bg text-success border-success/20',
  'falta': 'bg-danger-bg text-danger border-danger/20',
  'atraso': 'bg-warning-bg text-warning border-warning/20',
  'saida-antecipada': 'bg-warning-bg text-warning border-warning/20',
  'hora-extra': 'bg-info-bg text-info border-info/20',
  'ativo': 'bg-success-bg text-success border-success/20',
  'inativo': 'bg-muted text-muted-foreground border-border',
  'bloqueado': 'bg-danger-bg text-danger border-danger/20',
  'registado': 'bg-info-bg text-info border-info/20',
  'validado': 'bg-success-bg text-success border-success/20',
  'falha': 'bg-danger-bg text-danger border-danger/20',
  'pendente': 'bg-warning-bg text-warning border-warning/20',
  'processado': 'bg-info-bg text-info border-info/20',
  'aprovado': 'bg-success-bg text-success border-success/20',
  'em-processamento': 'bg-primary/10 text-primary border-primary/20',
};

const variantLabels: Record<BadgeVariant, string> = {
  'presente': 'Presente',
  'falta': 'Falta',
  'atraso': 'Atraso',
  'saida-antecipada': 'Saída Antecipada',
  'hora-extra': 'Hora Extra',
  'ativo': 'Ativo',
  'inativo': 'Inativo',
  'bloqueado': 'Bloqueado',
  'registado': 'Registado',
  'validado': 'Validado',
  'falha': 'Falha',
  'pendente': 'Pendente',
  'processado': 'Processado',
  'aprovado': 'Aprovado',
  'em-processamento': 'Em Processamento',
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({ variant, size = 'md', className = '' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span className={['inline-flex items-center font-500 rounded-full border', sizeClass, variantStyles[variant], className].join(' ')}>
      {variantLabels[variant]}
    </span>
  );
}
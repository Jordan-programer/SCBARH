'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import type { Employee } from './EmployeeManagementClient';

interface EmployeeFormProps {
  employee: Employee | null;
  onSave: (data: Partial<Employee>) => void;
  onCancel: () => void;
}

type FormData = Omit<Employee, 'id' | 'assiduidade' | 'dataAdmissao'>;

const departments = ['Financeiro', 'TI', 'Operações', 'RH', 'Comercial', 'Logística', 'Suporte'];
const schedules = [
  'Standard (08:00–17:00)',
  'Flexível (09:00–18:00)',
  'Comercial (09:00–18:00)',
  'Turnos (06:00–14:00)',
  'Turnos (14:00–22:00)',
  'Turnos (22:00–06:00)',
];
const shifts = ['Diurno', 'Manhã', 'Tarde', 'Noite'];

const STEPS = [
  { key: 'pessoal', label: 'Dados Pessoais', icon: 'UserIcon' },
  { key: 'emprego', label: 'Dados de Emprego', icon: 'BriefcaseIcon' },
  { key: 'salario', label: 'Salário & Horário', icon: 'BanknotesIcon' },
  { key: 'biometrico', label: 'Biométrico', icon: 'FingerPrintIcon' },
];

export default function EmployeeForm({ employee, onSave, onCancel }: EmployeeFormProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: employee
      ? {
          nome: employee.nome,
          nif: employee.nif,
          email: employee.email,
          telefone: employee.telefone,
          departamento: employee.departamento,
          cargo: employee.cargo,
          horario: employee.horario,
          estado: employee.estado,
          biometrico: employee.biometrico,
          salarioBase: employee.salarioBase,
          turno: employee.turno,
        }
      : {
          estado: 'ativo',
          biometrico: 'registado',
          turno: 'Diurno',
          departamento: 'TI',
          horario: 'Standard (08:00–17:00)',
        },
  });

  const stepFields: Record<string, (keyof FormData)[]> = {
    pessoal: ['nome', 'nif', 'email', 'telefone'],
    emprego: ['departamento', 'cargo', 'estado'],
    salario: ['salarioBase', 'horario', 'turno'],
    biometrico: ['biometrico'],
  };

  const goNext = async () => {
    const fields = stepFields[STEPS[step].key];
    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    // Backend integration point — replace with POST /api/employees or PUT /api/employees/:id
    await new Promise((res) => setTimeout(res, 800));
    onSave(data);
    setIsSubmitting(false);
  };

  const FieldError = ({ name }: { name: keyof FormData }) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-danger flex items-center gap-1">
        <Icon name="ExclamationCircleIcon" size={12} />
        {errors[name]?.message as string}
      </p>
    ) : null;

  const inputClass = (name: keyof FormData) =>
    [
      'w-full px-3 py-2.5 text-sm bg-input border rounded-lg outline-none transition-all text-foreground placeholder:text-muted-foreground',
      errors[name]
        ? 'border-danger focus:ring-2 focus:ring-danger/30' :'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
    ].join(' ');

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-6">
        {STEPS.map((s, i) => (
          <React.Fragment key={`step-indicator-${s.key}`}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500 transition-all',
                i === step
                  ? 'bg-primary text-primary-foreground'
                  : i < step
                  ? 'text-success cursor-pointer hover:bg-success-bg' :'text-muted-foreground cursor-default',
              ].join(' ')}
            >
              {i < step ? (
                <Icon name="CheckCircleIcon" size={14} className="text-success" />
              ) : (
                <Icon name={s.icon as Parameters<typeof Icon>[0]['name']} size={14} />
              )}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={['flex-1 h-px mx-1 transition-colors', i < step ? 'bg-success' : 'bg-border'].join(' ')} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0 — Dados Pessoais */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-500 text-foreground mb-1.5">
                Nome Completo <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Introduza o nome completo conforme o documento de identificação</p>
              <input
                type="text"
                placeholder="Ex: Amélia Rodrigues Santos"
                {...register('nome', { required: 'O nome é obrigatório.', minLength: { value: 3, message: 'Mínimo 3 caracteres.' } })}
                className={inputClass('nome')}
              />
              <FieldError name="nome" />
            </div>

            <div>
              <label className="block text-sm font-500 text-foreground mb-1.5">
                NIF <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Número de Identificação Fiscal angolano</p>
              <input
                type="text"
                placeholder="Ex: 123456789LA"
                {...register('nif', { required: 'O NIF é obrigatório.', pattern: { value: /^\d{9}[A-Z]{2}$/, message: 'Formato: 9 dígitos + 2 letras (ex: 123456789LA)' } })}
                className={inputClass('nif')}
              />
              <FieldError name="nif" />
            </div>

            <div>
              <label className="block text-sm font-500 text-foreground mb-1.5">
                Telefone <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Número de contacto directo</p>
              <input
                type="tel"
                placeholder="+244 9XX XXX XXX"
                {...register('telefone', { required: 'O telefone é obrigatório.' })}
                className={inputClass('telefone')}
              />
              <FieldError name="telefone" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-500 text-foreground mb-1.5">
                Endereço de E-mail <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">E-mail institucional — será usado para notificações do sistema</p>
              <input
                type="email"
                placeholder="nome.sobrenome@empresa.ao"
                {...register('email', {
                  required: 'O e-mail é obrigatório.',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato de e-mail inválido.' },
                })}
                className={inputClass('email')}
              />
              <FieldError name="email" />
            </div>
          </div>
        </div>
      )}

      {/* Step 1 — Dados de Emprego */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-500 text-foreground mb-1.5">
                Departamento <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Unidade organizacional do funcionário</p>
              <select
                {...register('departamento', { required: 'O departamento é obrigatório.' })}
                className={inputClass('departamento')}
              >
                {departments.map((d) => (
                  <option key={`dept-form-${d}`} value={d}>{d}</option>
                ))}
              </select>
              <FieldError name="departamento" />
            </div>

            <div>
              <label className="block text-sm font-500 text-foreground mb-1.5">
                Estado da Conta <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Define o acesso ao sistema biométrico</p>
              <select
                {...register('estado', { required: 'O estado é obrigatório.' })}
                className={inputClass('estado')}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
              <FieldError name="estado" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-500 text-foreground mb-1.5">
                Cargo / Função <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Título oficial do cargo conforme contrato de trabalho</p>
              <input
                type="text"
                placeholder="Ex: Engenheiro de Software Sénior"
                {...register('cargo', { required: 'O cargo é obrigatório.', minLength: { value: 2, message: 'Mínimo 2 caracteres.' } })}
                className={inputClass('cargo')}
              />
              <FieldError name="cargo" />
            </div>
          </div>

          <div className="bg-info-bg border border-info/20 rounded-lg px-4 py-3 flex items-start gap-2.5">
            <Icon name="InformationCircleIcon" size={15} className="text-info flex-shrink-0 mt-0.5" />
            <p className="text-xs text-info leading-relaxed">
              O cargo definido aqui será utilizado nos relatórios de assiduidade e na folha salarial. Certifique-se que corresponde ao contrato de trabalho.
            </p>
          </div>
        </div>
      )}

      {/* Step 2 — Salário & Horário */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-500 text-foreground mb-1.5">
                Salário Base (Kz) <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Valor bruto mensal em Kwanzas — descontos e acréscimos são calculados automaticamente</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-500">Kz</span>
                <input
                  type="number"
                  placeholder="350000"
                  {...register('salarioBase', {
                    required: 'O salário base é obrigatório.',
                    min: { value: 70000, message: 'Salário mínimo: Kz 70.000 (salário mínimo nacional).' },
                    max: { value: 5000000, message: 'Valor máximo permitido: Kz 5.000.000.' },
                    valueAsNumber: true,
                  })}
                  className={['pl-9', inputClass('salarioBase')].join(' ')}
                />
              </div>
              <FieldError name="salarioBase" />
            </div>

            <div>
              <label className="block text-sm font-500 text-foreground mb-1.5">
                Horário de Trabalho <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Determina os limites de entrada/saída para deteção de atrasos</p>
              <select
                {...register('horario', { required: 'O horário é obrigatório.' })}
                className={inputClass('horario')}
              >
                {schedules.map((s) => (
                  <option key={`sched-${s}`} value={s}>{s}</option>
                ))}
              </select>
              <FieldError name="horario" />
            </div>

            <div>
              <label className="block text-sm font-500 text-foreground mb-1.5">
                Turno <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-1.5">Período de trabalho principal</p>
              <select
                {...register('turno', { required: 'O turno é obrigatório.' })}
                className={inputClass('turno')}
              >
                {shifts.map((s) => (
                  <option key={`shift-${s}`} value={s}>{s}</option>
                ))}
              </select>
              <FieldError name="turno" />
            </div>
          </div>

          <div className="bg-warning-bg border border-warning/20 rounded-lg px-4 py-3 flex items-start gap-2.5">
            <Icon name="ExclamationTriangleIcon" size={15} className="text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-warning leading-relaxed">
              O salário base e horário definidos aqui serão usados no processamento automático da folha salarial. Alterações retroactivas requerem aprovação do Director de RH.
            </p>
          </div>
        </div>
      )}

      {/* Step 3 — Biométrico */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-500 text-foreground mb-1.5">
              Estado Biométrico
            </label>
            <p className="text-xs text-muted-foreground mb-1.5">Estado actual do registo de impressão digital no sistema</p>
            <select
              {...register('biometrico')}
              className={inputClass('biometrico')}
            >
              <option value="registado">Registado — aguarda validação</option>
              <option value="validado">Validado — impressão digital confirmada</option>
              <option value="falha">Falha — requer novo registo</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                key: 'bio-reg',
                icon: 'FingerPrintIcon',
                title: 'Registar Impressão',
                desc: 'Capturar nova impressão digital via dispositivo biométrico',
                color: 'text-primary',
                bg: 'bg-primary/5 border-primary/20',
              },
              {
                key: 'bio-test',
                icon: 'CheckBadgeIcon',
                title: 'Testar Leitura',
                desc: 'Verificar se a impressão digital está a ser reconhecida corretamente',
                color: 'text-success',
                bg: 'bg-success-bg border-success/20',
              },
              {
                key: 'bio-clear',
                icon: 'TrashIcon',
                title: 'Limpar Dados',
                desc: 'Remover impressão digital registada — o funcionário não conseguirá marcar presença',
                color: 'text-danger',
                bg: 'bg-danger-bg border-danger/20',
              },
            ].map((action) => (
              <button
                key={action.key}
                type="button"
                className={['rounded-xl border p-4 text-left hover:shadow-sm transition-all active:scale-[0.98]', action.bg].join(' ')}
              >
                <Icon name={action.icon as Parameters<typeof Icon>[0]['name']} size={20} className={action.color} />
                <p className={['text-sm font-600 mt-2 mb-1', action.color].join(' ')}>{action.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{action.desc}</p>
              </button>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg px-4 py-3">
            <p className="text-xs font-600 text-foreground mb-2">Integração com Dispositivo Biométrico</p>
            <div className="space-y-1.5">
              {[
                { id: 'bio-dev-001', name: 'BIO-01 — Entrada Principal', status: 'online' },
                { id: 'bio-dev-002', name: 'BIO-02 — Saída Lateral', status: 'online' },
                { id: 'bio-dev-003', name: 'BIO-03 — Portaria', status: 'offline' },
              ].map((dev) => (
                <div key={dev.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{dev.name}</span>
                  <span className={['flex items-center gap-1 font-500', dev.status === 'online' ? 'text-success' : 'text-danger'].join(' ')}>
                    <span className={['w-1.5 h-1.5 rounded-full inline-block', dev.status === 'online' ? 'bg-success' : 'bg-danger'].join(' ')} />
                    {dev.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))}
            </div>
            {/* Backend integration point — connect to fingerprint SDK/API for actual biometric capture */}
          </div>
        </div>
      )}

      {/* Form navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <button
          type="button"
          onClick={step === 0 ? onCancel : () => setStep((s) => s - 1)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-500 text-foreground hover:bg-muted transition-colors"
        >
          <Icon name={step === 0 ? 'XMarkIcon' : 'ChevronLeftIcon'} size={15} />
          {step === 0 ? 'Cancelar' : 'Anterior'}
        </button>

        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={`step-dot-${i}`}
              className={['w-2 h-2 rounded-full transition-all', i === step ? 'bg-primary w-4' : i < step ? 'bg-success' : 'bg-muted'].join(' ')}
            />
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-500 hover:bg-primary/90 transition-colors active:scale-[0.98]"
          >
            Seguinte
            <Icon name="ChevronRightIcon" size={15} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className={[
              'flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-600 hover:bg-primary/90 transition-all active:scale-[0.98]',
              isSubmitting ? 'opacity-80 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {isSubmitting ? (
              <>
                <Icon name="ArrowPathIcon" size={15} className="animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Icon name="CheckIcon" size={15} />
                {employee ? 'Guardar Alterações' : 'Registar Funcionário'}
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
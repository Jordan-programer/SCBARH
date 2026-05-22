from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date

from app.models.salario import Salario
from app.models.funcionario import Funcionario
from app.models.contrato import Contrato
from app.models.ausencia import Ausencia
from app.schemas.salario import SalarioProcessRequest
from app.utils.audit import log_audit


class SalarioService:
    @staticmethod
    def calcular_irt(materia: float) -> float:
        """Calcula o Imposto sobre o Rendimento de Trabalho (IRT) de Angola (Tabela 2024)."""
        if materia <= 100000.0:
            return 0.0
        elif materia <= 150000.0:
            return (materia - 100000.0) * 0.10
        elif materia <= 200000.0:
            return 5000.0 + (materia - 150000.0) * 0.13
        elif materia <= 300000.0:
            return 11500.0 + (materia - 200000.0) * 0.16
        elif materia <= 500000.0:
            return 27500.0 + (materia - 300000.0) * 0.18
        elif materia <= 1000000.0:
            return 63500.0 + (materia - 500000.0) * 0.19
        elif materia <= 1500000.0:
            return 158500.0 + (materia - 1000000.0) * 0.20
        elif materia <= 2000000.0:
            return 258500.0 + (materia - 1500000.0) * 0.21
        elif materia <= 5000000.0:
            return 363500.0 + (materia - 2000000.0) * 0.22
        else:
            return 1023500.0 + (materia - 5000000.0) * 0.25

    @staticmethod
    async def processar_salario_funcionario(
        db: AsyncSession, request: SalarioProcessRequest, executor_id: int
    ) -> Salario:
        """Processa a folha de salário de um funcionário para o mês/ano indicados."""
        # Verificar se funcionário existe
        func_query = select(Funcionario).where(
            Funcionario.id == request.funcionario_id, Funcionario.ativo == True
        )
        func_res = await db.execute(func_query)
        funcionario = func_res.scalar_one_or_none()
        if not funcionario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funcionário não encontrado ou inativo.",
            )

        # Buscar contrato ativo
        contrato_query = select(Contrato).where(
            Contrato.funcionario_id == request.funcionario_id, Contrato.ativo == True
        )
        contrato_res = await db.execute(contrato_query)
        contrato = contrato_res.scalar_one_or_none()
        if not contrato:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O funcionário selecionado não possui um contrato de trabalho ativo.",
            )

        # Verificar se salário já foi processado para este mês
        existing_query = select(Salario).where(
            Salario.funcionario_id == request.funcionario_id,
            Salario.mes == request.mes,
            Salario.ano == request.ano,
        )
        existing_res = await db.execute(existing_query)
        if existing_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"O salário para este funcionário já foi processado em {request.mes}/{request.ano}.",
            )

        # Buscar ausências injustificadas no mês para aplicar deduções
        # Vamos assumir primeiro dia e último dia do mês
        data_inicio_mes = date(request.ano, request.mes, 1)
        # Próximo mês para calcular fim do mês
        if request.mes == 12:
            data_fim_mes = date(request.ano, 12, 31)
        else:
            # último dia aproximado/simplificado ou exato
            import calendar

            _, ultimo_dia = calendar.monthrange(request.ano, request.mes)
            data_fim_mes = date(request.ano, request.mes, ultimo_dia)

        ausencias_query = select(Ausencia).where(
            Ausencia.funcionario_id == request.funcionario_id,
            Ausencia.justificada == False,
            Ausencia.data_inicio >= data_inicio_mes,
            Ausencia.data_fim <= data_fim_mes,
            Ausencia.status == "Aprovada",
        )
        ausencias_res = await db.execute(ausencias_query)
        ausencias = list(ausencias_res.scalars().all())

        dias_falta = 0
        for aus in ausencias:
            dias_falta += (aus.data_fim - aus.data_inicio).days + 1

        # Cálculo da dedução das faltas: (salário base / 30) * dias_falta
        deducao_faltas = round((contrato.salario_base / 30.0) * dias_falta, 2)

        # 1. Segurança Social (3% Funcionário, 8% Empresa sobre Salário Base)
        ss_func = round(contrato.salario_base * 0.03, 2)
        ss_emp = round(contrato.salario_base * 0.08, 2)

        # 2. Tributação do IRT em Angola
        # Isenções em Angola: Subsídio Alimentação até 30.000 AOA, Transporte até 30.000 AOA
        alim_tributavel = max(0.0, contrato.subsidio_alimentacao - 30000.0)
        trans_tributavel = max(0.0, contrato.subsidio_transporte - 30000.0)

        # Matéria coletável = Salário Base + Parte tributável dos subsídios + Bónus - Segurança Social (3%) - Deduções por faltas
        materia_colectavel = max(
            0.0,
            contrato.salario_base
            + alim_tributavel
            + trans_tributavel
            + contrato.outros_subsidios
            + request.bonus
            - ss_func
            - deducao_faltas,
        )

        irt = round(SalarioService.calcular_irt(materia_colectavel), 2)

        # 3. Salário Bruto = Salário Base + Todos Subsídios + Bónus
        salario_bruto = (
            contrato.salario_base
            + contrato.subsidio_alimentacao
            + contrato.subsidio_transporte
            + contrato.outros_subsidios
            + request.bonus
        )

        # 4. Salário Líquido = Salário Bruto - SS 3% - IRT - Dedução Faltas - Outras Deduções
        salario_liquido = max(
            0.0,
            salario_bruto - ss_func - irt - deducao_faltas - request.outras_deducoes,
        )

        try:
            salario = Salario(
                funcionario_id=request.funcionario_id,
                mes=request.mes,
                ano=request.ano,
                salario_base=contrato.salario_base,
                subsidio_alimentacao=contrato.subsidio_alimentacao,
                subsidio_transporte=contrato.subsidio_transporte,
                outros_subsidios=contrato.outros_subsidios,
                bonus=request.bonus,
                seguranca_social_func=ss_func,
                seguranca_social_emp=ss_emp,
                irt=irt,
                faltas_deducao=deducao_faltas,
                outras_deducoes=request.outras_deducoes,
                salario_bruto=salario_bruto,
                salario_liquido=salario_liquido,
                status="Processado",
                processado_por=executor_id,
            )

            db.add(salario)
            await db.commit()
            await db.refresh(salario)

            # Auditar processamento
            await log_audit(
                db=db,
                usuario_id=executor_id,
                acao="SALARIO_PROCESSAR",
                modulo="Processamento Salarial",
                descricao=f"Processado salário do funcionário ID {request.funcionario_id} para {request.mes}/{request.ano}. Líquido: {salario_liquido} AOA.",
            )

            return salario
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao salvar a folha de salário: {str(e)}",
            )

from datetime import date
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.funcionario import Funcionario
from app.models.assiduidade import Assiduidade
from app.models.salario import Salario
from app.schemas.relatorio import RelatorioAssiduidadeSummary, RelatorioSalarioSummary


class RelatorioService:
    @staticmethod
    async def gerar_resumo_assiduidade(
        db: AsyncSession, inicio: date, fim: date, departamento: Optional[str] = None
    ) -> List[RelatorioAssiduidadeSummary]:
        """Gera um resumo consolidado do registo de assiduidade dos funcionários no período."""
        # Query base de funcionários
        func_query = select(Funcionario).where(Funcionario.ativo == True)
        if departamento:
            func_query = func_query.where(Funcionario.departamento == departamento)

        func_res = await db.execute(func_query)
        funcionarios = list(func_res.scalars().all())

        summaries: List[RelatorioAssiduidadeSummary] = []

        for f in funcionarios:
            # Query para calcular estatísticas de assiduidade
            stats_query = select(
                func.count(Assiduidade.id).filter(Assiduidade.status.in_(["Presente", "Atraso"])),
                func.count(Assiduidade.id).filter(Assiduidade.status == "Falta"),
                func.count(Assiduidade.id).filter(Assiduidade.status == "Atraso"),
                func.sum(Assiduidade.horas_trabalhadas),
                func.sum(Assiduidade.horas_extras),
            ).where(
                Assiduidade.funcionario_id == f.id,
                Assiduidade.data >= inicio,
                Assiduidade.data <= fim,
            )

            stats_res = await db.execute(stats_query)
            stats = stats_res.fetchone()

            dias_trabalhados = stats[0] or 0
            faltas = stats[1] or 0
            atrasos = stats[2] or 0
            total_horas = float(stats[3] or 0.0)
            total_extras = float(stats[4] or 0.0)

            summaries.append(
                RelatorioAssiduidadeSummary(
                    funcionario_id=f.id,
                    funcionario_nome=f.nome,
                    cargo=f.cargo,
                    departamento=f.departamento,
                    dias_trabalhados=dias_trabalhados,
                    faltas=faltas,
                    atrasos=atrasos,
                    total_horas_trabalhadas=round(total_horas, 2),
                    total_horas_extras=round(total_extras, 2),
                )
            )

        return summaries

    @staticmethod
    async def gerar_resumo_financeiro(
        db: AsyncSession, mes: int, ano: int, departamento: Optional[str] = None
    ) -> List[RelatorioSalarioSummary]:
        """Gera um resumo de custos e folhas de salários dos funcionários no mês/ano."""
        query = (
            select(
                Salario.funcionario_id,
                Funcionario.nome,
                Salario.mes,
                Salario.ano,
                Salario.salario_base,
                Salario.subsidio_alimentacao,
                Salario.subsidio_transporte,
                Salario.outros_subsidios,
                Salario.bonus,
                (Salario.seguranca_social_func + Salario.irt + Salario.faltas_deducao + Salario.outras_deducoes).label("deducoes_totais"),
                Salario.salario_liquido,
            )
            .join(Funcionario, Salario.funcionario_id == Funcionario.id)
            .where(Salario.mes == mes, Salario.ano == ano)
        )

        if departamento:
            query = query.where(Funcionario.departamento == departamento)

        res = await db.execute(query)
        rows = res.all()

        return [
            RelatorioSalarioSummary(
                funcionario_id=r[0],
                funcionario_nome=r[1],
                mes=r[2],
                ano=r[3],
                salario_base=float(r[4]),
                subsidio_alimentacao=float(r[5]),
                subsidio_transporte=float(r[6]),
                outros_subsidios=float(r[7]),
                bonus=float(r[8]),
                deducoes_totais=float(r[9]),
                salario_liquido=float(r[10]),
            )
            for r in rows
        ]

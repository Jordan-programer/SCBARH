from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, RoleChecker
from app.models.usuario import RoleEnum
from app.schemas.relatorio import RelatorioAssiduidadeSummary, RelatorioSalarioSummary
from app.services.relatorio_service import RelatorioService

router = APIRouter(prefix="/relatorios", tags=["Relatórios de Negócio"])

# Apenas administradores e gestores podem gerar relatórios consolidados
gestor_guard = Depends(RoleChecker([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH, RoleEnum.GESTOR]))


@router.get("/assiduidade", response_model=List[RelatorioAssiduidadeSummary], dependencies=[gestor_guard])
async def get_relatorio_assiduidade(
    inicio: date,
    fim: date,
    departamento: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Gera um relatório consolidado com contagens de dias trabalhados, faltas e horas extras por funcionário."""
    return await RelatorioService.gerar_resumo_assiduidade(db, inicio, fim, departamento)


@router.get("/financeiro", response_model=List[RelatorioSalarioSummary], dependencies=[gestor_guard])
async def get_relatorio_financeiro(
    mes: int,
    ano: int,
    departamento: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Gera um relatório consolidado com os custos financeiros de folhas salariais por funcionário e departamento."""
    return await RelatorioService.gerar_resumo_financeiro(db, mes, ano, departamento)

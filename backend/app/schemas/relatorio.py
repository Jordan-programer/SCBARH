from datetime import date
from typing import Optional, List
from pydantic import BaseModel


class RelatorioFiltro(BaseModel):
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    funcionario_id: Optional[int] = None
    departamento: Optional[str] = None


class RelatorioAssiduidadeSummary(BaseModel):
    funcionario_id: int
    funcionario_nome: str
    cargo: str
    departamento: str
    dias_trabalhados: int
    faltas: int
    atrasos: int
    total_horas_trabalhadas: float
    total_horas_extras: float


class RelatorioSalarioSummary(BaseModel):
    funcionario_id: int
    funcionario_nome: str
    mes: int
    ano: int
    salario_base: float
    subsidio_alimentacao: float
    subsidio_transporte: float
    outros_subsidios: float
    bonus: float
    deducoes_totais: float
    salario_liquido: float

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class FeriasBase(BaseModel):
    funcionario_id: int
    ano: int
    data_inicio: date
    data_fim: date
    dias_gozados: int
    status: str = "Pendente"  # Pendente, Aprovado, Rejeitado, Gozado
    observacoes: Optional[str] = None


class FeriasCreate(FeriasBase):
    pass


class FeriasUpdate(BaseModel):
    funcionario_id: Optional[int] = None
    ano: Optional[int] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    dias_gozados: Optional[int] = None
    status: Optional[str] = None
    observacoes: Optional[str] = None


class FeriasResponse(FeriasBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AusenciaBase(BaseModel):
    funcionario_id: int
    tipo: str
    data_inicio: date
    data_fim: date
    justificada: bool = False
    documento_comprovativo: Optional[str] = None
    status: str = "Pendente"  # Pendente, Aprovada, Rejeitada
    observacoes: Optional[str] = None


class AusenciaCreate(AusenciaBase):
    pass


class AusenciaUpdate(BaseModel):
    funcionario_id: Optional[int] = None
    tipo: Optional[str] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    justificada: Optional[bool] = None
    documento_comprovativo: Optional[str] = None
    status: Optional[str] = None
    observacoes: Optional[str] = None


class AusenciaResponse(AusenciaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

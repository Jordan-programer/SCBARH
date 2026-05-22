from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ContratoBase(BaseModel):
    funcionario_id: int
    tipo: str
    data_inicio: date
    data_fim: Optional[date] = None
    salario_base: float = Field(..., ge=0.0)
    subsidio_alimentacao: float = Field(default=0.0, ge=0.0)
    subsidio_transporte: float = Field(default=0.0, ge=0.0)
    outros_subsidios: float = Field(default=0.0, ge=0.0)
    ativo: bool = True


class ContratoCreate(ContratoBase):
    pass


class ContratoUpdate(BaseModel):
    funcionario_id: Optional[int] = None
    tipo: Optional[str] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    salario_base: Optional[float] = None
    subsidio_alimentacao: Optional[float] = None
    subsidio_transporte: Optional[float] = None
    outros_subsidios: Optional[float] = None
    ativo: Optional[bool] = None


class ContratoResponse(ContratoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

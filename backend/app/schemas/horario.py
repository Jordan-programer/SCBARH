from datetime import datetime, time
from typing import Optional
from pydantic import BaseModel, ConfigDict


class HorarioBase(BaseModel):
    nome: str
    hora_entrada: time
    hora_saida: time
    tolerancia: int = 15
    horas_diarias: float = 8.0
    dias_semana: str = "Seg,Ter,Qua,Qui,Sex"
    ativo: bool = True


class HorarioCreate(HorarioBase):
    pass


class HorarioUpdate(BaseModel):
    nome: Optional[str] = None
    hora_entrada: Optional[time] = None
    hora_saida: Optional[time] = None
    tolerancia: Optional[int] = None
    horas_diarias: Optional[float] = None
    dias_semana: Optional[str] = None
    ativo: Optional[bool] = None


class HorarioResponse(HorarioBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

from datetime import date, datetime, time
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AssiduidadeBase(BaseModel):
    funcionario_id: int
    data: date
    entrada: Optional[time] = None
    saida: Optional[time] = None
    horas_trabalhadas: float = 0.0
    horas_extras: float = 0.0
    status: str = "Presente"  # Presente, Falta, Atraso, Folga, Ferias, Ausencia
    dispositivo_entrada_id: Optional[int] = None
    dispositivo_saida_id: Optional[int] = None


class AssiduidadeCreate(AssiduidadeBase):
    pass


class AssiduidadeUpdate(BaseModel):
    funcionario_id: Optional[int] = None
    data: Optional[date] = None
    entrada: Optional[time] = None
    saida: Optional[time] = None
    horas_trabalhadas: Optional[float] = None
    horas_extras: Optional[float] = None
    status: Optional[str] = None
    dispositivo_entrada_id: Optional[int] = None
    dispositivo_saida_id: Optional[int] = None


class AssiduidadeResponse(AssiduidadeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

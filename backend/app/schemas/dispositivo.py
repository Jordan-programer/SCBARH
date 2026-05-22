from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DispositivoBase(BaseModel):
    nome: str
    ip: str
    porta: int = 80
    tipo: str = "Facial & Biometric"
    localizacao: str
    ativo: bool = True


class DispositivoCreate(DispositivoBase):
    pass


class DispositivoUpdate(BaseModel):
    nome: Optional[str] = None
    ip: Optional[str] = None
    porta: Optional[int] = None
    tipo: Optional[str] = None
    localizacao: Optional[str] = None
    ativo: Optional[bool] = None


class DispositivoResponse(DispositivoBase):
    id: int
    ultimo_contacto: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

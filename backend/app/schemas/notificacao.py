from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NotificacaoBase(BaseModel):
    usuario_id: int
    titulo: str
    mensagem: str
    lida: bool = False


class NotificacaoCreate(NotificacaoBase):
    pass


class NotificacaoUpdate(BaseModel):
    titulo: Optional[str] = None
    mensagem: Optional[str] = None
    lida: Optional[bool] = None


class NotificacaoResponse(NotificacaoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

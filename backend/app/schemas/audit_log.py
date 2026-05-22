from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: int
    usuario_id: Optional[int] = None
    acao: str
    modulo: str
    descricao: str
    ip_address: Optional[str] = None
    created_at: datetime
    usuario_nome: Optional[str] = None  # Nome do usuário, preenchido quando disponível

    model_config = ConfigDict(from_attributes=True)

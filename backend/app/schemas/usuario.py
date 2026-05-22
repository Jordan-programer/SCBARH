from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr
from app.models.usuario import RoleEnum


class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    role: RoleEnum
    ativo: bool = True
    funcionario_id: Optional[int] = None
    morador_id: Optional[int] = None


class UsuarioCreate(UsuarioBase):
    senha: str


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    senha: Optional[str] = None
    role: Optional[RoleEnum] = None
    ativo: Optional[bool] = None
    funcionario_id: Optional[int] = None
    morador_id: Optional[int] = None


class UsuarioResponse(UsuarioBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

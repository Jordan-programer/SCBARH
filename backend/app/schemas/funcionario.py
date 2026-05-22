from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr


class FuncionarioBase(BaseModel):
    nome: str
    bi: str
    nif: Optional[str] = None
    data_nascimento: date
    genero: str
    telefone: str
    email: EmailStr
    endereco: str
    cargo: str
    departamento: str
    data_admissao: date
    biometria_template: Optional[str] = None
    ativo: bool = True


class FuncionarioCreate(FuncionarioBase):
    pass


class FuncionarioUpdate(BaseModel):
    nome: Optional[str] = None
    bi: Optional[str] = None
    nif: Optional[str] = None
    data_nascimento: Optional[date] = None
    genero: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    endereco: Optional[str] = None
    cargo: Optional[str] = None
    departamento: Optional[str] = None
    data_admissao: Optional[date] = None
    biometria_template: Optional[str] = None
    ativo: Optional[bool] = None


class FuncionarioResponse(FuncionarioBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

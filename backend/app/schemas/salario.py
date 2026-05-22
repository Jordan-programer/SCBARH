from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SalarioBase(BaseModel):
    funcionario_id: int
    mes: int = Field(..., ge=1, le=12)
    ano: int
    salario_base: float = Field(..., ge=0.0)
    subsidio_alimentacao: float = Field(default=0.0, ge=0.0)
    subsidio_transporte: float = Field(default=0.0, ge=0.0)
    outros_subsidios: float = Field(default=0.0, ge=0.0)
    bonus: float = Field(default=0.0, ge=0.0)

    seguranca_social_func: float = Field(default=0.0, ge=0.0)
    seguranca_social_emp: float = Field(default=0.0, ge=0.0)
    irt: float = Field(default=0.0, ge=0.0)
    faltas_deducao: float = Field(default=0.0, ge=0.0)
    outras_deducoes: float = Field(default=0.0, ge=0.0)

    salario_bruto: float = Field(..., ge=0.0)
    salario_liquido: float = Field(..., ge=0.0)
    status: str = "Processado"
    processado_por: int


class SalarioCreate(SalarioBase):
    pass


class SalarioUpdate(BaseModel):
    funcionario_id: Optional[int] = None
    mes: Optional[int] = None
    ano: Optional[int] = None
    salario_base: Optional[float] = None
    subsidio_alimentacao: Optional[float] = None
    subsidio_transporte: Optional[float] = None
    outros_subsidios: Optional[float] = None
    bonus: Optional[float] = None
    seguranca_social_func: Optional[float] = None
    seguranca_social_emp: Optional[float] = None
    irt: Optional[float] = None
    faltas_deducao: Optional[float] = None
    outras_deducoes: Optional[float] = None
    salario_bruto: Optional[float] = None
    salario_liquido: Optional[float] = None
    status: Optional[str] = None
    processado_por: Optional[int] = None


class SalarioProcessRequest(BaseModel):
    funcionario_id: int
    mes: int = Field(..., ge=1, le=12)
    ano: int
    bonus: float = Field(default=0.0, ge=0.0)
    outras_deducoes: float = Field(default=0.0, ge=0.0)


class SalarioResponse(SalarioBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

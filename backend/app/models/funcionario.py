from datetime import date, datetime
from typing import Optional, List
from sqlalchemy import Boolean, Date, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Funcionario(Base):
    __tablename__ = "funcionarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    bi: Mapped[str] = mapped_column(String(15), unique=True, index=True, nullable=False)
    nif: Mapped[Optional[str]] = mapped_column(String(15), unique=True, index=True, nullable=True)
    data_nascimento: Mapped[date] = mapped_column(Date, nullable=False)
    genero: Mapped[str] = mapped_column(String(10), nullable=False)
    telefone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    endereco: Mapped[str] = mapped_column(String(255), nullable=False)
    cargo: Mapped[str] = mapped_column(String(100), nullable=False)
    departamento: Mapped[str] = mapped_column(String(100), nullable=False)
    data_admissao: Mapped[date] = mapped_column(Date, nullable=False)
    biometria_template: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relacionamentos
    usuario: Mapped[Optional["Usuario"]] = relationship(
        "Usuario", back_populates="funcionario", uselist=False, foreign_keys="[Usuario.funcionario_id]"
    )
    contratos: Mapped[List["Contrato"]] = relationship(
        "Contrato", back_populates="funcionario", cascade="all, delete-orphan"
    )
    ferias: Mapped[List["Ferias"]] = relationship(
        "Ferias", back_populates="funcionario", cascade="all, delete-orphan"
    )
    ausencias: Mapped[List["Ausencia"]] = relationship(
        "Ausencia", back_populates="funcionario", cascade="all, delete-orphan"
    )
    assiduidade: Mapped[List["Assiduidade"]] = relationship(
        "Assiduidade", back_populates="funcionario", cascade="all, delete-orphan"
    )
    salarios: Mapped[List["Salario"]] = relationship(
        "Salario", back_populates="funcionario", cascade="all, delete-orphan"
    )

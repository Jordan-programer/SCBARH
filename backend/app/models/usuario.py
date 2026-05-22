from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class RoleEnum(str, PyEnum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN_RH = "ADMIN_RH"
    GESTOR = "GESTOR"
    PORTEIRO = "PORTEIRO"
    FUNCIONARIO = "FUNCIONARIO"


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(
        Enum(RoleEnum), default=RoleEnum.FUNCIONARIO, nullable=False
    )
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Linkages
    funcionario_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("funcionarios.id", ondelete="SET NULL"), nullable=True
    )
    morador_id: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )  # Compatibilidade com link de morador

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relacionamentos
    funcionario: Mapped[Optional["Funcionario"]] = relationship(
        "Funcionario", back_populates="usuario", foreign_keys=[funcionario_id]
    )
    notificacoes: Mapped[list["Notificacao"]] = relationship(
        "Notificacao", back_populates="usuario", cascade="all, delete-orphan"
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog", back_populates="usuario", cascade="all, delete-orphan"
    )

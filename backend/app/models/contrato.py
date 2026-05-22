from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Contrato(Base):
    __tablename__ = "contratos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    funcionario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("funcionarios.id", ondelete="CASCADE"), nullable=False
    )
    tipo: Mapped[str] = mapped_column(String(50), nullable=False)  # Determinado, Indeterminado, etc.
    data_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    data_fim: Mapped[date] = mapped_column(Date, nullable=True)
    salario_base: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    subsidio_alimentacao: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    subsidio_transporte: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    outros_subsidios: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relacionamentos
    funcionario: Mapped["Funcionario"] = relationship("Funcionario", back_populates="contratos")

from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Ausencia(Base):
    __tablename__ = "ausencias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    funcionario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("funcionarios.id", ondelete="CASCADE"), nullable=False
    )
    tipo: Mapped[str] = mapped_column(String(50), nullable=False)  # Doenca, Casamento, Justificada, Injustificada
    data_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    data_fim: Mapped[date] = mapped_column(Date, nullable=False)
    justificada: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    documento_comprovativo: Mapped[str] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="Pendente", nullable=False
    )  # Pendente, Aprovada, Rejeitada
    observacoes: Mapped[str] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relacionamentos
    funcionario: Mapped["Funcionario"] = relationship("Funcionario", back_populates="ausencias")

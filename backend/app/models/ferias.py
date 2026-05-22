from datetime import date, datetime
from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Ferias(Base):
    __tablename__ = "ferias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    funcionario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("funcionarios.id", ondelete="CASCADE"), nullable=False
    )
    ano: Mapped[int] = mapped_column(Integer, nullable=False)
    data_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    data_fim: Mapped[date] = mapped_column(Date, nullable=False)
    dias_gozados: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="Pendente", nullable=False
    )  # Pendente, Aprovado, Rejeitado, Gozado
    observacoes: Mapped[str] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relacionamentos
    funcionario: Mapped["Funcionario"] = relationship("Funcionario", back_populates="ferias")

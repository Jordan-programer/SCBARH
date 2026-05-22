from datetime import date, datetime, time
from typing import Optional
from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Assiduidade(Base):
    __tablename__ = "assiduidade"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    funcionario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("funcionarios.id", ondelete="CASCADE"), nullable=False
    )
    data: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    entrada: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    saida: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    horas_trabalhadas: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0, nullable=False)
    horas_extras: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="Presente", nullable=False
    )  # Presente, Falta, Atraso, Folga, Ferias, Ausencia
    dispositivo_entrada_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    dispositivo_saida_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relacionamentos
    funcionario: Mapped["Funcionario"] = relationship("Funcionario", back_populates="assiduidade")

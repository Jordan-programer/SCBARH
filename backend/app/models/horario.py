from datetime import datetime, time
from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Time, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Horario(Base):
    __tablename__ = "horarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)  # Turno Geral, Turno da Noite, etc.
    hora_entrada: Mapped[time] = mapped_column(Time, nullable=False)
    hora_saida: Mapped[time] = mapped_column(Time, nullable=False)
    tolerancia: Mapped[int] = mapped_column(Integer, default=15, nullable=False)  # Tolerância em minutos
    horas_diarias: Mapped[float] = mapped_column(Numeric(4, 2), default=8.0, nullable=False)
    dias_semana: Mapped[str] = mapped_column(
        String(100), default="Seg,Ter,Qua,Qui,Sex", nullable=False
    )  # Dias em que o turno é ativo, separados por vírgula
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

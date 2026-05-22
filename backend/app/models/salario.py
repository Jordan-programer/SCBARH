from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Salario(Base):
    __tablename__ = "salarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    funcionario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("funcionarios.id", ondelete="CASCADE"), nullable=False
    )
    mes: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 a 12
    ano: Mapped[int] = mapped_column(Integer, nullable=False)
    salario_base: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    subsidio_alimentacao: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    subsidio_transporte: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    outros_subsidios: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    bonus: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)

    # Deduções
    seguranca_social_func: Mapped[float] = mapped_column(
        Numeric(12, 2), default=0.0, nullable=False
    )  # 3% Segurança Social Funcionário
    seguranca_social_emp: Mapped[float] = mapped_column(
        Numeric(12, 2), default=0.0, nullable=False
    )  # 8% Segurança Social Empresa
    irt: Mapped[float] = mapped_column(
        Numeric(12, 2), default=0.0, nullable=False
    )  # Imposto de Rendimento de Trabalho (Angola)
    faltas_deducao: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    outras_deducoes: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)

    # Totais
    salario_bruto: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    salario_liquido: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    status: Mapped[str] = mapped_column(
        String(20), default="Processado", nullable=False
    )  # Processado, Pago, Rascunho
    processado_por: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relacionamentos
    funcionario: Mapped["Funcionario"] = relationship("Funcionario", back_populates="salarios")
    processador: Mapped["Usuario"] = relationship("Usuario", foreign_keys=[processado_por])

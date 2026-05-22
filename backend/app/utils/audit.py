import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("scbarh.audit")


async def log_audit(
    db: AsyncSession,
    usuario_id: Optional[int],
    acao: str,
    modulo: str,
    descricao: str,
    ip_address: Optional[str] = None,
) -> None:
    """Regista uma ação de auditoria na base de dados.

    Captura quaisquer exceções para garantir que falhas no registo de auditoria
    não interrompam o fluxo principal do negócio.
    """
    try:
        from app.models.audit_log import AuditLog

        audit = AuditLog(
            usuario_id=usuario_id,
            acao=acao,
            modulo=modulo,
            descricao=descricao,
            ip_address=ip_address,
        )
        db.add(audit)
        await db.commit()
    except Exception as e:
        logger.error(f"Erro ao criar registo de auditoria: {str(e)}")
        # Não propaga o erro para não interromper a operação principal

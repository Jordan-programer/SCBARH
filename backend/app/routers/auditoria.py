from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, RoleChecker
from app.models.usuario import RoleEnum, Usuario
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogResponse

router = APIRouter(prefix="/auditoria", tags=["Auditoria do Sistema"])

# Apenas Super Administradores podem visualizar registos de auditoria
super_admin_guard = Depends(RoleChecker([RoleEnum.SUPER_ADMIN]))


@router.get("/logs", response_model=List[AuditLogResponse], dependencies=[super_admin_guard])
async def list_audit_logs(
    modulo: Optional[str] = None,
    acao: Optional[str] = None,
    usuario_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """Obtém o histórico de auditoria com os registos de ações dos utilizadores (Apenas Super Admin)."""
    # Usar um JOIN simples com Usuario para carregar o nome de quem executou a ação
    query = (
        select(
            AuditLog.id,
            AuditLog.usuario_id,
            AuditLog.acao,
            AuditLog.modulo,
            AuditLog.descricao,
            AuditLog.ip_address,
            AuditLog.created_at,
            Usuario.nome.label("usuario_nome"),
        )
        .outerjoin(Usuario, AuditLog.usuario_id == Usuario.id)
        .order_by(AuditLog.id.desc())
    )

    if modulo is not None:
        query = query.where(AuditLog.modulo == modulo)
    if acao is not None:
        query = query.where(AuditLog.acao == acao)
    if usuario_id is not None:
        query = query.where(AuditLog.usuario_id == usuario_id)

    res = await db.execute(query)
    rows = res.all()

    return [
        AuditLogResponse(
            id=r[0],
            usuario_id=r[1],
            acao=r[2],
            modulo=r[3],
            descricao=r[4],
            ip_address=r[5],
            created_at=r[6],
            usuario_nome=r[7],
        )
        for r in rows
    ]

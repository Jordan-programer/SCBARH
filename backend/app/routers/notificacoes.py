from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.usuario import Usuario
from app.schemas.notificacao import NotificacaoResponse
from app.services.notificacao_service import NotificacaoService

router = APIRouter(prefix="/notificacoes", tags=["Notificações"])


@router.get("/", response_model=List[NotificacaoResponse])
async def list_notificacoes(
    apenas_nao_lidas: bool = False,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lista as notificações do utilizador autenticado."""
    return await NotificacaoService.get_notificacoes_usuario(
        db, current_user.id, apenas_nao_lidas
    )


@router.put("/{notificacao_id}/ler", status_code=status.HTTP_204_NO_CONTENT)
async def marcar_notificacao_como_lida(
    notificacao_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Marca uma notificação específica do utilizador autenticado como lida."""
    await NotificacaoService.marcar_como_lida(db, notificacao_id, current_user.id)

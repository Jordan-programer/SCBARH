from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.notificacao import Notificacao


class NotificacaoService:
    @staticmethod
    async def criar_notificacao(
        db: AsyncSession, usuario_id: int, titulo: str, mensagem: str
    ) -> Notificacao:
        """Cria uma nova notificação para um utilizador específico."""
        try:
            notificacao = Notificacao(usuario_id=usuario_id, titulo=titulo, mensagem=mensagem)
            db.add(notificacao)
            await db.commit()
            await db.refresh(notificacao)
            return notificacao
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao criar notificação: {str(e)}",
            )

    @staticmethod
    async def get_notificacoes_usuario(
        db: AsyncSession, usuario_id: int, apenas_nao_lidas: bool = False
    ) -> List[Notificacao]:
        """Obtém as notificações de um utilizador, permitindo filtrar pelas não lidas."""
        query = select(Notificacao).where(Notificacao.usuario_id == usuario_id)
        if apenas_nao_lidas:
            query = query.where(Notificacao.lida == False)
        query = query.order_by(Notificacao.created_at.desc())

        res = await db.execute(query)
        return list(res.scalars().all())

    @staticmethod
    async def marcar_como_lida(db: AsyncSession, notificacao_id: int, usuario_id: int) -> None:
        """Marca uma notificação como lida se ela pertencer ao utilizador correspondente."""
        query = select(Notificacao).where(
            Notificacao.id == notificacao_id, Notificacao.usuario_id == usuario_id
        )
        res = await db.execute(query)
        notificacao = res.scalar_one_or_none()

        if not notificacao:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notificação não encontrada.",
            )

        notificacao.lida = True
        try:
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao marcar notificação como lida: {str(e)}",
            )

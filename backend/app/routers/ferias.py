from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.dependencies import get_db, get_current_user, RoleChecker
from app.models.usuario import Usuario, RoleEnum
from app.models.ferias import Ferias
from app.schemas.ferias import FeriasCreate, FeriasUpdate, FeriasResponse
from app.utils.audit import log_audit

router = APIRouter(prefix="/ferias", tags=["Férias"])

gestor_guard = Depends(RoleChecker([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH, RoleEnum.GESTOR]))


@router.get("/", response_model=List[FeriasResponse])
async def list_ferias(
    funcionario_id: Optional[int] = None,
    status_filtro: Optional[str] = None,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lista todos os registos de férias.

    Funcionários normais só veem as suas próprias férias.
    """
    query = select(Ferias)

    # Restringir funcionário normal ao seu próprio ID
    if current_user.role == RoleEnum.FUNCIONARIO:
        if current_user.funcionario_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O seu utilizador não está associado a nenhum funcionário.",
            )
        query = query.where(Ferias.funcionario_id == current_user.funcionario_id)
    else:
        # Se for admin/gestor e passar filtro
        if funcionario_id is not None:
            query = query.where(Ferias.funcionario_id == funcionario_id)

    if status_filtro is not None:
        query = query.where(Ferias.status == status_filtro)

    query = query.order_by(Ferias.id.desc())
    res = await db.execute(query)
    return list(res.scalars().all())


@router.get("/{ferias_id}", response_model=FeriasResponse)
async def get_ferias(
    ferias_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Obtém detalhes de um período de férias."""
    query = select(Ferias).where(Ferias.id == ferias_id)
    res = await db.execute(query)
    ferias = res.scalar_one_or_none()

    if not ferias:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registo de férias não encontrado.",
        )

    # Proteção de acesso
    if current_user.role == RoleEnum.FUNCIONARIO and ferias.funcionario_id != current_user.funcionario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não tem permissão para aceder a este registo.",
        )

    return ferias


@router.post("/", response_model=FeriasResponse, status_code=status.HTTP_201_CREATED)
async def create_ferias(
    data: FeriasCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Solicita ou regista um novo período de férias.

    Funcionários só podem solicitar para si mesmos. Admins e Gestores podem registar para qualquer um.
    """
    # Proteção de solicitação
    if current_user.role == RoleEnum.FUNCIONARIO:
        if current_user.funcionario_id != data.funcionario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Não pode solicitar férias para outros funcionários.",
            )
        data.status = "Pendente"  # Forçar status pendente para funcionários

    try:
        ferias = Ferias(**data.model_dump())
        db.add(ferias)
        await db.commit()
        await db.refresh(ferias)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="CRIAR",
            modulo="Férias",
            descricao=f"Solicitou/registou férias de {ferias.data_inicio} a {ferias.data_fim} (Ano de referência: {ferias.ano}) para o funcionário ID {ferias.funcionario_id}.",
        )
        return ferias
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar solicitação de férias: {str(e)}",
        )


@router.put("/{ferias_id}", response_model=FeriasResponse)
async def update_ferias(
    ferias_id: int,
    data: FeriasUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Atualiza ou aprova/rejeita um registo de férias.

    Apenas Gestores e Admins podem alterar status.
    """
    query = select(Ferias).where(Ferias.id == ferias_id)
    res = await db.execute(query)
    ferias = res.scalar_one_or_none()

    if not ferias:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registo de férias não encontrado.",
        )

    # Se funcionário tentar editar
    if current_user.role == RoleEnum.FUNCIONARIO:
        if ferias.funcionario_id != current_user.funcionario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Não pode editar férias de outros funcionários.",
            )
        if ferias.status != "Pendente":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já não pode editar férias que não estejam pendentes.",
            )
        # Garantir que funcionário não altera o status
        if data.status and data.status != ferias.status:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas administradores ou gestores de RH podem alterar o status de aprovação.",
            )

    # Se for alteração de status por admin/gestor
    update_data = data.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"] != ferias.status:
        if current_user.role not in [RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH, RoleEnum.GESTOR]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Não tem permissão para aprovar ou rejeitar férias.",
            )

    for key, value in update_data.items():
        setattr(ferias, key, value)

    try:
        await db.commit()
        await db.refresh(ferias)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EDITAR",
            modulo="Férias",
            descricao=f"Atualizou férias ID {ferias.id} (Status: {ferias.status}) para o funcionário ID {ferias.funcionario_id}.",
        )
        return ferias
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar após editar férias: {str(e)}",
        )


@router.delete("/{ferias_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ferias(
    ferias_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Exclui ou cancela um pedido de férias."""
    query = select(Ferias).where(Ferias.id == ferias_id)
    res = await db.execute(query)
    ferias = res.scalar_one_or_none()

    if not ferias:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registo de férias não encontrado.",
        )

    # Segurança
    if current_user.role == RoleEnum.FUNCIONARIO:
        if ferias.funcionario_id != current_user.funcionario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Não pode eliminar pedidos de férias de outros.",
            )
        if ferias.status != "Pendente":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não pode eliminar pedidos de férias que já foram processados/aprovados.",
            )

    try:
        func_id = ferias.funcionario_id
        await db.delete(ferias)
        await db.commit()

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EXCLUIR",
            modulo="Férias",
            descricao=f"Excluiu permanentemente o pedido/registo de férias ID {ferias_id} do funcionário ID {func_id}.",
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir registo de férias: {str(e)}",
        )

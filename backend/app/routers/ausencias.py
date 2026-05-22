from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.dependencies import get_db, get_current_user, RoleChecker
from app.models.usuario import Usuario, RoleEnum
from app.models.ausencia import Ausencia
from app.schemas.ausencia import AusenciaCreate, AusenciaUpdate, AusenciaResponse
from app.utils.audit import log_audit

router = APIRouter(prefix="/ausencias", tags=["Ausências e Faltas"])

gestor_guard = Depends(RoleChecker([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH, RoleEnum.GESTOR]))


@router.get("/", response_model=List[AusenciaResponse])
async def list_ausencias(
    funcionario_id: Optional[int] = None,
    tipo: Optional[str] = None,
    status_filtro: Optional[str] = None,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lista todos os registos de ausência."""
    query = select(Ausencia)

    if current_user.role == RoleEnum.FUNCIONARIO:
        if current_user.funcionario_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O seu utilizador não está associado a nenhum funcionário.",
            )
        query = query.where(Ausencia.funcionario_id == current_user.funcionario_id)
    else:
        if funcionario_id is not None:
            query = query.where(Ausencia.funcionario_id == funcionario_id)

    if tipo is not None:
        query = query.where(Ausencia.tipo == tipo)
    if status_filtro is not None:
        query = query.where(Ausencia.status == status_filtro)

    query = query.order_by(Ausencia.id.desc())
    res = await db.execute(query)
    return list(res.scalars().all())


@router.get("/{ausencia_id}", response_model=AusenciaResponse)
async def get_ausencia(
    ausencia_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Obtém detalhes de uma ausência específica."""
    query = select(Ausencia).where(Ausencia.id == ausencia_id)
    res = await db.execute(query)
    ausencia = res.scalar_one_or_none()

    if not ausencia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registo de ausência não encontrado.",
        )

    if current_user.role == RoleEnum.FUNCIONARIO and ausencia.funcionario_id != current_user.funcionario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não tem permissão para aceder a esta ausência.",
        )

    return ausencia


@router.post("/", response_model=AusenciaResponse, status_code=status.HTTP_201_CREATED)
async def create_ausencia(
    data: AusenciaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Regista uma nova ausência ou falta justificada/injustificada.

    Funcionários só registam para si mesmos.
    """
    if current_user.role == RoleEnum.FUNCIONARIO:
        if current_user.funcionario_id != data.funcionario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Não pode justificar faltas de outros funcionários.",
            )
        data.status = "Pendente"

    try:
        ausencia = Ausencia(**data.model_dump())
        db.add(ausencia)
        await db.commit()
        await db.refresh(ausencia)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="CRIAR",
            modulo="Ausências",
            descricao=f"Solicitou/registou ausência do tipo '{ausencia.tipo}' de {ausencia.data_inicio} a {ausencia.data_fim} para o funcionário ID {ausencia.funcionario_id}.",
        )
        return ausencia
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao registar ausência: {str(e)}",
        )


@router.put("/{ausencia_id}", response_model=AusenciaResponse)
async def update_ausencia(
    ausencia_id: int,
    data: AusenciaUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Aprova/Rejeita ou edita uma ausência."""
    query = select(Ausencia).where(Ausencia.id == ausencia_id)
    res = await db.execute(query)
    ausencia = res.scalar_one_or_none()

    if not ausencia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ausência não encontrada.",
        )

    if current_user.role == RoleEnum.FUNCIONARIO:
        if ausencia.funcionario_id != current_user.funcionario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Não tem permissão para editar esta ausência.",
            )
        if ausencia.status != "Pendente":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Apenas ausências pendentes podem ser editadas.",
            )
        if data.status and data.status != ausencia.status:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas administradores ou gestores de RH podem aprovar justificações.",
            )

    update_data = data.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"] != ausencia.status:
        if current_user.role not in [RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH, RoleEnum.GESTOR]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Não tem permissão para aprovar ou rejeitar ausências.",
            )

    for key, value in update_data.items():
        setattr(ausencia, key, value)

    try:
        await db.commit()
        await db.refresh(ausencia)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EDITAR",
            modulo="Ausências",
            descricao=f"Atualizou ausência ID {ausencia.id} (Status: {ausencia.status}, Justificada: {ausencia.justificada}) para o funcionário ID {ausencia.funcionario_id}.",
        )
        return ausencia
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar após editar ausência: {str(e)}",
        )


@router.delete("/{ausencia_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ausencia(
    ausencia_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancela ou elimina um registo de ausência/justificação."""
    query = select(Ausencia).where(Ausencia.id == ausencia_id)
    res = await db.execute(query)
    ausencia = res.scalar_one_or_none()

    if not ausencia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ausência não encontrada.",
        )

    if current_user.role == RoleEnum.FUNCIONARIO:
        if ausencia.funcionario_id != current_user.funcionario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Não tem permissão para eliminar ausências de terceiros.",
            )
        if ausencia.status != "Pendente":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não pode eliminar ausências que já foram processadas/aprovadas.",
            )

    try:
        func_id = ausencia.funcionario_id
        await db.delete(ausencia)
        await db.commit()

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EXCLUIR",
            modulo="Ausências",
            descricao=f"Excluiu permanentemente a justificação/ausência ID {ausencia_id} do funcionário ID {func_id}.",
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir ausência: {str(e)}",
        )

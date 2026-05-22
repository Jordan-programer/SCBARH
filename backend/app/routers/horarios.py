from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.dependencies import get_db, get_current_user, RoleChecker
from app.models.usuario import Usuario, RoleEnum
from app.models.horario import Horario
from app.schemas.horario import HorarioCreate, HorarioUpdate, HorarioResponse
from app.utils.audit import log_audit

router = APIRouter(prefix="/horarios", tags=["Horários e Turnos"])

gestor_guard = Depends(RoleChecker([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH, RoleEnum.GESTOR]))


@router.get("/", response_model=List[HorarioResponse])
async def list_horarios(
    ativo: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    """Lista todos os turnos/horários de trabalho cadastrados no sistema."""
    query = select(Horario)
    if ativo is not None:
        query = query.where(Horario.ativo == ativo)
    query = query.order_by(Horario.nome.asc())

    res = await db.execute(query)
    return list(res.scalars().all())


@router.get("/{horario_id}", response_model=HorarioResponse)
async def get_horario(horario_id: int, db: AsyncSession = Depends(get_db)):
    """Obtém os detalhes de um turno específico pelo ID."""
    query = select(Horario).where(Horario.id == horario_id)
    res = await db.execute(query)
    horario = res.scalar_one_or_none()

    if not horario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Horário/Turno de trabalho não encontrado.",
        )
    return horario


@router.post("/", response_model=HorarioResponse, status_code=status.HTTP_201_CREATED, dependencies=[gestor_guard])
async def create_horario(
    data: HorarioCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cria um novo turno/horário de trabalho (Apenas administradores/gestores)."""
    try:
        horario = Horario(**data.model_dump())
        db.add(horario)
        await db.commit()
        await db.refresh(horario)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="CRIAR",
            modulo="Horários",
            descricao=f"Criou o turno '{horario.nome}' das {horario.hora_entrada} às {horario.hora_saida}.",
        )
        return horario
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar horário/turno: {str(e)}",
        )


@router.put("/{horario_id}", response_model=HorarioResponse, dependencies=[gestor_guard])
async def update_horario(
    horario_id: int,
    data: HorarioUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Edita um turno de trabalho existente (Apenas administradores/gestores)."""
    query = select(Horario).where(Horario.id == horario_id)
    res = await db.execute(query)
    horario = res.scalar_one_or_none()

    if not horario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Horário/Turno não encontrado.",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(horario, key, value)

    try:
        await db.commit()
        await db.refresh(horario)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EDITAR",
            modulo="Horários",
            descricao=f"Editou o turno '{horario.nome}' (ID {horario_id}).",
        )
        return horario
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar após editar turno: {str(e)}",
        )


@router.delete("/{horario_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[gestor_guard])
async def delete_horario(
    horario_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Exclui ou desativa um turno/horário de trabalho."""
    query = select(Horario).where(Horario.id == horario_id)
    res = await db.execute(query)
    horario = res.scalar_one_or_none()

    if not horario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Horário/Turno não encontrado.",
        )

    try:
        nome_turno = horario.nome
        await db.delete(horario)
        await db.commit()

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EXCLUIR",
            modulo="Horários",
            descricao=f"Excluiu permanentemente o turno '{nome_turno}' (ID {horario_id}).",
        )
    except IntegrityError:
        await db.rollback()
        # Soft delete alternativo
        horario.ativo = False
        await db.commit()

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EXCLUIR_SOFT",
            modulo="Horários",
            descricao=f"Desativou o turno '{horario.nome}' (ID {horario_id}) devido a dependências na BD.",
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir turno: {str(e)}",
        )

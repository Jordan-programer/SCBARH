from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.dependencies import get_db, get_current_user, RoleChecker
from app.models.usuario import Usuario, RoleEnum
from app.models.dispositivo import Dispositivo
from app.schemas.dispositivo import DispositivoCreate, DispositivoUpdate, DispositivoResponse
from app.utils.audit import log_audit

router = APIRouter(prefix="/dispositivos", tags=["Dispositivos Biométricos"])

gestor_guard = Depends(RoleChecker([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH, RoleEnum.GESTOR]))


@router.get("/", response_model=List[DispositivoResponse], dependencies=[gestor_guard])
async def list_dispositivos(
    ativo: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    """Lista todos os leitores biométricos registados no sistema."""
    query = select(Dispositivo)
    if ativo is not None:
        query = query.where(Dispositivo.ativo == ativo)
    query = query.order_by(Dispositivo.nome.asc())

    res = await db.execute(query)
    return list(res.scalars().all())


@router.get("/{dispositivo_id}", response_model=DispositivoResponse, dependencies=[gestor_guard])
async def get_dispositivo(dispositivo_id: int, db: AsyncSession = Depends(get_db)):
    """Obtém detalhes de um leitor biométrico específico pelo ID."""
    query = select(Dispositivo).where(Dispositivo.id == dispositivo_id)
    res = await db.execute(query)
    dispositivo = res.scalar_one_or_none()

    if not dispositivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leitor biométrico não encontrado.",
        )
    return dispositivo


@router.post("/", response_model=DispositivoResponse, status_code=status.HTTP_201_CREATED, dependencies=[gestor_guard])
async def create_dispositivo(
    data: DispositivoCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Regista um novo leitor biométrico na infraestrutura."""
    try:
        dispositivo = Dispositivo(**data.model_dump())
        db.add(dispositivo)
        await db.commit()
        await db.refresh(dispositivo)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="CRIAR",
            modulo="Dispositivos",
            descricao=f"Registou o leitor biométrico '{dispositivo.nome}' no IP {dispositivo.ip}:{dispositivo.porta}.",
        )
        return dispositivo
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar dispositivo biométrico: {str(e)}",
        )


@router.put("/{dispositivo_id}", response_model=DispositivoResponse, dependencies=[gestor_guard])
async def update_dispositivo(
    dispositivo_id: int,
    data: DispositivoUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Atualiza as configurações ou status de um leitor biométrico."""
    query = select(Dispositivo).where(Dispositivo.id == dispositivo_id)
    res = await db.execute(query)
    dispositivo = res.scalar_one_or_none()

    if not dispositivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leitor biométrico não encontrado.",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(dispositivo, key, value)

    try:
        await db.commit()
        await db.refresh(dispositivo)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EDITAR",
            modulo="Dispositivos",
            descricao=f"Atualizou o leitor biométrico '{dispositivo.nome}' (ID {dispositivo_id}).",
        )
        return dispositivo
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar após editar dispositivo biométrico: {str(e)}",
        )


@router.delete("/{dispositivo_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[gestor_guard])
async def delete_dispositivo(
    dispositivo_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Exclui ou remove um leitor biométrico do sistema."""
    query = select(Dispositivo).where(Dispositivo.id == dispositivo_id)
    res = await db.execute(query)
    dispositivo = res.scalar_one_or_none()

    if not dispositivo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispositivo não encontrado.",
        )

    try:
        nome_disp = dispositivo.nome
        await db.delete(dispositivo)
        await db.commit()

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EXCLUIR",
            modulo="Dispositivos",
            descricao=f"Excluiu permanentemente o leitor biométrico '{nome_disp}' (ID {dispositivo_id}).",
        )
    except IntegrityError:
        await db.rollback()
        # Soft delete alternativo
        dispositivo.ativo = False
        await db.commit()

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EXCLUIR_SOFT",
            modulo="Dispositivos",
            descricao=f"Desativou leitor biométrico '{dispositivo.nome}' (ID {dispositivo_id}) devido a associações existentes no ponto.",
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir leitor biométrico: {str(e)}",
        )

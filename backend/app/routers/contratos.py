from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.dependencies import get_db, get_current_user, RoleChecker
from app.models.usuario import Usuario, RoleEnum
from app.models.contrato import Contrato
from app.schemas.contrato import ContratoCreate, ContratoUpdate, ContratoResponse
from app.utils.audit import log_audit

router = APIRouter(prefix="/contratos", tags=["Contratos de Trabalho"])

admin_rh_guard = Depends(RoleChecker([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH]))


@router.get("/", response_model=List[ContratoResponse], dependencies=[admin_rh_guard])
async def list_contratos(
    funcionario_id: Optional[int] = None,
    ativo: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    """Lista todos os contratos de trabalho."""
    query = select(Contrato)
    if funcionario_id is not None:
        query = query.where(Contrato.funcionario_id == funcionario_id)
    if ativo is not None:
        query = query.where(Contrato.ativo == ativo)
    query = query.order_by(Contrato.id.desc())

    res = await db.execute(query)
    return list(res.scalars().all())


@router.get("/{contrato_id}", response_model=ContratoResponse, dependencies=[admin_rh_guard])
async def get_contrato(contrato_id: int, db: AsyncSession = Depends(get_db)):
    """Obtém os detalhes de um contrato específico."""
    query = select(Contrato).where(Contrato.id == contrato_id)
    res = await db.execute(query)
    contrato = res.scalar_one_or_none()

    if not contrato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contrato de trabalho não encontrado.",
        )
    return contrato


@router.post("/", response_model=ContratoResponse, status_code=status.HTTP_201_CREATED, dependencies=[admin_rh_guard])
async def create_contrato(
    data: ContratoCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Regista um novo contrato de trabalho no sistema.

    Se for um contrato ativo, pode desativar os outros contratos do mesmo funcionário.
    """
    try:
        # Se for ativo, desativar contratos anteriores
        if data.ativo:
            await db.execute(
                select(Contrato)
                .where(Contrato.funcionario_id == data.funcionario_id, Contrato.ativo == True)
            )
            # Fazer update de forma simples para definir ativo=False
            from sqlalchemy import update
            await db.execute(
                update(Contrato)
                .where(Contrato.funcionario_id == data.funcionario_id)
                .values(ativo=False)
            )

        contrato = Contrato(**data.model_dump())
        db.add(contrato)
        await db.commit()
        await db.refresh(contrato)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="CRIAR",
            modulo="Contratos",
            descricao=f"Criou contrato de {contrato.tipo} para o funcionário ID {contrato.funcionario_id} (Líquido base: {contrato.salario_base} AOA).",
        )
        return contrato
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar contrato: {str(e)}",
        )


@router.put("/{contrato_id}", response_model=ContratoResponse, dependencies=[admin_rh_guard])
async def update_contrato(
    contrato_id: int,
    data: ContratoUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Atualiza dados de um contrato de trabalho existente."""
    query = select(Contrato).where(Contrato.id == contrato_id)
    res = await db.execute(query)
    contrato = res.scalar_one_or_none()

    if not contrato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contrato de trabalho não encontrado.",
        )

    update_data = data.model_dump(exclude_unset=True)

    # Se estiver a alterar para ativo, desativar os outros do mesmo funcionário
    if "ativo" in update_data and update_data["ativo"]:
        from sqlalchemy import update
        await db.execute(
            update(Contrato)
            .where(Contrato.funcionario_id == contrato.funcionario_id, Contrato.id != contrato_id)
            .values(ativo=False)
        )

    for key, value in update_data.items():
        setattr(contrato, key, value)

    try:
        await db.commit()
        await db.refresh(contrato)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EDITAR",
            modulo="Contratos",
            descricao=f"Editou contrato ID {contrato.id} do funcionário ID {contrato.funcionario_id}.",
        )
        return contrato
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar após editar contrato: {str(e)}",
        )


@router.delete("/{contrato_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[admin_rh_guard])
async def delete_contrato(
    contrato_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Exclui ou desativa um contrato de trabalho com segurança."""
    query = select(Contrato).where(Contrato.id == contrato_id)
    res = await db.execute(query)
    contrato = res.scalar_one_or_none()

    if not contrato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contrato não encontrado.",
        )

    try:
        func_id = contrato.funcionario_id
        await db.delete(contrato)
        await db.commit()

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EXCLUIR",
            modulo="Contratos",
            descricao=f"Excluiu contrato ID {contrato_id} do funcionário ID {func_id} permanentemente.",
        )
    except IntegrityError:
        await db.rollback()
        # Soft delete alternativo
        contrato.ativo = False
        await db.commit()

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EXCLUIR_SOFT",
            modulo="Contratos",
            descricao=f"Desativou contrato ID {contrato_id} (funcionario ID {contrato.funcionario_id}) devido a restrições de integridade.",
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir contrato: {str(e)}",
        )

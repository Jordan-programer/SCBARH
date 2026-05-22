from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_user, RoleChecker
from app.models.usuario import Usuario, RoleEnum
from app.models.salario import Salario
from app.schemas.salario import SalarioProcessRequest, SalarioResponse, SalarioUpdate
from app.services.salario_service import SalarioService
from app.utils.audit import log_audit

router = APIRouter(prefix="/salarios", tags=["Processamento Salarial"])

gestor_guard = Depends(RoleChecker([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH, RoleEnum.GESTOR]))


@router.post("/processar", response_model=SalarioResponse, status_code=status.HTTP_201_CREATED, dependencies=[gestor_guard])
async def processar_salario(
    request: SalarioProcessRequest,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Processa a folha de pagamento de um funcionário num determinado mês e ano (Apenas admin e gestores de RH)."""
    return await SalarioService.processar_salario_funcionario(db, request, current_user.id)


@router.get("/", response_model=List[SalarioResponse])
async def list_salarios(
    mes: Optional[int] = None,
    ano: Optional[int] = None,
    funcionario_id: Optional[int] = None,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lista as folhas salariais processadas.

    Funcionários normais só veem os seus próprios recibos de salário.
    """
    query = select(Salario)

    if current_user.role == RoleEnum.FUNCIONARIO:
        if current_user.funcionario_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O seu utilizador não está associado a nenhum funcionário.",
            )
        query = query.where(Salario.funcionario_id == current_user.funcionario_id)
    else:
        if funcionario_id is not None:
            query = query.where(Salario.funcionario_id == funcionario_id)

    if mes is not None:
        query = query.where(Salario.mes == mes)
    if ano is not None:
        query = query.where(Salario.ano == ano)

    query = query.order_by(Salario.id.desc())
    res = await db.execute(query)
    return list(res.scalars().all())


@router.get("/{salario_id}", response_model=SalarioResponse)
async def get_recibo_salario(
    salario_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Obtém detalhes/recibo de uma folha de salário específica."""
    query = select(Salario).where(Salario.id == salario_id)
    res = await db.execute(query)
    salario = res.scalar_one_or_none()

    if not salario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folha de salário não encontrada.",
        )

    # Restrição de segurança
    if current_user.role == RoleEnum.FUNCIONARIO and salario.funcionario_id != current_user.funcionario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não tem permissão para aceder a este recibo salarial.",
        )

    return salario


@router.put("/{salario_id}", response_model=SalarioResponse, dependencies=[gestor_guard])
async def atualizar_salario(
    salario_id: int,
    data: SalarioUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Atualiza o status de pagamento ou edita dados da folha salarial (Apenas administradores/gestores de RH)."""
    query = select(Salario).where(Salario.id == salario_id)
    res = await db.execute(query)
    salario = res.scalar_one_or_none()

    if not salario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folha de salário não encontrada.",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(salario, key, value)

    try:
        await db.commit()
        await db.refresh(salario)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EDITAR",
            modulo="Processamento Salarial",
            descricao=f"Atualizou a folha salarial ID {salario_id} do funcionário ID {salario.funcionario_id} (Status: {salario.status}).",
        )
        return salario
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar após editar folha salarial: {str(e)}",
        )


@router.delete("/{salario_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[gestor_guard])
async def delete_salario(
    salario_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Exclui um registo de processamento salarial."""
    query = select(Salario).where(Salario.id == salario_id)
    res = await db.execute(query)
    salario = res.scalar_one_or_none()

    if not salario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folha de salário não encontrada.",
        )

    try:
        func_id = salario.funcionario_id
        mes = salario.mes
        ano = salario.ano
        await db.delete(salario)
        await db.commit()

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EXCLUIR",
            modulo="Processamento Salarial",
            descricao=f"Excluiu permanentemente a folha salarial ID {salario_id} (referente a {mes}/{ano}) do funcionário ID {func_id}.",
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir folha salarial: {str(e)}",
        )

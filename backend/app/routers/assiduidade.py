from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_user, RoleChecker
from app.models.usuario import Usuario, RoleEnum
from app.models.assiduidade import Assiduidade
from app.schemas.assiduidade import AssiduidadeCreate, AssiduidadeUpdate, AssiduidadeResponse
from app.services.assiduidade_service import AssiduidadeService
from app.utils.audit import log_audit

router = APIRouter(prefix="/assiduidade", tags=["Assiduidade / Ponto"])

gestor_guard = Depends(RoleChecker([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH, RoleEnum.GESTOR]))


@router.post("/ponto", response_model=AssiduidadeResponse, status_code=status.HTTP_201_CREATED)
async def marcar_ponto(
    funcionario_id: int,
    dispositivo_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """Regista uma batida de ponto (entrada ou saída) para o funcionário especificado."""
    # Como esta rota pode ser chamada por integração com dispositivos biométricos físicos,
    # permitimos chamada sem token de usuário individual, dependendo do design do sistema
    return await AssiduidadeService.registar_ponto(db, funcionario_id, dispositivo_id)


@router.get("/", response_model=List[AssiduidadeResponse])
async def list_assiduidade(
    inicio: date,
    fim: date,
    funcionario_id: Optional[int] = None,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Obtém as marcações de assiduidade filtradas por período.

    Funcionários só veem a sua própria assiduidade.
    """
    # Regra de acesso
    if current_user.role == RoleEnum.FUNCIONARIO:
        if current_user.funcionario_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O seu utilizador não está associado a nenhum funcionário.",
            )
        target_funcionario_id = current_user.funcionario_id
    else:
        # Se for admin/gestor e fornecer ID de funcionário
        if funcionario_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deve especificar o ID do funcionário para listar a assiduidade.",
            )
        target_funcionario_id = funcionario_id

    return await AssiduidadeService.get_assiduidade_funcionario(db, target_funcionario_id, inicio, fim)


@router.put("/{ponto_id}", response_model=AssiduidadeResponse, dependencies=[gestor_guard])
async def editar_ponto(
    ponto_id: int,
    data: AssiduidadeUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Corrige ou insere dados de batida de ponto manualmente (Apenas administradores/gestores)."""
    query = select(Assiduidade).where(Assiduidade.id == ponto_id)
    res = await db.execute(query)
    ponto = res.scalar_one_or_none()

    if not ponto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batida de ponto não encontrada.",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ponto, key, value)

    try:
        await db.commit()
        await db.refresh(ponto)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EDITAR",
            modulo="Assiduidade",
            descricao=f"Corrigiu batida de ponto ID {ponto_id} do funcionário ID {ponto.funcionario_id}.",
        )
        return ponto
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar a alteração de ponto: {str(e)}",
        )


@router.delete("/{ponto_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[gestor_guard])
async def delete_ponto(
    ponto_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Exclui um registo de ponto com segurança."""
    query = select(Assiduidade).where(Assiduidade.id == ponto_id)
    res = await db.execute(query)
    ponto = res.scalar_one_or_none()

    if not ponto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ponto não encontrado.",
        )

    try:
        func_id = ponto.funcionario_id
        await db.delete(ponto)
        await db.commit()

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EXCLUIR",
            modulo="Assiduidade",
            descricao=f"Excluiu permanentemente a batida de ponto ID {ponto_id} do funcionário ID {func_id}.",
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir batida de ponto: {str(e)}",
        )

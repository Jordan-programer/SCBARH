from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, RoleChecker
from app.models.usuario import Usuario, RoleEnum
from app.schemas.funcionario import FuncionarioCreate, FuncionarioUpdate, FuncionarioResponse
from app.services.funcionario_service import FuncionarioService

router = APIRouter(prefix="/funcionarios", tags=["Funcionários"])

# Guardas de Cargos
admin_rh_guard = Depends(RoleChecker([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH]))
gestor_guard = Depends(RoleChecker([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH, RoleEnum.GESTOR]))


@router.get("/", response_model=List[FuncionarioResponse], dependencies=[gestor_guard])
async def list_funcionarios(
    ativo: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """Lista todos os funcionários cadastrados com paginação opcional."""
    return await FuncionarioService.get_funcionarios(db, skip=skip, limit=limit, ativo=ativo)


@router.get("/{funcionario_id}", response_model=FuncionarioResponse, dependencies=[gestor_guard])
async def get_funcionario_by_id(funcionario_id: int, db: AsyncSession = Depends(get_db)):
    """Obtém os dados detalhados de um funcionário pelo seu ID."""
    return await FuncionarioService.get_funcionario(db, funcionario_id)


@router.post("/", response_model=FuncionarioResponse, status_code=status.HTTP_201_CREATED, dependencies=[admin_rh_guard])
async def create_funcionario(
    data: FuncionarioCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cria um novo registo de funcionário no sistema (Apenas admin e RH)."""
    return await FuncionarioService.create_funcionario(db, data, current_user.id)


@router.put("/{funcionario_id}", response_model=FuncionarioResponse, dependencies=[admin_rh_guard])
async def update_funcionario(
    funcionario_id: int,
    data: FuncionarioUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Atualiza dados cadastrais de um funcionário (Apenas admin e RH)."""
    return await FuncionarioService.update_funcionario(db, funcionario_id, data, current_user.id)


@router.delete("/{funcionario_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[admin_rh_guard])
async def delete_funcionario(
    funcionario_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Exclui ou desativa com segurança um funcionário do sistema (Apenas admin e RH)."""
    await FuncionarioService.delete_funcionario(db, funcionario_id, current_user.id)

from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.dependencies import get_db, get_current_user, RoleChecker
from app.models.usuario import Usuario, RoleEnum
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from app.utils.security import hash_password
from app.utils.audit import log_audit

router = APIRouter(prefix="/usuarios", tags=["Utilizadores"])

# Apenas administradores podem gerir utilizadores
admin_guard = Depends(RoleChecker([RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN_RH]))


@router.get("/me", response_model=UsuarioResponse)
async def get_me(current_user: Usuario = Depends(get_current_user)):
    """Obtém os dados do utilizador atualmente autenticado."""
    return current_user


@router.get("/", response_model=List[UsuarioResponse], dependencies=[admin_guard])
async def get_usuarios(db: AsyncSession = Depends(get_db)):
    """Lista todos os utilizadores registados no sistema."""
    query = select(Usuario).order_by(Usuario.id.desc())
    res = await db.execute(query)
    return list(res.scalars().all())


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED, dependencies=[admin_guard])
async def create_usuario(
    data: UsuarioCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cria um novo utilizador no sistema."""
    # Verificar se email já existe
    query = select(Usuario).where(Usuario.email == data.email)
    res = await db.execute(query)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O email introduzido já está cadastrado.",
        )

    try:
        user = Usuario(
            nome=data.nome,
            email=data.email,
            senha_hash=hash_password(data.senha),
            role=data.role,
            ativo=data.ativo,
            funcionario_id=data.funcionario_id,
            morador_id=data.morador_id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="CRIAR",
            modulo="Utilizadores",
            descricao=f"Criou o utilizador {user.email} (ID {user.id}).",
        )
        return user
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar utilizador: {str(e)}",
        )


@router.put("/{usuario_id}", response_model=UsuarioResponse, dependencies=[admin_guard])
async def update_usuario(
    usuario_id: int,
    data: UsuarioUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Atualiza os dados de um utilizador existente."""
    query = select(Usuario).where(Usuario.id == usuario_id)
    res = await db.execute(query)
    user = res.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilizador não encontrado.",
        )

    update_data = data.model_dump(exclude_unset=True)
    if "senha" in update_data and update_data["senha"]:
        user.senha_hash = hash_password(update_data["senha"])
        del update_data["senha"]

    for key, value in update_data.items():
        setattr(user, key, value)

    try:
        await db.commit()
        await db.refresh(user)

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EDITAR",
            modulo="Utilizadores",
            descricao=f"Editou o utilizador {user.email} (ID {user.id}).",
        )
        return user
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao salvar depois de editar: Email duplicado.",
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar depois de editar: {str(e)}",
        )


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[admin_guard])
async def delete_usuario(
    usuario_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Elimina um utilizador de forma segura."""
    if usuario_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não pode excluir a sua própria conta.",
        )

    query = select(Usuario).where(Usuario.id == usuario_id)
    res = await db.execute(query)
    user = res.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilizador não encontrado.",
        )

    try:
        email = user.email
        await db.delete(user)
        await db.commit()

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EXCLUIR",
            modulo="Utilizadores",
            descricao=f"Excluiu permanentemente o utilizador {email}.",
        )
    except IntegrityError:
        await db.rollback()
        # Fallback para desativação segura (soft delete)
        user.ativo = False
        await db.commit()

        await log_audit(
            db=db,
            usuario_id=current_user.id,
            acao="EXCLUIR_SOFT",
            modulo="Utilizadores",
            descricao=f"Desativou utilizador {user.email} devido a restrições de integridade.",
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir utilizador: {str(e)}",
        )

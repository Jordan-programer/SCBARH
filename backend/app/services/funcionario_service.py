from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError

from app.models.funcionario import Funcionario
from app.schemas.funcionario import FuncionarioCreate, FuncionarioUpdate
from app.utils.audit import log_audit


class FuncionarioService:
    @staticmethod
    async def create_funcionario(
        db: AsyncSession, data: FuncionarioCreate, executor_id: int
    ) -> Funcionario:
        """Cria um novo funcionário no sistema."""
        # Verificar duplicados
        bi_query = select(Funcionario).where(Funcionario.bi == data.bi)
        bi_res = await db.execute(bi_query)
        if bi_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Já existe um funcionário cadastrado com o BI {data.bi}.",
            )

        email_query = select(Funcionario).where(Funcionario.email == data.email)
        email_res = await db.execute(email_query)
        if email_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Já existe um funcionário cadastrado com o email {data.email}.",
            )

        try:
            funcionario = Funcionario(**data.model_dump())
            db.add(funcionario)
            await db.commit()
            await db.refresh(funcionario)

            await log_audit(
                db=db,
                usuario_id=executor_id,
                acao="CRIAR",
                modulo="Funcionários",
                descricao=f"Criado funcionário {funcionario.nome} com ID {funcionario.id}.",
            )
            return funcionario
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao salvar o funcionário: {str(e)}",
            )

    @staticmethod
    async def get_funcionario(db: AsyncSession, funcionario_id: int) -> Funcionario:
        """Recupera um funcionário pelo ID."""
        query = select(Funcionario).where(Funcionario.id == funcionario_id)
        result = await db.execute(query)
        funcionario = result.scalar_one_or_none()
        if not funcionario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funcionário não encontrado.",
            )
        return funcionario

    @staticmethod
    async def get_funcionarios(
        db: AsyncSession, skip: int = 0, limit: int = 100, ativo: Optional[bool] = None
    ) -> List[Funcionario]:
        """Lista funcionários com paginação e filtros opcionais."""
        query = select(Funcionario)
        if ativo is not None:
            query = query.where(Funcionario.ativo == ativo)
        query = query.offset(skip).limit(limit)
        result = await db.execute(result=query)
        return list(result.scalars().all())

    @staticmethod
    async def update_funcionario(
        db: AsyncSession, funcionario_id: int, data: FuncionarioUpdate, executor_id: int
    ) -> Funcionario:
        """Edita os dados de um funcionário cadastrado."""
        funcionario = await FuncionarioService.get_funcionario(db, funcionario_id)

        # Atualizar campos
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(funcionario, key, value)

        try:
            await db.commit()
            await db.refresh(funcionario)

            await log_audit(
                db=db,
                usuario_id=executor_id,
                acao="EDITAR",
                modulo="Funcionários",
                descricao=f"Editado funcionário {funcionario.nome} (ID {funcionario.id}).",
            )
            return funcionario
        except IntegrityError as ie:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao salvar: violação de integridade de dados (BI, email ou NIF duplicado).",
            )
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao salvar após editar: {str(e)}",
            )

    @staticmethod
    async def delete_funcionario(
        db: AsyncSession, funcionario_id: int, executor_id: int
    ) -> None:
        """Elimina um funcionário do sistema de forma segura, tratando restrições de chaves estrangeiras."""
        funcionario = await FuncionarioService.get_funcionario(db, funcionario_id)

        try:
            # Tentar remoção física (cascade deleta as dependências associadas)
            await db.delete(funcionario)
            await db.commit()

            await log_audit(
                db=db,
                usuario_id=executor_id,
                acao="EXCLUIR",
                modulo="Funcionários",
                descricao=f"Excluído funcionário {funcionario.nome} (ID {funcionario_id}) permanentemente.",
            )
        except IntegrityError:
            # Caso haja uma restrição de integridade (por exemplo, salários pagos que não devem ser apagados)
            await db.rollback()
            # Fazer soft delete alternativamente
            funcionario.ativo = False
            await db.commit()

            await log_audit(
                db=db,
                usuario_id=executor_id,
                acao="EXCLUIR_SOFT",
                modulo="Funcionários",
                descricao=f"Desativado funcionário {funcionario.nome} (ID {funcionario_id}) devido a restrições de integridade.",
            )
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao excluir o funcionário: {str(e)}",
            )

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.usuario import Usuario, RoleEnum
from app.schemas.auth import LoginRequest, TokenResponse, MoradorRegisterRequest
from app.utils.security import verify_password, hash_password, create_access_token, create_refresh_token
from app.utils.audit import log_audit


class AuthService:
    @staticmethod
    async def authenticate_user(db: AsyncSession, credentials: LoginRequest) -> TokenResponse:
        """Autentica o utilizador através de email e senha, retornando os tokens JWT."""
        query = select(Usuario).where(Usuario.email == credentials.email)
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if not user or not verify_password(credentials.senha, user.senha_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou palavra-passe incorretos.",
            )

        if not user.ativo:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Esta conta de utilizador está inativa.",
            )

        # Gerar tokens
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        # Registar no log de auditoria de forma assíncrona
        await log_audit(
            db=db,
            usuario_id=user.id,
            acao="LOGIN",
            modulo="Autenticação",
            descricao=f"Utilizador {user.email} autenticado com sucesso.",
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        )

    @staticmethod
    async def register_morador_user(db: AsyncSession, data: MoradorRegisterRequest) -> Usuario:
        """Regista um novo utilizador a partir da integração com morador e guarda a ligação."""
        # Verificar se email já existe
        query_check = select(Usuario).where(Usuario.email == data.email)
        res_check = await db.execute(query_check)
        if res_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O email introduzido já está registado no sistema.",
            )

        # Criar utilizador
        new_user = Usuario(
            nome=data.nome,
            email=data.email,
            senha_hash=hash_password(data.senha),
            role=RoleEnum.FUNCIONARIO,
            morador_id=data.morador_id,
            ativo=True,
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        # Registar na auditoria
        await log_audit(
            db=db,
            usuario_id=new_user.id,
            acao="CRIAR",
            modulo="Autenticação Morador",
            descricao=f"Utilizador morador registado com ID local {new_user.id} e linkado ao morador_id {data.morador_id}.",
        )

        return new_user

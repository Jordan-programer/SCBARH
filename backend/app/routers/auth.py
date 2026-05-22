from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.auth import LoginRequest, TokenResponse, MoradorRegisterRequest
from app.schemas.usuario import UsuarioResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Efectua a autenticação de um utilizador no sistema e devolve os tokens JWT."""
    return await AuthService.authenticate_user(db, credentials)


@router.post("/morador/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def register_morador(data: MoradorRegisterRequest, db: AsyncSession = Depends(get_db)):
    """Regista um utilizador a partir de um morador (público para fins de ligação e integração).

    Resolve o erro anterior de 403 ao expor esta rota publicamente.
    """
    user = await AuthService.register_morador_user(db, data)
    return user

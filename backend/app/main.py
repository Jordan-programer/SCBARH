from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.config import settings
from app.database import engine, SessionLocal
from app.models.usuario import Usuario, RoleEnum
from app.utils.security import hash_password
from app.routers import (
    auth,
    usuarios,
    funcionarios,
    contratos,
    ferias,
    ausencias,
    assiduidade,
    horarios,
    salarios,
    dispositivos,
    relatorios,
    notificacoes,
    auditoria,
)


async def seed_super_admin():
    """Garante que haja pelo menos um utilizador SUPER_ADMIN inicial na BD."""
    async with SessionLocal() as db:
        try:
            query = select(Usuario).where(Usuario.role == RoleEnum.SUPER_ADMIN)
            result = await db.execute(query)
            admin = result.scalar_one_or_none()

            if not admin:
                # Criar super admin padrão
                default_admin = Usuario(
                    nome="Super Administrador",
                    email="admin@scbarh.ao",
                    senha_hash=hash_password("admin123"),
                    role=RoleEnum.SUPER_ADMIN,
                    ativo=True,
                )
                db.add(default_admin)
                await db.commit()
                print("====================================================")
                print("Super Administrador padrão criado com sucesso!")
                print("Email: admin@scbarh.ao")
                print("Senha: admin123")
                print("====================================================")
        except Exception as e:
            await db.rollback()
            print(f"Erro ao semear o Super Admin: {str(e)}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Executa no arranque da aplicação
    await seed_super_admin()
    yield
    # Executa ao desligar a aplicação
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API para o Sistema de Controlo Biométrico e de Recursos Humanos (SCBARH)",
    version="1.0.0",
    lifespan=lifespan,
)

# Configuração de CORS para permitir acesso do Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers sob o prefixo /api/v1
api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(usuarios.router, prefix=api_prefix)
app.include_router(funcionarios.router, prefix=api_prefix)
app.include_router(contratos.router, prefix=api_prefix)
app.include_router(ferias.router, prefix=api_prefix)
app.include_router(ausencias.router, prefix=api_prefix)
app.include_router(assiduidade.router, prefix=api_prefix)
app.include_router(horarios.router, prefix=api_prefix)
app.include_router(salarios.router, prefix=api_prefix)
app.include_router(dispositivos.router, prefix=api_prefix)
app.include_router(relatorios.router, prefix=api_prefix)
app.include_router(notificacoes.router, prefix=api_prefix)
app.include_router(auditoria.router, prefix=api_prefix)


@app.get("/health", tags=["Geral"])
async def health_check():
    """Verifica se a API está online."""
    return {"status": "healthy", "app": settings.APP_NAME, "env": settings.APP_ENV}

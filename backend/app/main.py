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


async def seed_users():
    """Garante que os utilizadores padrão existam na BD."""
    async with SessionLocal() as db:
        try:
            users_to_seed = [
                {
                    "nome": "Super Administrador",
                    "email": "admin@scbarh.ao",
                    "senha": "admin123",
                    "role": RoleEnum.SUPER_ADMIN,
                },
                {
                    "nome": "Administrador Geral (Demo)",
                    "email": "admin_demo@scbarh.ao",
                    "senha": "Admin@2026",
                    "role": RoleEnum.SUPER_ADMIN,
                },
                {
                    "nome": "Responsável de Recursos Humanos",
                    "email": "rh@scbarh.ao",
                    "senha": "RhScb@2026",
                    "role": RoleEnum.ADMIN_RH,
                },
                {
                    "nome": "Supervisor de Secção",
                    "email": "supervisor@scbarh.ao",
                    "senha": "Supv@2026",
                    "role": RoleEnum.GESTOR,
                },
                {
                    "nome": "Porteiro de Serviço",
                    "email": "porteiro@scbarh.ao",
                    "senha": "Port@2026",
                    "role": RoleEnum.PORTEIRO,
                },
                {
                    "nome": "Funcionário Padrão",
                    "email": "funcionario@scbarh.ao",
                    "senha": "Func@2026",
                    "role": RoleEnum.FUNCIONARIO,
                },
            ]

            seeded_count = 0
            for u_data in users_to_seed:
                query = select(Usuario).where(Usuario.email == u_data["email"])
                result = await db.execute(query)
                user = result.scalar_one_or_none()

                if not user:
                    new_user = Usuario(
                        nome=u_data["nome"],
                        email=u_data["email"],
                        senha_hash=hash_password(u_data["senha"]),
                        role=u_data["role"],
                        ativo=True,
                    )
                    db.add(new_user)
                    seeded_count += 1
            
            if seeded_count > 0:
                await db.commit()
                print("====================================================")
                print(f"Semeados {seeded_count} utilizadores padrão na Base de Dados!")
                print("====================================================")
        except Exception as e:
            await db.rollback()
            print(f"Erro ao semear os utilizadores: {str(e)}")



async def seed_funcionarios_and_contratos():
    """Garante que existam funcionários e contratos padrão na base de dados para testes."""
    from datetime import date
    from app.models.funcionario import Funcionario
    from app.models.contrato import Contrato
    from app.models.ferias import Ferias

    async with SessionLocal() as db:
        try:
            # Verificar se já existem funcionários
            query = select(Funcionario)
            res = await db.execute(query)
            if res.scalars().first():
                # Garantir vínculo do supervisor mesmo se já semeado
                q_emp = select(Funcionario).where(Funcionario.nome == "Carlos Eduardo Teixeira")
                res_emp = await db.execute(q_emp)
                emp_carlos = res_emp.scalar_one_or_none()
                if emp_carlos:
                    if emp_carlos.email == "c.teixeira@scbarh.ao":
                        emp_carlos.email = "supervisor@scbarh.ao"
                    
                    q_user = select(Usuario).where(Usuario.email == "supervisor@scbarh.ao")
                    res_user = await db.execute(q_user)
                    user_sup = res_user.scalar_one_or_none()
                    if user_sup and user_sup.funcionario_id != emp_carlos.id:
                        user_sup.funcionario_id = emp_carlos.id
                        await db.commit()
                        print("Vínculo do supervisor supervisor@scbarh.ao atualizado com sucesso!")
                return  # Já existem funcionários cadastrados

            # Dados dos funcionários
            funcionarios_data = [
                {
                    "nome": "Amélia Rodrigues Santos",
                    "bi": "123456789LA123",
                    "nif": "123456789LA",
                    "data_nascimento": date(1988, 7, 12),
                    "genero": "F",
                    "telefone": "+244 923 456 789",
                    "email": "a.rodrigues@scbarh.ao",
                    "endereco": "Rua da Missão, 45, Luanda",
                    "cargo": "Contabilista Sénior",
                    "departamento": "Financeiro",
                    "data_admissao": date(2019, 3, 15),
                    "salario": 450000.0,
                    "contrato_tipo": "Efectivo"
                },
                {
                    "nome": "Domingos Ferreira Lopes",
                    "bi": "234567890LA123",
                    "nif": "234567890LA",
                    "data_nascimento": date(1992, 11, 3),
                    "genero": "M",
                    "telefone": "+244 912 345 678",
                    "email": "d.lopes@scbarh.ao",
                    "endereco": "Av. 4 de Fevereiro, 120, Luanda",
                    "cargo": "Engenheiro de Software",
                    "departamento": "TI",
                    "data_admissao": date(2020, 7, 2),
                    "salario": 520000.0,
                    "contrato_tipo": "Efectivo"
                },
                {
                    "nome": "Carlos Eduardo Teixeira",
                    "bi": "345678901LA123",
                    "nif": "345678901LA",
                    "data_nascimento": date(1985, 4, 25),
                    "genero": "M",
                    "telefone": "+244 934 567 890",
                    "email": "supervisor@scbarh.ao",
                    "endereco": "Bairro Maculusso, Luanda",
                    "cargo": "Supervisor de Linha",
                    "departamento": "Operações",
                    "data_admissao": date(2021, 1, 10),
                    "salario": 380000.0,
                    "contrato_tipo": "Efectivo"
                },
                {
                    "nome": "Beatriz Matos Oliveira",
                    "bi": "456789012LA123",
                    "nif": "456789012LA",
                    "data_nascimento": date(1990, 2, 18),
                    "genero": "F",
                    "telefone": "+244 945 678 901",
                    "email": "b.matos@scbarh.ao",
                    "endereco": "Talatona, Luanda Sul",
                    "cargo": "Técnica de Recursos Humanos",
                    "departamento": "RH",
                    "data_admissao": date(2018, 9, 22),
                    "salario": 480000.0,
                    "contrato_tipo": "Efectivo"
                },
                {
                    "nome": "Filomena Neto da Silva",
                    "bi": "567890123LA123",
                    "nif": "567890123LA",
                    "data_nascimento": date(1993, 9, 30),
                    "genero": "F",
                    "telefone": "+244 956 789 012",
                    "email": "f.neto@scbarh.ao",
                    "endereco": "Kilamba, Luanda",
                    "cargo": "Gestora de Vendas",
                    "departamento": "Comercial",
                    "data_admissao": date(2022, 4, 5),
                    "salario": 490000.0,
                    "contrato_tipo": "Efectivo"
                },
                {
                    "nome": "Hélder António Cardoso",
                    "bi": "678901234LA123",
                    "nif": "678901234LA",
                    "data_nascimento": date(1987, 6, 7),
                    "genero": "M",
                    "telefone": "+244 967 890 123",
                    "email": "h.cardoso@scbarh.ao",
                    "endereco": "Viana, Luanda",
                    "cargo": "Coordenador de Armazém",
                    "departamento": "Logística",
                    "data_admissao": date(2020, 11, 14),
                    "salario": 350000.0,
                    "contrato_tipo": "Prazo Certo"
                },
                {
                    "nome": "Ivone Maria Ferreira",
                    "bi": "789012345LA123",
                    "nif": "789012345LA",
                    "data_nascimento": date(1994, 12, 14),
                    "genero": "F",
                    "telefone": "+244 978 901 234",
                    "email": "i.ferreira@scbarh.ao",
                    "endereco": "Benfica, Luanda",
                    "cargo": "Técnica de Suporte TI",
                    "departamento": "Suporte",
                    "data_admissao": date(2021, 6, 28),
                    "salario": 360000.0,
                    "contrato_tipo": "Efectivo"
                },
                {
                    "nome": "Jorge Manuel Sebastião",
                    "bi": "890123456LA123",
                    "nif": "890123456LA",
                    "data_nascimento": date(1998, 8, 22),
                    "genero": "M",
                    "telefone": "+244 989 012 345",
                    "email": "j.sebastiao@scbarh.ao",
                    "endereco": "Cazenga, Luanda",
                    "cargo": "Operador de Produção",
                    "departamento": "Operações",
                    "data_admissao": date(2023, 2, 3),
                    "salario": 280000.0,
                    "contrato_tipo": "Prazo Certo"
                }
            ]

            print("Semeando funcionários e contratos padrão...")
            for f_data in funcionarios_data:
                # Criar funcionário
                f = Funcionario(
                    nome=f_data["nome"],
                    bi=f_data["bi"],
                    nif=f_data["nif"],
                    data_nascimento=f_data["data_nascimento"],
                    genero=f_data["genero"],
                    telefone=f_data["telefone"],
                    email=f_data["email"],
                    endereco=f_data["endereco"],
                    cargo=f_data["cargo"],
                    departamento=f_data["departamento"],
                    data_admissao=f_data["data_admissao"],
                    ativo=True
                )
                db.add(f)
                await db.flush()  # Para obter o ID do funcionário

                # Criar contrato correspondente
                c = Contrato(
                    funcionario_id=f.id,
                    tipo=f_data["contrato_tipo"],
                    data_inicio=f_data["data_admissao"],
                    salario_base=f_data["salario"],
                    subsidio_alimentacao=30000.0,
                    subsidio_transporte=25000.0,
                    ativo=True
                )
                db.add(c)

                # Criar algumas férias de demonstração
                if f_data["nome"] == "Carlos Eduardo Teixeira":
                    fer = Ferias(
                        funcionario_id=f.id,
                        ano=2026,
                        data_inicio=date(2026, 7, 14),
                        data_fim=date(2026, 7, 28),
                        dias_gozados=11,
                        status="Aprovado",
                        observacoes="Férias anuais programadas"
                    )
                    db.add(fer)
                elif f_data["nome"] == "Filomena Neto da Silva":
                    fer = Ferias(
                        funcionario_id=f.id,
                        ano=2026,
                        data_inicio=date(2026, 8, 4),
                        data_fim=date(2026, 8, 15),
                        dias_gozados=10,
                        status="Pendente",
                        observacoes="Pedido de férias anuais"
                    )
                    db.add(fer)
                elif f_data["nome"] == "Amélia Rodrigues Santos":
                    fer = Ferias(
                        funcionario_id=f.id,
                        ano=2026,
                        data_inicio=date(2026, 9, 1),
                        data_fim=date(2026, 9, 12),
                        dias_gozados=10,
                        status="Pendente",
                        observacoes="Férias anuais"
                    )
                    db.add(fer)

                # Vincular o utilizador real correspondente se existir
                if f_data["email"] == "rh@scbarh.ao":
                    # Vincular ao utilizador rh@scbarh.ao
                    q_user = select(Usuario).where(Usuario.email == "rh@scbarh.ao")
                    res_user = await db.execute(q_user)
                    user = res_user.scalar_one_or_none()
                    if user:
                        user.funcionario_id = f.id
                elif f_data["email"] == "supervisor@scbarh.ao":
                    # Vincular ao utilizador supervisor@scbarh.ao
                    q_user = select(Usuario).where(Usuario.email == "supervisor@scbarh.ao")
                    res_user = await db.execute(q_user)
                    user = res_user.scalar_one_or_none()
                    if user:
                        user.funcionario_id = f.id

            await db.commit()
            print("Funcionários, contratos e férias semeados com sucesso!")
        except Exception as e:
            await db.rollback()
            print(f"Erro ao semear funcionários e contratos: {str(e)}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Executa no arranque da aplicação
    await seed_users()
    await seed_funcionarios_and_contratos()
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

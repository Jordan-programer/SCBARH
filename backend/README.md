# SCBARH Backend — Python FastAPI

Este é o backend do **Sistema de Controlo Biométrico e de Recursos Humanos (SCBARH)**, desenvolvido em Python utilizando **FastAPI**, **SQLAlchemy 2.0 (Assíncrono)** e **MySQL/MariaDB**.

## Requisitos Prévios

* Python 3.10+
* Servidor MySQL/MariaDB (por exemplo, via XAMPP)
* Base de dados criada com o nome `scbarh_db`

## Instalação e Configuração

1. Abra o terminal na pasta do backend:
   ```bash
   cd c:\xampp\htdocs\SCBARH\backend
   ```

2. Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv
   # No Windows:
   venv\Scripts\activate
   # No Linux/Mac:
   source venv/bin/activate
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Verifique as configurações no ficheiro `.env` (crie um a partir de `.env.example` se necessário). As credenciais padrão do XAMPP já vêm pré-configuradas.

## Migrações da Base de Dados (Alembic)

1. Gere a primeira migração de base de dados:
   ```bash
   alembic revision --autogenerate -m "initial_migration"
   ```

2. Aplique as migrações para criar as tabelas:
   ```bash
   alembic upgrade head
   ```

## Iniciar a Aplicação

1. Inicie o servidor FastAPI via uvicorn:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

2. Aceda à documentação interactiva no seu navegador:
   * Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   * ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Credenciais do Super Admin Padrão

No primeiro arranque, o sistema semeia automaticamente o utilizador de acesso inicial (caso não exista):
* **Email**: `admin@scbarh.ao`
* **Senha**: `admin123`

from datetime import date, datetime, time, timedelta
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models.assiduidade import Assiduidade
from app.models.funcionario import Funcionario
from app.schemas.assiduidade import AssiduidadeCreate, AssiduidadeUpdate
from app.utils.audit import log_audit


class AssiduidadeService:
    @staticmethod
    async def registar_ponto(
        db: AsyncSession, funcionario_id: int, dispositivo_id: Optional[int] = None
    ) -> Assiduidade:
        """Regista uma marcação de ponto biométrico (entrada ou saída) para o dia de hoje."""
        # Verificar se funcionário existe e está ativo
        func_query = select(Funcionario).where(
            Funcionario.id == funcionario_id, Funcionario.ativo == True
        )
        func_res = await db.execute(func_query)
        funcionario = func_res.scalar_one_or_none()
        if not funcionario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funcionário não encontrado ou inativo.",
            )

        hoje = date.today()
        agora = datetime.now().time()

        # Procurar por registo de assiduidade existente para hoje
        query = select(Assiduidade).where(
            Assiduidade.funcionario_id == funcionario_id, Assiduidade.data == hoje
        )
        res = await db.execute(query)
        assiduidade = res.scalar_one_or_none()

        try:
            if not assiduidade:
                # Registo de Entrada
                # Definir status básico. Se entrar depois das 08:15 (tendo tolerância de 15 minutos do padrão 08:00), marcar como atraso
                limite_entrada = time(8, 15)
                status_ponto = "Presente"
                if agora > limite_entrada:
                    status_ponto = "Atraso"

                assiduidade = Assiduidade(
                    funcionario_id=funcionario_id,
                    data=hoje,
                    entrada=agora,
                    status=status_ponto,
                    dispositivo_entrada_id=dispositivo_id,
                )
                db.add(assiduidade)
                descricao_audit = f"Registada ENTRADA para o funcionário ID {funcionario_id} às {agora}."
            else:
                # Registo de Saída (segunda marcação do dia)
                if assiduidade.saida:
                    # Se já marcou saída, podemos estar a re-registar a saída (atualizar a última marcação)
                    assiduidade.saida = agora
                    assiduidade.dispositivo_saida_id = dispositivo_id
                else:
                    assiduidade.saida = agora
                    assiduidade.dispositivo_saida_id = dispositivo_id

                # Calcular horas trabalhadas
                if assiduidade.entrada:
                    t_entrada = datetime.combine(hoje, assiduidade.entrada)
                    t_saida = datetime.combine(hoje, assiduidade.saida)
                    duracao = t_saida - t_entrada
                    horas = max(0.0, duracao.total_seconds() / 3600.0)
                    assiduidade.horas_trabalhadas = round(horas, 2)

                    # Horas extras (tudo acima de 8 horas diárias)
                    if horas > 8.0:
                        assiduidade.horas_extras = round(horas - 8.0, 2)
                    else:
                        assiduidade.horas_extras = 0.0

                descricao_audit = f"Registada SAÍDA para o funcionário ID {funcionario_id} às {agora}. Horas: {assiduidade.horas_trabalhadas}h."

            await db.commit()
            await db.refresh(assiduidade)

            # Gravar log de auditoria
            await log_audit(
                db=db,
                usuario_id=None,  # Ação do sistema/dispositivo biométrico
                acao="PONTO",
                modulo="Assiduidade",
                descricao=descricao_audit,
            )

            return assiduidade
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao salvar a marcação de ponto: {str(e)}",
            )

    @staticmethod
    async def get_assiduidade_funcionario(
        db: AsyncSession, funcionario_id: int, inicio: date, fim: date
    ) -> List[Assiduidade]:
        """Obtém o registo de assiduidade de um funcionário num determinado período."""
        query = (
            select(Assiduidade)
            .where(
                Assiduidade.funcionario_id == funcionario_id,
                Assiduidade.data >= inicio,
                Assiduidade.data <= fim,
            )
            .order_by(Assiduidade.data.asc())
        )
        res = await db.execute(query)
        return list(res.scalars().all())

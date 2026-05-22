import math
from typing import Any, Generic, List, Sequence, TypeVar
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


class PageParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Número da página (1-indexado)")
    size: int = Field(default=10, ge=1, le=100, description="Tamanho da página (itens por página)")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size


class Page(BaseModel, Generic[T]):
    items: List[T] = Field(description="Lista de itens na página atual")
    total: int = Field(description="Total de itens na consulta")
    page: int = Field(description="Página atual")
    size: int = Field(description="Tamanho da página")
    pages: int = Field(description="Total de páginas")


async def paginate(
    db: AsyncSession,
    query,
    params: PageParams,
) -> Page[Any]:
    """Página uma consulta SQLAlchemy de forma assíncrona."""
    # Obter total de itens
    # Se a query tem um ORDER BY, podemos retirá-lo para o COUNT para maior eficiência,
    # mas para simplificar faremos um subquery count.
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one_or_none() or 0

    # Obter os itens paginados
    paginated_query = query.offset(params.offset).limit(params.size)
    items_result = await db.execute(paginated_query)
    # Dependendo da query, scalars() ou mappings() pode ser mais adequado,
    # mas o padrão scalars().all() funciona para modelos SQLAlchemy.
    items = items_result.scalars().all()

    pages = math.ceil(total / params.size) if total > 0 else 0

    return Page(
        items=list(items),
        total=total,
        page=params.page,
        size=params.size,
        pages=pages,
    )

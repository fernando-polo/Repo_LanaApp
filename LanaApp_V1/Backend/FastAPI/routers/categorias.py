from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from DB.conexion import get_db
from models.modelsDB import Categoria, Usuario, Transaccion, Presupuesto, PagoProgramado
from modelsPydantic import CategoriaCreate, CategoriaResponse, CategoriaUpdate
from routers.dependencies import get_current_user

router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"]
)

@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
async def crear_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Verificar si ya existe una categoría con el mismo nombre y tipo
    existente = db.query(Categoria).filter(
        Categoria.nombre == categoria.nombre,
        Categoria.tipo == categoria.tipo
    ).first()
    
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una categoría con este nombre y tipo"
        )
    
    db_categoria = Categoria(
        nombre=categoria.nombre,
        tipo=categoria.tipo
    )
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

@router.get("/", response_model=List[CategoriaResponse])
async def listar_categorias(
    tipo: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Categoria)
    
    if tipo:
        query = query.filter(Categoria.tipo == tipo)
    
    return query.order_by(Categoria.tipo, Categoria.nombre).all()

@router.get("/{categoria_id}", response_model=CategoriaResponse)
async def obtener_categoria(
    categoria_id: int,
    db: Session = Depends(get_db)
):
    categoria = db.query(Categoria).filter(
        Categoria.id == categoria_id
    ).first()
    
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )
    return categoria

@router.put("/{categoria_id}", response_model=CategoriaResponse)
async def actualizar_categoria(
    categoria_id: int,
    categoria: CategoriaUpdate,
    db: Session = Depends(get_db)
):
    db_categoria = db.query(Categoria).filter(
        Categoria.id == categoria_id
    ).first()
    
    if not db_categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )
    
    # Verificar si el nuevo nombre ya existe (si se está actualizando)
    if categoria.nombre and categoria.nombre != db_categoria.nombre:
        existente = db.query(Categoria).filter(
            Categoria.nombre == categoria.nombre,
            Categoria.tipo == (categoria.tipo or db_categoria.tipo)
        ).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una categoría con este nombre y tipo"
            )
    
    update_data = categoria.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_categoria, field, value)
    
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

@router.delete("/{categoria_id}")
async def eliminar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db)
):
    categoria = db.query(Categoria).filter(
        Categoria.id == categoria_id
    ).first()
    
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )
    
    # Verificar si hay transacciones, presupuestos o pagos programados asociados
    transacciones = db.query(Transaccion).filter(
        Transaccion.categoria_id == categoria_id
    ).count()
    
    presupuestos = db.query(Presupuesto).filter(
        Presupuesto.categoria_id == categoria_id
    ).count()
    
    pagos = db.query(PagoProgramado).filter(
        PagoProgramado.categoria_id == categoria_id
    ).count()
    
    if transacciones > 0 or presupuestos > 0 or pagos > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar una categoría con transacciones, presupuestos o pagos programados asociados"
        )
    
    db.delete(categoria)
    db.commit()
    return {"message": "Categoría eliminada exitosamente"}
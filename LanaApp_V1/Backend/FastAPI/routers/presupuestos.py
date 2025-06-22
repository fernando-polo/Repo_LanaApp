from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from DB.conexion import get_db
from models.modelsDB import Presupuesto, Usuario
from modelsPydantic import PresupuestoCreate, PresupuestoResponse, PresupuestoUpdate
from routers.dependencies import get_current_user

router = APIRouter(
    prefix="/presupuestos",
    tags=["Presupuestos"]
)

# router = APIRouter(
#     tags=["Presupuestos"]
# )

@router.post("/", response_model=PresupuestoResponse, status_code=status.HTTP_201_CREATED)
async def crear_presupuesto(
    presupuesto: PresupuestoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Verificar si ya existe un presupuesto para esta categoría en el mes/año
    existente = db.query(Presupuesto).filter(
        Presupuesto.usuario_id == current_user.id,
        Presupuesto.categoria_id == presupuesto.categoria_id,
        Presupuesto.mes == presupuesto.mes,
        Presupuesto.ano == presupuesto.ano
    ).first()
    
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un presupuesto para esta categoría en el periodo seleccionado"
        )
    
    db_presupuesto = Presupuesto(
        usuario_id=current_user.id,
        categoria_id=presupuesto.categoria_id,
        mes=presupuesto.mes,
        ano=presupuesto.ano,
        limite=presupuesto.limite,
        alerta_80=presupuesto.alerta_80,
        alerta_100=presupuesto.alerta_100
    )
    db.add(db_presupuesto)
    db.commit()
    db.refresh(db_presupuesto)
    return db_presupuesto

@router.get("/", response_model=List[PresupuestoResponse])
async def listar_presupuestos(
    mes: int = None,
    ano: int = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    query = db.query(Presupuesto).filter(
        Presupuesto.usuario_id == current_user.id
    )
    
    if mes:
        query = query.filter(Presupuesto.mes == mes)
    if ano:
        query = query.filter(Presupuesto.ano == ano)
    
    return query.order_by(Presupuesto.ano.desc(), Presupuesto.mes.desc()).all()

@router.get("/resumen", response_model=List[PresupuestoResponse])
async def resumen_presupuestos(
    mes: int,
    ano: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return db.query(Presupuesto).filter(
        Presupuesto.usuario_id == current_user.id,
        Presupuesto.mes == mes,
        Presupuesto.ano == ano
    ).all()

@router.get("/{presupuesto_id}", response_model=PresupuestoResponse)
async def obtener_presupuesto(
    presupuesto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    presupuesto = db.query(Presupuesto).filter(
        Presupuesto.id == presupuesto_id,
        Presupuesto.usuario_id == current_user.id
    ).first()
    
    if not presupuesto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presupuesto no encontrado"
        )
    return presupuesto

@router.put("/{presupuesto_id}", response_model=PresupuestoResponse)
async def actualizar_presupuesto(
    presupuesto_id: int,
    presupuesto: PresupuestoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    db_presupuesto = db.query(Presupuesto).filter(
        Presupuesto.id == presupuesto_id,
        Presupuesto.usuario_id == current_user.id
    ).first()
    
    if not db_presupuesto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presupuesto no encontrado"
        )
    
    update_data = presupuesto.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_presupuesto, field, value)
    
    db.commit()
    db.refresh(db_presupuesto)
    return db_presupuesto

@router.delete("/{presupuesto_id}")
async def eliminar_presupuesto(
    presupuesto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    presupuesto = db.query(Presupuesto).filter(
        Presupuesto.id == presupuesto_id,
        Presupuesto.usuario_id == current_user.id
    ).first()
    
    if not presupuesto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presupuesto no encontrado"
        )
    
    db.delete(presupuesto)
    db.commit()
    return {"message": "Presupuesto eliminado exitosamente"}
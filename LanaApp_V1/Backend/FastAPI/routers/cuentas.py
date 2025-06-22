from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from DB.conexion import get_db
from models.modelsDB import Cuenta, Usuario, Transaccion
from modelsPydantic import CuentaCreate, CuentaResponse, CuentaUpdate
from routers.dependencies import get_current_user

router = APIRouter(
    prefix="/cuentas",
    tags=["Cuentas"]
)

@router.post("/", response_model=CuentaResponse, status_code=status.HTTP_201_CREATED)
async def crear_cuenta(
    cuenta: CuentaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Verificar si ya existe una cuenta con el mismo nombre para este usuario
    existente = db.query(Cuenta).filter(
        Cuenta.usuario_id == current_user.id,
        Cuenta.nombre == cuenta.nombre
    ).first()
    
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una cuenta con este nombre"
        )
    
    db_cuenta = Cuenta(
        usuario_id=current_user.id,
        nombre=cuenta.nombre,
        tipo=cuenta.tipo,
        saldo_inicial=cuenta.saldo_inicial
    )
    db.add(db_cuenta)
    db.commit()
    db.refresh(db_cuenta)
    return db_cuenta

@router.get("/", response_model=List[CuentaResponse])
async def listar_cuentas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return db.query(Cuenta).filter(
        Cuenta.usuario_id == current_user.id
    ).order_by(Cuenta.nombre).all()

@router.get("/{cuenta_id}", response_model=CuentaResponse)
async def obtener_cuenta(
    cuenta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    cuenta = db.query(Cuenta).filter(
        Cuenta.id == cuenta_id,
        Cuenta.usuario_id == current_user.id
    ).first()
    
    if not cuenta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta no encontrada"
        )
    return cuenta

@router.put("/{cuenta_id}", response_model=CuentaResponse)
async def actualizar_cuenta(
    cuenta_id: int,
    cuenta: CuentaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    db_cuenta = db.query(Cuenta).filter(
        Cuenta.id == cuenta_id,
        Cuenta.usuario_id == current_user.id
    ).first()
    
    if not db_cuenta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta no encontrada"
        )
    
    # Verificar si el nuevo nombre ya existe (si se está actualizando)
    if cuenta.nombre and cuenta.nombre != db_cuenta.nombre:
        existente = db.query(Cuenta).filter(
            Cuenta.usuario_id == current_user.id,
            Cuenta.nombre == cuenta.nombre
        ).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una cuenta con este nombre"
            )
    
    update_data = cuenta.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_cuenta, field, value)
    
    db.commit()
    db.refresh(db_cuenta)
    return db_cuenta

@router.delete("/{cuenta_id}")
async def eliminar_cuenta(
    cuenta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    cuenta = db.query(Cuenta).filter(
        Cuenta.id == cuenta_id,
        Cuenta.usuario_id == current_user.id
    ).first()
    
    if not cuenta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cuenta no encontrada"
        )
    
    # Verificar si hay transacciones asociadas
    transacciones = db.query(Transaccion).filter(
        Transaccion.cuenta_id == cuenta_id
    ).count()
    
    if transacciones > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar una cuenta con transacciones asociadas"
        )
    
    db.delete(cuenta)
    db.commit()
    return {"message": "Cuenta eliminada exitosamente"}
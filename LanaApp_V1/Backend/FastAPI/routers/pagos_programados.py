from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from DB.conexion import get_db
from models.modelsDB import PagoProgramado, Usuario, Transaccion
from modelsPydantic import PagoProgramadoCreate, PagoProgramadoResponse, PagoProgramadoUpdate
from routers.dependencies import get_current_user

router = APIRouter(
    prefix="/pagos-programados",
    tags=["Pagos Programados"]
)

# router = APIRouter(
#     tags=["Pagos Programados"]
# )

@router.post("/", response_model=PagoProgramadoResponse, status_code=status.HTTP_201_CREATED)
async def crear_pago_programado(
    pago: PagoProgramadoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    db_pago = PagoProgramado(
        usuario_id=current_user.id,
        cuenta_id=pago.cuenta_id,
        categoria_id=pago.categoria_id,
        descripcion=pago.descripcion,
        monto=pago.monto,
        frecuencia=pago.frecuencia,
        proxima_fecha=pago.proxima_fecha,
        activo=pago.activo,
        notificar_antes=pago.notificar_antes
    )
    db.add(db_pago)
    db.commit()
    db.refresh(db_pago)
    return db_pago

@router.get("/", response_model=List[PagoProgramadoResponse])
async def listar_pagos_programados(
    activos: bool = True,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return db.query(PagoProgramado).filter(
        PagoProgramado.usuario_id == current_user.id,
        PagoProgramado.activo == activos
    ).order_by(PagoProgramado.proxima_fecha).all()

@router.get("/proximos", response_model=List[PagoProgramadoResponse])
async def listar_pagos_proximos(
    dias: int = 7,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    hoy = date.today()
    fecha_limite = hoy + timedelta(days=dias)
    
    return db.query(PagoProgramado).filter(
        PagoProgramado.usuario_id == current_user.id,
        PagoProgramado.activo == True,
        PagoProgramado.proxima_fecha >= hoy,
        PagoProgramado.proxima_fecha <= fecha_limite
    ).order_by(PagoProgramado.proxima_fecha).all()

@router.get("/{pago_id}", response_model=PagoProgramadoResponse)
async def obtener_pago_programado(
    pago_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    pago = db.query(PagoProgramado).filter(
        PagoProgramado.id == pago_id,
        PagoProgramado.usuario_id == current_user.id
    ).first()
    
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago programado no encontrado"
        )
    return pago

@router.put("/{pago_id}", response_model=PagoProgramadoResponse)
async def actualizar_pago_programado(
    pago_id: int,
    pago_data: PagoProgramadoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    pago = db.query(PagoProgramado).filter(
        PagoProgramado.id == pago_id,
        PagoProgramado.usuario_id == current_user.id
    ).first()
    
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago programado no encontrado"
        )
    
    update_data = pago_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pago, field, value)
    
    db.commit()
    db.refresh(pago)
    return pago

@router.delete("/{pago_id}")
async def eliminar_pago_programado(
    pago_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    pago = db.query(PagoProgramado).filter(
        PagoProgramado.id == pago_id,
        PagoProgramado.usuario_id == current_user.id
    ).first()
    
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago programado no encontrado"
        )
    
    pago.activo = False
    db.commit()
    return {"message": "Pago programado desactivado correctamente"}

@router.post("/procesar-pendientes")
async def procesar_pagos_pendientes(
    db: Session = Depends(get_db)
):
    hoy = date.today()
    pagos = db.query(PagoProgramado).filter(
        PagoProgramado.activo == True,
        PagoProgramado.proxima_fecha == hoy
    ).all()
    
    resultados = []
    
    for pago in pagos:
        # Crear transacción automática
        transaccion = Transaccion(
            usuario_id=pago.usuario_id,
            cuenta_id=pago.cuenta_id,
            categoria_id=pago.categoria_id,
            monto=pago.monto,
            fecha=hoy,
            descripcion=f"Pago automático: {pago.descripcion}"
        )
        db.add(transaccion)
        
        # Actualizar próxima fecha según frecuencia
        if pago.frecuencia == "mensual":
            pago.proxima_fecha = hoy.replace(month=hoy.month+1)
        elif pago.frecuencia == "anual":
            pago.proxima_fecha = hoy.replace(year=hoy.year+1)
        elif pago.frecuencia == "semanal":
            pago.proxima_fecha = hoy + timedelta(weeks=1)
        
        resultados.append({
            "pago_id": pago.id,
            "transaccion_id": transaccion.id,
            "status": "procesado"
        })
    
    db.commit()
    return {"message": "Pagos procesados", "results": resultados}
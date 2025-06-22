from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date  
from typing import List, Optional
from DB.conexion import get_db
from models.modelsDB import Notificacion, Usuario, Categoria, Presupuesto, Transaccion
from modelsPydantic import NotificacionResponse, TipoNotificacion
from routers.dependencies import get_current_user

router = APIRouter(
    prefix="/notificaciones",
    tags=["Notificaciones"]
)

# router = APIRouter(
#     tags=["Notificaciones"]
# )

@router.get("/", response_model=List[NotificacionResponse])
async def listar_notificaciones(
    leidas: bool = None,
    tipo: Optional[TipoNotificacion] = None,
    limit: int = Query(50, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):

    query = db.query(Notificacion).filter(
        Notificacion.usuario_id == current_user.id
    )
    
    # Filtro por estado leído/no leído
    if leidas is not None:
        query = query.filter(
            Notificacion.estado == "leida" if leidas 
            else Notificacion.estado.in_(["pendiente", "enviada"])
        )
    
    # Filtro por tipo de notificación
    if tipo is not None:
        query = query.filter(Notificacion.tipo == tipo)
    
    # Orden y límite
    notificaciones = query.order_by(
        Notificacion.programada_para.desc()
    ).limit(limit).all()
    
    # Asegurar que datos_extra sea un diccionario válido
    for notif in notificaciones:
        if notif.datos_extra is None:
            notif.datos_extra = {}  # Valor por defecto si es None
    
    return notificaciones

@router.get("/pendientes", response_model=List[NotificacionResponse])
async def listar_notificaciones_pendientes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return db.query(Notificacion).filter(
        Notificacion.usuario_id == current_user.id,
        Notificacion.estado == "pendiente"
    ).order_by(Notificacion.programada_para.asc()).all()

@router.get("/{notificacion_id}", response_model=NotificacionResponse)
async def obtener_notificacion(
    notificacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    notificacion = db.query(Notificacion).filter(
        Notificacion.id == notificacion_id,
        Notificacion.usuario_id == current_user.id
    ).first()
    
    if not notificacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificación no encontrada"
        )
    
    if notificacion.estado == "pendiente":
        notificacion.estado = "leida"
        db.commit()
        db.refresh(notificacion)
    
    return notificacion

@router.post("/{notificacion_id}/marcar-leida")
async def marcar_notificacion_leida(
    notificacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    notificacion = db.query(Notificacion).filter(
        Notificacion.id == notificacion_id,
        Notificacion.usuario_id == current_user.id
    ).first()
    
    if not notificacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificación no encontrada"
        )
    
    if notificacion.estado != "leida":
        notificacion.estado = "leida"
        db.commit()
    
    return {"message": "Notificación marcada como leída"}

@router.delete("/{notificacion_id}")
async def eliminar_notificacion(
    notificacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    notificacion = db.query(Notificacion).filter(
        Notificacion.id == notificacion_id,
        Notificacion.usuario_id == current_user.id
    ).first()
    
    if not notificacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificación no encontrada"
        )
    
    db.delete(notificacion)
    db.commit()
    return {"message": "Notificación eliminada correctamente"}

async def verificar_presupuestos(
    db: Session, 
    usuario_id: int, 
    categoria_id: int, 
    fecha: date, 
    monto: float
):
    # Obtener presupuesto del mes actual para esta categoría
    presupuesto = db.query(Presupuesto).filter(
        Presupuesto.usuario_id == usuario_id,
        Presupuesto.categoria_id == categoria_id,
        Presupuesto.mes == fecha.month,
        Presupuesto.ano == fecha.year
    ).first()

    if not presupuesto:
        return

    # Calcular gasto acumulado
    gasto_total = db.query(
        func.sum(Transaccion.monto)
    ).join(
        Categoria, Transaccion.categoria_id == Categoria.id
    ).filter(
        Transaccion.usuario_id == usuario_id,
        Transaccion.categoria_id == categoria_id,
        extract('month', Transaccion.fecha) == fecha.month,
        extract('year', Transaccion.fecha) == fecha.year,
        Categoria.tipo == 'gasto'
    ).scalar() or 0

    porcentaje_utilizado = (gasto_total / presupuesto.limite) * 100

    # Verificar alertas
    if porcentaje_utilizado >= 100 and presupuesto.alerta_100:
        await crear_notificacion(
            db=db,
            usuario_id=usuario_id,
            tipo="presupuesto_excedido",
            mensaje=f"Presupuesto excedido al 100% para {presupuesto.categoria.nombre}",
            metadata={"nivel": "100%", "categoria_id": categoria_id}
        )
    elif porcentaje_utilizado >= 80 and presupuesto.alerta_80:
        await crear_notificacion(
            db=db,
            usuario_id=usuario_id,
            tipo="presupuesto_excedido",
            mensaje=f"Presupuesto alcanzó el 80% para {presupuesto.categoria.nombre}",
            metadata={"nivel": "80%", "categoria_id": categoria_id}
        )

async def crear_notificacion(
    db: Session,
    usuario_id: int,
    tipo: str,
    mensaje: str,
    metadata: dict = None
):
    db_notificacion = Notificacion(
        usuario_id=usuario_id,
        tipo=tipo,
        mensaje=mensaje,
        datos_extra=metadata or {},
        estado="pendiente"
    )
    db.add(db_notificacion)
    db.commit()
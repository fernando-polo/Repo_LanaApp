from fastapi import APIRouter, Depends, HTTPException, status, Query
from routers.notificaciones import verificar_presupuestos
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import date
from DB.conexion import get_db
from models.modelsDB import Transaccion, Usuario, Categoria
from modelsPydantic import (
    TransaccionCreate, 
    TransaccionResponse, 
    TransaccionUpdate,
    CategoriaResumen,
    HistoricoMensual,
    TopCategorias,
)
from routers.dependencies import get_current_user

router = APIRouter(
    prefix="/transacciones",
    tags=["Transacciones"]
)

# router = APIRouter(
#     tags=["Transacciones"]
# )

@router.post("/", response_model=TransaccionResponse, status_code=status.HTTP_201_CREATED)
async def crear_transaccion(
    transaccion: TransaccionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    db_transaccion = Transaccion(
        usuario_id=current_user.id,
        cuenta_id=transaccion.cuenta_id,
        categoria_id=transaccion.categoria_id,
        monto=transaccion.monto,
        fecha=transaccion.fecha,
        descripcion=transaccion.descripcion
    )
    db.add(db_transaccion)
    db.commit()
    db.refresh(db_transaccion)

    await verificar_presupuestos(db, current_user.id, transaccion.categoria_id, transaccion.fecha, transaccion.monto)

    return db_transaccion

@router.get("/", response_model=List[TransaccionResponse])
async def listar_transacciones(
    skip: int = 0,
    limit: int = 100,
    fecha_inicio: date = None,
    fecha_fin: date = None,
    categoria_id: int = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    query = db.query(Transaccion).filter(Transaccion.usuario_id == current_user.id)
    
    if fecha_inicio:
        query = query.filter(Transaccion.fecha >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Transaccion.fecha <= fecha_fin)
    if categoria_id:
        query = query.filter(Transaccion.categoria_id == categoria_id)
    
    return query.offset(skip).limit(limit).all()



# Endpoints para gráficas
@router.get("/resumen-categorias", response_model=dict)
async def resumen_categorias(
    mes: int = Query(..., ge=1, le=12),
    ano: int = Query(..., ge=2000),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Devuelve un resumen de ingresos y gastos agrupados por categoría para un mes/año específico.
    """
    resultados = db.query(
        Categoria.nombre,
        Categoria.tipo,
        func.sum(Transaccion.monto).label('total')
    ).join(
        Transaccion, Transaccion.categoria_id == Categoria.id
    ).filter(
        Transaccion.usuario_id == current_user.id,
        extract('month', Transaccion.fecha) == mes,
        extract('year', Transaccion.fecha) == ano
    ).group_by(
        Categoria.nombre, Categoria.tipo
    ).all()

    ingresos = []
    gastos = []
    
    for nombre, tipo, total in resultados:
        if tipo == 'ingreso':
            ingresos.append({"categoria": nombre, "total": float(total)})
        else:
            gastos.append({"categoria": nombre, "total": float(total)})
    
    total_ingresos = sum(item['total'] for item in ingresos)
    total_gastos = sum(item['total'] for item in gastos)
    
    return {
        "ingresos": ingresos,
        "gastos": gastos,
        "balance_total": {
            "total_ingresos": total_ingresos,
            "total_gastos": total_gastos,
            "diferencia": total_ingresos - total_gastos
        }
    }

@router.get("/historico", response_model=List[HistoricoMensual])
async def historico_mensual(
    ano: int = Query(..., ge=2000),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Primero obtenemos los meses con datos
    meses_con_datos = db.query(
        extract('month', Transaccion.fecha).label('mes')
    ).filter(
        Transaccion.usuario_id == current_user.id,
        extract('year', Transaccion.fecha) == ano
    ).group_by(
        extract('month', Transaccion.fecha)
    ).all()

    resultados = []
    nombres_meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    for mes_data in meses_con_datos:
        mes = int(mes_data.mes)
        
        # Consulta separada para ingresos
        ingresos = db.query(
            func.sum(Transaccion.monto)
        ).join(
            Categoria, Transaccion.categoria_id == Categoria.id
        ).filter(
            Transaccion.usuario_id == current_user.id,
            extract('year', Transaccion.fecha) == ano,
            extract('month', Transaccion.fecha) == mes,
            Categoria.tipo == 'ingreso'
        ).scalar() or 0

        # Consulta separada para gastos
        gastos = db.query(
            func.sum(Transaccion.monto)
        ).join(
            Categoria, Transaccion.categoria_id == Categoria.id
        ).filter(
            Transaccion.usuario_id == current_user.id,
            extract('year', Transaccion.fecha) == ano,
            extract('month', Transaccion.fecha) == mes,
            Categoria.tipo == 'gasto'
        ).scalar() or 0

        resultados.append({
            "mes": nombres_meses[mes-1],
            "ingresos": float(ingresos),
            "gastos": float(gastos),
            "balance": float(ingresos - gastos)
        })

    return resultados

@router.get("/top-categorias", response_model=List[TopCategorias])
async def top_categorias(
    tipo: str = Query(..., regex="^(ingreso|gasto)$"),
    limite: int = Query(5, ge=1),
    ano: int = Query(None, ge=2000),
    mes: int = Query(None, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Devuelve las categorías con más transacciones (por monto total) filtradas por tipo.
    """
    query = db.query(
        Categoria.nombre,
        func.sum(Transaccion.monto).label('total')
    ).join(
        Transaccion, Transaccion.categoria_id == Categoria.id
    ).filter(
        Transaccion.usuario_id == current_user.id,
        Categoria.tipo == tipo
    )

    if ano:
        query = query.filter(extract('year', Transaccion.fecha) == ano)
    if mes:
        query = query.filter(extract('month', Transaccion.fecha) == mes)

    resultados = query.group_by(
        Categoria.nombre
    ).order_by(
        func.sum(Transaccion.monto).desc()
    ).limit(limite).all()

    # Calcular porcentajes
    total_tipo = db.query(
        func.sum(Transaccion.monto)
    ).join(
        Categoria, Transaccion.categoria_id == Categoria.id
    ).filter(
        Transaccion.usuario_id == current_user.id,
        Categoria.tipo == tipo
    )
    
    if ano:
        total_tipo = total_tipo.filter(extract('year', Transaccion.fecha) == ano)
    if mes:
        total_tipo = total_tipo.filter(extract('month', Transaccion.fecha) == mes)

    total = total_tipo.scalar() or 1  # Evitar división por cero

    return [
        {
            "categoria": nombre,
            "total": float(total_cat),
            "porcentaje": round((total_cat / total) * 100, 2)
        }
        for nombre, total_cat in resultados
    ]

@router.get("/detalle-categoria/{categoria_id}", response_model=dict)
async def detalle_categoria(
    categoria_id: int,
    mes: int = Query(None, ge=1, le=12),
    ano: int = Query(None, ge=2000),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Verificar que la categoría existe
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )

    # Query para transacciones específicas
    query = db.query(Transaccion).filter(
        Transaccion.usuario_id == current_user.id,
        Transaccion.categoria_id == categoria_id
    )

    if ano and mes:
        query = query.filter(
            extract('year', Transaccion.fecha) == ano,
            extract('month', Transaccion.fecha) == mes
        )
    elif ano:
        query = query.filter(extract('year', Transaccion.fecha) == ano)

    transacciones = query.order_by(Transaccion.fecha.desc()).all()

    # Calcular total del mes si se especificó mes
    total_mes = sum(t.monto for t in transacciones) if (ano and mes) else None
    
    # Calcular promedio mensual (consulta separada para SQLite)
    if ano and mes:
        # Para el promedio, primero obtenemos las sumas mensuales
        sumas_mensuales = db.query(
            func.sum(Transaccion.monto).label('total_mensual')
        ).filter(
            Transaccion.usuario_id == current_user.id,
            Transaccion.categoria_id == categoria_id
        ).group_by(
            extract('year', Transaccion.fecha),
            extract('month', Transaccion.fecha)
        ).all()

        # Luego calculamos el promedio manualmente
        if sumas_mensuales:
            promedio_mensual = sum(t.total_mensual for t in sumas_mensuales) / len(sumas_mensuales)
        else:
            promedio_mensual = 0
    else:
        promedio_mensual = None

    return {
        "categoria": categoria.nombre,
        "tipo": categoria.tipo,
        "transacciones": [
            {
                "fecha": t.fecha,
                "monto": float(t.monto),
                "descripcion": t.descripcion
            }
            for t in transacciones
        ],
        "total_mes": float(total_mes) if total_mes is not None else None,
        "promedio_mensual": float(promedio_mensual) if promedio_mensual is not None else None
    }
@router.get("/{transaccion_id}", response_model=TransaccionResponse)
async def obtener_transaccion(
    transaccion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    transaccion = db.query(Transaccion).filter(
        Transaccion.id == transaccion_id,
        Transaccion.usuario_id == current_user.id
    ).first()
    
    if not transaccion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transacción no encontrada"
        )
    return transaccion

# @router.put("/{transaccion_id}", response_model=TransaccionResponse)
# async def actualizar_transaccion(
#     transaccion_id: int,
#     transaccion: TransaccionUpdate,
#     db: Session = Depends(get_db),
#     current_user: Usuario = Depends(get_current_user)
# ):
#     db_transaccion = db.query(Transaccion).filter(
#         Transaccion.id == transaccion_id,
#         Transaccion.usuario_id == current_user.id
#     ).first()
    
#     if not db_transaccion:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Transacción no encontrada"
#         )
    
#     update_data = transaccion.dict(exclude_unset=True)
#     for field, value in update_data.items():
#         setattr(db_transaccion, field, value)
    
#     db.commit()
#     db.refresh(db_transaccion)
#     return db_transaccion

@router.delete("/{transaccion_id}")
async def eliminar_transaccion(
    transaccion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    transaccion = db.query(Transaccion).filter(
        Transaccion.id == transaccion_id,
        Transaccion.usuario_id == current_user.id
    ).first()
    
    if not transaccion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transacción no encontrada"
        )
    
    db.delete(transaccion)
    db.commit()
    return {"message": "Transacción eliminada exitosamente"}

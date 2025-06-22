from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from DB.conexion import Base, engine

# Importar todos los routers
from routers import (
    auth,
    usuarios,
    transacciones,
    presupuestos,
    pagos_programados,
    notificaciones,
    cuentas,      
    categorias    
)

app = FastAPI(
    title="Lana App API",
    description="API para el sistema de gestión financiera Lana App",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración CORS (para desarrollo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Crear tablas en la base de datos (solo para desarrollo)
Base.metadata.create_all(bind=engine)

# Incluir routers
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(transacciones.router)
app.include_router(cuentas.router)       
app.include_router(categorias.router) 
app.include_router(presupuestos.router)
app.include_router(pagos_programados.router)
app.include_router(notificaciones.router)



@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Bienvenido a Lana App API",
        "endpoints": {
            "documentación": "/docs",
            "autenticación": "/api/auth",
            "usuarios": "/api/usuarios",
            "transacciones": "/api/transacciones",
            "presupuestos": "/api/presupuestos",
            "pagos_programados": "/api/pagos-programados",
            "notificaciones": "/api/notificaciones"
        }
    }
from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import date, datetime
from typing import Optional
from enum import Enum

# --------------------------
# ENUMS (Para opciones fijas)
# --------------------------

class TipoCuenta(str, Enum):
    banco = "banco"
    tarjeta = "tarjeta"
    efectivo = "efectivo"
    otro = "otro"

class TipoCategoria(str, Enum):
    ingreso = "ingreso"
    gasto = "gasto"

class FrecuenciaPago(str, Enum):
    mensual = "mensual"
    semanal = "semanal"
    anual = "anual"
    unica = "unica"

class TipoNotificacion(str, Enum):
    presupuesto_excedido = "presupuesto_excedido"
    pago_programado = "pago_programado"
    saldo_bajo = "saldo_bajo"
    recuperacion = "recuperacion"

class MedioNotificacion(str, Enum):
    email = "email"
    sms = "sms"
    push = "push"

class EstadoNotificacion(str, Enum):
    pendiente = "pendiente"
    enviada = "enviada"
    fallida = "fallida"
    leida = "leida"

# --------------------------
# MODELOS BASE (Campos opcionales)
# --------------------------

class UsuarioBase(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100, description="Nombre completo del usuario")
    email: Optional[EmailStr] = Field(None, description="Correo electrónico válido", example="usuario@dominio.com")
    telefono: Optional[str] = Field(None, min_length=10, max_length=15, description="Número de teléfono")

class CuentaBase(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100, description="Nombre descriptivo de la cuenta")
    tipo: Optional[TipoCuenta] = Field(None, description="Tipo de cuenta")
    saldo_inicial: Optional[float] = Field(None, ge=0, description="Saldo inicial de la cuenta")

class CategoriaBase(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=50, description="Nombre de la categoría")
    tipo: Optional[TipoCategoria] = Field(None, description="Tipo de categoría (ingreso/gasto)")

class TransaccionBase(BaseModel):
    monto: Optional[float] = Field(None, description="Monto de la transacción")
    fecha: Optional[date] = Field(None, description="Fecha de la transacción (YYYY-MM-DD)")
    descripcion: Optional[str] = Field(None, max_length=255, description="Descripción opcional")

class PresupuestoBase(BaseModel):
    mes: Optional[int] = Field(None, ge=1, le=12, description="Mes del presupuesto (1-12)")
    ano: Optional[int] = Field(None, ge=2000, description="Año del presupuesto")
    limite: Optional[float] = Field(None, gt=0, description="Límite mensual para la categoría")
    alerta_80: Optional[bool] = Field(True, description="Recibir alerta al alcanzar 80% del presupuesto")
    alerta_100: Optional[bool] = Field(True, description="Recibir alerta al alcanzar 100% del presupuesto")

class PagoProgramadoBase(BaseModel):
    descripcion: Optional[str] = Field(None, min_length=2, max_length=100, description="Descripción del pago")
    monto: Optional[float] = Field(None, gt=0, description="Monto del pago programado")
    frecuencia: Optional[FrecuenciaPago] = Field(None, description="Frecuencia del pago")
    proxima_fecha: Optional[date] = Field(None, description="Próxima fecha de pago (YYYY-MM-DD)")
    activo: Optional[bool] = Field(True, description="Indica si el pago está activo")
    notificar_antes: Optional[int] = Field(2, ge=1, le=30, description="Días de anticipación para notificar")

class PreferenciaNotificacionBase(BaseModel):
    por_email: Optional[bool] = Field(True, description="Recibir notificaciones por email")
    por_sms: Optional[bool] = Field(False, description="Recibir notificaciones por SMS")
    por_push: Optional[bool] = Field(True, description="Recibir notificaciones push en la app")

class NotificacionBase(BaseModel):
    tipo: Optional[TipoNotificacion] = Field(None, description="Tipo de notificación")
    medio: Optional[MedioNotificacion] = Field(None, description="Medio de notificación")
    mensaje: Optional[str] = Field(None, description="Contenido de la notificación")
    programada_para: Optional[datetime] = Field(None, description="Fecha programada para enviar")
    estado: Optional[EstadoNotificacion] = Field("pendiente", description="Estado de la notificación")
    datos_extra: Optional[dict] = Field(None, description="Metadatos adicionales")  

# --------------------------
# MODELOS DE CREACIÓN (Campos obligatorios)
# --------------------------

class UsuarioCreate(UsuarioBase):
    nombre: str
    email: EmailStr
    password: str = Field(..., min_length=8, description="Contraseña segura (mínimo 8 caracteres)")
    
    @field_validator('password')
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v

class CuentaCreate(CuentaBase):
    nombre: str
    tipo: TipoCuenta
    saldo_inicial: float

class CategoriaCreate(CategoriaBase):
    nombre: str
    tipo: TipoCategoria

class TransaccionCreate(TransaccionBase):
    monto: float
    fecha: date
    cuenta_id: int = Field(..., gt=0, description="ID de la cuenta asociada")
    categoria_id: int = Field(..., gt=0, description="ID de la categoría asociada")

class PresupuestoCreate(PresupuestoBase):
    mes: int
    ano: int
    limite: float
    categoria_id: int = Field(..., gt=0, description="ID de la categoría asociada")

class PagoProgramadoCreate(PagoProgramadoBase):
    descripcion: str
    monto: float
    frecuencia: FrecuenciaPago
    proxima_fecha: date
    cuenta_id: int = Field(..., gt=0, description="ID de la cuenta asociada")
    categoria_id: int = Field(..., gt=0, description="ID de la categoría asociada")

class NotificacionCreate(NotificacionBase):
    tipo: TipoNotificacion
    medio: MedioNotificacion
    mensaje: str
    programada_para: datetime

# --------------------------
# MODELOS DE ACTUALIZACIÓN (Todos los campos opcionales)
# --------------------------

class UsuarioUpdate(UsuarioBase):
    password: Optional[str] = Field(None, min_length=8, description="Nueva contraseña")

class CuentaUpdate(CuentaBase):
    pass

class CategoriaUpdate(CategoriaBase):
    pass

class TransaccionUpdate(TransaccionBase):
    pass

class PresupuestoUpdate(PresupuestoBase):
    pass

class PagoProgramadoUpdate(PagoProgramadoBase):
    pass

class PreferenciaNotificacionUpdate(PreferenciaNotificacionBase):
    pass

# --------------------------
# MODELOS DE RESPUESTA (incluyen relaciones y campos adicionales)
# --------------------------

class UsuarioResponse(UsuarioBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CuentaResponse(CuentaBase):
    id: int
    usuario_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CategoriaResponse(CategoriaBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class TransaccionResponse(TransaccionBase):
    id: int
    usuario_id: int
    cuenta_id: int
    categoria_id: int
    created_at: datetime
    updated_at: datetime
    cuenta: Optional[CuentaResponse]
    categoria: Optional[CategoriaResponse]
    
    class Config:
        from_attributes = True

class PresupuestoResponse(PresupuestoBase):
    id: int
    usuario_id: int
    categoria_id: int
    created_at: datetime
    updated_at: datetime
    categoria: Optional[CategoriaResponse]
    
    class Config:
        from_attributes = True

class PagoProgramadoResponse(PagoProgramadoBase):
    id: int
    usuario_id: int
    cuenta_id: int
    categoria_id: int
    created_at: datetime
    updated_at: datetime
    cuenta: Optional[CuentaResponse]
    categoria: Optional[CategoriaResponse]
    
    class Config:
        from_attributes = True

class NotificacionResponse(NotificacionBase):
    id: int
    usuario_id: int
    created_at: datetime
    datos_extra: Optional[dict] = None
    
    class Config:
        from_attributes = True

# --------------------------
# MODELOS PARA AUTENTICACIÓN
# --------------------------

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v
    
# Demás modelos para las gráficas
class CategoriaResumen(BaseModel):
    categoria: str
    total: float
    color: Optional[str] = None

class HistoricoMensual(BaseModel):
    mes: str
    ingresos: float
    gastos: float
    balance: float

class TopCategorias(BaseModel):
    categoria: str
    total: float
    porcentaje: float
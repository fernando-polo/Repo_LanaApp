# models/modelsDB.py
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Float, ForeignKey, Text
from sqlalchemy import Enum, Numeric, JSON
from sqlalchemy.orm import relationship
from DB.conexion import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, autoincrement="auto")
    nombre = Column(String(100))
    email = Column(String(255), unique=True)
    password = Column(String(255))
    telefono = Column(String(20))
    reset_token = Column(String(255))
    reset_token_expiry = Column(DateTime)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    
    # Relaciones
    cuentas = relationship("Cuenta", back_populates="usuario")
    transacciones = relationship("Transaccion", back_populates="usuario")
    presupuestos = relationship("Presupuesto", back_populates="usuario")
    pagos_programados = relationship("PagoProgramado", back_populates="usuario")
    preferencias_notificacion = relationship("PreferenciaNotificacion", back_populates="usuario", uselist=False)
    notificaciones = relationship("Notificacion", back_populates="usuario")
    auth_tokens = relationship("AuthToken", back_populates="usuario")


class AuthToken(Base):
    __tablename__ = "auth_tokens"
    
    id = Column(Integer, primary_key=True, autoincrement="auto")
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    token = Column(String(512))
    expires_at = Column(DateTime)
    created_at = Column(DateTime)
    
    usuario = relationship("Usuario", back_populates="auth_tokens")


class Cuenta(Base):
    __tablename__ = "cuentas"
    
    id = Column(Integer, primary_key=True, autoincrement="auto")
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    nombre = Column(String(100))
    tipo = Column(Enum("banco", "tarjeta", "efectivo", "otro", name="tipo_cuenta"))
    saldo_inicial = Column(Numeric(12, 2), default=0.00)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    
    usuario = relationship("Usuario", back_populates="cuentas")
    transacciones = relationship("Transaccion", back_populates="cuenta")
    pagos_programados = relationship("PagoProgramado", back_populates="cuenta")


class Categoria(Base):
    __tablename__ = "categorias"
    
    id = Column(Integer, primary_key=True, autoincrement="auto")
    nombre = Column(String(50))
    tipo = Column(Enum("ingreso", "gasto", name="tipo_categoria"))
    created_at = Column(DateTime)
    
    transacciones = relationship("Transaccion", back_populates="categoria")
    presupuestos = relationship("Presupuesto", back_populates="categoria")
    pagos_programados = relationship("PagoProgramado", back_populates="categoria")


class Transaccion(Base):
    __tablename__ = "transacciones"
    
    id = Column(Integer, primary_key=True, autoincrement="auto")
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    cuenta_id = Column(Integer, ForeignKey("cuentas.id"))
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    monto = Column(Numeric(12, 2))
    fecha = Column(Date)
    descripcion = Column(Text)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    
    usuario = relationship("Usuario", back_populates="transacciones")
    cuenta = relationship("Cuenta", back_populates="transacciones")
    categoria = relationship("Categoria", back_populates="transacciones")


class Presupuesto(Base):
    __tablename__ = "presupuestos"
    
    id = Column(Integer, primary_key=True, autoincrement="auto")
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    mes = Column(Integer)
    ano = Column(Integer)
    limite = Column(Numeric(12, 2))
    alerta_80 = Column(Boolean, default=True)
    alerta_100 = Column(Boolean, default=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    
    usuario = relationship("Usuario", back_populates="presupuestos")
    categoria = relationship("Categoria", back_populates="presupuestos")


class PagoProgramado(Base):
    __tablename__ = "pagos_programados"
    
    id = Column(Integer, primary_key=True, autoincrement="auto")
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    cuenta_id = Column(Integer, ForeignKey("cuentas.id"))
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    descripcion = Column(String(100))
    monto = Column(Numeric(12, 2))
    frecuencia = Column(Enum("mensual", "semanal", "anual", "unica", name="frecuencia_pago"))
    proxima_fecha = Column(Date)
    activo = Column(Boolean, default=True)
    notificar_antes = Column(Integer, default=2)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    
    usuario = relationship("Usuario", back_populates="pagos_programados")
    cuenta = relationship("Cuenta", back_populates="pagos_programados")
    categoria = relationship("Categoria", back_populates="pagos_programados")


class PreferenciaNotificacion(Base):
    __tablename__ = "preferencias_notificacion"
    
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), primary_key=True)
    por_email = Column(Boolean, default=True)
    por_sms = Column(Boolean, default=False)
    por_push = Column(Boolean, default=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    
    usuario = relationship("Usuario", back_populates="preferencias_notificacion")


class Notificacion(Base):
    __tablename__ = "notificaciones"
    
    id = Column(Integer, primary_key=True, autoincrement="auto")
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    tipo = Column(Enum("presupuesto_excedido", "pago_programado", "saldo_bajo", "recuperacion", name="tipo_notificacion"))
    medio = Column(Enum("email", "sms", "push", name="medio_notificacion"))
    mensaje = Column(Text)
    programada_para = Column(DateTime)
    enviada_en = Column(DateTime)
    estado = Column(Enum("pendiente", "enviada", "fallida", "leida", name="estado_notificacion"), default="pendiente")
    datos_extra = Column(JSON)  # Cambiado de 'metadata' a 'datos_extra'
    created_at = Column(DateTime)
    
    usuario = relationship("Usuario", back_populates="notificaciones")
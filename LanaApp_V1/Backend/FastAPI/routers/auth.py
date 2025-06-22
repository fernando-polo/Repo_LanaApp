from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone
from DB.conexion import get_db
from models.modelsDB import Usuario
from modelsPydantic import Token, UsuarioCreate, PasswordResetRequest, PasswordResetConfirm
from utils.security import (
    get_password_hash,
    create_access_token,
    authenticate_user,
    verify_password_reset_token
)
from config import settings

router = APIRouter(tags=["Autenticación"], prefix="/api/auth")

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/registro", status_code=status.HTTP_201_CREATED)
async def registro(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db)
):
    db_user = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    hashed_password = get_password_hash(usuario.password)
    db_user = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password=hashed_password,
        telefono=usuario.telefono,
        created_at=datetime.now(timezone.utc), 
        updated_at=datetime.now(timezone.utc) 
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "Usuario creado exitosamente"}

@router.post("/olvide-contrasena")
async def olvide_contrasena(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    user = db.query(Usuario).filter(Usuario.email == request.email).first()
    if user:
        # En producción, enviar email con token de recuperación
        reset_token = create_access_token(data={"sub": user.email})
        return {"message": "Si el email existe, se enviaron instrucciones"}
    return {"message": "Si el email existe, se enviaron instrucciones"}

@router.post("/restablecer-contrasena")
async def restablecer_contrasena(
    confirm: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    email = verify_password_reset_token(confirm.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido o expirado"
        )
    
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    hashed_password = get_password_hash(confirm.new_password)
    user.password = hashed_password
    db.commit()
    return {"message": "Contraseña actualizada exitosamente"}
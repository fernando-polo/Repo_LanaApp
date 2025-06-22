from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from DB.conexion import get_db
from models.modelsDB import Usuario
from modelsPydantic import UsuarioResponse, UsuarioUpdate
from routers.dependencies import get_current_user

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

# router = APIRouter(
#     tags=["Usuarios"]
# )

@router.get("/me", response_model=UsuarioResponse)
async def leer_usuario_actual(
    current_user: Usuario = Depends(get_current_user)
):
    return current_user

@router.put("/me", response_model=UsuarioResponse)
async def actualizar_usuario(
    usuario: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    update_data = usuario.dict(exclude_unset=True)
    
    if "password" in update_data:
        from utils.security import get_password_hash
        update_data["password"] = get_password_hash(update_data["password"])
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/me")
async def eliminar_usuario(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    db.delete(current_user)
    db.commit()
    return {"message": "Usuario eliminado exitosamente"}
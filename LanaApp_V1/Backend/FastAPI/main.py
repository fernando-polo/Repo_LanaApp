from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configurar CORS para permitir conexiones desde React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, reemplaza "*" con tu dominio frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "¡Bienvenido a mi API!"}

@app.get("/api/hello")
def hello():
    return {"message": "¡Hola desde FastAPI!"}
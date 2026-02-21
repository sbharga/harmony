from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.router import api_router

app = FastAPI()

# Configure CORS so the frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

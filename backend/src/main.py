from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src.router import api_router
import os

app = FastAPI()

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Mount the uploads directory to serve static files
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS so the frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

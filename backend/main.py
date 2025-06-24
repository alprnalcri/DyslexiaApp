# ✅ backend/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from auth import router as auth_router
from predict import router as predict_router
from simplify import router as simplify_router
from history import router as history_router
from stats import router as statistics_router
from database import db  # connect_to_mongodb KULLANILMIYOR!

load_dotenv()

app = FastAPI(
    title="Dyslexia Text Analyzer API",
    description="Readability prediction and simplification service for Turkish texts.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚩 Sadece db.command ve index yarat
@app.on_event("startup")
async def startup_db_client():
    try:
        await db.command("ping")
        await db.prediction_history.create_index("user")
        await db.prediction_history.create_index("timestamp")
        await db.simplify_history.create_index("user")
        await db.simplify_history.create_index("created_at")
        print("✅ MongoDB connected & indexes ensured")
    except Exception as e:
        print(f"❌ MongoDB startup error: {e}")
        raise

# Routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(predict_router, prefix="/predict", tags=["Predict"])
app.include_router(simplify_router, prefix="/simplify", tags=["Simplify"])
app.include_router(history_router, prefix="/history", tags=["History"])
app.include_router(statistics_router, prefix="/statistics", tags=["Statistics"])

# Health
@app.get("/health")
async def health_check():
    try:
        await db.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
            "mongo_url": os.getenv("MONGO_URL")
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"status": "unhealthy", "error": str(e)}
        )

@app.get("/")
async def root():
    return {"message": "Welcome to the Dyslexia Text Analyzer API 🚀"}

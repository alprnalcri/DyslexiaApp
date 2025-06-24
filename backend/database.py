# ✅ backend/database.py

from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# 🚩 HEMEN client ve db yarat
client = AsyncIOMotorClient(MONGO_URL)
db = client["dyslexia_db"]

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import io
import csv
from fastapi.responses import StreamingResponse

from auth import get_current_active_user
from database import db  # Mongo client

router = APIRouter()

# --- Pydantic Schema ---
class HistoryEntry(BaseModel):
    text: str
    score: float
    label: str
    simplified: Optional[str] = None
    timestamp: Optional[datetime] = None
    user: Optional[str] = None

# --- Save prediction to Mongo ---
@router.post("/save")
async def save_prediction(
    entry: HistoryEntry,
    current_user: dict = Depends(get_current_active_user)
):
    try:
        entry.timestamp = datetime.utcnow()
        entry.user = current_user["username"]

        # Insert to Mongo
        await db.prediction_history.insert_one(entry.dict())
        return entry

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Save error: {str(e)}")

# --- Get user's prediction history ---
@router.get("/")
async def get_user_history(current_user: dict = Depends(get_current_active_user)):
    try:
        cursor = db.prediction_history.find({"user": current_user["username"]})
        history = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])  # Optional: convert ObjectId
            history.append(doc)
        return history

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Load error: {str(e)}")

# --- Clear user's history ---
@router.delete("/clear")
async def clear_history(current_user: dict = Depends(get_current_active_user)):
    try:
        result = await db.prediction_history.delete_many({"user": current_user["username"]})
        return {"message": f"Deleted {result.deleted_count} entries."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clear error: {str(e)}")

# --- Export user's history as CSV ---
@router.get("/export")
async def export_history(current_user: dict = Depends(get_current_active_user)):
    try:
        cursor = db.prediction_history.find({"user": current_user["username"]})
        user_entries = []
        async for doc in cursor:
            user_entries.append(doc)

        output = io.StringIO()
        writer = csv.DictWriter(
            output,
            fieldnames=["text", "score", "label", "simplified", "timestamp"]
        )
        writer.writeheader()

        for entry in user_entries:
            writer.writerow({
                "text": entry.get("text", ""),
                "score": entry.get("score", ""),
                "label": entry.get("label", ""),
                "simplified": entry.get("simplified", ""),
                "timestamp": str(entry.get("timestamp", ""))
            })

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=history.csv"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export error: {str(e)}")

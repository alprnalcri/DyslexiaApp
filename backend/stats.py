"""
Admin-only statistics functionality from user history.
"""

from database import db
from datetime import datetime
from typing import Dict, Optional, List
from statistics import mean

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from auth import get_current_active_admin  # Yalnızca admin erişimi

router = APIRouter()

# --- Pydantic Response Model ---
class StatsResponse(BaseModel):
    total_texts: int
    label_counts: Dict[str, int]
    average_score: float
    last_analysis: Optional[datetime]

# --- Statistics Endpoint ---
@router.get("/", response_model=StatsResponse)
async def get_statistics(current_user: dict = Depends(get_current_active_admin)):
    """
    Get global statistics about all user predictions.
    Only accessible by admin users.

    Args:
        current_user (dict): Current authenticated admin user

    Returns:
        StatsResponse: Statistics about all predictions

    Raises:
        HTTPException: If any DB error occurs
    """
    try:
        # Load all prediction entries from Mongo
        cursor = db.prediction_history.find({})
        entries = []
        async for doc in cursor:
            entries.append(doc)

        total_texts = len(entries)

        # Count labels
        label_counts = {
            "Easy": sum(1 for e in entries if e.get("label") == "Easy"),
            "Difficult": sum(1 for e in entries if e.get("label") == "Difficult")
        }

        # Average score
        scores = [e.get("score", 0) for e in entries if "score" in e]
        average_score = mean(scores) if scores else 0.0

        # Last analysis timestamp
        last_analysis = None
        if entries:
            # Get latest based on timestamp field
            last_entry = max(
                entries,
                key=lambda x: x.get("timestamp", datetime.min)
            )
            last_analysis = last_entry.get("timestamp")

        return StatsResponse(
            total_texts=total_texts,
            label_counts=label_counts,
            average_score=average_score,
            last_analysis=last_analysis
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate statistics: {str(e)}"
        )

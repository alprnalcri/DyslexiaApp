"""
Text Simplification API route supporting both OpenAI and local MT5 model.
"""

from database import db  # Mongo client
from datetime import datetime

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from utils.openai_client import openai_client
from auth import get_current_active_user

# MT5 imports
from transformers import MT5ForConditionalGeneration, MT5Tokenizer
import torch
import os

router = APIRouter()

# --- Absolute Path & CPU Device ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models/mt5_simplify_tr_model")
DEVICE = torch.device("cpu")

# --- Load MT5 model once ---
print(f"✅ Loading MT5 model from: {MODEL_PATH}")
mt5_tokenizer = MT5Tokenizer.from_pretrained(MODEL_PATH)
mt5_model = MT5ForConditionalGeneration.from_pretrained(MODEL_PATH).to(DEVICE)
print(f"✅ MT5 model loaded successfully on {DEVICE}")

# --- Request/Response models ---
class TextRequest(BaseModel):
    text: str

class SimplifiedText(BaseModel):
    simplified: str

# --- API Route ---
@router.post("/", response_model=SimplifiedText)
async def simplify_text(
    request: TextRequest,
    method: str = Query("openai", enum=["openai", "mt5"]),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Simplify Turkish text using OpenAI's API or local MT5 model.

    Args:
        request (TextRequest): Request containing the text to simplify
        method (str): Simplification method ("openai" or "mt5")
        current_user (dict): Current authenticated user

    Returns:
        SimplifiedText: Response containing the simplified text

    Raises:
        HTTPException: If simplification fails
    """
    try:
        print(f"👉 [INFO] Simplification method: {method}")

        if method == "openai":
            # OpenAI API
            simplified_text = await openai_client.simplify_text(request.text)

        elif method == "mt5":
            # Local MT5 model (CPU)
            input_ids = mt5_tokenizer.encode(
                request.text, return_tensors="pt", truncation=True, max_length=512
            ).to(DEVICE)

            with torch.no_grad():
                generated_ids = mt5_model.generate(
                    input_ids=input_ids,
                    num_beams=4,
                    length_penalty=1.0,
                    max_length=128,
                    early_stopping=True
                )
            simplified_text = mt5_tokenizer.decode(generated_ids[0], skip_special_tokens=True)

        else:
            raise HTTPException(status_code=400, detail="Invalid method")

        # ✅ Mongo kayıt BURAYA eklenir
        record = {
            "user_id": current_user.get("sub"),  # auth.py'den gelen user id
            "original_text": request.text,
            "simplified_text": simplified_text,
            "method": method,
            "created_at": datetime.utcnow()
        }
        await db.simplify_history.insert_one(record)

        return SimplifiedText(simplified=simplified_text)

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to simplify text: {str(e)}"
        )

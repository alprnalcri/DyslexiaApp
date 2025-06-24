from typing import Dict, Optional
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from fastapi import HTTPException, Depends, APIRouter, Request
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from datetime import datetime
import httpx
from database import db

from auth import get_current_active_user

load_dotenv()

class ReadabilityPredictor:
    def __init__(self):
        try:
            model_path = os.getenv('MODEL_PATH')
            if not model_path:
                raise ValueError("MODEL_PATH environment variable not set")

            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            self.tokenizer = AutoTokenizer.from_pretrained(model_path)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
            self.model.to(self.device)
            self.model.eval()

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to initialize model: {str(e)}")

    def predict(self, text: str) -> Dict[str, str]:
        try:
            inputs = self.tokenizer(
                text,
                padding=True,
                truncation=True,
                max_length=512,
                return_tensors="pt"
            ).to(self.device)

            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probabilities = torch.softmax(logits, dim=1)

            predicted_class = torch.argmax(probabilities, dim=1).item()
            score = probabilities[0][predicted_class].item()
            label = "Difficult" if predicted_class == 1 else "Easy"

            return {
                "score": float(score),
                "label": label
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

readability_predictor = ReadabilityPredictor()

class TextRequest(BaseModel):
    text: str

class PredictionResponse(BaseModel):
    score: float
    label: str
    simplified: Optional[str] = None

router = APIRouter()

@router.post("/", response_model=PredictionResponse)
async def predict_readability(
    request: TextRequest,
    current_user: dict = Depends(get_current_active_user),
    raw_request: Request = None
):
    try:
        # 1. Predict
        prediction = readability_predictor.predict(request.text)

        # 2. Save to /save endpoint
        save_payload = {
            "text": request.text,
            "score": prediction["score"],
            "label": prediction["label"],
            "simplified": None,
            "timestamp": str(datetime.now()),
            "user": current_user["username"]
        }

        async with httpx.AsyncClient(base_url=str(raw_request.base_url)) as client:
            await client.post("/save", json=save_payload, headers={
                "Authorization": raw_request.headers.get("authorization")
            })

        # 3. Return response
        return PredictionResponse(
            score=prediction["score"],
            label=prediction["label"],
            simplified=None
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

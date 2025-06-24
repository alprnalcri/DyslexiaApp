"""
OpenAI API client for text simplification.
"""

import os
from dotenv import load_dotenv
import httpx
from typing import Dict, Any
from fastapi import HTTPException

load_dotenv()

class OpenAIClient:
    """Client for OpenAI's Chat Completion API"""

    def __init__(self):
        """Initialize OpenAI client with API key and settings"""
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")

        self.base_url = "https://api.openai.com/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def simplify_text(self, text: str) -> str:
        """
        Simplify Turkish text using OpenAI's API.

        Args:
            text (str): Original Turkish text to simplify

        Returns:
            str: Simplified text

        Raises:
            HTTPException: If API request fails
        """
        try:
            # Prepare the prompt
            prompt = f"""Simplify the following Turkish text for individuals with dyslexia:

            Original text: {text}

            Simplified version:"""

            # Prepare the request payload
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [{
                    "role": "user",
                    "content": prompt
                }],
                "temperature": 0.7,
                "max_tokens": 1000
            }

            # Create a new AsyncClient for this request only
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload
                )

            # Handle non-200 responses
            if response.status_code != 200:
                error_msg = response.json().get('error', {}).get('message', 'Unknown error')
                raise HTTPException(
                    status_code=500,
                    detail=f"OpenAI API error: {error_msg}"
                )

            # Extract and return the simplified text
            response_data = response.json()
            simplified_text = response_data['choices'][0]['message']['content'].strip()
            return simplified_text

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to simplify text: {str(e)}"
            )

# Singleton instance
openai_client = OpenAIClient()

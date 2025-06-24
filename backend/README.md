# Wind Dyslexia App Backend

This is the backend service for the Wind Dyslexia App, providing API endpoints for:
- User authentication
- Readability prediction using BERT
- Text simplification using OpenAI
- History tracking
- Statistics generation

## Project Structure

```
backend/
├── main.py                      # FastAPI application entry point
├── auth.py                      # JWT authentication and user login
├── predict.py                   # BERT readability prediction
├── simplify.py                  # OpenAI text simplification
├── history.py                   # User prediction history
├── statistics.py                # Admin statistics
├── models/                      # Pre-trained model directory
│   └── bert_model/             # BERT model files
├── utils/                       # Utility modules
│   ├── token_handler.py        # JWT and password utilities
│   └── openai_client.py        # OpenAI API client
├── requirements.txt            # Project dependencies
├── .env                        # Environment variables
└── README.md                   # This file
```

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and fill in your configuration:
```bash
cp .env.example .env
```

4. Run the application:
```bash
uvicorn main:app --reload
```

## Environment Variables

Create a `.env` file with the following variables:
```
SECRET_KEY=your-secret-key-here
DATABASE_URL=your-database-url
OPENAI_API_KEY=your-openai-api-key
```

## API Documentation

Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation.

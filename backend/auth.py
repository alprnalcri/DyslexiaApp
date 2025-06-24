"""
JWT authentication and user login functionality.
"""
from database import db

from datetime import timedelta
from typing import Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from utils.token_handler import token_handler

# OAuth2 settings
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# Fake database (in production, replace with real database)
fake_users_db = {
    "admin": {
        "username": "admin",
        "full_name": "Admin User",
        "email": "admin@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # password: "secret"
        "disabled": False,
        "role": "admin"
    },
    "user": {
        "username": "user",
        "full_name": "Regular User",
        "email": "user@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # password: "secret"
        "disabled": False,
        "role": "user"
    }
}

router = APIRouter()

# Helper functions

def get_user(db, username: str):
    """Get user from fake database"""
    if username in db:
        user_dict = db[username]
        return user_dict

def authenticate_user(fake_db, username: str, password: str):
    """
    Authenticate user against fake database.
    
    Args:
        fake_db (dict): Fake user database
        username (str): User's username
        password (str): User's password
        
    Returns:
        dict: User data if authenticated, None otherwise
    """
    user = get_user(fake_db, username)
    if not user:
        return None
    if not token_handler.verify_password(password, user["hashed_password"]):
        return None
    return user

def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Get current user from token.
    
    Args:
        token (str): JWT token
        
    Returns:
        dict: User data
        
    Raises:
        HTTPException: If token is invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = token_handler.decode_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = username
    except:
        raise credentials_exception
    
    user = get_user(fake_users_db, username=token_data)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """
    Get current active user.
    
    Args:
        current_user (dict): Current user data
        
    Returns:
        dict: User data
        
    Raises:
        HTTPException: If user is disabled
    """
    if current_user.get("disabled"):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_admin(current_user: dict = Depends(get_current_user)):
    """
    Get current active admin user.
    
    Args:
        current_user (dict): Current user data
        
    Returns:
        dict: User data
        
    Raises:
        HTTPException: If user is not admin
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges"
        )
    return current_user

# Routes

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate user and return access token.
    
    Args:
        form_data (OAuth2PasswordRequestForm): Form data containing username and password
        
    Returns:
        dict: Access token and token type
        
    Raises:
        HTTPException: If authentication fails
    """
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = token_handler.create_access_token(
        data={"sub": user["username"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

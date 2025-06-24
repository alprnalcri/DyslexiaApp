"""
JWT token handling and password hashing utilities.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict
import os
from dotenv import load_dotenv

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

load_dotenv()

class TokenHandler:
    def __init__(self):
        """Initialize token handler with secret key and algorithm"""
        self.secret_key = os.getenv('SECRET_KEY')
        if not self.secret_key:
            raise ValueError("SECRET_KEY environment variable not set")
        
        self.algorithm = os.getenv('ALGORITHM', 'HS256')
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a JWT access token with the given data and expiration.
        
        Args:
            data (dict): Data to encode in the token
            expires_delta (Optional[timedelta]): Token expiration time
            
        Returns:
            str: Encoded JWT token
        """
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    def decode_token(self, token: str) -> Dict:
        """
        Decode and validate a JWT token.
        
        Args:
            token (str): JWT token to decode
            
        Returns:
            Dict: Decoded token payload
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"}
            )

    def get_password_hash(self, password: str) -> str:
        """
        Hash a password using bcrypt.
        
        Args:
            password (str): Plain text password
            
        Returns:
            str: Hashed password
        """
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash.
        
        Args:
            plain_password (str): Plain text password to verify
            hashed_password (str): Hashed password to compare against
            
        Returns:
            bool: True if password matches, False otherwise
        """
        return self.pwd_context.verify(plain_password, hashed_password)

# Singleton instance
token_handler = TokenHandler()

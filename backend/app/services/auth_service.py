"""
Authentication Service
-------------------
Handles user registration, login, and token management.
"""

import logging
from datetime import datetime, timedelta
from app.services.UserTableDatabaseService import UserDatabaseService
from app.utils.auth import hash_password, check_password, generate_token
from app.utils.exceptions import AuthError, ValidationError, NotFoundError
from flask import current_app
import jwt
import uuid

# Logger configuration
logger = logging.getLogger(__name__)

class AuthService:
    """
    Authentication service.
    
    Handles user registration, login, and token management.
    """
    
    def __init__(self):
        self.user_db_service = UserDatabaseService()
    
    def register(self, user_data):
        """Register a new user"""
        # Validate required fields
        required_fields = ['email', 'username', 'password']
        for field in required_fields:
            if field not in user_data or not user_data[field]:
                raise ValidationError(f"{field} alanı zorunludur")
        
        try:
            # Create user
            user = self.user_db_service.create_user(
                email=user_data['email'],
                username=user_data['username'],
                password=user_data['password'],
                cinsiyet=user_data.get('cinsiyet'),
                universite=user_data.get('universite')
            )
            
            # Generate token
            token = generate_token(user['user_id'])
            
            return {
                'user': user,
                'token': token
            }
            
        except Exception as e:
            logger.error(f"Kullanıcı kaydı sırasında hata: {str(e)}")
            raise ValidationError("Kullanıcı kaydı yapılamadı")
    
    def login(self, email, password):
        """User login"""
        try:
            # Find user by email
            user = self.user_db_service.get_user_by_email(email)
            
            if not user:
                raise AuthError("Geçersiz e-posta veya şifre")
            
            # Check password
            if not check_password(password, user.password_hash):
                raise AuthError("Geçersiz e-posta veya şifre")
            
            # Check if user is active
            if not user.is_active:
                raise AuthError("Hesabınız devre dışı bırakılmış")
            
            # Update last login
            self.user_db_service.update_user(
                user.user_id, 
                {'son_giris_tarihi': datetime.now().isoformat()}
            )
            
            # Generate token
            token = generate_token(user.user_id)
            
            return {
                'user': user.to_dict(),
                'token': token
            }
            
        except AuthError:
            raise
        except Exception as e:
            logger.error(f"Giriş sırasında hata: {str(e)}")
            raise AuthError("Giriş yapılamadı")
    
    # Implement remaining methods similarly
    # ...
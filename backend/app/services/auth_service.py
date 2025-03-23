"""
Authentication Service
-------------------
Handles user registration, login, and token management.
"""

import logging
from datetime import datetime, timedelta
from app.services.UserTableDatabaseService import UserDatabaseService, EmailAlreadyExistsError
from app.utils.auth import hash_password, check_password, generate_token
from app.utils.exceptions import AuthError, ValidationError, NotFoundError
from flask import current_app
import jwt
import uuid
import traceback

# Logger configuration
logger = logging.getLogger(__name__)

class AuthService:
    """
    Authentication service.
    
    Handles user registration, login, and token management.
    """
    
    def __init__(self):
        self.user_db_service = UserDatabaseService.get_instance()

    def _generic_exception_handler(self, e):
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        print (traceback.format_exc())
        raise ValidationError("An error occurred")
    
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
                gender=user_data.get('gender'),
                university=user_data.get('university')
            )
            
            # Generate token
            token = generate_token(user.user_id)
            
            return {
                'user': user.to_dict(),
                'token': token
            }
        except EmailAlreadyExistsError:
            raise ValidationError("Bu e-posta adresi zaten kullanımda")
        except Exception as e:
            logger.error(f"Kullanıcı kaydı sırasında hata: {str(e)}")
            self._generic_exception_handler(e)
            raise ValidationError("Kullanıcı kaydı yapılamadı")
    
    def login(self, email, password):
        """User login"""
        try:
            # Find user by email
            user = self.user_db_service._get_user_by_email(email)
            
            if not user:
                raise AuthError("Geçersiz e-posta veya şifre")
            
            # Check password
            if not check_password(password, user.password_hash):
                raise AuthError("Geçersiz e-posta veya şifre")
            
            # Check if user is active
            if not user.is_active:
                raise AuthError("Hesabınız devre dışı bırakılmış")
            
            # Update last login
            params = {
                'last_login': datetime.now().isoformat()
            }
            self.user_db_service.update_user(
                user_id=user.user_id,
                **params
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
            self._generic_exception_handler(e)
            raise AuthError("Giriş yapılamadı")
    
    def refresh_token(self, user_id):
        """
        Refresh access token.
        
        Args:
            user_id (str): User ID
            
        Returns:
            str: New access token
            
        Raises:
            NotFoundError: If user not found
            AuthError: If user account is disabled
        """
        try:
            # Check if user exists
            user = self.user_db_service._get_user_by_user_id(user_id)
            
            if not user:
                raise NotFoundError("Kullanıcı bulunamadı")
            
            # Check if user is active
            if not user.is_active:
                raise AuthError("Hesabınız devre dışı bırakılmış")
            
            # Generate new token
            token = generate_token(user_id)
            
            return token
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}")
            self._generic_exception_handler(e)
            raise AuthError("Token yenilenemedi")
    
    def change_password(self, user_id, current_password, new_password):
        """
        Change user password.
        
        Args:
            user_id (str): User ID
            current_password (str): Current password
            new_password (str): New password
            
        Returns:
            bool: True if successful
            
        Raises:
            NotFoundError: If user not found
            AuthError: If current password is incorrect
        """
        try:
            # Get user
            user = self.user_db_service._get_user_by_user_id(user_id)
            
            if not user:
                raise NotFoundError("Kullanıcı bulunamadı")
            
            # Verify current password
            if not check_password(current_password, user.password_hash):
                raise AuthError("Mevcut şifre geçersiz")
            
            # Update password
            params = {
                'password': new_password
            }
            self.user_db_service.update_user(
                user_id=user_id, 
                **params
            )
            
            logger.info(f"Password changed for user: {user_id}")
            
            return True
            
        except (NotFoundError, AuthError):
            raise
        except Exception as e:
            logger.error(f"Password change error: {str(e)}")
            self._generic_exception_handler(e)
            raise ValidationError("Şifre değiştirilemedi")
    
    def forgot_password(self, email):
        """
        Request password reset.
        
        Args:
            email (str): User email
            
        Returns:
            dict: Result with token (in debug mode)
            
        Note:
            In a real application, this would send an email with reset link.
            This implementation only returns the token for testing purposes.
        """
        try:
            # Check if user exists
            user = self.user_db_service._get_user_by_email(email)
            
            if user:
                # Generate reset token (1 hour expiration)
                reset_token = generate_token(
                    user.user_id,
                    expires_delta=timedelta(hours=1)
                )
                
                logger.info(f"Password reset token generated for user: {user.user_id}")
                
                # In a real application, send email with reset link
                # send_reset_email(user.email, reset_token)
                
                # Return token in debug mode
                return {
                    'success': True,
                    'token': reset_token if current_app.debug else None
                }
            
            # For security, always return success even if user not found
            return {'success': True}
            
        except Exception as e:
            logger.error(f"Password reset request error: {str(e)}")
            self._generic_exception_handler(e)
            # For security, always return success even if error occurs
            return {'success': True}
    
    def reset_password(self, reset_token, new_password):
        """
        Reset password using token.
        
        Args:
            reset_token (str): Password reset token
            new_password (str): New password
            
        Returns:
            bool: True if successful
            
        Raises:
            AuthError: If token is invalid or expired
        """
        try:
            # Verify token
            try:
                payload = jwt.decode(
                    reset_token,
                    current_app.config['JWT_SECRET_KEY'],
                    algorithms=['HS256']
                )
            except jwt.ExpiredSignatureError:
                raise AuthError("Şifre sıfırlama bağlantısının süresi dolmuş")
            except jwt.InvalidTokenError:
                raise AuthError("Geçersiz şifre sıfırlama bağlantısı")
            
            # Get user ID from token
            user_id = payload.get('sub')
            
            if not user_id:
                raise AuthError("Geçersiz token")
            
            # Check if user exists
            user = self.user_db_service._get_user_by_user_id(user_id)
            
            if not user:
                raise AuthError("Kullanıcı bulunamadı")
            
            params = {
                'password': new_password
            }

            # Update password
            self.user_db_service.update_user(
                user_id=user_id, 
                **params
            )
            
            logger.info(f"Password reset for user: {user_id}")
            
            return True
            
        except AuthError:
            raise
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}")
            self._generic_exception_handler(e)
            raise AuthError("Şifre sıfırlanamadı")

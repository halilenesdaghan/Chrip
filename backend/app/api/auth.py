from flask import Blueprint, request, jsonify, g
from marshmallow import Schema, fields, validate
from app.services.auth_service import AuthService
from app.utils.responses import success_response, error_response, created_response
from app.middleware.validation import validate_schema
from app.middleware.auth import authenticate
from app.utils.exceptions import AuthError, ValidationError
from app.utils.auth import check_university_email
from app.utils.username import get_new_username_for_university

"""
API endpoints for user authentication.

Endpoints:
- /auth/register [POST]: Register a new user
- /auth/login [POST]: User login
- /auth/me [GET]: Get current user info
- /auth/refresh-token [POST]: Refresh token
- /auth/change-password [POST]: Change password
- /auth/forgot-password [POST]: Request password reset
- /auth/reset-password [POST]: Reset password
"""

# Define blueprint
auth_bp = Blueprint('auth', __name__)

auth_service = AuthService()

# Schemas
class RegisterSchema(Schema):
    """Registration schema"""
    email = fields.Email(required=True, error_messages={'required': 'E-posta gereklidir'})
    password = fields.Str(required=True, validate=validate.Length(min=6), error_messages={'required': 'Şifre gereklidir'})
    gender = fields.Str(validate=validate.OneOf(['Erkek', 'Kadın', 'Diğer']))

class LoginSchema(Schema):
    """Login schema"""
    email = fields.Email(required=True, error_messages={'required': 'E-posta gereklidir'})
    password = fields.Str(required=True, error_messages={'required': 'Şifre gereklidir'})

class PasswordChangeSchema(Schema):
    """Password change schema"""
    current_password = fields.Str(required=True, error_messages={'required': 'Mevcut şifre gereklidir'})
    new_password = fields.Str(required=True, validate=validate.Length(min=6), error_messages={'required': 'Yeni şifre gereklidir'})

class ForgotPasswordSchema(Schema):
    """Forgot password schema"""
    email = fields.Email(required=True, error_messages={'required': 'E-posta gereklidir'})

class ResetPasswordSchema(Schema):
    """Reset password schema"""
    reset_token = fields.Str(required=True, error_messages={'required': 'Sıfırlama token gereklidir'})
    new_password = fields.Str(required=True, validate=validate.Length(min=6), error_messages={'required': 'Yeni şifre gereklidir'})

# Routes
@auth_bp.route('/register', methods=['POST'])
@validate_schema(RegisterSchema())
def register():
    """Register a new user"""
    try:
        # Get validated data
        data = request.validated_data

        email = data['email']

        email_exists = auth_service.email_exists(email)
        if email_exists:
            return error_response("E-posta adresi zaten kayıtlı", 400)
        
        university = check_university_email(email)
        if not university:
            return error_response("Geçersiz üniversite e-posta adresi", 400)
        
        data['university'] = university

        data['username'] = get_new_username_for_university(university)
        # Register user
        result = auth_service.register(data)
        
        return created_response(result, "Kullanıcı başarıyla kaydedildi")
    
    except AuthError as e:
        return error_response(e.message, e.status_code)
    
    except ValidationError as e:
        return error_response(e.message, e.status_code, e.errors)
    
    except Exception as e:
        return error_response(str(e), 500)

@auth_bp.route('/login', methods=['POST'])
@validate_schema(LoginSchema())
def login():
    """User login"""
    try:
        # Get validated data
        data = request.validated_data
        
        # Login
        result = auth_service.login(data['email'], data['password'])
        
        return success_response(result, "Giriş başarılı")
    
    except AuthError as e:
        return error_response(e.message, e.status_code)
    
    except Exception as e:
        return error_response(str(e), 500)

@auth_bp.route('/me', methods=['GET'])
@authenticate
def me():
    """Get current user info"""
    # User is stored in g.user by the authenticate middleware
    return success_response(g.user.to_dict(), "Kullanıcı bilgileri getirildi")

@auth_bp.route('/refresh-token', methods=['POST'])
@authenticate
def refresh_token():
    """Refresh token"""
    try:
        # Get current user ID
        user_id = g.user.user_id
        
        # Refresh token
        token = auth_service.refresh_token(user_id)
        
        return success_response({'token': token}, "Token yenilendi")
    
    except AuthError as e:
        return error_response(e.message, e.status_code)
    
    except Exception as e:
        return error_response(str(e), 500)

@auth_bp.route('/change-password', methods=['POST'])
@authenticate
@validate_schema(PasswordChangeSchema())
def change_password():
    """Change password"""
    try:
        # Get validated data
        data = request.validated_data
        
        # Get current user ID
        user_id = g.user.user_id
        
        # Change password
        auth_service.change_password(
            user_id, 
            data['current_password'], 
            data['new_password']
        )
        
        return success_response(None, "Şifre başarıyla değiştirildi")
    
    except AuthError as e:
        return error_response(e.message, e.status_code)
    
    except Exception as e:
        return error_response(str(e), 500)

@auth_bp.route('/forgot-password', methods=['POST'])
@validate_schema(ForgotPasswordSchema())
def forgot_password():
    """Request password reset"""
    try:
        # Get validated data
        data = request.validated_data
        
        # Request password reset
        result = auth_service.forgot_password(data['email'])
        
        return success_response(result, "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi")
    
    except Exception as e:
        # For security, always return success response
        return success_response(None, "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi")

@auth_bp.route('/reset-password', methods=['POST'])
@validate_schema(ResetPasswordSchema())
def reset_password():
    """Reset password"""
    try:
        # Get validated data
        data = request.validated_data
        
        # Reset password
        auth_service.reset_password(
            data['reset_token'], 
            data['new_password']
        )
        
        return success_response(None, "Şifre başarıyla sıfırlandı")
    
    except AuthError as e:
        return error_response(e.message, e.status_code)
    
    except Exception as e:
        return error_response(str(e), 500)
"""
Authentication Middleware
-----------------------
Middleware functions for JWT-based authentication.
"""

import jwt
from functools import wraps
from flask import request, current_app, g
from app.utils.exceptions import AuthError, ForbiddenError, NotFoundError
from app.services.UserTableDatabaseService import UserDatabaseService
from app.models.UserModel import UserModel
import traceback

def get_token_from_header():
    """
    Get Bearer token from request headers.
    
    Returns:
        str: JWT token
        
    Raises:
        AuthError: If token is missing or invalid format
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        raise AuthError('Authorization header gerekli')
    
    parts = auth_header.split()
    
    if parts[0].lower() != 'bearer':
        raise AuthError('Authorization header "Bearer" ile başlamalı')
    
    if len(parts) == 1:
        raise AuthError('Token eksik')
    
    if len(parts) > 2:
        raise AuthError('Authorization header geçersiz formatta')
    
    return parts[1]

def decode_jwt_token(token):
    """
    Validate and decode JWT token.
    
    Args:
        token (str): JWT token
        
    Returns:
        dict: Token payload
        
    Raises:
        AuthError: If token is invalid or expired
    """
    try:
        # Validate token
        payload = jwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=['HS256']
        )
        
        return payload
    
    except jwt.ExpiredSignatureError:
        raise AuthError('Token süresi dolmuş')
    
    except jwt.InvalidTokenError:
        raise AuthError('Geçersiz token')

def authenticate(f):
    """
    Authentication decorator.
    
    Validates user identity and adds user info to g.user.
    
    Args:
        f: Function to decorate
        
    Returns:
        function: Wrapped function
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Get token from headers
        token = get_token_from_header()

        # Validate token
        payload = decode_jwt_token(token)
        
        # Get user ID
        user_id = payload.get('sub')
        
        if not user_id:
            raise AuthError('Geçersiz token: Kullanıcı kimliği bulunamadı')
        
        try:
            # Get user from database
            user_db = UserDatabaseService.get_instance()
            user: UserModel = user_db._get_user_by_user_id(user_id)
            
            # Check if user is active
            if not user or not user.is_active:
                raise AuthError('Hesabınız devre dışı bırakılmış')
            
            # Add user to request context
            g.user = user
            g.user_id = user_id
            
        except Exception as e:
            _traceback = traceback.format_exc()
            print ("\033[93m" + _traceback + "\033[0m", flush=True)
            raise AuthError('Kullanıcı bulunamadı')
        
        return f(*args, **kwargs)
    
    return wrapper

def authorize(required_roles):
    """
    Authorization decorator.
    
    Checks if user has required roles.
    Must be used after authenticate decorator.
    
    Args:
        required_roles (str/list): Required role(s)
        
    Returns:
        function: Decorator function
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Authentication must be done first
            if not hasattr(g, 'user'):
                raise AuthError('Yetkilendirme için kimlik doğrulama gerekli')
            
            # Convert required_roles to list if string
            roles = [required_roles] if isinstance(required_roles, str) else required_roles
            
            # Check user role
            if g.user.role not in roles:
                raise ForbiddenError('Bu işlem için yetkiniz bulunmamaktadır')
            
            return f(*args, **kwargs)
        
        return wrapper
    
    return decorator

def get_current_user():
    """
    Get authenticated user.
    
    Returns:
        UserModel: Authenticated user
        
    Raises:
        AuthError: If user is not authenticated
    """
    if not hasattr(g, 'user'):
        raise AuthError('Kimliği doğrulanmış kullanıcı bulunamadı')
    
    return g.user
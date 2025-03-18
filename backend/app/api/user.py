from flask import Blueprint, request, jsonify, g
from marshmallow import Schema, fields, validate
from app.services.UserTableDatabaseService import UserDatabaseService
from app.utils.responses import success_response, error_response
from app.middleware.auth import authenticate
from app.middleware.validation import validate_schema
from app.utils.auth import generate_token

# Blueprint and Database Service
user_bp = Blueprint('user', __name__)
user_db_service = UserDatabaseService()

# Schemas
class UserCreateSchema(Schema):
    email = fields.Email(required=True)
    username = fields.Str(required=True, validate=validate.Length(min=3, max=30))
    password = fields.Str(required=True, validate=validate.Length(min=6))
    universite = fields.Str()

# Routes
@user_bp.route('/register', methods=['POST'])
@validate_schema(UserCreateSchema())
def register():
    """
    Register a new user
    """
    try:
        data = request.validated_data
        
        # Create user in database
        user = user_db_service.create_user(
            email=data['email'],
            username=data['username'],
            password=data['password'],
            universite=data.get('universite')
        )
        
        return success_response(user.to_dict(), "User registered successfully")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Registration failed", 500)

@user_bp.route('/login', methods=['POST'])
def login():
    """
    User login
    """
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        user = user_db_service.login(username, password)
        
        if user:
            return success_response(
                {
                    "user": user.to_dict(),
                    "token": generate_token(user.user_id)  # Implement your token generation
                }, 
                "Login successful"
            )
        else:
            return error_response("Invalid credentials", 401)
    
    except Exception as e:
        return error_response("Login failed", 500)

@user_bp.route('/profile', methods=['GET'])
@authenticate
def get_profile():
    """
    Get current user's profile
    """
    try:
        # Assuming g.user is set by authentication middleware
        return success_response(g.user.to_dict(), "Profile retrieved")
    except Exception as e:
        return error_response("Profile retrieval failed", 500)
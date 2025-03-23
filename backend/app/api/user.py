from flask import Blueprint, request, jsonify, g
from marshmallow import Schema, fields, validate
from app.services.UserTableDatabaseService import UserDatabaseService
from app.utils.responses import success_response, error_response
from app.middleware.auth import authenticate
from app.middleware.validation import validate_schema, validate_path_param, is_uuid, is_positive_integer
from app.utils.auth import generate_token
import traceback

"""
API endpoints for user operations.

Endpoints:
- /users/by-username/<username> [GET]: Get user by username
- /users/profile [PUT]: Update current user's profile
- /users/account [DELETE]: Delete current user's account
- /users/forums [GET]: Get forums of current user
- /users/polls [GET]: Get polls of current user
- /users/groups [GET]: Get groups of current user
"""

# Blueprint and Database Service
user_bp = Blueprint('user', __name__)
user_db_service = UserDatabaseService.get_instance()

# Şemalar
class UserUpdateSchema(Schema):
    """Kullanıcı güncelleme şeması"""
    username = fields.Str(validate=validate.Length(min=3, max=30))
    password = fields.Str(validate=validate.Length(min=6))
    gender = fields.Str(validate=validate.OneOf(['Erkek', 'Kadın', 'Diğer']))
    university = fields.Str()
    profile_image_url = fields.Url()
    
@user_bp.route('/by-username/<username>', methods=['GET'])
@authenticate
def get_user_by_username(username):
    """
    Get user by username
    """
    try:
        user = user_db_service._get_user_by_username(username)
        return success_response(user.to_dict(), "User retrieved")
    except Exception as e:
        return error_response("User retrieval failed", 500)
    
@user_bp.route('/profile', methods=['PUT'])
@authenticate
@validate_schema(UserUpdateSchema())
def update_profile():
    """
    Update current user's profile
    """
    try:
        # Get validated data
        data = request.validated_data
        
        # Update user
        user = user_db_service.update_user(user_id=g.user.user_id, **data)
        
        return success_response(user.to_dict(), "Profile updated")
    except Exception as e:
        traceback.print_exc()
        return error_response("Profile update failed", 500)

@user_bp.route('/account', methods=['DELETE'])
@authenticate
def delete_account():
    """
    Delete current user's account
    """
    try:
        user_db_service.delete_user(g.user.user_id)
        return success_response({}, "Account deleted")
    except Exception as e:
        traceback.print_exc()
        return error_response("Account deletion failed", 500)
    
@user_bp.route('/forums', methods=['GET'])
@authenticate
def get_my_forums():
    try:
        forums = user_db_service._get_user_forums_by_user_id(g.user.user_id)
        return success_response(forums, "Forums retrieved")
    except Exception as e:
        traceback.print_exc()
        return error_response("Forum retrieval failed", 500)
    
@user_bp.route('/polls', methods=['GET'])
@authenticate
def get_my_polls():
    try:
        polls = user_db_service._get_user_polls_by_user_id(g.user.user_id)
        return success_response(polls, "Polls retrieved")
    except Exception as e:
        traceback.print_exc()
        return error_response("Poll retrieval failed", 500)
    
@user_bp.route('/groups', methods=['GET'])
@authenticate
def get_my_groups():
    try:
        groups = user_db_service._get_user_groups_by_user_id(g.user.user_id)
        return success_response(groups, "Groups retrieved")
    except Exception as e:
        traceback.print_exc()
        return error_response("Group retrieval failed", 500)
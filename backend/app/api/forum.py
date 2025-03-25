from flask import Blueprint, request, g
from marshmallow import Schema, fields, validate
from app.utils.responses import success_response, error_response, list_response, created_response, updated_response, deleted_response
from app.middleware.auth import authenticate
from app.middleware.validation import validate_schema, is_positive_integer, is_uuid
from app.services.forum_service import ForumService
from app.services.user_service import UserService
from app.models.UserModel import UserRoles
import traceback

"""
API endpoints for forum operations.

Endpoints:
- /forums/ [GET]: Retrieve forums
- /forums/<forum_id> [GET]: Retrieve a specific forum
- /forums/<forum_id>/creator_info [GET]: Retrieve creator information for a specific forum
- /forums/ [POST]: Create a new forum
- /forums/<forum_id> [PUT]: Update an existing forum
- /forums/<forum_id> [DELETE]: Hard delete a forum
"""

# Blueprint and Database Service
forum_bp = Blueprint('forum', __name__)

# Schemas
class ForumCreateSchema(Schema):
    header = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    description = fields.Str()
    category = fields.Str()
    photo_urls = fields.List(fields.Url())

class ForumUpdateSchema(Schema):
    header = fields.Str(validate=validate.Length(min=3, max=100))
    description = fields.Str()
    university = fields.Str()
    category = fields.Str()
    photo_urls = fields.List(fields.Url())

class ForumRequestSchema(Schema):
    page = fields.Int(validate=is_positive_integer)
    per_page = fields.Int(validate=is_positive_integer)
    category = fields.Str()
    university = fields.Str()
    search = fields.Str()


# Routes
@forum_bp.route('/', methods=['GET'])
@authenticate
@validate_schema(ForumRequestSchema())
def get_forums():
    """
    Retrieve forums with optional filtering and pagination
    """
    try:
        # Extract query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        category = request.args.get('category')
        university = request.args.get('university')
        search = request.args.get('search')
        
        # Get forums
        result = ForumService.get_forums(
            page=page,
            per_page=per_page,
            category=category,
            university=university,
            search=search
        )

        print (result)
        
        return list_response(
            result['forums'], 
            result['meta']['total'], 
            result['meta']['page'],
            result['meta']['per_page'],
            "Forumlar başarıyla getirildi"
        )
    
    except Exception as e:
        print (traceback.format_exc(), flush=True)
        return error_response(str(e), 500)

@forum_bp.route('/<forum_id>', methods=['GET'])
@authenticate
def get_forum(forum_id):
    """
    Retrieve a specific forum by ID
    """
    try:
        forum = ForumService.get_forum_by_id(forum_id)
        
        if not forum:
            return error_response("Forum bulunamadı", 404)
        
        return success_response(forum.to_dict(), "Forum başarıyla getirildi")
    
    except Exception as e:
        return error_response(str(e), 500)

@forum_bp.route('/<forum_id>/creator_info', methods=['GET'])
@authenticate
def get_forum_creator_info(forum_id):
    """
    Retrieve creator information for a specific forum
    """
    try:
        # Get creator information
        creator_info = ForumService.get_creator_info(forum_id)

        if not creator_info:
            return error_response("Kullanıcı bilgileri bulunamadı", 404)
        
        return success_response(creator_info, "Kullanıcı bilgileri başarıyla getirildi")
    
    except Exception as e:
        print (traceback.format_exc(), flush=True)
        return error_response(str(e), 500)
    

@forum_bp.route('/', methods=['POST'])
@authenticate
@validate_schema(ForumCreateSchema())
def create_forum():
    """
    Create a new forum
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Get validated data from request
        data = request.validated_data
        
        # Create forum
        forum = ForumService.create_forum(
            creator_id=user_id,
            header=data['header'],
            description=data.get('description', ''),
            category=data.get('category'),
            photo_urls=data.get('photo_urls', [])
        )
        
        return created_response(forum.to_dict(), "Forum başarıyla oluşturuldu")
    
    except ValueError as e:
        # prints the traceback of the error in red using ansi color codes
        print ("\033[91m", traceback.format_exc(), "\033[0m", flush=True)
        return error_response(str(e), 400)
    except Exception as e:
        print ("\033[91m", traceback.format_exc(), "\033[0m", flush=True)
        return error_response("Forum oluşturulamadı", 500)

@forum_bp.route('/<forum_id>', methods=['PUT'])
@authenticate
@validate_schema(ForumUpdateSchema())
def update_forum(forum_id):
    """
    Update an existing forum
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Get validated update data
        update_data = request.validated_data
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        # Update forum
        updated_forum = ForumService.update_forum_by_id(
            forum_id=forum_id,
            user_id=user_id,
            update_data=update_data
        )
        
        return updated_response(updated_forum.to_dict(), "Forum başarıyla güncellendi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Forum güncellenemedi", 500)

@forum_bp.route('/<forum_id>', methods=['DELETE'])
@authenticate
def delete_forum(forum_id):
    """
    Soft delete a forum
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Retrieve the forum first
        forum = ForumService.get_forum_by_id(forum_id)
        
        if not forum:
            return error_response("Forum bulunamadı", 404)
        
        # Check if user is authorized to delete
        if forum.creator_id != user_id or g.user.role != UserRoles.ADMIN:
            return error_response("Bu forumu silme yetkiniz yok", 403)
        
        # Perform soft delete by updating is_active
        ForumService.delete_forum_by_id(forum_id)
        
        return deleted_response("Forum başarıyla silindi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        traceback.print_exc()
        return error_response("Forum silinemedi", 500)
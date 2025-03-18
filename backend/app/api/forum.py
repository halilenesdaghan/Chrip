from flask import Blueprint, request, g
from marshmallow import Schema, fields, validate
from app.services.ForumTableDatabaseService import ForumDatabaseService
from app.utils.responses import success_response, error_response, list_response, created_response, updated_response, deleted_response
from app.middleware.auth import authenticate
from app.middleware.validation import validate_schema, is_positive_integer, is_uuid

# Blueprint and Database Service
forum_bp = Blueprint('forum', __name__)
forum_db_service = ForumDatabaseService()

# Schemas
class ForumCreateSchema(Schema):
    baslik = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    aciklama = fields.Str()
    universite = fields.Str()
    kategori = fields.Str()
    foto_urls = fields.List(fields.Url())

class ForumUpdateSchema(Schema):
    baslik = fields.Str(validate=validate.Length(min=3, max=100))
    aciklama = fields.Str()
    universite = fields.Str()
    kategori = fields.Str()
    foto_urls = fields.List(fields.Url())

# Routes
@forum_bp.route('/', methods=['GET'])
def get_forums():
    """
    Retrieve forums with optional filtering and pagination
    """
    try:
        # Extract query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        kategori = request.args.get('kategori')
        universite = request.args.get('universite')
        search = request.args.get('search')
        
        # Get forums
        result = forum_db_service.get_forums(
            page=page,
            per_page=per_page,
            kategori=kategori,
            universite=universite,
            search=search
        )
        
        return list_response(
            result['forums'], 
            result['meta']['total'], 
            result['meta']['page'],
            result['meta']['per_page'],
            "Forumlar başarıyla getirildi"
        )
    
    except Exception as e:
        return error_response(str(e), 500)

@forum_bp.route('/<forum_id>', methods=['GET'])
@validate_schema({'forum_id': fields.Str(validate=is_uuid)})
def get_forum(forum_id):
    """
    Retrieve a specific forum by ID
    """
    try:
        forum = forum_db_service.get_forum_by_id(forum_id)
        
        if not forum:
            return error_response("Forum bulunamadı", 404)
        
        return success_response(forum.to_dict(), "Forum başarıyla getirildi")
    
    except Exception as e:
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
        forum = forum_db_service.create_forum(
            user_id=user_id,
            baslik=data['baslik'],
            aciklama=data.get('aciklama', ''),
            universite=data.get('universite'),
            kategori=data.get('kategori'),
            foto_urls=data.get('foto_urls')
        )
        
        return created_response(forum.to_dict(), "Forum başarıyla oluşturuldu")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
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
        updated_forum = forum_db_service.update_forum(
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
        forum = forum_db_service.get_forum_by_id(forum_id)
        
        if not forum:
            return error_response("Forum bulunamadı", 404)
        
        # Check if user is authorized to delete
        if forum.acan_kisi_id != user_id:
            return error_response("Bu forumu silme yetkiniz yok", 403)
        
        # Perform soft delete by updating is_active
        update_data = {'is_active': False}
        forum_db_service.update_forum(forum_id, user_id, update_data)
        
        return deleted_response("Forum başarıyla silindi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Forum silinemedi", 500)
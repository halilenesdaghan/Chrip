from flask import Blueprint, request, g
from marshmallow import Schema, fields, validate
from app.services.CommentTableDatabaseService import CommentDatabaseService
from app.utils.responses import (
    success_response, 
    error_response, 
    list_response, 
    created_response, 
    updated_response, 
    deleted_response
)
from app.middleware.auth import authenticate
from app.middleware.validation import (
    validate_schema,
    validate_query_params,
    is_uuid, 
    is_positive_integer
)

# Blueprint and Database Service
comment_bp = Blueprint('comment', __name__)
comment_db_service = CommentDatabaseService()

# Schemas
class CommentCreateSchema(Schema):
    """Comment creation schema"""
    forum_id = fields.Str(required=True, error_messages={'required': 'Forum ID zorunludur'})
    icerik = fields.Str(required=True, error_messages={'required': 'Yorum içeriği zorunludur'})
    foto_urls = fields.List(fields.Url())
    ust_yorum_id = fields.Str()  # Optional parent comment ID

class CommentUpdateSchema(Schema):
    """Comment update schema"""
    icerik = fields.Str()
    foto_urls = fields.List(fields.Url())

class CommentReactionSchema(Schema):
    """Comment reaction schema"""
    reaction_type = fields.Str(
        required=True, 
        validate=validate.OneOf(['begeni', 'begenmeme']), 
        error_messages={'required': 'Reaksiyon türü gereklidir'}
    )

# Routes
@comment_bp.route('/', methods=['POST'])
@authenticate
@validate_schema(CommentCreateSchema())
def create_comment():
    """
    Create a new comment
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Get validated data from request
        data = request.validated_data
        
        # Create comment
        comment = comment_db_service.create_comment(
            user_id=user_id,
            forum_id=data['forum_id'],
            icerik=data['icerik'],
            foto_urls=data.get('foto_urls'),
            ust_yorum_id=data.get('ust_yorum_id')
        )
        
        return created_response(comment.to_dict(), "Yorum başarıyla oluşturuldu")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Yorum oluşturulamadı", 500)

@comment_bp.route('/<comment_id>', methods=['GET'])
@validate_schema({'comment_id': fields.Str(validate=is_uuid)})
def get_comment(comment_id):
    """
    Retrieve a specific comment by ID
    """
    try:
        comment = comment_db_service.get_comment_by_id(comment_id)
        
        if not comment:
            return error_response("Yorum bulunamadı", 404)
        
        return success_response(comment.to_dict(), "Yorum başarıyla getirildi")
    
    except Exception as e:
        return error_response(str(e), 500)

@comment_bp.route('/<comment_id>', methods=['PUT'])
@authenticate
@validate_schema(CommentUpdateSchema())
def update_comment(comment_id):
    """
    Update an existing comment
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Get validated update data
        update_data = request.validated_data
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        # Update comment
        updated_comment = comment_db_service.update_comment(
            comment_id=comment_id,
            user_id=user_id,
            update_data=update_data
        )
        
        return updated_response(updated_comment.to_dict(), "Yorum başarıyla güncellendi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Yorum güncellenemedi", 500)

@comment_bp.route('/<comment_id>', methods=['DELETE'])
@authenticate
def delete_comment(comment_id):
    """
    Soft delete a comment
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Delete comment
        comment_db_service.delete_comment(
            comment_id=comment_id,
            user_id=user_id
        )
        
        return deleted_response("Yorum başarıyla silindi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Yorum silinemedi", 500)

@comment_bp.route('/<comment_id>/replies', methods=['GET'])
@validate_schema({'comment_id': fields.Str(validate=is_uuid)})
@validate_query_params({
    'page': is_positive_integer,
    'per_page': is_positive_integer
})
def get_comment_replies(comment_id):
    """
    Retrieve replies for a specific comment
    """
    try:
        # Extract query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Get comment replies
        result = comment_db_service.get_comment_replies(
            comment_id=comment_id,
            page=page,
            per_page=per_page
        )
        
        return list_response(
            result['replies'], 
            result['meta']['total'], 
            result['meta']['page'],
            result['meta']['per_page'],
            "Yorum yanıtları başarıyla getirildi"
        )
    
    except Exception as e:
        return error_response(str(e), 500)

@comment_bp.route('/<comment_id>/react', methods=['POST'])
@authenticate
@validate_schema(CommentReactionSchema())
def react_to_comment(comment_id):
    """
    Add a reaction to a comment
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Get validated reaction type
        data = request.validated_data
        
        # Add reaction
        result = comment_db_service.react_to_comment(
            comment_id=comment_id,
            user_id=user_id,
            reaction_type=data['reaction_type']
        )
        
        return success_response(result, "Reaksiyon başarıyla eklendi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Reaksiyon eklenemedi", 500)
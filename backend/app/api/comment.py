from flask import Blueprint, request, g
from marshmallow import Schema, fields, validate
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
from app.services.comment_service import CommentService
import traceback
"""
API endpoints for comment operations.

Endpoints:
- /comments/ [POST]: Create a new comment
- /comments/commented_on_id=<commented_on_id> [GET]: Retrieve comments for a specific post
- /comments/<comment_id> [GET]: Get a specific comment
- /comments/<comment_id> [PUT]: Update an existing comment
- /comments/<comment_id> [DELETE]: Delete a comment
- /comments/<comment_id>/replies [GET]: Get replies for a specific comment
- /comments/<comment_id>/react [POST]: Add a reaction to a comment
- /comments/<comment_id>/creator_info [GET]: Retrieve creator information for a specific comment
- /comments/<comment_id>/reply [POST]: Add a reply to a comment
"""

# Blueprint and Database Service
comment_bp = Blueprint('comment', __name__)

# Schemas
class CommentCreateSchema(Schema):
    """Comment creation schema"""
    commented_on_id = fields.Str(required=True, error_messages={'required': 'Commented On ID zorunludur'})
    content = fields.Str(required=True, error_messages={'required': 'Yorum içeriği zorunludur'})
    photo_urls = fields.List(fields.Url())

class CommentUpdateSchema(Schema):
    """Comment update schema"""
    content = fields.Str()
    photo_urls = fields.List(fields.Url())

class CommentReactionSchema(Schema):
    """Comment reaction schema"""
    reaction_type = fields.Str(
        required=True, 
        validate=validate.OneOf(['like', 'dislike']), 
        error_messages={'required': 'Reaksiyon türü gereklidir'}
    )

class CommentedOnIdSchema(Schema):
    """Commented on ID schema"""
    commented_on_id = fields.Str(required=True, error_messages={'required': 'Commented On ID zorunludur'})

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

        print (data)
        
        # Create comment
        comment = CommentService.create_comment(
            commented_on_id=data['commented_on_id'],
            creator_id=user_id,
            content=data['content'],
            photo_urls=data.get('photo_urls', [])
        )
        
        print (comment.to_dict())
        return created_response(comment.to_dict(), "Yorum başarıyla oluşturuldu")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Yorum oluşturulamadı", 500)

@comment_bp.route('/commented_on_id=<commented_on_id>', methods=['GET'])
@authenticate
def get_comments(commented_on_id):
    """
    Retrieve comments for a specific post
    """
    try:
        # Get comments
        comments = CommentService.get_comments_by_commented_on_id(commented_on_id)
        
        return success_response(data=[comment.to_dict() for comment in comments], 
            message="Yorumlar başarıyla getirildi"
        )
    
    except Exception as e:
        print (traceback.format_exc(), flush=True)
        return error_response(str(e), 500)
    
@comment_bp.route('/<comment_id>', methods=['GET'])
@authenticate
def get_comment(comment_id):
    """
    Retrieve a specific comment by ID
    """
    try:
        comment = CommentService.get_comment(comment_id)
        
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
        updated_comment = CommentService.update_comment(
            comment_id=comment_id,
            creator_id=user_id,
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
        CommentService.delete_comment(
            comment_id=comment_id,
            user_id=user_id
        )
        
        return deleted_response("Yorum başarıyla silindi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Yorum silinemedi", 500)

@comment_bp.route('/<comment_id>/replies', methods=['GET'])
@validate_query_params({
    'page': is_positive_integer,
    'per_page': is_positive_integer
})
def get_comment_replies(comment_id):
    """
    Retrieve replies for a specific comment
    """
    try:
        # Get comment replies
        result = CommentService.get_comment_replies(
            comment_id=comment_id
        )
        
        return success_response(
            result, 
            "Yorum yanıtları başarıyla getirildi",
            200
        )
    
    except Exception as e:
        print (traceback.format_exc(), flush=True)
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
        result = CommentService.react_to_comment(
            comment_id=comment_id,
            user_id=user_id,
            reaction=data['reaction_type']
        )
        
        return success_response(result, "Reaksiyon başarıyla eklendi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        print (traceback.format_exc(), flush=True)
        return error_response("Reaksiyon eklenemedi", 500)
    
@comment_bp.route('/<comment_id>/creator_info', methods=['GET'])
@authenticate
def get_comment_creator_info(comment_id):
    """
    Retrieve creator information for a specific comment
    """
    try:
        # Get creator information
        creator_info = CommentService.get_creator_info(comment_id)

        if not creator_info:
            return error_response("Kullanıcı bilgileri bulunamadı", 404)
        
        return success_response(creator_info, "Kullanıcı bilgileri başarıyla getirildi")
    
    except Exception as e:
        print (traceback.format_exc(), flush=True)
        return error_response(str(e), 500)
    
@comment_bp.route('/<comment_id>/reply', methods=['POST'])
@authenticate
def reply_comment(comment_id):
    """
    Add a reply to a comment
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Get reply data
        data = request.get_json()
        
        # Add reply
        result = CommentService.add_reply(
            comment_id=comment_id,
            creator_id=user_id,
            content=data.get('content'),
            photo_urls=data.get('photo_urls', [])
        )
        
        return created_response(result.to_dict(), "Yanıt başarıyla eklendi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        print (traceback.format_exc(), flush=True)
        return error_response("Yanıt eklenemedi", 500)
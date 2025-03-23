from flask import Blueprint, request, g
from marshmallow import Schema, fields, validate
from app.services.PollTableDatabaseService import PollDatabaseService
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
    is_uuid, 
    is_positive_integer, 
    is_boolean
)

# Blueprint and Database Service
poll_bp = Blueprint('poll', __name__)
poll_db_service = PollDatabaseService()

# Schemas
class PollCreateSchema(Schema):
    """Poll creation schema"""
    header = fields.Str(
        required=True, 
        validate=validate.Length(min=3, max=100),
        error_messages={'required': 'Anket başlığı zorunludur'}
    )
    description = fields.Str()
    secenekler = fields.List(
        fields.Str(), 
        required=True, 
        validate=validate.Length(min=2),
        error_messages={'required': 'En az iki seçenek gereklidir'}
    )
    bitis_tarihi = fields.DateTime(format='iso8601')
    university = fields.Str()
    category = fields.Str()

class PollUpdateSchema(Schema):
    """Poll update schema"""
    header = fields.Str(validate=validate.Length(min=3, max=100))
    description = fields.Str()
    secenekler = fields.List(fields.Str(), validate=validate.Length(min=2))
    bitis_tarihi = fields.DateTime(format='iso8601')
    category = fields.Str()

class PollVoteSchema(Schema):
    """Poll voting schema"""
    option_id = fields.Str(required=True, error_messages={'required': 'Seçenek ID zorunludur'})

# Routes
@poll_bp.route('/', methods=['GET'])
def get_polls():
    """
    Retrieve polls with optional filtering and pagination
    """
    try:
        # Extract query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        category = request.args.get('category')
        university = request.args.get('university')
        
        # Aktiflik filtresi (boolean kontrolü)
        aktif = None
        if 'aktif' in request.args:
            aktif_param = request.args.get('aktif')
            if aktif_param.lower() in ('true', '1', 'yes'):
                aktif = True
            elif aktif_param.lower() in ('false', '0', 'no'):
                aktif = False
        
        # Get polls
        result = poll_db_service.get_polls(
            page=page,
            per_page=per_page,
            category=category,
            university=university,
            aktif=aktif
        )
        
        return list_response(
            result['polls'], 
            result['meta']['total'], 
            result['meta']['page'],
            result['meta']['per_page'],
            "Anketler başarıyla getirildi"
        )
    
    except Exception as e:
        return error_response(str(e), 500)

@poll_bp.route('/<poll_id>', methods=['GET'])
@validate_schema({'poll_id': fields.Str(validate=is_uuid)})
def get_poll(poll_id):
    """
    Retrieve a specific poll by ID
    """
    try:
        poll = poll_db_service.get_poll_by_id(poll_id)
        
        if not poll:
            return error_response("Anket bulunamadı", 404)
        
        return success_response(poll.to_dict(), "Anket başarıyla getirildi")
    
    except Exception as e:
        return error_response(str(e), 500)

@poll_bp.route('/', methods=['POST'])
@authenticate
@validate_schema(PollCreateSchema())
def create_poll():
    """
    Create a new poll
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Get validated data from request
        data = request.validated_data
        
        # Create poll
        poll = poll_db_service.create_poll(
            user_id=user_id,
            header=data['header'],
            secenekler=data['secenekler'],
            description=data.get('description'),
            bitis_tarihi=data.get('bitis_tarihi', '').isoformat() if data.get('bitis_tarihi') else None,
            university=data.get('university'),
            category=data.get('category')
        )
        
        return created_response(poll.to_dict(), "Anket başarıyla oluşturuldu")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Anket oluşturulamadı", 500)

@poll_bp.route('/<poll_id>', methods=['PUT'])
@authenticate
@validate_schema(PollUpdateSchema())
def update_poll(poll_id):
    """
    Update an existing poll
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Get validated update data
        update_data = request.validated_data
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        # Convert datetime to ISO format if present
        if 'bitis_tarihi' in update_data:
            update_data['bitis_tarihi'] = update_data['bitis_tarihi'].isoformat()
        
        # Update poll
        updated_poll = poll_db_service.update_poll(
            poll_id=poll_id,
            user_id=user_id,
            update_data=update_data
        )
        
        return updated_response(updated_poll.to_dict(), "Anket başarıyla güncellendi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Anket güncellenemedi", 500)

@poll_bp.route('/<poll_id>', methods=['DELETE'])
@authenticate
def delete_poll(poll_id):
    """
    Soft delete a poll
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Retrieve the poll first
        poll = poll_db_service.get_poll_by_id(poll_id)
        
        if not poll:
            return error_response("Anket bulunamadı", 404)
        
        # Check if user is authorized to delete
        if poll.creator_id != user_id:
            return error_response("Bu anketi silme yetkiniz yok", 403)
        
        # Perform soft delete
        poll_db_service.delete_poll(poll_id, user_id)
        
        return deleted_response("Anket başarıyla silindi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Anket silinemedi", 500)

@poll_bp.route('/<poll_id>/vote', methods=['POST'])
@authenticate
@validate_schema(PollVoteSchema())
def vote_poll(poll_id):
    """
    Cast a vote in a poll
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Get validated option ID from request
        data = request.validated_data
        
        # Vote in poll
        result = poll_db_service.vote_poll(
            poll_id=poll_id, 
            user_id=user_id, 
            option_id=data['option_id']
        )
        
        return success_response(result, "Oy başarıyla kaydedildi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Oy verilemedi", 500)

@poll_bp.route('/<poll_id>/results', methods=['GET'])
def get_poll_results(poll_id):
    """
    Retrieve poll results
    """
    try:
        # Get poll results
        results = poll_db_service.get_poll_results(poll_id)
        
        return success_response(results, "Anket sonuçları başarıyla getirildi")
    
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response("Anket sonuçları getirilemedi", 500)
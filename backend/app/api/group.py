from flask import Blueprint, request, g
from marshmallow import Schema, fields, validate
from app.services.GroupTableDatabaseService import GroupDatabaseService
from app.utils.responses import success_response, error_response, list_response, created_response, updated_response, deleted_response
from app.middleware.auth import authenticate
from app.middleware.validation import validate_schema, is_uuid, is_positive_integer

# Blueprint and Database Service
group_bp = Blueprint('group', __name__)
group_db_service = GroupDatabaseService()

# Schemas
class GroupCreateSchema(Schema):
    """Group creation schema"""
    grup_adi = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    aciklama = fields.Str()
    logo_url = fields.Url()
    kapak_resmi_url = fields.Url()
    gizlilik = fields.Str(validate=validate.OneOf(['acik', 'kapali', 'gizli']))
    kategoriler = fields.List(fields.Str())

class GroupUpdateSchema(Schema):
    """Group update schema"""
    grup_adi = fields.Str(validate=validate.Length(min=3, max=50))
    aciklama = fields.Str()
    logo_url = fields.Url()
    kapak_resmi_url = fields.Url()
    gizlilik = fields.Str(validate=validate.OneOf(['acik', 'kapali', 'gizli']))
    kategoriler = fields.List(fields.Str())

# Routes
@group_bp.route('/', methods=['GET'])
def get_groups():
    """
    Retrieve groups with optional filtering and pagination
    """
    try:
        # Extract query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search')
        
        # Category filter might be sent as multiple params
        kategoriler = request.args.getlist('kategoriler')
        
        # Get groups
        result = group_db_service.get_groups(
            page=page,
            per_page=per_page,
            search=search,
            kategoriler=kategoriler or None
        )
        
        return list_response(
            result['groups'], 
            result['meta']['total'], 
            result['meta']['page'],
            result['meta']['per_page'],
            "Gruplar başarıyla getirildi"
        )
    
    except Exception as e:
        return error_response(str(e), 500)

@group_bp.route('/<group_id>', methods=['GET'])
@validate_schema({'group_id': fields.Str(validate=is_uuid)})
def get_group(group_id):
    """
    Retrieve a specific group by ID
    """
    try:
        group = group_db_service.get_group_by_id(group_id)
        
        if not group:
            return error_response("Grup bulunamadı", 404)
        
        return success_response(group.to_dict(), "Grup başarıyla getirildi")
    
    except Exception as e:
        return error_response(str(e), 500)

@group_bp.route('/', methods=['POST'])
@authenticate
@validate_schema(GroupCreateSchema())
def create_group():
    """
    Create a new group
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Get validated data from request
        data = request.validated_data
        
        # Create group
        group = group_db_service.create_group(
            user_id=user_id,
            grup_adi=data['grup_adi'],
            aciklama=data.get('aciklama'),
            logo_url=data.get('logo_url'),
            kapak_resmi_url=data.get('kapak_resmi_url'),
            gizlilik=data.get('gizlilik', 'acik'),
            kategoriler=data.get('kategoriler')
        )
        
        return created_response(group.to_dict(), "Grup başarıyla oluşturuldu")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Grup oluşturulamadı", 500)

@group_bp.route('/<group_id>', methods=['PUT'])
@authenticate
@validate_schema(GroupUpdateSchema())
def update_group(group_id):
    """
    Update an existing group
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Get validated update data
        update_data = request.validated_data
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        # Update group
        updated_group = group_db_service.update_group(
            group_id=group_id,
            user_id=user_id,
            update_data=update_data
        )
        
        return updated_response(updated_group.to_dict(), "Grup başarıyla güncellendi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Grup güncellenemedi", 500)

@group_bp.route('/<group_id>', methods=['DELETE'])
@authenticate
def delete_group(group_id):
    """
    Soft delete a group
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Retrieve the group first
        group = group_db_service.get_group_by_id(group_id)
        
        if not group:
            return error_response("Grup bulunamadı", 404)
        
        # Check if user is authorized to delete
        if group.olusturan_id != user_id:
            return error_response("Bu grubu silme yetkiniz yok", 403)
        
        # Perform soft delete by updating is_active
        update_data = {'is_active': False}
        group_db_service.update_group(group_id, user_id, update_data)
        
        return deleted_response("Grup başarıyla silindi")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Grup silinemedi", 500)

@group_bp.route('/<group_id>/join', methods=['POST'])
@authenticate
def join_group(group_id):
    """
    Join a group
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Join group
        result = group_db_service.join_group(
            group_id=group_id,
            user_id=user_id
        )
        
        return success_response(result, result['message'])
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Gruba katılma işlemi başarısız", 500)

@group_bp.route('/<group_id>/leave', methods=['POST'])
@authenticate
def leave_group(group_id):
    """
    Leave a group
    """
    try:
        # Get current user ID from authentication middleware
        user_id = g.user.user_id
        
        # Leave group
        group_db_service.leave_group(
            group_id=group_id,
            user_id=user_id
        )
        
        return success_response(None, "Gruptan başarıyla ayrıldınız")
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Gruptan ayrılma işlemi başarısız", 500)

@group_bp.route('/<group_id>/members', methods=['GET'])
def get_group_members(group_id):
    """
    Retrieve group members
    """
    try:
        # Extract query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status = request.args.get('status')
        role = request.args.get('role')
        
        # Retrieve the group first
        group = group_db_service.get_group_by_id(group_id)
        
        if not group:
            return error_response("Grup bulunamadı", 404)
        
        # Filter members based on query parameters
        members = group.uyeler
        
        # Filter by status if specified
        if status:
            members = [m for m in members if m.durum == status]
        
        # Filter by role if specified
        if role:
            members = [m for m in members if m.rol == role]
        
        # Paginate results
        total_count = len(members)
        start_index = (page - 1) * per_page
        end_index = start_index + per_page
        paginated_members = members[start_index:end_index]
        
        return list_response(
            [member.to_dict() for member in paginated_members],
            total_count,
            page,
            per_page,
            "Grup üyeleri başarıyla getirildi"
        )
    
    except Exception as e:
        return error_response(str(e), 500)

@group_bp.route('/<group_id>/members/<user_id>/approve', methods=['POST'])
@authenticate
def approve_membership(group_id, user_id):
    """
    Approve or reject a group membership request
    """
    try:
        # Get current user ID from authentication middleware
        admin_id = g.user.user_id
        
        # Get approval status from request
        approve = request.json.get('approve', True)
        
        # Process membership request
        result = group_db_service.approve_membership(
            group_id=group_id,
            admin_id=admin_id,
            user_id=user_id,
            approve=approve
        )
        
        return success_response(result, result['message'])
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Üyelik işlemi gerçekleştirilemedi", 500)

@group_bp.route('/<group_id>/members/<user_id>/role', methods=['PUT'])
@authenticate
def update_member_role(group_id, user_id):
    """
    Update a member's role in the group
    """
    try:
        # Get current user ID from authentication middleware
        admin_id = g.user.user_id
        
        # Get new role from request
        new_role = request.json.get('role')
        
        if not new_role or new_role not in ['uye', 'moderator', 'yonetici']:
            return error_response("Geçersiz rol", 400)
        
        # Retrieve the group first
        group = group_db_service.get_group_by_id(group_id)
        
        if not group:
            return error_response("Grup bulunamadı", 404)
        
        # Update member role
        # Note: This would require a custom method in the database service
        # For now, we'll use the update_group method as a workaround
        update_data = {
            'uyeler': [
                {
                    'kullanici_id': member.kullanici_id,
                    'rol': new_role if member.kullanici_id == user_id else member.rol,
                    'katilma_tarihi': member.katilma_tarihi,
                    'durum': member.durum
                } 
                for member in group.uyeler
            ]
        }
        
        updated_group = group_db_service.update_group(
            group_id=group_id,
            user_id=admin_id,
            update_data=update_data
        )
        
        return updated_response(
            {'role': new_role, 'user_id': user_id}, 
            "Üye rolü başarıyla güncellendi"
        )
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response("Üye rolü güncellenemedi", 500)
import os
import uuid
import boto3
from typing import List, Optional, Dict
from datetime import datetime
from botocore.exceptions import ClientError

from app.models.GroupModel import GroupModel, GroupMember

DEFAULT_REGION = os.getenv('AWS_DEFAULT_REGION')
DEFAULT_GROUPS_TABLE_NAME = os.getenv('GROUPS_TABLE_NAME')

class GroupDatabaseService:
    def __init__(
        self, 
        region_name: str = DEFAULT_REGION, 
        table_name: str = DEFAULT_GROUPS_TABLE_NAME
    ):
        """
        Initialize DynamoDB Group Service
        
        Args:
            region_name (str): AWS region
            table_name (str): DynamoDB table name
        """
        # AWS Credentials
        self.access_key = os.getenv('AWS_ACCESS_KEY_ID', '').strip()
        self.secret_key = os.getenv('AWS_SECRET_ACCESS_KEY', '').strip()
        
        if not self.access_key or not self.secret_key:
            raise ValueError("AWS credentials must be provided")
        
        # Setup AWS Resources
        self.session = boto3.Session(
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=region_name
        )
        self.dynamodb = self.session.resource('dynamodb')
        self.table = self.dynamodb.Table(table_name)

    def create_group(
        self, 
        user_id: str, 
        grup_adi: str, 
        description: Optional[str] = None,
        logo_url: Optional[str] = None,
        kapak_resmi_url: Optional[str] = None,
        gizlilik: str = 'acik',
        kategoriler: Optional[List[str]] = None
    ) -> GroupModel:
        """
        Create a new group in the database
        
        Args:
            user_id (str): ID of the user creating the group
            grup_adi (str): Group name
            description (str, optional): Group description
            logo_url (str, optional): Group logo URL
            kapak_resmi_url (str, optional): Group cover image URL
            gizlilik (str, optional): Group privacy setting
            kategoriler (List[str], optional): Group categories
        
        Returns:
            GroupModel: Created group object
        
        Raises:
            ValueError: If group creation fails
        """
        # Generate unique group ID
        group_id = f"grp_{str(uuid.uuid4())}"
        
        # Prepare group data
        group_data = {
            'group_id': group_id,
            'grup_adi': grup_adi,
            'description': description or '',
            'olusturan_id': user_id,
            'olusturulma_tarihi': datetime.now().isoformat(),
            'logo_url': logo_url,
            'kapak_resmi_url': kapak_resmi_url,
            'gizlilik': gizlilik,
            'kategoriler': kategoriler or [],
            'is_active': True,
            'uyeler': [{
                'kullanici_id': user_id,
                'rol': 'yonetici',
                'katilma_tarihi': datetime.now().isoformat(),
                'durum': 'aktif'
            }],
            'uye_sayisi': 1
        }
        
        # Save to DynamoDB
        try:
            self.table.put_item(Item=group_data)
        except ClientError as e:
            raise ValueError(f"Error creating group: {e}")
        
        return GroupModel(**group_data)

    def get_group_by_id(self, group_id: str) -> Optional[GroupModel]:
        """
        Get group by its ID
        
        Args:
            group_id (str): Group's unique identifier
        
        Returns:
            Optional[GroupModel]: Group object if found, else None
        """
        try:
            response = self.table.get_item(
                Key={'group_id': group_id}
            )
            
            group_item = response.get('Item')
            return GroupModel(**group_item) if group_item else None
        
        except ClientError:
            return None

    def get_groups(
        self, 
        page: int = 1, 
        per_page: int = 10,
        search: Optional[str] = None,
        kategoriler: Optional[List[str]] = None
    ) -> Dict[str, any]:
        """
        Retrieve groups with optional filtering and pagination
        
        Args:
            page (int): Page number
            per_page (int): Groups per page
            search (str, optional): Search term
            kategoriler (List[str], optional): Category filters
        
        Returns:
            Dict containing groups and metadata
        """
        try:
            # Base scan parameters
            scan_params = {
                'FilterExpression': 'is_active = :active',
                'ExpressionAttributeValues': {':active': True}
            }
            
            # Add search filter if provided
            if search:
                scan_params['FilterExpression'] += ' AND contains(grup_adi, :search)'
                scan_params['ExpressionAttributeValues'][':search'] = search
            
            # Add category filter if provided
            if kategoriler:
                # Create an OR condition for multiple categories
                category_conditions = []
                for i, category in enumerate(kategoriler):
                    key = f':category{i}'
                    scan_params['ExpressionAttributeValues'][key] = category
                    category_conditions.append(f'contains(kategoriler, {key})')
                
                scan_params['FilterExpression'] += ' AND (' + ' OR '.join(category_conditions) + ')'
            
            # Perform scan
            response = self.table.scan(**scan_params)
            
            # Process and paginate results
            items = response.get('Items', [])
            total_count = len(items)
            
            # Apply pagination
            start_index = (page - 1) * per_page
            end_index = start_index + per_page
            paginated_items = items[start_index:end_index]
            
            # Convert to GroupModel objects
            groups = [GroupModel(**item) for item in paginated_items]
            
            return {
                'groups': [group.to_dict() for group in groups],
                'meta': {
                    'total': total_count,
                    'page': page,
                    'per_page': per_page,
                    'total_pages': (total_count + per_page - 1) // per_page
                }
            }
        
        except ClientError:
            return {
                'groups': [],
                'meta': {
                    'total': 0,
                    'page': page,
                    'per_page': per_page,
                    'total_pages': 0
                }
            }

    def update_group(
        self, 
        group_id: str, 
        user_id: str, 
        update_data: Dict[str, any]
    ) -> Optional[GroupModel]:
        """
        Update an existing group
        
        Args:
            group_id (str): Group's unique identifier
            user_id (str): User attempting to update the group
            update_data (Dict): Data to update
        
        Returns:
            Optional[GroupModel]: Updated group object
        
        Raises:
            ValueError: If update fails or user is not authorized
        """
        try:
            # Retrieve existing group
            group = self.get_group_by_id(group_id)
            
            if not group:
                raise ValueError("Group not found")
            
            # Check authorization
            # Group creator or group admins can update
            is_authorized = (
                group.olusturan_id == user_id or 
                any(uye.kullanici_id == user_id and uye.rol == 'yonetici' and uye.durum == 'aktif' 
                    for uye in group.uyeler)
            )
            
            if not is_authorized:
                raise ValueError("Not authorized to update this group")
            
            # Prepare update expression and values
            update_expr = []
            expr_attr_values = {}
            
            # Updatable fields
            updatable_fields = [
                'grup_adi', 'description', 'logo_url', 
                'kapak_resmi_url', 'gizlilik', 'kategoriler'
            ]
            for field in updatable_fields:
                if field in update_data and update_data[field] is not None:
                    update_expr.append(f"{field} = :{field}")
                    expr_attr_values[f":{field}"] = update_data[field]
            
            if not update_expr:
                return group
            
            # Construct full update expression
            full_update_expr = "SET " + ", ".join(update_expr)
            
            # Perform update
            self.table.update_item(
                Key={'group_id': group_id},
                UpdateExpression=full_update_expr,
                ExpressionAttributeValues=expr_attr_values
            )
            
            # Retrieve and return updated group
            updated_group = self.get_group_by_id(group_id)
            return updated_group
        
        except ClientError as e:
            raise ValueError(f"Error updating group: {e}")

    def join_group(
        self, 
        group_id: str, 
        user_id: str
    ) -> Dict[str, any]:
        """
        Add a user to a group
        
        Args:
            group_id (str): Group's unique identifier
            user_id (str): User attempting to join the group
        
        Returns:
            Dict: Membership status and details
        
        Raises:
            ValueError: If joining fails
        """
        try:
            # Retrieve existing group
            group = self.get_group_by_id(group_id)
            
            if not group:
                raise ValueError("Group not found")
            
            # Check if user is already a member
            for uye in group.uyeler:
                if uye.kullanici_id == user_id:
                    if uye.durum == 'aktif':
                        raise ValueError("Zaten bu grubun üyesisiniz")
                    elif uye.durum == 'beklemede':
                        raise ValueError("Üyelik başvurunuz onay bekliyor")
                    elif uye.durum == 'engellendi':
                        raise ValueError("Bu gruba katılmanız engellendi")
            
            # Determine membership status based on group privacy
            durum = 'aktif' if group.gizlilik == 'acik' else 'beklemede'
            
            # Prepare member update
            update_params = {
                'Key': {'group_id': group_id},
                'UpdateExpression': 'SET uyeler = list_append(uyeler, :new_member)',
                'ExpressionAttributeValues': {
                    ':new_member': [{
                        'kullanici_id': user_id,
                        'rol': 'uye',
                        'katilma_tarihi': datetime.now().isoformat(),
                        'durum': durum
                    }]
                }
            }
            
            # If group is open, increment member count
            if durum == 'aktif':
                update_params['UpdateExpression'] += ', uye_sayisi = uye_sayisi + :increment'
                update_params['ExpressionAttributeValues'][':increment'] = 1
            
            # Perform update
            self.table.update_item(**update_params)
            
            return {
                'status': 'success',
                'message': 'Gruba başarıyla katıldınız' if durum == 'aktif' else 'Üyelik başvurunuz onay bekliyor',
                'membership_status': durum
            }
        
        except ClientError as e:
            raise ValueError(f"Error joining group: {e}")

    def leave_group(
        self, 
        group_id: str, 
        user_id: str
    ) -> bool:
        """
        Remove a user from a group
        
        Args:
            group_id (str): Group's unique identifier
            user_id (str): User attempting to leave the group
        
        Returns:
            bool: Whether leaving was successful
        
        Raises:
            ValueError: If leaving fails
        """
        try:
            # Retrieve existing group
            group = self.get_group_by_id(group_id)
            
            if not group:
                raise ValueError("Group not found")
            
            # Prevent group creator from leaving
            if group.olusturan_id == user_id:
                raise ValueError("Grup kurucusu gruptan ayrılamaz")
            
            # Find the member
            member_index = None
            for i, uye in enumerate(group.uyeler):
                if uye.kullanici_id == user_id:
                    member_index = i
                    break
            
            if member_index is None:
                raise ValueError("Bu grubun üyesi değilsiniz")
            
            # Prepare update to remove member
            update_params = {
                'Key': {'group_id': group_id},
                'UpdateExpression': 'REMOVE uyeler[{}]'.format(member_index)
            }
            
            # If member was active, decrement member count
            if group.uyeler[member_index].durum == 'aktif':
                update_params['UpdateExpression'] += ' SET uye_sayisi = uye_sayisi - :decrement'
                update_params['ExpressionAttributeValues'] = {
                    ':decrement': 1
                }
            
            # Perform update
            self.table.update_item(**update_params)
            
            return True
        
        except ClientError as e:
            raise ValueError(f"Error leaving group: {e}")

    def approve_membership(
        self, 
        group_id: str, 
        admin_id: str, 
        user_id: str, 
        approve: bool = True
    ) -> Dict[str, any]:
        """
        Approve or reject a group membership request
        
        Args:
            group_id (str): Group's unique identifier
            admin_id (str): Admin attempting to approve/reject
            user_id (str): User whose membership is being processed
            approve (bool): Whether to approve or reject
        
        Returns:
            Dict: Membership status details
        
        Raises:
            ValueError: If membership processing fails
        """
        try:
            # Retrieve existing group
            group = self.get_group_by_id(group_id)
            
            if not group:
                raise ValueError("Group not found")
            
            # Check admin authorization
            is_authorized = (
                group.olusturan_id == admin_id or 
                any(uye.kullanici_id == admin_id and uye.rol in ['yonetici', 'moderator'] and uye.durum == 'aktif' 
                    for uye in group.uyeler)
            )
            
            if not is_authorized:
                raise ValueError("Üyelik başvurularını yönetme yetkiniz yok")
            
            # Find the member with pending status
            member_index = None
            for i, uye in enumerate(group.uyeler):
                if uye.kullanici_id == user_id and uye.durum == 'beklemede':
                    member_index = i
                    break
            
            if member_index is None:
                raise ValueError("Bu kullanıcının onay bekleyen bir başvurusu yok")
            
            # Prepare update to process membership
            if approve:
                # Approve membership
                update_params = {
                    'Key': {'group_id': group_id},
                    'UpdateExpression': 'SET uyeler[{}].durum = :aktif, uye_sayisi = uye_sayisi + :increment'.format(member_index),
                    'ExpressionAttributeValues': {
                        ':aktif': 'aktif',
                        ':increment': 1
                    }
                }
                success_message = "Üyelik başvurusu onaylandı"
            else:
                # Reject membership (remove member)
                update_params = {
                    'Key': {'group_id': group_id},
                    'UpdateExpression': 'REMOVE uyeler[{}]'.format(member_index)
                }
                success_message = "Üyelik başvurusu reddedildi"
            
            # Perform update
            self.table.update_item(**update_params)
            
            return {
                'status': 'success',
                'message': success_message
            }
        
        except ClientError as e:
            raise ValueError(f"Error processing membership: {e}")
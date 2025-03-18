import os
import uuid
import boto3
from typing import List, Optional, Dict
from datetime import datetime
from botocore.exceptions import ClientError

from app.models.ForumModel import ForumModel
from app.models.UserModel import UserModel

DEFAULT_REGION = os.getenv('AWS_DEFAULT_REGION')
DEFAULT_FORUMS_TABLE_NAME = os.getenv('FORUMS_TABLE_NAME', 'Forums')

class ForumDatabaseService:
    def __init__(
        self, 
        region_name: str = DEFAULT_REGION, 
        table_name: str = DEFAULT_FORUMS_TABLE_NAME
    ):
        """
        Initialize DynamoDB Forum Service
        
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

    def create_forum(
        self, 
        user_id: str, 
        baslik: str, 
        aciklama: str = "", 
        universite: Optional[str] = None,
        kategori: Optional[str] = None,
        foto_urls: Optional[List[str]] = None
    ) -> ForumModel:
        """
        Create a new forum in the database
        
        Args:
            user_id (str): ID of the user creating the forum
            baslik (str): Forum title
            aciklama (str, optional): Forum description
            universite (str, optional): Associated university
            kategori (str, optional): Forum category
            foto_urls (List[str], optional): Forum photo URLs
        
        Returns:
            ForumModel: Created forum object
        
        Raises:
            ValueError: If forum creation fails
        """
        # Generate unique forum ID
        forum_id = f"frm_{str(uuid.uuid4())}"
        
        # Prepare forum data
        forum_data = {
            'forum_id': forum_id,
            'baslik': baslik,
            'aciklama': aciklama,
            'acan_kisi_id': user_id,
            'universite': universite,
            'kategori': kategori,
            'foto_urls': foto_urls or [],
            'yorum_ids': [],
            'begeni_sayisi': 0,
            'begenmeme_sayisi': 0,
            'is_active': True,
            'acilis_tarihi': datetime.now().isoformat()
        }
        
        # Save to DynamoDB
        try:
            self.table.put_item(Item=forum_data)
        except ClientError as e:
            raise ValueError(f"Error creating forum: {e}")
        
        return ForumModel(**forum_data)

    def get_forum_by_id(self, forum_id: str) -> Optional[ForumModel]:
        """
        Get forum by its ID
        
        Args:
            forum_id (str): Forum's unique identifier
        
        Returns:
            Optional[ForumModel]: Forum object if found, else None
        """
        try:
            response = self.table.get_item(
                Key={'forum_id': forum_id}
            )
            
            forum_item = response.get('Item')
            return ForumModel(**forum_item) if forum_item else None
        
        except ClientError:
            return None

    def get_forums(
        self, 
        page: int = 1, 
        per_page: int = 10,
        kategori: Optional[str] = None,
        universite: Optional[str] = None,
        search: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Retrieve forums with optional filtering and pagination
        
        Args:
            page (int): Page number
            per_page (int): Forums per page
            kategori (str, optional): Filter by category
            universite (str, optional): Filter by university
            search (str, optional): Search term
        
        Returns:
            Dict containing forums and metadata
        """
        try:
            # Base scan parameters
            scan_params = {
                'FilterExpression': 'is_active = :active',
                'ExpressionAttributeValues': {':active': True}
            }
            
            # Add category filter if provided
            if kategori:
                scan_params['FilterExpression'] += ' AND kategori = :kategori'
                scan_params['ExpressionAttributeValues'][':kategori'] = kategori
            
            # Add university filter if provided
            if universite:
                scan_params['FilterExpression'] += ' AND universite = :universite'
                scan_params['ExpressionAttributeValues'][':universite'] = universite
            
            # Add search filter if provided
            if search:
                scan_params['FilterExpression'] += ' AND contains(baslik, :search)'
                scan_params['ExpressionAttributeValues'][':search'] = search
            
            # Perform scan
            response = self.table.scan(**scan_params)
            
            # Process and paginate results
            items = response.get('Items', [])
            total_count = len(items)
            
            # Apply pagination
            start_index = (page - 1) * per_page
            end_index = start_index + per_page
            paginated_items = items[start_index:end_index]
            
            # Convert to ForumModel objects
            forums = [ForumModel(**item) for item in paginated_items]
            
            return {
                'forums': [forum.to_dict() for forum in forums],
                'meta': {
                    'total': total_count,
                    'page': page,
                    'per_page': per_page,
                    'total_pages': (total_count + per_page - 1) // per_page
                }
            }
        
        except ClientError:
            return {
                'forums': [],
                'meta': {
                    'total': 0,
                    'page': page,
                    'per_page': per_page,
                    'total_pages': 0
                }
            }

    def update_forum(
        self, 
        forum_id: str, 
        user_id: str, 
        update_data: Dict[str, any]
    ) -> Optional[ForumModel]:
        """
        Update an existing forum
        
        Args:
            forum_id (str): Forum's unique identifier
            user_id (str): User attempting to update the forum
            update_data (Dict): Data to update
        
        Returns:
            Optional[ForumModel]: Updated forum object
        
        Raises:
            ValueError: If update fails or user is not authorized
        """
        try:
            # Retrieve existing forum
            forum = self.get_forum_by_id(forum_id)
            
            if not forum:
                raise ValueError("Forum not found")
            
            # Check authorization
            if forum.acan_kisi_id != user_id:
                raise ValueError("Not authorized to update this forum")
            
            # Prepare update expression and values
            update_expr = []
            expr_attr_values = {}
            
            # Updatable fields
            updatable_fields = ['baslik', 'aciklama', 'foto_urls', 'kategori']
            
            for field in updatable_fields:
                if field in update_data and update_data[field] is not None:
                    update_expr.append(f"{field} = :{field}")
                    expr_attr_values[f":{field}"] = update_data[field]
            
            if not update_expr:
                return forum
            
            # Construct full update expression
            full_update_expr = "SET " + ", ".join(update_expr)
            
            # Perform update
            self.table.update_item(
                Key={'forum_id': forum_id},
                UpdateExpression=full_update_expr,
                ExpressionAttributeValues=expr_attr_values
            )
            
            # Retrieve and return updated forum
            updated_forum = self.get_forum_by_id(forum_id)
            return updated_forum
        
        except ClientError as e:
            raise ValueError(f"Error updating forum: {e}")
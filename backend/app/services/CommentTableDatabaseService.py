import os
import uuid
import boto3
from typing import List, Optional, Dict
from datetime import datetime
from botocore.exceptions import ClientError

from app.models.CommentModel import CommentModel
from app.models.ForumModel import ForumModel
from app.models.UserModel import UserModel

DEFAULT_REGION = os.getenv('AWS_DEFAULT_REGION')
DEFAULT_COMMENTS_TABLE_NAME = os.getenv('COMMENTS_TABLE_NAME', 'Comments')

class CommentDatabaseService:

    __instance = None

    @staticmethod
    def get_instance():
        """Static access method"""
        if CommentDatabaseService.__instance is None:
            CommentDatabaseService()
        return CommentDatabaseService.__instance
    
    def __init__(
        self, 
        region_name: str = DEFAULT_REGION, 
        table_name: str = DEFAULT_COMMENTS_TABLE_NAME
    ):
        """
        Initialize DynamoDB Comment Service
        
        Args:
            region_name (str): AWS region
            table_name (str): DynamoDB table name
        """
        if CommentDatabaseService.__instance is not None:
            raise Exception("This class is a singleton!")
        else:
            CommentDatabaseService.__instance = self
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
        return

    def create_comment(
        self, 
        user_id: str, 
        commented_on_id: str, 
        content: str,
        photo_urls: Optional[List[str]] = None
    ) -> CommentModel:
        """
        Create a new comment in the database
        
        Args:
            user_id (str): ID of the user creating the comment
            forum_id (str): ID of the forum
            content (str): Comment content
            photo_urls (List[str], optional): Comment photo URLs
            ust_yorum_id (str, optional): Parent comment ID for replies
        
        Returns:
            CommentModel: Created comment object
        
        Raises:
            ValueError: If comment creation fails
        """
        # Validate inputs
        if not content:
            raise ValueError("Yorum içeriği zorunludur")
        
        # Generate unique comment ID
        comment_id = f"cmt_{str(uuid.uuid4())}"
        
        # Prepare comment data
        comment_data = {
            'comment_id': comment_id,
            'commented_on_id': commented_on_id,
            'creator_id': user_id,
            'content': content,
            'created_at': datetime.now().isoformat(),
            'photo_urls': photo_urls or []
        }

        new_comment = CommentModel(**comment_data)
        
        # Save to DynamoDB
        try:
            self.table.put_item(Item=new_comment.to_dict())
        except ClientError as e:
            raise ValueError(f"Error creating comment: {e}")
        
        return new_comment

    def get_comment_by_id(self, comment_id: str) -> Optional[CommentModel]:
        """
        Get comment by its ID
        
        Args:
            comment_id (str): Comment's unique identifier
        
        Returns:
            Optional[CommentModel]: Comment object if found, else None
        """
        try:
            response = self.table.get_item(
                Key={'comment_id': comment_id}
            )
            
            comment_item = response.get('Item')
            return CommentModel(**comment_item) if comment_item else None
        
        except ClientError:
            return None

    def get_comments_for_id(
        self, 
        commented_on_id: str,
        page: int = 1, 
        per_page: int = 20
    ) -> Dict[str, any]:
        """
        Retrieve comments for a specific forum
        
        Args:
            forum_id (str): Forum's unique identifier
            page (int): Page number
            per_page (int): Comments per page
        
        Returns:
            Dict containing comments and metadata
        """
        try:
            # Retrieve main comments (top-level comments)
            scan_params = {
                'FilterExpression': 'commented_on_id = :commented_on_id AND is_active = :active',
                'ExpressionAttributeValues': {
                    ':commented_on_id': commented_on_id,
                    ':active': True
                }
            }
            
            # Perform scan
            response = self.table.scan(**scan_params)
            
            # Process and paginate results
            items = response.get('Items', [])
            total_count = len(items)
            
            # Apply pagination
            start_index = (page - 1) * per_page
            end_index = start_index + per_page
            paginated_items = items[start_index:end_index]
            
            # Convert to CommentModel objects and fetch replies
            main_comments = []
            for item in paginated_items:
                comment = CommentModel(**item)
                
                # Fetch replies for this comment
                replies_params = {
                    'FilterExpression': 'commented_on_id = :commented_on_id AND is_active = :active',
                    'ExpressionAttributeValues': {
                        ':commented_on_id': commented_on_id,
                        ':active': True,
                        ':parent_id': comment.comment_id
                    }
                }
                replies_response = self.table.scan(**replies_params)
                
                # Add replies to the comment
                comment.yanit_listesi = [
                    CommentModel(**reply_item) 
                    for reply_item in replies_response.get('Items', [])
                ]
                
                main_comments.append(comment)
            
            return {
                'comments': [comment.to_dict() for comment in main_comments],
                'meta': {
                    'total': total_count,
                    'page': page,
                    'per_page': per_page,
                    'total_pages': (total_count + per_page - 1) // per_page
                }
            }
        
        except ClientError:
            return {
                'comments': [],
                'meta': {
                    'total': 0,
                    'page': page,
                    'per_page': per_page,
                    'total_pages': 0
                }
            }

    def get_comments_by_commented_on_id(self,
        commented_on_id: str
    ) -> List[CommentModel]:
        """
        Retrieve comments by commented-on ID
        
        Args:
            commented_on_id (str): ID of the commented object
        
        Returns:
            List[CommentModel]: List of comments
        """
        try:
            response = self.table.query(
                IndexName='commented_on_id-index',
                KeyConditionExpression='commented_on_id = :commented_on_id',
                ExpressionAttributeValues={':commented_on_id': commented_on_id}
            )
            
            items = response.get('Items', [])
            return [CommentModel(**item) for item in items]
        
        except ClientError:
            return []
        

    def update_comment(
        self, 
        comment_id: str, 
        user_id: str, 
        update_data: Dict[str, any]
    ) -> Optional[CommentModel]:
        """
        Update an existing comment
        
        Args:
            comment_id (str): Comment's unique identifier
            user_id (str): User attempting to update the comment
            update_data (Dict): Data to update
        
        Returns:
            Optional[CommentModel]: Updated comment object
        
        Raises:
            ValueError: If update fails or user is not authorized
        """
        try:
            # Retrieve existing comment
            comment = self.get_comment_by_id(comment_id)
            
            if not comment:
                raise ValueError("Comment not found")
            
            # Check authorization
            if comment.creator_id != user_id:
                raise ValueError("Not authorized to update this comment")
            
            # Prepare update expression and values
            update_expr = []
            expr_attr_values = {}
            
            # Updatable fields
            updatable_fields = ['content', 'photo_urls']
            
            for field in updatable_fields:
                if field in update_data and update_data[field] is not None:
                    update_expr.append(f"{field} = :{field}")
                    expr_attr_values[f":{field}"] = update_data[field]
            
            if not update_expr:
                return comment
            
            # Construct full update expression
            full_update_expr = "SET " + ", ".join(update_expr)
            
            # Perform update
            self.table.update_item(
                Key={'comment_id': comment_id},
                UpdateExpression=full_update_expr,
                ExpressionAttributeValues=expr_attr_values
            )
            
            # Retrieve and return updated comment
            updated_comment = self.get_comment_by_id(comment_id)
            return updated_comment
        
        except ClientError as e:
            raise ValueError(f"Error updating comment: {e}")

    def delete_comment(
        self, 
        comment_id: str, 
        user_id: str
    ) -> bool:
        """
        Soft delete a comment
        
        Args:
            comment_id (str): Comment's unique identifier
            user_id (str): User attempting to delete the comment
        
        Returns:
            bool: Whether deletion was successful
        
        Raises:
            ValueError: If deletion fails or user is not authorized
        """
        try:
            # Retrieve existing comment
            comment = self.get_comment_by_id(comment_id)
            
            if not comment:
                raise ValueError("Comment not found")
            
            # Check authorization
            is_authorized = (
                comment.creator_id == user_id or
                # Additional authorization checks can be added here
                # For example, forum owner or admin can delete comments
                False
            )
            
            if not is_authorized:
                raise ValueError("Not authorized to delete this comment")
            
            # Perform soft delete
            self.table.update_item(
                Key={'comment_id': comment_id},
                UpdateExpression='SET is_active = :false',
                ExpressionAttributeValues={':false': False}
            )
            
            return True
        
        except ClientError as e:
            raise ValueError(f"Error deleting comment: {e}")

    def react_to_comment(
        self, 
        comment_id: str, 
        user_id: str, 
        reaction_type: str
    ) -> Dict[str, int]:
        """
        Add a reaction to a comment
        
        Args:
            comment_id (str): Comment's unique identifier
            user_id (str): User adding the reaction
            reaction_type (str): Type of reaction ('like' or 'dislike')
        
        Returns:
            Dict: Updated reaction counts
        
        Raises:
            ValueError: If reaction is invalid or comment not found
        """
        try:
            # Validate reaction type
            if reaction_type not in ['like', 'dislike']:
                raise ValueError("Geçersiz reaksiyon türü")
            
            # Retrieve existing comment
            comment = self.get_comment_by_id(comment_id)
            
            if not comment:
                raise ValueError("Yorum bulunamadı")
            
            # Prepare update expression
            update_expr = f"SET {reaction_type}_count = {reaction_type}_count + :increment"
            
            # Perform update
            self.table.update_item(
                Key={'comment_id': comment_id},
                UpdateExpression=update_expr,
                ExpressionAttributeValues={':increment': 1}
            )
            
            # Retrieve updated comment to get latest counts
            updated_comment = self.get_comment_by_id(comment_id)
            
            return {
                'like_count': updated_comment.like_count,
                'dislike_count': updated_comment.dislike_count
            }
        
        except ClientError as e:
            raise ValueError(f"Reaksiyon eklenemedi: {e}")

    def get_sub_comments(
        self, 
        comment_id: str
    ) -> List[CommentModel]:
        """
        Retrieve sub-comments for a specific comment
        
        Args:
            comment_id (str): Comment's unique identifier
        
        Returns:
            List[CommentModel]: List of sub-comments
        """
        try:
            response = self.table.query(
                IndexName='commented_on_id-index',
                KeyConditionExpression='commented_on_id = :commented_on_id',
                ExpressionAttributeValues={':commented_on_id': comment_id}
            )
            
            items = response.get('Items', [])
            return [CommentModel(**item) for item in items]
        
        except ClientError:
            return []
        
import os
import uuid
import boto3
from boto3.dynamodb.conditions import Key
from typing import List, Optional
from datetime import datetime, timedelta
from app.utils.auth import hash_password, check_password
from app.models.UserModel import UserModel
from botocore.exceptions import ClientError

DEFAULT_REGION = os.getenv('AWS_DEFAULT_REGION')
DEFAULT_USERS_TABLE_NAME = os.getenv('USERS_TABLE_NAME', 'Users')

class EmailAlreadyExistsError(Exception):
    pass

class UserDatabaseService:

    __instance = None

    @staticmethod
    def get_instance():
        if UserDatabaseService.__instance is None:
            UserDatabaseService()
        return UserDatabaseService.__instance
    
    def __init__(
        self, 
        region_name: str = DEFAULT_REGION, 
        table_name: str = DEFAULT_USERS_TABLE_NAME
    ):
        if UserDatabaseService.__instance is not None:
            raise Exception("This class is a singleton!")
        """
        Initialize DynamoDB User Service
        
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

        UserDatabaseService.__instance = self


    def create_user(
        self, 
        email: str, 
        username: str, 
        password: str, 
        university: Optional[str] = None,
        gender: Optional[str] = 'Diğer',
        role: str = 'user'
    ) -> UserModel:
        """
        Create a new user in the database
        
        Args:
            email (str): User's email
            username (str): User's username
            password (str): User's password
            university (str, optional): User's university
            role (str, optional): User's role
        
        Returns:
            UserModel: Created user object
        
        Raises:
            ValueError: If email or username already exists
        """
        # Check if email already exists
        existing_email = self._get_user_by_email(email)
        if existing_email:
            raise EmailAlreadyExistsError("Email already exists")
        
        # Check if username already exists
        existing_username = self._get_user_by_username(username)
        if existing_username:
            raise ValueError("Username already exists")
        
        # Generate unique user ID
        user_id = f"usr_{str(uuid.uuid4())}"
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Prepare user data
        user_data = {
            'user_id': user_id,
            'email': email,
            'username': username,
            'password_hash': hashed_password,
            'role': role,
            'university': university,
            'is_active': True,
            'created_at': datetime.now().isoformat(),
            'last_login': None,
            'profile_image_url': None,
            'groups': [],
            'forums': [],
            'polls': []
        }
        
        # Save to DynamoDB
        try:
            self.table.put_item(Item=user_data)
        except ClientError as e:
            raise ValueError(f"Error creating user: {e}")
        
        return UserModel(**user_data)

    def _get_user_by_user_id(self, user_id: str) -> UserModel:
        """
        Get user by ID
        
        Args:
            user_id (str): User's ID
        
        Returns:
            Optional[dict]: User data if found, else None
        """
        try:
            response = self.table.query(
                KeyConditionExpression=Key('user_id').eq(user_id)
            )
            # print (response)
            items = response.get('Items', [])
            if items is None or len(items) == 0:
                return None
            user_data = items[0]
            return UserModel(**user_data)
        except ClientError:
            return None
        
    def _get_user_by_email(self, email: str) -> UserModel:
        """
        Get user by email
        
        Args:
            email (str): User's email
        
        Returns:
            Optional[dict]: User data if found, else None
        """
        try:
            response = self.table.scan(
                FilterExpression='email = :email',
                ExpressionAttributeValues={':email': email}
            )
            user_data = response.get('Items', [])
            if len(user_data) != 0:
                user_data = user_data[0]
            else:
                return None
            return UserModel(**user_data)
        except ClientError:
            return None

    def _get_user_by_username(self, username: str) -> UserModel:
        """
        Get user by username
        
        Args:
            username (str): User's username
        
        Returns:
            Optional[dict]: User data if found, else None
        """
        try:
            response = self.table.scan(
                FilterExpression='username = :username',
                ExpressionAttributeValues={':username': username}
            )
            user_data = response.get('Items', [])
            if len(user_data) != 0:
                user_data = user_data[0]
            else:
                return None
            return UserModel(**user_data)
        except ClientError:
            return None

    def _get_user_forums_by_user_id(self, user_id: str) -> List[str]:
        """
        Get user's forums by user ID
        
        Args:
            user_id (str): User's ID
        
        Returns:
            List[str]: List of forum IDs
        """
        user_data = self._get_user_by_user_id(user_id)
        if not user_data:
            return []
        
        return user_data.forums
    
    def _get_user_polls_by_user_id(self, user_id: str) -> List[str]:
        """
        Get user's polls by user ID
        
        Args:
            user_id (str): User's ID
        
        Returns:
            List[str]: List of poll IDs
        """
        user_data = self._get_user_by_user_id(user_id)
        if not user_data:
            return []
        
        return user_data.polls
    
    def _get_user_groups_by_user_id(self, user_id: str) -> List[str]:
        """
        Get user's groups by user ID
        
        Args:
            user_id (str): User's ID
        
        Returns:
            List[str]: List of group IDs
        """
        user_data = self._get_user_by_user_id(user_id)
        if not user_data:
            return []
        
        return user_data.groups

    def login(self, username: str, password: str) -> UserModel:
        """
        Authenticate user
        
        Args:
            username (str): User's username
            password (str): User's password
        
        Returns:
            Optional[UserModel]: Authenticated user, else None
        """
        user_data = self._get_user_by_username(username)
        
        if not user_data:
            return None
        
        
        if not check_password(password, user_data['password_hash']):
            return None
        
        # Update last login
        self._update_last_login(user_data['user_id'])
        
        return UserModel(**user_data)

    def _update_last_login(self, user_id: str):
        """
        Update user's last login timestamp
        
        Args:
            user_id (str): User's ID
        """
        try:
            self.table.update_item(
                Key={
                    'user_id': user_id
                    },
                UpdateExpression='SET last_login = :last_login',
                ExpressionAttributeValues={
                    ':last_login': datetime.now().isoformat()
                }
            )
        except ClientError:
            # Log error or handle silently
            pass

    def update_user(self, user_id: str, **params) -> UserModel:
        """
        Update user attributes in the database
        
        Args:
            user_id (str): User's ID
            **params: User attributes to update, can include:
                - email: User's email
                - username: User's username
                - password: User's password (will be hashed)
                - university: User's university
                - role: User's role
                - is_active: User's active status
                - profile_image_url: URL to user's profile image
                - groups: List of user's groups
                - forums: List of user's forums
                - polls: List of user's polls
        
        Returns:
            Optional[UserModel]: Updated user object if successful, None otherwise
        
        Raises:
            ValueError: If user does not exist or if email/username already exists
        """
        # Check if user exists
        existing_user = self._get_user_by_user_id(user_id)
        if not existing_user:
            raise ValueError(f"User with ID {user_id} does not exist")
        
        # Check if updating email and it already exists
        if 'email' in params and params['email'] != existing_user.email:
            existing_email = self._get_user_by_email(params['email'])
            if existing_email:
                raise EmailAlreadyExistsError("Email already exists")
        
        # Check if updating username and it already exists
        if 'username' in params and params['username'] != existing_user.username:
            existing_username = self._get_user_by_username(params['username'])
            if existing_username:
                raise ValueError("Username already exists")
        
        # Hash password if provided
        if 'password' in params:
            params['password_hash'] = hash_password(params.pop('password'))
        
        # Build update expression and attribute values
        update_expression_parts = []
        expression_attribute_values = {}
        
        for key, value in params.items():
            # Skip if key is not valid for user model
            if key not in existing_user.to_dict() and key != 'password_hash':
                continue
            
            update_expression_parts.append(f"{key} = :{key}")
            expression_attribute_values[f":{key}"] = value
        
        # Return if nothing to update
        if not update_expression_parts:
            return existing_user
        
        update_expression = "SET " + ", ".join(update_expression_parts)
        
        # Update user in DynamoDB
        try:
            self.table.update_item(
                Key={
                    'user_id': user_id,
                    'email': existing_user.email
                    },
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_attribute_values
            )
        except ClientError as e:
            raise ValueError(f"Error updating user: {e}")
        
        # Get and return updated user
        updated_user = self._get_user_by_user_id(user_id)
        return updated_user
    
    def delete_user(self, user_id: str):
        """
        Delete user from the database
        
        Args:
            user_id (str): User's ID
        
        Raises:
            ValueError: If user does not exist
        """
        # Check if user exists
        existing_user = self._get_user_by_user_id(user_id)
        if not existing_user:
            raise ValueError(f"User with ID {user_id} does not exist")
        
        # Delete user from DynamoDB
        try:
            self.table.delete_item(
                Key={
                    'user_id': user_id,
                    'email': existing_user.email
                }
            )
        except ClientError as e:
            raise ValueError(f"Error deleting user: {e}")
        
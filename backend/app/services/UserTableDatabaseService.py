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

class UserDatabaseService:
    def __init__(
        self, 
        region_name: str = DEFAULT_REGION, 
        table_name: str = DEFAULT_USERS_TABLE_NAME
    ):
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

    def create_user(
        self, 
        email: str, 
        username: str, 
        password: str, 
        universite: Optional[str] = None,
        role: str = 'user'
    ) -> UserModel:
        """
        Create a new user in the database
        
        Args:
            email (str): User's email
            username (str): User's username
            password (str): User's password
            universite (str, optional): User's university
            role (str, optional): User's role
        
        Returns:
            UserModel: Created user object
        
        Raises:
            ValueError: If email or username already exists
        """
        # Check if email already exists
        existing_email = self._get_user_by_email(email)
        if existing_email:
            raise ValueError("Email already exists")
        
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
            'universite': universite,
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

    def _get_user_by_user_id(self, user_id: str) -> Optional[dict]:
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
        
    def _get_user_by_email(self, email: str) -> Optional[dict]:
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
            return response.get('Items', [])[0] if response.get('Items') else None
        except ClientError:
            return None

    def _get_user_by_username(self, username: str) -> Optional[dict]:
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
            return response.get('Items', [])[0] if response.get('Items') else None
        except ClientError:
            return None

    def login(self, username: str, password: str) -> Optional[UserModel]:
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
                Key={'user_id': user_id},
                UpdateExpression='SET last_login = :last_login',
                ExpressionAttributeValues={
                    ':last_login': datetime.now().isoformat()
                }
            )
        except ClientError:
            # Log error or handle silently
            pass
"""
DynamoDB Initialization Module
----------------------------
Helper functions to initialize DynamoDB connection and tables.
"""

import boto3
import logging
import os
from flask import current_app

# Logger configuration
logger = logging.getLogger(__name__)

def initialize_dynamodb(app):
    """Initialize DynamoDB connection and tables"""
    from app.services.UserTableDatabaseService import UserDatabaseService
    from app.services.ForumTableDatabaseService import ForumDatabaseService
    from app.services.CommentTableDatabaseService import CommentDatabaseService
    from app.services.PollTableDatabaseService import PollDatabaseService
    from app.services.GroupTableDatabaseService import GroupDatabaseService
    
    # Create database service instances
    user_db = UserDatabaseService()
    forum_db = ForumDatabaseService()
    comment_db = CommentDatabaseService()
    poll_db = PollDatabaseService()
    group_db = GroupDatabaseService()
    


def get_dynamodb_client():
    """Get DynamoDB client"""
    region = current_app.config.get('AWS_DEFAULT_REGION', 'eu-central-1')
    
    kwargs = {'region_name': region}
        
    return boto3.client('dynamodb', **kwargs)

def get_dynamodb_resource():
    """Get DynamoDB resource"""
    region = current_app.config.get('AWS_DEFAULT_REGION', 'eu-central-1')
    
    kwargs = {'region_name': region}
        
    return boto3.resource('dynamodb', **kwargs)

def create_tables():
    """Create DynamoDB tables"""
    initialize_dynamodb(current_app)

def generate_id(prefix=''):
    """Generate unique ID"""
    import uuid
    if prefix:
        return f"{prefix}_{uuid.uuid4()}"
    return str(uuid.uuid4())
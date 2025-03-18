"""
Data Models Package
----------------
Contains DynamoDB models and data schemas.
"""

from app.models.BaseModel import BaseModel
from app.models.UserModel import UserModel
from app.models.ForumModel import ForumModel
from app.models.CommentModel import CommentModel
from app.models.PollModel import PollModel, PollOption, PollVote
from app.models.GroupModel import GroupModel, GroupMember
from app.models.MediaModel import MediaModel

def setup_model_associations():
    """
    Set up model associations if needed.
    """
    # No need for explicit associations with this architecture
    pass

def setup_models(app):
    """
    Set up models with application config.
    
    Args:
        app: Flask application or config object
    """
    # No special setup needed with this architecture
    pass

__all__ = [
    'UserModel',
    'ForumModel',
    'CommentModel',
    'PollModel',
    'PollOption',
    'PollVote',
    'GroupModel',
    'GroupMember',
    'MediaModel',
    'BaseModel',
    'setup_model_associations',
    'setup_models'
]
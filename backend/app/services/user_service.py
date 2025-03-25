"""
User Service
----------
Handles user profile management and related operations.
"""

import logging
from app.services.UserTableDatabaseService import UserDatabaseService
from app.services.ForumTableDatabaseService import ForumDatabaseService
from app.services.CommentTableDatabaseService import CommentDatabaseService
from app.services.PollTableDatabaseService import PollDatabaseService
from app.services.GroupTableDatabaseService import GroupDatabaseService
from app.utils.exceptions import NotFoundError, ValidationError, ForbiddenError

# Logger configuration
logger = logging.getLogger(__name__)

class UserService:
    """
    User service.
    
    Handles user profile management and related operations.
    """

    __instance = None

    @staticmethod
    def get_instance():
        """Static access method"""
        if not UserService.__instance:
            UserService.__instance = UserService()
        return UserService.__instance
    
    def __init__(self):
        """Virtually private constructor"""
        if UserService.__instance is not None:
            raise Exception("This class is a singleton!")
        else:
            UserService.__instance = self
            
        self.user_db_service = UserDatabaseService.get_instance()
        self.forum_db_service = ForumDatabaseService.get_instance()
        self.comment_db_service = CommentDatabaseService.get_instance()
        self.poll_db_service = PollDatabaseService()
        self.group_db_service = GroupDatabaseService()
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        user = self.user_db_service.get_user_by_id(user_id)
        if not user or not user.is_active:
            raise NotFoundError("Kullanıcı bulunamadı")
        
        return user.to_dict()
    
    def get_user_by_username(self, username):
        """Get user by username"""
        user = self.user_db_service.get_user_by_username(username)
        if not user or not user.is_active:
            raise NotFoundError("Kullanıcı bulunamadı")
        
        return user.to_dict()
    
    def update_user(self, user_id, update_data):
        """Update user profile"""
        try:
            updated_user = self.user_db_service.update_user(user_id, update_data)
            return updated_user
        except Exception as e:
            logger.error(f"Kullanıcı güncelleme hatası: {str(e)}")
            raise ValidationError("Kullanıcı güncellenemedi")
    
    def delete_user(self, user_id):
        """Delete user (soft delete)"""
        try:
            self.user_db_service.delete_user(user_id)
            return True
        except Exception as e:
            logger.error(f"Kullanıcı silme hatası: {str(e)}")
            raise ValidationError("Kullanıcı silinemedi")
    
    def get_user_forums(self, user_id, page=1, per_page=10):
        """Get forums created by user"""
        # Check if user exists
        user = self.user_db_service.get_user_by_id(user_id)
        if not user or not user.is_active:
            raise NotFoundError("Kullanıcı bulunamadı")
        
        return self.forum_db_service.get_forums_by_user(user_id, page, per_page)
    
    def get_user_comments(self, user_id, page=1, per_page=10):
        """Get comments by user"""
        # Check if user exists
        user = self.user_db_service.get_user_by_id(user_id)
        if not user or not user.is_active:
            raise NotFoundError("Kullanıcı bulunamadı")
        
        return self.comment_db_service.get_user_comments(user_id, page, per_page)
    
    def get_user_polls(self, user_id, page=1, per_page=10):
        """Get polls created by user"""
        # Check if user exists
        user = self.user_db_service.get_user_by_id(user_id)
        if not user or not user.is_active:
            raise NotFoundError("Kullanıcı bulunamadı")
        
        return self.poll_db_service.get_user_polls(user_id, page, per_page)
    
    def get_user_groups(self, user_id):
        """Get groups that user is a member of"""
        # Check if user exists
        user = self.user_db_service.get_user_by_id(user_id)
        if not user or not user.is_active:
            raise NotFoundError("Kullanıcı bulunamadı")
        
        return self.group_db_service.get_user_groups(user_id)
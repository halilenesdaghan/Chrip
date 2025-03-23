"""
Forum Servisi
-----------
Forum yönetimi, forum işlemleri ve ilgili işlemleri gerçekleştirir.
"""

import logging
from datetime import datetime
from app.services.ForumTableDatabaseService import ForumDatabaseService
from app.services.UserTableDatabaseService import UserDatabaseService
from app.models.ForumModel import ForumModel
from app.models.UserModel import UserModel
import traceback
import uuid

logger = logging.getLogger(__name__)

class ForumService:

    @staticmethod
    def create_forum(
                        header: str,
                        creator_id: str,
                        description: str = "",
                        category: str = ""):
        try:
            forum_db_service = ForumDatabaseService.get_instance()
            user_db_service = UserDatabaseService.get_instance()
            user = user_db_service._get_user_by_user_id(creator_id)
            if not user:
                raise Exception("Kullanıcı bulunamadı")
            
            new_forum = forum_db_service.create_forum(
                creator_id=creator_id,
                header=header,
                description=description,
                university=user.university,
                category=category
            )

            if new_forum:
                return new_forum
            else:
                raise Exception("Forum yaratılamadı")
        except Exception as e:
            traceback.print_exc()
            raise Exception("Forum yaratırıken bir hata oluştu")
        
    @staticmethod
    def get_forums(
                    page: int = 1,
                    per_page: int = 10,
                    category: str = "",
                    university: str = "",
                    search: str = ""):
        try:
            forum_db_service = ForumDatabaseService.get_instance()
            forums = forum_db_service.get_forums(
                page=page,
                per_page=per_page,
                category=category,
                university=university,
                search=search
            )
            return forums
        except Exception as e:
            traceback.print_exc()
            raise Exception("Forumlar getirilirken bir hata oluştu")
        
    @staticmethod
    def get_forum_by_id(forum_id: str):
        try:
            forum_db_service = ForumDatabaseService.get_instance()
            forum = forum_db_service.get_forum_by_id(forum_id)
            return forum
        except Exception as e:
            traceback.print_exc()
            raise Exception("Forum getirilirken bir hata oluştu")
        
    @staticmethod
    def update_forum_by_id(forum_id: str, **kwargs):
        try:
            forum_db_service = ForumDatabaseService.get_instance()
            forum = forum_db_service.update_forum(forum_id, **kwargs)
            return forum
        except Exception as e:
            traceback.print_exc()                        
            raise Exception("Forum güncellenirken bir hata oluştu")
        
    @staticmethod
    def delete_forum_by_id(forum_id: str):
        try:
            forum_db_service = ForumDatabaseService.get_instance()
            forum_db_service.delete_forum(forum_id)
        except Exception as e:
            traceback.print_exc()
            raise Exception("Forum silinirken bir hata oluştu")
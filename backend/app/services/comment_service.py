import logging
from datetime import datetime
from app.services.CommentTableDatabaseService import CommentDatabaseService
from app.services.UserTableDatabaseService import UserDatabaseService
from app.models.CommentModel import CommentModel
from app.models.UserModel import UserModel
import traceback

class CommentService:

    @staticmethod
    def create_comment(
        commented_on_id: str,
        creator_id: str,
        content: str,
        photo_urls: list[str]
    ) -> CommentModel:
        """
        Create a new comment

        Args:
            commented_on_id (str): ID of the commented object
            creator_id (str): ID of the creator
            content (str): Comment content
            photo_urls (list[str]): List of photo URLs

        Returns:
            CommentModel: Created comment
        """
        try:
            comment_db_service = CommentDatabaseService.get_instance()
            
            new_comment = comment_db_service.create_comment(
                user_id=creator_id,
                commented_on_id=commented_on_id,
                content=content,
                photo_urls=photo_urls
            )

            return new_comment
        except Exception as e:
            print (traceback.format_exc(), flush=True)
            logging.error(f"Comment creation failed: {e}")
            raise e
        
    @staticmethod
    def get_comment(comment_id: str) -> CommentModel:
        """
        Retrieve a comment by ID

        Args:
            comment_id (str): ID of the comment to retrieve

        Returns:
            CommentModel: Retrieved comment
        """
        try:
            comment_db_service = CommentDatabaseService.get_instance()
            comment = comment_db_service.get_comment_by_id(comment_id)
            return comment
        except Exception as e:
            print (traceback.format_exc(), flush=True)
            logging.error(f"Comment retrieval failed: {e}")
            raise e
        
    @staticmethod
    def get_comments_by_commented_on_id(commented_on_id: str) -> list[CommentModel]:
        """
        Retrieve comments by commented-on ID

        Args:
            commented_on_id (str): ID of the commented object

        Returns:
            list[CommentModel]: List of comments
        """
        try:
            comment_db_service = CommentDatabaseService.get_instance()
            comments = comment_db_service.get_comments_by_commented_on_id(commented_on_id)
            # prints the retrived commetns in orange color
            print ('\033[33m' + str(comments) + '\033[0m', flush=True)
            return comments
        except Exception as e:
            print (traceback.format_exc(), flush=True)
            logging.error(f"Comments retrieval failed: {e}")
            raise e
        
    @staticmethod
    def update_comment(
        comment_id: str,
        creator_id: str,
        **kwargs
    ) -> CommentModel:
        """
        Update a comment

        Args:
            comment_id (str): ID of the comment to update
            creator_id (str): ID of the creator
            **kwargs: Fields to update

        Returns:
            CommentModel: Updated comment
        """
        try:
            comment_db_service = CommentDatabaseService.get_instance()
            updated_comment = comment_db_service.update_comment(comment_id, creator_id, **kwargs)
            return updated_comment
        except Exception as e:
            print (traceback.format_exc(), flush=True)
            logging.error(f"Comment update failed: {e}")
            raise e
        
    @staticmethod
    def delete_comment(
        comment_id: str,
        user_id: str
    ):
        """
        Soft delete a comment

        Args:
            comment_id (str): ID of the comment to delete
            user_id (str): ID of the user deleting the comment
        """
        try:
            comment_db_service = CommentDatabaseService.get_instance()
            comment_db_service.delete_comment(comment_id, user_id)
        except Exception as e:
            print (traceback.format_exc(), flush=True)
            logging.error(f"Comment deletion failed: {e}")
            raise e
        
    @staticmethod
    def get_comment_replies(
        comment_id: str
    ) -> list[str]:
        """
        Retrieve replies for a specific comment

        Args:
            comment_id (str): ID of the comment

        Returns:
            list[str]: List of comment IDs
        """
        try:
            comment_db_service = CommentDatabaseService.get_instance()
            replies = comment_db_service.get_sub_comments(comment_id)
            return replies
        except Exception as e:
            print (traceback.format_exc(), flush=True)
            logging.error(f"Comment replies retrieval failed: {e}")
            raise e
        
    @staticmethod
    def react_to_comment(
        comment_id: str,
        user_id: str,
        reaction: str
    ):
        """
        React to a comment

        Args:
            comment_id (str): ID of the comment to react to
            user_id (str): ID of the user reacting
            reaction (str): Reaction type

        Raises:
            ValueError: Invalid reaction type

        """
        try:
            comment_db_service = CommentDatabaseService.get_instance()
            return comment_db_service.react_to_comment(comment_id, user_id, reaction)
        except Exception as e:
            print (traceback.format_exc(), flush=True)
            logging.error(f"Comment reaction failed: {e}")
            raise e

    @staticmethod
    def get_creator_info(comment_id: str) -> dict:
        """
        Retrieve creator information for a specific comment

        Args:
            comment_id (str): ID of the comment

        Returns:
            dict: Creator information
        """
        try:
            comment_db_service = CommentDatabaseService.get_instance()
            user_db_service = UserDatabaseService.get_instance()
            comment = comment_db_service.get_comment_by_id(comment_id)
            user = user_db_service._get_user_by_user_id(comment.creator_id)
            if not user:
                raise Exception("User not found")
            return user.safe_dict()
        except Exception as e:
            print (traceback.format_exc(), flush=True)
            logging.error(f"Creator information retrieval failed: {e}")
            raise e

    @staticmethod
    def add_reply(comment_id: str,
                    creator_id: str,
                    content: str,
                    photo_urls: list[str]):
        """
        Add a reply to a comment

        Args:
            comment_id (str): ID of the commented object
            creator_id (str): ID of the creator
            content (str): Reply content
            photo_urls (list[str]): List of photo URLs

        Returns:
            CommentModel: Created reply
        """
        try:
            comment_db_service = CommentDatabaseService.get_instance()
            reply_comment = comment_db_service.create_comment(
                user_id=creator_id,
                commented_on_id=comment_id,
                content=content,
                photo_urls=photo_urls
            )
            original_comment = comment_db_service.get_comment_by_id(comment_id)
            original_comment.add_reply(reply_comment)
            updated_comment = comment_db_service.update_comment(
                comment_id,
                original_comment.creator_id,
                update_data=original_comment.to_dict()
            )
            return reply_comment
        
        except Exception as e:
            print (traceback.format_exc(), flush=True)
            logging.error(f"Reply creation failed: {e}")
            raise e
        
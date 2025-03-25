from datetime import datetime
import uuid
from typing import List, Dict, Optional

class CommentModel:
    """
    Comment model representing a user comment in the system
    
    Attributes:
        comment_id (str): Unique identifier for the comment
        commented_on_id (str): ID of the forum/poll/comment the comment is posted on
        creator_id (str): ID of the user who created the comment
        content (str): Comment content
        created_at (str): Comment creation timestamp
        photo_urls (List[str]): URLs of photos in the comment
        like_count (int): Number of likes
        dislike_count (int): Number of dislikes
        sub_comment_list (List[CommentModel]): List of sub-comments
        latest_sub_comment (str): ID of the latest sub-comment
        is_active (bool): Comment active status
    """
    def __init__(
        self,
        comment_id: str = "",
        commented_on_id: str = "",
        creator_id: str = "",
        content: str = "",
        created_at: Optional[str] = None,
        photo_urls: Optional[List[str]] = None,
        like_count: int = 0,
        dislike_count: int = 0,
        sub_comment_list: Optional[List['str']] = None,
        latest_sub_comment: 'CommentModel' = None,
        is_active: bool = True
    ):
        # Generate unique comment ID if not provided
        self.comment_id = comment_id or f"cmt_{str(uuid.uuid4())}"
        
        self.commented_on_id = commented_on_id
        self.creator_id = creator_id
        self.content = content
        self.created_at = created_at or datetime.now().isoformat()
        self.photo_urls = photo_urls or []
        self.like_count = like_count
        self.dislike_count = dislike_count
        self.sub_comment_list = sub_comment_list or []
        self.latest_sub_comment = latest_sub_comment or None
        self.is_active = is_active
        
    def add_photo(self, photo_url: str):
        """
        Add a photo URL to the comment
        
        Args:
            photo_url (str): URL of the photo to add
        """
        if photo_url not in self.photo_urls:
            self.photo_urls.append(photo_url)

    def add_like(self):
        """Increment likes count"""
        self.like_count += 1

    def add_dislike(self):
        """Increment dislikes count"""
        self.dislike_count += 1

    def to_dict(self) -> Dict[str, any]:
        """
        Convert comment model to dictionary
        
        Returns:
            Dict: Comment data dictionary
        """
        return {
            'comment_id': self.comment_id,
            'commented_on_id': self.commented_on_id,
            'creator_id': self.creator_id,
            'content': self.content,
            'created_at': self.created_at,
            'photo_urls': self.photo_urls,
            'like_count': self.like_count,
            'dislike_count': self.dislike_count,
            'sub_comment_list': [sub_comment for sub_comment in self.sub_comment_list],
            'latest_sub_comment': self.latest_sub_comment.to_dict() if self.latest_sub_comment else None,
            'is_active': self.is_active
        }
    
    def add_reply(self, sub_comment: 'CommentModel'):
        """
        Add a sub-comment to the comment
        """
        self.sub_comment_list.append(sub_comment.comment_id)
        self.latest_sub_comment = sub_comment
        return


    def __repr__(self):
        return f"CommentModel(comment_id={self.comment_id}, content={self.content[:50]}...)"

    def __eq__(self, other):
        """
        Check equality between comments
        
        Args:
            other (CommentModel): Another comment to compare
        
        Returns:
            bool: Whether comments are equal
        """
        if not isinstance(other, CommentModel):
            return False
        return self.comment_id == other.comment_id
from datetime import datetime
import uuid

class ForumModel:
    """
    Forum model representing a discussion forum in the system.
    
    Attributes:
        forum_id (str): Unique identifier for the forum
        header (str): Forum title
        description (str): Forum description
        creator_id (str): ID of the user who created the forum
        university (str, optional): Associated university
        category (str, optional): Forum category
        photo_urls (list): List of photo URLs associated with the forum
        like_count (int): Number of likes
        dislike_count (int): Number of dislikes
        is_active (bool): Forum active status
        created_at (str): Forum creation timestamp
    """
    def __init__(
        self,
        forum_id: str = "",
        header: str = "",
        description: str = "",
        creator_id: str = "",
        university: str = "",
        category: str = "",
        photo_urls: list = None,
        like_count: int = 0,
        dislike_count: int = 0,
        is_active: bool = True,
        created_at: str = ""
    ):
        self.forum_id = forum_id or f"frm_{str(uuid.uuid4())}"
        self.header = header
        self.description = description
        self.creator_id = creator_id
        self.university = university
        self.category = category
        self.photo_urls = photo_urls or []
        self.like_count = like_count
        self.dislike_count = dislike_count
        self.is_active = is_active
        self.created_at = created_at or datetime.now().isoformat()

    def to_dict(self):
        """
        Convert forum model to dictionary.
        
        Returns:
            dict: Forum data dictionary
        """
        return {
            'forum_id': self.forum_id,
            'header': self.header,
            'description': self.description,
            'creator_id': self.creator_id,
            'university': self.university,
            'category': self.category,
            'photo_urls': self.photo_urls,
            'like_count': self.like_count,
            'dislike_count': self.dislike_count,
            'is_active': self.is_active,
            'created_at': self.created_at
        }

    def add_photo(self, photo_url: str):
        """
        Add a photo URL to the forum's photo list.
        
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

    def __repr__(self):
        return f"ForumModel(forum_id={self.forum_id}, header={self.header})"
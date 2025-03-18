from datetime import datetime
import uuid
from typing import List, Dict, Optional

class CommentModel:
    """
    Comment model representing a user comment in the system
    
    Attributes:
        comment_id (str): Unique identifier for the comment
        forum_id (str): ID of the forum where the comment is posted
        acan_kisi_id (str): ID of the user who created the comment
        icerik (str): Comment content
        acilis_tarihi (str): Comment creation timestamp
        foto_urls (List[str]): URLs of photos in the comment
        begeni_sayisi (int): Number of likes
        begenmeme_sayisi (int): Number of dislikes
        ust_yorum_id (str, optional): ID of parent comment (for replies)
        is_active (bool): Comment active status
    """
    def __init__(
        self,
        comment_id: str = "",
        forum_id: str = "",
        acan_kisi_id: str = "",
        icerik: str = "",
        acilis_tarihi: Optional[str] = None,
        foto_urls: Optional[List[str]] = None,
        begeni_sayisi: int = 0,
        begenmeme_sayisi: int = 0,
        ust_yorum_id: Optional[str] = None,
        is_active: bool = True
    ):
        # Generate unique comment ID if not provided
        self.comment_id = comment_id or f"cmt_{str(uuid.uuid4())}"
        
        self.forum_id = forum_id
        self.acan_kisi_id = acan_kisi_id
        self.icerik = icerik
        self.acilis_tarihi = acilis_tarihi or datetime.now().isoformat()
        self.foto_urls = foto_urls or []
        self.begeni_sayisi = begeni_sayisi
        self.begenmeme_sayisi = begenmeme_sayisi
        self.ust_yorum_id = ust_yorum_id
        self.is_active = is_active
        
        # Placeholder for potential replies (can be populated separately)
        self.yanit_listesi = []

    def add_photo(self, photo_url: str):
        """
        Add a photo URL to the comment
        
        Args:
            photo_url (str): URL of the photo to add
        """
        if photo_url not in self.foto_urls:
            self.foto_urls.append(photo_url)

    def add_like(self):
        """Increment likes count"""
        self.begeni_sayisi += 1

    def add_dislike(self):
        """Increment dislikes count"""
        self.begenmeme_sayisi += 1

    def add_reply(self, reply_comment):
        """
        Add a reply to this comment
        
        Args:
            reply_comment (CommentModel): Reply comment to add
        """
        if reply_comment not in self.yanit_listesi:
            self.yanit_listesi.append(reply_comment)

    def is_reply(self) -> bool:
        """
        Check if this comment is a reply to another comment
        
        Returns:
            bool: True if comment is a reply, False otherwise
        """
        return self.ust_yorum_id is not None

    def to_dict(self) -> Dict[str, any]:
        """
        Convert comment model to dictionary
        
        Returns:
            Dict: Comment data dictionary
        """
        return {
            'comment_id': self.comment_id,
            'forum_id': self.forum_id,
            'acan_kisi_id': self.acan_kisi_id,
            'icerik': self.icerik,
            'acilis_tarihi': self.acilis_tarihi,
            'foto_urls': self.foto_urls,
            'begeni_sayisi': self.begeni_sayisi,
            'begenmeme_sayisi': self.begenmeme_sayisi,
            'ust_yorum_id': self.ust_yorum_id,
            'is_active': self.is_active,
            'yanit_listesi': [reply.to_dict() for reply in self.yanit_listesi]
        }

    def __repr__(self):
        return f"CommentModel(comment_id={self.comment_id}, icerik={self.icerik[:50]}...)"

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
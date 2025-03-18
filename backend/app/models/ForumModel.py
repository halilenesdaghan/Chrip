from datetime import datetime
import uuid

class ForumModel:
    """
    Forum model representing a discussion forum in the system.
    
    Attributes:
        forum_id (str): Unique identifier for the forum
        baslik (str): Forum title
        aciklama (str): Forum description
        acan_kisi_id (str): ID of the user who created the forum
        universite (str, optional): Associated university
        kategori (str, optional): Forum category
        foto_urls (list): List of photo URLs associated with the forum
        yorum_ids (list): List of comment IDs in the forum
        begeni_sayisi (int): Number of likes
        begenmeme_sayisi (int): Number of dislikes
        is_active (bool): Forum active status
        acilis_tarihi (str): Forum creation timestamp
    """
    def __init__(
        self,
        forum_id: str = "",
        baslik: str = "",
        aciklama: str = "",
        acan_kisi_id: str = "",
        universite: str = "",
        kategori: str = "",
        foto_urls: list = None,
        yorum_ids: list = None,
        begeni_sayisi: int = 0,
        begenmeme_sayisi: int = 0,
        is_active: bool = True,
        acilis_tarihi: str = ""
    ):
        self.forum_id = forum_id or f"frm_{str(uuid.uuid4())}"
        self.baslik = baslik
        self.aciklama = aciklama
        self.acan_kisi_id = acan_kisi_id
        self.universite = universite
        self.kategori = kategori
        self.foto_urls = foto_urls or []
        self.yorum_ids = yorum_ids or []
        self.begeni_sayisi = begeni_sayisi
        self.begenmeme_sayisi = begenmeme_sayisi
        self.is_active = is_active
        self.acilis_tarihi = acilis_tarihi or datetime.now().isoformat()

    def to_dict(self):
        """
        Convert forum model to dictionary.
        
        Returns:
            dict: Forum data dictionary
        """
        return {
            'forum_id': self.forum_id,
            'baslik': self.baslik,
            'aciklama': self.aciklama,
            'acan_kisi_id': self.acan_kisi_id,
            'universite': self.universite,
            'kategori': self.kategori,
            'foto_urls': self.foto_urls,
            'yorum_ids': self.yorum_ids,
            'begeni_sayisi': self.begeni_sayisi,
            'begenmeme_sayisi': self.begenmeme_sayisi,
            'is_active': self.is_active,
            'acilis_tarihi': self.acilis_tarihi
        }

    def add_comment(self, comment_id: str):
        """
        Add a comment ID to the forum's comment list.
        
        Args:
            comment_id (str): ID of the comment to add
        """
        if comment_id not in self.yorum_ids:
            self.yorum_ids.append(comment_id)

    def add_photo(self, photo_url: str):
        """
        Add a photo URL to the forum's photo list.
        
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

    def __repr__(self):
        return f"ForumModel(forum_id={self.forum_id}, baslik={self.baslik})"
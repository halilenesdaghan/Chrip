"""
Media Model
---------
Represents media file data structure.
"""

from datetime import datetime
from app.models.BaseModel import BaseModel

class MediaModel(BaseModel):
    """
    Media model that maps to DynamoDB table 'Media'
    
    Attributes:
        media_id (str): Primary hash key - media identifier
        dosya_adi (str): File name in storage
        orijinal_dosya_adi (str): Original file name
        mime_type (str): File MIME type
        boyut (int): File size in bytes
        dosya_url (str): File URL
        depolama_yolu (str): Storage path
        depolama_tipi (str): Storage type (s3 or local)
        yukleyen_id (str): User ID who uploaded the file
        yuklenme_tarihi (str): Upload date (ISO format)
        ilgili_model (str): Related model type (forum, comment, user, group, poll)
        ilgili_id (str): Related model ID
        aciklama (str): File description
        meta_data (dict): Additional metadata
    """
    
    def __init__(self,
                 media_id="",
                 dosya_adi="",
                 orijinal_dosya_adi="",
                 mime_type="",
                 boyut=0,
                 dosya_url="",
                 depolama_yolu="",
                 depolama_tipi="local",
                 yukleyen_id="",
                 yuklenme_tarihi=None,
                 ilgili_model=None,
                 ilgili_id=None,
                 aciklama=None,
                 meta_data=None,
                 is_active=True,
                 created_at=None,
                 updated_at=None):
        super().__init__(created_at, updated_at, is_active)
        self.media_id = media_id
        self.dosya_adi = dosya_adi
        self.orijinal_dosya_adi = orijinal_dosya_adi
        self.mime_type = mime_type
        self.boyut = boyut
        self.dosya_url = dosya_url
        self.depolama_yolu = depolama_yolu
        self.depolama_tipi = depolama_tipi
        self.yukleyen_id = yukleyen_id
        self.yuklenme_tarihi = yuklenme_tarihi or self.created_at
        self.ilgili_model = ilgili_model
        self.ilgili_id = ilgili_id
        self.aciklama = aciklama
        self.meta_data = meta_data or {}
    
    def is_image(self):
        """Check if file is an image"""
        return self.mime_type.startswith('image/')
    
    def is_document(self):
        """Check if file is a document"""
        document_types = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv'
        ]
        return self.mime_type in document_types
    
    def get_file_extension(self):
        """Get file extension"""
        if '.' in self.orijinal_dosya_adi:
            return self.orijinal_dosya_adi.rsplit('.', 1)[1].lower()
        return ''
    
    def get_file_size_formatted(self):
        """Get formatted file size (KB, MB, GB)"""
        if self.boyut is None:
            return 'Bilinmiyor'
            
        size_bytes = self.boyut
        
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024 or unit == 'GB':
                break
            size_bytes /= 1024
            
        return f"{size_bytes:.2f} {unit}"
    
    def to_dict(self):
        """Return a dictionary representation with additional fields"""
        data = super().to_dict()
        data['dosya_boyutu_formatli'] = self.get_file_size_formatted()
        data['dosya_uzantisi'] = self.get_file_extension()
        data['resim_mi'] = self.is_image()
        data['dokuman_mi'] = self.is_document()
        return data

    def __dict__(self):
        """For compatibility with original code"""
        return self.to_dict()
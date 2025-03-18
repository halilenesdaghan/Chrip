from datetime import datetime
import uuid
from typing import List, Dict, Optional

class GroupMember:
    """
    Represents a member within a group
    """
    def __init__(
        self,
        kullanici_id: str,
        rol: str = 'uye',
        katilma_tarihi: Optional[str] = None,
        durum: str = 'aktif'
    ):
        self.kullanici_id = kullanici_id
        self.rol = rol
        self.katilma_tarihi = katilma_tarihi or datetime.now().isoformat()
        self.durum = durum

    def to_dict(self) -> Dict[str, str]:
        """
        Convert group member to dictionary
        
        Returns:
            Dict: Member information
        """
        return {
            'kullanici_id': self.kullanici_id,
            'rol': self.rol,
            'katilma_tarihi': self.katilma_tarihi,
            'durum': self.durum
        }

class GroupModel:
    """
    Group model representing a user group in the system
    
    Attributes:
        group_id (str): Unique identifier for the group
        grup_adi (str): Group name
        aciklama (str): Group description
        olusturan_id (str): ID of the user who created the group
        olusturulma_tarihi (str): Group creation timestamp
        logo_url (str, optional): Group logo URL
        kapak_resmi_url (str, optional): Group cover image URL
        gizlilik (str): Group privacy setting
        kategoriler (List[str]): Group categories
        uyeler (List[GroupMember]): List of group members
        uye_sayisi (int): Number of active members
        is_active (bool): Group active status
    """
    def __init__(
        self,
        group_id: str = "",
        grup_adi: str = "",
        aciklama: str = "",
        olusturan_id: str = "",
        olusturulma_tarihi: str = "",
        logo_url: Optional[str] = None,
        kapak_resmi_url: Optional[str] = None,
        gizlilik: str = 'acik',
        kategoriler: Optional[List[str]] = None,
        uyeler: Optional[List[Dict]] = None,
        uye_sayisi: int = 1,
        is_active: bool = True
    ):
        # Generate unique group ID if not provided
        self.group_id = group_id or f"grp_{str(uuid.uuid4())}"
        
        self.grup_adi = grup_adi
        self.aciklama = aciklama
        self.olusturan_id = olusturan_id
        self.olusturulma_tarihi = olusturulma_tarihi or datetime.now().isoformat()
        self.logo_url = logo_url
        self.kapak_resmi_url = kapak_resmi_url
        self.gizlilik = gizlilik
        self.kategoriler = kategoriler or []
        self.is_active = is_active
        
        # Convert member dictionaries to GroupMember objects
        self.uyeler = [
            GroupMember(**member) if isinstance(member, dict) else member 
            for member in (uyeler or [])
        ]
        
        # Set initial member count, ensuring at least the creator is counted
        self.uye_sayisi = max(1, uye_sayisi)

    def to_dict(self) -> Dict[str, any]:
        """
        Convert group model to dictionary
        
        Returns:
            Dict: Group data dictionary
        """
        return {
            'group_id': self.group_id,
            'grup_adi': self.grup_adi,
            'aciklama': self.aciklama,
            'olusturan_id': self.olusturan_id,
            'olusturulma_tarihi': self.olusturulma_tarihi,
            'logo_url': self.logo_url,
            'kapak_resmi_url': self.kapak_resmi_url,
            'gizlilik': self.gizlilik,
            'kategoriler': self.kategoriler,
            'uyeler': [uye.to_dict() for uye in self.uyeler],
            'uye_sayisi': self.uye_sayisi,
            'is_active': self.is_active
        }

    def add_member(
        self, 
        kullanici_id: str, 
        rol: str = 'uye', 
        durum: str = 'aktif'
    ) -> bool:
        """
        Add a new member to the group
        
        Args:
            kullanici_id (str): User ID to add
            rol (str, optional): User's role in the group
            durum (str, optional): Membership status
        
        Returns:
            bool: Whether member was successfully added
        """
        # Check if user is already a member
        for uye in self.uyeler:
            if uye.kullanici_id == kullanici_id:
                # Update existing member
                uye.rol = rol
                uye.durum = durum
                return True
        
        # Add new member
        new_member = GroupMember(
            kullanici_id=kullanici_id,
            rol=rol,
            durum=durum
        )
        self.uyeler.append(new_member)
        
        # Increment member count if member is active
        if durum == 'aktif':
            self.uye_sayisi += 1
        
        return True

    def remove_member(self, kullanici_id: str) -> bool:
        """
        Remove a member from the group
        
        Args:
            kullanici_id (str): User ID to remove
        
        Returns:
            bool: Whether member was successfully removed
        """
        # Prevent group creator from being removed
        if kullanici_id == self.olusturan_id:
            return False
        
        # Find and remove the member
        for i, uye in enumerate(self.uyeler):
            if uye.kullanici_id == kullanici_id:
                # Decrement member count if member was active
                if uye.durum == 'aktif':
                    self.uye_sayisi = max(1, self.uye_sayisi - 1)
                
                # Remove the member
                del self.uyeler[i]
                return True
        
        return False

    def __repr__(self):
        return f"GroupModel(group_id={self.group_id}, grup_adi={self.grup_adi})"
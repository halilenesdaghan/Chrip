from datetime import datetime, timedelta
import uuid
from typing import List, Dict, Optional

class PollOption:
    """
    Represents a single option in a poll
    """
    def __init__(
        self,
        option_id: str = "",
        metin: str = "",
        oy_sayisi: int = 0
    ):
        self.option_id = option_id or str(uuid.uuid4())
        self.metin = metin
        self.oy_sayisi = oy_sayisi

    def to_dict(self) -> Dict[str, any]:
        """
        Convert poll option to dictionary
        
        Returns:
            Dict: Option data
        """
        return {
            'option_id': self.option_id,
            'metin': self.metin,
            'oy_sayisi': self.oy_sayisi
        }

class PollVote:
    """
    Represents a single vote in a poll
    """
    def __init__(
        self,
        kullanici_id: str,
        secenek_id: str,
        tarih: Optional[str] = None
    ):
        self.kullanici_id = kullanici_id
        self.secenek_id = secenek_id
        self.tarih = tarih or datetime.now().isoformat()

    def to_dict(self) -> Dict[str, str]:
        """
        Convert poll vote to dictionary
        
        Returns:
            Dict: Vote data
        """
        return {
            'kullanici_id': self.kullanici_id,
            'secenek_id': self.secenek_id,
            'tarih': self.tarih
        }

class PollModel:
    """
    Poll model representing a survey or voting mechanism
    
    Attributes:
        poll_id (str): Unique identifier for the poll
        header (str): Poll title
        description (str, optional): Poll description
        creator_id (str): ID of the user who created the poll
        created_at (str): Poll creation timestamp
        bitis_tarihi (str, optional): Poll closing timestamp
        secenekler (List[PollOption]): List of poll options
        oylar (List[PollVote]): List of votes
        university (str, optional): Associated university
        category (str, optional): Poll category
        is_active (bool): Poll active status
    """
    def __init__(
        self,
        poll_id: str = "",
        header: str = "",
        description: Optional[str] = None,
        creator_id: str = "",
        created_at: Optional[str] = None,
        bitis_tarihi: Optional[str] = None,
        secenekler: Optional[List[Dict[str, any]]] = None,
        oylar: Optional[List[Dict[str, any]]] = None,
        university: Optional[str] = None,
        category: Optional[str] = None,
        is_active: bool = True
    ):
        # Generate unique poll ID if not provided
        self.poll_id = poll_id or f"pol_{str(uuid.uuid4())}"
        
        self.header = header
        self.description = description or ""
        self.creator_id = creator_id
        self.created_at = created_at or datetime.now().isoformat()
        self.bitis_tarihi = bitis_tarihi
        self.university = university
        self.category = category
        self.is_active = is_active
        
        # Convert option dictionaries to PollOption objects
        self.secenekler = [
            PollOption(**option) if isinstance(option, dict) else option 
            for option in (secenekler or [])
        ]
        
        # Convert vote dictionaries to PollVote objects
        self.oylar = [
            PollVote(**vote) if isinstance(vote, dict) else vote 
            for vote in (oylar or [])
        ]

    def add_option(self, metin: str) -> str:
        """
        Add a new option to the poll
        
        Args:
            metin (str): Option text
        
        Returns:
            str: Added option's ID
        """
        option = PollOption(metin=metin)
        self.secenekler.append(option)
        return option.option_id

    def add_vote(self, kullanici_id: str, secenek_id: str) -> bool:
        """
        Add a vote to the poll
        
        Args:
            kullanici_id (str): User ID voting
            secenek_id (str): Selected option ID
        
        Returns:
            bool: Whether vote was successfully added
        """
        # Check if option exists
        option_exists = any(option.option_id == secenek_id for option in self.secenekler)
        if not option_exists:
            return False
        
        # Remove previous vote by this user if exists
        self.oylar = [vote for vote in self.oylar if vote.kullanici_id != kullanici_id]
        
        # Add new vote
        new_vote = PollVote(kullanici_id=kullanici_id, secenek_id=secenek_id)
        self.oylar.append(new_vote)
        
        # Update option vote count
        for option in self.secenekler:
            if option.option_id == secenek_id:
                option.oy_sayisi += 1
            
        return True

    def is_active_poll(self) -> bool:
        """
        Check if the poll is currently active
        
        Returns:
            bool: Whether the poll is active
        """
        # If no end date, poll is active
        if not self.bitis_tarihi:
            return True
        
        # Check if current time is before end time
        return datetime.now() < datetime.fromisoformat(self.bitis_tarihi)

    def get_results(self) -> List[Dict[str, any]]:
        """
        Get poll voting results
        
        Returns:
            List[Dict]: Poll option results
        """
        return [
            {
                'option_id': option.option_id,
                'metin': option.metin,
                'oy_sayisi': option.oy_sayisi
            }
            for option in self.secenekler
        ]

    def to_dict(self) -> Dict[str, any]:
        """
        Convert poll model to dictionary
        
        Returns:
            Dict: Poll data dictionary
        """
        return {
            'poll_id': self.poll_id,
            'header': self.header,
            'description': self.description,
            'creator_id': self.creator_id,
            'created_at': self.created_at,
            'bitis_tarihi': self.bitis_tarihi,
            'university': self.university,
            'category': self.category,
            'is_active': self.is_active_poll(),
            'secenekler': [option.to_dict() for option in self.secenekler],
            'oylar': [vote.to_dict() for vote in self.oylar]
        }

    def __repr__(self):
        return f"PollModel(poll_id={self.poll_id}, header={self.header})"
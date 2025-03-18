"""
Base Model Class
----------------
Common attributes and functionality for all models.
"""

from datetime import datetime

class BaseModel:
    """
    Base model for all data models.
    
    Attributes:
        created_at (str): Creation timestamp (ISO format)
        updated_at (str): Last update timestamp (ISO format)
        is_active (bool): Whether the record is active or soft-deleted
    """
    
    def __init__(self, 
                 created_at=None, 
                 updated_at=None, 
                 is_active=True):
        # Set default timestamps if not provided
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or self.created_at
        self.is_active = is_active
    
    def to_dict(self):
        """Convert model to dictionary."""
        return vars(self)
    
    def soft_delete(self):
        """Mark the record as inactive (soft delete)."""
        self.is_active = False
        self.updated_at = datetime.now().isoformat()
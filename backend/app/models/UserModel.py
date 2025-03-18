from datetime import datetime, timedelta
import uuid

class UserModel:
    """
    User model representing user attributes in the system.
    
    Attributes:
        user_id (str): Unique identifier for the user
        email (str): User's email address
        username (str): User's username
        password_hash (str): Hashed password
        role (str): User's role in the system
        is_active (bool): User account status
        created_at (str): Account creation timestamp
        last_login (str): Last login timestamp
        universite (str, optional): User's university
        profile_image_url (str, optional): URL of user's profile image
    """
    def __init__(
        self,
        user_id: str = "",
        email: str = "",
        username: str = "",
        password_hash: str = "",
        role: str = "user",
        is_active: bool = True,
        created_at: str = "",
        last_login: str = "",
        universite: str = "",
        profile_image_url: str = "",
        groups: list = None,
        forums: list = None,
        polls: list = None
    ):
        self.user_id = user_id or f"usr_{str(uuid.uuid4())}"
        self.email = email
        self.username = username
        self.password_hash = password_hash
        self.role = role
        self.is_active = is_active
        self.created_at = created_at or datetime.now().isoformat()
        self.last_login = last_login
        self.universite = universite
        self.profile_image_url = profile_image_url
        
        # Lists of related resources
        self.groups = groups or []
        self.forums = forums or []
        self.polls = polls or []

    def to_dict(self):
        """
        Convert user model to dictionary, excluding sensitive information.
        
        Returns:
            dict: User data dictionary
        """
        return {
            'user_id': self.user_id,
            'email': self.email,
            'username': self.username,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at,
            'last_login': self.last_login,
            'universite': self.universite,
            'profile_image_url': self.profile_image_url,
            'groups': self.groups,
            'forums': self.forums,
            'polls': self.polls
        }

    def add_group(self, group_id: str):
        """Add a group to user's group list"""
        if group_id not in self.groups:
            self.groups.append(group_id)

    def add_forum(self, forum_id: str):
        """Add a forum to user's forum list"""
        if forum_id not in self.forums:
            self.forums.append(forum_id)

    def add_poll(self, poll_id: str):
        """Add a poll to user's poll list"""
        if poll_id not in self.polls:
            self.polls.append(poll_id)

    def __repr__(self):
        return f"UserModel(user_id={self.user_id}, username={self.username}, email={self.email})"
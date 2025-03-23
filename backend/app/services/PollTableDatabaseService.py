import os
import uuid
import boto3
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from botocore.exceptions import ClientError

from app.models.PollModel import PollModel, PollOption, PollVote

DEFAULT_REGION = os.getenv('AWS_DEFAULT_REGION')
DEFAULT_POLLS_TABLE_NAME = os.getenv('POLLS_TABLE_NAME', 'Polls')

class PollDatabaseService:
    def __init__(
        self, 
        region_name: str = DEFAULT_REGION, 
        table_name: str = DEFAULT_POLLS_TABLE_NAME
    ):
        """
        Initialize DynamoDB Poll Service
        
        Args:
            region_name (str): AWS region
            table_name (str): DynamoDB table name
        """
        # AWS Credentials
        self.access_key = os.getenv('AWS_ACCESS_KEY_ID', '').strip()
        self.secret_key = os.getenv('AWS_SECRET_ACCESS_KEY', '').strip()
        
        if not self.access_key or not self.secret_key:
            raise ValueError("AWS credentials must be provided")
        
        # Setup AWS Resources
        self.session = boto3.Session(
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=region_name
        )
        self.dynamodb = self.session.resource('dynamodb')
        self.table = self.dynamodb.Table(table_name)

    def create_poll(
        self, 
        user_id: str, 
        header: str, 
        secenekler: List[str],
        description: Optional[str] = None,
        bitis_tarihi: Optional[str] = None,
        university: Optional[str] = None,
        category: Optional[str] = None
    ) -> PollModel:
        """
        Create a new poll in the database
        
        Args:
            user_id (str): ID of the user creating the poll
            header (str): Poll title
            secenekler (List[str]): List of poll options
            description (str, optional): Poll description
            bitis_tarihi (str, optional): Poll end date
            university (str, optional): Associated university
            category (str, optional): Poll category
        
        Returns:
            PollModel: Created poll object
        
        Raises:
            ValueError: If poll creation fails
        """
        # Validate inputs
        if len(secenekler) < 2:
            raise ValueError("En az iki seçenek gereklidir")
        
        # Generate unique poll ID
        poll_id = f"pol_{str(uuid.uuid4())}"
        
        # Prepare poll options
        poll_options = [
            {
                'option_id': str(uuid.uuid4()),
                'metin': secenek,
                'oy_sayisi': 0
            }
            for secenek in secenekler
        ]
        
        # Validate end date if provided
        if bitis_tarihi:
            try:
                end_date = datetime.fromisoformat(bitis_tarihi)
                if end_date <= datetime.now():
                    raise ValueError("Bitiş tarihi gelecekte olmalıdır")
            except ValueError:
                raise ValueError("Geçersiz tarih formatı. ISO 8601 formatı kullanın")
        
        # Prepare poll data
        poll_data = {
            'poll_id': poll_id,
            'header': header,
            'description': description or '',
            'creator_id': user_id,
            'created_at': datetime.now().isoformat(),
            'bitis_tarihi': bitis_tarihi,
            'secenekler': poll_options,
            'oylar': [],
            'university': university,
            'category': category,
            'is_active': True
        }
        
        # Save to DynamoDB
        try:
            self.table.put_item(Item=poll_data)
        except ClientError as e:
            raise ValueError(f"Error creating poll: {e}")
        
        return PollModel(**poll_data)

    def get_poll_by_id(self, poll_id: str) -> Optional[PollModel]:
        """
        Get poll by its ID
        
        Args:
            poll_id (str): Poll's unique identifier
        
        Returns:
            Optional[PollModel]: Poll object if found, else None
        """
        try:
            response = self.table.get_item(
                Key={'poll_id': poll_id}
            )
            
            poll_item = response.get('Item')
            return PollModel(**poll_item) if poll_item else None
        
        except ClientError:
            return None

    def get_polls(
        self, 
        page: int = 1, 
        per_page: int = 10,
        category: Optional[str] = None,
        university: Optional[str] = None,
        aktif: Optional[bool] = None
    ) -> Dict[str, any]:
        """
        Retrieve polls with optional filtering and pagination
        
        Args:
            page (int): Page number
            per_page (int): Polls per page
            category (str, optional): Filter by category
            university (str, optional): Filter by university
            aktif (bool, optional): Filter by active status
        
        Returns:
            Dict containing polls and metadata
        """
        try:
            # Base scan parameters
            scan_params = {
                'FilterExpression': 'is_active = :active',
                'ExpressionAttributeValues': {':active': True}
            }
            
            # Add category filter if provided
            if category:
                scan_params['FilterExpression'] += ' AND category = :category'
                scan_params['ExpressionAttributeValues'][':category'] = category
            
            # Add university filter if provided
            if university:
                scan_params['FilterExpression'] += ' AND university = :university'
                scan_params['ExpressionAttributeValues'][':university'] = university
            
            # Perform scan
            response = self.table.scan(**scan_params)
            
            # Process and paginate results
            items = response.get('Items', [])
            
            # Additional filtering for aktif status
            if aktif is not None:
                now = datetime.now()
                items = [
                    item for item in items 
                    if (aktif and (not item.get('bitis_tarihi') or datetime.fromisoformat(item['bitis_tarihi']) > now)) or
                       (not aktif and item.get('bitis_tarihi') and datetime.fromisoformat(item['bitis_tarihi']) <= now)
                ]
            
            total_count = len(items)
            
            # Apply pagination
            start_index = (page - 1) * per_page
            end_index = start_index + per_page
            paginated_items = items[start_index:end_index]
            
            # Convert to PollModel objects
            polls = [PollModel(**item) for item in paginated_items]
            
            return {
                'polls': [poll.to_dict() for poll in polls],
                'meta': {
                    'total': total_count,
                    'page': page,
                    'per_page': per_page,
                    'total_pages': (total_count + per_page - 1) // per_page
                }
            }
        
        except ClientError:
            return {
                'polls': [],
                'meta': {
                    'total': 0,
                    'page': page,
                    'per_page': per_page,
                    'total_pages': 0
                }
            }

    def update_poll(self, 
        poll_id: str, 
        user_id: str, 
        update_data: Dict[str, any]
    ) -> Optional[PollModel]:
        """
        Update an existing poll
        
        Args:
            poll_id (str): Poll's unique identifier
            user_id (str): User attempting to update the poll
            update_data (Dict): Data to update
        
        Returns:
            Optional[PollModel]: Updated poll object
        
        Raises:
            ValueError: If update fails or user is not authorized
        """
        try:
            # Retrieve existing poll
            poll = self.get_poll_by_id(poll_id)
            
            if not poll:
                raise ValueError("Poll not found")
            
            # Check authorization
            if poll.creator_id != user_id:
                raise ValueError("Not authorized to update this poll")
            
            # Prepare update expression and values
            update_expr = []
            expr_attr_values = {}
            
            # Updatable fields
            updatable_fields = ['header', 'description', 'bitis_tarihi', 'category']
            
            for field in updatable_fields:
                if field in update_data and update_data[field] is not None:
                    # Special handling for date fields
                    if field == 'bitis_tarihi':
                        try:
                            end_date = datetime.fromisoformat(update_data[field])
                            if end_date <= datetime.now():
                                raise ValueError("Bitiş tarihi gelecekte olmalıdır")
                        except ValueError:
                            raise ValueError("Geçersiz tarih formatı. ISO 8601 formatı kullanın")
                    
                    update_expr.append(f"{field} = :{field}")
                    expr_attr_values[f":{field}"] = update_data[field]
            
            # Handle poll options separately
            if 'secenekler' in update_data:
                secenekler = update_data['secenekler']
                
                if len(secenekler) < 2:
                    raise ValueError("En az iki seçenek gereklidir")
                
                # Prepare new options with IDs
                new_options = [
                    {
                        'option_id': str(uuid.uuid4()),
                        'metin': secenek,
                        'oy_sayisi': 0
                    }
                    for secenek in secenekler
                ]
                
                update_expr.append('secenekler = :secenekler')
                expr_attr_values[':secenekler'] = new_options
            
            if not update_expr:
                return poll
            
            # Construct full update expression
            full_update_expr = "SET " + ", ".join(update_expr)
            
            # Perform update
            self.table.update_item(
                Key={'poll_id': poll_id},
                UpdateExpression=full_update_expr,
                ExpressionAttributeValues=expr_attr_values
            )
            
            # Retrieve and return updated poll
            updated_poll = self.get_poll_by_id(poll_id)
            return updated_poll
        
        except ClientError as e:
            raise ValueError(f"Error updating poll: {e}")

    def delete_poll(
        self, 
        poll_id: str, 
        user_id: str
    ) -> bool:
        """
        Soft delete a poll
        
        Args:
            poll_id (str): Poll's unique identifier
            user_id (str): User attempting to delete the poll
        
        Returns:
            bool: Whether deletion was successful
        
        Raises:
            ValueError: If deletion fails or user is not authorized
        """
        try:
            # Retrieve existing poll
            poll = self.get_poll_by_id(poll_id)
            
            if not poll:
                raise ValueError("Poll not found")
            
            # Check authorization
            if poll.creator_id != user_id:
                raise ValueError("Not authorized to delete this poll")
            
            # Perform soft delete
            self.table.update_item(
                Key={'poll_id': poll_id},
                UpdateExpression='SET is_active = :false',
                ExpressionAttributeValues={':false': False}
            )
            
            return True
        
        except ClientError as e:
            raise ValueError(f"Error deleting poll: {e}")

    def vote_poll(
        self, 
        poll_id: str, 
        user_id: str, 
        option_id: str
    ) -> Dict[str, any]:
        """
        Cast a vote in a poll
        
        Args:
            poll_id (str): Poll's unique identifier
            user_id (str): User voting in the poll
            option_id (str): Selected option ID
        
        Returns:
            Dict: Voting results
        
        Raises:
            ValueError: If voting fails
        """
        try:
            # Retrieve existing poll
            poll = self.get_poll_by_id(poll_id)
            
            if not poll:
                raise ValueError("Poll not found")
            
            # Check poll activity
            if not poll.is_active_poll():
                raise ValueError("This poll is no longer active")
            
            # Verify option exists
            option_exists = any(option.option_id == option_id for option in poll.secenekler)
            if not option_exists:
                raise ValueError("Invalid poll option")
            
            # Prepare vote update
            update_params = {
                'Key': {'poll_id': poll_id},
                'UpdateExpression': 'SET oylar = list_append(oylar, :new_vote)',
                'ExpressionAttributeValues': {
                    ':new_vote': [{
                        'kullanici_id': user_id,
                        'secenek_id': option_id,
                        'tarih': datetime.now().isoformat()
                    }]
                }
            }
            
            # Remove previous votes by this user
            remove_prev_vote_expr = [
                f'secenekler[{i}].oy_sayisi = secenekler[{i}].oy_sayisi - :decrement ' 
                for i in range(len(poll.secenekler))
            ]
            
            if remove_prev_vote_expr:
                update_params['UpdateExpression'] += ' REMOVE ' + ', '.join(
                    f'oylar[{i}]' 
                    for i in range(len(poll.oylar))
                    if poll.oylar[i].kullanici_id == user_id
                )
                
                # Increment selected option's vote count
                for i, option in enumerate(poll.secenekler):
                    if option.option_id == option_id:
                        update_params['UpdateExpression'] += f', secenekler[{i}].oy_sayisi = secenekler[{i}].oy_sayisi + :increment'
                        update_params['ExpressionAttributeValues'][':increment'] = 1
                
                # Decrement for other options where user might have voted
                update_params['ExpressionAttributeValues'][':decrement'] = 1
            
            # Perform update
            self.table.update_item(**update_params)
            
            # Retrieve updated poll results
            updated_poll = self.get_poll_by_id(poll_id)
            
            return {
                'message': 'Oy başarıyla kaydedildi',
                'results': updated_poll.get_results()
            }
        
        except ClientError as e:
            raise ValueError(f"Error voting in poll: {e}")

    def get_poll_results(
        self, 
        poll_id: str
    ) -> Dict[str, any]:
        """
        Retrieve poll results
        
        Args:
            poll_id (str): Poll's unique identifier
        
        Returns:
            Dict: Poll results and metadata
        
        Raises:
            ValueError: If retrieving results fails
        """
        try:
            # Retrieve poll
            poll = self.get_poll_by_id(poll_id)
            
            if not poll:
                raise ValueError("Poll not found")
            
            return {
                'poll': {
                    'poll_id': poll.poll_id,
                    'header': poll.header,
                    'description': poll.description,
                    'aktif': poll.is_active_poll()
                },
                'results': poll.get_results(),
                'total_votes': sum(option.oy_sayisi for option in poll.secenekler)
            }
        
        except ClientError as e:
            raise ValueError(f"Error retrieving poll results: {e}")
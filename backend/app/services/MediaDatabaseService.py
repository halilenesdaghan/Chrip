"""
Media Database Service
-------------------
DynamoDB service for media file data.
"""

import boto3
from boto3.dynamodb.conditions import Attr, Key
import logging
import os
from werkzeug.utils import secure_filename
from datetime import datetime
from botocore.exceptions import ClientError
from app.utils.exceptions import NotFoundError, ValidationError, ForbiddenError
from app.models.MediaModel import MediaModel


class MediaDatabaseService:
    """Database service for media operations"""
    
    def __init__(self, region_name=None, table_name="Media"):
        pass
    
    def create_tables(self):
        """Create Media table if it doesn't exist"""
        try:
            # Check if table exists
            self.dynamodb_client.describe_table(TableName=self.table_name)
            self.logger.info(f"Table {self.table_name} already exists")
        except self.dynamodb_client.exceptions.ResourceNotFoundException:
            # Create table
            self.logger.info(f"Creating table {self.table_name}")
            self.dynamodb_client.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {'AttributeName': 'media_id', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'media_id', 'AttributeType': 'S'}
                ],
                ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            )
            
            # Wait for table to be created
            waiter = self.dynamodb_client.get_waiter('table_exists')
            waiter.wait(TableName=self.table_name)
    
    def allowed_file(self, filename):
        """Check if file has an allowed extension"""
        from flask import current_app
        
        if '.' not in filename:
            return False
        
        ext = filename.rsplit('.', 1)[1].lower()
        return ext in current_app.config['ALLOWED_EXTENSIONS']
    
    def upload_file(self, file, user_id, metadata=None):
        """Upload a file and save its metadata"""
        from flask import current_app
        
        try:
            if not file:
                raise ValidationError("Dosya bulunamadı")
            
            # Check file format
            if not self.allowed_file(file.filename):
                raise ValidationError("Geçersiz dosya formatı")
            
            # Secure filename
            filename = secure_filename(file.filename)
            
            # Generate unique filename
            unique_filename = f"{self.generate_id()}-{filename}"
            
            # Prepare metadata
            file_metadata = metadata or {}
            model_type = file_metadata.get('model_type', 'genel')
            
            # Determine storage path
            s3_folder = f"uploads/{model_type}/{datetime.now().strftime('%Y/%m/%d')}"
            
            # Store in S3 or local filesystem
            if current_app.config.get('AWS_ACCESS_KEY_ID') and current_app.config.get('S3_BUCKET_NAME'):
                # S3 storage logic will be implemented here
                # For now, we'll use local storage
                storage_path = f"{s3_folder}/{unique_filename}"
                file_url = f"/uploads/{storage_path}"
                storage_type = 's3'
            else:
                # Local storage
                upload_folder = current_app.config['UPLOAD_FOLDER']
                folder_path = os.path.join(upload_folder, s3_folder)
                
                # Create directory if it doesn't exist
                os.makedirs(folder_path, exist_ok=True)
                
                file_path = os.path.join(folder_path, unique_filename)
                file.save(file_path)
                
                storage_path = file_path
                file_url = f"/uploads/{s3_folder}/{unique_filename}"
                storage_type = 'local'
            
            # Create media record
            now = self.get_timestamp()
            media_id = self.generate_id('med')
            
            media = MediaModel(
                media_id=media_id,
                dosya_adi=unique_filename,
                orijinal_dosya_adi=filename,
                mime_type=file.content_type,
                boyut=file.content_length if hasattr(file, 'content_length') else 0,
                dosya_url=file_url,
                depolama_yolu=storage_path,
                depolama_tipi=storage_type,
                yukleyen_id=user_id,
                yuklenme_tarihi=now,
                ilgili_model=metadata.get('model_type'),
                ilgili_id=metadata.get('model_id'),
                description=metadata.get('description'),
                created_at=now,
                updated_at=now
            )
            
            # Save media metadata to DynamoDB
            self.table.put_item(Item=media.to_dict())
            
            return media.to_dict()
            
        except ClientError as e:
            self.logger.error(f"Error uploading file: {e}")
            raise ValidationError("Dosya yükleme hatası")
    
    def delete_file(self, file_info, user_id=None):
        """Delete a file"""
        try:
            # Check permission if user_id provided
            if user_id and file_info.get('yukleyen_id') != user_id:
                # TODO: Add admin check here
                raise ForbiddenError("Bu dosyayı silme yetkiniz yok")
            
            # Handle file deletion based on storage type
            if file_info.get('depolama_tipi') == 's3':
                # S3 deletion logic will be implemented here
                # For now, just return success
                pass
            else:
                # Local file deletion
                file_path = file_info.get('depolama_yolu')
                if os.path.exists(file_path):
                    os.remove(file_path)
            
            # Delete metadata from database
            # This assumes file_info contains 'media_id'
            if 'media_id' in file_info:
                self.table.delete_item(
                    Key={'media_id': file_info['media_id']}
                )
            
            return True
            
        except ClientError as e:
            self.logger.error(f"Error deleting file: {e}")
            raise ValidationError("Dosya silme hatası")
    
    def get_file_url(self, file_info, expires=3600):
        """Get URL for file access"""
        # For S3, generate a presigned URL
        if file_info.get('depolama_tipi') == 's3':
            # S3 presigned URL logic would be implemented here
            # For now, just return the URL
            return file_info.get('dosya_url')
        else:
            # For local files, just return the URL
            return file_info.get('dosya_url')
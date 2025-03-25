import os
import boto3
import uuid
from botocore.exceptions import ClientError
import traceback

DEFAULT_REGION = os.getenv('AWS_DEFAULT_REGION')
DEFAULT_BUCKET = os.getenv('S3_BUCKET_NAME')

class MediaService:

    __instance = None

    @staticmethod
    def get_instance():
        if MediaService.__instance is None:
            MediaService()
        return MediaService.__instance
    
    def __init__(self,
                    s3_bucket: str = DEFAULT_BUCKET,
                    region: str = DEFAULT_REGION,
                    s3_public: bool = True):
        if MediaService.__instance is not None:
            raise Exception("This class is a singleton!")
        else:
            MediaService.__instance = self
        self.s3 = boto3.client("s3", region_name=region)
        self.region = region
        self.s3_bucket = s3_bucket
        self.s3_public = s3_public
        return
    
    def allowed_file(self, filename: str) -> bool:
        """
        Checks if the file extension is allowed.
        """
        if '.' not in filename:
            return False
        ext = filename.rsplit('.', 1)[1].lower()
        return ext in {'png', 'jpg', 'jpeg'}
    
    def generate_presigned_url(self, s3_key, expires_in=3600):
        """
        Helper method to generate a presigned URL for a private S3 object.
        """
        try:
            response = self.s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.s3_bucket, 'Key': s3_key},
                ExpiresIn=expires_in
            )
        except ClientError as e:
            raise e
        return response

    def upload_file(self,
                    file_obj,
                    user_id,
                    metadata=None):
        """
        Uploads a single file to S3.
        :param file_obj: File object to upload
        :param user_id: Uploader ID
        :param metadata: Metadata for the file
        :return: A dictionary containing the key and the S3 URL or presigned URL
        """

        print (f"Uploading file: {file_obj}", flush=True)

        extension = file_obj.filename.rsplit('.', 1)[-1] if '.' in file_obj.filename else ''
        random_filename = f"{uuid.uuid4()}.{extension}"
        model_type = metadata.get('model_type', 'general')

        s3_key = f"{model_type}/{user_id}/{random_filename}"

        try:
            extra_args = {}
            self.s3.upload_fileobj(
                Fileobj=file_obj,
                Bucket=self.s3_bucket,
                Key=s3_key,
                ExtraArgs=extra_args
            )
        except ClientError as e:
            print (traceback.format_exc(), flush=True)
            raise Exception(f"An error occurred while uploading the file: {e}")
        except Exception as e:
            print (traceback.format_exc(), flush=True)
            raise Exception(f"An error occurred while uploading the file: {e}")
        
        if self.s3_public:
            file_url = f"https://{self.s3_bucket}.s3.{self.region}.amazonaws.com/{s3_key}"
        else:
            file_url = self.generate_presigned_url(s3_key)

        return {
            's3_key': s3_key,
            'url': file_url
        }
"""
Uygulama Konfigürasyon Yönetimi
------------------------------
Çevre değişkenlerini ve yapılandırma ayarlarını yönetir.
"""

import os
from datetime import timedelta

class BaseConfig:
    """
    Temel konfigürasyon sınıfı
    Tüm ortamlar için ortak ayarları içerir
    """
    # Temel Flask ayarları
    SECRET_KEY = os.getenv('SECRET_KEY', 'gelistirme-icin-gizli-anahtar')
    DEBUG = False
    TESTING = False
    
    # API ve kimlik doğrulama ayarları
    API_PREFIX = os.getenv('API_PREFIX', '/api/v1')
    
    # JWT ayarları
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.getenv('JWT_TOKEN_HOURS', 24))
    )
    
    # Veritabanı ayarları
    DATABASE_CONFIG = {
        'region_name': os.getenv('AWS_DEFAULT_REGION', 'eu-north-1'),
        'aws_access_key_id': os.getenv('AWS_ACCESS_KEY_ID'),
        'aws_secret_access_key': os.getenv('AWS_SECRET_ACCESS_KEY'),
    }
    
    # Güvenlik ayarları
    CORS_ENABLED = os.getenv('CORS_ENABLED', 'True').lower() in ('true', '1', 'yes')
    
    # Logging ayarları
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE')
    
    # Dosya yükleme ayarları
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

class DevelopmentConfig(BaseConfig):
    """Geliştirme ortamı konfigürasyonu"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

class TestingConfig(BaseConfig):
    """Test ortamı konfigürasyonu"""
    TESTING = True
    DEBUG = True
    # Test için özel ayarlar

class ProductionConfig(BaseConfig):
    """Üretim ortamı konfigürasyonu"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'

def get_config():
    """
    Ortama göre uygun konfigürasyon sınıfını döndürür
    
    Returns:
        Konfigürasyon sınıfı
    """
    env = os.getenv('FLASK_DEBUG', 'development').lower()
    config_map = {
        'development': DevelopmentConfig,
        'testing': TestingConfig,
        'production': ProductionConfig
    }
    return config_map.get(env, DevelopmentConfig)()
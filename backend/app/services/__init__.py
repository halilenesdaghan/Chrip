"""
Veritabanı Hizmetleri Başlatma Modülü
------------------------------------
Tüm veritabanı hizmetlerini başlatır ve yapılandırır.
"""

import logging
from typing import Dict

# Veritabanı servislerini içe aktar
from app.services.UserTableDatabaseService import UserDatabaseService
from app.services.ForumTableDatabaseService import ForumDatabaseService
from app.services.CommentTableDatabaseService import CommentDatabaseService
from app.services.PollTableDatabaseService import PollDatabaseService
from app.services.GroupTableDatabaseService import GroupDatabaseService
from app.services.MediaDatabaseService import MediaDatabaseService

logger = logging.getLogger(__name__)

# Veritabanı servis örnekleri
_database_services: Dict[str, any] = {}

def initialize_database_services(app=None):
    """
    Tüm veritabanı hizmetlerini başlatır ve yapılandırır
    
    Args:
        app (Flask, optional): Flask uygulama örneği
    """
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    config = app.config.get('DATABASE_CONFIG', {}) if app else {}

    #prints the configs in yellow using ansi escape codes
    print ("\033[93m" + str(config) + "\033[0m")
    for handler in logger.handlers:
        print(f"  - {handler.__class__.__name__}")
        print(f"    Level: {logging.getLevelName(handler.level)}")
        # If it's a FileHandler, you can also print the filename:
        if isinstance(handler, logging.FileHandler):
            print(f"    File: {handler.baseFilename}")

    try:
        # Veritabanı servislerini başlat
        services = [
            ('user', UserDatabaseService),
            ('forum', ForumDatabaseService),
            ('comment', CommentDatabaseService),
            ('poll', PollDatabaseService),
            ('group', GroupDatabaseService),
            ('media', MediaDatabaseService)
        ]
        
        for service_name, ServiceClass in services:
            try:
                service_instance = ServiceClass()
                _database_services[service_name] = service_instance
                logger.info(f"{service_name.capitalize()} veritabanı servisi başlatıldı")
            except Exception as service_error:
                logger.error(f"{service_name.capitalize()} veritabanı servisi başlatılamadı: {service_error}")
        
    except Exception as e:
        logger.error(f"Veritabanı servisleri başlatılırken hata oluştu: {e}")

def get_database_service(service_name: str):
    """
    Belirli bir veritabanı servisini döndürür
    
    Args:
        service_name (str): Servis adı
    
    Returns:
        Veritabanı servisi örneği
    
    Raises:
        KeyError: Servis bulunamazsa
    """
    if service_name not in _database_services:
        raise KeyError(f"Veritabanı servisi bulunamadı: {service_name}")
    
    return _database_services[service_name]

__all__ = [
    'initialize_database_services',
    'get_database_service'
]
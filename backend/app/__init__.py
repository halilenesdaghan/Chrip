"""
Uygulama Başlatma ve Yapılandırma Modülü
--------------------------------------
Flask uygulamasını başlatır ve gerekli bileşenleri yapılandırır.
"""
import sys, io
import os
import logging
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Konfigürasyon ve hata yönetimi
from app.config import get_config
from app.middleware.error_handler import register_error_handlers

# Veritabanı hizmetlerini içe aktar
from app.services import initialize_database_services

# Blueprint'ları içe aktar
from app.api.auth import auth_bp
from app.api.user import user_bp
from app.api.forum import forum_bp
from app.api.comment import comment_bp
from app.api.poll import poll_bp
from app.api.group import group_bp
from app.api.media import media_bp

def configure_logging(app):
    """
    Uygulama için günlük kaydı yapılandırır
    
    Args:
        app (Flask): Flask uygulama örneği
    """
    # Wrap stdout in a TextIOWrapper that uses UTF-8
    sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8', errors='replace')

    # Log seviyesini ayarla
    log_level = getattr(logging, app.config['LOG_LEVEL'].upper(), logging.INFO)
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Dosyaya günlük kaydetme (isteğe bağlı)
    if app.config.get('LOG_FILE'):
        file_handler = logging.FileHandler(app.config['LOG_FILE'])
        file_handler.setLevel(log_level)
        app.logger.addHandler(file_handler)
    
    app.logger.info('Logging configured')

def create_app(config=None):
    """
    Flask uygulama örneğini oluşturur ve yapılandırır
    
    Args:
        config (object, optional): Özel konfigürasyon nesnesi
    
    Returns:
        Flask: Yapılandırılmış Flask uygulaması
    """
    # Konfigürasyonu belirle
    app_config = config or get_config()
    
    # Flask uygulama örneğini oluştur
    app = Flask(__name__)
    
    # Konfigürasyonu yükle
    app.config.from_object(app_config)
    
    # Günlük kaydını yapılandır
    configure_logging(app)
    
    
    # CORS'u etkinleştir
    if app.config.get('CORS_ENABLED', True):
        # prints CORS state in green using ansi escape codes
        print ("\033[92mCORS enabled\033[0m", flush=True)
        CORS(app)
    else:
        # prints CORS state in red using ansi escape codes
        print ("\033[91mCORS disabled\033[0m", flush=True)
    
    # JWT'yi başlat
    JWTManager(app)
    
    # prints "JWT initialized" in green using ansi escape codes
    print ("\033[92mJWT initialized\033[0m", flush=True)

    # Veritabanı hizmetlerini başlat
    initialize_database_services(app)
    
    # prints "Database services initialized" in green using ansi escape codes
    print ("\033[92mDatabase services initialized\033[0m", flush=True)
    # Blueprint'ları kaydet
    register_blueprints(app)

    # prints "Blueprints registered" in green using ansi escape codes
    print ("\033[92mBlueprints registered\033[0m", flush=True)
    
    # Hata işleyicileri kaydet
    register_error_handlers(app)
    
    # Sağlık kontrolü endpoint'i
    @app.route(f"{app.config['API_PREFIX']}/health")
    def health_check():
        return {"status": "OK", "message": "Sunucu çalışıyor"}
    
    app.logger.info(f"Uygulama {app.config['LOG_LEVEL']} modunda başlatıldı")
    
    return app

def register_blueprints(app):
    """
    Tüm blueprint'ları uygulama örneğine kaydetir
    
    Args:
        app (Flask): Flask uygulama örneği
    """
    blueprints = [
        (auth_bp, 'auth'),
        (user_bp, 'users'),
        (forum_bp, 'forums'),
        (comment_bp, 'comments'),
        (poll_bp, 'polls'),
        (group_bp, 'groups'),
        (media_bp, 'media')
    ]
    
    for blueprint, name in blueprints:
        url_prefix = f"{app.config['API_PREFIX']}/{name}"
        #prints the url_prefix in yellow using ansi escape codes
        print ("\033[93m" + url_prefix + "\033[0m", flush=True)
        app.register_blueprint(
            blueprint, 
            url_prefix=url_prefix
        )
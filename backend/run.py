"""
Uygulama Başlatma Komut Dosyası
----------------------------
Flask uygulamasını çalıştırır ve geliştirme sunucusunu başlatır.
"""

import os
import sys
import env_setter

env_setter.run()
# Proje kök dizinini Python yolu'na ekle
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '.'))
sys.path.insert(0, project_root)

from app import create_app

def main():
    """
    Uygulamayı başlatır ve geliştirme sunucusunu yapılandırır
    """
    # Uygulama örneğini oluştur
    app = create_app()
    
    # Sunucu parametrelerini ortam değişkenlerinden al
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', '5000'))
    
    # Debug modunu konfigürasyondan al
    debug = app.config.get('DEBUG', False)
    
    # Uygulamayı çalıştır
    try:
        app.logger.info(f"Sunucu {host}:{port} üzerinde başlatılıyor (Debug: {debug})")
        app.run(host=host, port=port, debug=False)
    except Exception as e:
        app.logger.error(f"Sunucu başlatılamadı: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
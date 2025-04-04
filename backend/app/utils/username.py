from app.paths import *
import json
import os
import random

def create_username_combinations_for_university(university_name):
    """
    Verilen üniversite adı için kullanıcı adı kombinasyonlarını oluşturur ve JSON dosyasına kaydeder. Dosya lokasyonunu döndürür.
    
    Args:
        university_name (str): Kullanıcı adı kombinasyonlarının oluşturulacağı üniversite adı
    
    Returns:
        str: Kullanıcı adı kombinasyonlarının kaydedildiği JSON dosyasının yolu
    """
    # Kullanıcı adı kombinasyonlarını içeren JSON dosyasını oku
    with open(USERNAMES_DATA_FILE, 'r', encoding='utf-8') as f:
        username_data = json.load(f)
    
    # Kullanıcı adı kombinasyonlarını oluştur
    colors = username_data["colors"]
    cities = username_data["cities"]
    animals = username_data["animals"]
    
    # Kombinasyonları oluştur
    combinations = []
    for color in colors:
        for city in cities:
            for animal in animals:
                combinations.append(f"{color} {city} {animal}")
        
    available_usernames_file_for_university = os.path.join(USERNAMES_DATA_DIRECTORY, f"{university_name}_available_usernames.json")

    # Kullanıcı adı kombinasyonlarını JSON dosyasına kaydet
    with open(available_usernames_file_for_university, 'w', encoding='utf-8') as f:
        json.dump(combinations, f, ensure_ascii=False, indent=4)
    
    return available_usernames_file_for_university

def get_new_username_for_university(university_name):
    """
    Verilen üniversite adı için yeni bir kullanıcı adı döndürür.
    
    Args:
        university_name (str): Kullanıcı adı kombinasyonlarının oluşturulacağı üniversite adı
    
    Returns:
        str: Yeni kullanıcı adı
    """
    available_usernames_file_for_university = os.path.join(USERNAMES_DATA_DIRECTORY, f"{university_name}_available_usernames.json")

    if not os.path.exists(available_usernames_file_for_university):
        create_username_combinations_for_university(university_name)
    
    # Kullanıcı adı kombinasyonlarını içeren JSON dosyasını oku
    with open(available_usernames_file_for_university, 'r', encoding='utf-8') as f:
        combinations = json.load(f)
    
    # Kullanıcı adı kombinasyonlarından rastgele birini seç
    new_username = random.choice(combinations)
    # Kullanıcı adı kombinasyonlarından seçilen kullanıcı adını listeden çıkar
    combinations.remove(new_username)
    # Güncellenmiş kombinasyonları JSON dosyasına kaydet
    with open(available_usernames_file_for_university, 'w', encoding='utf-8') as f:
        json.dump(combinations, f, ensure_ascii=False, indent=4)

    return new_username

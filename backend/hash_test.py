import bcrypt

def hash_password(password):
    """
    Şifreyi güvenli bir şekilde hash'ler.
    
    Args:
        password (str): Ham şifre
    
    Returns:
        str: Hash'lenmiş şifre
    """
    # Şifreyi bytes'a dönüştür
    password_bytes = password.encode('utf-8')
    
    # Salt oluştur ve şifreyi hash'le
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Hash'i string olarak döndür
    return hashed.decode('utf-8')

print (hash_password("1234567"))
# ------------------------------------
print (hash_password("1234567"))
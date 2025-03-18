import secrets
import base64
import os
import argparse

def generate_jwt_secret():
    """Generate a cryptographically secure random key suitable for JWT signing."""
    # Generate 32 bytes (256 bits) of random data
    random_bytes = secrets.token_bytes(32)
    
    # Encode as base64 for easier storage and use
    secret_key = base64.urlsafe_b64encode(random_bytes).decode('utf-8')
    
    return secret_key

def main():
    parser = argparse.ArgumentParser(description='Generate a secure JWT secret key')
    parser.add_argument('--output', '-o', type=str, help='Output file to save the key to')
    args = parser.parse_args()
    
    # Generate the new secret key
    secret_key = generate_jwt_secret()
    
    # Display the key
    print(f"New JWT Secret Key: {secret_key}")
    
    # Save to file if requested
    if args.output:
        try:
            with open(args.output, 'w') as f:
                f.write(secret_key)
            print(f"Secret key saved to: {args.output}")
            # Set restrictive permissions on the file
            os.chmod(args.output, 0o600)
            print(f"File permissions set to read/write for owner only")
        except Exception as e:
            print(f"Error saving to file: {e}")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Environment Variable Setter
--------------------------
Sets environment variables from .env file to the current virtual environment
"""

import os
import sys
import re

def load_env_variables(env_file_path):
    """
    Read environment variables from .env file
    
    Args:
        env_file_path (str): Path to the .env file
    
    Returns:
        dict: Dictionary of environment variables
    """
    env_vars = {}
    
    if not os.path.exists(env_file_path):
        print(f"Error: {env_file_path} not found.")
        return env_vars
    
    with open(env_file_path, 'r') as f:
        for line in f:
            # Remove whitespace and skip comments and empty lines
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            # Split into key and value
            match = re.match(r'^([^=]+)=(.*)$', line)
            if match:
                key = match.group(1).strip()
                value = match.group(2).strip()
                
                # Remove quotes if present
                if (value.startswith('"') and value.endswith('"')) or \
                   (value.startswith("'") and value.endswith("'")):
                    value = value[1:-1]
                
                env_vars[key] = value
    
    return env_vars

def set_environment_variables(env_vars):
    """
    Set environment variables
    
    Args:
        env_vars (dict): Dictionary of environment variables
    """
    if not env_vars:
        print("No environment variables to set.")
        return
    
    venv_activate_this = None
    
    # Check for virtual environment activation
    if 'VIRTUAL_ENV' not in os.environ:
        print("Warning: No active virtual environment detected.")
        return
    
    print("Setting environment variables:")
    for key, value in env_vars.items():
        try:
            os.environ[key] = value
            #print(f"  {key}: {value}")
        except Exception as e:
            print(f"Error setting {key}: {e}")

def run():
    """
    Main function to load and set environment variables
    """
    # Find .env file in the current directory
    
    aws_key = os.getenv('AWS_ACCESS_KEY_ID')
    current_dir = os.getcwd()
    env_file_path = os.path.join(current_dir, '.env')
    
    # Load environment variables
    env_vars = load_env_variables(env_file_path)
    
    # Set environment variables
    set_environment_variables(env_vars)
    
    print("\nEnvironment variables have been set.")

if __name__ == '__main__':
    run()
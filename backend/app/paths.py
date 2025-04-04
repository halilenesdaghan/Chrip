import os

CURRENT_DIR = os.getcwd()

DATA_DIRECTORY = os.path.join(CURRENT_DIR, 'data')
if not os.path.exists(DATA_DIRECTORY):
    os.makedirs(DATA_DIRECTORY)

USERNAMES_DATA_DIRECTORY = os.path.join(DATA_DIRECTORY, 'usernames')
if not os.path.exists(USERNAMES_DATA_DIRECTORY):
    os.makedirs(USERNAMES_DATA_DIRECTORY)

USERNAMES_DATA_FILE = os.path.join(USERNAMES_DATA_DIRECTORY, 'username_source.json')

UNIVERSITIES_DATA_DIRECTORY = os.path.join(DATA_DIRECTORY, 'universities')
if not os.path.exists(UNIVERSITIES_DATA_DIRECTORY):
    os.makedirs(UNIVERSITIES_DATA_DIRECTORY)

UNIVERSITY_EMAIL_DATA_FILE = os.path.join(UNIVERSITIES_DATA_DIRECTORY, 'universities_emails.json')
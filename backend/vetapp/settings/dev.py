import os

from vetapp.settings.base import *

DEBUG = True

SECRET_KEY = os.environ.get(
    'SECRET_KEY', 'django-insecure-stnk1fdm^$=-k5jy4$u&owort!3dnc&#r-8_r%5sogrph6tq8i'
)

ALLOWED_HOSTS = ['*']

CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS', 'http://localhost:3000'
).split(',')

CSRF_TRUSTED_ORIGINS = [
    origin
    for origin in os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',')
    if origin
]

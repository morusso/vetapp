import os
import re
from datetime import timedelta
from pathlib import Path

import django
from django.utils import cache as _django_cache

if django.VERSION >= (6, 1) and not hasattr(_django_cache, "cc_delim_re"):
    _django_cache.cc_delim_re = re.compile(r"\s*,\s*")

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-stnk1fdm^$=-k5jy4$u&owort!3dnc&#r-8_r%5sogrph6tq8i'

DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_celery_beat',
    'user',
    'clinical_data',
    'animals',
    'clients',
    'notifications',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'vetapp.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'vetapp.wsgi.application'
ASGI_APPLICATION = 'vetapp.asgi.application'

# Channels
# https://channels.readthedocs.io/en/latest/topics/channel_layers.html

CHANNELS_REDIS_URL = os.environ.get('CHANNELS_REDIS_URL', 'redis://localhost:6379/1')

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [CHANNELS_REDIS_URL],
        },
    },
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'vetapp'),
        'USER': os.environ.get('POSTGRES_USER', 'vetapp'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'vetapp'),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
        'OPTIONS': {
            'options': '-c search_path={},public'.format(
                os.environ.get('POSTGRES_SCHEMA', 'vetapp')
            ),
        },
    }
}


AUTH_USER_MODEL = 'user.User'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'


# Django REST Framework
# https://www.django-rest-framework.org/api-guide/settings/

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.URLPathVersioning',
    'ALLOWED_VERSIONS': ['v1'],
    'DEFAULT_VERSION': 'v1',
}


# CORS
# https://github.com/adamchainz/django-cors-headers

CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS', 'http://localhost:3000'
).split(',')


# Simple JWT
# https://django-rest-framework-simplejwt.readthedocs.io/en/latest/settings.html

JWT_PRIVATE_KEY_PATH = Path(
    os.environ.get('JWT_PRIVATE_KEY_PATH', BASE_DIR / 'vetapp' / 'keys' / 'private.pem')
)
JWT_PUBLIC_KEY_PATH = Path(
    os.environ.get('JWT_PUBLIC_KEY_PATH', BASE_DIR / 'vetapp' / 'keys' / 'public.pem')
)

# Email
# https://docs.djangoproject.com/en/stable/topics/email/

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'localhost')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 1025))
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'False') == 'True'
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@vetapp.local')


# AI-assisted client messaging (see notifications/ai.py)
# Runs against a local Ollama instance so clinical/client data never leaves the
# clinic's own infrastructure. Reminders fall back to their static template
# whenever this is unset (the default), so it's safe to leave unconfigured in dev/CI.

OLLAMA_BASE_URL = os.environ.get('OLLAMA_BASE_URL', '')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'qwen2.5:3b-instruct')


# Celery
# https://docs.celeryq.dev/en/stable/userguide/configuration.html

CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'


SIMPLE_JWT = {
    'ALGORITHM': 'RS256',
    'SIGNING_KEY': JWT_PRIVATE_KEY_PATH.read_text(),
    'VERIFYING_KEY': JWT_PUBLIC_KEY_PATH.read_text(),
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
}

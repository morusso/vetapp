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
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'user',
    'clinical_data',
    'animals',
    'clients',
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

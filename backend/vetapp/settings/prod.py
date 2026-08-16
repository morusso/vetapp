import os

from vetapp.settings.base import *

DEBUG = False


def _require_env(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f'{name} must be set when running with vetapp.settings.prod.')
    return value


SECRET_KEY = _require_env('SECRET_KEY')

ALLOWED_HOSTS = [host for host in _require_env('ALLOWED_HOSTS').split(',') if host]

CORS_ALLOWED_ORIGINS = [
    origin for origin in _require_env('CORS_ALLOWED_ORIGINS').split(',') if origin
]

CSRF_TRUSTED_ORIGINS = [
    origin for origin in _require_env('CSRF_TRUSTED_ORIGINS').split(',') if origin
]


# Nginx terminates TLS and forwards X-Forwarded-Proto, so Django trusts that
# header to know the original request was HTTPS (needed for SECURE_SSL_REDIRECT
# and the "secure" cookie flags to work behind a reverse proxy).

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'True') == 'True'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = int(os.environ.get('SECURE_HSTS_SECONDS', 60 * 60 * 24 * 30))
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = 'DENY'

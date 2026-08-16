"""
ASGI config for vetapp project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vetapp.settings.dev')

django_asgi_app = get_asgi_application()

# Imported after django_asgi_app is built, since routing.py pulls in models/consumers
# that need Django's app registry to already be populated.
from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402

from notifications.middleware import JWTAuthMiddleware  # noqa: E402
from notifications.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JWTAuthMiddleware(URLRouter(websocket_urlpatterns)),
})

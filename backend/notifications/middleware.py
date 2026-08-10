from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken


@database_sync_to_async
def _get_user(validated_token):
    User = get_user_model()
    try:
        return User.objects.get(pk=validated_token["user_id"], is_active=True)
    except User.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """Authenticates WebSocket connections with the same access tokens SimpleJWT issues.

    Browsers can't attach an Authorization header to a WebSocket handshake, so the
    frontend passes the access token as a query string param instead: ?token=<access>.
    """

    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope["query_string"].decode())
        token = query_string.get("token", [None])[0]

        scope["user"] = AnonymousUser()
        if token:
            try:
                validated_token = AccessToken(token)
                scope["user"] = await _get_user(validated_token)
            except (InvalidToken, TokenError):
                pass

        return await super().__call__(scope, receive, send)

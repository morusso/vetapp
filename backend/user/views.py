from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from user.serializers import ChangePasswordSerializer
from user.tokens import blacklist_tokens
from vetapp.mixins import GenericErrorHandlingMixin


class ChangePasswordView(GenericErrorHandlingMixin, APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            request.user.set_password(serializer.validated_data["new_password"])
            request.user.save(update_fields=["password"])
            blacklist_tokens(OutstandingToken.objects.filter(user=request.user))
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as err:
            return self._handle_generic_error(err)


class LogoutView(GenericErrorHandlingMixin, APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": 'The "refresh" field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            RefreshToken(refresh_token).blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response(
                {"detail": "Invalid or already revoked token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as err:
            return self._handle_generic_error(err)

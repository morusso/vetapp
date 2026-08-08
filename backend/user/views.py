from dataclasses import replace

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from src.models.user import Specialization, User
from src.repositories.user import (
    SpecializationRepository,
    UserRepository,
    specialization_to_dataclass,
)
from user.serializers import (
    ChangePasswordSerializer,
    SpecializationSerializer,
    UserSerializer,
)
from user.tokens import blacklist_tokens
from vetapp.mixins import GenericErrorHandlingMixin, RepositoryAPIViewMixin


class UserListCreateView(RepositoryAPIViewMixin, generics.ListCreateAPIView):
    repository_class = UserRepository
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        data = dict(serializer.validated_data)
        data["specializations"] = [
            specialization_to_dataclass(s) for s in data.get("specializations", [])
        ]
        serializer.instance = self.repository.add(User(**data))


class SpecializationListCreateView(RepositoryAPIViewMixin, generics.ListCreateAPIView):
    repository_class = SpecializationRepository
    serializer_class = SpecializationSerializer

    def perform_create(self, serializer):
        serializer.instance = self.repository.add(Specialization(**serializer.validated_data))


class SpecializationDetailView(RepositoryAPIViewMixin, generics.RetrieveUpdateDestroyAPIView):
    repository_class = SpecializationRepository
    serializer_class = SpecializationSerializer

    def perform_update(self, serializer):
        entity = replace(serializer.instance, **serializer.validated_data)
        serializer.instance = self.repository.update(entity)


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

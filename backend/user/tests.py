import pytest
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.tokens import RefreshToken

from user.admin import _blacklist
from user.models import Specialization

User = get_user_model()


class _ProtectedView(APIView):
    def get(self, request):
        return Response({"user": request.user.email})


@pytest.fixture
def user(db):
    return User.objects.create_user(email="vet@example.com", password="s3cr3t-pass")


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email="admin@example.com", password="s3cr3t-pass", is_staff=True
    )


@pytest.fixture
def auth_client(client, user):
    access_token = RefreshToken.for_user(user).access_token
    client.defaults["HTTP_AUTHORIZATION"] = f"Bearer {access_token}"
    return client


@pytest.fixture
def admin_client_(client, admin_user):
    access_token = RefreshToken.for_user(admin_user).access_token
    client.defaults["HTTP_AUTHORIZATION"] = f"Bearer {access_token}"
    return client


@pytest.fixture
def specialization(db):
    return Specialization.objects.create(name="Surgery")


@pytest.mark.django_db
def test_health_is_public(client):
    response = client.get("/api/v1/health/")
    assert response.status_code == 200


def test_protected_view_rejects_missing_token():
    request = APIRequestFactory().get("/protected/")
    response = _ProtectedView.as_view()(request)
    assert response.status_code == 401


def test_protected_view_rejects_garbage_token():
    request = APIRequestFactory().get(
        "/protected/", HTTP_AUTHORIZATION="Bearer garbage"
    )
    response = _ProtectedView.as_view()(request)
    assert response.status_code == 401


@pytest.mark.django_db
def test_protected_view_accepts_valid_access_token(user):
    access_token = RefreshToken.for_user(user).access_token
    request = APIRequestFactory().get(
        "/protected/", HTTP_AUTHORIZATION=f"Bearer {access_token}"
    )
    response = _ProtectedView.as_view()(request)
    assert response.status_code == 200
    assert response.data["user"] == "vet@example.com"


@pytest.mark.django_db
def test_obtain_token_pair(client, user):
    response = client.post(
        "/api/v1/token/", {"email": "vet@example.com", "password": "s3cr3t-pass"}
    )
    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_logout_blacklists_refresh_token(client, user):
    refresh = RefreshToken.for_user(user)

    response = client.post("/api/v1/user/logout/", {"refresh": str(refresh)})
    assert response.status_code == 205
    assert BlacklistedToken.objects.filter(token__jti=refresh["jti"]).exists()

    refresh_response = client.post("/api/v1/token/refresh/", {"refresh": str(refresh)})
    assert refresh_response.status_code == 401


@pytest.mark.django_db
def test_change_password_requires_authentication(client):
    response = client.post(
        "/api/v1/user/change-password/",
        {"old_password": "s3cr3t-pass", "new_password": "n3w-s3cr3t-pass"},
    )
    assert response.status_code == 401


@pytest.mark.django_db
def test_change_password_rejects_wrong_old_password(client, user):
    access_token = RefreshToken.for_user(user).access_token

    response = client.post(
        "/api/v1/user/change-password/",
        {"old_password": "wrong-pass", "new_password": "n3w-s3cr3t-pass"},
        HTTP_AUTHORIZATION=f"Bearer {access_token}",
    )

    assert response.status_code == 400
    assert "old_password" in response.data


@pytest.mark.django_db
def test_change_password_rejects_weak_new_password(client, user):
    access_token = RefreshToken.for_user(user).access_token

    response = client.post(
        "/api/v1/user/change-password/",
        {"old_password": "s3cr3t-pass", "new_password": "12345678"},
        HTTP_AUTHORIZATION=f"Bearer {access_token}",
    )

    assert response.status_code == 400
    assert "new_password" in response.data


@pytest.mark.django_db
def test_change_password_success_updates_credentials(client, user):
    access_token = RefreshToken.for_user(user).access_token

    response = client.post(
        "/api/v1/user/change-password/",
        {"old_password": "s3cr3t-pass", "new_password": "n3w-s3cr3t-pass"},
        HTTP_AUTHORIZATION=f"Bearer {access_token}",
    )
    assert response.status_code == 204

    user.refresh_from_db()
    assert user.check_password("n3w-s3cr3t-pass")

    old_login = client.post(
        "/api/v1/token/", {"email": "vet@example.com", "password": "s3cr3t-pass"}
    )
    assert old_login.status_code == 401

    new_login = client.post(
        "/api/v1/token/", {"email": "vet@example.com", "password": "n3w-s3cr3t-pass"}
    )
    assert new_login.status_code == 200


@pytest.mark.django_db
def test_change_password_blacklists_existing_refresh_tokens(client, user):
    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token

    response = client.post(
        "/api/v1/user/change-password/",
        {"old_password": "s3cr3t-pass", "new_password": "n3w-s3cr3t-pass"},
        HTTP_AUTHORIZATION=f"Bearer {access_token}",
    )
    assert response.status_code == 204

    refresh_response = client.post("/api/v1/token/refresh/", {"refresh": str(refresh)})
    assert refresh_response.status_code == 401


@pytest.mark.django_db
def test_admin_revoke_all_tokens_blacklists_every_outstanding_token(user):
    RefreshToken.for_user(user)
    RefreshToken.for_user(user)
    assert OutstandingToken.objects.filter(user=user).count() == 2

    revoked = _blacklist(OutstandingToken.objects.filter(user=user))

    assert revoked == 2
    assert BlacklistedToken.objects.filter(token__user=user).count() == 2


@pytest.mark.django_db
def test_user_list_requires_authentication(client):
    response = client.get("/api/v1/user/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_user_create_requires_admin(auth_client):
    response = auth_client.post(
        "/api/v1/user/",
        {"email": "new-vet@example.com", "password": "s3cr3t-pass-1"},
    )
    assert response.status_code == 403
    assert not User.objects.filter(email="new-vet@example.com").exists()


@pytest.mark.django_db
def test_user_create(admin_client_, specialization):
    response = admin_client_.post(
        "/api/v1/user/",
        {
            "email": "new-vet@example.com",
            "password": "s3cr3t-pass-1",
            "first_name": "Ala",
            "phone_number": "123456789",
            "specializations": [specialization.pk],
        },
    )
    assert response.status_code == 201
    created = User.objects.get(email="new-vet@example.com")
    assert created.phone_number == "123456789"
    assert created.check_password("s3cr3t-pass-1")
    assert list(created.specializations.values_list("name", flat=True)) == ["Surgery"]


@pytest.mark.django_db
def test_user_create_rejects_weak_password(admin_client_):
    response = admin_client_.post(
        "/api/v1/user/", {"email": "new-vet@example.com", "password": "12345678"}
    )
    assert response.status_code == 400
    assert "password" in response.data


@pytest.mark.django_db
def test_user_list(admin_client_, user):
    response = admin_client_.get("/api/v1/user/")
    assert response.status_code == 200
    assert response.data["count"] == 2


@pytest.mark.django_db
def test_specialization_list_requires_authentication(client):
    response = client.get("/api/v1/user/specializations/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_specialization_create(auth_client):
    response = auth_client.post("/api/v1/user/specializations/", {"name": "Dentistry"})
    assert response.status_code == 201
    assert Specialization.objects.filter(name="Dentistry").exists()


@pytest.mark.django_db
def test_specialization_list(auth_client, specialization):
    response = auth_client.get("/api/v1/user/specializations/")
    assert response.status_code == 200
    assert response.data["count"] == 1


@pytest.mark.django_db
def test_specialization_retrieve(auth_client, specialization):
    response = auth_client.get(f"/api/v1/user/specializations/{specialization.pk}/")
    assert response.status_code == 200
    assert response.data["name"] == "Surgery"


@pytest.mark.django_db
def test_specialization_update(auth_client, specialization):
    response = auth_client.patch(
        f"/api/v1/user/specializations/{specialization.pk}/",
        {"name": "Orthopedic Surgery"},
        content_type="application/json",
    )
    assert response.status_code == 200
    specialization.refresh_from_db()
    assert specialization.name == "Orthopedic Surgery"


@pytest.mark.django_db
def test_specialization_delete(auth_client, specialization):
    response = auth_client.delete(f"/api/v1/user/specializations/{specialization.pk}/")
    assert response.status_code == 204
    assert not Specialization.objects.filter(pk=specialization.pk).exists()

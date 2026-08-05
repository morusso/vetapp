import pytest
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from user.admin import _blacklist

User = get_user_model()


class _ProtectedView(APIView):
    def get(self, request):
        return Response({'user': request.user.email})


@pytest.fixture
def user(db):
    return User.objects.create_user(email='vet@example.com', password='s3cr3t-pass')


@pytest.mark.django_db
def test_health_is_public(client):
    response = client.get('/api/health/')
    assert response.status_code == 200


def test_protected_view_rejects_missing_token():
    request = APIRequestFactory().get('/protected/')
    response = _ProtectedView.as_view()(request)
    assert response.status_code == 401


def test_protected_view_rejects_garbage_token():
    request = APIRequestFactory().get('/protected/', HTTP_AUTHORIZATION='Bearer garbage')
    response = _ProtectedView.as_view()(request)
    assert response.status_code == 401


@pytest.mark.django_db
def test_protected_view_accepts_valid_access_token(user):
    access_token = RefreshToken.for_user(user).access_token
    request = APIRequestFactory().get('/protected/', HTTP_AUTHORIZATION=f'Bearer {access_token}')
    response = _ProtectedView.as_view()(request)
    assert response.status_code == 200
    assert response.data['user'] == 'vet@example.com'


@pytest.mark.django_db
def test_obtain_token_pair(client, user):
    response = client.post('/api/token/', {'email': 'vet@example.com', 'password': 's3cr3t-pass'})
    assert response.status_code == 200
    assert 'access' in response.data
    assert 'refresh' in response.data


@pytest.mark.django_db
def test_logout_blacklists_refresh_token(client, user):
    refresh = RefreshToken.for_user(user)

    response = client.post('/api/user/logout/', {'refresh': str(refresh)})
    assert response.status_code == 205
    assert BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists()

    refresh_response = client.post('/api/token/refresh/', {'refresh': str(refresh)})
    assert refresh_response.status_code == 401


@pytest.mark.django_db
def test_change_password_requires_authentication(client):
    response = client.post(
        '/api/user/change-password/',
        {'old_password': 's3cr3t-pass', 'new_password': 'n3w-s3cr3t-pass'},
    )
    assert response.status_code == 401


@pytest.mark.django_db
def test_change_password_rejects_wrong_old_password(client, user):
    access_token = RefreshToken.for_user(user).access_token

    response = client.post(
        '/api/user/change-password/',
        {'old_password': 'wrong-pass', 'new_password': 'n3w-s3cr3t-pass'},
        HTTP_AUTHORIZATION=f'Bearer {access_token}',
    )

    assert response.status_code == 400
    assert 'old_password' in response.data


@pytest.mark.django_db
def test_change_password_rejects_weak_new_password(client, user):
    access_token = RefreshToken.for_user(user).access_token

    response = client.post(
        '/api/user/change-password/',
        {'old_password': 's3cr3t-pass', 'new_password': '12345678'},
        HTTP_AUTHORIZATION=f'Bearer {access_token}',
    )

    assert response.status_code == 400
    assert 'new_password' in response.data


@pytest.mark.django_db
def test_change_password_success_updates_credentials(client, user):
    access_token = RefreshToken.for_user(user).access_token

    response = client.post(
        '/api/user/change-password/',
        {'old_password': 's3cr3t-pass', 'new_password': 'n3w-s3cr3t-pass'},
        HTTP_AUTHORIZATION=f'Bearer {access_token}',
    )
    assert response.status_code == 204

    user.refresh_from_db()
    assert user.check_password('n3w-s3cr3t-pass')

    old_login = client.post('/api/token/', {'email': 'vet@example.com', 'password': 's3cr3t-pass'})
    assert old_login.status_code == 401

    new_login = client.post('/api/token/', {'email': 'vet@example.com', 'password': 'n3w-s3cr3t-pass'})
    assert new_login.status_code == 200


@pytest.mark.django_db
def test_change_password_blacklists_existing_refresh_tokens(client, user):
    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token

    response = client.post(
        '/api/user/change-password/',
        {'old_password': 's3cr3t-pass', 'new_password': 'n3w-s3cr3t-pass'},
        HTTP_AUTHORIZATION=f'Bearer {access_token}',
    )
    assert response.status_code == 204

    refresh_response = client.post('/api/token/refresh/', {'refresh': str(refresh)})
    assert refresh_response.status_code == 401


@pytest.mark.django_db
def test_admin_revoke_all_tokens_blacklists_every_outstanding_token(user):
    RefreshToken.for_user(user)
    RefreshToken.for_user(user)
    assert OutstandingToken.objects.filter(user=user).count() == 2

    revoked = _blacklist(OutstandingToken.objects.filter(user=user))

    assert revoked == 2
    assert BlacklistedToken.objects.filter(token__user=user).count() == 2

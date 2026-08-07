import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from clients.models import Client

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(email="vet@example.com", password="s3cr3t-pass")


@pytest.fixture
def auth_client(client, user):
    access_token = RefreshToken.for_user(user).access_token
    client.defaults["HTTP_AUTHORIZATION"] = f"Bearer {access_token}"
    return client


@pytest.fixture
def sample_client(db):
    return Client.objects.create(
        first_name="Jan",
        last_name="Kowalski",
        email="jan.kowalski@example.com",
        phone_number="123456789",
        street="Polna 1",
        city="Warszawa",
        postal_code="00-001",
    )


@pytest.mark.django_db
def test_client_list_requires_authentication(client):
    response = client.get("/api/v1/clients/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_client_create(auth_client):
    response = auth_client.post(
        "/api/v1/clients/",
        {
            "first_name": "Anna",
            "last_name": "Nowak",
            "email": "anna.nowak@example.com",
            "phone_number": "987654321",
            "street": "Kwiatowa 5",
            "city": "Krakow",
            "postal_code": "30-001",
        },
    )
    assert response.status_code == 201
    assert Client.objects.filter(email="anna.nowak@example.com").exists()


@pytest.mark.django_db
def test_client_list(auth_client, sample_client):
    response = auth_client.get("/api/v1/clients/")
    assert response.status_code == 200
    assert response.data["count"] == 1


@pytest.mark.django_db
def test_client_retrieve(auth_client, sample_client):
    response = auth_client.get(f"/api/v1/clients/{sample_client.pk}/")
    assert response.status_code == 200
    assert response.data["last_name"] == "Kowalski"


@pytest.mark.django_db
def test_client_update(auth_client, sample_client):
    response = auth_client.patch(
        f"/api/v1/clients/{sample_client.pk}/",
        {"city": "Gdansk"},
        content_type="application/json",
    )
    assert response.status_code == 200
    sample_client.refresh_from_db()
    assert sample_client.city == "Gdansk"


@pytest.mark.django_db
def test_client_delete(auth_client, sample_client):
    response = auth_client.delete(f"/api/v1/clients/{sample_client.pk}/")
    assert response.status_code == 204
    assert not Client.objects.filter(pk=sample_client.pk).exists()

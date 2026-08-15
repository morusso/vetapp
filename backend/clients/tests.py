import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from animals.models import Animal, AnimalType, Patient
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
    assert response.data["preferred_notification_channel"] == "email"


@pytest.mark.django_db
def test_client_create_with_sms_preference(auth_client):
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
            "preferred_notification_channel": "sms",
        },
    )
    assert response.status_code == 201
    assert Client.objects.get(email="anna.nowak@example.com").preferred_notification_channel == "sms"


@pytest.mark.django_db
def test_client_create_rejects_invalid_notification_channel(auth_client):
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
            "preferred_notification_channel": "fax",
        },
    )
    assert response.status_code == 400


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
def test_client_update_notification_channel(auth_client, sample_client):
    response = auth_client.patch(
        f"/api/v1/clients/{sample_client.pk}/",
        {"preferred_notification_channel": "sms"},
        content_type="application/json",
    )
    assert response.status_code == 200
    sample_client.refresh_from_db()
    assert sample_client.preferred_notification_channel == "sms"


@pytest.mark.django_db
def test_client_delete(auth_client, sample_client):
    response = auth_client.delete(f"/api/v1/clients/{sample_client.pk}/")
    assert response.status_code == 204
    assert not Client.objects.filter(pk=sample_client.pk).exists()


@pytest.mark.django_db
def test_client_retrieve_full_with_patients(auth_client, sample_client):
    animal_type = AnimalType.objects.create(name="Dog")
    breed = Animal.objects.create(name="Labrador", animal_type=animal_type)
    Patient.objects.create(name="Burek", owner=sample_client, breed=breed)

    response = auth_client.get(f"/api/v1/clients/{sample_client.pk}/full/")

    assert response.status_code == 200
    assert response.data["last_name"] == "Kowalski"
    assert len(response.data["patients"]) == 1
    assert response.data["patients"][0]["name"] == "Burek"
    assert response.data["patients"][0]["breed_name"] == "Labrador"


@pytest.mark.django_db
def test_client_retrieve_full_without_patients(auth_client, sample_client):
    response = auth_client.get(f"/api/v1/clients/{sample_client.pk}/full/")

    assert response.status_code == 200
    assert response.data["patients"] == []


@pytest.mark.django_db
def test_client_retrieve_full_not_found(auth_client):
    response = auth_client.get("/api/v1/clients/999/full/")
    assert response.status_code == 404

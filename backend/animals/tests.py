from datetime import date
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from animals.models import Animal, AnimalType, Patient, PatientWeight
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
def animal_type(db):
    return AnimalType.objects.create(name="Dog")


@pytest.fixture
def owner(db):
    return Client.objects.create(
        first_name="Jan",
        last_name="Kowalski",
        email="jan.kowalski@example.com",
        phone_number="123456789",
        street="Polna 1",
        city="Warszawa",
        postal_code="00-001",
    )


@pytest.fixture
def breed(animal_type):
    return Animal.objects.create(name="Labrador", animal_type=animal_type)


@pytest.fixture
def patient(owner, breed):
    return Patient.objects.create(name="Burek", owner=owner, breed=breed)


@pytest.fixture
def patient_weight(patient):
    return PatientWeight.objects.create(
        patient=patient, weight_kg=Decimal("12.50"), recorded_at=date(2026, 1, 1)
    )


@pytest.mark.django_db
def test_animal_type_list_requires_authentication(client):
    response = client.get("/api/v1/animals/types/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_animal_type_create(auth_client):
    response = auth_client.post(
        "/api/v1/animals/types/", {"name": "Cat", "description": "Lorem Ipsum"}
    )
    assert response.status_code == 201
    assert AnimalType.objects.filter(name="Cat").exists()


@pytest.mark.django_db
def test_animal_type_list(auth_client, animal_type):
    response = auth_client.get("/api/v1/animals/types/")
    assert response.status_code == 200
    assert response.data["count"] == 1


@pytest.mark.django_db
def test_animal_type_retrieve(auth_client, animal_type):
    response = auth_client.get(f"/api/v1/animals/types/{animal_type.pk}/")
    assert response.status_code == 200
    assert response.data["name"] == "Dog"


@pytest.mark.django_db
def test_animal_type_update(auth_client, animal_type):
    response = auth_client.patch(
        f"/api/v1/animals/types/{animal_type.pk}/",
        {"name": "Doggo"},
        content_type="application/json",
    )
    assert response.status_code == 200
    animal_type.refresh_from_db()
    assert animal_type.name == "Doggo"


@pytest.mark.django_db
def test_animal_type_delete(auth_client, animal_type):
    response = auth_client.delete(f"/api/v1/animals/types/{animal_type.pk}/")
    assert response.status_code == 204
    assert not AnimalType.objects.filter(pk=animal_type.pk).exists()


@pytest.mark.django_db
def test_animal_create(auth_client, animal_type):
    response = auth_client.post(
        "/api/v1/animals/",
        {
            "name": "Basenji",
            "animal_type": animal_type.pk,
            "description": "Lorem Ipsum",
        },
    )
    assert response.status_code == 201
    assert Animal.objects.filter(name="Basenji").exists()


@pytest.mark.django_db
def test_animal_list(auth_client, animal_type):
    Animal.objects.create(name="Rex", animal_type=animal_type)
    response = auth_client.get("/api/v1/animals/")
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["animal_type_name"] == "Dog"


@pytest.mark.django_db
def test_animal_retrieve(auth_client, animal_type):
    animal = Animal.objects.create(name="Rex", animal_type=animal_type)
    response = auth_client.get(f"/api/v1/animals/{animal.pk}/")
    assert response.status_code == 200
    assert response.data["name"] == "Rex"


@pytest.mark.django_db
def test_animal_update(auth_client, animal_type):
    animal = Animal.objects.create(name="Rex", animal_type=animal_type)
    response = auth_client.patch(
        f"/api/v1/animals/{animal.pk}/",
        {"name": "Max"},
        content_type="application/json",
    )
    assert response.status_code == 200
    animal.refresh_from_db()
    assert animal.name == "Max"


@pytest.mark.django_db
def test_animal_delete(auth_client, animal_type):
    animal = Animal.objects.create(name="Rex", animal_type=animal_type)
    response = auth_client.delete(f"/api/v1/animals/{animal.pk}/")
    assert response.status_code == 204
    assert not Animal.objects.filter(pk=animal.pk).exists()


@pytest.mark.django_db
def test_patient_list_requires_authentication(client):
    response = client.get("/api/v1/animals/patients/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_patient_create(auth_client, owner, breed):
    response = auth_client.post(
        "/api/v1/animals/patients/",
        {
            "name": "Reksio",
            "owner": owner.pk,
            "breed": breed.pk,
            "sex": "male",
        },
    )
    assert response.status_code == 201
    assert Patient.objects.filter(name="Reksio").exists()


@pytest.mark.django_db
def test_patient_list(auth_client, patient):
    response = auth_client.get("/api/v1/animals/patients/")
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["breed_name"] == "Labrador"
    assert response.data["results"][0]["owner_name"] == "Jan Kowalski"


@pytest.mark.django_db
def test_patient_retrieve(auth_client, patient):
    response = auth_client.get(f"/api/v1/animals/patients/{patient.pk}/")
    assert response.status_code == 200
    assert response.data["name"] == "Burek"


@pytest.mark.django_db
def test_patient_update(auth_client, patient):
    response = auth_client.patch(
        f"/api/v1/animals/patients/{patient.pk}/",
        {"is_sterilized": True},
        content_type="application/json",
    )
    assert response.status_code == 200
    patient.refresh_from_db()
    assert patient.is_sterilized is True


@pytest.mark.django_db
def test_patient_retrieve_full(auth_client, patient, patient_weight):
    response = auth_client.get(f"/api/v1/animals/patients/{patient.pk}/full/")
    assert response.status_code == 200
    assert response.data["name"] == "Burek"
    assert response.data["owner_name"] == "Jan Kowalski"
    assert response.data["breed_name"] == "Labrador"
    assert len(response.data["weight_records"]) == 1
    assert response.data["weight_records"][0]["weight_kg"] == "12.50"


@pytest.mark.django_db
def test_patient_delete(auth_client, patient):
    response = auth_client.delete(f"/api/v1/animals/patients/{patient.pk}/")
    assert response.status_code == 204
    assert not Patient.objects.filter(pk=patient.pk).exists()


@pytest.mark.django_db
def test_patient_weight_list_requires_authentication(client):
    response = client.get("/api/v1/animals/patients/weights/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_patient_weight_create(auth_client, patient):
    response = auth_client.post(
        "/api/v1/animals/patients/weights/",
        {"patient": patient.pk, "weight_kg": "13.20", "recorded_at": "2026-02-01"},
    )
    assert response.status_code == 201
    assert PatientWeight.objects.filter(patient=patient).count() == 1


@pytest.mark.django_db
def test_patient_weight_list(auth_client, patient_weight):
    response = auth_client.get("/api/v1/animals/patients/weights/")
    assert response.status_code == 200
    assert response.data["count"] == 1


@pytest.mark.django_db
def test_patient_weight_retrieve(auth_client, patient_weight):
    response = auth_client.get(f"/api/v1/animals/patients/weights/{patient_weight.pk}/")
    assert response.status_code == 200
    assert response.data["weight_kg"] == "12.50"


@pytest.mark.django_db
def test_patient_weight_update(auth_client, patient_weight):
    response = auth_client.patch(
        f"/api/v1/animals/patients/weights/{patient_weight.pk}/",
        {"weight_kg": "12.80"},
        content_type="application/json",
    )
    assert response.status_code == 200
    patient_weight.refresh_from_db()
    assert str(patient_weight.weight_kg) == "12.80"


@pytest.mark.django_db
def test_patient_weight_delete(auth_client, patient_weight):
    response = auth_client.delete(f"/api/v1/animals/patients/weights/{patient_weight.pk}/")
    assert response.status_code == 204
    assert not PatientWeight.objects.filter(pk=patient_weight.pk).exists()


@pytest.mark.django_db
def test_patient_weight_filter_by_patient(auth_client, patient_weight, owner, breed):
    other_patient = Patient.objects.create(name="Azor", owner=owner, breed=breed)
    PatientWeight.objects.create(
        patient=other_patient, weight_kg=Decimal("20.00"), recorded_at=date(2026, 1, 1)
    )

    response = auth_client.get(
        f"/api/v1/animals/patients/weights/?patient={patient_weight.patient_id}"
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == patient_weight.pk

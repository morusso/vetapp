from datetime import date
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from clinical_data.models import Medicine, MedicineBatch

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
def medicine(db):
    return Medicine.objects.create(
        name="Amoxicillin",
        manufacturer="VetPharma",
        active_substance="Amoxicillin trihydrate",
        form=Medicine.Form.TABLET,
        strength="50mg",
        unit="tablet",
        minimum_stock_level=Decimal("10.00"),
    )


@pytest.fixture
def medicine_batch(medicine):
    return MedicineBatch.objects.create(
        medicine=medicine,
        batch_number="B100",
        quantity=Decimal("50.00"),
        expiry_date=date(2027, 1, 1),
        received_at=date(2026, 1, 1),
    )


@pytest.mark.django_db
def test_medicine_list_requires_authentication(client):
    response = client.get("/api/v1/clinical-data/medicines/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_medicine_create(auth_client):
    response = auth_client.post(
        "/api/v1/clinical-data/medicines/",
        {"name": "Meloxicam", "unit": "ml", "form": "liquid"},
    )
    assert response.status_code == 201
    assert Medicine.objects.filter(name="Meloxicam").exists()


@pytest.mark.django_db
def test_medicine_list(auth_client, medicine):
    response = auth_client.get("/api/v1/clinical-data/medicines/")
    assert response.status_code == 200
    assert response.data["count"] == 1


@pytest.mark.django_db
def test_medicine_retrieve(auth_client, medicine):
    response = auth_client.get(f"/api/v1/clinical-data/medicines/{medicine.pk}/")
    assert response.status_code == 200
    assert response.data["name"] == "Amoxicillin"
    assert response.data["minimum_stock_level"] == "10.00"


@pytest.mark.django_db
def test_medicine_update(auth_client, medicine):
    response = auth_client.patch(
        f"/api/v1/clinical-data/medicines/{medicine.pk}/",
        {"requires_prescription": True},
        content_type="application/json",
    )
    assert response.status_code == 200
    medicine.refresh_from_db()
    assert medicine.requires_prescription is True


@pytest.mark.django_db
def test_medicine_delete(auth_client, medicine):
    response = auth_client.delete(f"/api/v1/clinical-data/medicines/{medicine.pk}/")
    assert response.status_code == 204
    assert not Medicine.objects.filter(pk=medicine.pk).exists()


@pytest.mark.django_db
def test_medicine_batch_list_requires_authentication(client):
    response = client.get("/api/v1/clinical-data/medicines/batches/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_medicine_batch_create(auth_client, medicine):
    response = auth_client.post(
        "/api/v1/clinical-data/medicines/batches/",
        {
            "medicine": medicine.pk,
            "batch_number": "B200",
            "quantity": "30.00",
            "expiry_date": "2027-06-01",
            "received_at": "2026-01-01",
        },
    )
    assert response.status_code == 201
    assert MedicineBatch.objects.filter(medicine=medicine, batch_number="B200").exists()


@pytest.mark.django_db
def test_medicine_batch_list(auth_client, medicine_batch):
    response = auth_client.get("/api/v1/clinical-data/medicines/batches/")
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["medicine_name"] == "Amoxicillin"


@pytest.mark.django_db
def test_medicine_batch_retrieve(auth_client, medicine_batch):
    response = auth_client.get(
        f"/api/v1/clinical-data/medicines/batches/{medicine_batch.pk}/"
    )
    assert response.status_code == 200
    assert response.data["batch_number"] == "B100"


@pytest.mark.django_db
def test_medicine_batch_update(auth_client, medicine_batch):
    response = auth_client.patch(
        f"/api/v1/clinical-data/medicines/batches/{medicine_batch.pk}/",
        {"quantity": "45.00"},
        content_type="application/json",
    )
    assert response.status_code == 200
    medicine_batch.refresh_from_db()
    assert str(medicine_batch.quantity) == "45.00"


@pytest.mark.django_db
def test_medicine_batch_delete(auth_client, medicine_batch):
    response = auth_client.delete(
        f"/api/v1/clinical-data/medicines/batches/{medicine_batch.pk}/"
    )
    assert response.status_code == 204
    assert not MedicineBatch.objects.filter(pk=medicine_batch.pk).exists()


@pytest.mark.django_db
def test_medicine_batch_filter_by_medicine(auth_client, medicine_batch, medicine):
    other_medicine = Medicine.objects.create(name="Meloxicam", unit="ml")
    MedicineBatch.objects.create(
        medicine=other_medicine,
        batch_number="B300",
        quantity=Decimal("20.00"),
        expiry_date=date(2027, 1, 1),
        received_at=date(2026, 1, 1),
    )

    response = auth_client.get(
        f"/api/v1/clinical-data/medicines/batches/?medicine={medicine.pk}"
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == medicine_batch.pk

from datetime import date
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from animals.models import Animal, AnimalType, Patient
from clients.models import Client
from clinical_data.models import Medicine, MedicineBatch, PrescribedMedicine, Visit, VisitNote

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
def patient(db):
    owner = Client.objects.create(
        first_name="Jan",
        last_name="Kowalski",
        email="jan.kowalski@example.com",
        phone_number="123456789",
        street="Polna 1",
        city="Warszawa",
        postal_code="00-001",
    )
    animal_type = AnimalType.objects.create(name="Dog")
    breed = Animal.objects.create(name="Labrador", animal_type=animal_type)
    return Patient.objects.create(name="Rex", owner=owner, breed=breed)


@pytest.fixture
def visit(patient, user):
    return Visit.objects.create(
        patient=patient,
        veterinarian=user,
        visit_date="2026-01-15T10:00:00Z",
        diagnosis="Routine checkup",
    )


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


@pytest.mark.django_db
def test_visit_list_requires_authentication(client):
    response = client.get("/api/v1/clinical-data/visits/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_visit_create(auth_client, patient, user):
    response = auth_client.post(
        "/api/v1/clinical-data/visits/",
        {
            "patient": patient.pk,
            "veterinarian": user.pk,
            "visit_date": "2026-02-01T09:30:00Z",
            "diagnosis": "Vaccination",
        },
    )
    assert response.status_code == 201
    assert Visit.objects.filter(patient=patient, diagnosis="Vaccination").exists()


@pytest.mark.django_db
def test_visit_list(auth_client, visit):
    response = auth_client.get("/api/v1/clinical-data/visits/")
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["patient_name"] == "Rex"


@pytest.mark.django_db
def test_visit_retrieve(auth_client, visit):
    response = auth_client.get(f"/api/v1/clinical-data/visits/{visit.pk}/")
    assert response.status_code == 200
    assert response.data["diagnosis"] == "Routine checkup"
    assert response.data["veterinarian_name"] == "vet@example.com"


@pytest.mark.django_db
def test_visit_update(auth_client, visit):
    response = auth_client.patch(
        f"/api/v1/clinical-data/visits/{visit.pk}/",
        {"diagnosis": "Follow-up examination"},
        content_type="application/json",
    )
    assert response.status_code == 200
    visit.refresh_from_db()
    assert visit.diagnosis == "Follow-up examination"


@pytest.mark.django_db
def test_visit_delete(auth_client, visit):
    response = auth_client.delete(f"/api/v1/clinical-data/visits/{visit.pk}/")
    assert response.status_code == 204
    assert not Visit.objects.filter(pk=visit.pk).exists()


@pytest.mark.django_db
def test_visit_filter_by_patient(auth_client, visit, patient, user):
    other_patient = Patient.objects.create(
        name="Milo", owner=patient.owner, breed=patient.breed
    )
    Visit.objects.create(
        patient=other_patient, veterinarian=user, visit_date="2026-03-01T08:00:00Z"
    )

    response = auth_client.get(
        f"/api/v1/clinical-data/visits/?patient={patient.pk}"
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == visit.pk


@pytest.mark.django_db
def test_visit_detail_full_includes_note_and_medicines(auth_client, visit):
    VisitNote.objects.create(visit=visit, content="Patient is healthy")
    medicine = Medicine.objects.create(name="Amoxicillin", unit="tablet")
    PrescribedMedicine.objects.create(
        visit=visit, medicine=medicine, quantity=Decimal("2.00"), dosage="1x daily"
    )

    response = auth_client.get(f"/api/v1/clinical-data/visits/{visit.pk}/full/")

    assert response.status_code == 200
    assert response.data["note"]["content"] == "Patient is healthy"
    assert len(response.data["prescribed_medicines"]) == 1
    assert response.data["prescribed_medicines"][0]["medicine_name"] == "Amoxicillin"


@pytest.mark.django_db
def test_visit_detail_full_note_is_null_when_missing(auth_client, visit):
    response = auth_client.get(f"/api/v1/clinical-data/visits/{visit.pk}/full/")

    assert response.status_code == 200
    assert response.data["note"] is None
    assert response.data["prescribed_medicines"] == []


@pytest.mark.django_db
def test_visit_note_create(auth_client, visit):
    response = auth_client.post(
        "/api/v1/clinical-data/visits/notes/",
        {"visit": visit.pk, "content": "No abnormalities found"},
    )
    assert response.status_code == 201
    assert VisitNote.objects.filter(visit=visit, content="No abnormalities found").exists()


@pytest.mark.django_db
def test_visit_note_update(auth_client, visit):
    note = VisitNote.objects.create(visit=visit, content="Initial")

    response = auth_client.patch(
        f"/api/v1/clinical-data/visits/notes/{note.pk}/",
        {"content": "Updated content"},
        content_type="application/json",
    )

    assert response.status_code == 200
    note.refresh_from_db()
    assert note.content == "Updated content"


@pytest.mark.django_db
def test_visit_note_filter_by_visit(auth_client, visit, patient, user):
    other_visit = Visit.objects.create(
        patient=patient, veterinarian=user, visit_date="2026-03-01T08:00:00Z"
    )
    note = VisitNote.objects.create(visit=visit, content="Note A")
    VisitNote.objects.create(visit=other_visit, content="Note B")

    response = auth_client.get(f"/api/v1/clinical-data/visits/notes/?visit={visit.pk}")

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == note.pk


@pytest.mark.django_db
def test_prescribed_medicine_create(auth_client, visit):
    medicine = Medicine.objects.create(name="Amoxicillin", unit="tablet")

    response = auth_client.post(
        "/api/v1/clinical-data/visits/medicines/",
        {
            "visit": visit.pk,
            "medicine": medicine.pk,
            "quantity": "2.00",
            "dosage": "1x daily",
        },
    )

    assert response.status_code == 201
    assert PrescribedMedicine.objects.filter(visit=visit, medicine=medicine).exists()


@pytest.mark.django_db
def test_prescribed_medicine_filter_by_visit(auth_client, visit, patient, user):
    medicine = Medicine.objects.create(name="Amoxicillin", unit="tablet")
    other_visit = Visit.objects.create(
        patient=patient, veterinarian=user, visit_date="2026-03-01T08:00:00Z"
    )
    prescription = PrescribedMedicine.objects.create(
        visit=visit, medicine=medicine, quantity=Decimal("1.00")
    )
    PrescribedMedicine.objects.create(
        visit=other_visit, medicine=medicine, quantity=Decimal("1.00")
    )

    response = auth_client.get(
        f"/api/v1/clinical-data/visits/medicines/?visit={visit.pk}"
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == prescription.pk


@pytest.mark.django_db
def test_prescribed_medicine_update(auth_client, visit):
    medicine = Medicine.objects.create(name="Amoxicillin", unit="tablet")
    prescription = PrescribedMedicine.objects.create(
        visit=visit, medicine=medicine, quantity=Decimal("1.00")
    )

    response = auth_client.patch(
        f"/api/v1/clinical-data/visits/medicines/{prescription.pk}/",
        {"quantity": "5.00"},
        content_type="application/json",
    )

    assert response.status_code == 200
    prescription.refresh_from_db()
    assert prescription.quantity == Decimal("5.00")


@pytest.mark.django_db
def test_prescribed_medicine_delete(auth_client, visit):
    medicine = Medicine.objects.create(name="Amoxicillin", unit="tablet")
    prescription = PrescribedMedicine.objects.create(
        visit=visit, medicine=medicine, quantity=Decimal("1.00")
    )

    response = auth_client.delete(
        f"/api/v1/clinical-data/visits/medicines/{prescription.pk}/"
    )

    assert response.status_code == 204
    assert not PrescribedMedicine.objects.filter(pk=prescription.pk).exists()

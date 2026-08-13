from datetime import date
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework_simplejwt.tokens import RefreshToken

from animals.models import Animal, AnimalType, Patient
from clients.models import Client
from clinical_data.models import (
    Medicine,
    MedicineBatch,
    PrescribedMedicine,
    Service,
    Visit,
    VisitNote,
    VisitService,
)
from clinical_data.tasks import check_medicine_stock_levels
from notifications.models import Notification

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
def admin_user(db):
    return User.objects.create_user(
        email="admin@example.com", password="s3cr3t-pass", is_staff=True
    )


@pytest.fixture
def admin_client_(client, admin_user):
    access_token = RefreshToken.for_user(admin_user).access_token
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
def service(db):
    return Service.objects.create(
        name="Consultation",
        description="General checkup",
        price=Decimal("100.00"),
        duration_minutes=30,
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
def test_visit_detail_full_includes_notes_and_medicines(auth_client, visit):
    VisitNote.objects.create(visit=visit, content="Patient is healthy")
    VisitNote.objects.create(visit=visit, content="Follow-up in 2 weeks")
    medicine = Medicine.objects.create(name="Amoxicillin", unit="tablet")
    PrescribedMedicine.objects.create(
        visit=visit, medicine=medicine, quantity=Decimal("2.00"), dosage="1x daily"
    )

    response = auth_client.get(f"/api/v1/clinical-data/visits/{visit.pk}/full/")

    assert response.status_code == 200
    assert len(response.data["notes"]) == 2
    assert {n["content"] for n in response.data["notes"]} == {
        "Patient is healthy",
        "Follow-up in 2 weeks",
    }
    assert len(response.data["prescribed_medicines"]) == 1
    assert response.data["prescribed_medicines"][0]["medicine_name"] == "Amoxicillin"


@pytest.mark.django_db
def test_visit_detail_full_notes_empty_when_missing(auth_client, visit):
    response = auth_client.get(f"/api/v1/clinical-data/visits/{visit.pk}/full/")

    assert response.status_code == 200
    assert response.data["notes"] == []
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
def test_visit_note_create_allows_multiple_notes_per_visit(auth_client, visit):
    auth_client.post(
        "/api/v1/clinical-data/visits/notes/",
        {"visit": visit.pk, "content": "First note"},
    )
    response = auth_client.post(
        "/api/v1/clinical-data/visits/notes/",
        {"visit": visit.pk, "content": "Second note"},
    )

    assert response.status_code == 201
    assert VisitNote.objects.filter(visit=visit).count() == 2


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
def test_visit_note_delete_by_author_succeeds(auth_client, visit, user):
    note = VisitNote.objects.create(visit=visit, content="Initial", author=user)

    response = auth_client.delete(f"/api/v1/clinical-data/visits/notes/{note.pk}/")

    assert response.status_code == 204
    assert not VisitNote.objects.filter(pk=note.pk).exists()


@pytest.mark.django_db
def test_visit_note_delete_by_other_user_forbidden(auth_client, visit, user):
    other_author = User.objects.create_user(email="other@example.com", password="s3cr3t-pass")
    note = VisitNote.objects.create(visit=visit, content="Initial", author=other_author)

    response = auth_client.delete(f"/api/v1/clinical-data/visits/notes/{note.pk}/")

    assert response.status_code == 403
    assert VisitNote.objects.filter(pk=note.pk).exists()


@pytest.mark.django_db
def test_visit_note_delete_by_admin_succeeds(admin_client_, visit, user):
    note = VisitNote.objects.create(visit=visit, content="Initial", author=user)

    response = admin_client_.delete(f"/api/v1/clinical-data/visits/notes/{note.pk}/")

    assert response.status_code == 204
    assert not VisitNote.objects.filter(pk=note.pk).exists()


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


@pytest.mark.django_db
def test_service_create(auth_client):
    response = auth_client.post(
        "/api/v1/clinical-data/services/",
        {"name": "Vaccination", "price": "50.00", "duration_minutes": 15},
    )

    assert response.status_code == 201
    assert Service.objects.filter(name="Vaccination").exists()


@pytest.mark.django_db
def test_service_list(auth_client, service):
    response = auth_client.get("/api/v1/clinical-data/services/")

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == service.pk


@pytest.mark.django_db
def test_service_update(auth_client, service):
    response = auth_client.patch(
        f"/api/v1/clinical-data/services/{service.pk}/",
        {"price": "150.00"},
        content_type="application/json",
    )

    assert response.status_code == 200
    service.refresh_from_db()
    assert service.price == Decimal("150.00")


@pytest.mark.django_db
def test_service_delete(auth_client, service):
    response = auth_client.delete(f"/api/v1/clinical-data/services/{service.pk}/")

    assert response.status_code == 204
    assert not Service.objects.filter(pk=service.pk).exists()


@pytest.mark.django_db
def test_visit_service_create(auth_client, visit, service):
    response = auth_client.post(
        "/api/v1/clinical-data/visits/services/",
        {
            "visit": visit.pk,
            "service": service.pk,
            "quantity": "1.00",
            "price": "100.00",
        },
    )

    assert response.status_code == 201
    assert VisitService.objects.filter(visit=visit, service=service).exists()


@pytest.mark.django_db
def test_visit_service_filter_by_visit(auth_client, visit, service, patient, user):
    other_visit = Visit.objects.create(
        patient=patient, veterinarian=user, visit_date="2026-03-01T08:00:00Z"
    )
    visit_service = VisitService.objects.create(
        visit=visit, service=service, quantity=Decimal("1.00")
    )
    VisitService.objects.create(
        visit=other_visit, service=service, quantity=Decimal("1.00")
    )

    response = auth_client.get(
        f"/api/v1/clinical-data/visits/services/?visit={visit.pk}"
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == visit_service.pk


@pytest.mark.django_db
def test_visit_service_update(auth_client, visit, service):
    visit_service = VisitService.objects.create(
        visit=visit, service=service, quantity=Decimal("1.00")
    )

    response = auth_client.patch(
        f"/api/v1/clinical-data/visits/services/{visit_service.pk}/",
        {"quantity": "4.00"},
        content_type="application/json",
    )

    assert response.status_code == 200
    visit_service.refresh_from_db()
    assert visit_service.quantity == Decimal("4.00")


@pytest.mark.django_db
def test_visit_service_delete(auth_client, visit, service):
    visit_service = VisitService.objects.create(
        visit=visit, service=service, quantity=Decimal("1.00")
    )

    response = auth_client.delete(
        f"/api/v1/clinical-data/visits/services/{visit_service.pk}/"
    )

    assert response.status_code == 204
    assert not VisitService.objects.filter(pk=visit_service.pk).exists()


@pytest.mark.django_db
def test_check_medicine_stock_levels_notifies_admin_group_when_below_minimum(
    in_memory_channel_layer,
):
    admin_group, _ = Group.objects.get_or_create(name="admin")
    admin_user = User.objects.create_user(email="admin@example.com", password="s3cr3t-pass")
    admin_user.groups.add(admin_group)

    medicine = Medicine.objects.create(
        name="Low Stock Med", unit="ml", minimum_stock_level=Decimal("100.00")
    )
    MedicineBatch.objects.create(
        medicine=medicine,
        batch_number="B1",
        quantity=Decimal("5.00"),
        expiry_date=date(2027, 1, 1),
        received_at=date(2026, 1, 1),
    )

    check_medicine_stock_levels()

    notification = Notification.objects.get(recipient=admin_user, event="low_medicine_stock")
    assert notification.payload["medicine_name"] == "Low Stock Med"
    assert notification.payload["current_stock"] == "5.00"
    assert notification.payload["minimum_stock_level"] == "100.00"


@pytest.mark.django_db
def test_check_medicine_stock_levels_skips_medicine_above_minimum(in_memory_channel_layer):
    Group.objects.get_or_create(name="admin")
    medicine = Medicine.objects.create(
        name="Well Stocked Med", unit="ml", minimum_stock_level=Decimal("10.00")
    )
    MedicineBatch.objects.create(
        medicine=medicine,
        batch_number="B1",
        quantity=Decimal("50.00"),
        expiry_date=date(2027, 1, 1),
        received_at=date(2026, 1, 1),
    )

    check_medicine_stock_levels()

    assert not Notification.objects.filter(event="low_medicine_stock").exists()


@pytest.mark.django_db
def test_check_medicine_stock_levels_ignores_medicine_without_minimum(in_memory_channel_layer):
    Group.objects.get_or_create(name="admin")
    Medicine.objects.create(name="No Minimum Set", unit="ml", minimum_stock_level=None)

    check_medicine_stock_levels()

    assert not Notification.objects.filter(event="low_medicine_stock").exists()


@pytest.mark.django_db
def test_check_medicine_stock_levels_excludes_expired_batches_from_stock(
    in_memory_channel_layer,
):
    admin_group, _ = Group.objects.get_or_create(name="admin")
    admin_user = User.objects.create_user(email="admin2@example.com", password="s3cr3t-pass")
    admin_user.groups.add(admin_group)

    medicine = Medicine.objects.create(
        name="Expired Stock Med", unit="ml", minimum_stock_level=Decimal("1.00")
    )
    MedicineBatch.objects.create(
        medicine=medicine,
        batch_number="EXPIRED",
        quantity=Decimal("999.00"),
        expiry_date=date(2020, 1, 1),
        received_at=date(2019, 1, 1),
    )

    check_medicine_stock_levels()

    notification = Notification.objects.get(recipient=admin_user, event="low_medicine_stock")
    assert notification.payload["current_stock"] == "0"


@pytest.mark.django_db
def test_check_medicine_stock_levels_only_notifies_admin_group_members(
    in_memory_channel_layer,
):
    Group.objects.get_or_create(name="admin")
    outsider = User.objects.create_user(email="outsider@example.com", password="s3cr3t-pass")

    medicine = Medicine.objects.create(
        name="Low Stock Med", unit="ml", minimum_stock_level=Decimal("100.00")
    )
    MedicineBatch.objects.create(
        medicine=medicine,
        batch_number="B1",
        quantity=Decimal("5.00"),
        expiry_date=date(2027, 1, 1),
        received_at=date(2026, 1, 1),
    )

    check_medicine_stock_levels()

    assert not Notification.objects.filter(recipient=outsider).exists()

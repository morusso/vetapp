from datetime import date, datetime
from decimal import Decimal

import pytest

from django.contrib.auth import get_user_model

from animals.models import Animal as AnimalModel
from animals.models import AnimalType as AnimalTypeModel
from animals.models import Patient as PatientModel
from clients.models import Client as ClientModel
from clinical_data.models import Medicine as MedicineModel
from clinical_data.models import MedicineBatch as MedicineBatchModel
from clinical_data.models import PrescribedMedicine as PrescribedMedicineModel
from clinical_data.models import Service as ServiceModel
from clinical_data.models import Visit as VisitModel
from clinical_data.models import VisitNote as VisitNoteModel
from clinical_data.models import VisitService as VisitServiceModel
from src.models.clinical_data import (
    Medicine,
    MedicineBatch,
    MedicineForm,
    PrescribedMedicine,
    Service,
    Visit,
    VisitNote,
    VisitService,
)
from src.repositories.animals import patient_to_dataclass
from src.repositories.clinical_data import (
    MedicineBatchRepository,
    MedicineRepository,
    PrescribedMedicineRepository,
    ServiceRepository,
    VisitNoteRepository,
    VisitRepository,
    VisitServiceRepository,
)
from src.repositories.user import user_to_dataclass


@pytest.fixture
def owner_model(db):
    return ClientModel.objects.create(
        first_name="Jan",
        last_name="Kowalski",
        email="jan.kowalski@example.com",
        phone_number="123456789",
        street="Polna 1",
        city="Warszawa",
        postal_code="00-001",
    )


@pytest.fixture
def patient_model(db, owner_model):
    animal_type = AnimalTypeModel.objects.create(name="Dog")
    breed = AnimalModel.objects.create(name="Labrador", animal_type=animal_type)
    return PatientModel.objects.create(name="Rex", owner=owner_model, breed=breed)


@pytest.fixture
def veterinarian_model(db):
    return get_user_model().objects.create_user(
        email="vet@example.com", password="password123"
    )


@pytest.fixture
def visit_model(db, patient_model, veterinarian_model):
    return VisitModel.objects.create(
        patient=patient_model,
        veterinarian=veterinarian_model,
        visit_date=datetime(2026, 1, 15, 10, 0),
        diagnosis="Routine checkup",
    )


@pytest.fixture
def medicine_model(db):
    return MedicineModel.objects.create(
        name="Amoxicillin",
        manufacturer="VetPharma",
        active_substance="Amoxicillin trihydrate",
        form=MedicineModel.Form.TABLET,
        strength="50mg",
        unit="tablet",
        minimum_stock_level=Decimal("10.00"),
    )


@pytest.fixture
def medicine_batch_model(medicine_model):
    return MedicineBatchModel.objects.create(
        medicine=medicine_model,
        batch_number="B100",
        quantity=Decimal("50.00"),
        expiry_date=date(2027, 1, 1),
        received_at=date(2026, 1, 1),
    )


@pytest.fixture
def service_model(db):
    return ServiceModel.objects.create(
        name="Consultation",
        description="General checkup",
        price=Decimal("100.00"),
        duration_minutes=30,
    )


class TestMedicineRepository:
    @pytest.mark.django_db
    def test_add_creates_medicine(self):
        medicine = MedicineRepository().add(
            Medicine(name="Meloxicam", unit="ml", form=MedicineForm.LIQUID)
        )

        assert medicine.id is not None
        assert MedicineModel.objects.filter(name="Meloxicam").exists()

    @pytest.mark.django_db
    def test_get_returns_none_for_missing(self):
        assert MedicineRepository().get(999999) is None

    @pytest.mark.django_db
    def test_get_returns_existing(self, medicine_model):
        medicine = MedicineRepository().get(medicine_model.id)

        assert medicine.name == "Amoxicillin"
        assert medicine.form == MedicineForm.TABLET
        assert medicine.minimum_stock_level == Decimal("10.00")

    @pytest.mark.django_db
    def test_list_returns_all(self, medicine_model):
        MedicineModel.objects.create(name="Meloxicam", unit="ml")

        medicines = MedicineRepository().list()

        assert {m.name for m in medicines} == {"Amoxicillin", "Meloxicam"}

    @pytest.mark.django_db
    def test_update_persists_changes(self, medicine_model):
        medicine = MedicineRepository().get(medicine_model.id)

        updated = MedicineRepository().update(
            Medicine(
                id=medicine.id,
                name=medicine.name,
                unit=medicine.unit,
                minimum_stock_level=Decimal("20.00"),
                requires_prescription=True,
            )
        )

        assert updated.requires_prescription is True
        assert updated.minimum_stock_level == Decimal("20.00")
        medicine_model.refresh_from_db()
        assert medicine_model.requires_prescription is True
        assert medicine_model.minimum_stock_level == Decimal("20.00")

    @pytest.mark.django_db
    def test_delete_removes_medicine(self, medicine_model):
        MedicineRepository().delete(medicine_model.id)

        assert not MedicineModel.objects.filter(id=medicine_model.id).exists()


class TestMedicineBatchRepository:
    @pytest.mark.django_db
    def test_add_creates_batch_with_nested_medicine(self, medicine_model):
        medicine = MedicineRepository().get(medicine_model.id)

        batch = MedicineBatchRepository().add(
            MedicineBatch(
                medicine=medicine,
                batch_number="B200",
                quantity=Decimal("30.00"),
                expiry_date=date(2027, 6, 1),
                received_at=date(2026, 1, 1),
            )
        )

        assert batch.id is not None
        assert batch.medicine == medicine
        assert MedicineBatchModel.objects.filter(
            medicine=medicine_model, batch_number="B200"
        ).exists()

    @pytest.mark.django_db
    def test_get_returns_batch_with_nested_medicine(self, medicine_batch_model):
        batch = MedicineBatchRepository().get(medicine_batch_model.id)

        assert batch is not None
        assert batch.medicine.name == "Amoxicillin"

    @pytest.mark.django_db
    def test_get_returns_none_for_missing(self):
        assert MedicineBatchRepository().get(999999) is None

    @pytest.mark.django_db
    def test_list_returns_all(self, medicine_batch_model):
        batches = MedicineBatchRepository().list()

        assert len(batches) == 1
        assert batches[0].medicine.name == "Amoxicillin"

    @pytest.mark.django_db
    def test_update_persists_changes(self, medicine_batch_model):
        batch = MedicineBatchRepository().get(medicine_batch_model.id)

        updated = MedicineBatchRepository().update(
            MedicineBatch(
                id=batch.id,
                medicine=batch.medicine,
                batch_number=batch.batch_number,
                quantity=Decimal("45.00"),
                expiry_date=batch.expiry_date,
                received_at=batch.received_at,
            )
        )

        assert updated.quantity == Decimal("45.00")
        medicine_batch_model.refresh_from_db()
        assert medicine_batch_model.quantity == Decimal("45.00")

    @pytest.mark.django_db
    def test_delete_removes_batch(self, medicine_batch_model):
        MedicineBatchRepository().delete(medicine_batch_model.id)

        assert not MedicineBatchModel.objects.filter(
            id=medicine_batch_model.id
        ).exists()


class TestVisitRepository:
    @pytest.mark.django_db
    def test_add_creates_visit(self, patient_model, veterinarian_model):
        visit = VisitRepository().add(
            Visit(
                patient=patient_to_dataclass(patient_model),
                veterinarian=user_to_dataclass(veterinarian_model),
                visit_date=datetime(2026, 2, 1, 9, 30),
                diagnosis="Vaccination",
            )
        )

        assert visit.id is not None
        assert VisitModel.objects.filter(id=visit.id, diagnosis="Vaccination").exists()

    @pytest.mark.django_db
    def test_get_returns_none_for_missing(self):
        assert VisitRepository().get(999999) is None

    @pytest.mark.django_db
    def test_get_returns_visit_with_nested_relations(self, visit_model):
        visit = VisitRepository().get(visit_model.id)

        assert visit is not None
        assert visit.patient.name == "Rex"
        assert visit.veterinarian.email == "vet@example.com"
        assert visit.diagnosis == "Routine checkup"
        assert visit.notes == []
        assert visit.prescribed_medicines == []

    @pytest.mark.django_db
    def test_get_includes_notes_and_prescribed_medicines(
        self, visit_model, medicine_model
    ):
        VisitNoteModel.objects.create(visit=visit_model, content="Patient is healthy")
        VisitNoteModel.objects.create(visit=visit_model, content="Follow-up in 2 weeks")
        PrescribedMedicineModel.objects.create(
            visit=visit_model,
            medicine=medicine_model,
            quantity=Decimal("2.00"),
            dosage="1 tablet twice a day",
        )

        visit = VisitRepository().get(visit_model.id)

        assert len(visit.notes) == 2
        assert {n.content for n in visit.notes} == {
            "Patient is healthy",
            "Follow-up in 2 weeks",
        }
        assert len(visit.prescribed_medicines) == 1
        assert visit.prescribed_medicines[0].medicine.name == "Amoxicillin"
        assert visit.prescribed_medicines[0].quantity == Decimal("2.00")

    @pytest.mark.django_db
    def test_list_returns_all(self, visit_model):
        visits = VisitRepository().list()

        assert len(visits) == 1
        assert visits[0].patient.name == "Rex"

    @pytest.mark.django_db
    def test_update_persists_changes(self, visit_model):
        visit = VisitRepository().get(visit_model.id)

        updated = VisitRepository().update(
            Visit(
                id=visit.id,
                patient=visit.patient,
                veterinarian=visit.veterinarian,
                visit_date=visit.visit_date,
                diagnosis="Follow-up examination",
            )
        )

        assert updated.diagnosis == "Follow-up examination"
        visit_model.refresh_from_db()
        assert visit_model.diagnosis == "Follow-up examination"

    @pytest.mark.django_db
    def test_delete_removes_visit(self, visit_model):
        VisitRepository().delete(visit_model.id)

        assert not VisitModel.objects.filter(id=visit_model.id).exists()


class TestVisitNoteRepository:
    @pytest.mark.django_db
    def test_add_creates_note(self, visit_model):
        visit = VisitRepository().get(visit_model.id)

        note = VisitNoteRepository().add(
            VisitNote(visit=visit, content="No abnormalities found")
        )

        assert note.id is not None
        assert VisitNoteModel.objects.filter(
            visit_id=visit_model.id, content="No abnormalities found"
        ).exists()

    @pytest.mark.django_db
    def test_get_returns_none_for_missing(self):
        assert VisitNoteRepository().get(999999) is None

    @pytest.mark.django_db
    def test_update_persists_changes(self, visit_model):
        visit = VisitRepository().get(visit_model.id)
        note = VisitNoteRepository().add(VisitNote(visit=visit, content="Initial"))

        updated = VisitNoteRepository().update(
            VisitNote(id=note.id, visit=visit, content="Updated content")
        )

        assert updated.content == "Updated content"

    @pytest.mark.django_db
    def test_delete_removes_note(self, visit_model):
        visit = VisitRepository().get(visit_model.id)
        note = VisitNoteRepository().add(VisitNote(visit=visit, content="Initial"))

        VisitNoteRepository().delete(note.id)

        assert not VisitNoteModel.objects.filter(id=note.id).exists()


class TestPrescribedMedicineRepository:
    @pytest.mark.django_db
    def test_add_creates_prescribed_medicine(self, visit_model, medicine_model):
        visit = VisitRepository().get(visit_model.id)
        medicine = MedicineRepository().get(medicine_model.id)

        prescription = PrescribedMedicineRepository().add(
            PrescribedMedicine(
                visit=visit,
                medicine=medicine,
                quantity=Decimal("1.00"),
                dosage="Once daily",
            )
        )

        assert prescription.id is not None
        assert PrescribedMedicineModel.objects.filter(
            visit_id=visit_model.id, medicine_id=medicine_model.id
        ).exists()

    @pytest.mark.django_db
    def test_get_returns_none_for_missing(self):
        assert PrescribedMedicineRepository().get(999999) is None

    @pytest.mark.django_db
    def test_list_returns_all(self, visit_model, medicine_model):
        PrescribedMedicineModel.objects.create(
            visit=visit_model,
            medicine=medicine_model,
            quantity=Decimal("3.00"),
            dosage="Twice daily",
        )

        prescriptions = PrescribedMedicineRepository().list()

        assert len(prescriptions) == 1
        assert prescriptions[0].medicine.name == "Amoxicillin"

    @pytest.mark.django_db
    def test_update_persists_changes(self, visit_model, medicine_model):
        obj = PrescribedMedicineModel.objects.create(
            visit=visit_model,
            medicine=medicine_model,
            quantity=Decimal("1.00"),
        )
        prescription = PrescribedMedicineRepository().get(obj.id)

        updated = PrescribedMedicineRepository().update(
            PrescribedMedicine(
                id=prescription.id,
                visit=prescription.visit,
                medicine=prescription.medicine,
                quantity=Decimal("5.00"),
                dosage="Three times daily",
            )
        )

        assert updated.quantity == Decimal("5.00")
        assert updated.dosage == "Three times daily"

    @pytest.mark.django_db
    def test_delete_removes_prescribed_medicine(self, visit_model, medicine_model):
        obj = PrescribedMedicineModel.objects.create(
            visit=visit_model,
            medicine=medicine_model,
            quantity=Decimal("1.00"),
        )

        PrescribedMedicineRepository().delete(obj.id)

        assert not PrescribedMedicineModel.objects.filter(id=obj.id).exists()


class TestServiceRepository:
    @pytest.mark.django_db
    def test_add_creates_service(self):
        service = ServiceRepository().add(
            Service(name="Vaccination", price=Decimal("50.00"), duration_minutes=15)
        )

        assert service.id is not None
        assert ServiceModel.objects.filter(name="Vaccination").exists()

    @pytest.mark.django_db
    def test_get_returns_none_for_missing(self):
        assert ServiceRepository().get(999999) is None

    @pytest.mark.django_db
    def test_get_returns_existing(self, service_model):
        service = ServiceRepository().get(service_model.id)

        assert service.name == "Consultation"
        assert service.price == Decimal("100.00")

    @pytest.mark.django_db
    def test_list_returns_all(self, service_model):
        ServiceModel.objects.create(name="Vaccination", price=Decimal("50.00"))

        services = ServiceRepository().list()

        assert {s.name for s in services} == {"Consultation", "Vaccination"}

    @pytest.mark.django_db
    def test_update_persists_changes(self, service_model):
        service = ServiceRepository().get(service_model.id)

        updated = ServiceRepository().update(
            Service(
                id=service.id,
                name=service.name,
                price=Decimal("120.00"),
                is_active=False,
            )
        )

        assert updated.price == Decimal("120.00")
        assert updated.is_active is False
        service_model.refresh_from_db()
        assert service_model.price == Decimal("120.00")
        assert service_model.is_active is False

    @pytest.mark.django_db
    def test_delete_removes_service(self, service_model):
        ServiceRepository().delete(service_model.id)

        assert not ServiceModel.objects.filter(id=service_model.id).exists()


class TestVisitServiceRepository:
    @pytest.mark.django_db
    def test_add_creates_visit_service(self, visit_model, service_model):
        visit = VisitRepository().get(visit_model.id)
        service = ServiceRepository().get(service_model.id)

        visit_service = VisitServiceRepository().add(
            VisitService(
                visit=visit,
                service=service,
                quantity=Decimal("1.00"),
                price=Decimal("100.00"),
            )
        )

        assert visit_service.id is not None
        assert VisitServiceModel.objects.filter(
            visit_id=visit_model.id, service_id=service_model.id
        ).exists()

    @pytest.mark.django_db
    def test_get_returns_none_for_missing(self):
        assert VisitServiceRepository().get(999999) is None

    @pytest.mark.django_db
    def test_list_returns_all(self, visit_model, service_model):
        VisitServiceModel.objects.create(
            visit=visit_model, service=service_model, quantity=Decimal("2.00")
        )

        visit_services = VisitServiceRepository().list()

        assert len(visit_services) == 1
        assert visit_services[0].service.name == "Consultation"

    @pytest.mark.django_db
    def test_update_persists_changes(self, visit_model, service_model):
        obj = VisitServiceModel.objects.create(
            visit=visit_model, service=service_model, quantity=Decimal("1.00")
        )
        visit_service = VisitServiceRepository().get(obj.id)

        updated = VisitServiceRepository().update(
            VisitService(
                id=visit_service.id,
                visit=visit_service.visit,
                service=visit_service.service,
                quantity=Decimal("3.00"),
                notes="Discounted",
            )
        )

        assert updated.quantity == Decimal("3.00")
        assert updated.notes == "Discounted"

    @pytest.mark.django_db
    def test_delete_removes_visit_service(self, visit_model, service_model):
        obj = VisitServiceModel.objects.create(
            visit=visit_model, service=service_model, quantity=Decimal("1.00")
        )

        VisitServiceRepository().delete(obj.id)

        assert not VisitServiceModel.objects.filter(id=obj.id).exists()

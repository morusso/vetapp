from datetime import date
from decimal import Decimal

import pytest

from clinical_data.models import Medicine as MedicineModel
from clinical_data.models import MedicineBatch as MedicineBatchModel
from src.models.clinical_data import Medicine, MedicineBatch, MedicineForm
from src.repositories.clinical_data import MedicineBatchRepository, MedicineRepository


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

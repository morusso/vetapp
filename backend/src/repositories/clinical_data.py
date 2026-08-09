from clinical_data.models import Medicine as MedicineModel
from clinical_data.models import MedicineBatch as MedicineBatchModel

from src.models.clinical_data import Medicine, MedicineBatch, MedicineForm
from src.repositories.base import Repository


def medicine_to_dataclass(obj: MedicineModel) -> Medicine:
    return Medicine(
        id=obj.id,
        name=obj.name,
        manufacturer=obj.manufacturer,
        active_substance=obj.active_substance,
        form=MedicineForm(obj.form),
        strength=obj.strength,
        unit=obj.unit,
        description=obj.description,
        withdrawal_period_days=obj.withdrawal_period_days,
        minimum_stock_level=obj.minimum_stock_level,
        requires_prescription=obj.requires_prescription,
        is_controlled_substance=obj.is_controlled_substance,
        created_at=obj.created_at,
        updated_at=obj.updated_at,
    )


def medicine_batch_to_dataclass(obj: MedicineBatchModel) -> MedicineBatch:
    return MedicineBatch(
        id=obj.id,
        medicine=medicine_to_dataclass(obj.medicine),
        batch_number=obj.batch_number,
        quantity=obj.quantity,
        unit_price=obj.unit_price,
        supplier=obj.supplier,
        expiry_date=obj.expiry_date,
        received_at=obj.received_at,
        created_at=obj.created_at,
        updated_at=obj.updated_at,
    )


class MedicineRepository(Repository[Medicine]):
    def get(self, id: int) -> Medicine | None:
        try:
            return medicine_to_dataclass(MedicineModel.objects.get(id=id))
        except MedicineModel.DoesNotExist:
            return None

    def list(self) -> list[Medicine]:
        return [medicine_to_dataclass(obj) for obj in MedicineModel.objects.all()]

    def add(self, entity: Medicine) -> Medicine:
        obj = MedicineModel.objects.create(
            name=entity.name,
            manufacturer=entity.manufacturer,
            active_substance=entity.active_substance,
            form=entity.form,
            strength=entity.strength,
            unit=entity.unit,
            description=entity.description,
            withdrawal_period_days=entity.withdrawal_period_days,
            minimum_stock_level=entity.minimum_stock_level,
            requires_prescription=entity.requires_prescription,
            is_controlled_substance=entity.is_controlled_substance,
        )
        return medicine_to_dataclass(obj)

    def update(self, entity: Medicine) -> Medicine:
        obj = MedicineModel.objects.get(id=entity.id)
        obj.name = entity.name
        obj.manufacturer = entity.manufacturer
        obj.active_substance = entity.active_substance
        obj.form = entity.form
        obj.strength = entity.strength
        obj.unit = entity.unit
        obj.description = entity.description
        obj.withdrawal_period_days = entity.withdrawal_period_days
        obj.minimum_stock_level = entity.minimum_stock_level
        obj.requires_prescription = entity.requires_prescription
        obj.is_controlled_substance = entity.is_controlled_substance
        obj.save()
        return medicine_to_dataclass(obj)

    def delete(self, id: int) -> None:
        MedicineModel.objects.filter(id=id).delete()


class MedicineBatchRepository(Repository[MedicineBatch]):
    def get(self, id: int) -> MedicineBatch | None:
        try:
            obj = MedicineBatchModel.objects.select_related("medicine").get(id=id)
        except MedicineBatchModel.DoesNotExist:
            return None
        return medicine_batch_to_dataclass(obj)

    def list(self) -> list[MedicineBatch]:
        return [
            medicine_batch_to_dataclass(obj)
            for obj in MedicineBatchModel.objects.select_related("medicine").all()
        ]

    def add(self, entity: MedicineBatch) -> MedicineBatch:
        obj = MedicineBatchModel.objects.create(
            medicine_id=entity.medicine.id,
            batch_number=entity.batch_number,
            quantity=entity.quantity,
            unit_price=entity.unit_price,
            supplier=entity.supplier,
            expiry_date=entity.expiry_date,
            received_at=entity.received_at,
        )
        return MedicineBatch(
            id=obj.id,
            medicine=entity.medicine,
            batch_number=obj.batch_number,
            quantity=obj.quantity,
            unit_price=obj.unit_price,
            supplier=obj.supplier,
            expiry_date=obj.expiry_date,
            received_at=obj.received_at,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )

    def update(self, entity: MedicineBatch) -> MedicineBatch:
        obj = MedicineBatchModel.objects.get(id=entity.id)
        obj.medicine_id = entity.medicine.id
        obj.batch_number = entity.batch_number
        obj.quantity = entity.quantity
        obj.unit_price = entity.unit_price
        obj.supplier = entity.supplier
        obj.expiry_date = entity.expiry_date
        obj.received_at = entity.received_at
        obj.save()
        return MedicineBatch(
            id=obj.id,
            medicine=entity.medicine,
            batch_number=obj.batch_number,
            quantity=obj.quantity,
            unit_price=obj.unit_price,
            supplier=obj.supplier,
            expiry_date=obj.expiry_date,
            received_at=obj.received_at,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )

    def delete(self, id: int) -> None:
        MedicineBatchModel.objects.filter(id=id).delete()

from clinical_data.models import Medicine as MedicineModel
from clinical_data.models import MedicineBatch as MedicineBatchModel
from clinical_data.models import PrescribedMedicine as PrescribedMedicineModel
from clinical_data.models import Visit as VisitModel
from clinical_data.models import VisitNote as VisitNoteModel

from src.models.clinical_data import (
    Medicine,
    MedicineBatch,
    MedicineForm,
    PrescribedMedicine,
    Visit,
    VisitNote,
)
from src.repositories.animals import PATIENT_RELATIONS, patient_to_dataclass
from src.repositories.base import Repository
from src.repositories.user import user_to_dataclass

VISIT_RELATIONS = tuple(f"patient__{relation}" for relation in PATIENT_RELATIONS) + (
    "patient",
    "veterinarian",
)
VISIT_FK_RELATIONS = tuple(f"visit__{relation}" for relation in VISIT_RELATIONS)


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


def visit_note_to_dataclass(obj: VisitNoteModel) -> VisitNote:
    return VisitNote(
        id=obj.id,
        visit=visit_to_dataclass(obj.visit),
        content=obj.content,
        created_at=obj.created_at,
        updated_at=obj.updated_at,
    )


def prescribed_medicine_to_dataclass(obj: PrescribedMedicineModel) -> PrescribedMedicine:
    return PrescribedMedicine(
        id=obj.id,
        visit=visit_to_dataclass(obj.visit),
        medicine=medicine_to_dataclass(obj.medicine),
        quantity=obj.quantity,
        dosage=obj.dosage,
        created_at=obj.created_at,
        updated_at=obj.updated_at,
    )


def visit_to_dataclass(obj: VisitModel) -> Visit:
    visit = Visit(
        id=obj.id,
        patient=patient_to_dataclass(obj.patient),
        veterinarian=user_to_dataclass(obj.veterinarian),
        visit_date=obj.visit_date,
        diagnosis=obj.diagnosis,
        created_at=obj.created_at,
        updated_at=obj.updated_at,
    )
    visit.notes = [
        VisitNote(
            id=note.id,
            visit=visit,
            content=note.content,
            created_at=note.created_at,
            updated_at=note.updated_at,
        )
        for note in obj.notes.all()
    ]
    visit.prescribed_medicines = [
        PrescribedMedicine(
            id=pm.id,
            visit=visit,
            medicine=medicine_to_dataclass(pm.medicine),
            quantity=pm.quantity,
            dosage=pm.dosage,
            created_at=pm.created_at,
            updated_at=pm.updated_at,
        )
        for pm in obj.prescribed_medicines.select_related("medicine").all()
    ]
    return visit


class VisitRepository(Repository[Visit]):
    def get(self, id: int) -> Visit | None:
        try:
            obj = VisitModel.objects.select_related(*VISIT_RELATIONS).get(id=id)
        except VisitModel.DoesNotExist:
            return None
        return visit_to_dataclass(obj)

    def list(self) -> list[Visit]:
        return [
            visit_to_dataclass(obj)
            for obj in VisitModel.objects.select_related(*VISIT_RELATIONS).all()
        ]

    def add(self, entity: Visit) -> Visit:
        obj = VisitModel.objects.create(
            patient_id=entity.patient.id,
            veterinarian_id=entity.veterinarian.id,
            visit_date=entity.visit_date,
            diagnosis=entity.diagnosis,
        )
        return Visit(
            id=obj.id,
            patient=entity.patient,
            veterinarian=entity.veterinarian,
            visit_date=obj.visit_date,
            diagnosis=obj.diagnosis,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )

    def update(self, entity: Visit) -> Visit:
        obj = VisitModel.objects.get(id=entity.id)
        obj.patient_id = entity.patient.id
        obj.veterinarian_id = entity.veterinarian.id
        obj.visit_date = entity.visit_date
        obj.diagnosis = entity.diagnosis
        obj.save()
        return Visit(
            id=obj.id,
            patient=entity.patient,
            veterinarian=entity.veterinarian,
            visit_date=obj.visit_date,
            diagnosis=obj.diagnosis,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )

    def delete(self, id: int) -> None:
        VisitModel.objects.filter(id=id).delete()


class VisitNoteRepository(Repository[VisitNote]):
    def get(self, id: int) -> VisitNote | None:
        try:
            obj = VisitNoteModel.objects.select_related(
                *VISIT_FK_RELATIONS
            ).get(id=id)
        except VisitNoteModel.DoesNotExist:
            return None
        return visit_note_to_dataclass(obj)

    def list(self) -> list[VisitNote]:
        return [
            visit_note_to_dataclass(obj)
            for obj in VisitNoteModel.objects.select_related(*VISIT_FK_RELATIONS).all()
        ]

    def add(self, entity: VisitNote) -> VisitNote:
        obj = VisitNoteModel.objects.create(
            visit_id=entity.visit.id, content=entity.content
        )
        return VisitNote(
            id=obj.id,
            visit=entity.visit,
            content=obj.content,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )

    def update(self, entity: VisitNote) -> VisitNote:
        obj = VisitNoteModel.objects.get(id=entity.id)
        obj.content = entity.content
        obj.save()
        return VisitNote(
            id=obj.id,
            visit=entity.visit,
            content=obj.content,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )

    def delete(self, id: int) -> None:
        VisitNoteModel.objects.filter(id=id).delete()


class PrescribedMedicineRepository(Repository[PrescribedMedicine]):
    def get(self, id: int) -> PrescribedMedicine | None:
        try:
            obj = PrescribedMedicineModel.objects.select_related(
                "medicine", *VISIT_FK_RELATIONS
            ).get(id=id)
        except PrescribedMedicineModel.DoesNotExist:
            return None
        return prescribed_medicine_to_dataclass(obj)

    def list(self) -> list[PrescribedMedicine]:
        return [
            prescribed_medicine_to_dataclass(obj)
            for obj in PrescribedMedicineModel.objects.select_related(
                "medicine", *VISIT_FK_RELATIONS
            ).all()
        ]

    def add(self, entity: PrescribedMedicine) -> PrescribedMedicine:
        obj = PrescribedMedicineModel.objects.create(
            visit_id=entity.visit.id,
            medicine_id=entity.medicine.id,
            quantity=entity.quantity,
            dosage=entity.dosage,
        )
        return PrescribedMedicine(
            id=obj.id,
            visit=entity.visit,
            medicine=entity.medicine,
            quantity=obj.quantity,
            dosage=obj.dosage,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )

    def update(self, entity: PrescribedMedicine) -> PrescribedMedicine:
        obj = PrescribedMedicineModel.objects.get(id=entity.id)
        obj.visit_id = entity.visit.id
        obj.medicine_id = entity.medicine.id
        obj.quantity = entity.quantity
        obj.dosage = entity.dosage
        obj.save()
        return PrescribedMedicine(
            id=obj.id,
            visit=entity.visit,
            medicine=entity.medicine,
            quantity=obj.quantity,
            dosage=obj.dosage,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )

    def delete(self, id: int) -> None:
        PrescribedMedicineModel.objects.filter(id=id).delete()

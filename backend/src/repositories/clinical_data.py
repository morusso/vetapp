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
from src.repositories.animals import PATIENT_RELATIONS, patient_to_dataclass
from src.repositories.base import DjangoRepository
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
        purchase_price=obj.purchase_price,
        sale_price=obj.sale_price,
        tax_rate=obj.tax_rate,
        supplier=obj.supplier,
        expiry_date=obj.expiry_date,
        received_at=obj.received_at,
        created_at=obj.created_at,
        updated_at=obj.updated_at,
    )


class MedicineRepository(DjangoRepository[Medicine]):
    model = MedicineModel
    to_dataclass = staticmethod(medicine_to_dataclass)


class MedicineBatchRepository(DjangoRepository[MedicineBatch]):
    model = MedicineBatchModel
    relations = frozenset({"medicine"})
    select_related = ("medicine",)
    to_dataclass = staticmethod(medicine_batch_to_dataclass)


def service_to_dataclass(obj: ServiceModel) -> Service:
    return Service(
        id=obj.id,
        name=obj.name,
        description=obj.description,
        price=obj.price,
        tax_rate=obj.tax_rate,
        duration_minutes=obj.duration_minutes,
        is_active=obj.is_active,
        created_at=obj.created_at,
        updated_at=obj.updated_at,
    )


class ServiceRepository(DjangoRepository[Service]):
    model = ServiceModel
    to_dataclass = staticmethod(service_to_dataclass)


def visit_note_to_dataclass(obj: VisitNoteModel) -> VisitNote:
    return VisitNote(
        id=obj.id,
        visit=visit_to_dataclass(obj.visit),
        content=obj.content,
        author=user_to_dataclass(obj.author) if obj.author else None,
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


def visit_service_to_dataclass(obj: VisitServiceModel) -> VisitService:
    return VisitService(
        id=obj.id,
        visit=visit_to_dataclass(obj.visit),
        service=service_to_dataclass(obj.service),
        quantity=obj.quantity,
        price=obj.price,
        tax_rate=obj.tax_rate,
        notes=obj.notes,
        vaccine_valid_until=obj.vaccine_valid_until,
        notification_channel=obj.notification_channel,
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
            author=user_to_dataclass(note.author) if note.author else None,
            created_at=note.created_at,
            updated_at=note.updated_at,
        )
        for note in obj.notes.select_related("author").all()
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
    visit.visit_services = [
        VisitService(
            id=vs.id,
            visit=visit,
            service=service_to_dataclass(vs.service),
            quantity=vs.quantity,
            price=vs.price,
            tax_rate=vs.tax_rate,
            notes=vs.notes,
            vaccine_valid_until=vs.vaccine_valid_until,
            notification_channel=vs.notification_channel,
            created_at=vs.created_at,
            updated_at=vs.updated_at,
        )
        for vs in obj.visit_services.select_related("service").all()
    ]
    return visit


class VisitRepository(DjangoRepository[Visit]):
    model = VisitModel
    relations = frozenset({"patient", "veterinarian"})
    select_related = VISIT_RELATIONS
    to_dataclass = staticmethod(visit_to_dataclass)


class VisitNoteRepository(DjangoRepository[VisitNote]):
    model = VisitNoteModel
    relations = frozenset({"visit", "author"})
    select_related = ("author", *VISIT_FK_RELATIONS)
    to_dataclass = staticmethod(visit_note_to_dataclass)


class PrescribedMedicineRepository(DjangoRepository[PrescribedMedicine]):
    model = PrescribedMedicineModel
    relations = frozenset({"visit", "medicine"})
    select_related = ("medicine", *VISIT_FK_RELATIONS)
    to_dataclass = staticmethod(prescribed_medicine_to_dataclass)


class VisitServiceRepository(DjangoRepository[VisitService]):
    model = VisitServiceModel
    relations = frozenset({"visit", "service"})
    select_related = ("service", *VISIT_FK_RELATIONS)
    to_dataclass = staticmethod(visit_service_to_dataclass)

from animals.models import Animal as AnimalModel
from animals.models import AnimalType as AnimalTypeModel
from animals.models import Patient as PatientModel
from animals.models import PatientWeight as PatientWeightModel

from src.models.animals import Animal, AnimalType, Patient, PatientWeight, Sex
from src.repositories.base import DjangoRepository
from src.repositories.clients import client_to_dataclass

PATIENT_RELATIONS = ("owner", "breed", "breed__animal_type")
PATIENT_WEIGHT_RELATIONS = tuple(
    f"patient__{relation}" for relation in PATIENT_RELATIONS
) + ("patient",)


def animal_type_to_dataclass(obj: AnimalTypeModel) -> AnimalType:
    return AnimalType(
        id=obj.id,
        name=obj.name,
        description=obj.description,
        created_at=obj.created_at,
        updated_at=obj.updated_at,
    )


def animal_to_dataclass(obj: AnimalModel) -> Animal:
    return Animal(
        id=obj.id,
        name=obj.name,
        animal_type=animal_type_to_dataclass(obj.animal_type),
        description=obj.description,
        created_at=obj.created_at,
        updated_at=obj.updated_at,
    )


def patient_to_dataclass(obj: PatientModel) -> Patient:
    return Patient(
        id=obj.id,
        name=obj.name,
        owner=client_to_dataclass(obj.owner),
        breed=animal_to_dataclass(obj.breed),
        sex=Sex(obj.sex),
        birth_date=obj.birth_date,
        color=obj.color,
        microchip_number=obj.microchip_number,
        note=obj.note,
        is_sterilized=obj.is_sterilized,
        is_deceased=obj.is_deceased,
        date_of_death=obj.date_of_death,
        created_at=obj.created_at,
        updated_at=obj.updated_at,
    )


def patient_weight_to_dataclass(obj: PatientWeightModel) -> PatientWeight:
    return PatientWeight(
        id=obj.id,
        patient=patient_to_dataclass(obj.patient),
        weight_kg=obj.weight_kg,
        recorded_at=obj.recorded_at,
        created_at=obj.created_at,
    )


class AnimalTypeRepository(DjangoRepository[AnimalType]):
    model = AnimalTypeModel
    to_dataclass = staticmethod(animal_type_to_dataclass)


class AnimalRepository(DjangoRepository[Animal]):
    model = AnimalModel
    relations = frozenset({"animal_type"})
    select_related = ("animal_type",)
    to_dataclass = staticmethod(animal_to_dataclass)


class PatientRepository(DjangoRepository[Patient]):
    model = PatientModel
    relations = frozenset({"owner", "breed"})
    select_related = PATIENT_RELATIONS
    to_dataclass = staticmethod(patient_to_dataclass)


class PatientWeightRepository(DjangoRepository[PatientWeight]):
    model = PatientWeightModel
    relations = frozenset({"patient"})
    select_related = PATIENT_WEIGHT_RELATIONS
    to_dataclass = staticmethod(patient_weight_to_dataclass)

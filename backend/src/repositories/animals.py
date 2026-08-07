from animals.models import Animal as AnimalModel
from animals.models import AnimalType as AnimalTypeModel
from animals.models import Patient as PatientModel
from animals.models import PatientWeight as PatientWeightModel

from src.models.animals import Animal, AnimalType, Patient, PatientWeight, Sex
from src.repositories.base import Repository
from src.repositories.clients import client_to_dataclass

PATIENT_RELATIONS = ("owner", "breed", "breed__animal_type")
PATIENT_WEIGHT_RELATIONS = tuple(f"patient__{relation}" for relation in PATIENT_RELATIONS) + (
    "patient",
)


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


class AnimalTypeRepository(Repository[AnimalType]):
    def get(self, id: int) -> AnimalType | None:
        try:
            return animal_type_to_dataclass(AnimalTypeModel.objects.get(id=id))
        except AnimalTypeModel.DoesNotExist:
            return None

    def list(self) -> list[AnimalType]:
        return [animal_type_to_dataclass(obj) for obj in AnimalTypeModel.objects.all()]

    def add(self, entity: AnimalType) -> AnimalType:
        obj = AnimalTypeModel.objects.create(name=entity.name, description=entity.description)
        return animal_type_to_dataclass(obj)

    def update(self, entity: AnimalType) -> AnimalType:
        obj = AnimalTypeModel.objects.get(id=entity.id)
        obj.name = entity.name
        obj.description = entity.description
        obj.save()
        return animal_type_to_dataclass(obj)

    def delete(self, id: int) -> None:
        AnimalTypeModel.objects.filter(id=id).delete()


class AnimalRepository(Repository[Animal]):
    def get(self, id: int) -> Animal | None:
        try:
            obj = AnimalModel.objects.select_related("animal_type").get(id=id)
        except AnimalModel.DoesNotExist:
            return None
        return animal_to_dataclass(obj)

    def list(self) -> list[Animal]:
        return [
            animal_to_dataclass(obj)
            for obj in AnimalModel.objects.select_related("animal_type").all()
        ]

    def add(self, entity: Animal) -> Animal:
        obj = AnimalModel.objects.create(
            name=entity.name,
            animal_type_id=entity.animal_type.id,
            description=entity.description,
        )
        return Animal(
            id=obj.id,
            name=obj.name,
            animal_type=entity.animal_type,
            description=obj.description,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )

    def update(self, entity: Animal) -> Animal:
        obj = AnimalModel.objects.get(id=entity.id)
        obj.name = entity.name
        obj.animal_type_id = entity.animal_type.id
        obj.description = entity.description
        obj.save()
        return Animal(
            id=obj.id,
            name=obj.name,
            animal_type=entity.animal_type,
            description=obj.description,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )

    def delete(self, id: int) -> None:
        AnimalModel.objects.filter(id=id).delete()


class PatientRepository(Repository[Patient]):
    def get(self, id: int) -> Patient | None:
        try:
            obj = PatientModel.objects.select_related(*PATIENT_RELATIONS).get(id=id)
        except PatientModel.DoesNotExist:
            return None
        return patient_to_dataclass(obj)

    def list(self) -> list[Patient]:
        return [
            patient_to_dataclass(obj)
            for obj in PatientModel.objects.select_related(*PATIENT_RELATIONS).all()
        ]

    def add(self, entity: Patient) -> Patient:
        obj = PatientModel.objects.create(
            name=entity.name,
            owner_id=entity.owner.id,
            breed_id=entity.breed.id,
            sex=entity.sex,
            birth_date=entity.birth_date,
            color=entity.color,
            microchip_number=entity.microchip_number,
            note=entity.note,
            is_sterilized=entity.is_sterilized,
            is_deceased=entity.is_deceased,
            date_of_death=entity.date_of_death,
        )
        return Patient(
            id=obj.id,
            name=obj.name,
            owner=entity.owner,
            breed=entity.breed,
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

    def update(self, entity: Patient) -> Patient:
        obj = PatientModel.objects.get(id=entity.id)
        obj.name = entity.name
        obj.owner_id = entity.owner.id
        obj.breed_id = entity.breed.id
        obj.sex = entity.sex
        obj.birth_date = entity.birth_date
        obj.color = entity.color
        obj.microchip_number = entity.microchip_number
        obj.note = entity.note
        obj.is_sterilized = entity.is_sterilized
        obj.is_deceased = entity.is_deceased
        obj.date_of_death = entity.date_of_death
        obj.save()
        return Patient(
            id=obj.id,
            name=obj.name,
            owner=entity.owner,
            breed=entity.breed,
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

    def delete(self, id: int) -> None:
        PatientModel.objects.filter(id=id).delete()


class PatientWeightRepository(Repository[PatientWeight]):
    def get(self, id: int) -> PatientWeight | None:
        try:
            obj = PatientWeightModel.objects.select_related(*PATIENT_WEIGHT_RELATIONS).get(
                id=id
            )
        except PatientWeightModel.DoesNotExist:
            return None
        return patient_weight_to_dataclass(obj)

    def list(self) -> list[PatientWeight]:
        return [
            patient_weight_to_dataclass(obj)
            for obj in PatientWeightModel.objects.select_related(*PATIENT_WEIGHT_RELATIONS).all()
        ]

    def add(self, entity: PatientWeight) -> PatientWeight:
        obj = PatientWeightModel.objects.create(
            patient_id=entity.patient.id,
            weight_kg=entity.weight_kg,
            recorded_at=entity.recorded_at,
        )
        return PatientWeight(
            id=obj.id,
            patient=entity.patient,
            weight_kg=obj.weight_kg,
            recorded_at=obj.recorded_at,
            created_at=obj.created_at,
        )

    def update(self, entity: PatientWeight) -> PatientWeight:
        obj = PatientWeightModel.objects.get(id=entity.id)
        obj.patient_id = entity.patient.id
        obj.weight_kg = entity.weight_kg
        obj.recorded_at = entity.recorded_at
        obj.save()
        return PatientWeight(
            id=obj.id,
            patient=entity.patient,
            weight_kg=obj.weight_kg,
            recorded_at=obj.recorded_at,
            created_at=obj.created_at,
        )

    def delete(self, id: int) -> None:
        PatientWeightModel.objects.filter(id=id).delete()

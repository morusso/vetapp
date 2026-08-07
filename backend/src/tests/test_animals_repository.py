from datetime import date
from decimal import Decimal

import pytest

from animals.models import Animal as AnimalModel
from animals.models import AnimalType as AnimalTypeModel
from animals.models import Patient as PatientModel
from animals.models import PatientWeight as PatientWeightModel
from clients.models import Client as ClientModel
from src.models.animals import Animal, AnimalType, Patient, PatientWeight, Sex
from src.repositories.animals import (
    AnimalRepository,
    AnimalTypeRepository,
    PatientRepository,
    PatientWeightRepository,
)
from src.repositories.clients import client_to_dataclass


@pytest.fixture
def animal_type_model(db):
    return AnimalTypeModel.objects.create(name="Dog")


@pytest.fixture
def animal_model(animal_type_model):
    return AnimalModel.objects.create(name="Labrador", animal_type=animal_type_model)


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
def patient_model(owner_model, animal_model):
    return PatientModel.objects.create(name="Burek", owner=owner_model, breed=animal_model)


class TestAnimalTypeRepository:
    @pytest.mark.django_db
    def test_add_creates_animal_type(self):
        animal_type = AnimalTypeRepository().add(AnimalType(name="Cat", description="Feline"))

        assert animal_type.id is not None
        assert AnimalTypeModel.objects.filter(name="Cat").exists()

    @pytest.mark.django_db
    def test_get_returns_none_for_missing(self):
        assert AnimalTypeRepository().get(999999) is None

    @pytest.mark.django_db
    def test_get_returns_existing(self, animal_type_model):
        animal_type = AnimalTypeRepository().get(animal_type_model.id)

        assert animal_type.name == "Dog"

    @pytest.mark.django_db
    def test_list_returns_all(self, animal_type_model):
        AnimalTypeModel.objects.create(name="Cat")

        animal_types = AnimalTypeRepository().list()

        assert {a.name for a in animal_types} == {"Dog", "Cat"}

    @pytest.mark.django_db
    def test_update_persists_changes(self, animal_type_model):
        updated = AnimalTypeRepository().update(
            AnimalType(id=animal_type_model.id, name="Doggo")
        )

        assert updated.name == "Doggo"
        animal_type_model.refresh_from_db()
        assert animal_type_model.name == "Doggo"

    @pytest.mark.django_db
    def test_delete_removes_animal_type(self, animal_type_model):
        AnimalTypeRepository().delete(animal_type_model.id)

        assert not AnimalTypeModel.objects.filter(id=animal_type_model.id).exists()


class TestAnimalRepository:
    @pytest.mark.django_db
    def test_add_creates_animal_with_nested_animal_type(self, animal_type_model):
        animal_type = AnimalTypeRepository().get(animal_type_model.id)

        animal = AnimalRepository().add(Animal(name="Basenji", animal_type=animal_type))

        assert animal.id is not None
        assert animal.animal_type == animal_type
        assert AnimalModel.objects.filter(
            name="Basenji", animal_type=animal_type_model
        ).exists()

    @pytest.mark.django_db
    def test_get_returns_animal_with_nested_animal_type(self, animal_model):
        animal = AnimalRepository().get(animal_model.id)

        assert animal is not None
        assert animal.name == "Labrador"
        assert animal.animal_type.name == "Dog"

    @pytest.mark.django_db
    def test_get_returns_none_for_missing(self):
        assert AnimalRepository().get(999999) is None

    @pytest.mark.django_db
    def test_list_returns_all(self, animal_model):
        animals = AnimalRepository().list()

        assert len(animals) == 1
        assert animals[0].animal_type.name == "Dog"

    @pytest.mark.django_db
    def test_update_persists_changes(self, animal_model):
        animal_type = AnimalTypeRepository().get(animal_model.animal_type_id)

        updated = AnimalRepository().update(
            Animal(id=animal_model.id, name="Max", animal_type=animal_type)
        )

        assert updated.name == "Max"
        animal_model.refresh_from_db()
        assert animal_model.name == "Max"

    @pytest.mark.django_db
    def test_delete_removes_animal(self, animal_model):
        AnimalRepository().delete(animal_model.id)

        assert not AnimalModel.objects.filter(id=animal_model.id).exists()


class TestPatientRepository:
    @pytest.mark.django_db
    def test_add_creates_patient_with_nested_relations(self, owner_model, animal_model):
        owner = client_to_dataclass(owner_model)
        breed = AnimalRepository().get(animal_model.id)

        patient = PatientRepository().add(Patient(name="Reksio", owner=owner, breed=breed))

        assert patient.id is not None
        assert patient.owner == owner
        assert patient.breed == breed
        assert PatientModel.objects.filter(
            name="Reksio", owner=owner_model, breed=animal_model
        ).exists()

    @pytest.mark.django_db
    def test_get_returns_patient_with_full_relation_graph(self, patient_model):
        patient = PatientRepository().get(patient_model.id)

        assert patient is not None
        assert patient.owner.last_name == "Kowalski"
        assert patient.breed.name == "Labrador"
        assert patient.breed.animal_type.name == "Dog"
        assert patient.sex == Sex.UNKNOWN

    @pytest.mark.django_db
    def test_get_returns_none_for_missing(self):
        assert PatientRepository().get(999999) is None

    @pytest.mark.django_db
    def test_list_returns_all(self, patient_model):
        patients = PatientRepository().list()

        assert len(patients) == 1
        assert patients[0].name == "Burek"

    @pytest.mark.django_db
    def test_update_persists_changes(self, patient_model):
        patient = PatientRepository().get(patient_model.id)

        updated = PatientRepository().update(
            Patient(
                id=patient.id,
                name=patient.name,
                owner=patient.owner,
                breed=patient.breed,
                is_sterilized=True,
            )
        )

        assert updated.is_sterilized is True
        patient_model.refresh_from_db()
        assert patient_model.is_sterilized is True

    @pytest.mark.django_db
    def test_delete_removes_patient(self, patient_model):
        PatientRepository().delete(patient_model.id)

        assert not PatientModel.objects.filter(id=patient_model.id).exists()


class TestPatientWeightRepository:
    @pytest.mark.django_db
    def test_add_creates_weight_with_nested_patient(self, patient_model):
        patient = PatientRepository().get(patient_model.id)

        weight = PatientWeightRepository().add(
            PatientWeight(
                patient=patient, weight_kg=Decimal("12.50"), recorded_at=date(2026, 1, 1)
            )
        )

        assert weight.id is not None
        assert weight.patient == patient
        assert PatientWeightModel.objects.filter(
            patient=patient_model, weight_kg=Decimal("12.50")
        ).exists()

    @pytest.mark.django_db
    def test_get_returns_weight_with_full_relation_graph(self, patient_model):
        weight_model = PatientWeightModel.objects.create(
            patient=patient_model, weight_kg=Decimal("12.50"), recorded_at=date(2026, 1, 1)
        )

        weight = PatientWeightRepository().get(weight_model.id)

        assert weight is not None
        assert weight.patient.owner.last_name == "Kowalski"
        assert weight.patient.breed.animal_type.name == "Dog"

    @pytest.mark.django_db
    def test_get_returns_none_for_missing(self):
        assert PatientWeightRepository().get(999999) is None

    @pytest.mark.django_db
    def test_list_returns_all(self, patient_model):
        PatientWeightModel.objects.create(
            patient=patient_model, weight_kg=Decimal("12.50"), recorded_at=date(2026, 1, 1)
        )

        weights = PatientWeightRepository().list()

        assert len(weights) == 1

    @pytest.mark.django_db
    def test_update_persists_changes(self, patient_model):
        weight_model = PatientWeightModel.objects.create(
            patient=patient_model, weight_kg=Decimal("12.50"), recorded_at=date(2026, 1, 1)
        )
        weight = PatientWeightRepository().get(weight_model.id)

        updated = PatientWeightRepository().update(
            PatientWeight(
                id=weight.id,
                patient=weight.patient,
                weight_kg=Decimal("13.00"),
                recorded_at=weight.recorded_at,
            )
        )

        assert updated.weight_kg == Decimal("13.00")
        weight_model.refresh_from_db()
        assert weight_model.weight_kg == Decimal("13.00")

    @pytest.mark.django_db
    def test_delete_removes_weight(self, patient_model):
        weight_model = PatientWeightModel.objects.create(
            patient=patient_model, weight_kg=Decimal("12.50"), recorded_at=date(2026, 1, 1)
        )

        PatientWeightRepository().delete(weight_model.id)

        assert not PatientWeightModel.objects.filter(id=weight_model.id).exists()

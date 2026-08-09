from dataclasses import replace

from rest_framework import generics

from animals.serializers import (
    AnimalSerializer,
    AnimalTypeSerializer,
    PatientSerializer,
    PatientWeightSerializer,
    PatientWithWeightsSerializer,
)
from src.models.animals import Animal, AnimalType, Patient, PatientWeight
from src.repositories.animals import (
    AnimalRepository,
    AnimalTypeRepository,
    PatientRepository,
    PatientWeightRepository,
    animal_to_dataclass,
    animal_type_to_dataclass,
    patient_to_dataclass,
)
from src.repositories.clients import client_to_dataclass
from vetapp.mixins import RepositoryAPIViewMixin


class AnimalTypeListCreateView(RepositoryAPIViewMixin, generics.ListCreateAPIView):
    repository_class = AnimalTypeRepository
    serializer_class = AnimalTypeSerializer

    def perform_create(self, serializer):
        serializer.instance = self.repository.add(AnimalType(**serializer.validated_data))


class AnimalTypeDetailView(RepositoryAPIViewMixin, generics.RetrieveUpdateDestroyAPIView):
    repository_class = AnimalTypeRepository
    serializer_class = AnimalTypeSerializer

    def perform_update(self, serializer):
        entity = replace(serializer.instance, **serializer.validated_data)
        serializer.instance = self.repository.update(entity)


class AnimalListCreateView(RepositoryAPIViewMixin, generics.ListCreateAPIView):
    repository_class = AnimalRepository
    serializer_class = AnimalSerializer

    def perform_create(self, serializer):
        data = dict(serializer.validated_data)
        data["animal_type"] = animal_type_to_dataclass(data["animal_type"])
        serializer.instance = self.repository.add(Animal(**data))


class AnimalDetailView(RepositoryAPIViewMixin, generics.RetrieveUpdateDestroyAPIView):
    repository_class = AnimalRepository
    serializer_class = AnimalSerializer

    def perform_update(self, serializer):
        data = dict(serializer.validated_data)
        if "animal_type" in data:
            data["animal_type"] = animal_type_to_dataclass(data["animal_type"])
        entity = replace(serializer.instance, **data)
        serializer.instance = self.repository.update(entity)


class PatientListCreateView(RepositoryAPIViewMixin, generics.ListCreateAPIView):
    repository_class = PatientRepository
    serializer_class = PatientSerializer

    def perform_create(self, serializer):
        data = dict(serializer.validated_data)
        data["owner"] = client_to_dataclass(data["owner"])
        data["breed"] = animal_to_dataclass(data["breed"])
        serializer.instance = self.repository.add(Patient(**data))


class PatientDetailView(RepositoryAPIViewMixin, generics.RetrieveUpdateDestroyAPIView):
    repository_class = PatientRepository
    serializer_class = PatientSerializer

    def perform_update(self, serializer):
        data = dict(serializer.validated_data)
        if "owner" in data:
            data["owner"] = client_to_dataclass(data["owner"])
        if "breed" in data:
            data["breed"] = animal_to_dataclass(data["breed"])
        entity = replace(serializer.instance, **data)
        serializer.instance = self.repository.update(entity)


class PatientDetailWithWeightsView(RepositoryAPIViewMixin, generics.RetrieveAPIView):
    repository_class = PatientRepository
    serializer_class = PatientWithWeightsSerializer

    def get_object(self):
        patient = super().get_object()
        patient.weight_records = [
            weight
            for weight in PatientWeightRepository().list()
            if weight.patient.id == patient.id
        ]
        return patient


class PatientWeightListCreateView(RepositoryAPIViewMixin, generics.ListCreateAPIView):
    repository_class = PatientWeightRepository
    serializer_class = PatientWeightSerializer

    def get_queryset(self):
        weights = self.repository.list()
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            weights = [w for w in weights if str(w.patient.id) == patient_id]
        return weights

    def perform_create(self, serializer):
        data = dict(serializer.validated_data)
        data["patient"] = patient_to_dataclass(data["patient"])
        serializer.instance = self.repository.add(PatientWeight(**data))


class PatientWeightDetailView(RepositoryAPIViewMixin, generics.RetrieveUpdateDestroyAPIView):
    repository_class = PatientWeightRepository
    serializer_class = PatientWeightSerializer

    def perform_update(self, serializer):
        data = dict(serializer.validated_data)
        if "patient" in data:
            data["patient"] = patient_to_dataclass(data["patient"])
        entity = replace(serializer.instance, **data)
        serializer.instance = self.repository.update(entity)

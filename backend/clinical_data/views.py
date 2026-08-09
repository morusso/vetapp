from dataclasses import replace

from rest_framework import generics

from clinical_data.serializers import MedicineBatchSerializer, MedicineSerializer
from src.models.clinical_data import Medicine, MedicineBatch
from src.repositories.clinical_data import (
    MedicineBatchRepository,
    MedicineRepository,
    medicine_to_dataclass,
)
from vetapp.mixins import RepositoryAPIViewMixin


class MedicineListCreateView(RepositoryAPIViewMixin, generics.ListCreateAPIView):
    repository_class = MedicineRepository
    serializer_class = MedicineSerializer

    def perform_create(self, serializer):
        serializer.instance = self.repository.add(Medicine(**serializer.validated_data))


class MedicineDetailView(RepositoryAPIViewMixin, generics.RetrieveUpdateDestroyAPIView):
    repository_class = MedicineRepository
    serializer_class = MedicineSerializer

    def perform_update(self, serializer):
        entity = replace(serializer.instance, **serializer.validated_data)
        serializer.instance = self.repository.update(entity)


class MedicineBatchListCreateView(RepositoryAPIViewMixin, generics.ListCreateAPIView):
    repository_class = MedicineBatchRepository
    serializer_class = MedicineBatchSerializer

    def get_queryset(self):
        batches = self.repository.list()
        medicine_id = self.request.query_params.get("medicine")
        if medicine_id:
            batches = [b for b in batches if str(b.medicine.id) == medicine_id]
        return batches

    def perform_create(self, serializer):
        data = dict(serializer.validated_data)
        data["medicine"] = medicine_to_dataclass(data["medicine"])
        serializer.instance = self.repository.add(MedicineBatch(**data))


class MedicineBatchDetailView(
    RepositoryAPIViewMixin, generics.RetrieveUpdateDestroyAPIView
):
    repository_class = MedicineBatchRepository
    serializer_class = MedicineBatchSerializer

    def perform_update(self, serializer):
        data = dict(serializer.validated_data)
        if "medicine" in data:
            data["medicine"] = medicine_to_dataclass(data["medicine"])
        entity = replace(serializer.instance, **data)
        serializer.instance = self.repository.update(entity)

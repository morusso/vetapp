from dataclasses import replace

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from clinical_data.permissions import IsNoteAuthorOrAdmin
from clinical_data.serializers import (
    MedicineBatchSerializer,
    MedicineSerializer,
    PrescribedMedicineSerializer,
    VisitNoteSerializer,
    VisitSerializer,
    VisitWithDetailsSerializer,
)
from src.models.clinical_data import Medicine, MedicineBatch, PrescribedMedicine, Visit, VisitNote
from src.repositories.animals import patient_to_dataclass
from src.repositories.clinical_data import (
    MedicineBatchRepository,
    MedicineRepository,
    PrescribedMedicineRepository,
    VisitNoteRepository,
    VisitRepository,
    medicine_to_dataclass,
    visit_to_dataclass,
)
from src.repositories.user import user_to_dataclass
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


class VisitListCreateView(RepositoryAPIViewMixin, generics.ListCreateAPIView):
    repository_class = VisitRepository
    serializer_class = VisitSerializer

    def get_queryset(self):
        visits = self.repository.list()
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            visits = [v for v in visits if str(v.patient.id) == patient_id]
        return visits

    def perform_create(self, serializer):
        data = dict(serializer.validated_data)
        data["patient"] = patient_to_dataclass(data["patient"])
        data["veterinarian"] = user_to_dataclass(data["veterinarian"])
        serializer.instance = self.repository.add(Visit(**data))


class VisitDetailView(RepositoryAPIViewMixin, generics.RetrieveUpdateDestroyAPIView):
    repository_class = VisitRepository
    serializer_class = VisitSerializer

    def perform_update(self, serializer):
        data = dict(serializer.validated_data)
        if "patient" in data:
            data["patient"] = patient_to_dataclass(data["patient"])
        if "veterinarian" in data:
            data["veterinarian"] = user_to_dataclass(data["veterinarian"])
        entity = replace(serializer.instance, **data)
        serializer.instance = self.repository.update(entity)


class VisitDetailWithDetailsView(RepositoryAPIViewMixin, generics.RetrieveAPIView):
    repository_class = VisitRepository
    serializer_class = VisitWithDetailsSerializer


class VisitNoteListCreateView(RepositoryAPIViewMixin, generics.ListCreateAPIView):
    repository_class = VisitNoteRepository
    serializer_class = VisitNoteSerializer

    def get_queryset(self):
        notes = self.repository.list()
        visit_id = self.request.query_params.get("visit")
        if visit_id:
            notes = [n for n in notes if str(n.visit.id) == visit_id]
        return notes

    def perform_create(self, serializer):
        data = dict(serializer.validated_data)
        data["visit"] = visit_to_dataclass(data["visit"])
        data["author"] = user_to_dataclass(self.request.user)
        serializer.instance = self.repository.add(VisitNote(**data))


class VisitNoteDetailView(RepositoryAPIViewMixin, generics.RetrieveUpdateDestroyAPIView):
    repository_class = VisitNoteRepository
    serializer_class = VisitNoteSerializer
    permission_classes = [IsAuthenticated, IsNoteAuthorOrAdmin]

    def perform_update(self, serializer):
        data = dict(serializer.validated_data)
        if "visit" in data:
            data["visit"] = visit_to_dataclass(data["visit"])
        entity = replace(serializer.instance, **data)
        serializer.instance = self.repository.update(entity)


class PrescribedMedicineListCreateView(
    RepositoryAPIViewMixin, generics.ListCreateAPIView
):
    repository_class = PrescribedMedicineRepository
    serializer_class = PrescribedMedicineSerializer

    def get_queryset(self):
        prescriptions = self.repository.list()
        visit_id = self.request.query_params.get("visit")
        if visit_id:
            prescriptions = [p for p in prescriptions if str(p.visit.id) == visit_id]
        return prescriptions

    def perform_create(self, serializer):
        data = dict(serializer.validated_data)
        data["visit"] = visit_to_dataclass(data["visit"])
        data["medicine"] = medicine_to_dataclass(data["medicine"])
        serializer.instance = self.repository.add(PrescribedMedicine(**data))


class PrescribedMedicineDetailView(
    RepositoryAPIViewMixin, generics.RetrieveUpdateDestroyAPIView
):
    repository_class = PrescribedMedicineRepository
    serializer_class = PrescribedMedicineSerializer

    def perform_update(self, serializer):
        data = dict(serializer.validated_data)
        if "visit" in data:
            data["visit"] = visit_to_dataclass(data["visit"])
        if "medicine" in data:
            data["medicine"] = medicine_to_dataclass(data["medicine"])
        entity = replace(serializer.instance, **data)
        serializer.instance = self.repository.update(entity)

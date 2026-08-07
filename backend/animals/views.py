from rest_framework import generics

from animals.models import Animal, AnimalType, Patient, PatientWeight
from animals.serializers import (
    AnimalSerializer,
    AnimalTypeSerializer,
    PatientSerializer,
    PatientWeightSerializer,
)


class AnimalTypeListCreateView(generics.ListCreateAPIView):
    queryset = AnimalType.objects.all()
    serializer_class = AnimalTypeSerializer


class AnimalTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnimalType.objects.all()
    serializer_class = AnimalTypeSerializer


class AnimalListCreateView(generics.ListCreateAPIView):
    queryset = Animal.objects.select_related("animal_type").all()
    serializer_class = AnimalSerializer


class AnimalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Animal.objects.select_related("animal_type").all()
    serializer_class = AnimalSerializer


class PatientListCreateView(generics.ListCreateAPIView):
    queryset = Patient.objects.select_related("owner", "breed").all()
    serializer_class = PatientSerializer


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Patient.objects.select_related("owner", "breed").all()
    serializer_class = PatientSerializer


class PatientWeightListCreateView(generics.ListCreateAPIView):
    serializer_class = PatientWeightSerializer

    def get_queryset(self):
        queryset = PatientWeight.objects.select_related("patient").all()
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        return queryset


class PatientWeightDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PatientWeight.objects.select_related("patient").all()
    serializer_class = PatientWeightSerializer

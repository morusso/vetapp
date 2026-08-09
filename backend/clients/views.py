from dataclasses import replace

from rest_framework import generics

from clients.serializers import ClientSerializer, ClientWithPatientsSerializer
from src.models.clients import Client
from src.repositories.animals import PatientRepository
from src.repositories.clients import ClientRepository
from vetapp.mixins import RepositoryAPIViewMixin


class ClientListCreateView(RepositoryAPIViewMixin, generics.ListCreateAPIView):
    repository_class = ClientRepository
    serializer_class = ClientSerializer

    def perform_create(self, serializer):
        serializer.instance = self.repository.add(Client(**serializer.validated_data))


class ClientDetailView(RepositoryAPIViewMixin, generics.RetrieveUpdateDestroyAPIView):
    repository_class = ClientRepository
    serializer_class = ClientSerializer

    def perform_update(self, serializer):
        entity = replace(serializer.instance, **serializer.validated_data)
        serializer.instance = self.repository.update(entity)


class ClientDetailWithPatientsView(RepositoryAPIViewMixin, generics.RetrieveAPIView):
    repository_class = ClientRepository
    serializer_class = ClientWithPatientsSerializer

    def get_object(self):
        client = super().get_object()
        client.patients = [
            patient
            for patient in PatientRepository().list()
            if patient.owner.id == client.id
        ]
        return client

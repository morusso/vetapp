from dataclasses import replace

from rest_framework import generics

from clients.serializers import ClientSerializer
from src.models.clients import Client
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

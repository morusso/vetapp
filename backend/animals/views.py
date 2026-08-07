from rest_framework import generics

from animals.models import Animal, AnimalType
from animals.serializers import AnimalSerializer, AnimalTypeSerializer


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

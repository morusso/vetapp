from rest_framework import serializers

from animals.models import Animal, AnimalType


class AnimalTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalType
        fields = ["id", "name", "description", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class AnimalSerializer(serializers.ModelSerializer):
    animal_type_name = serializers.CharField(source="animal_type.name", read_only=True)

    class Meta:
        model = Animal
        fields = [
            "id",
            "name",
            "animal_type",
            "animal_type_name",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

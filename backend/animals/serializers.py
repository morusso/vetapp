from rest_framework import serializers

from animals.models import Animal, AnimalType, Patient, PatientWeight


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


class PatientSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    breed_name = serializers.CharField(source="breed.name", read_only=True)

    class Meta:
        model = Patient
        fields = [
            "id",
            "name",
            "owner",
            "owner_name",
            "breed",
            "breed_name",
            "sex",
            "birth_date",
            "color",
            "microchip_number",
            "note",
            "is_sterilized",
            "is_deceased",
            "date_of_death",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_owner_name(self, obj):
        return str(obj.owner)


class PatientWeightSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientWeight
        fields = ["id", "patient", "weight_kg", "recorded_at", "created_at"]
        read_only_fields = ["id", "created_at"]


class PatientWithWeightsSerializer(PatientSerializer):
    weight_records = PatientWeightSerializer(many=True, read_only=True)

    class Meta(PatientSerializer.Meta):
        fields = PatientSerializer.Meta.fields + ["weight_records"]

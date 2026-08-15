from rest_framework import serializers

from clinical_data.models import (
    Medicine,
    MedicineBatch,
    PrescribedMedicine,
    Service,
    Visit,
    VisitNote,
    VisitService,
)


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = [
            "id",
            "name",
            "manufacturer",
            "active_substance",
            "form",
            "strength",
            "unit",
            "description",
            "withdrawal_period_days",
            "minimum_stock_level",
            "requires_prescription",
            "is_controlled_substance",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class MedicineBatchSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source="medicine.name", read_only=True)

    class Meta:
        model = MedicineBatch
        fields = [
            "id",
            "medicine",
            "medicine_name",
            "batch_number",
            "quantity",
            "purchase_price",
            "sale_price",
            "tax_rate",
            "supplier",
            "expiry_date",
            "received_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class VisitSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.name", read_only=True)
    veterinarian_name = serializers.SerializerMethodField()

    class Meta:
        model = Visit
        fields = [
            "id",
            "patient",
            "patient_name",
            "veterinarian",
            "veterinarian_name",
            "visit_date",
            "diagnosis",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_veterinarian_name(self, obj):
        return str(obj.veterinarian)


class VisitNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = VisitNote
        fields = ["id", "visit", "content", "author", "author_name", "created_at", "updated_at"]
        read_only_fields = ["id", "author", "created_at", "updated_at"]

    def get_author_name(self, obj):
        if not obj.author:
            return None
        full_name = f"{obj.author.first_name} {obj.author.last_name}".strip()
        return full_name or obj.author.email


class PrescribedMedicineSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source="medicine.name", read_only=True)

    class Meta:
        model = PrescribedMedicine
        fields = [
            "id",
            "visit",
            "medicine",
            "medicine_name",
            "quantity",
            "dosage",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            "id",
            "name",
            "description",
            "price",
            "tax_rate",
            "duration_minutes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class VisitServiceSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name", read_only=True)

    class Meta:
        model = VisitService
        fields = [
            "id",
            "visit",
            "service",
            "service_name",
            "quantity",
            "price",
            "tax_rate",
            "notes",
            "vaccine_valid_until",
            "notification_channel",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class VisitWithDetailsSerializer(VisitSerializer):
    notes = VisitNoteSerializer(many=True, read_only=True)
    prescribed_medicines = PrescribedMedicineSerializer(many=True, read_only=True)
    visit_services = VisitServiceSerializer(many=True, read_only=True)

    class Meta(VisitSerializer.Meta):
        fields = VisitSerializer.Meta.fields + [
            "notes",
            "prescribed_medicines",
            "visit_services",
        ]

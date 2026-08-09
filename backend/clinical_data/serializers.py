from rest_framework import serializers

from clinical_data.models import Medicine, MedicineBatch, PrescribedMedicine, Visit, VisitNote


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
            "unit_price",
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
    class Meta:
        model = VisitNote
        fields = ["id", "visit", "content", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


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


class VisitWithDetailsSerializer(VisitSerializer):
    note = VisitNoteSerializer(read_only=True)
    prescribed_medicines = PrescribedMedicineSerializer(many=True, read_only=True)

    class Meta(VisitSerializer.Meta):
        fields = VisitSerializer.Meta.fields + ["note", "prescribed_medicines"]

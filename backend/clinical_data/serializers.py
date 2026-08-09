from rest_framework import serializers

from clinical_data.models import Medicine, MedicineBatch


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

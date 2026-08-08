from django.contrib import admin

from clinical_data.models import Medicine, MedicineBatch


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ("name", "manufacturer", "form", "requires_prescription")
    list_filter = ("form", "requires_prescription", "is_controlled_substance")
    search_fields = ("name", "manufacturer", "active_substance")


@admin.register(MedicineBatch)
class MedicineBatchAdmin(admin.ModelAdmin):
    list_display = (
        "medicine",
        "batch_number",
        "quantity",
        "minimum_stock_level",
        "expiry_date",
    )
    list_filter = ("expiry_date",)
    search_fields = ("medicine__name", "batch_number", "supplier")

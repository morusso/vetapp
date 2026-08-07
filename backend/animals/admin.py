from django.contrib import admin

from animals.models import Animal, AnimalType, Patient, PatientWeight


@admin.register(AnimalType)
class AnimalTypeAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ("name", "animal_type")
    list_filter = ("animal_type",)
    search_fields = ("name",)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "breed", "sex", "is_deceased")
    list_filter = ("sex", "is_sterilized", "is_deceased", "breed__animal_type")
    search_fields = ("name", "microchip_number", "owner__first_name", "owner__last_name")


@admin.register(PatientWeight)
class PatientWeightAdmin(admin.ModelAdmin):
    list_display = ("patient", "weight_kg", "recorded_at")
    list_filter = ("recorded_at",)
    search_fields = ("patient__name",)

from django.contrib import admin

from animals.models import Animal, AnimalType


@admin.register(AnimalType)
class AnimalTypeAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ("name", "animal_type")
    list_filter = ("animal_type",)
    search_fields = ("name",)

from django.core.validators import MaxLengthValidator
from django.db import models

from clients.models import Client


class AnimalType(models.Model):
    name = models.CharField(
        max_length=255, unique=True, validators=[MaxLengthValidator(100)]
    )
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Animal(models.Model):
    name = models.CharField(max_length=255, validators=[MaxLengthValidator(150)])
    animal_type = models.ForeignKey(
        AnimalType, on_delete=models.PROTECT, related_name="animals"
    )
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Patient(models.Model):
    class Sex(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        UNKNOWN = "unknown", "Unknown"

    name = models.CharField(max_length=255, validators=[MaxLengthValidator(150)])
    owner = models.ForeignKey(Client, on_delete=models.PROTECT, related_name="patients")
    breed = models.ForeignKey(Animal, on_delete=models.PROTECT, related_name="patients")
    sex = models.CharField(
        max_length=255,
        choices=Sex.choices,
        default=Sex.UNKNOWN,
        validators=[MaxLengthValidator(10)],
    )
    birth_date = models.DateField(null=True, blank=True)
    color = models.CharField(
        max_length=255, blank=True, validators=[MaxLengthValidator(100)]
    )
    microchip_number = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        validators=[MaxLengthValidator(50)],
    )
    note = models.TextField(null=True, blank=True)
    is_sterilized = models.BooleanField(default=False)
    is_deceased = models.BooleanField(default=False)
    date_of_death = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class PatientWeight(models.Model):
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name="weight_records"
    )
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2)
    recorded_at = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.patient.name} - {self.weight_kg}kg ({self.recorded_at})"

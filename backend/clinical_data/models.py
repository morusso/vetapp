from django.core.validators import MaxLengthValidator
from django.db import models


class Medicine(models.Model):
    class Form(models.TextChoices):
        TABLET = "tablet", "Tablet"
        CAPSULE = "capsule", "Capsule"
        LIQUID = "liquid", "Liquid"
        INJECTION = "injection", "Injection"
        OINTMENT = "ointment", "Ointment"
        POWDER = "powder", "Powder"
        DROPS = "drops", "Drops"
        SPRAY = "spray", "Spray"
        OTHER = "other", "Other"

    name = models.CharField(max_length=255, validators=[MaxLengthValidator(200)])
    manufacturer = models.CharField(
        max_length=255, blank=True, validators=[MaxLengthValidator(200)]
    )
    active_substance = models.CharField(
        max_length=255, blank=True, validators=[MaxLengthValidator(200)]
    )
    form = models.CharField(
        max_length=255,
        choices=Form.choices,
        default=Form.OTHER,
        validators=[MaxLengthValidator(20)],
    )
    strength = models.CharField(
        max_length=255, blank=True, validators=[MaxLengthValidator(100)]
    )
    unit = models.CharField(max_length=255, validators=[MaxLengthValidator(50)])
    description = models.TextField(null=True, blank=True)
    withdrawal_period_days = models.PositiveIntegerField(null=True, blank=True)
    requires_prescription = models.BooleanField(default=False)
    is_controlled_substance = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class MedicineBatch(models.Model):
    medicine = models.ForeignKey(
        Medicine, on_delete=models.PROTECT, related_name="batches"
    )
    batch_number = models.CharField(
        max_length=255, validators=[MaxLengthValidator(100)]
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_stock_level = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    unit_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    supplier = models.CharField(
        max_length=255, blank=True, validators=[MaxLengthValidator(200)]
    )
    expiry_date = models.DateField()
    received_at = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["expiry_date"]
        unique_together = ("medicine", "batch_number")

    def __str__(self):
        return f"{self.medicine.name} - {self.batch_number}"

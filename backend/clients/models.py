from django.core.validators import MaxLengthValidator
from django.db import models


class Client(models.Model):
    first_name = models.CharField(max_length=255, validators=[MaxLengthValidator(150)])
    last_name = models.CharField(max_length=255, validators=[MaxLengthValidator(150)])
    email = models.EmailField()
    phone_number = models.CharField(max_length=255, validators=[MaxLengthValidator(20)])
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=255, validators=[MaxLengthValidator(100)])
    postal_code = models.CharField(max_length=255, validators=[MaxLengthValidator(20)])
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

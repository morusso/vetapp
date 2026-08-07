import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()

DEFAULT_EMAIL = "e2e@vetapp.test"
DEFAULT_PASSWORD = "e2e-test-pass-123"


class Command(BaseCommand):
    help = (
        "Creates (or resets the password of) the user Cypress e2e tests log in as. "
        "Reads E2E_USER_EMAIL / E2E_USER_PASSWORD from the environment, falling back "
        f"to {DEFAULT_EMAIL!r}."
    )

    def handle(self, *args, **options):
        email = os.environ.get("E2E_USER_EMAIL", DEFAULT_EMAIL)
        password = os.environ.get("E2E_USER_PASSWORD", DEFAULT_PASSWORD)

        user, created = User.objects.get_or_create(email=email)
        user.set_password(password)
        user.is_active = True
        user.save()

        action = "Created" if created else "Reset password for"
        self.stdout.write(self.style.SUCCESS(f"{action} e2e user {email!r}."))

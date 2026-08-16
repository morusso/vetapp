from datetime import date

from notifications.ai import MessageDrafter
from src.models.clients import Client
from src.services.reminder_channels import EmailReminderChannel


class _StubDrafter(MessageDrafter):
    """A MessageDrafter test double that needs no urllib mocking."""

    def __init__(self, text=None):
        self._text = text

    def draft(self, prompt, *, system=None, max_tokens=300):
        return self._text


def _client():
    return Client(
        first_name="Jan",
        last_name="Kowalski",
        email="jan.kowalski@example.com",
        phone_number="123456789",
        street="Polna 1",
        city="Warszawa",
        postal_code="00-001",
    )


def test_body_uses_the_drafted_text_when_the_drafter_returns_one():
    channel = EmailReminderChannel(drafter=_StubDrafter(text="Hey Jan, booster time!"))

    body = channel._body("Rex", "Rabies vaccine", date(2026, 9, 1), _client())

    assert body == "Hey Jan, booster time!"


def test_body_falls_back_to_the_static_template_when_the_drafter_returns_none():
    channel = EmailReminderChannel(drafter=_StubDrafter(text=None))

    body = channel._body("Rex", "Rabies vaccine", date(2026, 9, 1), _client())

    assert "Rex's Rabies vaccine protection ends on 2026-09-01" in body
    assert "book a booster appointment" in body

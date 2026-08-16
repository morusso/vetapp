import logging
from abc import ABC, abstractmethod
from datetime import date

from django.core.mail import send_mail

from notifications.ai import draft_message
from src.models.clients import Client, NotificationChannel

logger = logging.getLogger(__name__)


class ReminderChannel(ABC):
    """Strategy for delivering a vaccine expiration reminder to a client."""

    @abstractmethod
    def send(
        self, *, client: Client, patient_name: str, service_name: str, valid_until: date
    ) -> None: ...


class EmailReminderChannel(ReminderChannel):
    def send(
        self, *, client: Client, patient_name: str, service_name: str, valid_until: date
    ) -> None:
        send_mail(
            subject=f"{patient_name}'s vaccination is expiring soon",
            message=self._body(patient_name, service_name, valid_until, client),
            from_email=None,
            recipient_list=[client.email],
        )

    @staticmethod
    def _body(patient_name: str, service_name: str, valid_until: date, client: Client) -> str:
        fallback = (
            f"Hi {client.first_name},\n\n"
            f"{patient_name}'s {service_name} protection ends on {valid_until}. "
            "Please book a booster appointment before then.\n\nVetApp"
        )

        prompt = (
            f"Write a short, warm email reminding {client.first_name}, a vet clinic client, "
            f"that their pet {patient_name}'s {service_name} protection ends on {valid_until} "
            "and they should book a booster appointment before then. "
            "Keep it under 80 words, plain text, sign off as VetApp. "
            "Reply with only the email body, no subject line."
        )
        return draft_message(
            prompt, system="You draft brief, friendly reminder emails for a veterinary clinic."
        ) or fallback


class SmsReminderChannel(ReminderChannel):
    def send(
        self, *, client: Client, patient_name: str, service_name: str, valid_until: date
    ) -> None:
        # No SMS provider is wired up yet - log what would have been sent instead.
        logger.info(
            "SMS vaccine reminder to %s (%s): %s's %s expires on %s.",
            client,
            client.phone_number,
            patient_name,
            service_name,
            valid_until,
        )


REMINDER_CHANNELS: dict[str, ReminderChannel] = {
    NotificationChannel.EMAIL: EmailReminderChannel(),
    NotificationChannel.SMS: SmsReminderChannel(),
}
DEFAULT_REMINDER_CHANNEL = REMINDER_CHANNELS[NotificationChannel.EMAIL]


def get_reminder_channel(channel: str) -> ReminderChannel:
    return REMINDER_CHANNELS.get(channel, DEFAULT_REMINDER_CHANNEL)

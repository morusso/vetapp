"""Strategy pattern for delivering vaccine expiration reminders.

Each notification channel (email, SMS, ...) implements :class:`ReminderChannel`,
and :func:`get_reminder_channel` resolves the right strategy for a client/service
pair. New channels can be added by registering another entry in
:data:`REMINDER_CHANNELS` without touching the scheduling logic that calls them.
"""

import logging
from abc import ABC, abstractmethod
from datetime import date

from django.core.mail import send_mail

from notifications.ai import MessageDrafter, get_drafter
from src.models.clients import Client, NotificationChannel

logger = logging.getLogger(__name__)


class ReminderChannel(ABC):
    """Strategy for delivering a vaccine expiration reminder to a client."""

    @abstractmethod
    def send(
        self, *, client: Client, patient_name: str, service_name: str, valid_until: date
    ) -> None:
        """Deliver a reminder that a patient's vaccine protection is expiring.

        Args:
            client: The owner to notify.
            patient_name: Name of the patient whose protection is expiring.
            service_name: Name of the vaccine/service that is expiring.
            valid_until: Date the vaccine's protection ends.
        """
        ...


class EmailReminderChannel(ReminderChannel):
    """Sends the reminder as an email, drafted by AI when available.

    The :class:`~notifications.ai.MessageDrafter` is resolved lazily via
    :func:`~notifications.ai.get_drafter` unless one is injected, so tests can
    pass a stub drafter instead of mocking urllib.
    """

    def __init__(self, drafter: MessageDrafter | None = None):
        self._drafter = drafter

    def send(
        self, *, client: Client, patient_name: str, service_name: str, valid_until: date
    ) -> None:
        """Email the reminder to the client's address.

        Args:
            client: The owner to notify; the email is sent to ``client.email``.
            patient_name: Name of the patient whose protection is expiring.
            service_name: Name of the vaccine/service that is expiring.
            valid_until: Date the vaccine's protection ends.
        """
        send_mail(
            subject=f"{patient_name}'s vaccination is expiring soon",
            message=self._body(patient_name, service_name, valid_until, client),
            from_email=None,
            recipient_list=[client.email],
        )

    def _body(self, patient_name: str, service_name: str, valid_until: date, client: Client) -> str:
        """Build the email body, preferring an AI-drafted message over the fallback.

        Args:
            patient_name: Name of the patient whose protection is expiring.
            service_name: Name of the vaccine/service that is expiring.
            valid_until: Date the vaccine's protection ends.
            client: The owner the message is addressed to.

        Returns:
            The AI-drafted message when a provider is configured and reachable,
            otherwise a static fallback template.
        """
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
        drafter = self._drafter if self._drafter is not None else get_drafter()
        return drafter.draft(
            prompt, system="You draft brief, friendly reminder emails for a veterinary clinic."
        ) or fallback


class SmsReminderChannel(ReminderChannel):
    """Sends the reminder over SMS.

    No SMS provider is wired up yet, so this only logs what would have been sent.
    """

    def send(
        self, *, client: Client, patient_name: str, service_name: str, valid_until: date
    ) -> None:
        """Log the SMS reminder that would be sent to the client.

        Args:
            client: The owner to notify; ``client.phone_number`` is logged.
            patient_name: Name of the patient whose protection is expiring.
            service_name: Name of the vaccine/service that is expiring.
            valid_until: Date the vaccine's protection ends.
        """
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
    """Resolve the reminder strategy for a notification channel.

    Args:
        channel: A :class:`~src.models.clients.NotificationChannel` value (or
            plain string equivalent, e.g. from a model field). Unknown or blank
            values fall back to email.

    Returns:
        The :class:`ReminderChannel` registered for ``channel``, or
        :data:`DEFAULT_REMINDER_CHANNEL` if none is registered.
    """
    return REMINDER_CHANNELS.get(channel, DEFAULT_REMINDER_CHANNEL)

"""Event bus subscribers that turn domain events into notification deliveries.

Wires the low-level "something happened" events emitted by business logic (e.g.
Celery tasks in `clinical_data.tasks`) to the concrete channels that should react
to them. Registered once, from `NotificationsConfig.ready()`, so callers only
need to `bus.emit(...)` an event and have no knowledge of who - if anyone - is
listening.
"""

from notifications.services import notify_group
from src.services.event_bus import bus
from src.services.reminder_channels import get_reminder_channel

LOW_STOCK_NOTIFICATION_GROUP = "admin"


def _notify_low_medicine_stock(payload: dict) -> None:
    """Alert the admin group in-app about a medicine below its minimum stock.

    Args:
        payload: Event payload emitted by
            `clinical_data.tasks.check_medicine_stock_levels`, forwarded as-is
            as the persisted notification's payload.
    """
    notify_group(LOW_STOCK_NOTIFICATION_GROUP, "low_medicine_stock", payload)


def _send_vaccine_expiration_reminder(payload: dict) -> None:
    """Remind a client through their chosen channel that a vaccine is expiring.

    Args:
        payload: Event payload emitted by
            `clinical_data.tasks.check_vaccine_expirations`, containing
            `client`, `patient_name`, `service_name`, `valid_until` and
            `channel`.
    """
    get_reminder_channel(payload["channel"]).send(
        client=payload["client"],
        patient_name=payload["patient_name"],
        service_name=payload["service_name"],
        valid_until=payload["valid_until"],
    )


def register() -> None:
    """Subscribe every notification handler to its domain event.

    Called once from `NotificationsConfig.ready()`. Safe to extend: to react to
    an existing event from a new channel (e.g. a Slack alert alongside the
    in-app one), add a subscriber function and register it here - no change
    needed where the event is emitted.
    """
    bus.subscribe("medicine.low_stock", _notify_low_medicine_stock)
    bus.subscribe("vaccine.expiring", _send_vaccine_expiration_reminder)

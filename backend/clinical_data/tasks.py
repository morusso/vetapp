import logging
from datetime import timedelta

from celery import shared_task
from django.db.models import Q, Sum
from django.utils import timezone

from clinical_data.models import Medicine, VisitService
from notifications.services import notify_group
from src.services.reminder_channels import get_reminder_channel

logger = logging.getLogger(__name__)

LOW_STOCK_NOTIFICATION_GROUP = "admin"

VACCINE_REMINDER_LEAD_DAYS = 7


@shared_task
def check_medicine_stock_levels():
    """Runs on a schedule (see the periodic task set up in migration 0004) and
    notifies the admin group about every medicine currently below its configured
    minimum stock level. Expired batches don't count towards available stock.
    """
    today = timezone.now().date()
    medicines = Medicine.objects.filter(minimum_stock_level__isnull=False).annotate(
        current_stock=Sum("batches__quantity", filter=Q(batches__expiry_date__gte=today))
    )

    for medicine in medicines:
        current_stock = medicine.current_stock or 0
        if current_stock >= medicine.minimum_stock_level:
            continue

        notify_group(
            LOW_STOCK_NOTIFICATION_GROUP,
            "low_medicine_stock",
            {
                "message": (
                    f"{medicine.name} stock is low: {current_stock} {medicine.unit} "
                    f"(minimum {medicine.minimum_stock_level} {medicine.unit})."
                ),
                "medicine_id": medicine.id,
                "medicine_name": medicine.name,
                "current_stock": str(current_stock),
                "minimum_stock_level": str(medicine.minimum_stock_level),
            },
        )


@shared_task
def check_vaccine_expirations():
    """Runs daily (see the periodic task set up in migration 0007) and reminds
    clients whose pet's vaccine protection is about to end, VACCINE_REMINDER_LEAD_DAYS
    days ahead of VisitService.vaccine_valid_until, so a booster can be booked in
    time. Each VisitService is only ever due on one day, so this fires once per
    reminder rather than repeating every day until the appointment is booked.

    The channel is the service's own notification_channel if set, otherwise the
    client's preferred_notification_channel.
    """
    reminder_date = timezone.now().date() + timedelta(days=VACCINE_REMINDER_LEAD_DAYS)
    due = VisitService.objects.filter(vaccine_valid_until=reminder_date).select_related(
        "service", "visit__patient__owner"
    )

    for visit_service in due:
        client = visit_service.visit.patient.owner
        channel = visit_service.notification_channel or client.preferred_notification_channel
        _send_vaccine_reminder(visit_service, client, channel)


def _send_vaccine_reminder(visit_service, client, channel):
    get_reminder_channel(channel).send(
        client=client,
        patient_name=visit_service.visit.patient.name,
        service_name=visit_service.service.name,
        valid_until=visit_service.vaccine_valid_until,
    )

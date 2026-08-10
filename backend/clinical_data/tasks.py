from celery import shared_task
from django.db.models import Q, Sum
from django.utils import timezone

from clinical_data.models import Medicine
from notifications.services import notify_group

LOW_STOCK_NOTIFICATION_GROUP = "admin"


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

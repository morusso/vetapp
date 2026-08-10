from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model

from notifications.models import Notification
from notifications.serializers import NotificationSerializer


def notify_users(user_ids, event, payload):
    """Persist a notification for each user and push it over their WebSocket connection.

    Sync, so it can be called directly from Celery tasks or regular views. The row is
    written first, so the notification survives even if the recipient is offline -
    they'll see it in their history/unread count next time they load the app.
    """
    user_ids = list(dict.fromkeys(user_ids))
    if not user_ids:
        return

    notifications = Notification.objects.bulk_create(
        Notification(recipient_id=user_id, event=event, payload=payload)
        for user_id in user_ids
    )

    channel_layer = get_channel_layer()
    for notification in notifications:
        async_to_sync(channel_layer.group_send)(
            f"user_{notification.recipient_id}",
            {"type": "notify", "notification": NotificationSerializer(notification).data},
        )


def notify_group(group_name, event, payload):
    """Push a live notification to every active user in the given auth Group."""
    User = get_user_model()
    user_ids = User.objects.filter(groups__name=group_name, is_active=True).values_list(
        "id", flat=True
    )
    notify_users(user_ids, event, payload)

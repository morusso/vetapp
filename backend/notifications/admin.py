from django.contrib import admin

from notifications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("event", "recipient", "is_read", "created_at")
    list_filter = ("is_read", "event")
    search_fields = ("recipient__email", "event")

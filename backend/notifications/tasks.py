from celery import shared_task

from notifications.services import notify_users


@shared_task
def notify_task_success(user_ids, message):
    """Template for notifying users once a Celery task finishes.

    Call notify_users(...)/notify_group(...) at the end of any task instead of
    chaining through this one - it only exists to show the wiring end to end.
    """
    notify_users(user_ids, "task_completed", {"message": message})

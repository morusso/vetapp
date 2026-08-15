from django.db import migrations
from django.utils import timezone

PERIODIC_TASK_NAME = "Check vaccine expirations"


def _touch_periodic_tasks_sentinel(apps):
    # django-celery-beat's DatabaseScheduler only reloads its in-memory schedule when
    # this sentinel row's last_update is newer than what it last saw. Normally a
    # post_save signal on PeriodicTask bumps it automatically, but RunPython operates
    # on historical model classes, which aren't the sender that signal is registered
    # against - so it never fires here. Bump it by hand instead, otherwise an
    # already-running beat process won't pick up this change until it's restarted.
    PeriodicTasks = apps.get_model("django_celery_beat", "PeriodicTasks")
    PeriodicTasks.objects.update_or_create(ident=1, defaults={"last_update": timezone.now()})


def set_start_time(apps, schema_editor):
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")
    # Without a start_time, django-celery-beat schedules a never-run daily task's
    # first execution one full day after the row was created (see ModelEntry.__init__),
    # not on the next beat tick. Setting start_time makes it due immediately instead.
    PeriodicTask.objects.filter(name=PERIODIC_TASK_NAME).update(start_time=timezone.now())
    _touch_periodic_tasks_sentinel(apps)


def unset_start_time(apps, schema_editor):
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")
    PeriodicTask.objects.filter(name=PERIODIC_TASK_NAME).update(start_time=None)
    _touch_periodic_tasks_sentinel(apps)


class Migration(migrations.Migration):
    dependencies = [
        ("clinical_data", "0007_vaccine_expiration_check_schedule"),
    ]

    operations = [
        migrations.RunPython(set_start_time, unset_start_time),
    ]

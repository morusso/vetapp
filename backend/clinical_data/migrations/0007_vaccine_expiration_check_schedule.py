from django.db import migrations

PERIODIC_TASK_NAME = "Check vaccine expirations"


def create_schedule(apps, schema_editor):
    IntervalSchedule = apps.get_model("django_celery_beat", "IntervalSchedule")
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")

    schedule, _ = IntervalSchedule.objects.get_or_create(every=1, period="days")
    PeriodicTask.objects.get_or_create(
        name=PERIODIC_TASK_NAME,
        defaults={
            "task": "clinical_data.tasks.check_vaccine_expirations",
            "interval": schedule,
        },
    )


def remove_schedule(apps, schema_editor):
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")
    PeriodicTask.objects.filter(name=PERIODIC_TASK_NAME).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("clinical_data", "0006_visitservice_notification_channel_and_more"),
        ("django_celery_beat", "0019_alter_periodictasks_options"),
    ]

    operations = [
        migrations.RunPython(create_schedule, remove_schedule),
    ]

from django.db import migrations

PERIODIC_TASK_NAME = "Check medicine stock levels"


def create_schedule(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.get_or_create(name="admin")

    IntervalSchedule = apps.get_model("django_celery_beat", "IntervalSchedule")
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")

    schedule, _ = IntervalSchedule.objects.get_or_create(every=10, period="minutes")
    PeriodicTask.objects.get_or_create(
        name=PERIODIC_TASK_NAME,
        defaults={
            "task": "clinical_data.tasks.check_medicine_stock_levels",
            "interval": schedule,
        },
    )


def remove_schedule(apps, schema_editor):
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")
    PeriodicTask.objects.filter(name=PERIODIC_TASK_NAME).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("clinical_data", "0003_alter_visitnote_options_alter_visitnote_visit"),
        ("auth", "0012_alter_user_first_name_max_length"),
        ("django_celery_beat", "0019_alter_periodictasks_options"),
    ]

    operations = [
        migrations.RunPython(create_schedule, remove_schedule),
    ]

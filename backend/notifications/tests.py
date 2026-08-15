import json
from urllib.error import URLError

import pytest
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from notifications.ai import draft_message
from notifications.models import Notification
from notifications.services import notify_group, notify_users
from vetapp.asgi import application

User = get_user_model()


class _FakeOllamaResponse:
    """Stands in for the `http.client.HTTPResponse` urlopen() normally returns."""

    def __init__(self, text):
        self._body = json.dumps({"message": {"role": "assistant", "content": text}}).encode()

    def read(self):
        return self._body

    def __enter__(self):
        return self

    def __exit__(self, *exc_info):
        return False


def _fake_ollama_urlopen(*, text=None, error=None):
    """A stand-in for `urllib.request.urlopen` against the local Ollama server, so
    tests never need it running or make network calls.
    """

    def urlopen(request, timeout=None):
        if error is not None:
            raise error
        return _FakeOllamaResponse(text)

    return urlopen


@pytest.fixture
def user(db):
    return User.objects.create_user(email="vet@example.com", password="s3cr3t-pass")


@pytest.fixture
def other_user(db):
    return User.objects.create_user(email="other@example.com", password="s3cr3t-pass")


@pytest.fixture
def auth_client(client, user):
    access_token = RefreshToken.for_user(user).access_token
    client.defaults["HTTP_AUTHORIZATION"] = f"Bearer {access_token}"
    return client


@pytest.mark.django_db
def test_notify_users_persists_a_notification_per_recipient(
    in_memory_channel_layer, user, other_user
):
    notify_users([user.id, other_user.id], "task_completed", {"message": "done"})

    assert Notification.objects.filter(recipient=user, event="task_completed").exists()
    assert Notification.objects.filter(recipient=other_user, event="task_completed").exists()


@pytest.mark.django_db
def test_notify_users_stores_the_given_payload(in_memory_channel_layer, user):
    notify_users([user.id], "task_completed", {"message": "done", "count": 3})

    notification = Notification.objects.get(recipient=user)
    assert notification.payload == {"message": "done", "count": 3}
    assert notification.is_read is False
    assert notification.read_at is None


@pytest.mark.django_db
def test_notify_users_dedupes_repeated_ids(in_memory_channel_layer, user):
    notify_users([user.id, user.id], "task_completed", {"message": "done"})

    assert Notification.objects.filter(recipient=user).count() == 1


@pytest.mark.django_db
def test_notify_users_with_no_recipients_creates_nothing(in_memory_channel_layer):
    notify_users([], "task_completed", {"message": "done"})

    assert Notification.objects.count() == 0


@pytest.mark.django_db
def test_notify_group_only_notifies_group_members(in_memory_channel_layer, user, other_user):
    group = Group.objects.create(name="vets")
    user.groups.add(group)

    notify_group("vets", "task_completed", {"message": "done"})

    assert Notification.objects.filter(recipient=user).exists()
    assert not Notification.objects.filter(recipient=other_user).exists()


@pytest.mark.django_db
def test_notify_group_skips_inactive_members(in_memory_channel_layer, user):
    group = Group.objects.create(name="vets")
    user.groups.add(group)
    user.is_active = False
    user.save()

    notify_group("vets", "task_completed", {"message": "done"})

    assert not Notification.objects.filter(recipient=user).exists()


@pytest.mark.django_db
def test_notification_list_requires_authentication(client):
    response = client.get("/api/v1/notifications/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_notification_list_returns_only_the_caller_notifications(
    in_memory_channel_layer, auth_client, user, other_user
):
    notify_users([user.id], "task_completed", {"message": "mine"})
    notify_users([other_user.id], "task_completed", {"message": "not mine"})

    response = auth_client.get("/api/v1/notifications/")

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["payload"]["message"] == "mine"


@pytest.mark.django_db
def test_notification_list_unread_filter(in_memory_channel_layer, auth_client, user):
    notify_users([user.id], "a", {})
    notify_users([user.id], "b", {})
    read_notification = Notification.objects.get(event="a")
    read_notification.is_read = True
    read_notification.save()

    response = auth_client.get("/api/v1/notifications/?unread=true")

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["event"] == "b"


@pytest.mark.django_db
def test_notification_mark_read(in_memory_channel_layer, auth_client, user):
    notify_users([user.id], "task_completed", {"message": "done"})
    notification = Notification.objects.get(recipient=user)

    response = auth_client.post(f"/api/v1/notifications/{notification.pk}/read/")

    assert response.status_code == 204
    notification.refresh_from_db()
    assert notification.is_read is True
    assert notification.read_at is not None


@pytest.mark.django_db
def test_notification_mark_read_unknown_id_returns_404(auth_client):
    response = auth_client.post("/api/v1/notifications/999999/read/")
    assert response.status_code == 404


@pytest.mark.django_db
def test_notification_mark_read_does_not_affect_other_users_notification(
    in_memory_channel_layer, auth_client, other_user
):
    notify_users([other_user.id], "task_completed", {"message": "done"})
    notification = Notification.objects.get(recipient=other_user)

    response = auth_client.post(f"/api/v1/notifications/{notification.pk}/read/")

    assert response.status_code == 404
    notification.refresh_from_db()
    assert notification.is_read is False


@pytest.mark.django_db
def test_notification_mark_all_read(in_memory_channel_layer, auth_client, user):
    notify_users([user.id], "a", {})
    notify_users([user.id], "b", {})

    response = auth_client.post("/api/v1/notifications/read-all/")

    assert response.status_code == 204
    assert not Notification.objects.filter(recipient=user, is_read=False).exists()


def _access_token_for(user):
    return str(AccessToken.for_user(user))


@pytest.mark.django_db(transaction=True)
def test_consumer_rejects_connection_without_token(in_memory_channel_layer):
    async def run():
        communicator = WebsocketCommunicator(application, "/ws/notifications/")
        connected, _ = await communicator.connect()
        assert connected is False
        await communicator.disconnect()

    async_to_sync(run)()


@pytest.mark.django_db(transaction=True)
def test_consumer_rejects_connection_with_invalid_token(in_memory_channel_layer):
    async def run():
        communicator = WebsocketCommunicator(
            application, "/ws/notifications/?token=not-a-real-token"
        )
        connected, _ = await communicator.connect()
        assert connected is False
        await communicator.disconnect()

    async_to_sync(run)()


@pytest.mark.django_db(transaction=True)
def test_consumer_delivers_notification_to_the_connected_user(in_memory_channel_layer):
    recipient = User.objects.create_user(email="ws-user@example.com", password="s3cr3t-pass")
    token = _access_token_for(recipient)

    async def run():
        communicator = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
        connected, _ = await communicator.connect()
        assert connected is True

        await database_sync_to_async(notify_users)(
            [recipient.id], "task_completed", {"message": "hello"}
        )

        message = await communicator.receive_json_from(timeout=5)
        assert message["event"] == "task_completed"
        assert message["payload"] == {"message": "hello"}
        assert message["is_read"] is False

        await communicator.disconnect()

    async_to_sync(run)()


@pytest.mark.django_db(transaction=True)
def test_consumer_does_not_deliver_to_other_users(in_memory_channel_layer):
    recipient = User.objects.create_user(email="ws-recipient@example.com", password="s3cr3t-pass")
    bystander = User.objects.create_user(email="ws-bystander@example.com", password="s3cr3t-pass")
    bystander_token = _access_token_for(bystander)

    async def run():
        communicator = WebsocketCommunicator(
            application, f"/ws/notifications/?token={bystander_token}"
        )
        connected, _ = await communicator.connect()
        assert connected is True

        await database_sync_to_async(notify_users)(
            [recipient.id], "task_completed", {"message": "not for you"}
        )

        assert await communicator.receive_nothing(timeout=0.5) is True

        await communicator.disconnect()

    async_to_sync(run)()


def test_draft_message_returns_none_without_ollama_base_url(settings):
    settings.OLLAMA_BASE_URL = ""

    assert draft_message("Write a reminder.") is None


def test_draft_message_returns_the_generated_text_when_configured(settings, monkeypatch):
    settings.OLLAMA_BASE_URL = "http://ollama:11434"
    monkeypatch.setattr(
        "notifications.ai.urllib_request.urlopen",
        _fake_ollama_urlopen(text="Booster time, Alex!"),
    )

    assert draft_message("Write a reminder.") == "Booster time, Alex!"


def test_draft_message_returns_none_when_ollama_is_unreachable(settings, monkeypatch):
    settings.OLLAMA_BASE_URL = "http://ollama:11434"
    monkeypatch.setattr(
        "notifications.ai.urllib_request.urlopen",
        _fake_ollama_urlopen(error=URLError("connection refused")),
    )

    assert draft_message("Write a reminder.") is None


def test_draft_message_returns_none_for_blank_response(settings, monkeypatch):
    settings.OLLAMA_BASE_URL = "http://ollama:11434"
    monkeypatch.setattr(
        "notifications.ai.urllib_request.urlopen", _fake_ollama_urlopen(text="   ")
    )

    assert draft_message("Write a reminder.") is None

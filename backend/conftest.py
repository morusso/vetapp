import pytest


@pytest.fixture
def in_memory_channel_layer(settings):
    # avoids depending on a reachable Redis instance for tests that call notify_users/notify_group
    settings.CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"},
    }

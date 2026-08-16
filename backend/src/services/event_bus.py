"""In-process event bus (Observer pattern) for domain events.

Business logic emits named events (e.g. "vaccine.expiring") without knowing who,
if anyone, is listening. Handlers subscribe independently elsewhere, so a new
reaction to an existing event - another notification channel, a Slack alert, a
metric - can be added without touching the code that detects the event.
"""

import logging
from collections import defaultdict
from typing import Any, Callable

logger = logging.getLogger(__name__)

EventHandler = Callable[[dict[str, Any]], None]


class EventBus:
    """A synchronous, in-process publish/subscribe registry."""

    def __init__(self) -> None:
        self._subscribers: dict[str, list[EventHandler]] = defaultdict(list)

    def subscribe(self, event: str, handler: EventHandler) -> None:
        """Register a handler to be called whenever `event` is emitted.

        Args:
            event: Name of the event to listen for, e.g. "vaccine.expiring".
            handler: Callable invoked with the event's payload dict.
        """
        self._subscribers[event].append(handler)

    def emit(self, event: str, payload: dict[str, Any]) -> None:
        """Notify every handler subscribed to `event`.

        Handlers run synchronously, in registration order. A handler that raises
        is logged and skipped rather than propagated, so one broken subscriber
        (e.g. a flaky Slack webhook) can't stop the others from running or fail
        the caller's Celery task.

        Args:
            event: Name of the event that occurred.
            payload: Data describing the event, passed to each handler as-is.
        """
        for handler in self._subscribers.get(event, []):
            try:
                handler(payload)
            except Exception:
                logger.exception("Event handler %r failed for event %r", handler, event)


bus = EventBus()

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.animals import Patient


class NotificationChannel(StrEnum):
    EMAIL = "email"
    SMS = "sms"


@dataclass(kw_only=True)
class Client:
    id: int | None = field(default=None)
    first_name: str
    last_name: str
    email: str
    phone_number: str
    street: str
    city: str
    postal_code: str
    notes: str = field(default="")
    preferred_notification_channel: NotificationChannel = field(
        default=NotificationChannel.EMAIL
    )
    created_at: datetime | None = field(default=None)
    updated_at: datetime | None = field(default=None)
    patients: list[Patient] = field(default_factory=list)

    @property
    def pk(self) -> int | None:
        return self.id

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"

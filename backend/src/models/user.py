from dataclasses import dataclass, field
from datetime import datetime


@dataclass(kw_only=True)
class User:
    id: int | None = field(default=None)
    email: str
    first_name: str = field(default="")
    last_name: str = field(default="")
    is_staff: bool = field(default=False)
    is_active: bool = field(default=True)
    is_superuser: bool = field(default=False)
    date_joined: datetime | None = field(default=None)

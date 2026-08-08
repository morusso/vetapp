from dataclasses import dataclass, field
from datetime import datetime


@dataclass(kw_only=True)
class Specialization:
    id: int | None = field(default=None)
    name: str
    created_at: datetime | None = field(default=None)
    updated_at: datetime | None = field(default=None)

    @property
    def pk(self) -> int | None:
        return self.id

    def __str__(self) -> str:
        return self.name


@dataclass(kw_only=True)
class User:
    id: int | None = field(default=None)
    email: str
    password: str | None = field(default=None, repr=False)
    first_name: str = field(default="")
    last_name: str = field(default="")
    phone_number: str = field(default="")
    is_staff: bool = field(default=False)
    is_active: bool = field(default=True)
    is_superuser: bool = field(default=False)
    date_joined: datetime | None = field(default=None)
    specializations: list[Specialization] = field(default_factory=list)

    @property
    def pk(self) -> int | None:
        return self.id

    def __str__(self) -> str:
        return self.email

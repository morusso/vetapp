from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum


class MedicineForm(StrEnum):
    TABLET = "tablet"
    CAPSULE = "capsule"
    LIQUID = "liquid"
    INJECTION = "injection"
    OINTMENT = "ointment"
    POWDER = "powder"
    DROPS = "drops"
    SPRAY = "spray"
    OTHER = "other"


@dataclass(kw_only=True)
class Medicine:
    id: int | None = field(default=None)
    name: str
    manufacturer: str = field(default="")
    active_substance: str = field(default="")
    form: MedicineForm = field(default=MedicineForm.OTHER)
    strength: str = field(default="")
    unit: str
    description: str | None = field(default=None)
    withdrawal_period_days: int | None = field(default=None)
    minimum_stock_level: Decimal | None = field(default=None)
    requires_prescription: bool = field(default=False)
    is_controlled_substance: bool = field(default=False)
    created_at: datetime | None = field(default=None)
    updated_at: datetime | None = field(default=None)
    batches: list[MedicineBatch] = field(default_factory=list)

    @property
    def pk(self) -> int | None:
        return self.id

    def __str__(self) -> str:
        return self.name


@dataclass(kw_only=True)
class MedicineBatch:
    id: int | None = field(default=None)
    medicine: Medicine
    batch_number: str
    quantity: Decimal
    unit_price: Decimal | None = field(default=None)
    supplier: str = field(default="")
    expiry_date: date
    received_at: date
    created_at: datetime | None = field(default=None)
    updated_at: datetime | None = field(default=None)

    @property
    def pk(self) -> int | None:
        return self.id

    def __str__(self) -> str:
        return f"{self.medicine.name} - {self.batch_number}"

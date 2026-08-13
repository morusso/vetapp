from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.animals import Patient
    from src.models.user import User


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
    purchase_price: Decimal | None = field(default=None)
    sale_price: Decimal | None = field(default=None)
    tax_rate: Decimal | None = field(default=None)
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


@dataclass(kw_only=True)
class Visit:
    id: int | None = field(default=None)
    patient: Patient
    veterinarian: User
    visit_date: datetime
    diagnosis: str = field(default="")
    created_at: datetime | None = field(default=None)
    updated_at: datetime | None = field(default=None)
    notes: list[VisitNote] = field(default_factory=list)
    prescribed_medicines: list[PrescribedMedicine] = field(default_factory=list)
    visit_services: list[VisitService] = field(default_factory=list)

    @property
    def pk(self) -> int | None:
        return self.id

    def __str__(self) -> str:
        return f"{self.patient.name} - {self.visit_date:%Y-%m-%d}"


@dataclass(kw_only=True)
class VisitNote:
    id: int | None = field(default=None)
    visit: Visit
    content: str
    author: User | None = field(default=None)
    created_at: datetime | None = field(default=None)
    updated_at: datetime | None = field(default=None)

    @property
    def pk(self) -> int | None:
        return self.id

    def __str__(self) -> str:
        return f"Note for {self.visit}"


@dataclass(kw_only=True)
class PrescribedMedicine:
    id: int | None = field(default=None)
    visit: Visit
    medicine: Medicine
    quantity: Decimal
    dosage: str = field(default="")
    created_at: datetime | None = field(default=None)
    updated_at: datetime | None = field(default=None)

    @property
    def pk(self) -> int | None:
        return self.id

    def __str__(self) -> str:
        return f"{self.medicine.name} x{self.quantity}"


@dataclass(kw_only=True)
class Service:
    id: int | None = field(default=None)
    name: str
    description: str = field(default="")
    price: Decimal
    duration_minutes: int | None = field(default=None)
    is_active: bool = field(default=True)
    created_at: datetime | None = field(default=None)
    updated_at: datetime | None = field(default=None)

    @property
    def pk(self) -> int | None:
        return self.id

    def __str__(self) -> str:
        return self.name


@dataclass(kw_only=True)
class VisitService:
    id: int | None = field(default=None)
    visit: Visit
    service: Service
    quantity: Decimal = field(default=Decimal("1"))
    price: Decimal | None = field(default=None)
    notes: str = field(default="")
    created_at: datetime | None = field(default=None)
    updated_at: datetime | None = field(default=None)

    @property
    def pk(self) -> int | None:
        return self.id

    def __str__(self) -> str:
        return f"{self.service.name} x{self.quantity}"

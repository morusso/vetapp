from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.clients import Client


class Sex(StrEnum):
    MALE = "male"
    FEMALE = "female"
    UNKNOWN = "unknown"


@dataclass(kw_only=True)
class AnimalType:
    id: int | None = field(default=None)
    name: str
    description: str | None = field(default=None)
    created_at: datetime | None = field(default=None)
    updated_at: datetime | None = field(default=None)
    animals: list[Animal] = field(default_factory=list)


@dataclass(kw_only=True)
class Animal:
    id: int | None = field(default=None)
    name: str
    animal_type: AnimalType
    description: str | None = field(default=None)
    created_at: datetime | None = field(default=None)
    updated_at: datetime | None = field(default=None)
    patients: list[Patient] = field(default_factory=list)


@dataclass(kw_only=True)
class Patient:
    id: int | None = field(default=None)
    name: str
    owner: Client
    breed: Animal
    sex: Sex = field(default=Sex.UNKNOWN)
    birth_date: date | None = field(default=None)
    color: str = field(default="")
    microchip_number: str | None = field(default=None)
    note: str | None = field(default=None)
    is_sterilized: bool = field(default=False)
    is_deceased: bool = field(default=False)
    date_of_death: date | None = field(default=None)
    created_at: datetime | None = field(default=None)
    updated_at: datetime | None = field(default=None)
    weight_records: list[PatientWeight] = field(default_factory=list)


@dataclass(kw_only=True)
class PatientWeight:
    id: int | None = field(default=None)
    patient: Patient
    weight_kg: Decimal
    recorded_at: date
    created_at: datetime | None = field(default=None)

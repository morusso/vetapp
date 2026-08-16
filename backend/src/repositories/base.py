from abc import ABC, abstractmethod
from dataclasses import fields, replace
from typing import Any, Generic, TypeVar

T = TypeVar("T")


class Repository(ABC, Generic[T]):
    @abstractmethod
    def get(self, id: int) -> T | None: ...

    @abstractmethod
    def list(self) -> list[T]: ...

    @abstractmethod
    def add(self, entity: T) -> T: ...

    @abstractmethod
    def update(self, entity: T) -> T: ...

    @abstractmethod
    def delete(self, id: int) -> None: ...


class DjangoRepository(Repository[T]):
    """CRUD repository backed by a Django model.

    Subclasses declare `model`, `to_dataclass` and, where relevant,
    `relations`/`select_related`/`prefetch_related`. Writes are derived
    from the entity's `dataclasses.fields()`: list-valued fields (reverse
    relations) are skipped, fields named in `relations` are written as
    `<field>_id`, everything else is written as-is. This assumes dataclass
    field names match the model's field names, which holds across this
    project's entities.
    """

    model: type
    relations: frozenset[str] = frozenset()
    select_related: tuple[str, ...] = ()
    prefetch_related: tuple[str, ...] = ()
    exclude_from_write: frozenset[str] = frozenset({"id", "created_at", "updated_at"})

    def to_dataclass(self, obj: Any) -> T:
        raise NotImplementedError

    def _queryset(self):
        qs = self.model.objects.all()
        if self.select_related:
            qs = qs.select_related(*self.select_related)
        if self.prefetch_related:
            qs = qs.prefetch_related(*self.prefetch_related)
        return qs

    def get(self, id: int) -> T | None:
        try:
            return self.to_dataclass(self._queryset().get(id=id))
        except self.model.DoesNotExist:
            return None

    def list(self) -> list[T]:
        return [self.to_dataclass(obj) for obj in self._queryset()]

    def _write_fields(self, entity: T) -> dict[str, Any]:
        data = {}
        for f in fields(entity):
            if f.name in self.exclude_from_write:
                continue
            value = getattr(entity, f.name)
            if isinstance(value, list):
                continue
            if f.name in self.relations:
                data[f"{f.name}_id"] = value.id if value is not None else None
            else:
                data[f.name] = value
        return data

    def _merged(self, entity: T, obj: Any) -> T:
        changes = {"id": obj.id}
        entity_field_names = {f.name for f in fields(entity)}
        for name in ("created_at", "updated_at"):
            if name in entity_field_names:
                changes[name] = getattr(obj, name)
        return replace(entity, **changes)

    def add(self, entity: T) -> T:
        obj = self.model.objects.create(**self._write_fields(entity))
        return self._merged(entity, obj)

    def update(self, entity: T) -> T:
        obj = self.model.objects.get(id=entity.id)
        for key, value in self._write_fields(entity).items():
            setattr(obj, key, value)
        obj.save()
        return self._merged(entity, obj)

    def delete(self, id: int) -> None:
        self.model.objects.filter(id=id).delete()

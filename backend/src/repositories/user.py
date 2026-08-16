from user.models import Specialization as SpecializationModel
from user.models import User as UserModel

from src.models.user import Specialization, User
from src.repositories.base import DjangoRepository


def specialization_to_dataclass(obj: SpecializationModel) -> Specialization:
    return Specialization(
        id=obj.id,
        name=obj.name,
        created_at=obj.created_at,
        updated_at=obj.updated_at,
    )


def user_to_dataclass(obj: UserModel) -> User:
    return User(
        id=obj.id,
        email=obj.email,
        first_name=obj.first_name,
        last_name=obj.last_name,
        phone_number=obj.phone_number,
        is_staff=obj.is_staff,
        is_active=obj.is_active,
        is_superuser=obj.is_superuser,
        date_joined=obj.date_joined,
        specializations=[
            specialization_to_dataclass(s) for s in obj.specializations.all()
        ],
    )


class SpecializationRepository(DjangoRepository[Specialization]):
    model = SpecializationModel
    to_dataclass = staticmethod(specialization_to_dataclass)


class UserRepository(DjangoRepository[User]):
    model = UserModel
    prefetch_related = ("specializations",)
    exclude_from_write = frozenset(
        {"id", "created_at", "updated_at", "date_joined", "password"}
    )
    to_dataclass = staticmethod(user_to_dataclass)

    def add(self, entity: User) -> User:
        obj = UserModel.objects.create_user(
            password=entity.password, **self._write_fields(entity)
        )
        if entity.specializations:
            obj.specializations.set(s.id for s in entity.specializations)
        return user_to_dataclass(obj)

    def update(self, entity: User) -> User:
        obj = UserModel.objects.get(id=entity.id)
        for key, value in self._write_fields(entity).items():
            setattr(obj, key, value)
        obj.save()
        obj.specializations.set(s.id for s in entity.specializations)
        return user_to_dataclass(obj)

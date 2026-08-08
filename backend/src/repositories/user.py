from user.models import Specialization as SpecializationModel
from user.models import User as UserModel

from src.models.user import Specialization, User
from src.repositories.base import Repository


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


class SpecializationRepository(Repository[Specialization]):
    def get(self, id: int) -> Specialization | None:
        try:
            return specialization_to_dataclass(SpecializationModel.objects.get(id=id))
        except SpecializationModel.DoesNotExist:
            return None

    def list(self) -> list[Specialization]:
        return [
            specialization_to_dataclass(obj)
            for obj in SpecializationModel.objects.all()
        ]

    def add(self, entity: Specialization) -> Specialization:
        obj = SpecializationModel.objects.create(name=entity.name)
        return specialization_to_dataclass(obj)

    def update(self, entity: Specialization) -> Specialization:
        obj = SpecializationModel.objects.get(id=entity.id)
        obj.name = entity.name
        obj.save()
        return specialization_to_dataclass(obj)

    def delete(self, id: int) -> None:
        SpecializationModel.objects.filter(id=id).delete()


class UserRepository(Repository[User]):
    def get(self, id: int) -> User | None:
        try:
            obj = UserModel.objects.prefetch_related("specializations").get(id=id)
        except UserModel.DoesNotExist:
            return None
        return user_to_dataclass(obj)

    def list(self) -> list[User]:
        return [
            user_to_dataclass(obj)
            for obj in UserModel.objects.prefetch_related("specializations").all()
        ]

    def add(self, entity: User) -> User:
        obj = UserModel.objects.create_user(
            email=entity.email,
            password=entity.password,
            first_name=entity.first_name,
            last_name=entity.last_name,
            phone_number=entity.phone_number,
            is_staff=entity.is_staff,
            is_active=entity.is_active,
            is_superuser=entity.is_superuser,
        )
        if entity.specializations:
            obj.specializations.set(s.id for s in entity.specializations)
        return user_to_dataclass(obj)

    def update(self, entity: User) -> User:
        obj = UserModel.objects.get(id=entity.id)
        obj.email = entity.email
        obj.first_name = entity.first_name
        obj.last_name = entity.last_name
        obj.phone_number = entity.phone_number
        obj.is_staff = entity.is_staff
        obj.is_active = entity.is_active
        obj.is_superuser = entity.is_superuser
        obj.save()
        obj.specializations.set(s.id for s in entity.specializations)
        return user_to_dataclass(obj)

    def delete(self, id: int) -> None:
        UserModel.objects.filter(id=id).delete()

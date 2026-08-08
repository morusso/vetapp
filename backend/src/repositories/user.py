from user.models import User as UserModel

from src.models.user import User
from src.repositories.base import Repository


def user_to_dataclass(obj: UserModel) -> User:
    return User(
        id=obj.id,
        email=obj.email,
        first_name=obj.first_name,
        last_name=obj.last_name,
        is_staff=obj.is_staff,
        is_active=obj.is_active,
        is_superuser=obj.is_superuser,
        date_joined=obj.date_joined,
    )


class UserRepository(Repository[User]):
    def get(self, id: int) -> User | None:
        try:
            return user_to_dataclass(UserModel.objects.get(id=id))
        except UserModel.DoesNotExist:
            return None

    def list(self) -> list[User]:
        return [user_to_dataclass(obj) for obj in UserModel.objects.all()]

    def add(self, entity: User) -> User:
        obj = UserModel.objects.create_user(
            email=entity.email,
            first_name=entity.first_name,
            last_name=entity.last_name,
            is_staff=entity.is_staff,
            is_active=entity.is_active,
            is_superuser=entity.is_superuser,
        )
        return user_to_dataclass(obj)

    def update(self, entity: User) -> User:
        obj = UserModel.objects.get(id=entity.id)
        obj.email = entity.email
        obj.first_name = entity.first_name
        obj.last_name = entity.last_name
        obj.is_staff = entity.is_staff
        obj.is_active = entity.is_active
        obj.is_superuser = entity.is_superuser
        obj.save()
        return user_to_dataclass(obj)

    def delete(self, id: int) -> None:
        UserModel.objects.filter(id=id).delete()

from clients.models import Client as ClientModel

from src.models.clients import Client, NotificationChannel
from src.repositories.base import Repository


def client_to_dataclass(obj: ClientModel) -> Client:
    return Client(
        id=obj.id,
        first_name=obj.first_name,
        last_name=obj.last_name,
        email=obj.email,
        phone_number=obj.phone_number,
        street=obj.street,
        city=obj.city,
        postal_code=obj.postal_code,
        notes=obj.notes,
        preferred_notification_channel=NotificationChannel(
            obj.preferred_notification_channel
        ),
        created_at=obj.created_at,
        updated_at=obj.updated_at,
    )


class ClientRepository(Repository[Client]):
    def get(self, id: int) -> Client | None:
        try:
            return client_to_dataclass(ClientModel.objects.get(id=id))
        except ClientModel.DoesNotExist:
            return None

    def list(self) -> list[Client]:
        return [client_to_dataclass(obj) for obj in ClientModel.objects.all()]

    def add(self, entity: Client) -> Client:
        obj = ClientModel.objects.create(
            first_name=entity.first_name,
            last_name=entity.last_name,
            email=entity.email,
            phone_number=entity.phone_number,
            street=entity.street,
            city=entity.city,
            postal_code=entity.postal_code,
            notes=entity.notes,
            preferred_notification_channel=entity.preferred_notification_channel,
        )
        return client_to_dataclass(obj)

    def update(self, entity: Client) -> Client:
        obj = ClientModel.objects.get(id=entity.id)
        obj.first_name = entity.first_name
        obj.last_name = entity.last_name
        obj.email = entity.email
        obj.phone_number = entity.phone_number
        obj.street = entity.street
        obj.city = entity.city
        obj.postal_code = entity.postal_code
        obj.notes = entity.notes
        obj.preferred_notification_channel = entity.preferred_notification_channel
        obj.save()
        return client_to_dataclass(obj)

    def delete(self, id: int) -> None:
        ClientModel.objects.filter(id=id).delete()

from clients.models import Client as ClientModel

from src.models.clients import Client, NotificationChannel
from src.repositories.base import DjangoRepository


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


class ClientRepository(DjangoRepository[Client]):
    model = ClientModel
    to_dataclass = staticmethod(client_to_dataclass)

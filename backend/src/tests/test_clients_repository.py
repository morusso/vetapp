import pytest

from clients.models import Client as ClientModel
from src.models.clients import Client
from src.repositories.clients import ClientRepository


@pytest.fixture
def repo():
    return ClientRepository()


@pytest.fixture
def sample_client(db):
    return ClientModel.objects.create(
        first_name="Jan",
        last_name="Kowalski",
        email="jan.kowalski@example.com",
        phone_number="123456789",
        street="Polna 1",
        city="Warszawa",
        postal_code="00-001",
    )


@pytest.mark.django_db
def test_add_creates_client(repo):
    client = repo.add(
        Client(
            first_name="Anna",
            last_name="Nowak",
            email="anna.nowak@example.com",
            phone_number="987654321",
            street="Kwiatowa 5",
            city="Krakow",
            postal_code="30-001",
        )
    )

    assert client.id is not None
    assert client.created_at is not None
    assert client.updated_at is not None
    assert ClientModel.objects.filter(email="anna.nowak@example.com").exists()


@pytest.mark.django_db
def test_get_returns_existing_client(repo, sample_client):
    client = repo.get(sample_client.id)

    assert client is not None
    assert client.id == sample_client.id
    assert client.last_name == "Kowalski"


@pytest.mark.django_db
def test_get_returns_none_for_missing_client(repo):
    assert repo.get(999999) is None


@pytest.mark.django_db
def test_list_returns_all_clients(repo, sample_client):
    ClientModel.objects.create(
        first_name="Ewa",
        last_name="Wisniewska",
        email="ewa@example.com",
        phone_number="111222333",
        street="Lipowa 2",
        city="Poznan",
        postal_code="60-001",
    )

    clients = repo.list()

    assert {c.last_name for c in clients} == {"Kowalski", "Wisniewska"}


@pytest.mark.django_db
def test_update_persists_changes(repo, sample_client):
    updated = repo.update(
        Client(
            id=sample_client.id,
            first_name=sample_client.first_name,
            last_name=sample_client.last_name,
            email=sample_client.email,
            phone_number=sample_client.phone_number,
            street=sample_client.street,
            city="Gdansk",
            postal_code=sample_client.postal_code,
        )
    )

    assert updated.city == "Gdansk"
    sample_client.refresh_from_db()
    assert sample_client.city == "Gdansk"


@pytest.mark.django_db
def test_delete_removes_client(repo, sample_client):
    repo.delete(sample_client.id)

    assert not ClientModel.objects.filter(id=sample_client.id).exists()

import pytest

from src.models.user import User
from src.repositories.user import UserRepository
from user.models import User as UserModel


@pytest.fixture
def repo():
    return UserRepository()


@pytest.fixture
def sample_user(db):
    return UserModel.objects.create_user(
        email="vet@example.com", password="s3cr3t-pass"
    )


@pytest.mark.django_db
def test_add_creates_user(repo):
    user = repo.add(User(email="new-vet@example.com"))

    assert user.id is not None
    assert user.date_joined is not None
    assert UserModel.objects.filter(email="new-vet@example.com").exists()


@pytest.mark.django_db
def test_get_returns_existing_user(repo, sample_user):
    user = repo.get(sample_user.id)

    assert user is not None
    assert user.email == "vet@example.com"


@pytest.mark.django_db
def test_get_returns_none_for_missing_user(repo):
    assert repo.get(999999) is None


@pytest.mark.django_db
def test_list_returns_all_users(repo, sample_user):
    UserModel.objects.create_user(email="other@example.com", password="s3cr3t-pass")

    users = repo.list()

    assert {u.email for u in users} == {"vet@example.com", "other@example.com"}


@pytest.mark.django_db
def test_update_persists_changes(repo, sample_user):
    updated = repo.update(
        User(
            id=sample_user.id, email=sample_user.email, first_name="Ala", is_staff=True
        )
    )

    assert updated.first_name == "Ala"
    sample_user.refresh_from_db()
    assert sample_user.first_name == "Ala"
    assert sample_user.is_staff is True


@pytest.mark.django_db
def test_delete_removes_user(repo, sample_user):
    repo.delete(sample_user.id)

    assert not UserModel.objects.filter(id=sample_user.id).exists()

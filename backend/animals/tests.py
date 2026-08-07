import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from animals.models import Animal, AnimalType

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(email="vet@example.com", password="s3cr3t-pass")


@pytest.fixture
def auth_client(client, user):
    access_token = RefreshToken.for_user(user).access_token
    client.defaults["HTTP_AUTHORIZATION"] = f"Bearer {access_token}"
    return client


@pytest.fixture
def animal_type(db):
    return AnimalType.objects.create(name="Dog")


@pytest.mark.django_db
def test_animal_type_list_requires_authentication(client):
    response = client.get("/api/animals/types/")
    assert response.status_code == 401


@pytest.mark.django_db
def test_animal_type_create(auth_client):
    response = auth_client.post(
        "/api/animals/types/", {"name": "Cat", "description": "Lorem Ipsum"}
    )
    assert response.status_code == 201
    assert AnimalType.objects.filter(name="Cat").exists()


@pytest.mark.django_db
def test_animal_type_list(auth_client, animal_type):
    response = auth_client.get("/api/animals/types/")
    assert response.status_code == 200
    assert response.data["count"] == 1


@pytest.mark.django_db
def test_animal_type_retrieve(auth_client, animal_type):
    response = auth_client.get(f"/api/animals/types/{animal_type.pk}/")
    assert response.status_code == 200
    assert response.data["name"] == "Dog"


@pytest.mark.django_db
def test_animal_type_update(auth_client, animal_type):
    response = auth_client.patch(
        f"/api/animals/types/{animal_type.pk}/",
        {"name": "Doggo"},
        content_type="application/json",
    )
    assert response.status_code == 200
    animal_type.refresh_from_db()
    assert animal_type.name == "Doggo"


@pytest.mark.django_db
def test_animal_type_delete(auth_client, animal_type):
    response = auth_client.delete(f"/api/animals/types/{animal_type.pk}/")
    assert response.status_code == 204
    assert not AnimalType.objects.filter(pk=animal_type.pk).exists()


@pytest.mark.django_db
def test_animal_create(auth_client, animal_type):
    response = auth_client.post(
        "/api/animals/",
        {
            "name": "Basenji",
            "animal_type": animal_type.pk,
            "description": "Lorem Ipsum",
        },
    )
    assert response.status_code == 201
    assert Animal.objects.filter(name="Basenji").exists()


@pytest.mark.django_db
def test_animal_list(auth_client, animal_type):
    Animal.objects.create(name="Rex", animal_type=animal_type)
    response = auth_client.get("/api/animals/")
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["animal_type_name"] == "Dog"


@pytest.mark.django_db
def test_animal_retrieve(auth_client, animal_type):
    animal = Animal.objects.create(name="Rex", animal_type=animal_type)
    response = auth_client.get(f"/api/animals/{animal.pk}/")
    assert response.status_code == 200
    assert response.data["name"] == "Rex"


@pytest.mark.django_db
def test_animal_update(auth_client, animal_type):
    animal = Animal.objects.create(name="Rex", animal_type=animal_type)
    response = auth_client.patch(
        f"/api/animals/{animal.pk}/",
        {"name": "Max"},
        content_type="application/json",
    )
    assert response.status_code == 200
    animal.refresh_from_db()
    assert animal.name == "Max"


@pytest.mark.django_db
def test_animal_delete(auth_client, animal_type):
    animal = Animal.objects.create(name="Rex", animal_type=animal_type)
    response = auth_client.delete(f"/api/animals/{animal.pk}/")
    assert response.status_code == 204
    assert not Animal.objects.filter(pk=animal.pk).exists()

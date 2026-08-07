from django.urls import path

from animals import views

urlpatterns = [
    path(
        "", views.AnimalTypeListCreateView.as_view(), name="animal_type_list_create"
    ),
    path(
        "<int:pk>/",
        views.AnimalTypeDetailView.as_view(),
        name="animal_type_detail",
    ),
]

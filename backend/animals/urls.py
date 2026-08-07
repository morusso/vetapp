from django.urls import path

from animals import views

urlpatterns = [
    path(
        "types/",
        views.AnimalTypeListCreateView.as_view(),
        name="animal_type_list_create",
    ),
    path(
        "types/<int:pk>/",
        views.AnimalTypeDetailView.as_view(),
        name="animal_type_detail",
    ),
    path("", views.AnimalListCreateView.as_view(), name="animal_list_create"),
    path("<int:pk>/", views.AnimalDetailView.as_view(), name="animal_detail"),
]
